import type { Cung, LaSo, Sao } from "@tuvi/shared-types";

/** Vị trí ô (hàng, cột) của 12 cung trên bàn 4x4 truyền thống, theo thứ tự Tý..Hợi. */
const VI_TRI: [number, number][] = [
  [4, 3], [4, 2], [4, 1], [3, 1], [2, 1], [1, 1],
  [1, 2], [1, 3], [1, 4], [2, 4], [3, 4], [4, 4],
];

function SaoItem({ sao, chinh }: { sao: Sao; chinh?: boolean }) {
  return (
    <li className={chinh ? "sao chinh" : "sao"}>
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
      className={`cung${laMenh ? " menh" : ""}`}
      style={{ gridRow: row, gridColumn: col }}
      aria-label={`Cung ${cung.ten_cung} tại ${cung.chi}`}
    >
      <header>
        <span className="canchi">
          {cung.can} {cung.chi}
        </span>
        <span className="ten-cung">
          {cung.ten_cung}
          {cung.la_than && <em className="badge">Thân</em>}
        </span>
        <span className="dai-han">{cung.dai_han.tu}</span>
      </header>
      <ul className="chinh-tinh">
        {cung.chinh_tinh.length ? (
          cung.chinh_tinh.map((s) => <SaoItem key={s.ten} sao={s} chinh />)
        ) : (
          <li className="sao vo">Vô chính diệu</li>
        )}
      </ul>
      <ul className="phu-tinh">
        {cung.phu_tinh.map((s) => (
          <SaoItem key={s.ten} sao={s} />
        ))}
      </ul>
      <footer>
        <span>{cung.truong_sinh}</span>
        {(cung.tuan || cung.triet) && (
          <span className="tuan-triet">{[cung.tuan && "Tuần", cung.triet && "Triệt"].filter(Boolean).join(" · ")}</span>
        )}
      </footer>
    </section>
  );
}

export function LaSoChart({ laSo }: { laSo: LaSo }) {
  const { duong_lich: dl, am_lich: al } = laSo;
  return (
    <div className="chart">
      {laSo.cung.map((c, i) => (
        <CungCell key={c.chi} cung={c} index={i} />
      ))}
      <section className="chart-center" aria-label="Thông tin chung">
        <h2>{laSo.ho_ten || "Lá số Tử Vi"}</h2>
        <dl>
          <dt>Giới tính</dt>
          <dd>
            {laSo.am_duong} {laSo.gioi_tinh === "nam" ? "Nam" : "Nữ"}
          </dd>
          <dt>Dương lịch</dt>
          <dd>
            {dl.ngay}/{dl.thang}/{dl.nam}
          </dd>
          <dt>Âm lịch</dt>
          <dd>
            {al.ngay}/{al.thang}
            {al.nhuan ? " (nhuận)" : ""} năm {laSo.can_chi_nam}
          </dd>
          <dt>Giờ sinh</dt>
          <dd>{dl.gio_chi}</dd>
          <dt>Nạp âm</dt>
          <dd>{laSo.nap_am}</dd>
          <dt>Cục</dt>
          <dd>{laSo.cuc}</dd>
          <dt>Mệnh / Thân</dt>
          <dd>
            Mệnh tại {laSo.cung_menh}, Thân cư {laSo.than_cu}
          </dd>
          <dt>Đại hạn</dt>
          <dd>{laSo.chieu_dai_han}</dd>
        </dl>
      </section>
    </div>
  );
}
