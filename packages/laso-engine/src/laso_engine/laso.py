"""An cung Mệnh, Thân và tính Cục — các bước nền của lá số Tử Vi.

Đầu vào là ngày tháng năm ÂM LỊCH; việc đổi dương → âm lịch thuộc module riêng.
"""

from dataclasses import dataclass
from enum import IntEnum

from laso_engine.canchi import CHI, CanChi, can_chi_nam, chi_gio, nap_am

DAN = 2  # chỉ số cung Dần — điểm khởi của tháng Giêng


class Cuc(IntEnum):
    THUY_NHI = 2
    MOC_TAM = 3
    KIM_TU = 4
    THO_NGU = 5
    HOA_LUC = 6


_CUC_THEO_HANH = {
    "Thủy": Cuc.THUY_NHI,
    "Mộc": Cuc.MOC_TAM,
    "Kim": Cuc.KIM_TU,
    "Thổ": Cuc.THO_NGU,
    "Hỏa": Cuc.HOA_LUC,
}


@dataclass(frozen=True)
class LaSoCoBan:
    nam: CanChi
    menh_nap_am: str
    cung_menh: int
    cung_than: int
    cuc: Cuc

    def to_dict(self) -> dict[str, object]:
        return {
            "nam": self.nam.ten,
            "menh_nap_am": self.menh_nap_am,
            "cung_menh": CHI[self.cung_menh],
            "cung_than": CHI[self.cung_than],
            "cuc": f"{self.menh_cuc_ten} {self.cuc.value}",
        }

    @property
    def menh_cuc_ten(self) -> str:
        return next(h for h, c in _CUC_THEO_HANH.items() if c is self.cuc)


def an_cung_menh_than(thang_am: int, chi_gio_sinh: int) -> tuple[int, int]:
    """Từ Dần đếm thuận đến tháng sinh, rồi Mệnh đếm nghịch / Thân đếm thuận đến giờ sinh."""
    if not 1 <= thang_am <= 12:
        raise ValueError(f"Tháng âm lịch không hợp lệ: {thang_am}")
    cung_thang = DAN + thang_am - 1
    return (cung_thang - chi_gio_sinh) % 12, (cung_thang + chi_gio_sinh) % 12


def can_cung(can_nam: int, cung: int) -> int:
    """Can của một cung theo Ngũ hổ độn (Giáp/Kỷ khởi Bính Dần, ...)."""
    can_dan = (can_nam % 5 * 2 + 2) % 10
    return (can_dan + (cung - DAN) % 12) % 10


def tinh_cuc(can_nam: int, cung_menh: int) -> Cuc:
    """Cục = hành nạp âm của Can Chi cung Mệnh."""
    return _CUC_THEO_HANH[nap_am(CanChi(can_cung(can_nam, cung_menh), cung_menh))]


def an_la_so(nam_am: int, thang_am: int, gio: int) -> LaSoCoBan:
    nam = can_chi_nam(nam_am)
    menh, than = an_cung_menh_than(thang_am, chi_gio(gio))
    return LaSoCoBan(
        nam=nam,
        menh_nap_am=nap_am(nam),
        cung_menh=menh,
        cung_than=than,
        cuc=tinh_cuc(nam.can, menh),
    )
