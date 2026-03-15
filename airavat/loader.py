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
        scenario_text = record.get("scenario", "") or ""
        if scenario_text and not record.get("summary"):
            # Use first 200 chars of scenario as summary
            record["summary"] = scenario_text[:200].rstrip() + "..."

        # Generate a title from scenario first sentence or category name
        if not record.get("title") and scenario_text:
            first_sentence = scenario_text.split(".")[0].strip()
            record["title"] = first_sentence[:90] if len(first_sentence) > 5 else record.get("category", "Classified Event")
        elif not record.get("title") and record.get("category"):
            record["title"] = record["category"]

        if "category" in record and not record.get("event_types"):
            # Match keywords in category — fixed COVERE → COVERT
            cat_text = record["category"].upper()
            found_types = []
            for known_type in ["MILITARY", "MARITIME", "DIPLOMATIC", "PROXY", "TECHNOLOGY", "COVERT", "SABOTAGE", "STRATEGIC", "SOVEREIGNTY"]:
                if known_type in cat_text:
                    found_types.append(known_type)
            # Also map common category patterns
            if "ENCIRCLEMENT" in cat_text or "REGIME" in cat_text:
                found_types.append("PROXY")
            if "ENERGY" in cat_text or "VENEZUELA" in cat_text:
                found_types.append("DIPLOMATIC")
            record["event_types"] = found_types if found_types else ["STRATEGIC"]

        if "keywords" in record and not record.get("leading_indicators"):
            record["leading_indicators"] = record["keywords"].split()

        # Extract actor names from keywords if actors field is missing
        if not record.get("actors") and record.get("keywords"):
            kw_lower = record["keywords"].lower()
            found_actors = []
            actor_map = {
                "sheikh hasina": "Sheikh Hasina", "bangladesh": "Bangladesh",
                "tarique": "Tarique Rahman", "maduro": "Nicolas Maduro",
                "venezuela": "Venezuela", "trump": "USA", "cia": "CIA",
                "china": "China", "pakistan": "Pakistan", "usa": "USA",
                "iran": "Iran", "israel": "Israel", "russia": "Russia",
                "imran khan": "Imran Khan", "modi": "India",
            }
            for kw, actor in actor_map.items():
                if kw in kw_lower and actor not in found_actors:
                    found_actors.append(actor)
            if found_actors:
                record["actors"] = found_actors
        
        # Filter fields to only include those defined in StrategicEvent
        import dataclasses
        allowed_fields = {f.name for f in dataclasses.fields(StrategicEvent)}
        filtered_record = {k: v for k, v in record.items() if k in allowed_fields}
        
        events.append(StrategicEvent(**filtered_record))

    return events
