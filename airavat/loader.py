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
            raise ValueError(f"Invalid event record #{index}: {error_text}")

        seen_ids.add(record["event_id"])
        events.append(StrategicEvent(**record))

    return events
