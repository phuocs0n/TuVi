"use client";

import { useRef } from "react";

import { CHO_PHEP_CHUYEN_DONG, gsap, useGSAP } from "@/lib/gsap";

/** Số ngẫu nhiên có hạt giống cố định để vị trí sao giống nhau giữa server và trình duyệt. */
function taoNgauNhien(hatGiong: number) {
  let a = hatGiong;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ngauNhien = taoNgauNhien(1995);
const SAO = Array.from({ length: 120 }, () => ({
  x: ngauNhien() * 100,
  y: ngauNhien() * 100,
  r: ngauNhien() < 0.85 ? 1 : 2,
  vang: ngauNhien() < 0.25,
  mo: 0.25 + ngauNhien() * 0.6,
}));

/** Bầu trời sao cố định phía sau toàn trang; sao lấp lánh nhẹ bằng GSAP. */
export function Starfield() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(CHO_PHEP_CHUYEN_DONG, () => {
        gsap.to(ref.current!.querySelectorAll("[data-sao]"), {
          opacity: () => gsap.utils.random(0.1, 1),
          duration: () => gsap.utils.random(1.5, 4),
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          stagger: { each: 0.04, from: "random" },
        });
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} aria-hidden className="no-print pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {SAO.map((s, i) => (
        <span
          key={i}
          data-sao
          className={`absolute rounded-full ${s.vang ? "bg-gold-soft" : "bg-ivory"}`}
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.r, height: s.r, opacity: s.mo }}
        />
      ))}
    </div>
  );
}
