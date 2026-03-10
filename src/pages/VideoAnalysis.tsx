import { useState, useRef, useCallback } from "react";
import type { DragEvent, ChangeEvent } from "react";
import {
  Upload,
  CheckCircle,
  Loader,
  FileVideo,
  ChevronDown,
  Download,
  Zap,
} from "lucide-react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import { Sidebar } from "../components/layout/Sidebar";
import { useAthletes } from "../hooks/useAthletes";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { analyseVideoFrames, type ScoutingReport } from "../services/openai";

const ACCENT = "#6366f1";
const MUTED = "#a1a1aa";
const SURFACE = "#111111";
const BORDER = "#222222";
const FONT =
  "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const ACCEPTED_TYPES = ["video/mp4", "video/quicktime", "video/x-msvideo"];
const MAX_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB

type Phase = "setup" | "uploading" | "ready" | "analysing" | "done";

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function validateFile(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return "Only .mp4, .mov, and .avi files are supported.";
  }
  if (file.size > MAX_SIZE_BYTES) {
    return `File too large. Maximum size is 100 MB (got ${formatBytes(file.size)}).`;
  }
  return null;
}

async function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.addEventListener("loadedmetadata", () => {
      URL.revokeObjectURL(url);
      resolve(Math.round(video.duration));
    });
    video.addEventListener("error", () => {
      URL.revokeObjectURL(url);
      resolve(0);
    });
    video.src = url;
    video.load();
  });
}

async function extractFrames(file: File, count = 5): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "auto";
    video.muted = true;

    video.addEventListener("error", () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not load video for frame extraction."));
    });

    video.addEventListener("loadedmetadata", async () => {
      const duration = video.duration;
      const maxW = 640;
      const scale = Math.min(1, maxW / (video.videoWidth || 640));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round((video.videoWidth || 640) * scale);
      canvas.height = Math.round((video.videoHeight || 360) * scale);
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("Canvas not available."));
        return;
      }

      const frames: string[] = [];
      for (let i = 0; i < count; i++) {
        const t = (duration / (count + 1)) * (i + 1);
        await new Promise<void>((res) => {
          video.currentTime = t;
          video.addEventListener("seeked", () => res(), { once: true });
        });
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        frames.push(canvas.toDataURL("image/jpeg", 0.6));
      }

      URL.revokeObjectURL(url);
      console.log("[extractFrames] extracted", frames.length, "frames");
      resolve(frames);
    });

    video.src = url;
    video.load();
  });
}

// ── Drop zone ──────────────────────────────────────────────────────────────────

function DropZone({
  file,
  dragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileChange,
}: {
  file: File | null;
  dragOver: boolean;
  onDragOver: (e: DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: DragEvent) => void;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      style={{
        border: `2px dashed ${dragOver ? ACCENT : file ? "#22c55e" : BORDER}`,
        borderRadius: "0.75rem",
        padding: "3rem 2rem",
        textAlign: "center",
        cursor: "pointer",
        background: dragOver
          ? "rgba(99,102,241,0.05)"
          : file
            ? "rgba(34,197,94,0.04)"
            : "transparent",
        transition: "border-color 0.15s, background 0.15s",
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".mp4,.mov,.avi"
        style={{ display: "none" }}
        onChange={onFileChange}
      />

      {file ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.75rem",
          }}
        >
          <FileVideo size={24} color="#22c55e" />
          <div style={{ textAlign: "left" }}>
            <p style={{ fontWeight: 600, fontSize: "0.95rem" }}>{file.name}</p>
            <p style={{ color: MUTED, fontSize: "0.8rem" }}>
              {formatBytes(file.size)}
            </p>
          </div>
          <CheckCircle size={20} color="#22c55e" />
        </div>
      ) : (
        <>
          <Upload
            size={32}
            color={dragOver ? ACCENT : "#444"}
            style={{ margin: "0 auto 1rem" }}
          />
          <p style={{ fontWeight: 600, marginBottom: "0.35rem" }}>
            {dragOver ? "Drop it here" : "Drag & drop a video"}
          </p>
          <p style={{ color: MUTED, fontSize: "0.85rem" }}>
            or click to browse — .mp4, .mov, .avi · max 100 MB
          </p>
        </>
      )}
    </div>
  );
}

// ── Progress bar ───────────────────────────────────────────────────────────────

function ProgressBar({ value }: { value: number }) {
  return (
    <div
      style={{
        background: "#1a1a1a",
        borderRadius: "9999px",
        height: "8px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${value}%`,
          background: ACCENT,
          borderRadius: "9999px",
          transition: "width 0.3s ease",
        }}
      />
    </div>
  );
}

// ── Analysing spinner ──────────────────────────────────────────────────────────

function AnalysingSpinner() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "4rem 2rem",
        gap: "1.25rem",
        background: SURFACE,
        border: `1px solid ${BORDER}`,
        borderRadius: "0.75rem",
      }}
    >
      <Loader
        size={36}
        color={ACCENT}
        style={{ animation: "spin 1s linear infinite" }}
      />
      <p style={{ fontWeight: 600, fontSize: "1rem" }}>
        AI is analysing your video…
      </p>
      <p style={{ color: MUTED, fontSize: "0.875rem", textAlign: "center" }}>
        Extracting frames and sending to GPT-4o vision. This may take 15–30
        seconds.
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Skill radar ────────────────────────────────────────────────────────────────

function SkillRadar({ report }: { report: ScoutingReport }) {
  const physicalEntries = [
    { subject: "Speed", value: report.physical_attributes?.speed ?? 0 },
    { subject: "Agility", value: report.physical_attributes?.agility ?? 0 },
    { subject: "Strength", value: report.physical_attributes?.strength ?? 0 },
  ];

  const techEntries = Object.entries(report.technical_skills ?? {})
    .slice(0, 4)
    .map(([key, val]) => ({
      subject: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      value: typeof val === "number" ? val : 0,
    }));

  const data = [...physicalEntries, ...techEntries];

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={data} outerRadius={100}>
        <PolarGrid stroke="#333" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fill: MUTED, fontSize: 11, fontFamily: FONT }}
        />
        <Radar
          name="Rating"
          dataKey="value"
          stroke={ACCENT}
          fill={ACCENT}
          fillOpacity={0.25}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

// ── Rating badge ───────────────────────────────────────────────────────────────

function RatingBadge({ value }: { value: number }) {
  const n = Math.round(Math.min(10, Math.max(0, value)));
  const color = n >= 8 ? "#22c55e" : n >= 5 ? "#f59e0b" : "#ef4444";
  const bg =
    n >= 8
      ? "rgba(34,197,94,0.12)"
      : n >= 5
        ? "rgba(245,158,11,0.12)"
        : "rgba(239,68,68,0.12)";

  return (
    <div
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100px",
        height: "100px",
        borderRadius: "50%",
        background: bg,
        border: `3px solid ${color}`,
      }}
    >
      <span
        style={{
          fontSize: "2.25rem",
          fontWeight: 800,
          color,
          lineHeight: 1,
          letterSpacing: "-0.04em",
        }}
      >
        {n}
      </span>
      <span style={{ fontSize: "0.7rem", color, fontWeight: 500 }}>/ 10</span>
    </div>
  );
}

// ── Report display ─────────────────────────────────────────────────────────────

function ReportDisplay({
  report,
  athleteName,
}: {
  report: ScoutingReport;
  athleteName: string;
}) {
  const handleDownloadPDF = () => {
    // Set the document title so the saved PDF filename is the athlete's name
    const prevTitle = document.title;
    document.title = `ScoutVision – ${athleteName} – ${new Date().toLocaleDateString("en-GB")}`;
    window.print();
    document.title = prevTitle;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Header card */}
      <div
        style={{
          background: SURFACE,
          border: `1px solid ${BORDER}`,
          borderRadius: "0.75rem",
          padding: "1.75rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <RatingBadge value={report.overall_rating} />
          <div>
            <p
              style={{
                fontSize: "0.78rem",
                color: MUTED,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "0.25rem",
              }}
            >
              Scouting Report
            </p>
            <h2
              style={{
                fontSize: "1.3rem",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                marginBottom: "0.25rem",
              }}
            >
              {athleteName}
            </h2>
            <p style={{ color: MUTED, fontSize: "0.875rem" }}>
              Overall rating: {report.overall_rating}/10
            </p>
          </div>
        </div>
        <button
          onClick={handleDownloadPDF}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.65rem 1.25rem",
            borderRadius: "0.5rem",
            border: `1px solid ${BORDER}`,
            background: "transparent",
            color: MUTED,
            fontSize: "0.875rem",
            fontFamily: FONT,
            cursor: "pointer",
          }}
        >
          <Download size={15} />
          Download PDF
        </button>
      </div>

      {/* Summary */}
      {report.summary && (
        <div
          style={{
            background: SURFACE,
            border: `1px solid ${BORDER}`,
            borderRadius: "0.75rem",
            padding: "1.5rem",
          }}
        >
          <p
            style={{
              fontSize: "0.78rem",
              color: MUTED,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "0.75rem",
              fontWeight: 600,
            }}
          >
            Summary
          </p>
          <p
            style={{
              fontSize: "0.95rem",
              lineHeight: 1.7,
              color: "#e4e4e7",
            }}
          >
            {report.summary}
          </p>
        </div>
      )}

      {/* Strengths + Weaknesses */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1.25rem",
        }}
      >
        {/* Strengths */}
        <div
          style={{
            background: SURFACE,
            border: `1px solid ${BORDER}`,
            borderRadius: "0.75rem",
            padding: "1.5rem",
          }}
        >
          <p
            style={{
              fontSize: "0.78rem",
              color: "#4ade80",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "0.75rem",
              fontWeight: 600,
            }}
          >
            Strengths
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {(report.strengths ?? []).map((s, i) => (
              <li
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.5rem",
                  marginBottom: "0.5rem",
                  fontSize: "0.875rem",
                  lineHeight: 1.5,
                }}
              >
                <span
                  style={{
                    color: "#4ade80",
                    flexShrink: 0,
                    marginTop: "0.1rem",
                  }}
                >
                  ✓
                </span>
                {s}
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div
          style={{
            background: SURFACE,
            border: `1px solid ${BORDER}`,
            borderRadius: "0.75rem",
            padding: "1.5rem",
          }}
        >
          <p
            style={{
              fontSize: "0.78rem",
              color: "#f87171",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "0.75rem",
              fontWeight: 600,
            }}
          >
            Areas to Improve
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {(report.weaknesses ?? []).map((w, i) => (
              <li
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.5rem",
                  marginBottom: "0.5rem",
                  fontSize: "0.875rem",
                  lineHeight: 1.5,
                }}
              >
                <span
                  style={{
                    color: "#f87171",
                    flexShrink: 0,
                    marginTop: "0.1rem",
                  }}
                >
                  ↑
                </span>
                {w}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Radar chart */}
      <div
        style={{
          background: SURFACE,
          border: `1px solid ${BORDER}`,
          borderRadius: "0.75rem",
          padding: "1.5rem",
        }}
      >
        <p
          style={{
            fontSize: "0.78rem",
            color: MUTED,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: "0.5rem",
            fontWeight: 600,
          }}
        >
          Skill Profile
        </p>
        <SkillRadar report={report} />
      </div>

      {/* Recommendations */}
      {(report.recommendations ?? []).length > 0 && (
        <div
          style={{
            background: SURFACE,
            border: `1px solid ${BORDER}`,
            borderRadius: "0.75rem",
            padding: "1.5rem",
          }}
        >
          <p
            style={{
              fontSize: "0.78rem",
              color: MUTED,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "0.75rem",
              fontWeight: 600,
            }}
          >
            Recommendations
          </p>
          <ol
            style={{
              margin: 0,
              padding: "0 0 0 1.25rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            {report.recommendations.map((r, i) => (
              <li
                key={i}
                style={{
                  fontSize: "0.875rem",
                  lineHeight: 1.6,
                  color: "#e4e4e7",
                }}
              >
                {r}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

// ── VideoAnalysis page ─────────────────────────────────────────────────────────

export function VideoAnalysis() {
  const { user } = useAuth();
  const { data: athletes, isLoading: athletesLoading } = useAthletes();

  const [phase, setPhase] = useState<Phase>("setup");
  const [athleteId, setAthleteId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedVideoId, setUploadedVideoId] = useState<string | null>(null);
  const [report, setReport] = useState<ScoutingReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedAthlete = athletes?.find((a) => a.id === athleteId) ?? null;

  // ── File handling ──────────────────────────────────────────────────────────

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => setDragOver(false), []);

  const applyFile = (f: File) => {
    const err = validateFile(f);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setFile(f);
  };

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) applyFile(dropped);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const picked = e.target.files?.[0];
      if (picked) applyFile(picked);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // ── Upload ─────────────────────────────────────────────────────────────────

  const handleUpload = async () => {
    if (!file || !athleteId || !user) return;
    setError(null);
    setPhase("uploading");
    setUploadProgress(0);

    // Fake smooth progress while upload runs
    const interval = setInterval(() => {
      setUploadProgress((p) => (p < 85 ? p + 3 : p));
    }, 300);

    try {
      const durationSeconds = await getVideoDuration(file);
      const storagePath = `${user.id}/${athleteId}/${Date.now()}-${file.name}`;

      console.log("[VideoAnalysis] uploading to Storage:", storagePath);
      const { error: storageError } = await supabase.storage
        .from("videos")
        .upload(storagePath, file, { upsert: false });

      if (storageError) throw storageError;

      const { data: videoRecord, error: dbError } = await supabase
        .from("videos")
        .insert({
          athlete_id: athleteId,
          storage_path: storagePath,
          filename: file.name,
          duration_seconds: durationSeconds,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      clearInterval(interval);
      setUploadProgress(100);
      setUploadedVideoId((videoRecord as { id: string }).id);
      console.log("[VideoAnalysis] upload complete, video id:", videoRecord.id);

      setTimeout(() => setPhase("ready"), 400);
    } catch (err) {
      clearInterval(interval);
      const msg = err instanceof Error ? err.message : "Upload failed.";
      console.error("[VideoAnalysis] upload error:", msg);
      setError(msg);
      setPhase("setup");
    }
  };

  // ── Analysis ───────────────────────────────────────────────────────────────

  const handleAnalyse = async () => {
    if (!file || !selectedAthlete || !uploadedVideoId || !user) return;
    setError(null);
    setPhase("analysing");

    try {
      console.log("[VideoAnalysis] extracting frames...");
      const frames = await extractFrames(file, 5);

      console.log("[VideoAnalysis] calling OpenAI...");
      const result = await analyseVideoFrames(frames, selectedAthlete);

      const { error: reportError } = await supabase
        .from("analysis_reports")
        .insert({
          video_id: uploadedVideoId,
          athlete_id: athleteId,
          scout_id: user.id,
          report: result,
        });

      if (reportError) throw reportError;

      console.log("[VideoAnalysis] analysis saved, displaying report");
      setReport(result);
      setPhase("done");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Analysis failed.";
      console.error("[VideoAnalysis] analysis error:", msg);
      setError(msg);
      setPhase("ready");
    }
  };

  const canUpload = !!file && !!athleteId && phase === "setup";

  // ── Render ─────────────────────────────────────────────────────────────────

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

      <main
        style={{
          flex: 1,
          padding: "2.5rem",
          overflowY: "auto",
          maxWidth: "860px",
        }}
      >
        <h1
          style={{
            fontSize: "1.75rem",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            marginBottom: "0.25rem",
          }}
        >
          Video Analysis
        </h1>
        <p style={{ color: MUTED, fontSize: "0.9rem", marginBottom: "2rem" }}>
          Upload a match clip and let AI generate a structured scouting report.
        </p>

        {/* Error banner */}
        {error && (
          <div
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: "0.5rem",
              padding: "0.875rem 1rem",
              color: "#f87171",
              fontSize: "0.875rem",
              marginBottom: "1.5rem",
            }}
          >
            {error}
          </div>
        )}

        {/* ── STEP 1 & 2: Setup + Upload ─── */}
        {(phase === "setup" || phase === "uploading") && (
          <div
            style={{
              background: SURFACE,
              border: `1px solid ${BORDER}`,
              borderRadius: "0.75rem",
              padding: "2rem",
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
            }}
          >
            {/* Step indicator */}
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                fontSize: "0.8rem",
                color: MUTED,
              }}
            >
              <span
                style={{
                  background: "rgba(99,102,241,0.15)",
                  color: "#818cf8",
                  padding: "0.2rem 0.6rem",
                  borderRadius: "9999px",
                  fontWeight: 600,
                }}
              >
                Step 1
              </span>
              <span style={{ alignSelf: "center" }}>
                Select athlete &amp; upload video
              </span>
            </div>

            {/* Athlete selector */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "#e4e4e7",
                  marginBottom: "0.4rem",
                }}
              >
                Athlete *
              </label>
              <div style={{ position: "relative" }}>
                <select
                  value={athleteId}
                  onChange={(e) => setAthleteId(e.target.value)}
                  disabled={phase === "uploading"}
                  style={{
                    width: "100%",
                    background: "#1a1a1a",
                    border: `1px solid ${BORDER}`,
                    borderRadius: "0.5rem",
                    padding: "0.7rem 2.5rem 0.7rem 0.875rem",
                    color: athleteId ? "#fff" : MUTED,
                    fontSize: "0.9rem",
                    fontFamily: FONT,
                    outline: "none",
                    boxSizing: "border-box",
                    appearance: "none",
                    cursor: phase === "uploading" ? "not-allowed" : "pointer",
                    opacity: phase === "uploading" ? 0.6 : 1,
                  }}
                >
                  <option value="">
                    {athletesLoading
                      ? "Loading athletes…"
                      : "Select an athlete…"}
                  </option>
                  {(athletes ?? []).map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} — {a.sport}
                      {a.position ? ` (${a.position})` : ""}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  style={{
                    position: "absolute",
                    right: "0.75rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: MUTED,
                    pointerEvents: "none",
                  }}
                />
              </div>
              {athletes?.length === 0 && !athletesLoading && (
                <p
                  style={{
                    color: "#f59e0b",
                    fontSize: "0.8rem",
                    marginTop: "0.4rem",
                  }}
                >
                  No athletes found. Add an athlete first from the Athletes
                  page.
                </p>
              )}
            </div>

            {/* Drop zone */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "#e4e4e7",
                  marginBottom: "0.4rem",
                }}
              >
                Video file *
              </label>
              <DropZone
                file={file}
                dragOver={dragOver}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onFileChange={handleFileChange}
              />
            </div>

            {/* Upload progress */}
            {phase === "uploading" && (
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.8rem",
                    color: MUTED,
                    marginBottom: "0.5rem",
                  }}
                >
                  <span>Uploading…</span>
                  <span>{uploadProgress}%</span>
                </div>
                <ProgressBar value={uploadProgress} />
              </div>
            )}

            {/* Upload button */}
            <button
              onClick={handleUpload}
              disabled={!canUpload}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                background: canUpload ? ACCENT : "#1a1a1a",
                color: canUpload ? "#fff" : "#555",
                border: "none",
                padding: "0.85rem",
                borderRadius: "0.5rem",
                fontWeight: 600,
                fontSize: "0.95rem",
                fontFamily: FONT,
                cursor: canUpload ? "pointer" : "not-allowed",
                transition: "background 0.15s",
              }}
            >
              <Upload size={16} />
              {phase === "uploading" ? "Uploading…" : "Upload Video"}
            </button>
          </div>
        )}

        {/* ── STEP 2: Ready to analyse ─── */}
        {phase === "ready" && selectedAthlete && (
          <div
            style={{
              background: SURFACE,
              border: `1px solid ${BORDER}`,
              borderRadius: "0.75rem",
              padding: "2rem",
              display: "flex",
              flexDirection: "column",
              gap: "1.25rem",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                fontSize: "0.8rem",
                color: MUTED,
              }}
            >
              <span
                style={{
                  background: "rgba(34,197,94,0.12)",
                  color: "#4ade80",
                  padding: "0.2rem 0.6rem",
                  borderRadius: "9999px",
                  fontWeight: 600,
                }}
              >
                ✓ Uploaded
              </span>
              <span style={{ alignSelf: "center" }}>
                {file?.name} • {selectedAthlete.name}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                fontSize: "0.8rem",
                color: MUTED,
              }}
            >
              <span
                style={{
                  background: "rgba(99,102,241,0.15)",
                  color: "#818cf8",
                  padding: "0.2rem 0.6rem",
                  borderRadius: "9999px",
                  fontWeight: 600,
                }}
              >
                Step 2
              </span>
              <span style={{ alignSelf: "center" }}>
                Run AI analysis with GPT-4o vision
              </span>
            </div>

            <p style={{ color: MUTED, fontSize: "0.875rem", lineHeight: 1.6 }}>
              ScoutVision will extract 5 key frames from your video and send
              them to GPT-4o to generate a structured scouting report for{" "}
              <strong style={{ color: "#fff" }}>{selectedAthlete.name}</strong>.
            </p>

            <button
              onClick={handleAnalyse}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                background: ACCENT,
                color: "#fff",
                border: "none",
                padding: "0.85rem 2rem",
                borderRadius: "0.5rem",
                fontWeight: 600,
                fontSize: "0.95rem",
                fontFamily: FONT,
                cursor: "pointer",
                alignSelf: "flex-start",
              }}
            >
              <Zap size={16} />
              Analyse Video with AI
            </button>
          </div>
        )}

        {/* ── STEP 3: AI processing ─── */}
        {phase === "analysing" && <AnalysingSpinner />}

        {/* ── STEP 4: Report ─── */}
        {phase === "done" && report && selectedAthlete && (
          <ReportDisplay report={report} athleteName={selectedAthlete.name} />
        )}
      </main>

      {/* Print styles — hides everything except the report section */}
      <style>{`
        @media print {
          @page { margin: 20mm; }
          body * { visibility: hidden !important; }
          main, main * { visibility: visible !important; }
          main {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
            background: white !important;
            color: black !important;
          }
          /* hide step 1/2 controls — only show the done report */
          main > *:not(:last-child) { display: none !important; }
          /* force light colours for readability */
          [style*="background: #111"],
          [style*="background: #0a0a0a"],
          [style*="background: #1a1a1a"] {
            background: white !important;
            color: black !important;
          }
          [style*="border: 1px solid #222"] {
            border-color: #ccc !important;
          }
          button { display: none !important; }
        }
      `}</style>
    </div>
  );
}
