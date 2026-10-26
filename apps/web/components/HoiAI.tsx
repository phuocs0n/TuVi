"use client";

import type { LaSoRequest } from "@tuvi/shared-types";
import { type ReactNode, useState } from "react";

import { AmDuong } from "@/components/AmDuong";
import { ApiError, luanGiai } from "@/lib/api";

type State =
  | { kind: "idle" }
  | { kind: "loading"; text: string }
  | { kind: "done"; text: string }
  | { kind: "error"; message: string };

/** Bỏ phần nháp <think>…</think> của model suy luận, kể cả khi thẻ đóng chưa tới. */
const boNhap = (text: string) => text.replace(/<think>[\s\S]*?(<\/think>|$)/g, "").trim();

const GOI_Y = ["Công danh sự nghiệp", "Tình duyên, gia đạo", "Tài lộc năm nay"];

/** In đậm **…** trong một dòng. */
function dong(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? <strong key={i}>{p.slice(2, -2)}</strong> : p,
  );
}

/** Hiển thị Markdown đơn giản (tiêu đề, gạch đầu dòng, in đậm) mà không chèn HTML thô. */
function VanBan({ text }: { text: string }) {
  const khoi: ReactNode[] = [];
  let ds: string[] = [];
  const dongDanhSach = () => {
    if (ds.length) khoi.push(<ul key={khoi.length}>{ds.map((d, i) => <li key={i}>{dong(d)}</li>)}</ul>);
    ds = [];
  };
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    const muc = /^[-*•]\s+(.*)$/.exec(line);
    if (muc) {
      ds.push(muc[1]);
      continue;
    }
    dongDanhSach();
    if (!line || /^-{3,}$/.test(line)) continue;
    const tieuDe = /^#{1,6}\s+(.*)$/.exec(line);
    khoi.push(tieuDe ? <h4 key={khoi.length}>{dong(tieuDe[1])}</h4> : <p key={khoi.length}>{dong(line)}</p>);
  }
  dongDanhSach();
  return <div className="answer">{khoi}</div>;
}

export function HoiAI({ req }: { req: LaSoRequest }) {
  const [state, setState] = useState<State>({ kind: "idle" });
  const [cauHoi, setCauHoi] = useState("");

  const run = async (q?: string) => {
    setState({ kind: "loading", text: "" });
    try {
      const text = await luanGiai(req, q?.trim() || undefined, (t) => setState({ kind: "loading", text: t }));
      setState({ kind: "done", text });
    } catch (e) {
      setState({ kind: "error", message: e instanceof ApiError ? e.message : "Đã có lỗi xảy ra." });
    }
  };

  return (
    <section className="glass no-print relative mt-8 overflow-hidden p-6 sm:p-10" aria-live="polite">
      <span
        aria-hidden
        className="absolute -top-px left-10 right-10 h-px bg-linear-to-r from-transparent via-cinnabar-bright to-transparent"
      />
      <p className="eyebrow">Trợ lý AI</p>
      <h2 className="mt-1 font-display text-4xl font-bold">
        Hỏi <span className="gold-text italic">AI</span>
      </h2>
      <p className="mt-2 text-sm text-muted">
        Hỏi riêng một chủ đề, AI sẽ đọc toàn bộ 12 cung để trả lời. Câu trả lời hiện dần khi AI viết; mỗi người
        được hỏi vài lần mỗi giờ.
      </p>
      <form
        className="mt-6 flex flex-col gap-3 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          void run(cauHoi);
        }}
      >
        <input
          className="input flex-1"
          value={cauHoi}
          onChange={(e) => setCauHoi(e.target.value)}
          placeholder="Ví dụ: Sự nghiệp của tôi phù hợp với ngành nào?"
          maxLength={500}
          aria-label="Câu hỏi cho AI"
        />
        <button type="submit" className="btn btn-gold shrink-0" disabled={state.kind === "loading"}>
          {state.kind === "loading" ? "AI đang viết…" : cauHoi.trim() ? "Hỏi AI" : "AI luận giải tổng quan"}
        </button>
      </form>
      <div className="mt-3 flex flex-wrap gap-2">
        {GOI_Y.map((g) => (
          <button key={g} type="button" className="chip" onClick={() => setCauHoi(g)}>
            {g}
          </button>
        ))}
      </div>
      {state.kind === "error" && (
        <p className="mt-5 rounded-lg border border-hoa-ky/40 bg-hoa-ky/10 px-4 py-3 text-hoa-ky">{state.message}</p>
      )}
      {state.kind === "loading" && !boNhap(state.text) && (
        <p className="mt-6 flex items-center gap-3 text-muted">
          <AmDuong className="size-6 animate-spin [animation-duration:3s]" />
          AI đang đọc lá số… (dịch vụ miễn phí có thể phải chờ đến 1–2 phút)
        </p>
      )}
      {(state.kind === "loading" || state.kind === "done") && boNhap(state.text) && (
        <div className="mt-6 border-t border-line pt-6 leading-relaxed">
          <VanBan text={boNhap(state.text)} />
        </div>
      )}
    </section>
  );
}
