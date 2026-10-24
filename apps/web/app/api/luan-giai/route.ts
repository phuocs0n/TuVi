import type { LaSo, LaSoRequest, LuanGiaiResponse } from "@tuvi/shared-types";
import { NextResponse } from "next/server";

import { lapLaSo } from "@/lib/laso/tuvi";
import { SYSTEM_PROMPT, buildPrompt } from "@/lib/luan-giai/prompt";

// Luận giải AI chạy ngay trên Vercel, gọi một API chuẩn OpenAI (`/chat/completions`)
// nên đổi nhà cung cấp chỉ cần đổi biến môi trường:
//   AI_API_KEY   (bắt buộc) — ví dụ key `nvapi-...` của build.nvidia.com
//   AI_BASE_URL  (tuỳ chọn) — mặc định NVIDIA; OpenRouter là https://openrouter.ai/api/v1
//   AI_MODEL     (tuỳ chọn) — mặc định google/gemma-4-31b-it
export const maxDuration = 120;

const BASE_URL_MAC_DINH = "https://integrate.api.nvidia.com/v1";
const MODEL_MAC_DINH = "google/gemma-4-31b-it";
const CAU_HOI_MAC_DINH = "Luận giải tổng quan lá số.";

// Giới hạn lượt theo IP. Bộ đếm nằm trong bộ nhớ của từng máy chủ nên chỉ chặn được spam
// thông thường, không chính xác tuyệt đối khi Vercel chạy nhiều máy chủ cùng lúc.
const LUOT_MOI_GIO = 5;
const MOT_GIO = 60 * 60 * 1000;
const luotTheoIp = new Map<string, number[]>();

function conLuot(ip: string, now = Date.now()): boolean {
  if (luotTheoIp.size > 10_000) {
    for (const [k, ds] of luotTheoIp) if (ds.every((t) => now - t > MOT_GIO)) luotTheoIp.delete(k);
  }
  const ds = (luotTheoIp.get(ip) ?? []).filter((t) => now - t < MOT_GIO);
  if (ds.length >= LUOT_MOI_GIO) return false;
  luotTheoIp.set(ip, [...ds, now]);
  return true;
}

const loi = (detail: string, status: number) => NextResponse.json({ detail }, { status });

/** Đọc body giống `LuanGiaiRequest` ở apps/api; trả null nếu sai kiểu. */
function docYeuCau(body: unknown): { req: LaSoRequest; cauHoi: string } | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  const cauHoi = b.cau_hoi ?? CAU_HOI_MAC_DINH;
  if (
    typeof (b.ho_ten ?? "") !== "string" ||
    (b.gioi_tinh !== "nam" && b.gioi_tinh !== "nu") ||
    ![b.ngay, b.thang, b.nam, b.gio].every((v) => typeof v === "number") ||
    ![undefined, "duong", "am"].includes(b.lich as string | undefined) ||
    typeof (b.nhuan ?? false) !== "boolean" ||
    typeof cauHoi !== "string" ||
    cauHoi.length > 500
  ) {
    return null;
  }
  return {
    req: {
      ho_ten: (b.ho_ten as string | undefined) ?? "",
      gioi_tinh: b.gioi_tinh,
      ngay: b.ngay as number,
      thang: b.thang as number,
      nam: b.nam as number,
      gio: b.gio as number,
      lich: (b.lich as "duong" | "am" | undefined) ?? "duong",
      nhuan: (b.nhuan as boolean | undefined) ?? false,
    },
    cauHoi: cauHoi.trim() || CAU_HOI_MAC_DINH,
  };
}

/** Lỗi HTTP từ nhà cung cấp AI -> thông báo cho người dùng. */
function loiNhaCungCap(status: number, model: string) {
  if (status === 401 || status === 403) return loi("Khoá AI_API_KEY không hợp lệ hoặc hết hạn.", 503);
  if (status === 404) return loi(`Không tìm thấy model "${model}" — kiểm tra lại biến AI_MODEL.`, 503);
  if (status === 429) return loi("AI đang quá tải hoặc đã hết lượt miễn phí, vui lòng thử lại sau.", 503);
  return loi("Dịch vụ luận giải AI gặp lỗi, vui lòng thử lại sau.", 502);
}

export async function POST(request: Request) {
  const yeuCau = docYeuCau(await request.json().catch(() => null));
  if (!yeuCau) return loi("Thông tin nhập chưa hợp lệ, vui lòng kiểm tra lại.", 422);

  let laSo: LaSo;
  try {
    laSo = lapLaSo(yeuCau.req);
  } catch (e) {
    if (e instanceof RangeError) return loi(e.message, 422);
    throw e;
  }

  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) return loi("Tính năng luận giải AI chưa được cấu hình.", 503);

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "khong-ro";
  if (!conLuot(ip)) return loi(`Bạn đã hỏi AI ${LUOT_MOI_GIO} lần trong 1 giờ qua, vui lòng quay lại sau.`, 429);

  const baseUrl = (process.env.AI_BASE_URL || BASE_URL_MAC_DINH).replace(/\/$/, "");
  const model = process.env.AI_MODEL || MODEL_MAC_DINH;
  let res: Response;
  try {
    res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
      body: JSON.stringify({
        model,
        max_tokens: 4096,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildPrompt(laSo, [], yeuCau.cauHoi) },
        ],
      }),
      signal: AbortSignal.timeout(100_000),
    });
  } catch (e) {
    console.error(`[luan-giai] Không gọi được ${baseUrl}:`, e);
    const hetGio = e instanceof DOMException && e.name === "TimeoutError";
    return loi(hetGio ? "AI phản hồi quá lâu, vui lòng thử lại." : "Không kết nối được dịch vụ AI.", 504);
  }
  if (!res.ok) {
    console.error(`[luan-giai] ${baseUrl} trả về ${res.status}:`, await res.text().catch(() => ""));
    return loiNhaCungCap(res.status, model);
  }

  const data = (await res.json().catch(() => null)) as {
    choices?: { message?: { content?: string | null } }[];
  } | null;
  // Một số model suy luận trả kèm phần nháp trong <think>…</think>; bỏ đi trước khi hiển thị.
  const text = (data?.choices?.[0]?.message?.content ?? "").replace(/<think>[\s\S]*?<\/think>/g, "").trim();
  if (!text) return loi("AI không trả về nội dung, vui lòng thử lại.", 502);
  return NextResponse.json({ la_so: laSo, luan_giai: text } satisfies LuanGiaiResponse);
}
