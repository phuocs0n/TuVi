"""Sinh packages/laso-ts/test/golden.json từ engine Python (nguồn chuẩn).

Bản TypeScript (packages/laso-ts) phải cho kết quả giống hệt các mẫu này.
Chạy lại khi sửa công thức:
    uv run python packages/laso-engine/tests/golden_gen.py
"""

import hashlib
import json
import random
from datetime import date, timedelta
from pathlib import Path
from typing import Any

from laso_engine import duong_sang_am, lap_la_so

GOLDEN = Path(__file__).resolve().parents[2] / "laso-ts" / "test" / "golden.json"
HO_TEN = ["", "Nguyễn Văn A", "  Trần Thị B  ", "Lê Hoàng", "Phạm Ngọc Ánh"]


def _canonical(d: object) -> str:
    return json.dumps(d, sort_keys=True, separators=(",", ":"), ensure_ascii=False)


def _lap(inp: dict[str, Any]) -> dict[str, Any] | None:
    try:
        return lap_la_so(
            ho_ten=inp["ho_ten"],
            gioi_tinh=inp["gioi_tinh"],
            ngay=inp["ngay"],
            thang=inp["thang"],
            nam=inp["nam"],
            gio=inp["gio"],
            am_lich=inp["lich"] == "am",
            nhuan=inp["nhuan"],
        ).to_dict()
    except ValueError:
        return None


def _mung_mot_am_lich() -> list[list[int]]:
    """Mọi mùng 1 âm lịch 1900-2100: [năm, tháng, ngày dương, tháng âm, năm âm, nhuận]."""
    cur = date(1900, 1, 31)
    out: list[list[int]] = []
    while cur.year <= 2100:
        am = duong_sang_am(cur.day, cur.month, cur.year)
        assert am.ngay == 1, cur
        out.append([cur.year, cur.month, cur.day, am.thang, am.nam, int(am.nhuan)])
        nxt = cur + timedelta(days=29)
        if duong_sang_am(nxt.day, nxt.month, nxt.year).ngay != 1:
            nxt = cur + timedelta(days=30)
        cur = nxt
    return out


def build() -> dict[str, Any]:
    rng = random.Random(20261022)
    start, span = date(1900, 1, 1), (date(2100, 12, 31) - date(1900, 1, 1)).days

    def ngau_nhien(lich: str) -> dict[str, Any]:
        d = start + timedelta(days=rng.randrange(span))
        ngay, thang, nam, nhuan = d.day, d.month, d.year, False
        if lich == "am":
            am = duong_sang_am(d.day, d.month, d.year)
            ngay, thang, nam, nhuan = am.ngay, am.thang, am.nam, am.nhuan
        return {
            "ho_ten": rng.choice(HO_TEN),
            "gioi_tinh": rng.choice(["nam", "nu"]),
            "ngay": ngay,
            "thang": thang,
            "nam": nam,
            "gio": rng.randrange(24),
            "lich": lich,
            "nhuan": nhuan,
        }

    inputs = [ngau_nhien("duong") for _ in range(300)] + [ngau_nhien("am") for _ in range(120)]

    base = {"ho_ten": "A", "gioi_tinh": "nam", "gio": 0, "lich": "duong", "nhuan": False}
    # Biên: năm nhuận, ngày không tồn tại, tháng nhuận (ngày 15/16 chia đôi), giờ và giới tính sai
    dac_biet: list[dict[str, Any]] = [
        {**base, "ngay": 29, "thang": 2, "nam": 2000},
        {**base, "ngay": 29, "thang": 2, "nam": 1900},
        {**base, "ngay": 30, "thang": 2, "nam": 2024},
        {**base, "ngay": 31, "thang": 4, "nam": 2024},
        {**base, "ngay": 1, "thang": 3, "nam": 2024, "lich": "am", "nhuan": True},
        {**base, "ngay": 31, "thang": 1, "nam": 2024, "lich": "am"},
        {**base, "ngay": 1, "thang": 1, "nam": 2024, "gio": 24},
        {**base, "ngay": 1, "thang": 1, "nam": 2024, "gioi_tinh": "khac"},
    ]
    for _, _, _, thang, nam, nhuan in _mung_mot_am_lich():
        if nhuan and nam % 7 == 0:
            for ngay in (1, 15, 16, 29):
                for gt in ("nam", "nu"):
                    dac_biet.append(
                        {**base, "ngay": ngay, "thang": thang, "nam": nam, "lich": "am",
                         "nhuan": True, "gioi_tinh": gt}
                    )  # fmt: skip
    inputs += dac_biet

    cases = []
    for inp in inputs:
        out = _lap(inp)
        cases.append(
            {
                "input": inp,
                "sha256": None
                if out is None
                else hashlib.sha256(_canonical(out).encode()).hexdigest(),
            }
        )
    vi_du = [_lap(i) for i in inputs[:2]]
    return {"mung_mot_am_lich": _mung_mot_am_lich(), "la_so": cases, "vi_du": vi_du}


if __name__ == "__main__":
    GOLDEN.parent.mkdir(parents=True, exist_ok=True)
    GOLDEN.write_text(
        json.dumps(build(), ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8"
    )
    print("đã ghi", GOLDEN)
