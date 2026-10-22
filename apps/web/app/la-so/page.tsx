import type { Metadata } from "next";
import { Suspense } from "react";

import { LaSoView } from "@/components/LaSoView";

export const metadata: Metadata = { title: "Lá số Tử Vi" };

export default function LaSoPage() {
  return (
    <Suspense fallback={<div className="card center-msg">Đang tải…</div>}>
      <LaSoView />
    </Suspense>
  );
}
