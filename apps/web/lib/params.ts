import type { LaSoRequest } from "@tuvi/shared-types";

/** 12 canh giờ: giá trị là một giờ đại diện (0–23) gửi lên API. */
export const CANH_GIO = [
  { value: 0, label: "Tý (23h – 1h)" },
  { value: 2, label: "Sửu (1h – 3h)" },
  { value: 4, label: "Dần (3h – 5h)" },
  { value: 6, label: "Mão (5h – 7h)" },
  { value: 8, label: "Thìn (7h – 9h)" },
  { value: 10, label: "Tỵ (9h – 11h)" },
  { value: 12, label: "Ngọ (11h – 13h)" },
  { value: 14, label: "Mùi (13h – 15h)" },
  { value: 16, label: "Thân (15h – 17h)" },
  { value: 18, label: "Dậu (17h – 19h)" },
  { value: 20, label: "Tuất (19h – 21h)" },
  { value: 22, label: "Hợi (21h – 23h)" },
] as const;

export function toSearchParams(req: LaSoRequest): string {
  return new URLSearchParams({
    ten: req.ho_ten,
    gt: req.gioi_tinh,
    d: String(req.ngay),
    m: String(req.thang),
    y: String(req.nam),
    h: String(req.gio),
    l: req.lich,
    n: req.nhuan ? "1" : "0",
  }).toString();
}

/** Đọc lại request từ URL; trả null nếu thiếu hoặc sai. */
export function fromSearchParams(sp: URLSearchParams): LaSoRequest | null {
  const num = (k: string) => {
    const v = Number(sp.get(k));
    return Number.isInteger(v) ? v : NaN;
  };
  const gt = sp.get("gt");
  const l = sp.get("l") ?? "duong";
  const req: LaSoRequest = {
    ho_ten: sp.get("ten") ?? "",
    gioi_tinh: gt === "nu" ? "nu" : "nam",
    ngay: num("d"),
    thang: num("m"),
    nam: num("y"),
    gio: num("h"),
    lich: l === "am" ? "am" : "duong",
    nhuan: sp.get("n") === "1",
  };
  if (gt !== "nam" && gt !== "nu") return null;
  if ([req.ngay, req.thang, req.nam, req.gio].some(Number.isNaN)) return null;
  return req;
}
