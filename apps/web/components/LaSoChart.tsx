"use client";

import type { Cung, LaSo, Sao } from "@tuvi/shared-types";
import { useRef } from "react";

import { AmDuong } from "@/components/AmDuong";
import { CHO_PHEP_CHUYEN_DONG, gsap, useGSAP } from "@/lib/gsap";

/** Vị trí ô (hàng, cột) của 12 cung trên bàn 4x4 truyền thống, theo thứ tự Tý..Hợi. */
const VI_TRI: [number, number][] = [
  [4, 3], [4, 2], [4, 1], [3, 1], [2, 1], [1, 1],
  [1, 2], [1, 3], [1, 4], [2, 4], [3, 4], [4, 4],
];

function SaoItem({ sao, chinh }: { sao: Sao; chinh?: boolean }) {
  return (
    <li className={chinh ? "text-[0.92rem] font-semibold text-ivory" : "text-muted"}>
      {sao.ten}
      {sao.hoa && <span className={`hoa hoa-${sao.hoa}`}>{sao.hoa}</span>}
    </li>
  );
}

function CungCell({ cung, index }: { cung: Cung; index: number }) {
  const [row, col] = VI_TRI[index];
  const laMenh = cung.ten_cung === "Mệnh";
  return (
    <section
      data-cung
      className={`cung-cell flex min-h-44 min-w-0 flex-col gap-1.5 rounded-xl border p-2.5 text-[0.8rem] ${
        laMenh
          ? "border-cinnabar-bright/70 bg-cinnabar/10 shadow-[0_0_24px_-8px] shadow-cinnabar-bright"
          : "border-line bg-night/55"
      }`}
      style={{ gridRow: row, gridColumn: col }}
      aria-label={`Cung ${cung.ten_cung} tại ${cung.chi}`}
    >
      <header className="grid grid-cols-[1fr_auto_1fr] items-baseline gap-1 text-[0.72rem] text-muted">
        <span className="whitespace-nowrap">
          {cung.can} {cung.chi}
        </span>
        <span className="text-center font-display text-base font-bold text-gold">
          {cung.ten_cung}
          {cung.la_than && (
            <em className="ml-1 rounded bg-gold px-1 align-middle font-sans text-[0.62rem] font-semibold text-night not-italic">
              Thân
            </em>
          )}
        </span>
        <span className="text-right font-semibold text-gold-soft">{cung.dai_han.tu}</span>
      </header>
      <ul className="flex flex-wrap gap-x-2 gap-y-0.5">
        {cung.chinh_tinh.length ? (
          cung.chinh_tinh.map((s) => <SaoItem key={s.ten} sao={s} chinh />)
        ) : (
          <li className="text-muted italic">Vô chính diệu</li>
        )}
      </ul>
      <ul className="flex flex-wrap gap-x-2 gap-y-0.5">
        {cung.phu_tinh.map((s) => (
          <SaoItem key={s.ten} sao={s} />
        ))}
      </ul>
      <footer className="mt-auto flex justify-between gap-1 text-[0.7rem] text-muted">
        <span>{cung.truong_sinh}</span>
        {(cung.tuan || cung.triet) && (
          <span className="font-semibold text-cinnabar-bright">
            {[cung.tuan && "Tuần", cung.triet && "Triệt"].filter(Boolean).join(" · ")}
          </span>
        )}
      </footer>
    </section>
  );
}

export function LaSoChart({ laSo }: { laSo: LaSo }) {
  const ref = useRef<HTMLDivElement>(null);
  const { duong_lich: dl, am_lich: al } = laSo;

  // 12 cung hiện lần lượt theo vòng Tý → Hợi, rồi tới bảng thông tin ở giữa.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(CHO_PHEP_CHUYEN_DONG, () => {
        gsap
          .timeline({ defaults: { ease: "power2.out" } })
          .from("[data-cung]", { opacity: 0, scale: 0.94, y: 10, duration: 0.5, stagger: 0.06 })
          .from("[data-trung-tam]", { opacity: 0, scale: 0.96, duration: 0.8 }, 0.3);
      });
    },
    { scope: ref, dependencies: [laSo] },
  );

  return (
    <div ref={ref} className="glass grid grid-cols-2 gap-1.5 p-2 md:grid-cols-4 md:grid-rows-[repeat(4,minmax(11rem,auto))] md:p-3">
      {laSo.cung.map((c, i) => (
        <CungCell key={c.chi} cung={c} index={i} />
      ))}
      <section
        data-trung-tam
        className="relative order-first col-span-2 overflow-hidden rounded-xl border border-gold/30 bg-ink/80 p-5 md:order-none md:col-start-2 md:row-span-2 md:row-start-2"
        aria-label="Thông tin chung"
      >
        <AmDuong className="pointer-events-none absolute -right-10 -bottom-10 size-48 opacity-[0.07]" />
        <p className="eyebrow text-center">Lá số Tử Vi</p>
        <h2 className="mt-1 text-center font-display text-3xl font-bold sm:text-4xl">
          <span className="gold-text">{laSo.ho_ten || "Lá số Tử Vi"}</span>
        </h2>
        <dl className="mx-auto mt-4 grid max-w-sm grid-cols-[auto_1fr] gap-x-5 gap-y-1.5 text-sm">
          <dt className="text-muted">Giới tính</dt>
          <dd className="font-medium">
            {laSo.am_duong} {laSo.gioi_tinh === "nam" ? "Nam" : "Nữ"}
          </dd>
          <dt className="text-muted">Dương lịch</dt>
          <dd className="font-medium">
            {dl.ngay}/{dl.thang}/{dl.nam}
          </dd>
          <dt className="text-muted">Âm lịch</dt>
          <dd className="font-medium">
            {al.ngay}/{al.thang}
            {al.nhuan ? " (nhuận)" : ""} năm {laSo.can_chi_nam}
          </dd>
          <dt className="text-muted">Giờ sinh</dt>
          <dd className="font-medium">{dl.gio_chi}</dd>
          <dt className="text-muted">Nạp âm</dt>
          <dd className="font-medium">{laSo.nap_am}</dd>
          <dt className="text-muted">Cục</dt>
          <dd className="font-medium">{laSo.cuc}</dd>
          <dt className="text-muted">Mệnh / Thân</dt>
          <dd className="font-medium">
            Mệnh tại {laSo.cung_menh}, Thân cư {laSo.than_cu}
          </dd>
          <dt className="text-muted">Đại hạn</dt>
          <dd className="font-medium">{laSo.chieu_dai_han}</dd>
        </dl>
      </section>
    </div>
  );
}
