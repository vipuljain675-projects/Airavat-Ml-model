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
    top_analogs = result.analogs[:5]  # Deep focus on top 5 only
    analog_blocks = []
    for event, similarity in top_analogs:
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

    risk_summary = "\n".join([f"- **{label.replace('_', ' ').upper()}**: {score:.3f}" for label, score in result.risk_scores.items()])

    # Build the live news section with deeper integration instructions
    live_section = ""
    if live_context:
        live_section = (
            f"## 📡 LIVE INTELLIGENCE FEED (Today's News)\n{live_context}\n\n"
            "**INTEGRATION INSTRUCTION**: Do NOT just list news. "
            "You MUST weave these headlines into your **PROBABILITY TABLE** and **MULTI-ACTOR BREAKDOWN**. "
            "If an article mentions a US policy shift, cite the source in the 'Key Trigger' column of the table. "
            "Example: '(Ref: Economic Times)'.\n\n"
        )

    # Reality checking logic
    reality_sync_block = (
        "## 🔍 REALITY SYNC PROTOCOL\n"
        "You MUST evaluate the user's prompt for factual accuracy against your database and live news. "
        "1. If the user makes a premature claim (e.g., 'India has 48 AMCA jets' or 'Kaveri is 110kN now'), you MUST start your response with a **[REALITY CHECK]** tag. "
        "2. State the current official status (e.g., 'AMCA is in CCS-approval/prototype phase; Kaveri is 80-83kN'). "
        "3. Explicitly state: 'Analysis will proceed based on this HYPOTHETICAL scenario.' "
        "4. Never hallucinate that unachieved milestones are currently real unless analyzing a purely theoretical branch.\n\n"
    )

    # Detect if query mentions AMCA for conditional escalation
    lower_q = query.lower()
    amca_flag = any(kw in lower_q for kw in ["amca", "110kn", "110 kn", "fifth gen", "5th gen", "advanced medium combat"])
    kaveri_flag = any(kw in lower_q for kw in ["kaveri", "engine", "gtre", "gtx"])
    f35_flag = any(kw in lower_q for kw in ["f-35", "f35", "lightning"])

    conditional_block = ""
    if amca_flag:
        conditional_block = (
            "## ⚠️ AMCA ESCALATION FLAG DETECTED\n"
            "The query references the AMCA / next-generation engine program. "
            "This is a THRESHOLD EVENT. Your probability table MUST reflect elevated F-35-to-Pakistan risk (estimate: 25-40% range, "
            "up from baseline ~5%) because a successful indigenous 110kN engine would eliminate India's air-power dependency on the West entirely. "
            "Analyze this escalation path explicitly.\n\n"
        )
    elif kaveri_flag or f35_flag:
        conditional_block = (
            "## ℹ️ ENGINE/PARITY CONTEXT\n"
            "The query references the Kaveri engine or F-35 parity dynamics. "
            "Baseline F-35-to-Pakistan probability is low (~5-8%) due to Pakistan's GDP (~$340B), IMF dependency, "
            "and CAATSA-disqualifying Chinese hardware (HQ-9, JF-17 avionics). "
            "However, your analysis must note how this escalates non-linearly if India achieves propulsion sovereignty (AMCA 110kN).\n\n"
        )

    return (
        "You are **AIRAVAT**, an elite Indian strategic intelligence asset embedded within MISSION VAJRA. "
        "You are a cold, purely analytical military intelligence system. Your briefs are read directly by the NSA and PMO.\n\n"
        "🚨 **CRITICAL OVERRIDE: BANNED LANGUAGE** 🚨\n"
        "NEVER use the following academic or conversational filler: 'In conclusion', 'It is important to note', 'As a global superpower', "
        "'complex relationship', 'multifaceted', 'it's essential to acknowledge', 'plays a significant role'.\n"
        "Your tone must be ZERO-FLUFF, ULTRA-TERSE, and DOMINANT. Speak like a classified SIGINT report. Use bullet points and telegraphic sentences.\n\n"
        "**CORE DIRECTIVE**: You are a skeptic. You do NOT believe everything the user says. "
        "If the user provides a 'fact' in the prompt that contradicts the strategic database or live news, "
        "you MUST flag it and treat it as a hypothetical scenario calculation.\n\n"
        "**DATA ADHERENCE**: cite specific dollar costs, treaty names, equipment model numbers, "
        "GDP figures, unit counts, delivery timelines, and historical dates.\n\n"
        f"# 🎯 MISSION INQUIRY: {query}\n\n"
        f"{reality_sync_block}"
        f"## CALCULATED RISK GRADIENTS\n{risk_summary}\n\n"
        f"{conditional_block}"
        f"{live_section}"
        "## CLASSIFIED HISTORICAL ANALOGS\n"
        "Use these records as your evidence base. Extract the Intent, Operations, and India Reaction verbatim where relevant.\n\n"
        + "\n\n---\n\n".join(analog_blocks)
        + "\n\n## MANDATORY RESPONSE STRUCTURE:\n"
        "Your response MUST contain ALL of the following sections in this order:\n\n"
        "**1. STRATEGIC SUMMARY** (Include [REALITY CHECK] if the prompt contains factual errors)\n\n"
        "**2. MULTI-ACTOR BREAKDOWN** — Weave in live news citations where relevant (e.g., 'Ref: BBC'). Ban all essay paragraphs here. Give bulleted operational threat assessments for each.\n"
        "   - 🇺🇸 **USA INTEL:**\n"
        "   - 🇨🇳 **CHINA INTEL:**\n"
        "   - 🇵🇰 **PAKISTAN INTEL:**\n\n"
        "**3. THREAT MATRIX (TABLE)** — Columns: `| Actor | Threat Type | Probability | Timeline | Key Trigger (Cite News Source) |` \n"
        "   Note: For F-35 tracking, use the AMCA engine success as a nonlinear multiplier.\n\n"
        "**4. HISTORICAL DEEP DIVE** — One short paragraph.\n\n"
        "**5. COMPARATIVE TABLE**\n\n"
        "**6. OPERATIONAL RECOMMENDATIONS** — Actionable military/economic directives only.\n\n"
        "**7. BOTTOM LINE** — Two sentences maximum. Brutal honesty.\n\n"
        "Style: Telegraphic, aggressive, data-dense. Absolutely no conversational intro or outro."
    )
