import type { Metadata } from "next";
import { Suspense } from "react";

import { DangTai, LaSoView } from "@/components/LaSoView";

export const metadata: Metadata = { title: "Lá số Tử Vi" };

export default function LaSoPage() {
  return (
    <Suspense fallback={<DangTai />}>
      <LaSoView />
    </Suspense>
  );
}
