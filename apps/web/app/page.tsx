import { HomeHero } from "@/components/HomeHero";
import { Reveal } from "@/components/motion/Reveal";

const TINH_NANG = [
  {
    t: "An lá số chuẩn xác",
    d: "Tự đổi dương lịch sang âm lịch (kể cả tháng nhuận), an Mệnh, Thân, Cục, 14 chính tinh và 33 phụ tinh.",
    icon: (
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z" />
    ),
  },
  {
    t: "Tứ Hóa & Đại hạn",
    d: "Hóa Lộc, Quyền, Khoa, Kỵ theo Can năm sinh; Đại hạn 10 năm đi thuận hoặc nghịch theo âm dương nam nữ.",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" fill="none" strokeWidth="1.6" />
        <path d="M12 3a4.5 4.5 0 0 1 0 9 4.5 4.5 0 0 0 0 9A9 9 0 0 1 12 3z" />
      </>
    ),
  },
  {
    t: "Luận giải & hỏi AI",
    d: "Bài luận giải theo quy tắc Tử Vi hiện ngay dưới lá số; muốn hỏi sâu từng chủ đề thì hỏi trợ lý AI.",
    icon: <path d="M4 5h16v10H9l-5 4z" fill="none" strokeWidth="1.6" strokeLinejoin="round" />,
  },
];

const BUOC = [
  { t: "Nhập ngày giờ sinh", d: "Dương lịch hoặc âm lịch, chọn canh giờ sinh." },
  { t: "Xem lá số 12 cung", d: "Bàn lá số truyền thống với đầy đủ sao, Tuần, Triệt." },
  { t: "Đọc luận giải, hỏi AI", d: "Từ tổng quan Mệnh – Thân đến đại hạn hiện tại." },
];

export default function Home() {
  return (
    <>
      <HomeHero />

      <Reveal className="mt-20">
        <h2 data-reveal className="text-center font-display text-4xl font-bold sm:text-5xl">
          Trọn vẹn một lá số <span className="gold-text italic">Tử Vi Đẩu Số</span>
        </h2>
        <ul className="mt-10 grid gap-5 md:grid-cols-3">
          {TINH_NANG.map((f) => (
            <li key={f.t} data-reveal className="glass p-6">
              <svg viewBox="0 0 24 24" className="size-9 fill-gold stroke-gold" aria-hidden>
                {f.icon}
              </svg>
              <h3 className="mt-4 font-display text-2xl font-semibold text-gold-soft">{f.t}</h3>
              <p className="mt-2 text-muted">{f.d}</p>
            </li>
          ))}
        </ul>
      </Reveal>

      <Reveal className="mt-20">
        <h2 data-reveal className="text-center font-display text-4xl font-bold sm:text-5xl">
          Ba bước để <span className="gold-text italic">xem lá số</span>
        </h2>
        <ol className="mt-10 grid gap-5 md:grid-cols-3">
          {BUOC.map((b, i) => (
            <li key={b.t} data-reveal className="relative pl-16">
              <span className="absolute top-0 left-0 grid size-12 place-items-center rounded-full border border-gold/50 font-display text-2xl font-bold text-gold">
                {i + 1}
              </span>
              <h3 className="font-display text-2xl font-semibold">{b.t}</h3>
              <p className="mt-1 text-muted">{b.d}</p>
            </li>
          ))}
        </ol>
        <p data-reveal className="mt-12 text-center">
          <a href="#lap-la-so" className="btn btn-gold">
            Lập lá số ngay
          </a>
        </p>
      </Reveal>
    </>
  );
}
