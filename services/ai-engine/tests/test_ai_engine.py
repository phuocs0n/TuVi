from fastapi.testclient import TestClient

from app.main import app, settings
from app.prompt import build_prompt


def test_build_prompt_co_du_kien_la_so() -> None:
    p = build_prompt({"nam": "Canh Ngọ"}, ["Tử Vi tọa Ngọ"], "Sự nghiệp?")
    assert "- nam: Canh Ngọ" in p
    assert "<doc>Tử Vi tọa Ngọ</doc>" in p
    assert p.endswith("Câu hỏi: Sự nghiệp?")


def test_interpret_thieu_key_tra_503() -> None:
    settings.anthropic_api_key = ""
    res = TestClient(app).post("/v1/interpret", json={"la_so": {"nam": "Canh Ngọ"}})
    assert res.status_code == 503


def test_health() -> None:
    assert TestClient(app).get("/health").json()["status"] == "ok"
