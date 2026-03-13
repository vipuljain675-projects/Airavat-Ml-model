from __future__ import annotations

import math
import re
from collections import Counter

from airavat.models import StrategicEvent


TOKEN_PATTERN = re.compile(r"[a-z0-9_]+")


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

        scored = []
        for event in self.events:
            doc_tf = self.event_vectors[event.event_id]
            doc_vector = self._apply_weights(doc_tf)
            score = cosine_similarity(query_vector, doc_vector)
            scored.append((event, score))

        return sorted(scored, key=lambda x: x[1], reverse=True)[:top_k]
