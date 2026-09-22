import os

from fastapi import HTTPException
from openai import AsyncOpenAI

from .base import AIProvider

MODEL_DEFAULT = "gpt-4o-mini"


class OpenAIProvider(AIProvider):
    def __init__(self) -> None:
        key = os.getenv("OPENAI_API_KEY")
        if not key:
            raise HTTPException(
                status_code=500,
                detail="Thiếu OPENAI_API_KEY trong .env",
            )
        self._client = AsyncOpenAI(api_key=key)
        self.model = os.getenv("OPENAI_MODEL", MODEL_DEFAULT)

    async def chat(self, messages: list[dict], system: str, max_tokens: int) -> str:
        full_messages = [{"role": "system", "content": system}, *messages]
        result = await self._client.chat.completions.create(
            model=self.model,
            max_tokens=max_tokens,
            messages=full_messages,
        )
        return result.choices[0].message.content or ""
