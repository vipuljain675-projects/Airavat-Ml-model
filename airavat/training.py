from __future__ import annotations

import math
from collections import Counter, defaultdict

from airavat.models import StrategicEvent, TrainedRiskModel
from airavat.retriever import tokenize


def train_risk_model(events: list[StrategicEvent]) -> TrainedRiskModel:
    label_event_counts: Counter[str] = Counter()
    label_token_counts: dict[str, Counter[str]] = defaultdict(Counter)
    vocabulary: set[str] = set()

    for event in events:
        tokens = tokenize(event.searchable_text())
        token_counts = Counter(tokens)
        vocabulary.update(token_counts)

        for label in event.event_types:
            label_event_counts[label] += 1
            label_token_counts[label].update(token_counts)

    total_events = max(len(events), 1)
    vocab_size = max(len(vocabulary), 1)

    label_priors = {
        label: count / total_events
        for label, count in label_event_counts.items()
    }

    token_scores: dict[str, dict[str, float]] = {}
    for label, counts in label_token_counts.items():
        denominator = sum(counts.values()) + vocab_size
        token_scores[label] = {
            token: math.log((counts[token] + 1) / denominator)
            for token in vocabulary
        }

    return TrainedRiskModel(
        label_priors=label_priors,
        token_scores=token_scores,
        vocabulary=vocabulary,
    )


def predict_risk_scores(
    model: TrainedRiskModel,
    query: str,
) -> dict[str, float]:
    query_counts = Counter(tokenize(query))
    if not query_counts:
        return {}

    vocab_size = max(len(model.vocabulary), 1)
    raw_scores: dict[str, float] = {}

    for label, prior in model.label_priors.items():
        token_log_probs = model.token_scores.get(label, {})
        default_log_prob = math.log(1 / vocab_size)
        score = math.log(max(prior, 1e-9))
        for token, count in query_counts.items():
            score += count * token_log_probs.get(token, default_log_prob)
        raw_scores[label] = score

    if not raw_scores:
        return {}

    max_score = max(raw_scores.values())
    exp_scores = {
        label: math.exp(score - max_score)
        for label, score in raw_scores.items()
    }
    total = sum(exp_scores.values()) or 1.0

    return {
        label: round(score / total, 3)
        for label, score in sorted(exp_scores.items(), key=lambda item: item[1], reverse=True)
    }
