from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from pydantic_settings import BaseSettings, SettingsConfigDict

from app.prompt import SYSTEM_PROMPT, build_prompt


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    anthropic_api_key: str = ""
    llm_model: str = "claude-sonnet-5-5"


settings = Settings()
app = FastAPI(title="Tử Vi AI Engine", version="0.1.0")


class InterpretRequest(BaseModel):
    la_so: dict[str, object]
    cau_hoi: str = "Luận giải tổng quan lá số."


def retrieve(_la_so: dict[str, object]) -> list[str]:
    """TODO: truy vấn pgvector. Tạm thời chưa có kho tri thức."""
    return []


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "llm": "configured" if settings.anthropic_api_key else "missing-key"}


@app.post("/v1/interpret")
def interpret(req: InterpretRequest) -> dict[str, str]:
    if not settings.anthropic_api_key:
        raise HTTPException(status_code=503, detail="Chưa cấu hình ANTHROPIC_API_KEY")

    import anthropic

    client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
    msg = client.messages.create(
        model=settings.llm_model,
        max_tokens=2048,
        system=SYSTEM_PROMPT,
        messages=[
            {"role": "user", "content": build_prompt(req.la_so, retrieve(req.la_so), req.cau_hoi)}
        ],
    )
    text = "".join(b.text for b in msg.content if b.type == "text")
    return {"luan_giai": text}
