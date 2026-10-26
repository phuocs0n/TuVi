"use client";

import type { LaSo } from "@tuvi/shared-types";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { type ReactNode, useEffect, useMemo, useState } from "react";

import { AmDuong } from "@/components/AmDuong";
import { HoiAI } from "@/components/HoiAI";
import { LaSoChart } from "@/components/LaSoChart";
import { LuanGiai } from "@/components/LuanGiai";
import { ApiError, lapLaSo } from "@/lib/api";
import { fromSearchParams } from "@/lib/params";

export function LaSoView() {
  const sp = useSearchParams();
  const req = useMemo(() => fromSearchParams(new URLSearchParams(sp.toString())), [sp]);
  const [laSo, setLaSo] = useState<LaSo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!req) return;
    let cancelled = false;
    setLaSo(null);
    setError(null);
    lapLaSo(req)
      .then((r) => !cancelled && setLaSo(r))
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof ApiError ? e.message : "Đã có lỗi xảy ra.");
      });
    return () => {
      cancelled = true;
    };
  }, [req]);

  if (!req) {
    return (
      <ThongBao>
        <p>Thiếu thông tin ngày giờ sinh.</p>
        <Link href="/#lap-la-so" className="btn btn-gold">
          Nhập thông tin
        </Link>
      </ThongBao>
    );
  }
  if (error) {
    return (
      <ThongBao>
        <p className="text-hoa-ky">{error}</p>
        <Link href="/#lap-la-so" className="btn btn-ghost">
          Nhập lại
        </Link>
      </ThongBao>
    );
  }
  if (!laSo) return <DangTai />;

  return (
    <>
      <div className="no-print flex flex-wrap items-center justify-between gap-3 pt-8 pb-5">
        <Link href="/#lap-la-so" className="btn btn-ghost px-4 py-2 text-sm">
          ← Lập lá số khác
        </Link>
        <button type="button" className="btn btn-ghost px-4 py-2 text-sm" onClick={() => window.print()}>
          In lá số
        </button>
      </div>
      <LaSoChart laSo={laSo} />
      <LuanGiai laSo={laSo} />
      <HoiAI req={req} />
    </>
  );
}

function ThongBao({ children }: { children: ReactNode }) {
  return <div className="glass mx-auto mt-16 grid max-w-md justify-items-center gap-5 p-10 text-center">{children}</div>;
}

export function DangTai() {
  return (
    <ThongBao>
      <AmDuong className="size-14 animate-spin [animation-duration:4s]" />
      <p className="font-display text-xl text-gold-soft">Đang an lá số…</p>
    </ThongBao>
  );
}
