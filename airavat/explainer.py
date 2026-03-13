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
    top_analogs = result.analogs

    if not top_risks and not top_analogs:
        return "⚠️  No strong pattern was found in the current dataset for this query."

    risk_text = ", ".join(
        f"{RISK_LABEL_TEXT.get(label, label)} ({score:.2f})" for label, score in top_risks
    ) if top_risks else "general geopolitical alignment"

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
        # Format deep_dive for maximum LLM context
        deep_sections = []
        if event.deep_dive:
            for k, v in event.deep_dive.items():
                section_title = k.replace("_", " ").title()
                deep_sections.append(f"**{section_title}**: {v}")
        
        analog_blocks.append(
            "\n".join(
                [
                    f"### {event.title} ({event.date})",
                    f"**Similarity Score**: {similarity:.3f}",
                    f"**Baseline Summary**: {event.summary or event.scenario}",
                    f"**Full Scenario**: {event.scenario}" if event.scenario else "",
                    "\n".join(deep_sections) if deep_sections else "**Deep Dive Analysis**: N/A",
                    f"**Retaliatory Risks**: {'; '.join(event.retaliatory_risks)}" if event.retaliatory_risks else "",
                    f"**Strategic Countermeasures**: {'; '.join(event.countermeasures)}" if event.countermeasures else "",
                    f"**Strategic Indicators**: {', '.join(event.leading_indicators[:8])}",
                    f"**Internal Notes**: {event.notes[:500]}",
                ]
            )
        )

    live_section = ""
    if live_context:
        live_section = (
            f"## LIVE INTELLIGENCE FEED\n{live_context}\n"
            "Critical: Integrate these real-time signals into your risk assessment.\n"
        )

    risk_summary = "\n".join([f"- **{label.replace('_', ' ').upper()}**: {score:.2f}" for label, score in result.risk_scores.items()])

    return (
        "You are 'AIRAVAT', a top-tier Indian strategic intelligence AI under MISSION VAJRA. "
        "Your task is to provide a highly analytical, readable, and cinematic intelligence brief. "
        "Use premium Markdown formatting: bold headings, bullet points, and tables where appropriate.\n\n"
        f"# MISSION INQUIRY: {query}\n\n"
        f"## CALCULATED RISK GRADIENTS\n{risk_summary}\n\n"
        f"{live_section}"
        "## HISTORICAL ANALOGS & PATTERN MATCHING\n"
        "Leverage the following classified records to build your assessment. DO NOT SUMMARIZE TOO MUCH. "
        "Provide rich detail on 'Intent', 'India's Reaction', and 'Operations' as found in the records.\n\n"
        + "\n\n---\n\n".join(analog_blocks)
        + "\n\n## RESPONSE INSTRUCTIONS:\n"
        "1. Start with a high-level **STRATEGIC SUMMARY**.\n"
        "2. Create a **PATTERN ANALYSIS** section comparing current signals to historical analogs.\n"
        "3. Provide a massive **HISTORICAL DEEP-DIVE** section. For each analog, narrate the 'Intent', 'India's Reaction', and 'Global Intervention' with cinematic grit.\n"
        "4. Use a **TABLE** to compare 'Past Scenario' vs 'Current Threat Vector' vs 'Strategic Outcome'.\n"
        "5. Provide **OPERATIONAL RECOMMENDATIONS** (What to watch next).\n"
        "6. Conclude with a **CONFIDENCE RATING** and known intelligence gaps.\n\n"
        "Style: Professional, gritty, and strategically focused on India's national interest. "
        "The user wants DEPTH and DETAIL. Use the 'Deep Dive Analysis' sections provided verbatim if useful, but weave them into a cinematic flow."
    )
