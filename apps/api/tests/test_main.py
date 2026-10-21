from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health() -> None:
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"


def test_tao_la_so() -> None:
    res = client.post("/v1/laso", json={"nam_am": 1990, "thang_am": 3, "gio": 6})
    assert res.status_code == 200
    assert res.json()["nam"] == "Canh Ngọ"


def test_tao_la_so_input_sai() -> None:
    res = client.post("/v1/laso", json={"nam_am": 1990, "thang_am": 13, "gio": 6})
    assert res.status_code == 422
