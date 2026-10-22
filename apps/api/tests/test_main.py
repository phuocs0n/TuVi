from typing import Any

import httpx
import pytest
from fastapi.testclient import TestClient

from app import main
from app.main import app

client = TestClient(app)

BODY = {"ho_ten": "Nguyễn Văn A", "gioi_tinh": "nam", "ngay": 15, "thang": 3, "nam": 1990, "gio": 6}


def test_health() -> None:
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"


def test_tao_la_so() -> None:
    res = client.post("/v1/la-so", json=BODY)
    assert res.status_code == 200
    data = res.json()
    assert data["can_chi_nam"] == "Canh Ngọ"
    assert len(data["cung"]) == 12
    assert data["ho_ten"] == "Nguyễn Văn A"


def test_tao_la_so_am_lich() -> None:
    res = client.post("/v1/la-so", json={**BODY, "ngay": 1, "thang": 1, "nam": 2024, "lich": "am"})
    assert res.status_code == 200
    assert res.json()["duong_lich"]["ngay"] == 10


@pytest.mark.parametrize(
    "sai",
    [
        {"thang": 13},
        {"gio": 24},
        {"gioi_tinh": "khac"},
        {"ngay": 30, "thang": 2},  # ngày dương không tồn tại
        {"lich": "am", "nhuan": True, "thang": 3, "nam": 2024},  # tháng nhuận không tồn tại
    ],
)
def test_tao_la_so_input_sai(sai: dict[str, Any]) -> None:
    assert client.post("/v1/la-so", json={**BODY, **sai}).status_code == 422


def test_chuyen_lich() -> None:
    res = client.get("/v1/chuyen-lich", params={"ngay": 10, "thang": 2, "nam": 2024})
    assert res.json() == {"ngay": 1, "thang": 1, "nam": 2024, "nhuan": False}


def _mock_ai(monkeypatch: pytest.MonkeyPatch, handler: Any) -> None:
    transport = httpx.MockTransport(handler)
    real = httpx.AsyncClient

    def factory(*args: Any, **kwargs: Any) -> httpx.AsyncClient:
        return real(*args, **{**kwargs, "transport": transport})

    monkeypatch.setattr(main.httpx, "AsyncClient", factory)


def test_luan_giai_thanh_cong(monkeypatch: pytest.MonkeyPatch) -> None:
    seen: dict[str, Any] = {}

    def handler(req: httpx.Request) -> httpx.Response:
        seen["url"] = str(req.url)
        return httpx.Response(200, json={"luan_giai": "Mệnh tốt."})

    _mock_ai(monkeypatch, handler)
    res = client.post("/v1/luan-giai", json=BODY)
    assert res.status_code == 200
    assert res.json()["luan_giai"] == "Mệnh tốt."
    assert seen["url"].endswith("/v1/interpret")


def test_luan_giai_chua_cau_hinh(monkeypatch: pytest.MonkeyPatch) -> None:
    _mock_ai(monkeypatch, lambda req: httpx.Response(503, json={"detail": "x"}))
    res = client.post("/v1/luan-giai", json=BODY)
    assert res.status_code == 503
    assert "chưa được cấu hình" in res.json()["detail"]


def test_luan_giai_ai_engine_khong_chay(monkeypatch: pytest.MonkeyPatch) -> None:
    def handler(req: httpx.Request) -> httpx.Response:
        raise httpx.ConnectError("down", request=req)

    _mock_ai(monkeypatch, handler)
    assert client.post("/v1/luan-giai", json=BODY).status_code == 503
