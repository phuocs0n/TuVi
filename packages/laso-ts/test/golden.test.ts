import { createHash } from "node:crypto";

import type { LaSoRequest } from "@tuvi/shared-types";
import { describe, expect, it } from "vitest";

import { amSangDuong, duongSangAm, lapLaSo, LaSoError } from "../src";
import golden from "./golden.json";

/** Giống `json.dumps(sort_keys=True, separators=(",", ":"), ensure_ascii=False)` bên Python. */
function canonical(v: unknown): string {
  if (Array.isArray(v)) return `[${v.map(canonical).join(",")}]`;
  if (v && typeof v === "object") {
    const o = v as Record<string, unknown>;
    return `{${Object.keys(o)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${canonical(o[k])}`)
      .join(",")}}`;
  }
  return JSON.stringify(v);
}
const sha = (v: unknown) => createHash("sha256").update(canonical(v), "utf8").digest("hex");

describe("đối chiếu với engine Python", () => {
  it("mọi mùng 1 âm lịch 1900-2100 đổi đúng hai chiều", () => {
    const sai: string[] = [];
    for (const [y, m, d, thangAm, namAm, nhuan] of golden.mung_mot_am_lich) {
      const got = duongSangAm(d, m, y);
      if (got.ngay !== 1 || got.thang !== thangAm || got.nam !== namAm || got.nhuan !== Boolean(nhuan)) {
        sai.push(`${d}/${m}/${y} -> ${JSON.stringify(got)}`);
      }
      const back = amSangDuong(1, thangAm, namAm, Boolean(nhuan));
      if (back.ngay !== d || back.thang !== m || back.nam !== y) {
        sai.push(`âm 1/${thangAm}/${namAm}${nhuan ? " nhuận" : ""} -> ${JSON.stringify(back)}`);
      }
    }
    expect(golden.mung_mot_am_lich.length).toBeGreaterThan(2400);
    expect(sai.slice(0, 10)).toEqual([]);
  });

  it("ngày liền trước mùng 1 là ngày 29 hoặc 30 của tháng trước", () => {
    for (const [y, m, d] of golden.mung_mot_am_lich.slice(1, 400)) {
      const truoc = new Date(Date.UTC(y, m - 1, d - 1));
      const am = duongSangAm(truoc.getUTCDate(), truoc.getUTCMonth() + 1, truoc.getUTCFullYear());
      expect([29, 30]).toContain(am.ngay);
    }
  });

  it("lá số đầy đủ giống hệt bản Python (so băm toàn bộ kết quả)", () => {
    const sai: string[] = [];
    for (const c of golden.la_so) {
      const input = c.input as LaSoRequest;
      let got: string | null;
      try {
        got = sha(lapLaSo(input));
      } catch (e) {
        if (!(e instanceof LaSoError)) throw e;
        got = null;
      }
      if (got !== c.sha256) sai.push(`${JSON.stringify(input)} -> ${got === null ? "lỗi" : "khác kết quả"}`);
    }
    expect(golden.la_so.length).toBeGreaterThan(500);
    expect(sai.slice(0, 5)).toEqual([]);
  });

  it("ví dụ đầy đủ khớp từng trường", () => {
    golden.vi_du.forEach((expected, i) => {
      expect(lapLaSo(golden.la_so[i].input as LaSoRequest)).toEqual(expected);
    });
  });
});

describe("kiểm tra đầu vào", () => {
  const base: LaSoRequest = {
    ho_ten: "A", gioi_tinh: "nam", ngay: 1, thang: 1, nam: 2000, gio: 0, lich: "duong", nhuan: false,
  };
  it.each([
    { ngay: 30, thang: 2 },
    { ngay: 31, thang: 4 },
    { gio: 24 },
    { thang: 13 },
    { lich: "am" as const, ngay: 1, thang: 3, nam: 2024, nhuan: true },
  ])("báo lỗi tiếng Việt cho %j", (patch) => {
    expect(() => lapLaSo({ ...base, ...patch })).toThrow(LaSoError);
  });
});
