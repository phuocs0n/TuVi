import pytest

from laso_engine import CanChi, can_chi_nam, chi_gio, nap_am


@pytest.mark.parametrize(
    ("nam", "ten", "hanh"),
    [
        (1984, "Giáp Tý", "Kim"),
        (1990, "Canh Ngọ", "Thổ"),
        (2000, "Canh Thìn", "Kim"),
        (2024, "Giáp Thìn", "Hỏa"),
        (2026, "Bính Ngọ", "Thủy"),
        (1993, "Quý Dậu", "Kim"),
    ],
)
def test_can_chi_va_nap_am_nam(nam: int, ten: str, hanh: str) -> None:
    cc = can_chi_nam(nam)
    assert cc.ten == ten
    assert nap_am(cc) == hanh


def test_hoa_giap_day_du_60() -> None:
    assert sorted(can_chi_nam(1984 + i).hoa_giap for i in range(60)) == list(range(60))


@pytest.mark.parametrize(
    ("gio", "chi"),
    [(23, 0), (0, 0), (1, 1), (2, 1), (3, 2), (11, 6), (12, 6), (13, 7), (21, 11), (22, 11)],
)
def test_chi_gio(gio: int, chi: int) -> None:
    assert chi_gio(gio) == chi


def test_chi_gio_khong_hop_le() -> None:
    with pytest.raises(ValueError):
        chi_gio(24)


def test_canchi_lech_am_duong() -> None:
    with pytest.raises(ValueError):
        CanChi(0, 1)
