from datetime import date

import pytest

from laso_engine import NgayAm, am_sang_duong, duong_sang_am


@pytest.mark.parametrize(
    ("duong", "am"),
    [
        ((10, 2, 2024), (1, 1, 2024, False)),
        ((29, 1, 2025), (1, 1, 2025, False)),
        ((17, 2, 2026), (1, 1, 2026, False)),
        ((5, 2, 2000), (1, 1, 2000, False)),
        ((27, 1, 1990), (1, 1, 1990, False)),
        ((2, 2, 1984), (1, 1, 1984, False)),
        ((1, 1, 2000), (25, 11, 1999, False)),
        ((22, 1, 2023), (1, 1, 2023, False)),
        ((23, 1, 2012), (1, 1, 2012, False)),
        ((31, 12, 2024), (1, 12, 2024, False)),
        # tháng nhuận
        ((22, 3, 2023), (1, 2, 2023, True)),
        ((25, 7, 2025), (1, 6, 2025, True)),
    ],
)
def test_duong_sang_am(duong: tuple[int, int, int], am: tuple[int, int, int, bool]) -> None:
    assert duong_sang_am(*duong) == NgayAm(*am)


@pytest.mark.parametrize("nam", [1950, 1984, 1999, 2023, 2024, 2025])
def test_khu_hoi_moi_ngay_trong_nam(nam: int) -> None:
    d = date(nam, 1, 1)
    while d.year == nam:
        am = duong_sang_am(d.day, d.month, d.year)
        assert am_sang_duong(am.ngay, am.thang, am.nam, am.nhuan) == d
        d = date.fromordinal(d.toordinal() + 1)


def test_ngay_duong_khong_hop_le() -> None:
    with pytest.raises(ValueError):
        duong_sang_am(30, 2, 2024)


def test_ngay_am_khong_ton_tai() -> None:
    with pytest.raises(ValueError):
        am_sang_duong(1, 3, 2024, nhuan=True)  # 2024 không có tháng 3 nhuận
    with pytest.raises(ValueError):
        am_sang_duong(31, 1, 2024)
