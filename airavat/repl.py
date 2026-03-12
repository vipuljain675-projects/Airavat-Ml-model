from __future__ import annotations

import sys
from typing import TYPE_CHECKING

from airavat.explainer import build_llm_prompt
from airavat.news_fetcher import fetch_live_headlines, format_news_context

if TYPE_CHECKING:
    from airavat.forecaster import RiskForecaster
    from airavat.llm import GroqClient

def start_war_room_repl(forecaster: RiskForecaster, client: GroqClient, args):
    """
    Starts an interactive War Room REPL for persistent strategic analysis.
    """
    print("\n" + "="*50)
    print("      AIRAVAT STRATEGIC WAR ROOM (BETA)")
    print("="*50)
    print("Type your queries below. Commands:")
    print("  /exit  - End the session")
    print("  /clear - Clear conversation memory")
    print("  /news  - Fetch today's news and inject as context")
    print("="*50 + "\n")

    messages: list[dict[str, str]] = []
    live_context: str | None = None

    while True:
        try:
            user_input = input("Analyst >>> ").strip()
        except (KeyboardInterrupt, EOFError):
            print("\nExiting War Room...")
            break

        if not user_input:
            continue

        if user_input.lower() == "/exit":
            print("Closing strategic session. Jai Hind.")
            break

        if user_input.lower() == "/clear":
            messages = []
            print("Conversation memory cleared.")
            continue

        if user_input.lower() == "/news":
            print("Fetching live intelligence feed...")
            headlines = fetch_live_headlines(max_items=8)
            live_context = format_news_context(headlines)
            print("Live news injected into context.")
            continue

        # Process Query
        try:
            # 1. Retrieval
            result = forecaster.forecast(user_input)
            
            # 2. Build Prompt (Injects retrieval analogs)
            prompt = build_llm_prompt(user_input, result, live_context=live_context)
            
            # 3. Add to History
            messages.append({"role": "user", "content": prompt})
            
            # 4. Generate & Display
            print("\nAIRAVAT ANALYSIS:")
            print("-" * 20)
            
            response = client.chat(messages)
            print(response)
            print("-" * 20 + "\n")
            
            # 5. Add Assistant Response to History
            messages.append({"role": "assistant", "content": response})
            
            # Keep history manageable (last 10 messages)
            if len(messages) > 11: # 1 system + 10 exchange
                # Keep system message, remove oldest exchange
                messages = [messages[0]] + messages[-10:]

        except Exception as e:
            print(f"Error during analysis: {e}")

if __name__ == "__main__":
    # For testing, we would need to initialize forecaster and client
    pass
