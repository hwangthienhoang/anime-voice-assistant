from .base import AIProvider
from .claude import ClaudeProvider
from .openai import OpenAIProvider

__all__ = ["AIProvider", "ClaudeProvider", "OpenAIProvider"]


def create_provider(name: str) -> "AIProvider":
    name = name.lower()
    if name in ("claude", "anthropic"):
        return ClaudeProvider()
    if name in ("openai", "chatgpt", "gpt"):
        return OpenAIProvider()
    raise ValueError(f"Provider không hợp lệ: '{name}'. Chọn: claude, openai")
