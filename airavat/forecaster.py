from __future__ import annotations

from collections import Counter
import re

from airavat.models import ForecastResult, StrategicEvent
from airavat.retriever import AnalogRetriever
from airavat.training import predict_risk_scores, train_risk_model


RISK_BUCKET_MAP = {
    "diplomatic_pressure": "diplomatic_pressure",
    "economic_coercion": "economic_coercion",
    "technology_denial": "technology_denial",
    "military_posturing": "military_signaling",
    "proxy_conflict": "proxy_destabilization",
    "political_instability": "proxy_destabilization",
    "information_operation": "information_escalation",
    "lawfare": "lawfare",
    "energy_coercion": "energy_pressure",
    "supply_chain_disruption": "supply_chain_pressure",
    "border_escalation": "military_signaling",
    "maritime_competition": "military_signaling",
}


class RiskForecaster:
    def __init__(self, events: list[StrategicEvent]):
        self.events = events
        self.retriever = AnalogRetriever(events)
        self.risk_model = train_risk_model(events)

    def forecast(self, query: str, top_k: int = 3) -> ForecastResult:
        analogs = self.retriever.retrieve(query, top_k=top_k)
        score_counter: Counter[str] = Counter()
        indicator_counter: Counter[str] = Counter()

        total_weight = 0.0
        for event, similarity in analogs:
            weight = similarity * event.confidence * (event.source_reliability / 5.0)
            total_weight += weight

            for event_type in event.event_types:
                bucket = RISK_BUCKET_MAP.get(event_type)
                if bucket:
                    score_counter[bucket] += weight

            for indicator in event.leading_indicators:
                indicator_counter[indicator] += weight

            for follow_on_risk in event.follow_on_risks:
                indicator_counter[follow_on_risk] += weight

        analog_scores = self._normalize_scores(score_counter, total_weight)
        learned_scores = self._map_learned_scores(predict_risk_scores(self.risk_model, query))
        risk_scores = self._blend_scores(analog_scores, learned_scores)
        indicators_to_watch = [item for item, _ in indicator_counter.most_common(5)]
        evidence_gaps = self._build_evidence_gaps(query, analogs)

        return ForecastResult(
            query=query,
            analogs=analogs,
            risk_scores=risk_scores,
            indicators_to_watch=indicators_to_watch,
            evidence_gaps=evidence_gaps,
        )

    @staticmethod
    def _normalize_scores(score_counter: Counter[str], total_weight: float) -> dict[str, float]:
        if total_weight <= 0.0:
            return {}

        return {
            risk: round(min(score / total_weight, 1.0), 3)
            for risk, score in score_counter.items()
        }

    @staticmethod
    def _map_learned_scores(label_scores: dict[str, float]) -> dict[str, float]:
        mapped: Counter[str] = Counter()
        for label, score in label_scores.items():
            bucket = RISK_BUCKET_MAP.get(label)
            if bucket:
                mapped[bucket] += score
        return {bucket: round(min(score, 1.0), 3) for bucket, score in mapped.items()}

    @staticmethod
    def _blend_scores(
        analog_scores: dict[str, float],
        learned_scores: dict[str, float],
    ) -> dict[str, float]:
        all_keys = set(analog_scores) | set(learned_scores)
        blended = {
            key: round((analog_scores.get(key, 0.0) * 0.65) + (learned_scores.get(key, 0.0) * 0.35), 3)
            for key in all_keys
        }
        return dict(sorted(blended.items(), key=lambda item: item[1], reverse=True))

    @staticmethod
    def _build_evidence_gaps(
        query: str, analogs: list[tuple[StrategicEvent, float]]
    ) -> list[str]:
        gaps: list[str] = []
        query_lower = query.lower()

        if not analogs or analogs[0][1] < 0.15:
            gaps.append("No strong historical analog was found for this query.")

        if not re.search(r"\b\d+\s*(day|days|week|weeks|month|months|year|years)\b", query_lower):
            gaps.append("Time horizon is unspecified. Add 30, 90, or 180 day framing.")

        if not any(keyword in query_lower for keyword in ("india", "indian")):
            gaps.append("Target country is implicit rather than explicit.")

        gaps.append("Current-source ingestion and citation ranking are not connected yet.")
        return gaps
