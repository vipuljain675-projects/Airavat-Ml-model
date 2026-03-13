from __future__ import annotations

from dataclasses import dataclass, field
from typing import Optional


@dataclass
class StrategicEvent:
    event_id: str = "unknown"
    date: str = "1900-01-01"
    title: str = "Classified Event"
    summary: str = "No summary available."
    actors: list[str] = field(default_factory=list)
    targets: list[str] = field(default_factory=lambda: ["india"])
    regions: list[str] = field(default_factory=list)
    event_types: list[str] = field(default_factory=list)
    source_refs: list[str] = field(default_factory=list)
    source_reliability: int = 3
    confidence: float = 0.5
    leading_indicators: list[str] = field(default_factory=list)
    outcomes: list[str] = field(default_factory=list)
    follow_on_risks: list[str] = field(default_factory=list)
    retaliatory_risks: list[str] = field(default_factory=list)
    image: Optional[str] = None
    deep_dive: Optional[dict] = None
    scenario: str = ""
    keywords: str = ""
    countermeasures: list[str] = field(default_factory=list)
    notes: str = ""

    def searchable_text(self) -> str:
        # Combine everything for retrieval
        parts = [
            self.title,
            self.summary,
            self.scenario,
            self.keywords,
            " ".join(self.actors),
            " ".join(self.targets),
            " ".join(self.regions),
            " ".join(self.event_types),
            " ".join(self.leading_indicators),
            " ".join(self.retaliatory_risks),
            " ".join(self.countermeasures),
            " ".join(str(v) for v in (self.deep_dive or {}).values() if isinstance(v, str)),
            self.notes,
        ]
        return " ".join(parts).strip().lower()


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
