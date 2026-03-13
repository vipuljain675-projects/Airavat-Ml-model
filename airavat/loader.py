from __future__ import annotations

import json
from pathlib import Path

from airavat.models import StrategicEvent
from airavat.raw_loader import load_raw_events
from airavat.schema import validate_event_record


def load_events(path: str | Path, data_format: str = "auto") -> list[StrategicEvent]:
    raw_records = json.loads(Path(path).read_text(encoding="utf-8"))
    if data_format == "raw":
        return load_raw_events(path)

    if data_format == "auto" and raw_records and "event_id" not in raw_records[0]:
        return load_raw_events(path)

    events: list[StrategicEvent] = []
    seen_ids: set[str] = set()

    for index, record in enumerate(raw_records, start=1):
        errors = validate_event_record(record)
        if record.get("event_id") in seen_ids:
            errors.append(f"duplicate event_id '{record.get('event_id')}'")

        if errors:
            error_text = "; ".join(errors)
            print(f"Warning: Invalid event record #{index}: {error_text}")

        seen_ids.add(record["event_id"])
        
        # Intelligent Mapping for Enriched JSON
        if "scenario" in record and not record.get("summary"):
            record["summary"] = record["scenario"][:200] + "..."
        
        if "category" in record and not record.get("event_types"):
            # Improved heuristic: match keywords in category
            cat_text = record["category"].upper()
            found_types = []
            for known_type in ["MILITARY", "MARITIME", "DIPLOMATIC", "PROXY", "TECHNOLOGY", "COVERE", "SABOTAGE", "STRATEGIC"]:
                if known_type in cat_text:
                    found_types.append(known_type)
            record["event_types"] = found_types

        if "keywords" in record and not record.get("leading_indicators"):
            record["leading_indicators"] = record["keywords"].split()
        
        # Filter fields to only include those defined in StrategicEvent
        import dataclasses
        allowed_fields = {f.name for f in dataclasses.fields(StrategicEvent)}
        filtered_record = {k: v for k, v in record.items() if k in allowed_fields}
        
        events.append(StrategicEvent(**filtered_record))

    return events
