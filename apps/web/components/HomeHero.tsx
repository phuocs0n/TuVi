"use client";

import { useRef } from "react";

import { LaSoForm } from "@/components/LaSoForm";
import { BatQuai } from "@/components/motion/BatQuai";
import { CHO_PHEP_CHUYEN_DONG, gsap, useGSAP } from "@/lib/gsap";

const CHI_SO = ["12 cung", "14 chính tinh", "33 phụ tinh", "Tứ Hóa", "Đại hạn 10 năm"];

/** Phần mở đầu trang chủ: lời giới thiệu, vòng Bát Quái xoay phía sau và form lập lá số. */
export function HomeHero() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(CHO_PHEP_CHUYEN_DONG, () => {
        gsap
          .timeline({ defaults: { ease: "power3.out", duration: 0.9 } })
          .from("[data-hero-bg]", { opacity: 0, scale: 0.85, duration: 1.6 })
          .from("[data-hero-line]", { opacity: 0, y: 30, stagger: 0.12 }, 0.2)
          .from("[data-hero-chip]", { opacity: 0, y: 12, stagger: 0.06, duration: 0.6 }, "-=0.5")
          .from("[data-hero-form]", { opacity: 0, y: 40, duration: 1 }, 0.45);
      });
    },
    { scope: ref },
  );

  return (
    <section
      ref={ref}
      className="relative grid items-center gap-10 overflow-x-clip pt-10 pb-6 lg:grid-cols-[1.05fr_1fr] lg:pt-16"
    >
      <div>
        <p data-hero-line className="eyebrow">
          Tử Vi Đẩu Số · An sao · Luận giải
        </p>
        <h1 data-hero-line className="mt-4 font-display text-5xl leading-[1.05] font-bold text-balance sm:text-6xl">
          Lập lá số Tử Vi
          <span className="mt-1 block gold-text italic">đọc vận mệnh của bạn</span>
        </h1>
        <p data-hero-line className="mt-6 max-w-xl text-lg text-muted">
          Nhập ngày giờ sinh để an trọn 12 cung, 14 chính tinh, Tứ Hóa và Đại hạn — kèm bài luận giải chi tiết và
          trợ lý AI trả lời riêng từng câu hỏi.
        </p>
        <ul className="mt-6 flex flex-wrap gap-2" aria-label="Lá số gồm">
          {CHI_SO.map((c) => (
            <li
              key={c}
              data-hero-chip
              className="rounded-full border border-line bg-white/[0.03] px-3 py-1 text-sm text-gold-soft"
            >
              {c}
            </li>
          ))}
        </ul>
        <p data-hero-line className="mt-6 text-sm text-muted">
          Miễn phí · Không cần đăng ký · Tính ngay trên trình duyệt
        </p>
      </div>

      <div className="relative">
        {/* Vòng Bát Quái làm hào quang sau form; phần tràn ngang bị cắt trong khung hero. */}
        <div
          data-hero-bg
          className="pointer-events-none absolute top-1/2 left-1/2 -z-10 w-[118%] -translate-x-1/2 -translate-y-1/2 opacity-35 lg:w-[640px] lg:opacity-45"
        >
          <BatQuai className="w-full drop-shadow-[0_0_40px_rgb(212_168_90/0.25)]" />
        </div>
        <div data-hero-form id="lap-la-so" className="scroll-mt-24">
          <LaSoForm />
        </div>
      </div>
    </section>
  );
}
