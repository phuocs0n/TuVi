import type { LaSoRequest, LuanGiaiResponse } from "@tuvi/shared-types";

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function post<T>(path: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiError("Không kết nối được máy chủ. Vui lòng thử lại sau.", 0);
  }
  const data: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(errorMessage(data) ?? `Lỗi máy chủ (${res.status})`, res.status);
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

// Lá số được tính ngay trên trình duyệt (@tuvi/laso); chỉ luận giải AI mới gọi máy chủ.
export const luanGiai = (req: LaSoRequest, cauHoi?: string) =>
  post<LuanGiaiResponse>("/v1/luan-giai", cauHoi ? { ...req, cau_hoi: cauHoi } : req);
