from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import sys
import os

# Add parent directory to path to import airavat modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from airavat.forecaster import RiskForecaster
from airavat.loader import load_events
from airavat.news_fetcher import fetch_live_headlines

app = FastAPI(title="Airavat Strategic Bridge")

# Enable CORS for the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the exact origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalysisRequest(BaseModel):
    query: str
    include_news: bool = True
    chat_history: Optional[List[Dict[str, Any]]] = None

class AnalysisResponse(BaseModel):
    query: str
    risk_scores: dict
    top_analogs: List[dict]
    intelligence_brief: str
    live_news: List[dict]
    sovereignty_score: float = 5.5
    response_source: str = "deterministic"
    llm_error: Optional[str] = None

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze(request: AnalysisRequest):
    try:
        # Load database from the expected path
        db_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "airavat", "strategic_database.json")
        database = load_events(db_path)
        
        forecaster = RiskForecaster(database)
        
        headlines = []
        if request.include_news:
            # Use the correct function name
            headlines = fetch_live_headlines(query=request.query)
            
        result = forecaster.forecast(request.query, top_k=5, live_news=headlines)
        
        # Build the brief — pass live news into the prompt so LLM can analyze each article
        from airavat.explainer import build_deterministic_brief, build_llm_prompt
        from airavat.llm import GroqClient
        from airavat.news_fetcher import format_news_context

        live_context = format_news_context(headlines) if headlines else None

        llm = GroqClient()
        response_source = "deterministic"
        llm_error: Optional[str] = None
        if llm.is_configured():
            try:
                prompt = build_llm_prompt(request.query, result, live_context=live_context, chat_history=request.chat_history)
                allowed_sources = [headline["source"] for headline in headlines]
                brief = llm.generate(prompt, allowed_sources=allowed_sources)
                response_source = "groq"
            except Exception as e:
                llm_error = str(e)
                print(f"LLM Error: {llm_error}")
                brief = build_deterministic_brief(request.query, result)
        else:
            llm_error = "GROQ_API_KEY is not configured in the bridge process."
            brief = build_deterministic_brief(request.query, result)
        
        # Format analogs for JSON — use category as title fallback, 'Ongoing' as date fallback
        analogs = []
        for event, score in result.analogs:
            display_title = event.title if event.title != "Classified Event" else (event.scenario[:80] or " / ".join(event.event_types) or "Strategic Event")
            display_date = event.date if event.date != "1900-01-01" else "Ongoing"
            analogs.append({
                "id": event.event_id,
                "title": display_title,
                "date": display_date,
                "category": "/".join(event.event_types),
                "scenario": event.summary,
                "similarity": round(float(score), 3)
            })
            
        return AnalysisResponse(
            query=result.query,
            risk_scores=result.risk_scores,
            top_analogs=analogs,
            intelligence_brief=brief,
            live_news=[{"title": h["title"], "url": h["link"], "source": h["source"]} for h in headlines],
            response_source=response_source,
            llm_error=llm_error,
        )
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/records")
async def get_records():
    try:
        db_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "airavat", "strategic_database.json")
        database = load_events(db_path)
        
        records = []
        for event in database:
            records.append({
                "id": event.event_id,
                "title": event.title,
                "summary": event.summary,
                "scenario": event.scenario,
                "date": event.date,
                "actors": event.actors,
                "targets": event.targets,
                "regions": event.regions,
                "event_types": event.event_types,
                "image": event.image,
                "deep_dive": event.deep_dive,
                "notes": event.notes,
                "keywords": event.keywords,
                "leading_indicators": event.leading_indicators,
                "follow_on_risks": event.follow_on_risks,
                "retaliatory_risks": event.retaliatory_risks,
                "countermeasures": event.countermeasures,
                "source_refs": event.source_refs,
                "source_reliability": event.source_reliability,
                "confidence": event.confidence,
            })
        return records
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/graph")
async def get_graph():
    try:
        db_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "airavat", "strategic_database.json")
        from airavat.loader import load_events
        database = load_events(db_path)
        
        from airavat.graph_builder import build_knowledge_graph
        graph_data = build_knowledge_graph(database)
        return graph_data
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health():
    return {"status": "online", "mission": "VAJRA"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8005)
