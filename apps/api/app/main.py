from typing import Literal

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.config import settings
from laso_engine import duong_sang_am, lap_la_so

app = FastAPI(title="Tử Vi AI API", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        f"https://{settings.app_domain}",
        f"https://www.{settings.app_domain}",
        "http://localhost:3000",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_methods=["*"],
    allow_headers=["*"],
)


class LaSoRequest(BaseModel):
    ho_ten: str = Field(default="", max_length=100)
    gioi_tinh: Literal["nam", "nu"]
    ngay: int = Field(ge=1, le=31)
    thang: int = Field(ge=1, le=12)
    nam: int = Field(ge=1900, le=2100)
    gio: int = Field(ge=0, le=23, description="Giờ sinh 0–23")
    lich: Literal["duong", "am"] = "duong"
    nhuan: bool = Field(default=False, description="Tháng nhuận (chỉ dùng khi lich = am)")


class LuanGiaiRequest(LaSoRequest):
    cau_hoi: str = Field(default="Luận giải tổng quan lá số.", max_length=500)


def _lap(req: LaSoRequest) -> dict[str, object]:
    try:
        return lap_la_so(
            ho_ten=req.ho_ten,
            gioi_tinh=req.gioi_tinh,
            ngay=req.ngay,
            thang=req.thang,
            nam=req.nam,
            gio=req.gio,
            am_lich=req.lich == "am",
            nhuan=req.nhuan,
        ).to_dict()
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e)) from e


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "env": settings.app_env}


@app.get("/v1/chuyen-lich")
def chuyen_lich(ngay: int, thang: int, nam: int) -> dict[str, object]:
    """Đổi ngày dương lịch sang âm lịch."""
    try:
        am = duong_sang_am(ngay, thang, nam)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e)) from e
    return {"ngay": am.ngay, "thang": am.thang, "nam": am.nam, "nhuan": am.nhuan}


@app.post("/v1/la-so")
def tao_la_so(req: LaSoRequest) -> dict[str, object]:
    return _lap(req)


@app.post("/v1/luan-giai")
async def luan_giai(req: LuanGiaiRequest) -> dict[str, object]:
    la_so = _lap(req)
    try:
        async with httpx.AsyncClient(timeout=90) as client:
            res = await client.post(
                f"{settings.ai_engine_url}/v1/interpret",
                json={"la_so": la_so, "cau_hoi": req.cau_hoi},
            )
    except httpx.HTTPError as e:
        raise HTTPException(
            status_code=503, detail="Dịch vụ luận giải AI chưa sẵn sàng, vui lòng thử lại sau."
        ) from e
    if res.status_code == 503:
        raise HTTPException(status_code=503, detail="Tính năng luận giải AI chưa được cấu hình.")
    if res.status_code != 200:
        raise HTTPException(status_code=502, detail="Dịch vụ luận giải AI gặp lỗi.")
    return {"la_so": la_so, "luan_giai": res.json()["luan_giai"]}
