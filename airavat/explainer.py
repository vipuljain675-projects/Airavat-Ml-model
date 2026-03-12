from __future__ import annotations

from collections import defaultdict

from airavat.models import ForecastResult, StrategicEvent


RISK_LABEL_TEXT = {
    "proxy_destabilization": "proxy destabilization around India",
    "economic_coercion": "economic coercion and sanctions pressure",
    "technology_denial": "technology denial or supply constraints",
    "military_signaling": "military or maritime signaling",
    "information_escalation": "information and narrative escalation",
    "energy_pressure": "energy coercion",
    "lawfare": "lawfare or diplomatic isolation attempts",
    "diplomatic_pressure": "direct diplomatic pressure",
    "supply_chain_pressure": "supply-chain disruption",
}


def _top_risks(result: ForecastResult, limit: int = 3) -> list[tuple[str, float]]:
    return sorted(result.risk_scores.items(), key=lambda item: item[1], reverse=True)[:limit]


def _event_lines(events: list[tuple[StrategicEvent, float]]) -> list[str]:
    lines: list[str] = []
    for event, similarity in events:
        lines.append(
            f"- {event.date}: {event.title} (match {similarity:.2f})\n"
            f"  Summary: {event.summary}"
        )
    return lines


def build_timeline(result: ForecastResult) -> str:
    analogs = sorted(result.analogs, key=lambda item: item[0].date)
    if not analogs:
        return "No timeline could be built because no relevant historical analogs were found."
    return "Timeline:\n" + "\n".join(_event_lines(analogs))


def build_deterministic_brief(query: str, result: ForecastResult) -> str:
    top_risks = _top_risks(result)
    if not top_risks:
        return "No strong pattern was found in the current dataset for this query."

    risk_text = ", ".join(
        f"{RISK_LABEL_TEXT.get(label, label)} ({score:.2f})" for label, score in top_risks
    )

    top_analogs = result.analogs[:3]
    analog_titles = ", ".join(event.title for event, _ in top_analogs) if top_analogs else "none"

    actor_mentions: defaultdict[str, int] = defaultdict(int)
    for event, _ in top_analogs:
        for token in event.searchable_text().split():
            if token in {"usa", "united_states", "west", "western", "china", "pakistan", "bangladesh", "nepal", "sri", "lanka"}:
                actor_mentions[token] += 1

    focus = ", ".join(sorted(actor_mentions, key=actor_mentions.get, reverse=True)[:5]) or "India's neighborhood and external powers"

    lines = [
        "Assessment:",
        f"The query is most strongly associated with {risk_text}.",
        f"The closest historical patterns in the dataset are: {analog_titles}.",
        f"The dominant pressure axis in these analogs is: {focus}.",
    ]

    if top_analogs:
        lines.append("")
        lines.append("Why the model matched these cases:")
        for event, similarity in top_analogs:
            lines.append(
                f"- {event.title} [{event.date}, similarity {similarity:.2f}]: {event.summary}"
            )

    if result.indicators_to_watch:
        lines.append("")
        lines.append("Indicators to watch next:")
        for indicator in result.indicators_to_watch[:5]:
            lines.append(f"- {indicator}")

    if result.evidence_gaps:
        lines.append("")
        lines.append("Evidence gaps:")
        for gap in result.evidence_gaps:
            lines.append(f"- {gap}")

    return "\n".join(lines)


def build_llm_prompt(query: str, result: ForecastResult) -> str:
    top_analogs = result.analogs[:5]
    analog_blocks = []
    for event, similarity in top_analogs:
        analog_blocks.append(
            "\n".join(
                [
                    f"Event ID: {event.event_id}",
                    f"Date: {event.date}",
                    f"Title: {event.title}",
                    f"Similarity: {similarity:.3f}",
                    f"Summary: {event.summary}",
                    f"Event Types: {', '.join(event.event_types)}",
                    f"Indicators: {', '.join(event.leading_indicators[:8])}",
                    f"Notes: {event.notes[:500]}",
                ]
            )
        )

    return (
        "You are writing an India-centric geopolitical intelligence brief. "
        "Use only the supplied evidence. Do not invent facts. "
        "Separate direct evidence from inference. "
        "If causation is uncertain, say it is an inference.\n\n"
        f"Query:\n{query}\n\n"
        f"Risk scores:\n{result.risk_scores}\n\n"
        "Relevant historical records:\n"
        + "\n\n".join(analog_blocks)
        + "\n\nWrite the answer with these sections exactly:\n"
        "1. Summary\n2. What the data matched\n3. Historical pattern\n4. Likely pressure channels\n"
        "5. What to watch next\n6. Limits and uncertainty"
    )
