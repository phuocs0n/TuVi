import type { LaSo, LaSoRequest, LuanGiaiResponse } from "@tuvi/shared-types";

import { lapLaSo as anLaSo } from "@/lib/laso/tuvi";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function post<T>(url: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (e) {
    // fetch chỉ ném lỗi khi không tới được máy chủ (sai URL, máy chủ tắt, bị CORS chặn…)
    console.error(`[api] POST ${url} thất bại:`, e);
    throw new ApiError(`Không kết nối được máy chủ (${url}). Vui lòng thử lại sau.`, 0);
  }
  const data: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    console.error(`[api] POST ${url} trả về ${res.status}:`, data);
    throw new ApiError(errorMessage(data) ?? `Lỗi máy chủ (${res.status}) tại ${url}`, res.status);
  }
  return data as T;
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

/** Lá số được an ngay trên trình duyệt; luận giải AI gọi route `app/api/luan-giai` cùng tên miền. */
export const luanGiai = (req: LaSoRequest, cauHoi?: string) =>
  post<LuanGiaiResponse>("/api/luan-giai", cauHoi ? { ...req, cau_hoi: cauHoi } : req);
