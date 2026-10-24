# Triển khai backend lên Render

Frontend chạy trên Vercel (`tuviai.id.vn`) và **không cần backend**:

- Lá số được an ngay trên trình duyệt (`apps/web/lib/laso/`, bản TypeScript của `packages/laso-engine`).
- Luận giải theo quy tắc (`apps/web/lib/luan-giai/`) cũng chạy trên trình duyệt, miễn phí, không cần cấu hình.
- Ô **"Hỏi AI"** gọi route `apps/web/app/api/luan-giai` trên Vercel. Route dùng API chuẩn OpenAI (`/chat/completions`) nên chạy được với NVIDIA build.nvidia.com, OpenRouter… Vào Vercel → project `tu-vi` → **Settings → Environment Variables**, thêm rồi **Redeploy**:

  | Biến | Bắt buộc | Mặc định / ví dụ |
  |---|---|---|
  | `AI_API_KEY` | có | key `sk-or-...` (OpenRouter) hoặc `nvapi-...` (NVIDIA) |
  | `AI_BASE_URL` | không | suy ra từ key: `https://openrouter.ai/api/v1` hoặc `https://integrate.api.nvidia.com/v1` |
  | `AI_MODEL` | không | OpenRouter: `google/gemma-4-31b-it:free`; NVIDIA: `google/gemma-4-31b-it` |

  Chỉ cần đặt `AI_API_KEY`; route tự chọn nhà cung cấp và model theo tiền tố key. Chưa có key thì ô Hỏi AI báo "chưa được cấu hình", phần còn lại vẫn chạy. Mỗi IP được hỏi 5 lần/giờ. Model `:free` của OpenRouter giới hạn 50 lượt/ngày cho cả tài khoản (1.000 lượt/ngày nếu từng nạp ≥ $10); nếu báo không dùng được model, vào OpenRouter → Settings → Privacy cho phép model miễn phí.

Phần dưới đây chỉ cần nếu muốn chạy riêng API Python trên Render. Backend gồm 2 dịch vụ Docker chạy trên **Render** (gói Free, vùng Singapore), khai báo trong `render.yaml`:

| Dịch vụ | Vai trò | Địa chỉ |
|---|---|---|
| `tuvi-api` | FastAPI: lập lá số, đổi lịch, chuyển tiếp luận giải | `https://tuvi-api.onrender.com` (có thể gắn `api.tuviai.id.vn`) |
| `tuvi-ai-engine` | Gọi Claude để luận giải | Chỉ `tuvi-api` gọi qua mạng nội bộ |

## 1. Tạo Blueprint

1. Vào https://dashboard.render.com → **New → Blueprint**, kết nối GitHub và chọn repo `phuocs0n/TuVi`.
2. Render đọc `render.yaml` và đề xuất 2 dịch vụ. Ở ô `ANTHROPIC_API_KEY` của `tuvi-ai-engine` dán API key (không commit key vào repo). Chưa có key thì để trống: lá số vẫn xem được, luận giải AI sẽ báo "chưa được cấu hình".
3. Bấm **Apply**, chờ build xong (vài phút). Mở `https://<tên-dịch-vụ>.onrender.com/health` phải trả `{"status":"ok",...}`.

> Tên dịch vụ có thể bị Render thêm hậu tố nếu `tuvi-api` đã có người dùng; hãy lấy URL thật trong trang dịch vụ.

## 2. Frontend

Web trên Vercel không gọi API Render nữa (lá số tính trên trình duyệt, luận giải chạy ở `app/api/luan-giai`), nên **không cần** đặt `NEXT_PUBLIC_API_URL`. API Render vẫn dùng được cho ứng dụng khác gọi trực tiếp.

API cho phép CORS từ `tuviai.id.vn`, `www.tuviai.id.vn` và mọi `*.vercel.app` (bản Preview).

## 3. (Tuỳ chọn) Tên miền `api.tuviai.id.vn`

1. Render → `tuvi-api` → **Settings → Custom Domains → Add** `api.tuviai.id.vn`; Render hiển thị giá trị CNAME.
2. ZoneDNS: thêm record `api` loại `CNAME` trỏ về giá trị đó.
3. Thêm `"api.$DOMAIN"` vào `HOSTS` trong `scripts/check-domain.sh`.

## Lưu ý gói Free

- Dịch vụ **ngủ sau ~15 phút không có truy cập**; lần gọi đầu tiên sau đó mất khoảng 30–60 giây để đánh thức. Request luận giải AI có thể chờ lâu hơn khi cả hai dịch vụ cùng ngủ (API đợi tối đa 90 giây).
- Muốn không bị ngủ, nâng `plan` lên `starter` trong `render.yaml`.
- `deploy.yml` (VPS) vẫn để chạy tay và không dùng cho Render: Render tự build và deploy mỗi khi có commit mới vào `main` (`autoDeployTrigger: commit`).
