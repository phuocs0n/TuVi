"use client";

import type { LaSoRequest } from "@tuvi/shared-types";
import { useState } from "react";

import { ApiError, luanGiai } from "@/lib/api";

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "done"; text: string }
  | { kind: "error"; message: string };

const GOI_Y = ["Công danh sự nghiệp", "Tình duyên, gia đạo", "Tài lộc năm nay"];

export function LuanGiai({ req }: { req: LaSoRequest }) {
  const [state, setState] = useState<State>({ kind: "idle" });
  const [cauHoi, setCauHoi] = useState("");

  const run = async (q?: string) => {
    setState({ kind: "loading" });
    try {
      const res = await luanGiai(req, q?.trim() || undefined);
      setState({ kind: "done", text: res.luan_giai });
    } catch (e) {
      setState({ kind: "error", message: e instanceof ApiError ? e.message : "Đã có lỗi xảy ra." });
    }
  };

  return (
    <section className="card luan-giai" aria-live="polite">
      <h2>Luận giải bằng AI</h2>
      <p className="muted">
        AI đọc toàn bộ 12 cung và các sao trên lá số để đưa ra nhận định tham khảo. Bạn có thể hỏi
        riêng một chủ đề.
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
          {state.kind === "loading" ? "Đang luận giải…" : cauHoi.trim() ? "Hỏi AI" : "Luận giải tổng quan"}
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
      {state.kind === "done" && <div className="answer">{state.text}</div>}
    </section>
  );
}
