from __future__ import annotations

import sys
from typing import TYPE_CHECKING

from airavat.explainer import build_llm_prompt
from airavat.news_fetcher import fetch_live_headlines, format_news_context
from airavat.intel_fetcher import fetch_content, clean_news_snippet

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

    # Persistent chat history (just the dialogue)
    chat_history: list[dict[str, str]] = []
    
    while True:
        try:
            user_input = input("\n[VAJRA-RESEARCH] Analyst >>> ").strip()
        except (KeyboardInterrupt, EOFError):
            print("\nExiting War Room...")
            break

        if not user_input:
            continue

        if user_input.lower() == "/exit":
            print("Closing strategic session. Jai Hind.")
            break

        if user_input.lower() == "/clear":
            chat_history = []
            print("Conversation memory cleared.")
            continue

        # Process Query with 'Scout Eyes'
        try:
            # 1. Contextual Query Refinement (for better RAG on follow-ups)
            refined_query = user_input
            if chat_history and (len(user_input.split()) < 5 or any(p in user_input.lower() for p in ["it", "they", "them", "these", "those", "this", "that", "deal", "companies"])):
                last_user_msg = next((m["content"] for m in reversed(chat_history) if m["role"] == "user"), "")
                if last_user_msg:
                    refined_query = f"{user_input} (context: {last_user_msg})"

            # 2. Automatic Scouting (Live Web Research)
            print(f"[*] Scouting live intelligence for: '{user_input[:40]}...'")
            headlines = fetch_live_headlines(max_items=3, query=refined_query)
            
            # 2.1 Deep Scouting: Fetch full content for top 2 links
            scouted_data = []
            for h in headlines[:2]:
                url = h.get("link")
                if url:
                    print(f"[*] Extracting deep content from: {url[:50]}...")
                    content = fetch_content(url)
                    if "text" in content:
                        scouted_data.append({
                            "title": content["title"],
                            "text": clean_news_snippet(content["text"]),
                            "source": url
                        })
            
            live_context = format_news_context(headlines)
            if scouted_data:
                live_context += "\n\n=== DEEP RESEARCH SCOUTED CONTENT ===\n"
                for d in scouted_data:
                    live_context += f"\nSOURCE: {d['source']}\nTITLE: {d['title']}\nCONTENT: {d['text']}\n"
                live_context += "\n" + "="*50
            
            # 3. Database Retrieval (using refined query)
            result = forecaster.forecast(refined_query, live_news=headlines)
            
            # 3. Build the Turn-Specific Context (Analogs + News)
            prompt = build_llm_prompt(user_input, result, live_context=live_context, chat_history=chat_history)
            
            # 4. Generate Response
            print("\nAIRAVAT ANALYSIS (Deep Research Mode):")
            print("-" * 40)
            
            response = client.generate(prompt)
            print(response)
            print("-" * 40)
            
            # 5. Record the actual conversation for the next turn's context
            chat_history.append({"role": "user", "content": user_input})
            chat_history.append({"role": "assistant", "content": response})
            
            if len(chat_history) > 10:
                chat_history = chat_history[-10:]

        except Exception as e:
            print(f"\n[!] Error during deep research: {e}")
            import traceback
            # traceback.print_exc()

def main():
    # This would be called from cli.py
    pass

if __name__ == "__main__":
    main()
