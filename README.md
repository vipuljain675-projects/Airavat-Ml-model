# Mission Vajra: Airavat Strategic Intelligence AI

![Strategic Graphics](/Users/vipuljain675/.gemini/antigravity/brain/533fae45-81fc-488e-987c-2d2f0c4e3287/vajra_2047_akhand_bharat_1773580367485.png)

## Overview
**Airavat** is an advanced, India-centric geopolitical intelligence platform designed for Mission Vajra 2047. It combines a state-of-the-art LLM (Llama-3 via Groq) with a custom-built strategic database to provide high-fidelity, interactive intelligence assessments. 

The system focuses on India's strategic autonomy, identifying "Technology Denial Regimes," "Geopolitical Chokepoints," and "Covert Proxy Threats."

---

## 🧠 Machine Learning: The Core Concepts

Airavat isn't just a simple chatbot. It uses a sophisticated **Hybrid Intelligence Engine**. 

> [!NOTE]
> For a more fundamental, step-by-step technical explanation, see the **[Deep ML Concepts Guide](file:///Users/vipuljain675/.gemini/antigravity/brain/533fae45-81fc-488e-987c-2d2f0c4e3287/ml_concepts_deep_dive.md)**.

### 1. RAG (Retrieval-Augmented Generation)
**The Concept:** Traditional AI models are limited to their training data. RAG allows Airavat to "look up" facts in a private database (`strategic_database.json`) before answering. 
**Example:** If you ask about a "GE engine delay," the AI doesn't just guess; it retrieves the specific entry from the database, reads about the $3.2B total deal value, and updates its answer accordingly.

### 2. Semantic Search & Vector Embeddings
**The Concept:** Instead of looking for exact word matches, we convert sentences into mathematical vectors (numbers). 
- **The Magic:** Using the `all-MiniLM-L6-v2` model, the AI understands that "Stealth Planes" and "AMCA fifth-generation fighter" share the same semantic meaning. 
- **Benefit:** You can ask questions in your own words, and the AI will find the correct factual anchor even if the words don't match exactly.

### 3. Hybrid Retrieval & Heuristics
**The Concept:** Vector search can sometimes "blur" specific names. We use a custom **Heuristic Scoring System** to fix this.
- **Super-Boosting:** If you mention a specific, high-value keyword (like "Homi Bhabha" or "CIA"), our algorithm applies a mathematical boost to ensure that exact historical incident is prioritized above everything else.

### 4. Knowledge Graph (Strategic Threat Web)
**The Concept:** We treat geopolitics as a "Web" of connections.
- **Mechanism:** The system parses the entire database and draws lines between **Actors** (e.g., USA), **Events** (e.g., S-400), and **Theaters** (e.g., South Asia).
- **Visualization:** This allows strategic planners to see how a single tech delay in Washington ripples through to a frontline defense gap in the Himalayas.

---

## 🏗️ System Architecture

### 1. Backend (Python/FastAPI) - The Intelligence Brain
While Groq (the LLM) does the "talking," the Python files in the `airavat/` directory do the **"thinking," "retrieving," and "processing."**

- **`airavat/retriever.py` (The Librarian):** The most critical file. Converts your JSON into mathematical vectors (embeddings) and handles the **Hybrid Search** + "Super-Boosting" for specific keywords.
- **`airavat/forecaster.py` (The Analyzer):** Calculates **Risk Scores** (Technology Denial, etc.) by analyzing top analogs found by the retriever.
- **`airavat/explainer.py` (The Strategist):** Constructs the high-fidelity **LLM Prompt**. It forces the AI to follow the "Strategic Context" -> "India-First" structure.
- **`airavat/llm.py` (The Voice):** The bridge to **Groq**. Sends the structured prompt and brings back the intelligence response.
- **`bridge.py` (The API Gateway):** The "switchboard" connecting your browser to the Python brain via `/analyze` and `/graph` endpoints.
- **`airavat/graph_builder.py` (The Web Mapper):** Scans the JSON to create the connection data for the visual **Threat Web**.
- **`airavat/news_fetcher.py` (The Eyes):** Grabs real-world Google News RSS feeds to keep the AI's data current.
- **`airavat/loader.py` & `models.py`:** Define the data "Skeleton" to ensure your JSON metadata is perfectly structured.
- **`cli.py` & `repl.py`:** Allow you to run Mission Vajra directly from your Terminal without a browser.

**The Workflow:**
1. **Bridge** receives query -> 2. **Retriever** finds JSON facts -> 3. **News Fetcher** grabs headlines -> 4. **Forecaster** scores risks -> 5. **Explainer** writes prompt -> 6. **LLM** speaks -> 7. **Bridge** returns result.

### 2. Frontend (Next.js/TSX)
- **Command Hub**: The cinematic UI for real-time analysis.
- **Strategic Archive**: A searchable grid of all historical intelligence records.
- **Threat Web**: An interactive, 2D force-directed graph (using `react-force-graph-2d`).

---

## 🚀 Setup & Installation

### Backend Setup
1. Ensure your `GROQ_API_KEY` is set in `.env`.
2. Install dependencies:
   ```bash
   pip install fastapi uvicorn sentence-transformers Groq pydantic numpy
   ```
3. Launch the API:
   ```bash
   python3 -m uvicorn bridge:app --port 8005 --reload
   ```

### Frontend Setup
1. Navigate to the web folder:
   ```bash
   cd vajra-web
   ```
2. Install Node packages:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

---

## 🛡️ Strategic Goal
**MISSION VAJRA 2047:** To establish absolute propulsion and technological sovereignty. Airavat serves as the digital intelligence layer ensuring India stays ahead of the curve.
