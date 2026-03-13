from __future__ import annotations

import argparse
from pathlib import Path

from airavat.explainer import build_deterministic_brief, build_llm_prompt, build_timeline
from airavat.forecaster import RiskForecaster
from airavat.llm import GroqClient
from airavat.loader import load_events
from airavat.news_fetcher import fetch_live_headlines, format_news_context


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Airavat phase-1 forecasting scaffold")
    parser.add_argument("query", nargs="?", help="Scenario or analyst query to evaluate")
    parser.add_argument(
        "--data",
        default=str(Path("airavat") / "strategic_database.json"),
        help="Path to the structured event dataset",
    )
    parser.add_argument(
        "--format",
        choices=("auto", "structured", "raw"),
        default="auto",
        help="Dataset format. Use 'raw' for the id/category/scenario/keywords/countermeasures schema.",
    )
    parser.add_argument(
        "--timeline",
        action="store_true",
        help="Print a chronology of the best-matching events.",
    )
    parser.add_argument(
        "--news",
        action="store_true",
        help="Fetch live India-centric headlines from RSS feeds and inject into the LLM prompt.",
    )
    parser.add_argument(
        "--llm",
        choices=("off", "groq"),
        default="off",
        help="Optional narrative generation provider.",
    )
    parser.add_argument(
        "--chat",
        action="store_true",
        help="Start an interactive strategic session (War Room mode).",
    )
    parser.add_argument(
        "--groq-model",
        default="llama-3.3-70b-versatile",
        help="Groq model name when --llm groq is used.",
    )
    return parser


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()

    events = load_events(args.data, data_format=args.format)
    forecaster = RiskForecaster(events)
    client = GroqClient(model=args.groq_model)

    if args.chat:
        from airavat.repl import start_war_room_repl
        if not client.is_configured():
            print("Error: GROQ_API_KEY is not set. Chat mode requires a live LLM.")
            return
        start_war_room_repl(forecaster, client, args)
        return

    # Fetch live headlines if requested
    live_context: str | None = None
    headlines: list[dict] | None = None
    if args.news:
        print("Fetching live intelligence feed...")
        headlines = fetch_live_headlines(max_items=8, query=args.query)
        live_context = format_news_context(headlines)

    result = forecaster.forecast(args.query, live_news=headlines)

    # --- PREMIUM NARRATIVE-FIRST OUTPUT ---
    print("\n\033[1;35m" + "⚡ " * 20 + "\033[0m")
    print("\033[1;35m[ MISSION VAJRA ]: THE INDESTRUCTIBLE SOVEREIGNTY (2047)\033[0m")
    print("\033[1;35m" + "⚡ " * 20 + "\033[0m")
    
    # Sovereignty Meter (Visual)
    sov_score = 5.5
    bar_len = int(sov_score * 2)
    meter = "█" * bar_len + "░" * (20 - bar_len)
    print(f"\033[1mCurrent Sovereignty Meter:\033[0m [{meter}] \033[1;33m{sov_score}/10\033[0m")
    print("\033[1;36m" + "="*60 + "\033[0m")
    print("\033[1;34mAIRAVAT STRATEGIC INTELLIGENCE BRIEF\033[0m")
    print("\033[1;36m" + "="*60 + "\033[0m")
    print(f"\033[1mQuery:\033[0m {result.query}")
    print("")

    # 1. THE NARRATIVE (Modern AI Feel)
    brief = build_deterministic_brief(args.query, result)
    print(brief)

    # 2. THE LIVE FEED (If enabled)
    if live_context:
        print("")
        print(live_context)

    # 3. TECHNICAL APPENDIX (Reorganized to the bottom)
    print("\n" + "\033[1;32m" + "-"*60 + "\033[0m")
    print("\033[1;32mSTRATEGIC DATA APPENDIX (Technical Model View)\033[0m")
    print("\033[1;32m" + "-"*60 + "\033[0m")
    
    print("\033[1mRisk Scores (Prioritized):\033[0m")
    for risk, score in sorted(result.risk_scores.items(), key=lambda item: item[1], reverse=True):
        if score > 0.1:
            color = "\033[1;31m" if score > 0.5 else "\033[1;33m"
            print(f"- {risk}: {color}{score:.3f}\033[0m")

    print("\n\033[1mTop Historical Analogs:\033[0m")
    for event, similarity in result.analogs[:5]:
        boost_tag = " [🔥 LIVE BOOST]" if event.event_id in result.boosted_ids else ""
        print(f"- {event.event_id} | similarity={similarity:.3f} | {event.title}{boost_tag}")

    if args.timeline:
        print("\n" + build_timeline(result))

    # 4. LLM NARRATIVE (If Groq is active)
    if args.llm == "groq":
        print("")
        print("\033[1;35mGEN-AI STRATEGIC SYNTHESIS (Experimental)\033[0m")
        if not client.is_configured():
            print("⚠️  GROQ_API_KEY is not set, skipping deep synthesis.")
        else:
            prompt = build_llm_prompt(args.query, result, live_context=live_context)
            print(client.generate(prompt))


if __name__ == "__main__":
    main()
