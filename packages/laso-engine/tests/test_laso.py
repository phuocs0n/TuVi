import pytest

from laso_engine import Cuc, an_cung_menh_than, an_la_so, tinh_cuc
from laso_engine.laso import can_cung

TY, SUU, DAN, MAO, THIN, TY_, NGO, MUI, THAN, DAU, TUAT, HOI = range(12)


def test_thang_gieng_gio_ty_menh_than_dong_cung_dan() -> None:
    assert an_cung_menh_than(1, TY) == (DAN, DAN)


def test_thang_ba_gio_mao() -> None:
    # Tháng 3 ở Thìn; Mệnh nghịch 3 cung → Sửu, Thân thuận 3 cung → Mùi
    assert an_cung_menh_than(3, MAO) == (SUU, MUI)


def test_thang_khong_hop_le() -> None:
    with pytest.raises(ValueError):
        an_cung_menh_than(13, TY)


@pytest.mark.parametrize(
    ("can_nam", "can_dan"),
    [(0, 2), (5, 2), (1, 4), (6, 4), (2, 6), (7, 6), (3, 8), (8, 8), (4, 0), (9, 0)],
)
def test_ngu_ho_don(can_nam: int, can_dan: int) -> None:
    assert can_cung(can_nam, DAN) == can_dan


@pytest.mark.parametrize(
    ("can_nam", "cung_menh", "cuc"),
    [
        (0, TY, Cuc.THUY_NHI),  # Giáp, Mệnh Tý → Bính Tý (Thủy)
        (0, DAN, Cuc.HOA_LUC),  # Giáp, Mệnh Dần → Bính Dần (Hỏa)
        (1, TY, Cuc.HOA_LUC),  # Ất, Mệnh Tý → Mậu Tý (Hỏa)
        (2, NGO, Cuc.KIM_TU),  # Bính, Mệnh Ngọ → Giáp Ngọ (Kim)
        (6, SUU, Cuc.HOA_LUC),  # Canh, Mệnh Sửu → Kỷ Sửu (Hỏa)
    ],
)
def test_tinh_cuc(can_nam: int, cung_menh: int, cuc: Cuc) -> None:
    assert tinh_cuc(can_nam, cung_menh) == cuc


def test_an_la_so_day_du() -> None:
    ls = an_la_so(nam_am=1990, thang_am=3, gio=6)  # giờ Mão
    assert ls.to_dict() == {
        "nam": "Canh Ngọ",
        "menh_nap_am": "Thổ",
        "cung_menh": "Sửu",
        "cung_than": "Mùi",
        "cuc": "Hỏa 6",
    }
