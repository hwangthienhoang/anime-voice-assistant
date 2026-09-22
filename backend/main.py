"""Backend cho trợ lý giọng nói.

Hai endpoint chính:
  POST /api/chat  -> gửi lịch sử hội thoại, nhận về {reply, emotion}
  POST /api/tts   -> gửi văn bản, nhận về audio/mpeg

Biến môi trường:
  AI_PROVIDER        = claude | openai          (mặc định: claude)
  ANTHROPIC_API_KEY  / ANTHROPIC_MODEL
  OPENAI_API_KEY     / OPENAI_MODEL
  TTS_VOICE          (mặc định: vi-VN-HoaiMyNeural)
  MAX_TOKENS         (mặc định: 400)

Chạy:  uvicorn main:app --reload --port 8000
"""

import os
import re
from pathlib import Path

import edge_tts
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel, Field

from providers import AIProvider, create_provider

ROOT = Path(__file__).resolve().parent
load_dotenv(ROOT.parent / ".env")

TTS_VOICE = os.getenv("TTS_VOICE", "vi-VN-HoaiMyNeural")
MAX_TOKENS = int(os.getenv("MAX_TOKENS", "400"))

PERSONA = (ROOT / "prompts" / "persona.md").read_text(encoding="utf-8")

EMOTIONS = {"neutral", "happy", "sad", "angry", "surprised", "relaxed"}
TAG_RE = re.compile(r"\[(\w+)\]")

app = FastAPI(title="Anime Voice Assistant")
_provider: AIProvider | None = None


def get_provider() -> AIProvider:
    global _provider
    if _provider is None:
        name = os.getenv("AI_PROVIDER", "claude")
        _provider = create_provider(name)
    return _provider


# ---------- Models ----------

class Message(BaseModel):
    role: str = Field(pattern="^(user|assistant)$")
    content: str


class ChatRequest(BaseModel):
    messages: list[Message]


class TTSRequest(BaseModel):
    text: str
    voice: str | None = None


# ---------- Helpers ----------

def parse_reply(raw: str) -> tuple[str, str]:
    """Tách thẻ cảm xúc [happy] ra khỏi câu trả lời."""
    emotion = "neutral"
    for tag in TAG_RE.findall(raw):
        if tag.lower() in EMOTIONS:
            emotion = tag.lower()
            break

    def drop_emotion_tags(m: re.Match) -> str:
        return "" if m.group(1).lower() in EMOTIONS else m.group(0)

    text = TAG_RE.sub(drop_emotion_tags, raw)
    text = re.sub(r"[ \t]{2,}", " ", text).strip()
    return text, emotion


def clean_for_speech(text: str) -> str:
    """Bỏ ký tự markdown để TTS không đọc lên."""
    text = re.sub(r"[*_`#>~]+", "", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


# ---------- Endpoints ----------

@app.get("/api/health")
async def health():
    provider = get_provider()
    return {
        "ok": True,
        "provider": type(provider).__name__,
        "model": getattr(provider, "model", "unknown"),
        "voice": TTS_VOICE,
    }


@app.post("/api/chat")
async def chat(req: ChatRequest):
    if not req.messages:
        raise HTTPException(status_code=400, detail="messages trống")

    raw = await get_provider().chat(
        messages=[m.model_dump() for m in req.messages[-20:]],
        system=PERSONA,
        max_tokens=MAX_TOKENS,
    )
    reply, emotion = parse_reply(raw)
    return {"reply": reply, "emotion": emotion}


@app.post("/api/tts")
async def tts(req: TTSRequest):
    text = clean_for_speech(req.text)
    if not text:
        raise HTTPException(status_code=400, detail="text trống")

    communicate = edge_tts.Communicate(text, req.voice or TTS_VOICE)
    audio = bytearray()
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio.extend(chunk["data"])

    if not audio:
        raise HTTPException(status_code=502, detail="TTS không trả về âm thanh")
    return Response(content=bytes(audio), media_type="audio/mpeg")
