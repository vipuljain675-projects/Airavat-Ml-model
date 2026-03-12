from __future__ import annotations

import math
import re
from collections import Counter

from airavat.models import StrategicEvent


TOKEN_PATTERN = re.compile(r"[a-z0-9_]+")


def tokenize(text: str) -> list[str]:
    return TOKEN_PATTERN.findall(text.lower())


def vectorize(text: str) -> Counter[str]:
    return Counter(tokenize(text))


def cosine_similarity(left: Counter[str], right: Counter[str]) -> float:
    if not left or not right:
        return 0.0

    numerator = sum(left[token] * right[token] for token in left.keys() & right.keys())
    left_norm = math.sqrt(sum(value * value for value in left.values()))
    right_norm = math.sqrt(sum(value * value for value in right.values()))

    if left_norm == 0.0 or right_norm == 0.0:
        return 0.0

    return numerator / (left_norm * right_norm)


class AnalogRetriever:
    def __init__(self, events: list[StrategicEvent]):
        self.events = events
        self.event_vectors = {event.event_id: vectorize(event.searchable_text()) for event in events}

    def retrieve(self, query: str, top_k: int = 3) -> list[tuple[StrategicEvent, float]]:
        query_vector = vectorize(query)
        scored = [
            (event, cosine_similarity(query_vector, self.event_vectors[event.event_id]))
            for event in self.events
        ]
        return sorted(scored, key=lambda item: item[1], reverse=True)[:top_k]
