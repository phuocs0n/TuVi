import { LaSoForm } from "@/components/LaSoForm";

const TINH_NANG = [
  { t: "An lá số chuẩn", d: "Tự đổi dương lịch sang âm lịch (xử lý tháng nhuận), an Mệnh, Thân, Cục, 14 chính tinh và phụ tinh." },
  { t: "Tứ Hóa & Đại hạn", d: "Hóa Lộc, Quyền, Khoa, Kỵ theo Can năm sinh; Đại hạn 10 năm thuận hoặc nghịch theo âm dương nam nữ." },
  { t: "Luận giải bằng AI", d: "AI đọc toàn bộ lá số và trả lời theo chủ đề bạn quan tâm: công danh, tình duyên, tài lộc." },
];

export default function Home() {
  return (
    <>
      <section className="hero">
        <div>
          <h1>Lập lá số Tử Vi &amp; luận giải bằng AI</h1>
          <p className="lead">
            Nhập ngày giờ sinh để xem lá số Tử Vi Đẩu Số đầy đủ 12 cung, kèm luận giải cá nhân hóa.
          </p>
          <ul className="features">
            {TINH_NANG.map((f) => (
              <li key={f.t}>
                <strong>{f.t}</strong>
                <span>{f.d}</span>
              </li>
            ))}
          </ul>
        </div>
        <LaSoForm />
      </section>
    </>
  );
}
