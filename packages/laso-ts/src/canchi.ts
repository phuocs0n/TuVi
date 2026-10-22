/** Thiên Can, Địa Chi và Ngũ hành nạp âm. Chuyển từ laso_engine/canchi.py. */
import { LaSoError } from "./errors";
import { mod } from "./amlich";

export const CAN = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"] as const;
export const CHI = [
  "Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi",
] as const;

// Ngũ hành nạp âm cho 30 cặp Lục thập hoa giáp (Giáp Tý–Ất Sửu, Bính Dần–Đinh Mão, ...)
const NAP_AM = [
  "Kim", "Hỏa", "Mộc", "Thổ", "Kim", "Hỏa", "Thủy", "Thổ", "Kim", "Mộc",
  "Thủy", "Thổ", "Hỏa", "Mộc", "Thủy", "Kim", "Hỏa", "Mộc", "Thổ", "Kim",
  "Hỏa", "Thủy", "Thổ", "Kim", "Mộc", "Thủy", "Thổ", "Hỏa", "Mộc", "Thủy",
] as const;

export interface CanChi {
  can: number;
  chi: number;
}

export const tenCanChi = (cc: CanChi): string => `${CAN[cc.can]} ${CHI[cc.chi]}`;

export const canChiNam = (namAmLich: number): CanChi => ({
  can: mod(namAmLich - 4, 10),
  chi: mod(namAmLich - 4, 12),
});

/** Vị trí 0..59 trong Lục thập hoa giáp. */
const hoaGiap = (cc: CanChi): number => mod(6 * cc.can - 5 * cc.chi, 60);

export const napAm = (cc: CanChi): string => NAP_AM[Math.floor(hoaGiap(cc) / 2)];

/** Đổi giờ đồng hồ 0..23 sang chỉ số Chi (Tý = 23h–1h). */
export function chiGio(gio: number): number {
  if (!Number.isInteger(gio) || gio < 0 || gio > 23) throw new LaSoError(`Giờ không hợp lệ: ${gio}`);
  return Math.floor((gio + 1) / 2) % 12;
}
