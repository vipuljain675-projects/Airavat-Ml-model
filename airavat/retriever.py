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
# Fallback: bare-bones bag-of-words cosine (no dependencies)
# ---------------------------------------------------------------------------

def _tokenize(text: str) -> list[str]:
    return TOKEN_PATTERN.findall(text.lower())


# Public alias — training.py imports this
tokenize = _tokenize



def vectorize(text: str) -> Counter[str]:
    return Counter(_tokenize(text))


def cosine_similarity(left: dict[str, float], right: dict[str, float]) -> float:
    if not left or not right:
        return 0.0
    common = left.keys() & right.keys()
    numerator = sum(left[t] * right[t] for t in common)
    left_norm = math.sqrt(sum(v * v for v in left.values()))
    right_norm = math.sqrt(sum(v * v for v in right.values()))
    if left_norm == 0.0 or right_norm == 0.0:
        return 0.0
    return numerator / (left_norm * right_norm)


class AnalogRetriever:
    def __init__(self, events: list[StrategicEvent]):
        self.events = events
        self.event_vectors = {
            e.event_id: vectorize(e.searchable_text()) for e in events
        }
        self.idf = self._compute_idf()

    def _compute_idf(self) -> dict[str, float]:
        n_docs = len(self.event_vectors)
        doc_counts: Counter[str] = Counter()
        for vec in self.event_vectors.values():
            for token in vec:
                doc_counts[token] += 1
        
        idf = {}
        for token, count in doc_counts.items():
            # Standard IDF: log(N/df)
            idf[token] = math.log(n_docs / count) if count > 0 else 0.0
        return idf

    def _apply_weights(self, tf_vector: Counter[str]) -> dict[str, float]:
        weighted = {}
        for token, freq in tf_vector.items():
            weight = freq * self.idf.get(token, 1.0) # Use 1.0 for unknown tokens
            weighted[token] = weight
        return weighted

    def retrieve(self, query: str, top_k: int = 10) -> list[tuple[StrategicEvent, float]]:
        query_tf = vectorize(query)
        query_vector = self._apply_weights(query_tf)
        query_tokens = set(query_tf)
        query_themes = self._query_themes(query_tokens)

        scored = []
        for event in self.events:
            doc_tf = self.event_vectors[event.event_id]
            doc_vector = self._apply_weights(doc_tf)
            score = cosine_similarity(query_vector, doc_vector)
            score += self._heuristic_adjustment(event, query_tokens, query_themes)
            scored.append((event, score))

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

        overlap_bonus = len(query_tokens & title_tokens) * 0.03
        overlap_bonus += len(query_tokens & keyword_tokens) * 0.02
        overlap_bonus += len(query_tokens & deep_tokens) * 0.01
        adjustment += min(overlap_bonus, 0.15)

        if "india" in query_tokens and "india" in event.searchable_text():
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
