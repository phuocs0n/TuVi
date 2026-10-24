"use client";

import type { LaSo } from "@tuvi/shared-types";
import { useMemo } from "react";

import { luanGiaiTheoQuyTac } from "@/lib/luan-giai/quy-tac";

export function LuanGiai({ laSo }: { laSo: LaSo }) {
  const muc = useMemo(() => luanGiaiTheoQuyTac(laSo, new Date().getFullYear()), [laSo]);

  return (
    <section className="card luan-giai">
      <h2>Luận giải lá số</h2>
      <p className="muted">
        Luận giải tự động theo các quy tắc Tử Vi phổ biến (chưa xét độ miếu, hãm của sao), mang tính tham
        khảo.
      </p>
      {muc.map((m) => (
        <article key={m.tieu_de} className="muc">
          <h3>{m.tieu_de}</h3>
          {m.doan.map((d) => (
            <p key={d}>{d}</p>
          ))}
        </article>
      ))}
    </section>
  );
}
