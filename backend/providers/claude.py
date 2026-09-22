import os

from anthropic import AsyncAnthropic
from fastapi import HTTPException

from .base import AIProvider

MODEL_DEFAULT = "claude-sonnet-4-6"


class ClaudeProvider(AIProvider):
    def __init__(self) -> None:
        key = os.getenv("ANTHROPIC_API_KEY")
        if not key:
            raise HTTPException(
                status_code=500,
                detail="Thiếu ANTHROPIC_API_KEY trong .env",
            )
        self._client = AsyncAnthropic(api_key=key)
        self.model = os.getenv("ANTHROPIC_MODEL", MODEL_DEFAULT)

    async def chat(self, messages: list[dict], system: str, max_tokens: int) -> str:
        result = await self._client.messages.create(
            model=self.model,
            max_tokens=max_tokens,
            system=system,
            messages=messages,
        )
        return "".join(b.text for b in result.content if b.type == "text")
