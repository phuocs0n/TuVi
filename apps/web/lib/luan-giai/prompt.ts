/** Dựng prompt luận giải từ lá số — bản TypeScript của services/ai-engine/app/prompt.py */

import type { LaSo, Sao } from "@tuvi/shared-types";

export const SYSTEM_PROMPT =
  "Bạn là chuyên gia Tử Vi Đẩu Số. Luận giải mang tính tham khảo, tích cực, " +
  "không phán đoán tuyệt đối về sức khỏe, tài chính hay sinh tử. " +
  "Chỉ dựa trên dữ kiện lá số và tài liệu tham khảo được cung cấp. " +
  "Trình bày bằng tiếng Việt, chia mục rõ ràng: Tổng quan Mệnh - Thân, Công danh, " +
  "Tài lộc, Tình duyên - Gia đạo, Sức khỏe, Lời khuyên.";

const sao = (ds: Sao[]) => ds.map((s) => (s.hoa ? `${s.ten} (Hóa ${s.hoa})` : s.ten)).join(", ");

export function formatLaSo(laSo: LaSo): string {
  const al = laSo.am_lich;
  const lines = [
    `- Giới tính: ${laSo.gioi_tinh === "nam" ? "Nam" : "Nữ"}`,
    `- Năm sinh: ${laSo.can_chi_nam} (${laSo.am_duong}), nạp âm ${laSo.nap_am}`,
    `- Âm lịch: ngày ${al.ngay} tháng ${al.thang}${al.nhuan ? " nhuận" : ""}, giờ ${laSo.duong_lich.gio_chi}`,
    `- Cục: ${laSo.cuc}; Mệnh tại ${laSo.cung_menh}, Thân cư ${laSo.than_cu}`,
    `- Đại hạn đi chiều ${laSo.chieu_dai_han.toLowerCase()}`,
    "",
    "12 cung:",
  ];
  for (const c of laSo.cung) {
    const tags = ([["Thân", c.la_than], ["Tuần", c.tuan], ["Triệt", c.triet]] as const)
      .filter(([, on]) => on)
      .map(([t]) => t);
    lines.push(
      `- ${c.ten_cung} (${c.can} ${c.chi}, đại hạn ${c.dai_han.tu}-${c.dai_han.den})` +
        `${tags.length ? ` [${tags.join(", ")}]` : ""}: ` +
        `chính tinh: ${sao(c.chinh_tinh) || "vô chính diệu"}; ` +
        `phụ tinh: ${sao(c.phu_tinh) || "không"}; ${c.truong_sinh}`,
    );
  }
  return lines.join("\n");
}

export function buildPrompt(laSo: LaSo, contextDocs: string[], cauHoi: string): string {
  const nguCanh = contextDocs.map((d) => `<doc>${d}</doc>`).join("\n") || "<doc>(không có)</doc>";
  return `<tai_lieu>\n${nguCanh}\n</tai_lieu>\n\n<la_so>\n${formatLaSo(laSo)}\n</la_so>\n\nCâu hỏi: ${cauHoi}`;
}
