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


def _clean_snippet(text: str, limit: int = 220) -> str:
    text = re.sub(r"\s+", " ", text or "").strip()
    if len(text) <= limit:
        return text
    return text[: limit - 3].rstrip() + "..."


def _extract_india_interests(events: list[tuple[StrategicEvent, float]]) -> list[str]:
    candidates: list[str] = []
    for event, _ in events:
        deep = event.deep_dive or {}
        for key in ("india_status_at_moment", "india_reaction", "present_threat_comparison"):
            value = deep.get(key)
            if isinstance(value, str) and value.strip():
                candidates.append(_clean_snippet(value, 200))
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
        intent = deep.get("intent")
        operations = deep.get("operations")
        if isinstance(intent, str) and intent.strip():
            candidates.append(_clean_snippet(intent, 160))
        if isinstance(operations, str) and operations.strip():
            candidates.append(_clean_snippet(operations, 160))
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
        # Use full scenario text — this is where the real intelligence lives
        scenario_text = getattr(event, 'scenario', '') or event.summary or ''
        countermeasures = getattr(event, 'countermeasures', []) or []
        keywords_text = getattr(event, 'keywords', '') or ''
        media_links = getattr(event, 'media_links', []) or []
        media_text = "  Multimedia Resources: " + " | ".join([f"{m.get('title')}: {m.get('url')}" for m in media_links]) if media_links else ""
        
        rows.append(
            "\n".join(
                [
                    f"- [{event.event_id}] {event.title} | score={similarity:.3f} | date={event.date}",
                    f"  Scenario/Context: {_clean_snippet(scenario_text, 1600)}",
                    f"  Key Data Points: {keywords_text[:400]}" if keywords_text else "",
                    f"  Intent: {_clean_snippet(str(deep.get('intent', 'See scenario above')), 400)}",
                    f"  India Angle: {_clean_snippet(str(deep.get('india_reaction') or deep.get('india_status_at_moment') or 'See scenario above'), 400)}",
                    f"  Key Countermeasures: {' | '.join([_clean_snippet(c, 300) for c in countermeasures[:3]]) if countermeasures else 'None specified'}",
                    media_text
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
                actor_mentions[token] = actor_mentions.get(token, 0) + 1

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
        for indicator in indicators[:5]:
            lines.append(f"- {indicator.upper()}")

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
        "## Strategic Context\n"
        "1-2 short paragraphs explaining exactly what the subject of the query is (e.g., what the Kaveri engine is, what RIC is) before analyzing the impact.\n\n"
        "## Reality Check\n"
        "One short paragraph. If the query contains a hypothetical or premature claim, say that first.\n\n"
        "## India-First Answer\n"
        "3-6 bullets. Lead with India's exposure, leverage, or opportunity. **Mandatory:** If the context contains specific financial figures (e.g. $716M, $1.5B) or ToT percentages, you MUST include them here to ground the answer in data. No throat-clearing.\n\n"
        "## Assessment\n"
        "4-6 bullets. Every bullet must begin with `Observed:`, `Inference:`, or `Unknown:`.\n\n"
        "## Historical Anchors\n"
        "List up to 3 anchors with `[event_id]` and one-line relevance.\n\n"
        "## Signals To Watch\n"
        "4-6 concrete indicators.\n\n"
        "## Bottom Line\n"
        "Two sentences max.\n\n"
        "## RESOURCES (MULTIMEDIA)\n"
        "If the Evidence Packet contains video or article links (Multimedia Resources), list them here as bullet points with their titles and URLs. If none, omit this section.\n"
    )
    if mode == "alignment":
        structure_block = (
            "## Strategic Context\n"
            "1-2 short paragraphs explaining exactly what the subject of the query is before analyzing the alignment.\n\n"
            "## Reality Check\n"
            "One short paragraph. If the query contains a hypothetical or premature claim, say that first.\n\n"
            "## India-First Answer\n"
            "3-5 bullets. Answer the user's question directly, from India's point of view.\n\n"
            "## Where Interests Overlap\n"
            "2-4 bullets. Only where the evidence supports overlap.\n\n"
            "## Where Interests Diverge\n"
            "2-4 bullets. Be blunt about structural conflict.\n\n"
            "## What India Must Avoid\n"
            "3-5 bullets. Give red lines, not generic diplomacy.\n\n"
            "## Historical Anchors\n"
            "List up to 3 anchors with `[event_id]` and one-line relevance.\n\n"
            "## Signals To Watch\n"
            "4-6 concrete indicators.\n\n"
            "## Bottom Line\n"
            "Two sentences max.\n"
        )

    return (
        "You are AIRAVAT, a retrieval-grounded strategic analysis system.\n\n"
        "Your job is to answer the user's question directly using ONLY the evidence supplied in this prompt. "
        "If there is PREVIOUS CONVERSATION HISTORY, use it to understand what the user is referring to (like 'it' or 'they').\n"
        "Do not use background world knowledge unless it is already reflected in the supplied analogs or live headlines.\n"
        "If the evidence is weak, say so clearly.\n\n"
        "EVIDENCE RULES:\n"
        "1. Do not invent facts, citations, dates, military programs, or article attributions.\n"
        "2. Do not cite outlets or sources unless they appear in the supplied LIVE HEADLINES block.\n"
        "3. Treat analogs as historical parallels, not proof.\n"
        "4. If the user states a questionable fact, label it `[Reality check]` and separate current reality from hypothetical analysis.\n"
        "5. Prefer bounded language: `likely`, `possible`, `cannot confirm from current evidence`.\n"
        "6. Never fabricate exact probabilities for specific actor actions unless the prompt provides evidence for them. Use qualitative bands instead: Low / Medium / High.\n"
        "7. If the evidence packet centers a coercing actor, name that actor directly. Do not blur it into vague phrases like 'the region', 'major powers', or 'various actors'.\n"
        "8. CRITICAL: When the evidence packet contains specific figures, percentages, deal names, or program names (e.g. '18% tariff', 'Shadow Fleet', 'CAATSA', 'Rs 4,000 crore'), you MUST quote them precisely and verbatim. Do NOT paraphrase '18% tariff' as 'severe tariffs'. Do NOT paraphrase 'Shadow Fleet' as 'alternative routes'. Use the exact language from the evidence.\n"
        "9. CRITICAL CONTEXT - PROXY ENCIRCLEMENT: If the user asks about or the evidence packet mentions regime changes, unrest, or proxy actions in India's neighborhood (e.g., Pakistan, Bangladesh, Nepal), you MUST explicitly state that this is a deliberate superpower strategy to cap India's economic rise ($10-11T by 2035) to prevent it from replacing China as a peer competitor. Do not use generic terms like 'regional instability'; call it what it is: strategic vassalization and encirclement.\n"
        "10. CRITICAL CONTEXT - TECH DENIAL (GE/TEJAS): If the user asks about the GE engine deal, Kaveri, or Tejas jets, you MUST brutally state the numbers: India needs 180 Tejas Mk1 by 2030 (324 total Mk1/Mk2 jets) to maintain air superiority, but the US has only delivered 7 out of 200 required engines. You MUST state this is a deliberate delay to kill India's indigenous jet program, forcing India to bleed foreign reserves on imports (like Rafale) and maintaining Sino-Pak air parity since the IAF is critically depleted at only 30 squadrons. Mention the Kaveri 83kN breakthrough as the only sovereign path out.\n"
        "11. CRITICAL: If the evidence packet mentions assassinations, plane crashes, kinetic sabotage, or 'SCIENTIST SHIELDING' (e.g., the Homi Bhabha precedent), you MUST highlight this severe threat explicitly in the 'India-First Answer' and 'Bottom Line'. Do not sanitize or ignore kinetic threats.\n"
        "12. PROHIBITED PHRASES: You are strictly forbidden from saying 'the situation is complex', 'subject to interpretation', 'various factors', or 'multifaceted'. In the 'Reality Check', do not soft-pedal the evidence. If the evidence shows a US role in regime change, state it as a factual audit of the evidence packet, not a debate.\n"
        "13. NAMES & DATES: You MUST name specific leaders (e.g., Imran Khan, Sheikh Hasina) and dates (e.g., April 2022, August 2024) if they are present in any of the top analogs. If an analog mentions ' Sheikh Hasina' or 'Imran Khan', your 'India-First Answer' MUST name them specifically. Do not generalize them as 'local leaders' or 'neighboring governments'.\n"
        "14. CRITICAL CONTEXT - FINANCIAL PARADOX (RAFALE/KAVERI): If the user asks about defense budgets, imports, or the Rafale/MRFA deal, you MUST state the 'Brutal Financial Paradox': India is bleeding $40 Billion for 114 Rafales (only 18 fly-away) while the indigenous Kaveri engine project has been starved on a total historical budget of only ~$300M (₹2,032 crore). You MUST state that the $3.3B GE engine deal alone is 10x the entire Kaveri budget. Contrast the $40B import spend with the refused $10 Billion 'Sovereign Alpha' injection needed to scale the 83kN Kaveri breakthrough for 100,000+ drones (Ghatak/Sheshnaag). Call out the 'Charity Mirage'—foreign nations do not share jewels; they rent them at the cost of India's sovereignty.\n"
        "15. CRITICAL CONTEXT - PAX SILICA / SEMICONDUCTORS: If the user asks about semiconductor deals or 'Pax Silica', you MUST state that this is a 'Techo-Chokepoint' strategy. Market access is a carrot to force India to allow US deep-state 'Kill Switches' and IP-oversight into Indian silicon via US-patented EDA tools (Cadence/Synopsys). Call out the lack of sovereign fab tech (28nm to 2nm).\n"
        "16. CRITICAL CONTEXT - TRADE DEALS (EU/USA TARIFFS): If the user asks about the 18% US tariff or EU Trade deal, you MUST state that these are 'Reciprocity Traps'. The 18% is not a gift; it is a tactical retreat after removing a 25% 'Russian Oil Penalty' to force India to decouple from independent energy policies. Call out EU's CBAM as 'Green Protectionism' designed to tax Indian manufacturing under the guise of climate policy.\n"
        "17. CRITICAL CONTEXT - THE CARROT (ECONOMIC WINS): While analyzing traps, you MUST also state the 'Carrot' or 'Market Gain' with exact figures to explain the 'Sovereignty Exchange Rate'. For the EU Deal, quote the $500B bilateral trade target, the 0% tariff on 99.5% exports, and the unlock of the $500B chemical and $263B textile markets. For Safran, quote the 100% Technology Transfer (ToT) for the 110kN engine. Analyze why India signs these deals: the exchange of industrial survival (jewels) for technical sovereignty (IP ownership).\n\n"
        f"{chat_context}"
        f"QUERY\n{query}\n\n"
        f"QUERY MODE: {mode.upper()}\n"
        f"EVIDENCE STRENGTH: {evidence_strength}\n"
        f"ANALYST NOTE: {evidence_instruction}\n\n"
        f"CALCULATED RISK GRADIENTS\n{risk_summary}\n\n"
        "PRIMARY ACTOR SIGNAL\n"
        f"- {primary_actor}\n\n"
        "INDIA INTERESTS\n"
        f"{india_interests}\n\n"
        "ADVERSARY OBJECTIVES\n"
        f"{adversary_objectives}\n\n"
        "CONSTRAINTS / PRESSURE TOOLS\n"
        f"{constraints}\n\n"
        "PATTERN LIBRARY\n"
        f"{pattern_library}\n\n"
        "INDIA RED LINES\n"
        f"{red_lines}\n\n"
        f"{live_section}"
        "HISTORICAL ANALOG PACKET\n"
        f"{_analog_packet(top_analogs)}\n\n"
        "RESPONSE FORMAT\n"
        "Write in Markdown using exactly these sections:\n\n"
        f"{structure_block}\n"
        "STYLE\n"
        "Short sentences. No filler. No motivational language. No invented citations.\n"
        "Do not include actor sections that are unsupported by the evidence packet.\n"
        "Use the pattern library when it reveals a repeated method such as proxy balancing, buffer-state collapse, sanctions leverage, scientist targeting, sabotage, or honey-trap coercion.\n"
        "Be concrete. Do not use diplomatic hedges."
    )
