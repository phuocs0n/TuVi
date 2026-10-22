"use client";

import type { LaSo } from "@tuvi/shared-types";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

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
      <div className="card center-msg">
        <p>Thiếu thông tin ngày giờ sinh.</p>
        <Link href="/" className="btn primary">
          Nhập thông tin
        </Link>
      </div>
    );
  }
  if (error) {
    return (
      <div className="card center-msg">
        <p className="error">{error}</p>
        <Link href="/" className="btn">
          Nhập lại
        </Link>
      </div>
    );
  }
  if (!laSo) return <div className="card center-msg">Đang an lá số…</div>;

  return (
    <>
      <div className="toolbar">
        <Link href="/" className="btn">
          ← Lập lá số khác
        </Link>
      </div>
      <LaSoChart laSo={laSo} />
      <LuanGiai req={req} />
    </>
  );
}
