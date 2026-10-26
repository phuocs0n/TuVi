import "@fontsource/be-vietnam-pro/400.css";
import "@fontsource/be-vietnam-pro/500.css";
import "@fontsource/be-vietnam-pro/600.css";
import "@fontsource/cormorant-garamond/600.css";
import "@fontsource/cormorant-garamond/600-italic.css";
import "@fontsource/cormorant-garamond/700.css";

import type { Metadata, Viewport } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { Starfield } from "@/components/motion/Starfield";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://tuviai.id.vn"),
  title: { default: "Tử Vi AI – Lập lá số và luận giải bằng AI", template: "%s | Tử Vi AI" },
  description:
    "Lập lá số Tử Vi Đẩu Số miễn phí: an 12 cung, 14 chính tinh, phụ tinh, Tứ Hóa, Đại hạn và luận giải bằng AI.",
  openGraph: { title: "Tử Vi AI", description: "Lập lá số Tử Vi và luận giải bằng AI", locale: "vi_VN", type: "website" },
};

export const viewport: Viewport = { themeColor: "#0b1020" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <body className="flex min-h-dvh flex-col">
        <Starfield />
        <header className="no-print sticky top-0 z-20 border-b border-line bg-ink/70 backdrop-blur-md">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
            <Link href="/" className="group flex items-center gap-3 no-underline">
              <span
                aria-hidden
                className="grid size-9 place-items-center rounded-md bg-cinnabar font-display text-lg font-bold text-gold-soft shadow-[0_0_18px_-4px] shadow-cinnabar transition-transform group-hover:rotate-6"
              >
                紫
              </span>
              <span className="font-display text-2xl font-bold tracking-wide text-ivory">
                Tử Vi <span className="gold-text">AI</span>
              </span>
            </Link>
            <Link href="/#lap-la-so" className="btn btn-ghost px-4 py-2 text-sm">
              Lập lá số
            </Link>
          </nav>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-16 sm:px-6">{children}</main>

        <footer className="no-print border-t border-line px-4 py-8 text-center text-sm text-muted">
          <p className="mb-2 font-display text-base tracking-[0.3em] text-gold-dim" aria-hidden>
            ✦ ✦ ✦
          </p>
          <p>
            Nội dung luận giải mang tính tham khảo, không thay thế tư vấn chuyên môn về sức khỏe, tài chính hay pháp lý.
          </p>
          <p className="mt-1">© {new Date().getFullYear()} Tử Vi AI · tuviai.id.vn</p>
        </footer>
      </body>
    </html>
  );
}
