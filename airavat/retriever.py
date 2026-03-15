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
        keyword_tokens = set(_tokenize(event.keywords))
        note_tokens = set(_tokenize(event.notes))
        deep_tokens = set(
            _tokenize(" ".join(str(v) for v in (event.deep_dive or {}).values()))
        )
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

        confidence = float(event.confidence or 0.0)
        reliability = float(event.source_reliability or 0.0) / 5.0
        adjustment += confidence * 0.03
        adjustment += reliability * 0.02
        return adjustment
