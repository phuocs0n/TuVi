/**
 * An lá số Tử Vi Đẩu Số: 12 cung, 14 chính tinh, phụ tinh, Tứ Hóa, Đại hạn.
 * Bản chuyển từ packages/laso-engine/src/laso_engine/{laso,tuvi}.py. Mọi vị trí là chỉ số Địa Chi 0..11
 * (Tý = 0 ... Hợi = 11). Khi sửa công thức: sửa bản Python trước, rồi chạy lại
 * `uv run python packages/laso-engine/tests/golden_gen.py` để cập nhật golden.json và sửa bản này cho khớp.
 */
import type { Cung, LaSo, LaSoRequest, Sao } from "@tuvi/shared-types";

import { amSangDuong, duongSangAm, mod, type NgayAm } from "./amlich";
import { CAN, CHI, canChiNam, chiGio, napAm, tenCanChi } from "./canchi";
import { LaSoError } from "./errors";

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

/** Cục: giá trị số 2..6 và tên. */
const TEN_CUC: Record<number, string> = {
  2: "Thủy Nhị",
  3: "Mộc Tam",
  4: "Kim Tứ",
  5: "Thổ Ngũ",
  6: "Hỏa Lục",
};
const CUC_THEO_HANH: Record<string, number> = { Thủy: 2, Mộc: 3, Kim: 4, Thổ: 5, Hỏa: 6 };
const TRUONG_SINH_KHOI: Record<number, number> = { 2: THAN, 5: THAN, 3: HOI, 4: TY_, 6: DAN };

const LOC_TON = [DAN, MAO, TY_, NGO, TY_, NGO, THAN, DAU, HOI, TY];
// Thiên Khôi, Thiên Việt theo Can năm ("Giáp Mậu Canh ngưu dương ...")
const KHOI_VIET: [number, number][] = [
  [SUU, MUI], [TY, THAN], [HOI, DAU], [HOI, DAU], [SUU, MUI],
  [TY, THAN], [SUU, MUI], [NGO, DAN], [MAO, TY_], [MAO, TY_],
];
// Tứ Hóa theo Can năm: Lộc, Quyền, Khoa, Kỵ
const TU_HOA: string[][] = [
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

function canCung(canNam: number, cung: number): number {
  const canDan = ((canNam % 5) * 2 + 2) % 10;
  return (canDan + mod(cung - DAN, 12)) % 10;
}

/** Vị trí sao Tử Vi theo Cục và ngày sinh âm lịch. */
export function viTriTuVi(cuc: number, ngayAm: number): number {
  const x = mod(-ngayAm, cuc);
  const q = Math.floor((ngayAm + x) / cuc);
  const vt = DAN + q - 1;
  return mod(x % 2 ? vt - x : vt + x, 12);
}

/** Vị trí 14 chính tinh, theo đúng thứ tự an sao ở bản Python. */
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

interface PhuTinhIn {
  canNam: number;
  chiNam: number;
  thang: number;
  ngay: number;
  gio: number;
  menh: number;
  than: number;
  thuan: boolean;
}

/** Vị trí các phụ tinh. `thang` là tháng dùng để an cung (đã xử lý nhuận), `gio` là chỉ số chi giờ. */
function anPhuTinh(p: PhuTinhIn): [string, number][] {
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
export function thangAnCung(am: NgayAm): number {
  return am.nhuan && am.ngay > 15 ? (am.thang % 12) + 1 : am.thang;
}

/** Lập lá số từ ngày sinh dương lịch (mặc định) hoặc âm lịch và giờ sinh 0..23. */
export function lapLaSo(req: LaSoRequest): LaSo {
  if (req.gioi_tinh !== "nam" && req.gioi_tinh !== "nu") {
    throw new LaSoError("Giới tính phải là 'nam' hoặc 'nu'");
  }
  let duong: { ngay: number; thang: number; nam: number };
  let am: NgayAm;
  if (req.lich === "am") {
    duong = amSangDuong(req.ngay, req.thang, req.nam, req.nhuan);
    am = { ngay: req.ngay, thang: req.thang, nam: req.nam, nhuan: req.nhuan };
  } else {
    am = duongSangAm(req.ngay, req.thang, req.nam);
    duong = { ngay: req.ngay, thang: req.thang, nam: req.nam };
  }

  const chiG = chiGio(req.gio);
  const namCC = canChiNam(am.nam);
  const duongNam = namCC.can % 2 === 0;
  const thuan = duongNam === (req.gioi_tinh === "nam");
  const thangAc = thangAnCung(am);

  // Mệnh: từ Dần đếm thuận đến tháng sinh, rồi đếm nghịch đến giờ sinh; Thân đếm thuận.
  const cungThang = DAN + thangAc - 1;
  const menh = mod(cungThang - chiG, 12);
  const than = mod(cungThang + chiG, 12);
  // Cục = hành nạp âm của Can Chi cung Mệnh
  const cuc = CUC_THEO_HANH[napAm({ can: canCung(namCC.can, menh), chi: menh })];

  const chinh = anChinhTinh(cuc, am.ngay);
  const phu = anPhuTinh({
    canNam: namCC.can, chiNam: namCC.chi, thang: thangAc, ngay: am.ngay, gio: chiG, menh, than, thuan,
  });
  const hoaCua = new Map<string, Sao["hoa"]>(TU_HOA[namCC.can].map((ten, i) => [ten, HOA[i]]));

  const buoc = thuan ? 1 : -1;
  const tsKhoi = TRUONG_SINH_KHOI[cuc];
  const locTon = phu.find(([ten]) => ten === "Lộc Tồn")![1];

  // Tuần: cặp Chi "vắng" của giáp chứa năm sinh
  const giapKhoi = mod(namCC.chi - namCC.can, 12);
  const tuan = new Set([mod(giapKhoi + 10, 12), mod(giapKhoi + 11, 12)]);
  const triet = new Set(TRIET[namCC.can]);

  const saoChinh: Sao[][] = Array.from({ length: 12 }, () => []);
  const saoPhu: Sao[][] = Array.from({ length: 12 }, () => []);
  for (const [ten, vt] of chinh) saoChinh[vt].push({ ten, hoa: hoaCua.get(ten) ?? null });
  for (const [ten, vt] of phu) saoPhu[vt].push({ ten, hoa: hoaCua.get(ten) ?? null });

  const cung: Cung[] = Array.from({ length: 12 }, (_, chi) => {
    const daiHanTu = cuc + 10 * mod((chi - menh) * buoc, 12);
    return {
      chi: CHI[chi],
      can: CAN[canCung(namCC.can, chi)],
      ten_cung: CUNG_CHUC[mod(chi - menh, 12)],
      chinh_tinh: saoChinh[chi],
      phu_tinh: saoPhu[chi],
      dai_han: { tu: daiHanTu, den: daiHanTu + 9 },
      truong_sinh: TRUONG_SINH[mod((chi - tsKhoi) * buoc, 12)],
      thai_tue: THAI_TUE[mod(chi - namCC.chi, 12)],
      bac_si: VONG_LOC_TON[mod((chi - locTon) * buoc, 12)],
      la_than: chi === than,
      tuan: tuan.has(chi),
      triet: triet.has(chi),
    };
  });

  return {
    ho_ten: req.ho_ten.trim(),
    gioi_tinh: req.gioi_tinh,
    duong_lich: { ngay: duong.ngay, thang: duong.thang, nam: duong.nam, gio: req.gio, gio_chi: CHI[chiG] },
    am_lich: { ngay: am.ngay, thang: am.thang, nam: am.nam, nhuan: am.nhuan },
    can_chi_nam: tenCanChi(namCC),
    nap_am: napAm(namCC),
    am_duong: duongNam ? "Dương" : "Âm",
    cuc: `${TEN_CUC[cuc]} ${cuc} Cục`,
    cung_menh: CHI[menh],
    cung_than: CHI[than],
    than_cu: CUNG_CHUC[mod(than - menh, 12)],
    chieu_dai_han: thuan ? "Thuận" : "Nghịch",
    cung,
  };
}
