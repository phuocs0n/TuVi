"use client";

import type { LaSo } from "@tuvi/shared-types";
import { useMemo } from "react";

import { Reveal } from "@/components/motion/Reveal";
import { luanGiaiTheoQuyTac } from "@/lib/luan-giai/quy-tac";

export function LuanGiai({ laSo }: { laSo: LaSo }) {
  const muc = useMemo(() => luanGiaiTheoQuyTac(laSo, new Date().getFullYear()), [laSo]);

  return (
    <section className="glass mt-8 p-6 sm:p-10">
      <p className="eyebrow">Theo quy tắc Tử Vi</p>
      <h2 className="mt-1 font-display text-4xl font-bold">
        Luận giải <span className="gold-text italic">lá số</span>
      </h2>
      <p className="mt-2 text-sm text-muted">
        Luận giải tự động theo các quy tắc Tử Vi phổ biến (chưa xét độ miếu, hãm của sao), mang tính tham khảo.
      </p>
      <Reveal className="mt-8 grid gap-8">
        {muc.map((m, i) => (
          <article key={m.tieu_de} data-reveal className="grid gap-x-6 sm:grid-cols-[3.5rem_1fr]">
            <span
              aria-hidden
              className="hidden size-12 place-items-center rounded-full border border-gold/40 font-display text-xl font-bold text-gold sm:grid"
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="border-l border-line pl-5 sm:border-l-0 sm:pl-0">
              <h3 className="font-display text-2xl font-bold text-gold-soft">{m.tieu_de}</h3>
              <div className="mt-2 grid gap-2 leading-relaxed text-ivory/90">
                {m.doan.map((d) => (
                  <p key={d}>{d}</p>
                ))}
              </div>
            </div>
          </article>
        ))}
      </Reveal>
    </section>
  );
}
