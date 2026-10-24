import Anthropic from "@anthropic-ai/sdk";
import type { LaSo, LaSoRequest, LuanGiaiResponse } from "@tuvi/shared-types";
import { NextResponse } from "next/server";

import { lapLaSo } from "@/lib/laso/tuvi";
import { SYSTEM_PROMPT, buildPrompt } from "@/lib/luan-giai/prompt";

// Luận giải chạy ngay trên Vercel (thay cho apps/api + services/ai-engine).
// Cần biến môi trường ANTHROPIC_API_KEY; LLM_MODEL tuỳ chọn.
export const maxDuration = 120;

const CAU_HOI_MAC_DINH = "Luận giải tổng quan lá số.";

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

  if (!process.env.ANTHROPIC_API_KEY) return loi("Tính năng luận giải AI chưa được cấu hình.", 503);

  const client = new Anthropic();
  try {
    const msg = await client.beta.messages.create({
      model: process.env.LLM_MODEL || "claude-sonnet-5-5",
      max_tokens: 16000,
      output_config: { effort: "medium" },
      // Khi model từ chối vì bộ lọc an toàn, API tự chạy lại trên model dự phòng
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildPrompt(laSo, [], yeuCau.cauHoi) }],
    });
    if (msg.stop_reason === "refusal") {
      return loi("AI không thể luận giải câu hỏi này, vui lòng hỏi theo cách khác.", 502);
    }
    const text = msg.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("");
    return NextResponse.json({ la_so: laSo, luan_giai: text } satisfies LuanGiaiResponse);
  } catch (e) {
    console.error("[luan-giai] Gọi Claude thất bại:", e);
    if (e instanceof Anthropic.AuthenticationError) {
      return loi("Khoá ANTHROPIC_API_KEY không hợp lệ.", 503);
    }
    if (e instanceof Anthropic.RateLimitError) {
      return loi("AI đang quá tải, vui lòng thử lại sau ít phút.", 503);
    }
    if (e instanceof Anthropic.APIError) {
      return loi("Dịch vụ luận giải AI gặp lỗi, vui lòng thử lại sau.", 502);
    }
    throw e;
  }
}
