import type { ReactNode } from "react";

export const metadata = {
  title: "Tử Vi AI",
  description: "Lập lá số Tử Vi và luận giải bằng AI",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
