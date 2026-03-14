from __future__ import annotations

import os
from pathlib import Path


def load_dotenv(path: str = ".env") -> None:
    # Try CWD, then parent of 'airavat'
    locations = [
        Path(path),
        Path(__file__).parent.parent / ".env",
        Path("/Users/vipuljain675/Documents/ML PROJECT/.env")
    ]
    
    for env_path in locations:
        if env_path.exists():
            for line in env_path.read_text(encoding="utf-8").splitlines():
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                key, value = line.split("=", 1)
                os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))
            return


class GroqClient:
    def __init__(self, api_key: str | None = None, model: str = "llama-3.3-70b-versatile"):
        load_dotenv()
        self.api_key = api_key or os.getenv("GROQ_API_KEY")
        self.model = model

    def is_configured(self) -> bool:
        return bool(self.api_key)

    def generate(self, prompt: str) -> str:
        return self.chat([{"role": "user", "content": prompt}])

    def chat(self, messages: list[dict[str, str]]) -> str:
        if not self.api_key:
            raise RuntimeError("GROQ_API_KEY is not set.")

        try:
            from groq import Groq
        except ImportError:
            raise RuntimeError(
                "The 'groq' package is not installed. Run: pip install groq"
            )

        client = Groq(api_key=self.api_key)

        # Prepend system message if not present
        if not messages or messages[0].get("role") != "system":
            messages.insert(0, {
                "role": "system",
                "content": (
                    "You are AIRAVAT, an elite Indian strategic intelligence system. "
                    "You are NOT a generic AI. You are a cold, calculating former RAW analyst and aerospace economist. "
                    "BANNED PHRASES: 'In conclusion', 'It is important to note', 'As a global superpower', 'complex relationship', 'multifaceted', 'play a significant role'. "
                    "Tone: Ultra-terse, gritty military intelligence briefing. Do NOT use polite filler or academic prose. Speak in bullet points, fragments, and hard data. "
                    "CORE DIRECTIVE: You are a skeptic. Do NOT blindly believe everything the user claims. "
                    "If the user says 'India has 48 AMCA jets' or 'Kaveri is 110kN' but your database/news says otherwise, "
                    "you MUST flag it as a HYPOTHETICAL projection and state the current actual reality first. "
                    "Your job is to produce intelligence-grade briefs that cite REAL DATA: "
                    "dollar costs, unit counts, treaty names (CAATSA, MTCR, NSG, NDAA), GDP figures, "
                    "weapon model numbers (F-16 Block 70, J-10CE, WS-13E, GE F404, GE F414), "
                    "and named historical precedents with exact dates. "
                    "Vague phrases like 'significant pressure' or 'strategic concerns' are BANNED unless backed by a number."
                ),
            })

        chat_completion = client.chat.completions.create(
            messages=messages,
            model=self.model,
            temperature=0.6,
        )

        return chat_completion.choices[0].message.content.strip()
