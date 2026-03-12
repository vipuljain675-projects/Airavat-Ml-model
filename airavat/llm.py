from __future__ import annotations

import os
from pathlib import Path


def load_dotenv(path: str = ".env") -> None:
    env_path = Path(path)
    if not env_path.exists():
        return
    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


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
                    "You are a geopolitical research assistant specialising in India's strategic affairs. "
                    "Use only supplied evidence. Mark any inference clearly. "
                    "In interactive mode, maintain context from previous turns but always prioritize the latest strategic analogs provided."
                ),
            })

        chat_completion = client.chat.completions.create(
            messages=messages,
            model=self.model,
            temperature=0.2,
        )

        return chat_completion.choices[0].message.content.strip()
