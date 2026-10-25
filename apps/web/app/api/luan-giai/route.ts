import type { LaSo, LaSoRequest } from "@tuvi/shared-types";
import { NextResponse } from "next/server";

import { lapLaSo } from "@/lib/laso/tuvi";
import { SYSTEM_PROMPT, buildPrompt } from "@/lib/luan-giai/prompt";

// Luận giải AI chạy ngay trên Vercel, gọi một API chuẩn OpenAI (`/chat/completions`)
// nên đổi nhà cung cấp chỉ cần đổi biến môi trường:
//   AI_API_KEY   (bắt buộc) — key OpenRouter `sk-or-...` hoặc NVIDIA `nvapi-...`
//   AI_BASE_URL  (tuỳ chọn) — mặc định suy ra từ loại key
//   AI_MODEL     (tuỳ chọn) — một model hoặc danh sách cách nhau bởi dấu phẩy; model đầu
//                lỗi hoặc nghẽn thì tự chuyển sang model kế tiếp
// Trả lời được stream dần về trình duyệt; trả về text/plain chứ không phải JSON.
export const maxDuration = 300;

/** Nhà cung cấp và danh sách model dự phòng mặc định, chọn theo tiền tố của key. */
const MAC_DINH = {
  openrouter: {
    baseUrl: "https://openrouter.ai/api/v1",
    models: [
      "nvidia/nemotron-3-ultra-550b-a55b:free",
      "nvidia/nemotron-3.5-super-vl:free",
      "google/gemma-4-31b-it:free",
    ],
  },
  nvidia: { baseUrl: "https://integrate.api.nvidia.com/v1", models: ["google/gemma-4-31b-it"] },
};
const CAU_HOI_MAC_DINH = "Luận giải tổng quan lá số.";
const DO_DAI = "Trả lời gọn trong khoảng 400–600 từ; nếu có câu hỏi cụ thể thì tập trung vào câu hỏi đó.";
// Model chưa bắt đầu trả lời (chữ hoặc phần suy luận) sau CHO_BAT_DAU thì chuyển model kế;
// model cuối được chờ lâu hơn. Đã bắt đầu thì mỗi lần im lặng không quá CHO_GIUA_CHUNG.
const CHO_BAT_DAU = 40_000;
const CHO_BAT_DAU_CUOI = 90_000;
const CHO_GIUA_CHUNG = 45_000;
// Không thử model mới khi đã quá mốc này, để còn thời gian viết trước khi hết maxDuration.
const NGUNG_THU_SAU = 200_000;
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
  const url = `${(process.env.AI_BASE_URL || macDinh.baseUrl).replace(/\/$/, "")}/chat/completions`;
  const tuBien = (process.env.AI_MODEL ?? "").split(",").map((m) => m.trim()).filter(Boolean);
  const danhSach = tuBien.length ? tuBien : macDinh.models;
  const body = {
    max_tokens: 2048,
    stream: true,
    messages: [
      { role: "system", content: `${SYSTEM_PROMPT} ${DO_DAI}` },
      { role: "user", content: buildPrompt(laSo, [], yeuCau.cauHoi) },
    ],
  };

  const batDau = Date.now();
  let loiCuoi: LoiThu = "mat-ket-noi";
  for (const [i, model] of danhSach.entries()) {
    if (i > 0 && Date.now() - batDau > NGUNG_THU_SAU) break;
    const cuoi = i === danhSach.length - 1;
    const kq = await thuModel(url, apiKey, { ...body, model }, cuoi ? CHO_BAT_DAU_CUOI : CHO_BAT_DAU);
    if (kq.kind === "xong") return new Response(kq.text, { headers: HEADER_STREAM });
    if (kq.kind === "chay") {
      console.info(`[luan-giai] Trả lời bằng ${model}`);
      return new Response(chuyenTiep(kq), { headers: HEADER_STREAM });
    }
    loiCuoi = kq.loi;
    // Key sai thì model nào cũng bị từ chối như nhau, thử tiếp vô ích.
    if (kq.loi === 401 || kq.loi === 403) break;
  }
  if (loiCuoi === "het-gio") {
    return loi("AI đang quá tải, các model đều chưa phản hồi. Vui lòng thử lại sau ít phút.", 504);
  }
  if (loiCuoi === "mat-ket-noi") return loi("Không kết nối được dịch vụ AI.", 504);
  if (loiCuoi === "rong") return loi("AI không trả về nội dung, vui lòng thử lại.", 502);
  return loiNhaCungCap(loiCuoi, danhSach.join(", "));
}

type GoiSse = {
  choices?: {
    delta?: { content?: string | null; reasoning?: string | null; reasoning_content?: string | null };
  }[];
  error?: { message?: string };
};

/** Mã HTTP lỗi, hoặc: hết giờ chờ, mất kết nối, trả về rỗng. */
type LoiThu = number | "het-gio" | "mat-ket-noi" | "rong";

type KetQuaThu =
  | { kind: "chay"; dau: string; tiep: AsyncGenerator<GoiSse>; ctrl: AbortController }
  | { kind: "xong"; text: string }
  | { kind: "loi"; loi: LoiThu };

/** Đọc từng gói `data:` của stream SSE; bỏ qua dòng giữ kết nối (`: ...`). */
async function* docSse(body: ReadableStream<Uint8Array>): AsyncGenerator<GoiSse> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let dem = "";
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) return;
      dem += decoder.decode(value, { stream: true });
      const dong = dem.split("\n");
      dem = dong.pop() ?? "";
      for (const d of dong) {
        const payload = d.startsWith("data:") ? d.slice(5).trim() : "";
        if (!payload) continue;
        if (payload === "[DONE]") return;
        const goi = JSON.parse(payload) as GoiSse;
        // OpenRouter báo lỗi giữa chừng (vd. nhà cung cấp sập) ngay trong stream.
        if (goi.error) throw new Error(goi.error.message ?? "lỗi trong stream");
        yield goi;
      }
    }
  } finally {
    await reader.cancel().catch(() => {});
  }
}

/** Gọi một model và chờ tới khi nó bắt đầu trả lời (chữ hoặc phần suy luận), tối đa `choBatDau`. */
async function thuModel(url: string, apiKey: string, body: object, choBatDau: number): Promise<KetQuaThu> {
  const model = (body as { model: string }).model;
  const ctrl = new AbortController();
  const hetGio = setTimeout(() => ctrl.abort(), choBatDau);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    if (!res.ok || !res.body) {
      const chiTiet = await res.text().catch(() => "");
      console.warn(`[luan-giai] ${model} trả về ${res.status}:`, chiTiet.slice(0, 300));
      return { kind: "loi", loi: res.status };
    }
    // Nhà cung cấp không hỗ trợ stream thì nhận nguyên JSON một lần.
    if (!res.headers.get("content-type")?.includes("text/event-stream")) {
      const data = (await res.json().catch(() => null)) as {
        choices?: { message?: { content?: string | null } }[];
      } | null;
      const text = data?.choices?.[0]?.message?.content?.trim();
      return text ? { kind: "xong", text } : { kind: "loi", loi: "rong" };
    }
    const tiep = docSse(res.body);
    for (;;) {
      const r = await tiep.next();
      if (r.done) {
        console.warn(`[luan-giai] ${model} kết thúc mà không trả lời`);
        return { kind: "loi", loi: "rong" };
      }
      const delta = r.value.choices?.[0]?.delta;
      if (delta?.content) return { kind: "chay", dau: delta.content, tiep, ctrl };
      if (delta?.reasoning || delta?.reasoning_content) return { kind: "chay", dau: "", tiep, ctrl };
    }
  } catch (e) {
    const loiThu = ctrl.signal.aborted ? "het-gio" : "mat-ket-noi";
    console.warn(`[luan-giai] ${model}: ${loiThu}`, e);
    return { kind: "loi", loi: loiThu };
  } finally {
    clearTimeout(hetGio);
  }
}

/** Chuyển tiếp phần chữ của model đã bắt đầu trả lời về trình duyệt. */
function chuyenTiep({ dau, tiep, ctrl }: Extract<KetQuaThu, { kind: "chay" }>): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  let hetGio: ReturnType<typeof setTimeout> | undefined;
  const giaHan = () => {
    clearTimeout(hetGio);
    hetGio = setTimeout(() => ctrl.abort(), CHO_GIUA_CHUNG);
  };
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      let coChu = Boolean(dau);
      if (dau) controller.enqueue(encoder.encode(dau));
      giaHan();
      try {
        for (;;) {
          const r = await tiep.next();
          if (r.done) break;
          giaHan();
          const chunk = r.value.choices?.[0]?.delta?.content;
          if (chunk) {
            coChu = true;
            controller.enqueue(encoder.encode(chunk));
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
}
