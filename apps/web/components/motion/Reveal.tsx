"use client";

import { type ReactNode, useRef } from "react";

import { CHO_PHEP_CHUYEN_DONG, gsap, useGSAP } from "@/lib/gsap";

/** Các phần tử con có thuộc tính `data-reveal` hiện dần lên khi cuộn tới. */
export function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(CHO_PHEP_CHUYEN_DONG, () => {
        ref.current!.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
          gsap.from(el, {
            opacity: 0,
            y: 28,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 90%", once: true },
          });
        });
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
