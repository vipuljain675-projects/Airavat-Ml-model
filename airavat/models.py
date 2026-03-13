from __future__ import annotations

from dataclasses import dataclass, field


@dataclass
class StrategicEvent:
    event_id: str
    date: str
    title: str
    summary: str
    actors: list[str]
    targets: list[str]
    regions: list[str]
    event_types: list[str]
    source_refs: list[str]
    source_reliability: int
    confidence: float
    leading_indicators: list[str] = field(default_factory=list)
    outcomes: list[str] = field(default_factory=list)
    follow_on_risks: list[str] = field(default_factory=list)
    retaliatory_risks: list[str] = field(default_factory=list)
    notes: str = ""

    def searchable_text(self) -> str:
        return " ".join(
            [
                self.title,
                self.summary,
                " ".join(self.actors),
                " ".join(self.targets),
                " ".join(self.regions),
                " ".join(self.event_types),
                " ".join(self.leading_indicators),
                " ".join(self.follow_on_risks),
                " ".join(self.retaliatory_risks),
                self.notes,
            ]
        ).strip().lower()


@dataclass
class ForecastResult:
    query: str
    analogs: list[tuple[StrategicEvent, float]]
    risk_scores: dict[str, float]
    indicators_to_watch: list[str]
    evidence_gaps: list[str]
    boosted_ids: set[str] = field(default_factory=set)


@dataclass
class TrainedRiskModel:
    label_priors: dict[str, float]
    token_scores: dict[str, dict[str, float]]
    vocabulary: set[str]
