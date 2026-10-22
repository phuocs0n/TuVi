import pytest

from laso_engine import lap_la_so
from laso_engine.tuvi import an_chinh_tinh, thang_an_cung, vi_tri_tu_vi

TY, SUU, DAN, MAO, THIN, TY_, NGO, MUI, THAN, DAU, TUAT, HOI = range(12)

CHINH_TINH = {
    "Tử Vi", "Thiên Cơ", "Thái Dương", "Vũ Khúc", "Thiên Đồng", "Liêm Trinh", "Thiên Phủ",
    "Thái Âm", "Tham Lang", "Cự Môn", "Thiên Tướng", "Thiên Lương", "Thất Sát", "Phá Quân",
}  # fmt: skip


@pytest.mark.parametrize(
    ("cuc", "ngay", "vi_tri"),
    [
        (2, 1, SUU), (2, 2, DAN), (2, 3, DAN), (2, 4, MAO),
        (3, 1, THIN), (3, 3, DAN), (3, 6, MAO),
        (4, 1, HOI), (4, 4, DAN),
        (5, 1, NGO), (5, 5, DAN),
        (6, 1, DAU), (6, 6, DAN),
    ],
)  # fmt: skip
def test_vi_tri_tu_vi_theo_bang_chuan(cuc: int, ngay: int, vi_tri: int) -> None:
    assert vi_tri_tu_vi(cuc, ngay) == vi_tri


@pytest.mark.parametrize("cuc", [2, 3, 4, 5, 6])
def test_14_chinh_tinh_moi_sao_mot_cung_va_phu_hop_chom(cuc: int) -> None:
    for ngay in range(1, 31):
        vt = an_chinh_tinh(cuc, ngay)
        assert set(vt) == CHINH_TINH
        assert all(0 <= v < 12 for v in vt.values())
        # Tử Vi - Thiên Phủ đối xứng qua trục Dần - Thân
        assert (vt["Tử Vi"] + vt["Thiên Phủ"]) % 12 == 4
        # Tử Vi tại Tý thì Liêm Trinh ở Thìn, Thiên Cơ ở Hợi
        if vt["Tử Vi"] == TY:
            assert vt["Liêm Trinh"] == THIN
            assert vt["Thiên Cơ"] == HOI


def test_thang_nhuan_chia_doi_o_ngay_15() -> None:
    from laso_engine import NgayAm

    assert thang_an_cung(NgayAm(15, 6, 2025, True)) == 6
    assert thang_an_cung(NgayAm(16, 6, 2025, True)) == 7
    assert thang_an_cung(NgayAm(20, 12, 2025, True)) == 1
    assert thang_an_cung(NgayAm(20, 6, 2025, False)) == 6


def _la_so_mau() -> dict[str, object]:
    return lap_la_so(
        ho_ten="Nguyễn Văn A", gioi_tinh="nam", ngay=15, thang=3, nam=1990, gio=6
    ).to_dict()


def test_la_so_mau_thong_tin_co_ban() -> None:
    ls = _la_so_mau()
    assert ls["can_chi_nam"] == "Canh Ngọ"
    assert ls["am_duong"] == "Dương"
    assert ls["nap_am"] == "Thổ"
    assert ls["chieu_dai_han"] == "Thuận"  # dương nam
    assert len(ls["cung"]) == 12  # type: ignore[arg-type]


def test_la_so_moi_chinh_tinh_va_phu_tinh_xuat_hien_dung_mot_lan() -> None:
    ls = lap_la_so(ho_ten="A", gioi_tinh="nu", ngay=1, thang=1, nam=2000, gio=23)
    chinh = [s.ten for c in ls.cung for s in c.chinh_tinh]
    assert sorted(chinh) == sorted(CHINH_TINH)
    phu = [s.ten for c in ls.cung for s in c.phu_tinh]
    assert len(phu) == len(set(phu))
    assert {"Tả Phù", "Hữu Bật", "Văn Xương", "Văn Khúc", "Lộc Tồn", "Kình Dương"} <= set(phu)


def test_cung_menh_than_va_ten_cung() -> None:
    ls = lap_la_so(ho_ten="A", gioi_tinh="nam", ngay=1, thang=1, nam=1990, gio=0, am_lich=True)
    # Tháng Giêng âm lịch (Dần), giờ Tý: Mệnh và Thân cùng ở Dần
    assert ls.cung_menh == DAN == ls.cung_than
    ten = {c.chi: c.ten_cung for c in ls.cung}
    assert ten[DAN] == "Mệnh"
    assert ten[MAO] == "Phụ Mẫu"
    assert ten[THAN] == "Thiên Di"  # đối cung Mệnh
    assert ten[SUU] == "Huynh Đệ"
    assert [c.la_than for c in ls.cung].count(True) == 1


def test_tu_hoa_gan_dung_sao_theo_can_nam() -> None:
    # Năm Giáp (1984): Liêm Trinh Lộc, Phá Quân Quyền, Vũ Khúc Khoa, Thái Dương Kỵ
    ls = lap_la_so(ho_ten="A", gioi_tinh="nam", ngay=10, thang=6, nam=1984, gio=10)
    hoa = {s.ten: s.hoa for c in ls.cung for s in c.chinh_tinh if s.hoa}
    assert hoa == {
        "Liêm Trinh": "Lộc",
        "Phá Quân": "Quyền",
        "Vũ Khúc": "Khoa",
        "Thái Dương": "Kỵ",
    }


def test_dai_han_thuan_nghich() -> None:
    nam_duong = lap_la_so(ho_ten="A", gioi_tinh="nam", ngay=10, thang=6, nam=1990, gio=10)
    nu_duong = lap_la_so(ho_ten="A", gioi_tinh="nu", ngay=10, thang=6, nam=1990, gio=10)
    assert nam_duong.chieu_dai_han == "Thuận"
    assert nu_duong.chieu_dai_han == "Nghịch"
    for ls in (nam_duong, nu_duong):
        menh = ls.cung[ls.cung_menh]
        assert menh.dai_han_tu == ls.cuc.value
        tuoi = sorted(c.dai_han_tu for c in ls.cung)
        assert tuoi == [ls.cuc.value + 10 * i for i in range(12)]
    # thuận: cung liền sau Mệnh là hạn kế tiếp; nghịch: cung liền trước
    assert nam_duong.cung[(nam_duong.cung_menh + 1) % 12].dai_han_tu == nam_duong.cuc.value + 10
    assert nu_duong.cung[(nu_duong.cung_menh - 1) % 12].dai_han_tu == nu_duong.cuc.value + 10


def test_tuan_triet_moi_loai_hai_cung() -> None:
    ls = lap_la_so(ho_ten="A", gioi_tinh="nam", ngay=10, thang=6, nam=1990, gio=10)
    assert sum(c.tuan for c in ls.cung) == 2
    assert sum(c.triet for c in ls.cung) == 2
    # Can Canh: Triệt ở Ngọ-Mùi. Canh Ngọ thuộc tuần Giáp Tý (Giáp Tý..Quý Dậu) nên Tuần ở Tuất-Hợi
    triet = {c.chi for c in ls.cung if c.triet}
    assert triet == {NGO, MUI}
    tuan = {c.chi for c in ls.cung if c.tuan}
    assert tuan == {TUAT, HOI}


def test_nhap_am_lich_va_gio_ty() -> None:
    a = lap_la_so(ho_ten="A", gioi_tinh="nam", ngay=1, thang=1, nam=2024, gio=23, am_lich=True)
    assert a.duong_lich.isoformat() == "2024-02-10"
    assert a.am_lich.nam == 2024


def test_gioi_tinh_khong_hop_le() -> None:
    with pytest.raises(ValueError):
        lap_la_so(ho_ten="A", gioi_tinh="khac", ngay=1, thang=1, nam=2000, gio=1)  # type: ignore[arg-type]
