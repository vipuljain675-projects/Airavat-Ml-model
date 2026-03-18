from __future__ import annotations

from collections import defaultdict
import re

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
    return sorted(list(result.risk_scores.items()), key=lambda item: item[1], reverse=True)[:limit]


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


def _query_mode(query: str) -> str:
    q = query.lower()
    if any(term in q for term in ("coordinate", "coordination", "same page", "alignment", "overlap", "diverge")):
        return "alignment"
    if any(term in q for term in ("if ", "assume", "already has", "what if", "falls", "collapse")):
        return "counterfactual"
    if any(term in q for term in ("sanction", "tariff", "pressure", "coercion", "control", "leverage")):
        return "pressure"
    return "standard"


def _format_deep_dive(data: any, depth: int = 0) -> list[str]:
    """Recursively formats a nested deep_dive dictionary into a list of strings."""
    lines = []
    prefix = "  " * depth
    if isinstance(data, dict):
        for key, value in data.items():
            key_label = key.replace("_", " ").title()
            if isinstance(value, (dict, list)):
                lines.append(f"{prefix}{key_label}:")
                lines.extend(_format_deep_dive(value, depth + 1))
            else:
                lines.append(f"{prefix}{key_label}: {value}")
    elif isinstance(data, list):
        for i, item in enumerate(data):
            if isinstance(item, (dict, list)):
                lines.append(f"{prefix}- Item {i+1}:")
                lines.extend(_format_deep_dive(item, depth + 1))
            else:
                lines.append(f"{prefix}- {item}")
    else:
        lines.append(f"{prefix}{data}")
    return lines


def _clean_snippet(text: str, limit: int = 220) -> str:
    text = re.sub(r"\s+", " ", text or "").strip()
    if len(text) <= limit:
        return text
    return text[: limit - 3].rstrip() + "..."


def _extract_india_interests(events: list[tuple[StrategicEvent, float]]) -> list[str]:
    candidates: list[str] = []
    for event, _ in events:
        deep = event.deep_dive or {}
        if isinstance(deep, dict):
            for key in ("india_status_at_moment", "india_reaction", "present_threat_comparison"):
                value = deep.get(key)
                if isinstance(value, str) and value.strip():
                    candidates.append(_clean_snippet(value, 200))
        elif isinstance(deep, str) and deep.strip():
            candidates.append(_clean_snippet(deep, 200))
        # Also pull from scenario text directly — most scenario events have no deep_dive
        scenario = getattr(event, 'scenario', '') or ''
        if scenario and ("india" in scenario.lower() or "chabahar" in scenario.lower() or "pakistan" in scenario.lower()):
            candidates.append(_clean_snippet(scenario, 250))
        for text in (event.summary, event.notes):
            if text and ("india" in text.lower() or "chabahar" in text.lower() or "pakistan" in text.lower()):
                candidates.append(_clean_snippet(text, 160))
    return _dedupe_preserve(candidates)[:5]


def _extract_adversary_objectives(events: list[tuple[StrategicEvent, float]]) -> list[str]:
    candidates: list[str] = []
    for event, _ in events:
        deep = event.deep_dive or {}
        if isinstance(deep, dict):
            intent = deep.get("intent")
            operations = deep.get("operations")
            if isinstance(intent, str) and intent.strip():
                candidates.append(_clean_snippet(intent, 160))
            if isinstance(operations, str) and operations.strip():
                candidates.append(_clean_snippet(operations, 160))
        elif isinstance(deep, str) and ( "adversary" in deep.lower() or "objective" in deep.lower()):
            candidates.append(_clean_snippet(deep, 160))
        if event.summary:
            candidates.append(_clean_snippet(event.summary, 150))
    return _dedupe_preserve(candidates)[:5]


def _extract_constraints(events: list[tuple[StrategicEvent, float]]) -> list[str]:
    candidates: list[str] = []
    for event, _ in events:
        for item in event.retaliatory_risks[:3]:
            candidates.append(_clean_snippet(item, 140))
        for item in event.countermeasures[:2]:
            if any(term in item.lower() for term in ("sanction", "tariff", "supply", "energy", "diplomatic", "financial", "export", "engine")):
                candidates.append(_clean_snippet(item, 140))
    return _dedupe_preserve(candidates)[:6]


def _extract_red_lines(events: list[tuple[StrategicEvent, float]]) -> list[str]:
    candidates: list[str] = []
    for event, _ in events:
        text = " ".join(
            [
                event.summary,
                event.scenario,
                event.notes,
                " ".join(event.countermeasures),
                " ".join(event.retaliatory_risks),
            ]
        ).lower()
        if "pakistan" in text and any(term in text for term in ("f-35", "f16", "stealth", "parity")):
            candidates.append("Any US-enabled Pakistan airpower jump is a direct India red line.")
        if "chabahar" in text or "instc" in text:
            candidates.append("Loss of Chabahar or INSTC access is a strategic red line for India.")
        if any(term in text for term in ("oil", "energy", "shipping", "strait", "crude")):
            candidates.append("External control over India's energy access raises a sovereignty red line.")
        if any(term in text for term in ("sanction", "caatsa", "tariff", "embargo")):
            candidates.append("Sanctions pressure aimed at Indian strategic autonomy is a red-line coercion pattern.")
    return _dedupe_preserve(candidates)[:4]


def _primary_actor_assessment(events: list[tuple[StrategicEvent, float]]) -> str:
    actor_weights: dict[str, float] = {}
    for event, similarity in events:
        for actor in event.actors:
            key = actor.upper().strip()
            actor_weights[key] = actor_weights.get(key, 0.0) + similarity

    ordered = sorted(actor_weights.items(), key=lambda item: item[1], reverse=True)
    if not ordered:
        return "No primary external actor is explicit in the current analog set."

    actor, weight = ordered[0]
    if actor in {"INDIA", "UNKNOWN"} and len(ordered) > 1:
        actor, weight = ordered[1]

    if actor == "USA":
        return (
            f"Primary coercing actor: USA (weight {weight:.2f}). "
            "If you generalize this into vague 'regional instability', you are ignoring the evidence packet."
        )
    if actor == "CHINA":
        return f"Primary coercing actor: China (weight {weight:.2f}). Name it directly."
    if actor == "PAKISTAN":
        return f"Primary coercing actor: Pakistan (weight {weight:.2f}). Name it directly."
    return f"Primary external actor in the analog set: {actor} (weight {weight:.2f}). Name it directly if relevant."


def _pattern_library(query: str, analogs: list[tuple[StrategicEvent, float]]) -> list[str]:
    q = query.lower()
    patterns: list[str] = []
    for event, similarity in analogs[:8]:
        corpus = " ".join(
            [
                event.event_id,
                event.title,
                event.summary,
                event.scenario,
                event.notes,
                " ".join(event.leading_indicators),
                " ".join(event.countermeasures),
            ]
        ).lower()

        if any(term in q for term in ("iran", "chabahar", "buffer", "china", "oil", "energy")):
            if event.event_id in {"GEO-BUFFER-001", "OP-EPIC-FURY-001", "ENERGY-COERCION-001", "HIST-1971-001"}:
                patterns.append(
                    f"[{event.event_id}] Buffer-state collapse / energy leverage pattern (score {similarity:.2f})"
                )
            if "pakistan" in corpus and any(term in corpus for term in ("proxy", "western flank", "hostile proxy", "parity")):
                patterns.append(
                    f"[{event.event_id}] Pakistan gains space when India's buffer erodes (score {similarity:.2f})"
                )

        if any(term in q for term in ("kaveri", "engine", "scientist", "amca", "drdo", "breakthrough", "83")):
            if event.event_id in {"COVERT-SAB-001", "COVERT-ASSASSIN-002", "INTEL-HONEYTRAP-001", "AERO-SABOTAGE-001", "MIL-EXPORT-PRESSURE-001"}:
                patterns.append(
                    f"[{event.event_id}] Strategic-breakthrough sabotage / coercion pattern (score {similarity:.2f})"
                )
            if any(term in corpus for term in ("honey trap", "scientist", "bhabha", "sabotage", "cia", "blackmail")):
                patterns.append(
                    f"[{event.event_id}] Scientist-targeting or compromise precedent (score {similarity:.2f})"
                )

    return _dedupe_preserve(patterns)[:5]


def _dedupe_preserve(items: list[str]) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []
    for item in items:
        key = item.lower().strip()
        if not key or key in seen:
            continue
        seen.add(key)
        result.append(item.strip())
    return result


def _format_bullets(items: list[str], fallback: str) -> str:
    if not items:
        return f"- {fallback}"
    return "\n".join(f"- {item}" for item in items)
def _analog_packet(events: list[tuple[StrategicEvent, float]]) -> str:
    if not events:
        return "- No analogs retrieved."
    rows: list[str] = []
    for event, similarity in events[:3]:
        deep = event.deep_dive or {}
        scenario_text = getattr(event, 'scenario', '') or event.summary or ''
        countermeasures = getattr(event, 'countermeasures', []) or []
        keywords_text = getattr(event, 'keywords', '') or ''
        
        # Data Greed: Support nested dictionaries like financial_trap_data
        deep_dive_lines = _format_deep_dive(deep, depth=1)
        deep_dive_text = "\n".join(deep_dive_lines) if deep_dive_lines else "  No deep-dive data available."

        rows.append(
            "\n".join(
                [
                    f"- [{event.event_id}] {event.title} | score={similarity:.3f} | date={event.date}",
                    f"  Scenario/Context: {_clean_snippet(scenario_text, 1600)}",
                    f"  Key Keywords/Data: {keywords_text}",
                    f"  Strategic Deep-Dive Data:\n{deep_dive_text}",
                    f"  Key Countermeasures: {' | '.join(countermeasures[:5]) if countermeasures else 'None'}",
                ]
            )
        )
    return "\n".join(rows)


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

    actor_mentions: dict[str, int] = {}
    for event, _ in top_analogs:
        for token in event.searchable_text().split():
            if token in {"usa", "united_states", "west", "western", "china", "pakistan", "bangladesh", "nepal", "sri", "lanka"}:
                t: str = str(token)
                actor_mentions[t] = actor_mentions.get(t, 0) + 1

    focus = ", ".join(sorted(actor_mentions.keys(), key=lambda x: actor_mentions[x], reverse=True)[:5]) or "India's neighborhood and external powers"

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
        indicators = list(result.indicators_to_watch)
        for i in range(min(5, len(indicators))):
            lines.append(f"- {indicators[i].upper()}")

    if result.evidence_gaps:
        lines.append("")
        lines.append("⚠️  INTELLIGENCE GAPS & UNCERTAINTY")
        for gap in result.evidence_gaps:
            lines.append(f"- {gap}")

    return "\n".join(lines)


def build_llm_prompt(
    query: str, 
    result: ForecastResult, 
    live_context: str | None = None,
    chat_history: list[dict] | None = None,
) -> str:
    top_analogs = result.analogs[:3]
    risk_summary = "\n".join(
        [f"- **{label.replace('_', ' ').upper()}**: {score:.3f}" for label, score in result.risk_scores.items()]
    ) or "- No scored risks available."
    top_similarity = top_analogs[0][1] if top_analogs else 0.0
    evidence_strength = (
        "HIGH" if top_similarity >= 0.35 else
        "MEDIUM" if top_similarity >= 0.18 else
        "LOW"
    )
    evidence_instruction = (
        "Top analog similarity is weak. You must explicitly label the assessment as exploratory and avoid precise claims."
        if evidence_strength == "LOW"
        else "You may make bounded inferences, but must keep them tied to the evidence blocks below."
    )
    live_section = f"## LIVE HEADLINES\n{live_context}\n\n" if live_context else "## LIVE HEADLINES\nNo live headlines were provided.\n\n"
    
    chat_context = ""
    if chat_history:
        history_lines = []
        for msg in chat_history:
            role = "USER" if msg.get("role") == "user" else "AIRAVAT"
            history_lines.append(f"{role}: {msg.get('content', '')}")
        chat_context = "PREVIOUS CONVERSATION HISTORY\n" + "\n".join(history_lines) + "\n\n"

    mode = _query_mode(query)
    india_interests = _format_bullets(
        _extract_india_interests(top_analogs),
        "No India-specific interest could be extracted beyond the risk gradients."
    )
    adversary_objectives = _format_bullets(
        _extract_adversary_objectives(top_analogs),
        "No adversary objective is explicit; keep the answer narrow."
    )
    constraints = _format_bullets(
        _extract_constraints(top_analogs),
        "No concrete constraint is explicit; avoid overclaiming."
    )
    red_lines = _format_bullets(
        _extract_red_lines(top_analogs),
        "No red line is explicit; infer cautiously."
    )
    primary_actor = _primary_actor_assessment(top_analogs)
    pattern_library = _format_bullets(
        _pattern_library(query, result.analogs),
        "No deeper pattern was extracted beyond the top analogs."
    )
    structure_block = (
        "# STRATEGIC RESPONSE [MISSION VAJRA]\n"
        "## STATUS: ALPHA CLEARANCE\n\n"
        "1. **DIRECT ANSWER**: Answer the user's specific question in the very first sentence. No preamble, no 'Strategic Context'. If they asked for a list, give the list. **Bold** every company, figure, and date.\n\n"
        "2. **TECHNICAL DEEP-DIVE**: Detailed analysis using 'Deep Research' (Live News) and evidence packet. Weave data into a professional narrative. Only mention unrelated strategic doctrines if they provide direct context to the answer.\n\n"
        "3. **THE SOVEREIGN AUDIT (TRAP vs. BLUEPRINT)**: 1-2 sharp paragraphs evaluating the deal/event through the Mission Vajra framework. Is this a leash or a win?\n\n"
        "4. **TECHNICAL INTELLIGENCE**: A clean list of every entity, date, and technical spec found in the research.\n\n"
        "5. **SIGNALS TO WATCH**: 3-5 high-impact indicators.\n"
    )
    if mode == "alignment":
        structure_block = (
            "# ALIGNMENT AUDIT [MISSION VAJRA]\n"
            "## STATUS: ALPHA CLEARANCE\n\n"
            "1. **STRATEGIC OVERLAP**: Where India and the external power's interests coincide. **Bold** specific data.\n\n"
            "2. **STRUCTURAL DIVERGENCE**: Where the interests fundamentally clash. Be blunt about the 'Leash'.\n\n"
            "3. **SOVEREIGN RED LINES**: What India must never compromise on in this specific deal.\n\n"
            "4. **TECHNICAL AUDIT**: Specific companies, technologies, or financial terms involved.\n\n"
            "5. **FINAL JUDGMENT**: One paragraph on whether this deal is a Blueprint or a Trap.\n"
        )

    return (
        "You are AIRAVAT, a retrieval-grounded strategic analysis system.\n\n"
        f"### USER QUERY: {query}\n\n"
        f"{live_section}"
        "### TASK: PRECISION INTELLIGENCE\n"
        "Answer the user's question by synthesizing the LIVE HEADLINES, PREVIOUS CONVERSATION HISTORY, and the ANALOG PACKET below.\n"
        "1. **DATA GREED (CRITICAL)**: If the user asks for 'full data', 'money', or 'numbers', you MUST extract the specific line-items from the **HISTORICAL ANALOG PACKET** (e.g., the $716M F404 deal and $1.5B F414 deal). **DO NOT** just repeat the $3.3B summary from the Handbook if granular numbers are available.\n"
        "2. **PRIORITIZE ANALOGS**: The ANALOG PACKET is 'Ground Truth'. The Handbook is 'General Context'. If they conflict on numbers, the ANALOG PACKET wins.\n"
        "3. **INTERNAL KNOWLEDGE**: Use your deep internal knowledge to fill gaps (e.g., mention GE, Safran, HAL, IAF squadrons).\n"
        "4. **NO RAMBLING**: Only discuss doctrines (AUKUS, Kaveri, etc.) if they provide immediate context to the answer.\n\n"
        f"{chat_context}"
        "## STRATEGIC HANDBOOK [CLASSIFIED - MISSION VAJRA]\n"
        "General Strategic Doctrines (Use for depth only):\n\n"
        "- **PROXY ENCIRCLEMENT**: Common superpower strategy to cap India's rise by destabilizing neighbors.\n"
        "- **THE SQUADRON GULF**: India critically needs 60 squadrons by 2047, but has ~30. The US delays GE engines (7/200 delivered) to maintain parity.\n"
        "- **THE SAFRAN BREAKTHROUGH**: France sharing 100% IPR for the 110kN engine vs US 'rental' deals.\n"
        "- **THE AUKUS LESSON**: France trading 'Crown Jewels' to India after US betrayal.\n"
        "- **PAX SILICA CHOKEPOINTS**: US semiconductor IP oversight via EDA tools (Cadence/Synopsys).\n"
        "- **THE FINANCIAL PARADOX**: India spends $40B on Rafale while indigenous Kaveri was starved on <$300M. The US GE 'umbrella' deal is estimated at ~$3.3B.\n"
        "- **POKHRAN MASKIROVKA**: India's 'Strategic Deception' regarding true squadron strength.\n"
        "- **NAVAL TARGET 2047**: Shift to a 400-hull fleet to secure the IOR.\n\n"
        "## HISTORICAL ANALOG PACKET (GROUND TRUTH DATA)\n"
        f"{_analog_packet(top_analogs)}\n\n"
        "## ANALYTICAL GRADIENTS\n"
        f"QUERY MODE: {mode.upper()}\n"
        f"EVIDENCE STRENGTH: {evidence_strength}\n"
        f"CALCULATED RISK GRADIENTS\n{risk_summary}\n\n"
        "PRIMARY ACTOR SIGNAL\n"
        f"- {primary_actor}\n\n"
        "INDIA RED LINES\n"
        f"{red_lines}\n\n"
        "## RESPONSE FORMAT\n"
        "Write in Markdown using exactly these sections:\n\n"
        f"{structure_block}\n"
        "## STYLE ENFORCEMENT\n"
        "1. **DIRECT ANSWER FIRST**: Provide the core data (names, \$ figures, dates) in the first paragraph.\n"
        "2. **BOLD EVERYTHING**: Every company, figure, and date must be **Bold**.\n"
        "3. **DATA DENSITY**: Use the granular numbers from the ANALOG PACKET (e.g., **$716M**, **$1.5B**, **99 engines**) instead of vague summaries.\n"
        "4. **VAJRA TONE**: Gritty, professional, India-centric analysis."
    )
