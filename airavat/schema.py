from __future__ import annotations

from typing import Any


REQUIRED_FIELDS = {
    "event_id": str,
}

# These are required for classic-format records, but optional for scenario-style records
# (scenario-style records use 'scenario', 'category', 'keywords' instead)
CLASSIC_FIELDS = {
    "date": str,
    "title": str,
    "summary": str,
    "actors": list,
    "regions": list,
}

OPTIONAL_FIELDS = {
    "targets": list,
    "event_types": list,
    "source_refs": list,
    "source_reliability": int,
    "confidence": (int, float),
    "image": str,
    "deep_dive": dict,
}


def validate_event_record(record: dict[str, Any]) -> list[str]:
    errors: list[str] = []

    # event_id is always required
    for field_name, expected_type in REQUIRED_FIELDS.items():
        if field_name not in record:
            errors.append(f"missing required field '{field_name}'")
            continue
        if not isinstance(record[field_name], expected_type):
            errors.append(
                f"field '{field_name}' must be {expected_type}, got {type(record[field_name])}"
            )

    # For classic-format records (have title/summary), validate those fields
    # Scenario-style records (have scenario/category) are also valid — skip these warnings
    is_scenario_style = ("scenario" in record or "category" in record) and not record.get("title")
    if not is_scenario_style:
        for field_name, expected_type in CLASSIC_FIELDS.items():
            if field_name not in record:
                errors.append(f"missing required field '{field_name}'")

    confidence = record.get("confidence")
    if isinstance(confidence, (int, float)) and not 0.0 <= float(confidence) <= 1.0:
        errors.append("field 'confidence' must be between 0.0 and 1.0")

    reliability = record.get("source_reliability")
    if isinstance(reliability, int) and not 1 <= reliability <= 5:
        errors.append("field 'source_reliability' must be between 1 and 5")

    for list_field in (
        "actors",
        "targets",
        "regions",
        "event_types",
        "source_refs",
        "leading_indicators",
        "outcomes",
        "follow_on_risks",
    ):
        if list_field in record and not all(
            isinstance(item, str) for item in record.get(list_field, [])
        ):
            errors.append(f"field '{list_field}' must contain only strings")

    return errors
