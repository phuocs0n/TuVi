import type { LaSo, LaSoRequest } from "@tuvi/shared-types";

import { lapLaSo as anLaSo } from "@/lib/laso/tuvi";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

function errorMessage(data: unknown): string | null {
  if (!data || typeof data !== "object" || !("detail" in data)) return null;
  const { detail } = data as { detail: unknown };
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return "Thông tin nhập chưa hợp lệ, vui lòng kiểm tra lại.";
  return null;
}

export async function lapLaSo(req: LaSoRequest): Promise<LaSo> {
  try {
    return anLaSo(req);
  } catch (e) {
    if (e instanceof RangeError) throw new ApiError(e.message, 422);
    throw e;
  }
}

/**
 * Hỏi AI qua route `app/api/luan-giai` cùng tên miền. Câu trả lời được stream dần:
 * `onText` nhận toàn bộ phần chữ đã có sau mỗi lần nhận thêm.
 */
export async function luanGiai(
  req: LaSoRequest,
  cauHoi: string | undefined,
  onText: (text: string) => void,
): Promise<string> {
  const url = "/api/luan-giai";
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(cauHoi ? { ...req, cau_hoi: cauHoi } : req),
    });
  } catch (e) {
    console.error(`[api] POST ${url} thất bại:`, e);
    throw new ApiError("Không kết nối được máy chủ. Vui lòng thử lại sau.", 0);
  }
  if (!res.ok || !res.body) {
    const data: unknown = await res.json().catch(() => null);
    console.error(`[api] POST ${url} trả về ${res.status}:`, data);
    throw new ApiError(errorMessage(data) ?? `Lỗi máy chủ (${res.status})`, res.status);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let text = "";
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      text += decoder.decode(value, { stream: true });
      onText(text);
    }
  } catch (e) {
    console.error(`[api] Stream ${url} bị ngắt:`, e);
    text += "\n\n⚠️ Mất kết nối giữa chừng, vui lòng thử lại.";
    onText(text);
  }
  return text;
}
