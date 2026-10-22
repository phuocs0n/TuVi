"""An lá số Tử Vi Đẩu Số đầy đủ: 12 cung, 14 chính tinh, phụ tinh, Tứ Hóa, Đại hạn.

Mọi vị trí là chỉ số Địa Chi 0..11 (Tý = 0 ... Hợi = 11). Các công thức theo trường phái
Tử Vi phổ biến ở Việt Nam; một số phụ tinh có biến thể giữa các phái (xem ghi chú từng hàm).
"""

from dataclasses import dataclass
from datetime import date
from typing import Literal

from laso_engine.amlich import NgayAm, am_sang_duong, duong_sang_am
from laso_engine.canchi import CAN, CHI, CanChi, can_chi_nam, chi_gio, nap_am
from laso_engine.laso import Cuc, an_cung_menh_than, can_cung, tinh_cuc

GioiTinh = Literal["nam", "nu"]

TY, SUU, DAN, MAO, THIN, TY_, NGO, MUI, THAN, DAU, TUAT, HOI = range(12)

CUNG_CHUC = (
    "Mệnh", "Phụ Mẫu", "Phúc Đức", "Điền Trạch", "Quan Lộc", "Nô Bộc",
    "Thiên Di", "Tật Ách", "Tài Bạch", "Tử Tức", "Phu Thê", "Huynh Đệ",
)  # fmt: skip

TRUONG_SINH = (
    "Trường Sinh", "Mộc Dục", "Quan Đới", "Lâm Quan", "Đế Vượng", "Suy",
    "Bệnh", "Tử", "Mộ", "Tuyệt", "Thai", "Dưỡng",
)  # fmt: skip

THAI_TUE = (
    "Thái Tuế", "Thiếu Dương", "Tang Môn", "Thiếu Âm", "Quan Phù", "Tử Phù",
    "Tuế Phá", "Long Đức", "Bạch Hổ", "Phúc Đức", "Điếu Khách", "Trực Phù",
)  # fmt: skip

VONG_LOC_TON = (
    "Bác Sĩ", "Lực Sĩ", "Thanh Long", "Tiểu Hao", "Tướng Quân", "Tấu Thư",
    "Phi Liêm", "Hỷ Thần", "Bệnh Phù", "Đại Hao", "Phục Binh", "Quan Phủ",
)  # fmt: skip

# Vị trí Trường Sinh theo Cục
_TRUONG_SINH_KHOI = {
    Cuc.THUY_NHI: THAN,
    Cuc.THO_NGU: THAN,
    Cuc.MOC_TAM: HOI,
    Cuc.KIM_TU: TY_,
    Cuc.HOA_LUC: DAN,
}

_LOC_TON = {0: DAN, 1: MAO, 2: TY_, 3: NGO, 4: TY_, 5: NGO, 6: THAN, 7: DAU, 8: HOI, 9: TY}

# Thiên Khôi, Thiên Việt theo Can năm ("Giáp Mậu Canh ngưu dương ...")
_KHOI_VIET = {
    0: (SUU, MUI), 4: (SUU, MUI), 6: (SUU, MUI),
    1: (TY, THAN), 5: (TY, THAN),
    2: (HOI, DAU), 3: (HOI, DAU),
    8: (MAO, TY_), 9: (MAO, TY_),
    7: (NGO, DAN),
}  # fmt: skip

# Tứ Hóa theo Can năm: (Lộc, Quyền, Khoa, Kỵ)
_TU_HOA = {
    0: ("Liêm Trinh", "Phá Quân", "Vũ Khúc", "Thái Dương"),
    1: ("Thiên Cơ", "Thiên Lương", "Tử Vi", "Thái Âm"),
    2: ("Thiên Đồng", "Thiên Cơ", "Văn Xương", "Liêm Trinh"),
    3: ("Thái Âm", "Thiên Đồng", "Thiên Cơ", "Cự Môn"),
    4: ("Tham Lang", "Thái Âm", "Hữu Bật", "Thiên Cơ"),
    5: ("Vũ Khúc", "Tham Lang", "Thiên Lương", "Văn Khúc"),
    6: ("Thái Dương", "Vũ Khúc", "Thái Âm", "Thiên Đồng"),
    7: ("Cự Môn", "Thái Dương", "Văn Khúc", "Văn Xương"),
    8: ("Thiên Lương", "Tử Vi", "Tả Phù", "Vũ Khúc"),
    9: ("Phá Quân", "Cự Môn", "Thái Âm", "Tham Lang"),
}
_HOA = ("Lộc", "Quyền", "Khoa", "Kỵ")

# Triệt (Lộ Không) theo Can năm
_TRIET = {0: (THAN, DAU), 5: (THAN, DAU), 1: (NGO, MUI), 6: (NGO, MUI),
          2: (THIN, TY_), 7: (THIN, TY_), 3: (DAN, MAO), 8: (DAN, MAO),
          4: (TY, SUU), 9: (TY, SUU)}  # fmt: skip


def _nhom_tam_hop(chi: int) -> int:
    """0: Thân-Tý-Thìn, 1: Dần-Ngọ-Tuất, 2: Tỵ-Dậu-Sửu, 3: Hợi-Mão-Mùi."""
    return {THAN: 0, TY: 0, THIN: 0, DAN: 1, NGO: 1, TUAT: 1, TY_: 2, DAU: 2, SUU: 2}.get(chi, 3)


def vi_tri_tu_vi(cuc: int, ngay_am: int) -> int:
    """Vị trí sao Tử Vi theo Cục và ngày sinh âm lịch."""
    x = (-ngay_am) % cuc
    q = (ngay_am + x) // cuc
    vt = DAN + q - 1
    return (vt - x if x % 2 else vt + x) % 12


def an_chinh_tinh(cuc: int, ngay_am: int) -> dict[str, int]:
    """Vị trí 14 chính tinh."""
    tv = vi_tri_tu_vi(cuc, ngay_am)
    tp = (4 - tv) % 12
    return {
        "Tử Vi": tv,
        "Thiên Cơ": (tv - 1) % 12,
        "Thái Dương": (tv - 3) % 12,
        "Vũ Khúc": (tv - 4) % 12,
        "Thiên Đồng": (tv - 5) % 12,
        "Liêm Trinh": (tv - 8) % 12,
        "Thiên Phủ": tp,
        "Thái Âm": (tp + 1) % 12,
        "Tham Lang": (tp + 2) % 12,
        "Cự Môn": (tp + 3) % 12,
        "Thiên Tướng": (tp + 4) % 12,
        "Thiên Lương": (tp + 5) % 12,
        "Thất Sát": (tp + 6) % 12,
        "Phá Quân": (tp + 10) % 12,
    }


def an_phu_tinh(
    *, can_nam: int, chi_nam: int, thang: int, ngay: int, gio: int,
    menh: int, than: int, thuan: bool,
) -> dict[str, int]:  # fmt: skip
    """Vị trí các phụ tinh. `thang` là tháng dùng để an cung (đã xử lý nhuận), `gio` là chi giờ."""
    ta_phu = (THIN + thang - 1) % 12
    huu_bat = (TUAT - (thang - 1)) % 12
    van_xuong = (TUAT - gio) % 12
    van_khuc = (THIN + gio) % 12
    loc_ton = _LOC_TON[can_nam]
    khoi, viet = _KHOI_VIET[can_nam]
    nhom = _nhom_tam_hop(chi_nam)
    hoa_khoi = (DAN, SUU, MAO, DAU)[nhom]
    linh_khoi = (TUAT, MAO, TUAT, TUAT)[nhom]
    hoa_tinh = (hoa_khoi + gio) % 12 if thuan else (hoa_khoi - gio) % 12
    # Linh Tinh đếm ngược chiều Hỏa Tinh (quy ước phổ biến; một số phái đếm cùng chiều)
    linh_tinh = (linh_khoi - gio) % 12 if thuan else (linh_khoi + gio) % 12
    hong_loan = (MAO - chi_nam) % 12
    thien_rieu = (SUU + thang - 1) % 12
    return {
        "Tả Phù": ta_phu,
        "Hữu Bật": huu_bat,
        "Văn Xương": van_xuong,
        "Văn Khúc": van_khuc,
        "Lộc Tồn": loc_ton,
        "Kình Dương": (loc_ton + 1) % 12,
        "Đà La": (loc_ton - 1) % 12,
        "Thiên Khôi": khoi,
        "Thiên Việt": viet,
        "Địa Kiếp": (HOI + gio) % 12,
        "Địa Không": (HOI - gio) % 12,
        "Hỏa Tinh": hoa_tinh,
        "Linh Tinh": linh_tinh,
        "Thiên Mã": (DAN, THAN, HOI, TY_)[nhom],
        "Hồng Loan": hong_loan,
        "Thiên Hỷ": (hong_loan + 6) % 12,
        "Long Trì": (THIN + chi_nam) % 12,
        "Phượng Các": (TUAT - chi_nam) % 12,
        "Thiên Khốc": (NGO - chi_nam) % 12,
        "Thiên Hư": (NGO + chi_nam) % 12,
        "Thiên Hình": (DAU + thang - 1) % 12,
        "Thiên Riêu": thien_rieu,
        "Thiên Y": thien_rieu,
        "Tam Thai": (ta_phu + ngay - 1) % 12,
        "Bát Tọa": (huu_bat - (ngay - 1)) % 12,
        "Ân Quang": (van_xuong + ngay - 2) % 12,
        "Thiên Quý": (van_khuc + ngay - 2) % 12,
        "Thiên Tài": (menh + chi_nam) % 12,
        "Thiên Thọ": (than + chi_nam) % 12,
        "Đào Hoa": (DAU, MAO, NGO, TY)[nhom],
        "Hoa Cái": (THIN, TUAT, SUU, MUI)[nhom],
        "Cô Thần": _co_than_qua_tu(chi_nam)[0],
        "Quả Tú": _co_than_qua_tu(chi_nam)[1],
    }


def _co_than_qua_tu(chi_nam: int) -> tuple[int, int]:
    if chi_nam in (HOI, TY, SUU):
        return DAN, TUAT
    if chi_nam in (DAN, MAO, THIN):
        return TY_, SUU
    if chi_nam in (TY_, NGO, MUI):
        return THAN, THIN
    return HOI, MUI


@dataclass
class Sao:
    ten: str
    hoa: str | None = None

    def to_dict(self) -> dict[str, str | None]:
        return {"ten": self.ten, "hoa": self.hoa}


@dataclass
class Cung:
    chi: int
    can: int
    ten_cung: str
    chinh_tinh: list[Sao]
    phu_tinh: list[Sao]
    dai_han_tu: int
    truong_sinh: str
    thai_tue: str
    bac_si: str
    la_than: bool
    tuan: bool
    triet: bool

    def to_dict(self) -> dict[str, object]:
        return {
            "chi": CHI[self.chi],
            "can": CAN[self.can],
            "ten_cung": self.ten_cung,
            "chinh_tinh": [s.to_dict() for s in self.chinh_tinh],
            "phu_tinh": [s.to_dict() for s in self.phu_tinh],
            "dai_han": {"tu": self.dai_han_tu, "den": self.dai_han_tu + 9},
            "truong_sinh": self.truong_sinh,
            "thai_tue": self.thai_tue,
            "bac_si": self.bac_si,
            "la_than": self.la_than,
            "tuan": self.tuan,
            "triet": self.triet,
        }


@dataclass
class LaSo:
    ho_ten: str
    gioi_tinh: GioiTinh
    duong_lich: date
    gio: int
    am_lich: NgayAm
    nam: CanChi
    menh_nap_am: str
    am_duong: str
    cuc: Cuc
    cung_menh: int
    cung_than: int
    chieu_dai_han: str
    cung: list[Cung]

    def to_dict(self) -> dict[str, object]:
        return {
            "ho_ten": self.ho_ten,
            "gioi_tinh": self.gioi_tinh,
            "duong_lich": {
                "ngay": self.duong_lich.day,
                "thang": self.duong_lich.month,
                "nam": self.duong_lich.year,
                "gio": self.gio,
                "gio_chi": CHI[chi_gio(self.gio)],
            },
            "am_lich": {
                "ngay": self.am_lich.ngay,
                "thang": self.am_lich.thang,
                "nam": self.am_lich.nam,
                "nhuan": self.am_lich.nhuan,
            },
            "can_chi_nam": self.nam.ten,
            "nap_am": self.menh_nap_am,
            "am_duong": self.am_duong,
            "cuc": f"{_TEN_CUC[self.cuc]} {self.cuc.value} Cục",
            "cung_menh": CHI[self.cung_menh],
            "cung_than": CHI[self.cung_than],
            "than_cu": CUNG_CHUC[(self.cung_than - self.cung_menh) % 12],
            "chieu_dai_han": self.chieu_dai_han,
            "cung": [c.to_dict() for c in self.cung],
        }


_TEN_CUC = {
    Cuc.THUY_NHI: "Thủy Nhị",
    Cuc.MOC_TAM: "Mộc Tam",
    Cuc.KIM_TU: "Kim Tứ",
    Cuc.THO_NGU: "Thổ Ngũ",
    Cuc.HOA_LUC: "Hỏa Lục",
}


def thang_an_cung(am: NgayAm) -> int:
    """Tháng dùng để an Mệnh/Thân. Tháng nhuận: ngày 1-15 tính tháng đó, 16-30 tính tháng sau."""
    if am.nhuan and am.ngay > 15:
        return am.thang % 12 + 1
    return am.thang


def lap_la_so(
    *,
    ho_ten: str,
    gioi_tinh: GioiTinh,
    ngay: int,
    thang: int,
    nam: int,
    gio: int,
    am_lich: bool = False,
    nhuan: bool = False,
) -> LaSo:
    """Lập lá số từ ngày sinh dương lịch (mặc định) hoặc âm lịch và giờ sinh 0..23."""
    if gioi_tinh not in ("nam", "nu"):
        raise ValueError("Giới tính phải là 'nam' hoặc 'nu'")
    if am_lich:
        duong = am_sang_duong(ngay, thang, nam, nhuan)
        am = NgayAm(ngay, thang, nam, nhuan)
    else:
        duong = date(nam, thang, ngay)
        am = duong_sang_am(ngay, thang, nam)

    chi_g = chi_gio(gio)
    nam_cc = can_chi_nam(am.nam)
    duong_nam = nam_cc.can % 2 == 0
    thuan = duong_nam == (gioi_tinh == "nam")
    thang_ac = thang_an_cung(am)

    menh, than = an_cung_menh_than(thang_ac, chi_g)
    cuc = tinh_cuc(nam_cc.can, menh)

    chinh = an_chinh_tinh(cuc.value, am.ngay)
    phu = an_phu_tinh(
        can_nam=nam_cc.can, chi_nam=nam_cc.chi, thang=thang_ac, ngay=am.ngay,
        gio=chi_g, menh=menh, than=than, thuan=thuan,
    )  # fmt: skip
    hoa_cua = dict(zip(_TU_HOA[nam_cc.can], _HOA, strict=True))

    buoc = 1 if thuan else -1
    ts_khoi = _TRUONG_SINH_KHOI[cuc]
    loc_ton = phu["Lộc Tồn"]

    # Tuần: cặp Chi "vắng" của giáp chứa năm sinh
    giap_khoi = (nam_cc.chi - nam_cc.can) % 12
    tuan = {(giap_khoi + 10) % 12, (giap_khoi + 11) % 12}
    triet = set(_TRIET[nam_cc.can])

    sao_chinh: list[list[Sao]] = [[] for _ in range(12)]
    sao_phu: list[list[Sao]] = [[] for _ in range(12)]
    for ten, vt in chinh.items():
        sao_chinh[vt].append(Sao(ten, hoa_cua.get(ten)))
    for ten, vt in phu.items():
        sao_phu[vt].append(Sao(ten, hoa_cua.get(ten)))

    cung: list[Cung] = []
    for chi in range(12):
        i = (chi - menh) % 12  # thứ tự cung chức tính từ Mệnh theo chiều thuận
        # Đại hạn: cung Mệnh khởi tuổi = Cục, đi theo `buoc`
        dh_idx = ((chi - menh) * buoc) % 12
        cung.append(
            Cung(
                chi=chi,
                can=can_cung(nam_cc.can, chi),
                ten_cung=CUNG_CHUC[i],
                chinh_tinh=sao_chinh[chi],
                phu_tinh=sao_phu[chi],
                dai_han_tu=cuc.value + 10 * dh_idx,
                truong_sinh=TRUONG_SINH[((chi - ts_khoi) * buoc) % 12],
                thai_tue=THAI_TUE[(chi - nam_cc.chi) % 12],
                bac_si=VONG_LOC_TON[((chi - loc_ton) * buoc) % 12],
                la_than=chi == than,
                tuan=chi in tuan,
                triet=chi in triet,
            )
        )

    return LaSo(
        ho_ten=ho_ten.strip(),
        gioi_tinh=gioi_tinh,
        duong_lich=duong,
        gio=gio,
        am_lich=am,
        nam=nam_cc,
        menh_nap_am=nap_am(nam_cc),
        am_duong="Dương" if duong_nam else "Âm",
        cuc=cuc,
        cung_menh=menh,
        cung_than=than,
        chieu_dai_han="Thuận" if thuan else "Nghịch",
        cung=cung,
    )
