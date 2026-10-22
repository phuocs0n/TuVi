import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://tuviai.id.vn"),
  title: { default: "Tử Vi AI – Lập lá số và luận giải bằng AI", template: "%s | Tử Vi AI" },
  description:
    "Lập lá số Tử Vi Đẩu Số miễn phí: an 12 cung, 14 chính tinh, phụ tinh, Tứ Hóa, Đại hạn và luận giải bằng AI.",
  openGraph: { title: "Tử Vi AI", description: "Lập lá số Tử Vi và luận giải bằng AI", locale: "vi_VN", type: "website" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <header className="site-header">
          <Link href="/" className="logo">
            <span aria-hidden>☯</span> Tử Vi AI
          </Link>
        </header>
        <main className="container">{children}</main>
        <footer className="site-footer">
          <p>
            Nội dung luận giải mang tính tham khảo, không thay thế tư vấn chuyên môn về sức khỏe,
            tài chính hay pháp lý.
          </p>
          <p>© {new Date().getFullYear()} Tử Vi AI · tuviai.id.vn</p>
        </footer>
      </body>
    </html>
  );
}
