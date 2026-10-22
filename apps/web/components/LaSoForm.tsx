"use client";

import type { LaSoRequest } from "@tuvi/shared-types";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { CANH_GIO, toSearchParams } from "@/lib/params";

const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i);
const NAM_HIEN_TAI = new Date().getFullYear();

export function LaSoForm() {
  const router = useRouter();
  const [form, setForm] = useState<LaSoRequest>({
    ho_ten: "",
    gioi_tinh: "nam",
    ngay: 1,
    thang: 1,
    nam: 1995,
    gio: 0,
    lich: "duong",
    nhuan: false,
  });
  const set = <K extends keyof LaSoRequest>(k: K, v: LaSoRequest[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    router.push(`/la-so?${toSearchParams({ ...form, nhuan: form.lich === "am" && form.nhuan })}`);
  };

  return (
    <form className="card form" onSubmit={onSubmit}>
      <h2>Lập lá số Tử Vi</h2>

      <label className="field">
        <span>Họ và tên</span>
        <input
          value={form.ho_ten}
          onChange={(e) => set("ho_ten", e.target.value)}
          placeholder="Nguyễn Văn A"
          maxLength={100}
          autoComplete="name"
        />
      </label>

      <fieldset className="field">
        <legend>Giới tính</legend>
        <div className="segmented">
          {(["nam", "nu"] as const).map((g) => (
            <label key={g} className={form.gioi_tinh === g ? "active" : ""}>
              <input
                type="radio"
                name="gioi_tinh"
                checked={form.gioi_tinh === g}
                onChange={() => set("gioi_tinh", g)}
              />
              {g === "nam" ? "Nam" : "Nữ"}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="field">
        <legend>Ngày sinh</legend>
        <div className="segmented small">
          {(["duong", "am"] as const).map((l) => (
            <label key={l} className={form.lich === l ? "active" : ""}>
              <input
                type="radio"
                name="lich"
                checked={form.lich === l}
                onChange={() => set("lich", l)}
              />
              {l === "duong" ? "Dương lịch" : "Âm lịch"}
            </label>
          ))}
        </div>
        <div className="date-row">
          <select aria-label="Ngày" value={form.ngay} onChange={(e) => set("ngay", +e.target.value)}>
            {range(1, form.lich === "am" ? 30 : 31).map((d) => (
              <option key={d} value={d}>
                Ngày {d}
              </option>
            ))}
          </select>
          <select aria-label="Tháng" value={form.thang} onChange={(e) => set("thang", +e.target.value)}>
            {range(1, 12).map((m) => (
              <option key={m} value={m}>
                Tháng {m}
              </option>
            ))}
          </select>
          <select aria-label="Năm" value={form.nam} onChange={(e) => set("nam", +e.target.value)}>
            {range(1900, NAM_HIEN_TAI).reverse().map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        {form.lich === "am" && (
          <label className="check">
            <input type="checkbox" checked={form.nhuan} onChange={(e) => set("nhuan", e.target.checked)} />
            Tháng nhuận
          </label>
        )}
      </fieldset>

      <label className="field">
        <span>Giờ sinh</span>
        <select value={form.gio} onChange={(e) => set("gio", +e.target.value)}>
          {CANH_GIO.map((g) => (
            <option key={g.value} value={g.value}>
              Giờ {g.label}
            </option>
          ))}
        </select>
      </label>

      <button type="submit" className="btn primary">
        Xem lá số
      </button>
    </form>
  );
}
