/**
 * Luận giải lá số theo quy tắc (không dùng AI): đọc các sao trong từng cung và ghép
 * ý nghĩa ở lib/luan-giai/sao.ts thành bài viết. Chạy ngay trên trình duyệt.
 */

import type { Cung, LaSo, Sao } from "@tuvi/shared-types";

import {
  CAT_TINH,
  CHINH_TINH,
  DAO_HOA,
  LINH_VUC_CUNG,
  SAO_KHAC,
  SAT_TINH,
  TU_HOA,
  type YNghiaChinhTinh,
} from "./sao";

export interface MucLuanGiai {
  tieu_de: string;
  doan: string[];
}

const SINH: Record<string, string> = { Kim: "Thủy", Thủy: "Mộc", Mộc: "Hỏa", Hỏa: "Thổ", Thổ: "Kim" };
const KHAC: Record<string, string> = { Kim: "Mộc", Mộc: "Thổ", Thổ: "Thủy", Thủy: "Hỏa", Hỏa: "Kim" };

const THAN_CU: Record<string, string> = {
  "Mệnh": "tính cách nhất quán, tự lập; cuộc đời phần lớn do chính mình định đoạt.",
  "Phúc Đức": "coi trọng đời sống tinh thần, được hưởng phúc từ gia đình, dòng họ.",
  "Quan Lộc": "đặt nặng sự nghiệp; càng về sau càng gắn bó với công việc.",
  "Tài Bạch": "thực tế, chú trọng tiền bạc; tài chính là mối quan tâm lớn trong đời.",
  "Phu Thê": "cuộc sống chịu ảnh hưởng nhiều từ người phối ngẫu; hôn nhân là bước ngoặt quan trọng.",
  "Thiên Di": "hay đi xa, hoạt động nhiều bên ngoài; dễ thành công khi rời quê hương.",
};

/** "A", "A và B", "A, B và C" */
function noi(ds: string[]): string {
  if (ds.length <= 1) return ds.join("");
  return `${ds.slice(0, -1).join(", ")} và ${ds[ds.length - 1]}`;
}

const viHoa = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const viThuong = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

const tenSao = (ds: Sao[]) => ds.map((s) => s.ten);

/** Gom các sao cùng ý nghĩa: "Văn Xương, Văn Khúc (thông minh…)" */
function moTaNhom(ds: Sao[], bang: Record<string, string>): string[] {
  const theoYNghia = new Map<string, string[]>();
  for (const s of ds) {
    const y = bang[s.ten];
    if (y) theoYNghia.set(y, [...(theoYNghia.get(y) ?? []), s.ten]);
  }
  return [...theoYNghia].map(([y, ten]) => `${noi(ten)} (${y})`);
}

class DocLaSo {
  constructor(private readonly laSo: LaSo) {}

  cung(tenCung: string): Cung {
    const c = this.laSo.cung.find((x) => x.ten_cung === tenCung);
    if (!c) throw new Error(`Không có cung ${tenCung}`);
    return c;
  }

  private viTri(c: Cung): number {
    return this.laSo.cung.indexOf(c);
  }

  doiCung(c: Cung): Cung {
    return this.laSo.cung[(this.viTri(c) + 6) % 12];
  }

  /** Cung đang xét, hai cung tam hợp và cung xung chiếu */
  tamPhuongTuChinh(c: Cung): Cung[] {
    const i = this.viTri(c);
    return [0, 4, 8, 6].map((d) => this.laSo.cung[(i + d) % 12]);
  }

  /** Chính tinh để luận; cung vô chính diệu thì mượn sao cung xung chiếu. */
  chinhTinh(c: Cung): { sao: Sao[]; muonTu: Cung | null } {
    if (c.chinh_tinh.length) return { sao: c.chinh_tinh, muonTu: null };
    const doi = this.doiCung(c);
    return { sao: doi.chinh_tinh, muonTu: doi };
  }
}

const catSat = (c: Cung) => ({
  cat: c.phu_tinh.filter((s) => s.ten in CAT_TINH),
  sat: c.phu_tinh.filter((s) => s.ten in SAT_TINH),
});

/** Đoạn mở đầu: cung ở đâu, chính tinh nào, ý nghĩa theo lĩnh vực `khoa`. */
function doanChinhTinh(doc: DocLaSo, c: Cung, khoa: keyof YNghiaChinhTinh): string {
  const { sao, muonTu } = doc.chinhTinh(c);
  const viTri = `Cung ${c.ten_cung} an tại ${c.can} ${c.chi}`;
  const yNghia = sao.map((s) => `${s.ten}: ${CHINH_TINH[s.ten][khoa]}`).join(" ");
  if (muonTu) {
    return (
      `${viTri}, vô chính diệu nên mượn ${noi(tenSao(sao))} từ cung ${muonTu.ten_cung} xung chiếu để luận; ` +
      `ảnh hưởng thường nhẹ hơn và dễ thay đổi theo hoàn cảnh. ${yNghia}`
    );
  }
  return `${viTri}, có ${noi(tenSao(sao))} tọa thủ. ${yNghia}`;
}

function doanTuanTriet(c: Cung): string | null {
  if (!c.tuan && !c.triet) return null;
  const ten = c.tuan && c.triet ? "Tuần và Triệt" : c.tuan ? "Tuần" : "Triệt";
  if (c.ten_cung === "Tật Ách") return `${ten} án ngữ ở Tật Ách: thường được xem là giảm nhẹ bệnh tật.`;
  if (c.tuan && c.triet) {
    return "Có cả Tuần và Triệt án ngữ: giai đoạn đầu nhiều trắc trở, thay đổi; nên kiên nhẫn, làm chắc từng bước.";
  }
  return c.tuan
    ? "Bị Tuần án ngữ: giai đoạn đầu dễ trắc trở, chậm mà chắc, càng về sau càng ổn."
    : "Bị Triệt án ngữ: dễ có thay đổi đột ngột, nên làm chậm rãi, có phương án dự phòng.";
}

/** Cát tinh, sát tinh, sao phụ, Tứ Hóa, Tuần/Triệt của một cung. */
function doanPhuTinh(c: Cung, { daoHoa = false } = {}): string[] {
  const doan: string[] = [];
  const { cat, sat } = catSat(c);
  if (cat.length) doan.push(`Được cát tinh hỗ trợ: ${moTaNhom(cat, CAT_TINH).join("; ")}.`);
  if (sat.length) doan.push(`Gặp sát tinh: ${moTaNhom(sat, SAT_TINH).join("; ")}.`);
  const khac = moTaNhom(c.phu_tinh, { ...SAO_KHAC, ...(daoHoa ? DAO_HOA : {}) });
  if (khac.length) doan.push(`Sao phụ đáng chú ý: ${khac.join("; ")}.`);
  for (const s of [...c.chinh_tinh, ...c.phu_tinh]) {
    if (s.hoa) doan.push(`${s.ten} hóa ${s.hoa} tại đây: ${TU_HOA[s.hoa]}.`);
  }
  const tuanTriet = doanTuanTriet(c);
  if (tuanTriet) doan.push(tuanTriet);
  return doan;
}

function mucMenh(doc: DocLaSo, laSo: LaSo): MucLuanGiai {
  const menh = doc.cung("Mệnh");
  const nam = laSo.gioi_tinh === "nam";
  const thuanLy = (laSo.am_duong === "Dương") === nam;
  const hanhCuc = laSo.cuc.split(" ")[0];
  const hanhMenh = laSo.nap_am;

  let cucMenh: string;
  if (hanhCuc === hanhMenh) cucMenh = "Mệnh và Cục cùng hành (bình hòa): nội lực ổn định, làm việc gì cũng có nền tảng.";
  else if (SINH[hanhCuc] === hanhMenh) cucMenh = `Cục ${hanhCuc} sinh Mệnh ${hanhMenh}: được hoàn cảnh nâng đỡ, là cách tốt.`;
  else if (SINH[hanhMenh] === hanhCuc) cucMenh = `Mệnh ${hanhMenh} sinh Cục ${hanhCuc}: hay phải bỏ nhiều công sức cho hoàn cảnh, vất vả rồi mới thành.`;
  else if (KHAC[hanhMenh] === hanhCuc) cucMenh = `Mệnh ${hanhMenh} khắc Cục ${hanhCuc}: có bản lĩnh vượt hoàn cảnh nhưng phải tự lực nhiều.`;
  else cucMenh = `Cục ${hanhCuc} khắc Mệnh ${hanhMenh}: dễ gặp trở ngại từ hoàn cảnh, cần kiên trì và chọn môi trường phù hợp.`;

  const doan = [
    `Sinh năm ${laSo.can_chi_nam}, ${laSo.am_duong} ${nam ? "Nam" : "Nữ"} — âm dương ${
      thuanLy ? "thuận lý, mọi việc dễ thuận theo lẽ tự nhiên" : "nghịch lý, thường phải nỗ lực hơn người để đạt mục tiêu"
    }. Mệnh ${hanhMenh}, ${laSo.cuc}. ${cucMenh}`,
  ];

  const { sao, muonTu } = doc.chinhTinh(menh);
  const tinhCach = sao.map((s) => `${s.ten}: ${viThuong(CHINH_TINH[s.ten].menh)}`).join(" ");
  doan.push(
    muonTu
      ? `Mệnh an tại ${menh.can} ${menh.chi}, vô chính diệu: tính cách linh hoạt, dễ thích nghi nhưng cũng dễ chịu ảnh hưởng của môi trường. Mượn ${noi(tenSao(sao))} từ cung ${muonTu.ten_cung} để luận: ${tinhCach}`
      : `Mệnh an tại ${menh.can} ${menh.chi}, có ${noi(tenSao(sao))} tọa thủ. ${tinhCach}`,
  );
  doan.push(...doanPhuTinh(menh, { daoHoa: true }));
  doan.push(`Thân cư ${laSo.than_cu}: ${THAN_CU[laSo.than_cu] ?? ""}`);

  const tpCat = doc.tamPhuongTuChinh(menh).flatMap((c) => catSat(c).cat).length;
  const tpSat = doc.tamPhuongTuChinh(menh).flatMap((c) => catSat(c).sat).length;
  const the =
    tpCat >= tpSat + 2
      ? "thế cục khá thuận, dễ được giúp đỡ trên đường đời"
      : tpSat >= tpCat + 2
        ? "nhiều thử thách, thành công chủ yếu nhờ tự lực và bản lĩnh"
        : "cát hung đan xen, thành bại phụ thuộc nhiều vào nỗ lực bản thân";
  doan.push(`Tam phương tứ chính của Mệnh hội ${tpCat} cát tinh và ${tpSat} sát tinh: ${the}.`);
  return { tieu_de: "Tổng quan Mệnh – Thân", doan };
}

function mucCung(doc: DocLaSo, tieuDe: string, tenCung: string, khoa: keyof YNghiaChinhTinh): MucLuanGiai {
  const c = doc.cung(tenCung);
  return { tieu_de: tieuDe, doan: [doanChinhTinh(doc, c, khoa), ...doanPhuTinh(c, { daoHoa: tenCung === "Phu Thê" })] };
}

function tomTatCung(doc: DocLaSo, tenCung: string): string {
  const c = doc.cung(tenCung);
  const { sao, muonTu } = doc.chinhTinh(c);
  const { cat, sat } = catSat(c);
  const hoa = [...c.chinh_tinh, ...c.phu_tinh].flatMap((s) => (s.hoa ? [s.hoa] : []));
  const diem = cat.length + hoa.filter((h) => h !== "Kỵ").length - sat.length - (hoa.includes("Kỵ") ? 2 : 0);
  const danhGia = diem > 0 ? "nhìn chung thuận lợi" : diem < 0 ? "cần chăm chút nhiều hơn" : "ở mức bình ổn";
  const kem = hoa.length ? ` (có Hóa ${noi(hoa)})` : "";
  return `Cung ${tenCung} ${muonTu ? "vô chính diệu" : `có ${noi(tenSao(sao))}`}${kem}, ${danhGia} về ${LINH_VUC_CUNG[tenCung]}.`;
}

function mucSucKhoe(doc: DocLaSo): MucLuanGiai {
  const c = doc.cung("Tật Ách");
  const { sao, muonTu } = doc.chinhTinh(c);
  const bo = [...new Set(sao.map((s) => CHINH_TINH[s.ten].sucKhoe))];
  const doan = [
    `Cung Tật Ách an tại ${c.can} ${c.chi}${muonTu ? `, vô chính diệu (mượn ${noi(tenSao(sao))})` : `, có ${noi(tenSao(sao))}`}: nên chú ý ${noi(bo)}.`,
  ];
  if (catSat(c).sat.length) {
    doan.push("Có sát tinh ở Tật Ách: đề phòng va chạm, tai nạn nhỏ; nên khám sức khỏe định kỳ.");
  }
  doan.push(...doanPhuTinh(c).filter((d) => !d.startsWith("Gặp sát tinh")));
  return { tieu_de: "Sức khỏe", doan };
}

function mucDaiHan(doc: DocLaSo, laSo: LaSo, namHienTai: number): MucLuanGiai {
  const tuoi = namHienTai - laSo.am_lich.nam + 1;
  const theoTuoi = [...laSo.cung].sort((a, b) => a.dai_han.tu - b.dai_han.tu);
  const hienTai = theoTuoi.find((c) => c.dai_han.tu <= tuoi && tuoi <= c.dai_han.den);
  if (!hienTai) {
    return {
      tieu_de: "Đại hạn hiện tại",
      doan: [`Năm ${namHienTai} (khoảng ${tuoi} tuổi âm) chưa vào đại hạn đầu tiên (từ ${theoTuoi[0].dai_han.tu} tuổi).`],
    };
  }
  const { sao, muonTu } = doc.chinhTinh(hienTai);
  const doan = [
    `Năm ${namHienTai} (khoảng ${tuoi} tuổi âm) đang ở đại hạn ${hienTai.dai_han.tu}–${hienTai.dai_han.den} tuổi, ` +
      `đi qua cung ${hienTai.ten_cung} (${hienTai.can} ${hienTai.chi}) — giai đoạn mà chuyện ${LINH_VUC_CUNG[hienTai.ten_cung]} nổi bật.`,
    `${muonTu ? `Cung vô chính diệu, mượn ${noi(tenSao(sao))}` : `Có ${noi(tenSao(sao))}`}: ` +
      sao.map((s) => `${s.ten} là ${CHINH_TINH[s.ten].tinh}`).join("; ") +
      ".",
    ...doanPhuTinh(hienTai),
  ];
  const ke = theoTuoi[theoTuoi.indexOf(hienTai) + 1];
  if (ke) doan.push(`Đại hạn kế tiếp (${ke.dai_han.tu}–${ke.dai_han.den} tuổi) chuyển sang cung ${ke.ten_cung}.`);
  return { tieu_de: "Đại hạn hiện tại", doan };
}

function mucLoiKhuyen(doc: DocLaSo, laSo: LaSo): MucLuanGiai {
  const doan: string[] = [];
  const tim = (hoa: string) => laSo.cung.find((c) => [...c.chinh_tinh, ...c.phu_tinh].some((s) => s.hoa === hoa));
  const loc = tim("Lộc");
  const ky = tim("Kỵ");
  if (loc) doan.push(`Hóa Lộc ở cung ${loc.ten_cung}: mảng ${LINH_VUC_CUNG[loc.ten_cung]} dễ gặp thuận lợi, nên tận dụng.`);
  if (ky) doan.push(`Hóa Kỵ ở cung ${ky.ten_cung}: nên thận trọng hơn trong chuyện ${LINH_VUC_CUNG[ky.ten_cung]}, tránh nóng vội.`);
  if (catSat(doc.cung("Mệnh")).sat.length) {
    doan.push("Mệnh có sát tinh: rèn sự kiên nhẫn, suy nghĩ kỹ trước những quyết định lớn.");
  }
  const khongKiep = (c: Cung) => c.phu_tinh.some((s) => s.ten === "Địa Không" || s.ten === "Địa Kiếp");
  if (khongKiep(doc.cung("Tài Bạch")) || khongKiep(doc.cung("Mệnh"))) {
    doan.push("Địa Không/Địa Kiếp chiếu Mệnh hoặc Tài: tránh đầu tư mạo hiểm, vay mượn lớn hay bảo lãnh cho người khác.");
  }
  doan.push(
    "Lá số chỉ cho biết xu hướng và thế mạnh – điểm yếu. Sức khỏe, lựa chọn và nỗ lực của bản thân mới là yếu tố quyết định; " +
      "hãy dùng những gợi ý trên như lời nhắc để phát huy điểm mạnh và phòng tránh điểm yếu.",
  );
  return { tieu_de: "Lời khuyên", doan };
}

/** Bài luận giải đầy đủ. `namHienTai` dùng để xác định đại hạn đang đi qua. */
export function luanGiaiTheoQuyTac(laSo: LaSo, namHienTai: number): MucLuanGiai[] {
  const doc = new DocLaSo(laSo);
  const tinhDuyen = mucCung(doc, "Tình duyên – Gia đạo", "Phu Thê", "phuThe");
  tinhDuyen.doan.push(tomTatCung(doc, "Tử Tức"), tomTatCung(doc, "Phụ Mẫu"));
  const taiLoc = mucCung(doc, "Tài lộc", "Tài Bạch", "taiBach");
  taiLoc.doan.push(tomTatCung(doc, "Điền Trạch"));
  return [
    mucMenh(doc, laSo),
    mucCung(doc, "Công danh – Sự nghiệp", "Quan Lộc", "quanLoc"),
    taiLoc,
    tinhDuyen,
    mucSucKhoe(doc),
    mucDaiHan(doc, laSo, namHienTai),
    mucLoiKhuyen(doc, laSo),
  ].map((m) => ({ ...m, doan: m.doan.map(viHoa) }));
}
