"use client";

import { useRef } from "react";

import { AmDuongPath } from "@/components/AmDuong";
import { CHO_PHEP_CHUYEN_DONG, gsap, useGSAP } from "@/lib/gsap";

const CHI = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];

// Tiên Thiên Bát Quái theo chiều kim đồng hồ từ trên xuống: Càn, Tốn, Khảm, Cấn, Khôn, Chấn, Ly, Đoài.
// Mỗi quẻ ghi 3 hào từ dưới lên (1 = hào dương liền, 0 = hào âm đứt); hào dưới nằm gần tâm.
const QUE = ["111", "011", "010", "001", "000", "100", "101", "110"];

function Hao({ y, duong }: { y: number; duong: boolean }) {
  return duong ? (
    <rect x={-22} y={y - 3} width={44} height={6} rx={1} />
  ) : (
    <>
      <rect x={-22} y={y - 3} width={18} height={6} rx={1} />
      <rect x={4} y={y - 3} width={18} height={6} rx={1} />
    </>
  );
}

/** Vòng Bát Quái trang trí: 12 Địa Chi, 8 quẻ và Âm Dương ở giữa, mỗi vòng xoay chậm một chiều. */
export function BatQuai({ className }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(CHO_PHEP_CHUYEN_DONG, () => {
        const xoay = (sel: string, vong: number, giay: number) =>
          gsap.to(sel, { rotation: 360 * vong, svgOrigin: "0 0", duration: giay, ease: "none", repeat: -1 });
        xoay("[data-vong-chi]", 1, 240);
        xoay("[data-vong-que]", -1, 320);
        xoay("[data-am-duong]", 1, 60);
      });
    },
    { scope: ref },
  );

  return (
    <svg ref={ref} viewBox="-200 -200 400 400" className={className} aria-hidden>
      <g data-vong-chi fill="none" stroke="#d4a85a">
        <circle r={196} strokeOpacity={0.35} />
        <circle r={166} strokeOpacity={0.25} />
        {Array.from({ length: 72 }, (_, i) => (
          <line key={i} y1={-196} y2={i % 6 === 0 ? -186 : -191} strokeOpacity={0.4} transform={`rotate(${i * 5})`} />
        ))}
        {CHI.map((c, i) => {
          const goc = 180 + i * 30;
          const rad = (goc * Math.PI) / 180;
          return (
            <text
              key={c}
              x={Math.sin(rad) * 178}
              y={-Math.cos(rad) * 178}
              transform={`rotate(${goc} ${Math.sin(rad) * 178} ${-Math.cos(rad) * 178})`}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#ecd5a3"
              fillOpacity={0.75}
              stroke="none"
              fontSize={13}
              fontFamily="var(--font-display)"
            >
              {c}
            </text>
          );
        })}
      </g>
      <g data-vong-que>
        <circle r={154} fill="none" stroke="#d4a85a" strokeOpacity={0.2} />
        <circle r={104} fill="none" stroke="#d4a85a" strokeOpacity={0.3} />
        <g fill="#d4a85a" fillOpacity={0.8}>
          {QUE.map((q, k) => (
            <g key={k} transform={`rotate(${k * 45})`}>
              {[...q].map((h, i) => (
                <Hao key={i} y={-118 - i * 12} duong={h === "1"} />
              ))}
            </g>
          ))}
        </g>
      </g>
      <g data-am-duong>
        <AmDuongPath r={70} />
      </g>
    </svg>
  );
}
