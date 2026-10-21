from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.config import settings
from laso_engine import an_la_so

app = FastAPI(title="Tử Vi AI API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        f"https://{settings.app_domain}",
        f"https://www.{settings.app_domain}",
        "http://localhost:3000",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)


class LaSoRequest(BaseModel):
    nam_am: int = Field(ge=1900, le=2100, description="Năm âm lịch")
    thang_am: int = Field(ge=1, le=12, description="Tháng âm lịch")
    gio: int = Field(ge=0, le=23, description="Giờ sinh (0–23)")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "env": settings.app_env}


@app.post("/v1/laso")
def tao_la_so(req: LaSoRequest) -> dict[str, object]:
    return an_la_so(req.nam_am, req.thang_am, req.gio).to_dict()
