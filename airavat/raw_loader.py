from __future__ import annotations

import json
import re
from pathlib import Path

from airavat.models import StrategicEvent


RISK_TYPE_RULES = {
    "sanction": "economic_coercion",
    "economic": "economic_coercion",
    "technology": "technology_denial",
    "tech": "technology_denial",
    "military": "military_posturing",
    "naval": "maritime_competition",
    "maritime": "maritime_competition",
    "proxy": "proxy_conflict",
    "regime change": "political_instability",
    "instability": "political_instability",
    "ngo": "information_operation",
    "diaspora": "diaspora_tension",
    "lawfare": "lawfare",
    "energy": "energy_coercion",
    "supply chain": "supply_chain_disruption",
    "border": "border_escalation",
    "water": "supply_chain_disruption",
    "intelligence": "intelligence_incident",
    "espionage": "intelligence_incident",
}


def _infer_event_types(text: str) -> list[str]:
    text_lower = text.lower()
    labels = [
        label
        for pattern, label in RISK_TYPE_RULES.items()
        if pattern in text_lower
    ]
    return sorted(set(labels)) or ["diplomatic_pressure"]


def _extract_year(text: str) -> str:
    match = re.search(r"(19|20)\d{2}", text)
    if match:
        return f"{match.group(0)}-01-01"
    return "1900-01-01"


def load_raw_events(path: str | Path) -> list[StrategicEvent]:
    raw_records = json.loads(Path(path).read_text(encoding="utf-8"))
    events: list[StrategicEvent] = []

    for record in raw_records:
        category = record.get("category", "").strip()
        scenario = record.get("scenario", "").strip()
        keywords = record.get("keywords", "").strip()
        countermeasures = record.get("countermeasures", [])
        combined_text = " ".join(part for part in (category, scenario, keywords) if part)

        events.append(
            StrategicEvent(
                event_id=record["id"],
                date=_extract_year(category or scenario),
                title=category or record["id"],
                summary=scenario,
                actors=["unknown"],
                targets=["india"],
                regions=["south_asia"],
                event_types=_infer_event_types(combined_text),
                source_refs=["user_verified_source_bundle"],
                source_reliability=3,
                confidence=0.75,
                leading_indicators=keywords.split(),
                outcomes=[],
                follow_on_risks=[],
                notes="\n".join(countermeasures),
            )
        )

    return events
