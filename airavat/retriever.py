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



def _vectorize(text: str) -> Counter[str]:
    return Counter(_tokenize(text))


def _bow_cosine(left: Counter[str], right: Counter[str]) -> float:
    if not left or not right:
        return 0.0
    numerator = sum(left[t] * right[t] for t in left.keys() & right.keys())
    left_norm = math.sqrt(sum(v * v for v in left.values()))
    right_norm = math.sqrt(sum(v * v for v in right.values()))
    if left_norm == 0.0 or right_norm == 0.0:
        return 0.0
    return numerator / (left_norm * right_norm)


# ---------------------------------------------------------------------------
# Preferred: TF-IDF cosine via scikit-learn
# ---------------------------------------------------------------------------

def _try_build_tfidf(corpus: list[str]):
    """Return a fitted (vectorizer, matrix) tuple, or None if sklearn absent."""
    try:
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.metrics.pairwise import cosine_similarity as sk_cosine

        vectorizer = TfidfVectorizer(
            analyzer="word",
            ngram_range=(1, 2),       # unigrams + bigrams improve recall
            min_df=1,
            sublinear_tf=True,        # log(1+tf) — reduces frequency bias
        )
        matrix = vectorizer.fit_transform(corpus)
        return vectorizer, matrix, sk_cosine
    except ImportError:
        return None


# ---------------------------------------------------------------------------
# Public retriever
# ---------------------------------------------------------------------------

class AnalogRetriever:
    def __init__(self, events: list[StrategicEvent]):
        self.events = events
        corpus = [e.searchable_text() for e in events]

        tfidf_result = _try_build_tfidf(corpus)
        if tfidf_result is not None:
            self._vectorizer, self._matrix, self._sk_cosine = tfidf_result
            self._use_tfidf = True
        else:
            # fallback
            self._bow_vectors = {
                e.event_id: _vectorize(e.searchable_text()) for e in events
            }
            self._use_tfidf = False

    def retrieve(self, query: str, top_k: int = 3) -> list[tuple[StrategicEvent, float]]:
        if self._use_tfidf:
            return self._retrieve_tfidf(query, top_k)
        return self._retrieve_bow(query, top_k)

    def _retrieve_tfidf(self, query: str, top_k: int) -> list[tuple[StrategicEvent, float]]:
        q_vec = self._vectorizer.transform([query.lower()])
        scores = self._sk_cosine(q_vec, self._matrix).flatten()
        ranked = sorted(zip(self.events, scores), key=lambda x: x[1], reverse=True)
        return [(e, float(s)) for e, s in ranked[:top_k]]

    def _retrieve_bow(self, query: str, top_k: int) -> list[tuple[StrategicEvent, float]]:
        q_vec = _vectorize(query)
        scored = [
            (event, _bow_cosine(q_vec, self._bow_vectors[event.event_id]))
            for event in self.events
        ]
        return sorted(scored, key=lambda item: item[1], reverse=True)[:top_k]
