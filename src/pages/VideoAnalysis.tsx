import { Sidebar } from "../components/layout/Sidebar";

const FONT =
  "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const MUTED = "#a1a1aa";

export function VideoAnalysis() {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#0a0a0a",
        color: "#ffffff",
        fontFamily: FONT,
      }}
    >
      <Sidebar />
      <main style={{ flex: 1, padding: "2.5rem" }}>
        <h1
          style={{
            fontSize: "1.75rem",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            marginBottom: "0.5rem",
          }}
        >
          Video Analysis
        </h1>
        <p style={{ color: MUTED, fontSize: "0.9rem" }}>
          Upload match clips to generate AI scouting reports.
        </p>
      </main>
    </div>
  );
}
