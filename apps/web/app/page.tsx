import type { LaSoRequest } from "@tuvi/shared-types";

const example: LaSoRequest = { nam_am: 1990, thang_am: 3, gio: 6 };

export default function Home() {
  return (
    <main style={{ maxWidth: 720, margin: "4rem auto", fontFamily: "system-ui" }}>
      <h1>Tử Vi AI</h1>
      <p>Lập lá số và luận giải bằng AI — đang phát triển.</p>
      <pre>{JSON.stringify(example)}</pre>
    </main>
  );
}
