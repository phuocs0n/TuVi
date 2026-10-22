# Triển khai backend lên Render

Frontend chạy trên Vercel (`tuviai.id.vn`) và **tự tính lá số ngay trên trình duyệt** (gói `packages/laso-ts`), nên xem lá số không cần backend. Backend trên Render chỉ phục vụ **luận giải AI** (và API công khai). Backend gồm 2 dịch vụ Docker chạy trên **Render** (gói Free, vùng Singapore), khai báo trong `render.yaml`:

| Dịch vụ | Vai trò | Địa chỉ |
|---|---|---|
| `tuvi-api` | FastAPI: lập lá số, đổi lịch, chuyển tiếp luận giải | `https://tuvi-api.onrender.com` (có thể gắn `api.tuviai.id.vn`) |
| `tuvi-ai-engine` | Gọi Claude để luận giải | Chỉ `tuvi-api` gọi qua mạng nội bộ |

## 1. Tạo Blueprint

1. Vào https://dashboard.render.com → **New → Blueprint**, kết nối GitHub và chọn repo `phuocs0n/TuVi`.
2. Render đọc `render.yaml` và đề xuất 2 dịch vụ. Ở ô `ANTHROPIC_API_KEY` của `tuvi-ai-engine` dán API key (không commit key vào repo). Chưa có key thì để trống: lá số vẫn xem được, luận giải AI sẽ báo "chưa được cấu hình".
3. Bấm **Apply**, chờ build xong (vài phút). Mở `https://<tên-dịch-vụ>.onrender.com/health` phải trả `{"status":"ok",...}`.

> Tên dịch vụ có thể bị Render thêm hậu tố nếu `tuvi-api` đã có người dùng; hãy lấy URL thật trong trang dịch vụ.

## 2. Trỏ frontend về API (chỉ cần cho luận giải AI)

Vercel → project `tu-vi` → **Settings → Environment Variables**:

| Biến | Giá trị |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL của `tuvi-api` trên Render, ví dụ `https://tuvi-api.onrender.com` |

Sau khi lưu, vào **Deployments → Redeploy** (biến `NEXT_PUBLIC_*` được nhúng lúc build nên bắt buộc build lại).

API cho phép CORS từ `tuviai.id.vn`, `www.tuviai.id.vn` và mọi `*.vercel.app` (bản Preview).

## 3. (Tuỳ chọn) Tên miền `api.tuviai.id.vn`

1. Render → `tuvi-api` → **Settings → Custom Domains → Add** `api.tuviai.id.vn`; Render hiển thị giá trị CNAME.
2. ZoneDNS: thêm record `api` loại `CNAME` trỏ về giá trị đó.
3. Đổi `NEXT_PUBLIC_API_URL` thành `https://api.tuviai.id.vn` và build lại frontend.
4. Thêm `"api.$DOMAIN"` vào `HOSTS` trong `scripts/check-domain.sh`.

## Lưu ý gói Free

- Dịch vụ **ngủ sau ~15 phút không có truy cập**; lần gọi đầu tiên sau đó mất khoảng 30–60 giây để đánh thức. Request luận giải AI có thể chờ lâu hơn khi cả hai dịch vụ cùng ngủ (API đợi tối đa 90 giây).
- Muốn không bị ngủ, nâng `plan` lên `starter` trong `render.yaml`.
- `deploy.yml` (VPS) vẫn để chạy tay và không dùng cho Render: Render tự build và deploy mỗi khi có commit mới vào `main` (`autoDeployTrigger: commit`).

## Hai engine, một nguồn chuẩn

Thuật toán an lá số có hai bản: Python (`packages/laso-engine`, **nguồn chuẩn**, dùng cho API và AI) và TypeScript (`packages/laso-ts`, chạy trên trình duyệt). Để hai bản không lệch nhau:

- `packages/laso-engine/tests/golden_gen.py` sinh `packages/laso-ts/test/golden.json` (mọi mùng 1 âm lịch 1900–2100, hơn 500 lá số mẫu và các ca lỗi, so bằng băm SHA-256 của toàn bộ kết quả).
- Sửa công thức ở Python thì chạy `uv run python packages/laso-engine/tests/golden_gen.py` rồi sửa bản TypeScript cho khớp. Test Python (`test_golden.py`) sẽ báo đỏ nếu quên sinh lại, test `vitest` báo đỏ nếu bản TypeScript lệch.
