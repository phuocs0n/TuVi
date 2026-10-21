"""Thiên Can, Địa Chi và Ngũ hành nạp âm."""

from dataclasses import dataclass

CAN = ("Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý")
CHI = ("Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi")

# Ngũ hành nạp âm cho 30 cặp Lục thập hoa giáp (Giáp Tý–Ất Sửu, Bính Dần–Đinh Mão, ...)
_NAP_AM = (
    "Kim", "Hỏa", "Mộc", "Thổ", "Kim", "Hỏa", "Thủy", "Thổ", "Kim", "Mộc",
    "Thủy", "Thổ", "Hỏa", "Mộc", "Thủy", "Kim", "Hỏa", "Mộc", "Thổ", "Kim",
    "Hỏa", "Thủy", "Thổ", "Kim", "Mộc", "Thủy", "Thổ", "Hỏa", "Mộc", "Thủy",
)  # fmt: skip


@dataclass(frozen=True)
class CanChi:
    can: int
    chi: int

    def __post_init__(self) -> None:
        if not (0 <= self.can < 10 and 0 <= self.chi < 12):
            raise ValueError(f"Can/Chi ngoài phạm vi: {self.can}, {self.chi}")
        if self.can % 2 != self.chi % 2:
            raise ValueError("Can và Chi phải cùng âm/dương")

    @property
    def ten(self) -> str:
        return f"{CAN[self.can]} {CHI[self.chi]}"

    @property
    def hoa_giap(self) -> int:
        """Vị trí 0..59 trong Lục thập hoa giáp."""
        return (6 * self.can - 5 * self.chi) % 60


def can_chi_nam(nam_am_lich: int) -> CanChi:
    """Can Chi của năm âm lịch (năm 4 SCN là Giáp Tý)."""
    return CanChi((nam_am_lich - 4) % 10, (nam_am_lich - 4) % 12)


def nap_am(cc: CanChi) -> str:
    return _NAP_AM[cc.hoa_giap // 2]


def chi_gio(gio: int) -> int:
    """Đổi giờ đồng hồ 0..23 sang chỉ số Chi (Tý = 23h–1h)."""
    if not 0 <= gio <= 23:
        raise ValueError(f"Giờ không hợp lệ: {gio}")
    return ((gio + 1) // 2) % 12
