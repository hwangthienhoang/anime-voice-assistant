from abc import ABC, abstractmethod


class AIProvider(ABC):
    """Interface chung cho mọi AI provider."""

    @abstractmethod
    async def chat(
        self,
        messages: list[dict],
        system: str,
        max_tokens: int,
    ) -> str:
        """Gọi API và trả về nội dung text thô (chưa parse emotion)."""
        ...
