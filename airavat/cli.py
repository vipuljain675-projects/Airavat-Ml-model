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
        default=str(Path("data") / "sample_events.json"),
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

    if not args.query:
        parser.print_help()
        return

    result = forecaster.forecast(args.query)

    print("AIRAVAT PHASE-1 FORECAST")
    print(f"Query: {result.query}")
    print("")
    print("Risk scores:")
    for risk, score in sorted(result.risk_scores.items(), key=lambda item: item[1], reverse=True):
        print(f"- {risk}: {score:.3f}")

    print("")
    print("Top analogs:")
    for event, similarity in result.analogs:
        print(f"- {event.event_id} | similarity={similarity:.3f} | {event.title}")

    print("")
    print("Indicators to watch:")
    for indicator in result.indicators_to_watch:
        print(f"- {indicator}")

    print("")
    print("Evidence gaps:")
    for gap in result.evidence_gaps:
        print(f"- {gap}")

    print("")
    print(build_deterministic_brief(args.query, result))

    if args.timeline:
        print("")
        print(build_timeline(result))

    # Fetch live headlines if requested
    live_context: str | None = None
    if args.news:
        print("")
        print("Fetching live intelligence feed...")
        headlines = fetch_live_headlines(max_items=8)
        live_context = format_news_context(headlines)
        print(live_context)

    if args.llm == "groq":
        print("")
        print("LLM Narrative:")
        if not client.is_configured():
            print("- GROQ_API_KEY is not set, so live LLM narration was skipped.")
        else:
            prompt = build_llm_prompt(args.query, result, live_context=live_context)
            print(client.generate(prompt))


if __name__ == "__main__":
    main()
