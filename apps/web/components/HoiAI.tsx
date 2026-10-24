"use client";

import type { LaSoRequest } from "@tuvi/shared-types";
import { type ReactNode, useState } from "react";

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
    <section className="card hoi-ai" aria-live="polite">
      <h2>Hỏi AI</h2>
      <p className="muted">
        Hỏi riêng một chủ đề, AI sẽ đọc toàn bộ 12 cung để trả lời. Câu trả lời hiện dần khi AI viết;
        mỗi người được hỏi vài lần mỗi giờ.
      </p>
      <form
        className="ask"
        onSubmit={(e) => {
          e.preventDefault();
          void run(cauHoi);
        }}
      >
        <input
          value={cauHoi}
          onChange={(e) => setCauHoi(e.target.value)}
          placeholder="Ví dụ: Sự nghiệp của tôi phù hợp với ngành nào?"
          maxLength={500}
          aria-label="Câu hỏi cho AI"
        />
        <button type="submit" className="btn primary" disabled={state.kind === "loading"}>
          {state.kind === "loading" ? "AI đang viết…" : cauHoi.trim() ? "Hỏi AI" : "AI luận giải tổng quan"}
        </button>
      </form>
      <div className="chips">
        {GOI_Y.map((g) => (
          <button key={g} type="button" className="chip" onClick={() => setCauHoi(g)}>
            {g}
          </button>
        ))}
      </div>
      {state.kind === "error" && <p className="error">{state.message}</p>}
      {state.kind === "loading" && !boNhap(state.text) && (
        <p className="muted">AI đang đọc lá số… (dịch vụ miễn phí có thể phải chờ đến 1–2 phút)</p>
      )}
      {(state.kind === "loading" || state.kind === "done") && boNhap(state.text) && (
        <VanBan text={boNhap(state.text)} />
      )}
    </section>
  );
}
