from __future__ import annotations

import os
import re
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

    def generate(self, prompt: str, allowed_sources: list[str] | None = None) -> str:
        return self.chat([{"role": "user", "content": prompt}], allowed_sources=allowed_sources)

    def chat(
        self,
        messages: list[dict[str, str]],
        allowed_sources: list[str] | None = None,
    ) -> str:
        if not self.api_key:
            raise RuntimeError("GROQ_API_KEY is not set.")

        try:
            from groq import Groq
        except ImportError:
            raise RuntimeError(
                "The 'groq' package is not installed. Run: pip install groq"
            )

        client = Groq(api_key=self.api_key)

        # Prepend default system message only if no system message is provided in the list
        has_system = any(msg.get("role") == "system" for msg in messages)
        if not has_system:
            messages.insert(0, {
                "role": "system",
                "content": (
                    "You are AIRAVAT, a retrieval-grounded strategic analysis system. "
                    "Synthesize the provided evidence with your own deep internal geopolitical, economic, and industrial knowledge. "
                    "If evidence is weak, use your internal knowledge to provide a 'Vajra-Grade' Deep Dive, but label it as such. "
                    "Keep the answer concise, direct, and analyst-style."
                ),
            })

        chat_completion = client.chat.completions.create(
            messages=messages,
            model=self.model,
            temperature=0.7,
        )

        response = chat_completion.choices[0].message.content.strip()
        return self._sanitize_response(response, allowed_sources or [])

    @staticmethod
    def _sanitize_response(text: str, allowed_sources: list[str]) -> str:
        if not text:
            return text

        cleaned = text

        if allowed_sources:
            allowed = {source.lower() for source in allowed_sources}
            citation_pattern = re.compile(r"\((?:Ref:\s*)?([^)]+)\)")

            def replace_citation(match: re.Match[str]) -> str:
                cited = match.group(1).strip()
                cited_lower = cited.lower()
                if any(source in cited_lower for source in allowed):
                    return match.group(0)
                if any(token in cited_lower for token in ("bbc", "reuters", "al jazeera", "ndtv", "times of india", "the hindu")):
                    return "(Unverified source attribution removed)"
                return match.group(0)

            cleaned = citation_pattern.sub(replace_citation, cleaned)

        cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)
        return cleaned.strip()
