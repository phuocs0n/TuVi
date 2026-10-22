"use client";

import { LaSoError, lapLaSo } from "@tuvi/laso";
import type { LaSo } from "@tuvi/shared-types";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { LaSoChart } from "@/components/LaSoChart";
import { LuanGiai } from "@/components/LuanGiai";
import { fromSearchParams } from "@/lib/params";

type Ket = { laSo: LaSo } | { loi: string };

export function LaSoView() {
  const sp = useSearchParams();
  const req = useMemo(() => fromSearchParams(new URLSearchParams(sp.toString())), [sp]);
  // Lá số tính ngay trên trình duyệt: không phải chờ máy chủ.
  const ket = useMemo<Ket | null>(() => {
    if (!req) return null;
    try {
      return { laSo: lapLaSo(req) };
    } catch (e) {
      return { loi: e instanceof LaSoError ? e.message : "Đã có lỗi xảy ra khi an lá số." };
    }
  }, [req]);

  if (!req || !ket) {
    return (
      <div className="card center-msg">
        <p>Thiếu thông tin ngày giờ sinh.</p>
        <Link href="/" className="btn primary">
          Nhập thông tin
        </Link>
      </div>
    );
  }
  if ("loi" in ket) {
    return (
      <div className="card center-msg">
        <p className="error">{ket.loi}</p>
        <Link href="/" className="btn">
          Nhập lại
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="toolbar">
        <Link href="/" className="btn">
          ← Lập lá số khác
        </Link>
      </div>
      <LaSoChart laSo={ket.laSo} />
      <LuanGiai req={req} />
    </>
  );
}
