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
        return "⚠️  No strong pattern was found in the current dataset for this query."

    risk_text = ", ".join(
        f"{RISK_LABEL_TEXT.get(label, label)} ({score:.2f})" for label, score in top_risks
    )

    top_analogs = result.analogs
    analog_titles = ", ".join(event.title for event, _ in top_analogs) if top_analogs else "none"

    actor_mentions: defaultdict[str, int] = defaultdict(int)
    for event, _ in top_analogs:
        for token in event.searchable_text().split():
            if token in {"usa", "united_states", "west", "western", "china", "pakistan", "bangladesh", "nepal", "sri", "lanka"}:
                actor_mentions[token] += 1

    focus = ", ".join(sorted(actor_mentions, key=actor_mentions.get, reverse=True)[:5]) or "India's neighborhood and external powers"

    lines = [
        "🛡️  STRATEGIC INTELLIGENCE ASSESSMENT [ MISSION VAJRA ]",
        "--------------------------------------------------------",
        f"The model identifies a primary risk vector centered on {risk_text}.",
        f"This assessment is derived from historical parallels including: {analog_titles}.",
        f"The dominant geopolitical pressure axis currently appears to be: {focus}.",
        "",
        "📊  THEORETICAL MODELING",
    ]

    if top_analogs:
        lines.append("By analyzing past incidents, Airavat suggests the following patterns are most relevant:")
        for event, similarity in top_analogs:
            boost_tag = " [🔥 LIVE BOOST]" if event.event_id in result.boosted_ids else ""
            lines.append(
                f"• {event.title}{boost_tag} ({event.date})\n"
                f"  Similarity: {similarity:.2f} | {event.summary[:150]}..."
            )

    if result.indicators_to_watch:
        lines.append("")
        lines.append("👁️  INDICATORS TO WATCH NEXT")
        for indicator in result.indicators_to_watch[:5]:
            lines.append(f"- {indicator.upper()}")

    if result.evidence_gaps:
        lines.append("")
        lines.append("⚠️  INTELLIGENCE GAPS & UNCERTAINTY")
        for gap in result.evidence_gaps:
            lines.append(f"- {gap}")

    return "\n".join(lines)


def build_llm_prompt(
    query: str, result: ForecastResult, live_context: str | None = None
) -> str:
    top_analogs = result.analogs
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
                    f"Countermeasures: {'; '.join(event.outcomes[:4])}",
                    f"Predicted Adversary Retaliation: {'; '.join(event.retaliatory_risks)}",
                    f"Event Types: {', '.join(event.event_types)}",
                    f"Indicators: {', '.join(event.leading_indicators[:8])}",
                    f"Notes: {event.notes[:500]}",
                ]
            )
        )

    live_section = ""
    if live_context:
        live_section = (
            f"\n\n{live_context}\n"
            "Use the LIVE INTELLIGENCE FEED above to connect current events to the historical patterns.\n"
        )

    return (
        "You are writing an India-centric geopolitical intelligence brief. "
        "Use only the supplied evidence. Do not invent facts. "
        "Separate direct evidence from inference. "
        "If causation is uncertain, say it is an inference.\n\n"
        f"Query:\n{query}\n\n"
        f"Risk scores:\n{result.risk_scores}\n"
        f"{live_section}\n"
        "Relevant historical records:\n"
        + "\n\n".join(analog_blocks)
        + "\n\nWrite the answer with these sections exactly:\n"
        "1. Summary\n2. What the data matched\n3. Historical pattern\n4. Likely pressure channels\n"
        "5. What to watch next\n6. Limits and uncertainty"
    )
