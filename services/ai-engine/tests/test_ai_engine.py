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


def test_format_la_so_day_du() -> None:
    from app.prompt import format_la_so

    cung = {
        "chi": "Dần",
        "can": "Mậu",
        "ten_cung": "Mệnh",
        "chinh_tinh": [{"ten": "Tử Vi", "hoa": "Khoa"}],
        "phu_tinh": [{"ten": "Tả Phù", "hoa": None}],
        "dai_han": {"tu": 6, "den": 15},
        "truong_sinh": "Trường Sinh",
        "la_than": True,
        "tuan": False,
        "triet": True,
    }
    la_so = {
        "gioi_tinh": "nu",
        "can_chi_nam": "Canh Ngọ",
        "am_duong": "Dương",
        "nap_am": "Thổ",
        "am_lich": {"ngay": 1, "thang": 1, "nam": 1990, "nhuan": False},
        "duong_lich": {"gio_chi": "Tý"},
        "cuc": "Hỏa Lục 6 Cục",
        "cung_menh": "Dần",
        "than_cu": "Mệnh",
        "chieu_dai_han": "Nghịch",
        "cung": [cung],
    }
    text = format_la_so(la_so)
    assert "Giới tính: Nữ" in text
    assert "- Mệnh (Mậu Dần, đại hạn 6-15) [Thân, Triệt]: chính tinh: Tử Vi (Hóa Khoa)" in text
    assert "phụ tinh: Tả Phù;" in text
