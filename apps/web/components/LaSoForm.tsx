"use client";

import type { LaSoRequest } from "@tuvi/shared-types";
import { useRouter } from "next/navigation";
import { type FormEvent, type ReactNode, useState } from "react";

import { CANH_GIO, toSearchParams } from "@/lib/params";

const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i);
const NAM_HIEN_TAI = new Date().getFullYear();

function Segmented<T extends string>({
  name,
  value,
  options,
  onChange,
}: {
  name: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="segmented">
      {options.map((o) => (
        <label key={o.value} data-active={value === o.value}>
          <input type="radio" name={name} checked={value === o.value} onChange={() => onChange(o.value)} />
          {o.label}
        </label>
      ))}
    </div>
  );
}

function Field({ label, children, as: Tag = "label" }: { label: string; children: ReactNode; as?: "label" | "fieldset" }) {
  const Title = Tag === "fieldset" ? "legend" : "span";
  return (
    <Tag className="grid min-w-0 gap-2 border-0 p-0">
      <Title className="p-0 text-sm font-medium text-gold-soft">{label}</Title>
      {children}
    </Tag>
  );
}

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
  const set = <K extends keyof LaSoRequest>(k: K, v: LaSoRequest[K]) => setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    router.push(`/la-so?${toSearchParams({ ...form, nhuan: form.lich === "am" && form.nhuan })}`);
  };

  return (
    <form className="glass relative grid gap-5 p-6 sm:p-8" onSubmit={onSubmit}>
      <span aria-hidden className="absolute -top-px left-10 right-10 h-px bg-linear-to-r from-transparent via-gold to-transparent" />
      <div>
        <p className="eyebrow">Thông tin sinh</p>
        <h2 className="mt-1 font-display text-3xl font-bold">Lập lá số Tử Vi</h2>
      </div>

      <Field label="Họ và tên">
        <input
          className="input"
          value={form.ho_ten}
          onChange={(e) => set("ho_ten", e.target.value)}
          placeholder="Nguyễn Văn A"
          maxLength={100}
          autoComplete="name"
        />
      </Field>

      <Field label="Giới tính" as="fieldset">
        <Segmented
          name="gioi_tinh"
          value={form.gioi_tinh}
          onChange={(v) => set("gioi_tinh", v)}
          options={[
            { value: "nam", label: "Nam" },
            { value: "nu", label: "Nữ" },
          ]}
        />
      </Field>

      <Field label="Ngày sinh" as="fieldset">
        <Segmented
          name="lich"
          value={form.lich}
          onChange={(v) => set("lich", v)}
          options={[
            { value: "duong", label: "Dương lịch" },
            { value: "am", label: "Âm lịch" },
          ]}
        />
        <div className="grid grid-cols-3 gap-2">
          <select className="input" aria-label="Ngày" value={form.ngay} onChange={(e) => set("ngay", +e.target.value)}>
            {range(1, form.lich === "am" ? 30 : 31).map((d) => (
              <option key={d} value={d}>
                Ngày {d}
              </option>
            ))}
          </select>
          <select className="input" aria-label="Tháng" value={form.thang} onChange={(e) => set("thang", +e.target.value)}>
            {range(1, 12).map((m) => (
              <option key={m} value={m}>
                Tháng {m}
              </option>
            ))}
          </select>
          <select className="input" aria-label="Năm" value={form.nam} onChange={(e) => set("nam", +e.target.value)}>
            {range(1900, NAM_HIEN_TAI)
              .reverse()
              .map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
          </select>
        </div>
        {form.lich === "am" && (
          <label className="flex items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              className="size-4 accent-gold"
              checked={form.nhuan}
              onChange={(e) => set("nhuan", e.target.checked)}
            />
            Tháng nhuận
          </label>
        )}
      </Field>

      <Field label="Giờ sinh">
        <select className="input" value={form.gio} onChange={(e) => set("gio", +e.target.value)}>
          {CANH_GIO.map((g) => (
            <option key={g.value} value={g.value}>
              Giờ {g.label}
            </option>
          ))}
        </select>
      </Field>

      <button type="submit" className="btn btn-gold mt-1 w-full py-3 text-base">
        Xem lá số
      </button>
    </form>
  );
}
