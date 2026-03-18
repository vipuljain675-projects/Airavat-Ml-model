from __future__ import annotations

import math
import re
from collections import Counter

from airavat.models import StrategicEvent


TOKEN_PATTERN = re.compile(r"[a-z0-9_]+")
THEME_HINTS: dict[str, set[str]] = {
    "usa": {"usa", "us", "america", "american", "western", "west", "washington"},
    "china": {"china", "chinese", "beijing"},
    "pakistan": {"pakistan", "pak", "paf", "isi"},
    "iran": {"iran", "iranian", "tehran", "chabahar"},
    "energy": {"oil", "gas", "energy", "crude", "shipping", "strait", "gulf"},
    "technology": {"engine", "kaveri", "amca", "technology", "tech", "semiconductor", "chip", "ai"},
    "sanctions": {"sanction", "tariff", "caatsa", "nsg", "mtcr", "glenn", "embargo"},
    "covert": {"covert", "espionage", "sabotage", "honey", "intelligence", "ngo", "subversion"},
    "military": {"military", "fighter", "missile", "air", "naval", "border", "drone", "stealth"},
}

GENERIC_TITLES = {"classified event", "strategic event", "unknown"}


# ---------------------------------------------------------------------------
# Semantic Vectors: Dense Embeddings via sentence-transformers
# ---------------------------------------------------------------------------

def _tokenize(text: str) -> list[str]:
    return TOKEN_PATTERN.findall(text.lower())

# Public alias — training.py and forecaster.py imports this
tokenize = _tokenize

_embedding_model = None

def get_embedding_model():
    global _embedding_model
    if _embedding_model is None:
        from sentence_transformers import SentenceTransformer
        import os
        # Only suppress symlink warning if running on huggingface hub
        os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"
        _embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
    return _embedding_model


class AnalogRetriever:
    def __init__(self, events: list[StrategicEvent]):
        self.events = events
        self.model = get_embedding_model()
        
        # Precompute embeddings for all events
        # searchable_text() combines scenario, notes, keywords
        texts = [e.searchable_text() for e in events]
        self.event_embeddings = self.model.encode(texts, convert_to_tensor=True)

    def retrieve(self, query: str, top_k: int = 10) -> list[tuple[StrategicEvent, float]]:
        from sentence_transformers import util
        
        query_embedding = self.model.encode(query, convert_to_tensor=True)
        # Compute cosine similarities between query and all events
        cos_scores = util.cos_sim(query_embedding, self.event_embeddings)[0]
        
        query_tokens = set(_tokenize(query))
        query_themes = self._query_themes(query_tokens)

        scored = []
        for i, event in enumerate(self.events):
            base_score = float(cos_scores[i].item())
            
            # Since dense vectors naturally score higher (0.1 - 0.7), we adjust heuristics scaling
            adj = self._heuristic_adjustment(event, query_tokens, query_themes)
            
            # Combine semantic similarity and strategic heuristics
            final_score = base_score + (adj * 0.5)
            scored.append((event, final_score))

        return sorted(scored, key=lambda x: x[1], reverse=True)[:top_k]

    @staticmethod
    def _query_themes(query_tokens: set[str]) -> set[str]:
        themes: set[str] = set()
        for theme, words in THEME_HINTS.items():
            if query_tokens & words:
                themes.add(theme)
        return themes

    def _heuristic_adjustment(
        self,
        event: StrategicEvent,
        query_tokens: set[str],
        query_themes: set[str],
    ) -> float:
        adjustment = 0.0

        title_tokens = set(_tokenize(event.title))
        keyword_str = " ".join(event.keywords) if isinstance(event.keywords, list) else event.keywords
        keyword_tokens = set(_tokenize(keyword_str))
        note_tokens = set(_tokenize(event.notes))
        if event.deep_dive:
            if isinstance(event.deep_dive, dict):
                deep_text = " ".join(str(v) for v in event.deep_dive.values() if isinstance(v, str))
            else:
                deep_text = str(event.deep_dive)
            deep_tokens = set(_tokenize(deep_text))
        else:
            deep_tokens = set()
        actor_tokens = set(_tokenize(" ".join(event.actors)))
        region_tokens = set(_tokenize(" ".join(event.regions)))
        type_tokens = set(_tokenize(" ".join(event.event_types)))

        overlap_bonus = len(query_tokens & title_tokens) * 0.05
        overlap_bonus += len(query_tokens & keyword_tokens) * 0.04
        overlap_bonus += len(query_tokens & deep_tokens) * 0.03
        
        # Super-boost for highly specific keywords (like "homi", "bhabha", "assassination", "cia")
        # that are present in the query and the event text
        event_text_lower = event.searchable_text().lower()
        exact_match_bonus = 0.0
        for token in query_tokens:
             if len(token) > 3 and token in event_text_lower:
                 exact_match_bonus += 0.06

        adjustment += min(overlap_bonus + exact_match_bonus, 0.40)

        if "india" in query_tokens and "india" in event.searchable_text().lower():
            adjustment += 0.04

        matched_themes = 0
        event_text_tokens = keyword_tokens | title_tokens | actor_tokens | region_tokens | type_tokens | note_tokens
        for theme in query_themes:
            if event_text_tokens & THEME_HINTS[theme]:
                matched_themes += 1
        adjustment += min(matched_themes * 0.03, 0.12)

        if any(tok in actor_tokens for tok in ("usa", "china", "pakistan", "india", "iran")):
            adjustment += 0.02

        if event.title.strip().lower() in GENERIC_TITLES:
            adjustment -= 0.08
        if event.date == "1900-01-01":
            adjustment -= 0.03

        def parse_score(val):
            if isinstance(val, str):
                v_upper = val.strip().upper()
                if v_upper == "HIGH": return 0.9
                elif v_upper == "MEDIUM": return 0.5
                elif v_upper == "LOW": return 0.2
                else:
                    try: return float(val)
                    except ValueError: return 0.5
            return float(val or 0.0)
            
        confidence = parse_score(event.confidence)
        reliability = parse_score(event.source_reliability) / 5.0
        adjustment += confidence * 0.03
        adjustment += reliability * 0.02
        return adjustment

    def multi_hop_retrieve(self, query: str, top_k: int = 5) -> list[tuple[StrategicEvent, float]]:
        """
        Performs a two-hop search:
        1. Find primary semantic matches.
        2. Identify key actors/themes.
        3. Search for 'Resonance Analogs' (the 'Why' behind the 'What').
        """
        # Hop 1: Primary Search
        primary_results = self.retrieve(query, top_k=top_k)
        if not primary_results:
            return []

        # Identify 'Strategic Resonance' entities (actors + regions)
        resonance_actors = set()
        for event, _ in primary_results:
            # Add non-India actors to the resonance pool
            resonance_actors.update([a.upper() for a in event.actors if a.upper() not in ("INDIA", "UNKNOWN")])

        if not resonance_actors:
             return primary_results

        # Hop 2: Look for historical 'Resonance Analogs' involving these actors + betrayal/denial themes
        # This connects AUKUS (Betrayal) to Safran (Deals) automatically
        hop2_query = " ".join(list(resonance_actors)[:3]) + " betrayal revenge sabotage tech denial"
        hop2_results = self.retrieve(hop2_query, top_k=3)

        # Merge results, prioritizing primary but including resonance background
        final_map = {e.event_id: (e, s) for e, s in primary_results}
        for e, s in hop2_results:
            if e.event_id not in final_map:
                # Add resonance analogs with a lower score weighting for historical context
                final_map[e.event_id] = (e, s * 0.7)
            else:
                # Boost if found in both primary and resonance hops
                existing_e, existing_s = final_map[e.event_id]
                final_map[e.event_id] = (existing_e, existing_s + (s * 0.15))

        # Re-sort and take unified top_k + 2 (to show the 'Hidden Thread')
        return sorted(final_map.values(), key=lambda x: x[1], reverse=True)[:top_k + 2]
