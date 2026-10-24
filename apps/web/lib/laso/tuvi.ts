/**
 * An lá số Tử Vi Đẩu Số đầy đủ: 12 cung, 14 chính tinh, phụ tinh, Tứ Hóa, Đại hạn.
 * Bản TypeScript của packages/laso-engine (laso.py + tuvi.py) để web tự an lá số ngay
 * trên trình duyệt, không cần gọi API. Kết quả phải khớp `LaSo.to_dict()` của bản Python.
 *
 * Mọi vị trí là chỉ số Địa Chi 0..11 (Tý = 0 ... Hợi = 11).
 */

import type { Cung, LaSo, LaSoRequest, Sao } from "@tuvi/shared-types";

import { type NgayAm, amSangDuong, duongSangAm, ngayDuongHopLe } from "./amlich";
import { CAN, CHI, canChiNam, chiGio, mod, napAm, tenCanChi } from "./canchi";

const [TY, SUU, DAN, MAO, THIN, TY_, NGO, MUI, THAN, DAU, TUAT, HOI] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

const CUNG_CHUC = [
  "Mệnh", "Phụ Mẫu", "Phúc Đức", "Điền Trạch", "Quan Lộc", "Nô Bộc",
  "Thiên Di", "Tật Ách", "Tài Bạch", "Tử Tức", "Phu Thê", "Huynh Đệ",
];

const TRUONG_SINH = [
  "Trường Sinh", "Mộc Dục", "Quan Đới", "Lâm Quan", "Đế Vượng", "Suy",
  "Bệnh", "Tử", "Mộ", "Tuyệt", "Thai", "Dưỡng",
];

const THAI_TUE = [
  "Thái Tuế", "Thiếu Dương", "Tang Môn", "Thiếu Âm", "Quan Phù", "Tử Phù",
  "Tuế Phá", "Long Đức", "Bạch Hổ", "Phúc Đức", "Điếu Khách", "Trực Phù",
];

const VONG_LOC_TON = [
  "Bác Sĩ", "Lực Sĩ", "Thanh Long", "Tiểu Hao", "Tướng Quân", "Tấu Thư",
  "Phi Liêm", "Hỷ Thần", "Bệnh Phù", "Đại Hao", "Phục Binh", "Quan Phủ",
];

/** Cục (2..6): tên theo hành và vị trí khởi Trường Sinh. */
const CUC_THEO_HANH: Record<string, number> = { Thủy: 2, Mộc: 3, Kim: 4, Thổ: 5, Hỏa: 6 };
const TEN_CUC: Record<number, string> = { 2: "Thủy Nhị", 3: "Mộc Tam", 4: "Kim Tứ", 5: "Thổ Ngũ", 6: "Hỏa Lục" };
const TRUONG_SINH_KHOI: Record<number, number> = { 2: THAN, 5: THAN, 3: HOI, 4: TY_, 6: DAN };

const LOC_TON = [DAN, MAO, TY_, NGO, TY_, NGO, THAN, DAU, HOI, TY];

// Thiên Khôi, Thiên Việt theo Can năm ("Giáp Mậu Canh ngưu dương ...")
const KHOI_VIET: [number, number][] = [
  [SUU, MUI], [TY, THAN], [HOI, DAU], [HOI, DAU], [SUU, MUI],
  [TY, THAN], [SUU, MUI], [NGO, DAN], [MAO, TY_], [MAO, TY_],
];

// Tứ Hóa theo Can năm: (Lộc, Quyền, Khoa, Kỵ)
const TU_HOA = [
  ["Liêm Trinh", "Phá Quân", "Vũ Khúc", "Thái Dương"],
  ["Thiên Cơ", "Thiên Lương", "Tử Vi", "Thái Âm"],
  ["Thiên Đồng", "Thiên Cơ", "Văn Xương", "Liêm Trinh"],
  ["Thái Âm", "Thiên Đồng", "Thiên Cơ", "Cự Môn"],
  ["Tham Lang", "Thái Âm", "Hữu Bật", "Thiên Cơ"],
  ["Vũ Khúc", "Tham Lang", "Thiên Lương", "Văn Khúc"],
  ["Thái Dương", "Vũ Khúc", "Thái Âm", "Thiên Đồng"],
  ["Cự Môn", "Thái Dương", "Văn Khúc", "Văn Xương"],
  ["Thiên Lương", "Tử Vi", "Tả Phù", "Vũ Khúc"],
  ["Phá Quân", "Cự Môn", "Thái Âm", "Tham Lang"],
];
const HOA = ["Lộc", "Quyền", "Khoa", "Kỵ"] as const;

// Triệt (Lộ Không) theo Can năm
const TRIET: [number, number][] = [
  [THAN, DAU], [NGO, MUI], [THIN, TY_], [DAN, MAO], [TY, SUU],
  [THAN, DAU], [NGO, MUI], [THIN, TY_], [DAN, MAO], [TY, SUU],
];

/** 0: Thân-Tý-Thìn, 1: Dần-Ngọ-Tuất, 2: Tỵ-Dậu-Sửu, 3: Hợi-Mão-Mùi. */
function nhomTamHop(chi: number): number {
  if ([THAN, TY, THIN].includes(chi)) return 0;
  if ([DAN, NGO, TUAT].includes(chi)) return 1;
  if ([TY_, DAU, SUU].includes(chi)) return 2;
  return 3;
}

function coThanQuaTu(chiNam: number): [number, number] {
  if ([HOI, TY, SUU].includes(chiNam)) return [DAN, TUAT];
  if ([DAN, MAO, THIN].includes(chiNam)) return [TY_, SUU];
  if ([TY_, NGO, MUI].includes(chiNam)) return [THAN, THIN];
  return [HOI, MUI];
}

/** Từ Dần đếm thuận đến tháng sinh, rồi Mệnh đếm nghịch / Thân đếm thuận đến giờ sinh. */
function anCungMenhThan(thangAm: number, chiGioSinh: number): [number, number] {
  const cungThang = DAN + thangAm - 1;
  return [mod(cungThang - chiGioSinh, 12), mod(cungThang + chiGioSinh, 12)];
}

/** Can của một cung theo Ngũ hổ độn (Giáp/Kỷ khởi Bính Dần, ...). */
function canCung(canNam: number, cung: number): number {
  const canDan = ((canNam % 5) * 2 + 2) % 10;
  return (canDan + mod(cung - DAN, 12)) % 10;
}

/** Cục = hành nạp âm của Can Chi cung Mệnh. */
const tinhCuc = (canNam: number, cungMenh: number): number =>
  CUC_THEO_HANH[napAm({ can: canCung(canNam, cungMenh), chi: cungMenh })];

/** Vị trí sao Tử Vi theo Cục và ngày sinh âm lịch. */
function viTriTuVi(cuc: number, ngayAm: number): number {
  const x = mod(-ngayAm, cuc);
  const q = Math.floor((ngayAm + x) / cuc);
  const vt = DAN + q - 1;
  return mod(x % 2 ? vt - x : vt + x, 12);
}

/** Vị trí 14 chính tinh. */
function anChinhTinh(cuc: number, ngayAm: number): [string, number][] {
  const tv = viTriTuVi(cuc, ngayAm);
  const tp = mod(4 - tv, 12);
  return [
    ["Tử Vi", tv],
    ["Thiên Cơ", mod(tv - 1, 12)],
    ["Thái Dương", mod(tv - 3, 12)],
    ["Vũ Khúc", mod(tv - 4, 12)],
    ["Thiên Đồng", mod(tv - 5, 12)],
    ["Liêm Trinh", mod(tv - 8, 12)],
    ["Thiên Phủ", tp],
    ["Thái Âm", mod(tp + 1, 12)],
    ["Tham Lang", mod(tp + 2, 12)],
    ["Cự Môn", mod(tp + 3, 12)],
    ["Thiên Tướng", mod(tp + 4, 12)],
    ["Thiên Lương", mod(tp + 5, 12)],
    ["Thất Sát", mod(tp + 6, 12)],
    ["Phá Quân", mod(tp + 10, 12)],
  ];
}

/** Vị trí các phụ tinh. `thang` là tháng dùng để an cung (đã xử lý nhuận), `gio` là chi giờ. */
function anPhuTinh(p: {
  canNam: number;
  chiNam: number;
  thang: number;
  ngay: number;
  gio: number;
  menh: number;
  than: number;
  thuan: boolean;
}): [string, number][] {
  const { canNam, chiNam, thang, ngay, gio, menh, than, thuan } = p;
  const taPhu = mod(THIN + thang - 1, 12);
  const huuBat = mod(TUAT - (thang - 1), 12);
  const vanXuong = mod(TUAT - gio, 12);
  const vanKhuc = mod(THIN + gio, 12);
  const locTon = LOC_TON[canNam];
  const [khoi, viet] = KHOI_VIET[canNam];
  const nhom = nhomTamHop(chiNam);
  const hoaKhoi = [DAN, SUU, MAO, DAU][nhom];
  const linhKhoi = [TUAT, MAO, TUAT, TUAT][nhom];
  const hoaTinh = thuan ? mod(hoaKhoi + gio, 12) : mod(hoaKhoi - gio, 12);
  // Linh Tinh đếm ngược chiều Hỏa Tinh (quy ước phổ biến; một số phái đếm cùng chiều)
  const linhTinh = thuan ? mod(linhKhoi - gio, 12) : mod(linhKhoi + gio, 12);
  const hongLoan = mod(MAO - chiNam, 12);
  const thienRieu = mod(SUU + thang - 1, 12);
  const [coThan, quaTu] = coThanQuaTu(chiNam);
  return [
    ["Tả Phù", taPhu],
    ["Hữu Bật", huuBat],
    ["Văn Xương", vanXuong],
    ["Văn Khúc", vanKhuc],
    ["Lộc Tồn", locTon],
    ["Kình Dương", mod(locTon + 1, 12)],
    ["Đà La", mod(locTon - 1, 12)],
    ["Thiên Khôi", khoi],
    ["Thiên Việt", viet],
    ["Địa Kiếp", mod(HOI + gio, 12)],
    ["Địa Không", mod(HOI - gio, 12)],
    ["Hỏa Tinh", hoaTinh],
    ["Linh Tinh", linhTinh],
    ["Thiên Mã", [DAN, THAN, HOI, TY_][nhom]],
    ["Hồng Loan", hongLoan],
    ["Thiên Hỷ", mod(hongLoan + 6, 12)],
    ["Long Trì", mod(THIN + chiNam, 12)],
    ["Phượng Các", mod(TUAT - chiNam, 12)],
    ["Thiên Khốc", mod(NGO - chiNam, 12)],
    ["Thiên Hư", mod(NGO + chiNam, 12)],
    ["Thiên Hình", mod(DAU + thang - 1, 12)],
    ["Thiên Riêu", thienRieu],
    ["Thiên Y", thienRieu],
    ["Tam Thai", mod(taPhu + ngay - 1, 12)],
    ["Bát Tọa", mod(huuBat - (ngay - 1), 12)],
    ["Ân Quang", mod(vanXuong + ngay - 2, 12)],
    ["Thiên Quý", mod(vanKhuc + ngay - 2, 12)],
    ["Thiên Tài", mod(menh + chiNam, 12)],
    ["Thiên Thọ", mod(than + chiNam, 12)],
    ["Đào Hoa", [DAU, MAO, NGO, TY][nhom]],
    ["Hoa Cái", [THIN, TUAT, SUU, MUI][nhom]],
    ["Cô Thần", coThan],
    ["Quả Tú", quaTu],
  ];
}

/** Tháng dùng để an Mệnh/Thân. Tháng nhuận: ngày 1-15 tính tháng đó, 16-30 tính tháng sau. */
const thangAnCung = (am: NgayAm): number => (am.nhuan && am.ngay > 15 ? (am.thang % 12) + 1 : am.thang);

/** Kiểm tra đầu vào giống `LaSoRequest` (pydantic) ở apps/api. */
function kiemTra(req: LaSoRequest): void {
  const trongKhoang = (v: number, lo: number, hi: number) => Number.isInteger(v) && v >= lo && v <= hi;
  if (
    !["nam", "nu"].includes(req.gioi_tinh) ||
    req.ho_ten.length > 100 ||
    !trongKhoang(req.ngay, 1, 31) ||
    !trongKhoang(req.thang, 1, 12) ||
    !trongKhoang(req.nam, 1900, 2100) ||
    !trongKhoang(req.gio, 0, 23)
  ) {
    throw new RangeError("Thông tin nhập chưa hợp lệ, vui lòng kiểm tra lại.");
  }
}

/** Lập lá số từ ngày sinh dương lịch (mặc định) hoặc âm lịch và giờ sinh 0..23. */
export function lapLaSo(req: LaSoRequest): LaSo {
  kiemTra(req);
  const { ngay, thang, nam, gio, gioi_tinh: gioiTinh } = req;
  let duong: { ngay: number; thang: number; nam: number };
  let am: NgayAm;
  if (req.lich === "am") {
    duong = amSangDuong(ngay, thang, nam, req.nhuan);
    am = { ngay, thang, nam, nhuan: req.nhuan };
  } else {
    if (!ngayDuongHopLe(ngay, thang, nam)) {
      throw new RangeError(`Ngày dương lịch không hợp lệ: ${ngay}/${thang}/${nam}`);
    }
    duong = { ngay, thang, nam };
    am = duongSangAm(ngay, thang, nam);
  }

  const chiG = chiGio(gio);
  const namCc = canChiNam(am.nam);
  const duongNam = namCc.can % 2 === 0;
  const thuan = duongNam === (gioiTinh === "nam");
  const thangAc = thangAnCung(am);

  const [menh, than] = anCungMenhThan(thangAc, chiG);
  const cuc = tinhCuc(namCc.can, menh);

  const chinh = anChinhTinh(cuc, am.ngay);
  const phu = anPhuTinh({ canNam: namCc.can, chiNam: namCc.chi, thang: thangAc, ngay: am.ngay, gio: chiG, menh, than, thuan });
  const hoaCua = new Map<string, Sao["hoa"]>(TU_HOA[namCc.can].map((ten, i) => [ten, HOA[i]]));

  const buoc = thuan ? 1 : -1;
  const tsKhoi = TRUONG_SINH_KHOI[cuc];
  const locTon = LOC_TON[namCc.can];

  // Tuần: cặp Chi "vắng" của giáp chứa năm sinh
  const giapKhoi = mod(namCc.chi - namCc.can, 12);
  const tuan = [(giapKhoi + 10) % 12, (giapKhoi + 11) % 12];
  const triet = TRIET[namCc.can];

  const saoChinh: Sao[][] = Array.from({ length: 12 }, () => []);
  const saoPhu: Sao[][] = Array.from({ length: 12 }, () => []);
  for (const [ten, vt] of chinh) saoChinh[vt].push({ ten, hoa: hoaCua.get(ten) ?? null });
  for (const [ten, vt] of phu) saoPhu[vt].push({ ten, hoa: hoaCua.get(ten) ?? null });

  const cung: Cung[] = [];
  for (let chi = 0; chi < 12; chi++) {
    // Đại hạn: cung Mệnh khởi tuổi = Cục, đi theo `buoc`
    const dhTu = cuc + 10 * mod((chi - menh) * buoc, 12);
    cung.push({
      chi: CHI[chi],
      can: CAN[canCung(namCc.can, chi)],
      ten_cung: CUNG_CHUC[mod(chi - menh, 12)],
      chinh_tinh: saoChinh[chi],
      phu_tinh: saoPhu[chi],
      dai_han: { tu: dhTu, den: dhTu + 9 },
      truong_sinh: TRUONG_SINH[mod((chi - tsKhoi) * buoc, 12)],
      thai_tue: THAI_TUE[mod(chi - namCc.chi, 12)],
      bac_si: VONG_LOC_TON[mod((chi - locTon) * buoc, 12)],
      la_than: chi === than,
      tuan: tuan.includes(chi),
      triet: triet.includes(chi),
    });
  }

  return {
    ho_ten: req.ho_ten.trim(),
    gioi_tinh: gioiTinh,
    duong_lich: { ngay: duong.ngay, thang: duong.thang, nam: duong.nam, gio, gio_chi: CHI[chiG] },
    am_lich: { ngay: am.ngay, thang: am.thang, nam: am.nam, nhuan: am.nhuan },
    can_chi_nam: tenCanChi(namCc),
    nap_am: napAm(namCc),
    am_duong: duongNam ? "Dương" : "Âm",
    cuc: `${TEN_CUC[cuc]} ${cuc} Cục`,
    cung_menh: CHI[menh],
    cung_than: CHI[than],
    than_cu: CUNG_CHUC[mod(than - menh, 12)],
    chieu_dai_han: thuan ? "Thuận" : "Nghịch",
    cung,
  };
}
