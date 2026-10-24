import type { LaSo, LaSoRequest } from "@tuvi/shared-types";
import { NextResponse } from "next/server";

import { lapLaSo } from "@/lib/laso/tuvi";
import { SYSTEM_PROMPT, buildPrompt } from "@/lib/luan-giai/prompt";

// Luận giải AI chạy ngay trên Vercel, gọi một API chuẩn OpenAI (`/chat/completions`)
// nên đổi nhà cung cấp chỉ cần đổi biến môi trường:
//   AI_API_KEY   (bắt buộc) — key OpenRouter `sk-or-...` hoặc NVIDIA `nvapi-...`
//   AI_BASE_URL  (tuỳ chọn) — mặc định suy ra từ loại key
//   AI_MODEL     (tuỳ chọn) — mặc định Gemma 4 31B (bản free nếu là OpenRouter)
// Trả lời được stream dần về trình duyệt; trả về text/plain chứ không phải JSON.
export const maxDuration = 300;

/** Nhà cung cấp mặc định theo tiền tố của key. */
const MAC_DINH = {
  openrouter: { baseUrl: "https://openrouter.ai/api/v1", model: "google/gemma-4-31b-it:free" },
  nvidia: { baseUrl: "https://integrate.api.nvidia.com/v1", model: "google/gemma-4-31b-it" },
};
const CAU_HOI_MAC_DINH = "Luận giải tổng quan lá số.";
const DO_DAI = "Trả lời gọn trong khoảng 400–600 từ; nếu có câu hỏi cụ thể thì tập trung vào câu hỏi đó.";
const CHO_BAT_DAU = 90_000;
const CHO_GIUA_CHUNG = 45_000;
const HEADER_STREAM = { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" };

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
  if (status === 402) return loi("Tài khoản AI đã hết credit — dùng model miễn phí (:free) hoặc nạp thêm.", 503);
  if (status === 404) {
    return loi(
      `Không dùng được model "${model}" — kiểm tra biến AI_MODEL; với OpenRouter, ` +
        "vào Settings → Privacy để cho phép các model miễn phí.",
      503,
    );
  }
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

  const macDinh = apiKey.startsWith("sk-or-") ? MAC_DINH.openrouter : MAC_DINH.nvidia;
  const baseUrl = (process.env.AI_BASE_URL || macDinh.baseUrl).replace(/\/$/, "");
  const model = process.env.AI_MODEL || macDinh.model;
  // Dịch vụ miễn phí có thể xếp hàng lâu: chờ chữ đầu tiên tối đa CHO_BAT_DAU, sau đó mỗi
  // lần im lặng không quá CHO_GIUA_CHUNG. Chữ được chuyển tiếp ngay cho trình duyệt.
  const ctrl = new AbortController();
  let hetGio = setTimeout(() => ctrl.abort(), CHO_BAT_DAU);
  const giaHan = () => {
    clearTimeout(hetGio);
    hetGio = setTimeout(() => ctrl.abort(), CHO_GIUA_CHUNG);
  };

  let res: Response;
  try {
    res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
      body: JSON.stringify({
        model,
        max_tokens: 2048,
        stream: true,
        messages: [
          { role: "system", content: `${SYSTEM_PROMPT} ${DO_DAI}` },
          { role: "user", content: buildPrompt(laSo, [], yeuCau.cauHoi) },
        ],
      }),
      signal: ctrl.signal,
    });
  } catch (e) {
    clearTimeout(hetGio);
    console.error(`[luan-giai] Không gọi được ${baseUrl}:`, e);
    return ctrl.signal.aborted
      ? loi("AI đang quá tải, chưa phản hồi sau 90 giây. Vui lòng thử lại sau ít phút.", 504)
      : loi("Không kết nối được dịch vụ AI.", 504);
  }
  if (!res.ok || !res.body) {
    clearTimeout(hetGio);
    console.error(`[luan-giai] ${baseUrl} trả về ${res.status}:`, await res.text().catch(() => ""));
    return loiNhaCungCap(res.status, model);
  }
  giaHan();

  // Nhà cung cấp không hỗ trợ stream thì trả nguyên JSON một lần.
  if (!res.headers.get("content-type")?.includes("text/event-stream")) {
    clearTimeout(hetGio);
    const data = (await res.json().catch(() => null)) as {
      choices?: { message?: { content?: string | null } }[];
    } | null;
    const text = data?.choices?.[0]?.message?.content?.trim();
    if (!text) return loi("AI không trả về nội dung, vui lòng thử lại.", 502);
    return new Response(text, { headers: HEADER_STREAM });
  }

  const nguon = res.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let dem = "";
      let coChu = false;
      try {
        for (;;) {
          const { done, value } = await nguon.read();
          if (done) break;
          giaHan();
          dem += decoder.decode(value, { stream: true });
          const dong = dem.split("\n");
          dem = dong.pop() ?? "";
          for (const d of dong) {
            const payload = d.startsWith("data:") ? d.slice(5).trim() : "";
            if (!payload || payload === "[DONE]") continue;
            const goi = JSON.parse(payload) as {
              choices?: { delta?: { content?: string | null } }[];
              error?: { message?: string };
            };
            // OpenRouter báo lỗi giữa chừng (vd. nhà cung cấp sập) ngay trong stream.
            if (goi.error) throw new Error(goi.error.message ?? "lỗi trong stream");
            const chunk = goi.choices?.[0]?.delta?.content;
            if (chunk) {
              coChu = true;
              controller.enqueue(encoder.encode(chunk));
            }
          }
        }
        if (!coChu) controller.enqueue(encoder.encode("⚠️ AI không trả về nội dung, vui lòng thử lại."));
      } catch (e) {
        console.error("[luan-giai] Stream bị ngắt:", e);
        controller.enqueue(encoder.encode("\n\n⚠️ AI bị ngắt giữa chừng, vui lòng thử lại."));
      } finally {
        clearTimeout(hetGio);
        controller.close();
      }
    },
    cancel() {
      clearTimeout(hetGio);
      ctrl.abort();
    },
  });
  return new Response(stream, { headers: HEADER_STREAM });
}
