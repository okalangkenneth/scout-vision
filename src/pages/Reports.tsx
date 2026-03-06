import { useState } from "react";
import { format } from "date-fns";
import {
  ChevronDown,
  ChevronUp,
  Printer,
  ChevronDown as ChevronDownIcon,
} from "lucide-react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import { Sidebar } from "../components/layout/Sidebar";
import { useReports, type FullReport } from "../hooks/useReports";
import type { ScoutingReport } from "../services/openai";

const ACCENT = "#6366f1";
const MUTED = "#a1a1aa";
const SURFACE = "#111111";
const BORDER = "#222222";
const FONT =
  "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

// ── Rating badge ───────────────────────────────────────────────────────────────

function RatingBadge({
  value,
  size = "sm",
}: {
  value: number;
  size?: "sm" | "lg";
}) {
  const n = Math.round(Math.min(10, Math.max(0, value ?? 0)));
  const color = n >= 8 ? "#22c55e" : n >= 5 ? "#f59e0b" : "#ef4444";
  const bg =
    n >= 8
      ? "rgba(34,197,94,0.12)"
      : n >= 5
        ? "rgba(245,158,11,0.12)"
        : "rgba(239,68,68,0.12)";

  if (size === "lg") {
    return (
      <div
        style={{
          display: "inline-flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "72px",
          height: "72px",
          borderRadius: "50%",
          background: bg,
          border: `2px solid ${color}`,
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: "1.6rem",
            fontWeight: 800,
            color,
            lineHeight: 1,
            letterSpacing: "-0.03em",
          }}
        >
          {n}
        </span>
        <span style={{ fontSize: "0.6rem", color, fontWeight: 500 }}>/10</span>
      </div>
    );
  }

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "36px",
        height: "36px",
        borderRadius: "50%",
        background: bg,
        border: `1.5px solid ${color}`,
        fontSize: "0.85rem",
        fontWeight: 700,
        color,
        flexShrink: 0,
      }}
    >
      {n}
    </span>
  );
}

// ── Skill radar ────────────────────────────────────────────────────────────────

function SkillRadar({ report }: { report: ScoutingReport }) {
  const physical = [
    { subject: "Speed", value: report.physical_attributes?.speed ?? 0 },
    { subject: "Agility", value: report.physical_attributes?.agility ?? 0 },
    { subject: "Strength", value: report.physical_attributes?.strength ?? 0 },
  ];
  const technical = Object.entries(report.technical_skills ?? {})
    .slice(0, 4)
    .map(([key, val]) => ({
      subject: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      value: typeof val === "number" ? val : 0,
    }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <RadarChart data={[...physical, ...technical]} outerRadius={85}>
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

// ── Print section (hidden; revealed by @media print) ──────────────────────────

function PrintSection({ report: fr }: { report: FullReport }) {
  const r = fr.report;
  const physicalSkills = [
    ["Speed", r.physical_attributes?.speed],
    ["Agility", r.physical_attributes?.agility],
    ["Strength", r.physical_attributes?.strength],
  ] as [string, number][];
  const techSkills = Object.entries(r.technical_skills ?? {}) as [
    string,
    number,
  ][];

  return (
    <div
      id="scout-print-section"
      style={{
        display: "none",
        fontFamily: FONT,
        padding: "40px",
        color: "#000",
        background: "#fff",
      }}
    >
      {/* Header */}
      <div
        style={{
          borderBottom: "2px solid #000",
          paddingBottom: "16px",
          marginBottom: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        <div>
          <p
            style={{
              fontSize: "22px",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              margin: "0 0 4px",
            }}
          >
            Scout<span style={{ color: "#6366f1" }}>Vision</span>
          </p>
          <p style={{ margin: 0, fontSize: "13px", color: "#666" }}>
            AI Scouting Report
          </p>
        </div>
        <p style={{ margin: 0, fontSize: "13px", color: "#666" }}>
          {format(new Date(fr.createdAt), "MMMM d, yyyy")}
        </p>
      </div>

      {/* Athlete info + rating */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: 800,
              margin: "0 0 6px",
              letterSpacing: "-0.02em",
            }}
          >
            {fr.athleteName}
          </h1>
          <p style={{ margin: 0, fontSize: "15px", color: "#444" }}>
            {fr.sport}
          </p>
        </div>
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              fontSize: "48px",
              fontWeight: 900,
              margin: "0",
              color:
                r.overall_rating >= 8
                  ? "#16a34a"
                  : r.overall_rating >= 5
                    ? "#d97706"
                    : "#dc2626",
              lineHeight: 1,
            }}
          >
            {r.overall_rating}
          </p>
          <p style={{ margin: 0, fontSize: "13px", color: "#666" }}>
            Overall / 10
          </p>
        </div>
      </div>

      {/* Summary */}
      {r.summary && (
        <div style={{ marginBottom: "24px" }}>
          <h2
            style={{
              fontSize: "13px",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#666",
              margin: "0 0 8px",
            }}
          >
            Summary
          </h2>
          <p style={{ margin: 0, lineHeight: 1.7, fontSize: "14px" }}>
            {r.summary}
          </p>
        </div>
      )}

      {/* Strengths + Weaknesses */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "24px",
          marginBottom: "24px",
        }}
      >
        <div>
          <h2
            style={{
              fontSize: "13px",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#16a34a",
              margin: "0 0 8px",
            }}
          >
            Strengths
          </h2>
          <ul style={{ margin: 0, paddingLeft: "18px" }}>
            {(r.strengths ?? []).map((s, i) => (
              <li
                key={i}
                style={{
                  fontSize: "13px",
                  marginBottom: "4px",
                  lineHeight: 1.5,
                }}
              >
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2
            style={{
              fontSize: "13px",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#dc2626",
              margin: "0 0 8px",
            }}
          >
            Areas to Improve
          </h2>
          <ul style={{ margin: 0, paddingLeft: "18px" }}>
            {(r.weaknesses ?? []).map((w, i) => (
              <li
                key={i}
                style={{
                  fontSize: "13px",
                  marginBottom: "4px",
                  lineHeight: 1.5,
                }}
              >
                {w}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Skills */}
      <div style={{ marginBottom: "24px" }}>
        <h2
          style={{
            fontSize: "13px",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "#666",
            margin: "0 0 10px",
          }}
        >
          Skill Ratings
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "8px",
          }}
        >
          {[...physicalSkills, ...techSkills].map(([name, val]) => (
            <div
              key={name}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "6px 10px",
                background: "#f5f5f5",
                borderRadius: "4px",
                fontSize: "13px",
              }}
            >
              <span style={{ textTransform: "capitalize" }}>
                {String(name).replace(/_/g, " ")}
              </span>
              <strong>{val}/10</strong>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      {(r.recommendations ?? []).length > 0 && (
        <div>
          <h2
            style={{
              fontSize: "13px",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#666",
              margin: "0 0 8px",
            }}
          >
            Recommendations
          </h2>
          <ol style={{ margin: 0, paddingLeft: "18px" }}>
            {r.recommendations.map((rec, i) => (
              <li
                key={i}
                style={{
                  fontSize: "13px",
                  marginBottom: "4px",
                  lineHeight: 1.6,
                }}
              >
                {rec}
              </li>
            ))}
          </ol>
        </div>
      )}

      <p
        style={{
          marginTop: "40px",
          paddingTop: "16px",
          borderTop: "1px solid #ddd",
          fontSize: "11px",
          color: "#999",
        }}
      >
        Generated by ScoutVision · AI-powered sports scouting
      </p>
    </div>
  );
}

// ── Report card ────────────────────────────────────────────────────────────────

function ReportCard({
  report: fr,
  expanded,
  onToggle,
  onPrint,
}: {
  report: FullReport;
  expanded: boolean;
  onToggle: () => void;
  onPrint: () => void;
}) {
  const r = fr.report;

  return (
    <div
      style={{
        background: SURFACE,
        border: `1px solid ${BORDER}`,
        borderRadius: "0.75rem",
        overflow: "hidden",
      }}
    >
      {/* Collapsed header — always visible */}
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          background: "transparent",
          border: "none",
          padding: "1.25rem 1.5rem",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          cursor: "pointer",
          fontFamily: FONT,
          color: "#ffffff",
          textAlign: "left",
        }}
      >
        <RatingBadge value={r.overall_rating} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              marginBottom: "0.2rem",
              flexWrap: "wrap",
            }}
          >
            <p style={{ fontWeight: 700, fontSize: "0.95rem", margin: 0 }}>
              {fr.athleteName}
            </p>
            <span
              style={{
                padding: "0.15rem 0.55rem",
                borderRadius: "9999px",
                fontSize: "0.72rem",
                fontWeight: 500,
                background: "rgba(99,102,241,0.15)",
                color: "#818cf8",
                border: "1px solid rgba(99,102,241,0.25)",
              }}
            >
              {fr.sport}
            </span>
          </div>
          <p
            style={{
              fontSize: "0.8rem",
              color: MUTED,
              margin: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {r.summary
              ? r.summary.length > 100
                ? r.summary.slice(0, 100) + "…"
                : r.summary
              : "No summary available"}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: "0.3rem",
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: "0.78rem", color: MUTED }}>
            {format(new Date(fr.createdAt), "MMM d, yyyy")}
          </span>
          <span style={{ color: MUTED }}>
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </span>
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div
          style={{
            padding: "0 1.5rem 1.5rem",
            borderTop: `1px solid ${BORDER}`,
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
          }}
        >
          {/* Rating + Summary */}
          <div
            style={{
              display: "flex",
              gap: "1.5rem",
              alignItems: "flex-start",
              paddingTop: "1.25rem",
            }}
          >
            <RatingBadge value={r.overall_rating} size="lg" />
            <div style={{ flex: 1 }}>
              <p
                style={{
                  fontSize: "0.78rem",
                  color: MUTED,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: "0.4rem",
                  fontWeight: 600,
                }}
              >
                Summary
              </p>
              <p
                style={{
                  lineHeight: 1.7,
                  fontSize: "0.9rem",
                  color: "#e4e4e7",
                }}
              >
                {r.summary ?? "No summary available."}
              </p>
            </div>
          </div>

          {/* Strengths + Weaknesses */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            <div>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "#4ade80",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontWeight: 600,
                  marginBottom: "0.6rem",
                }}
              >
                Strengths
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {(r.strengths ?? []).map((s, i) => (
                  <li
                    key={i}
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      marginBottom: "0.45rem",
                      fontSize: "0.85rem",
                      lineHeight: 1.5,
                    }}
                  >
                    <span style={{ color: "#4ade80", flexShrink: 0 }}>✓</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "#f87171",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontWeight: 600,
                  marginBottom: "0.6rem",
                }}
              >
                Areas to Improve
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {(r.weaknesses ?? []).map((w, i) => (
                  <li
                    key={i}
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      marginBottom: "0.45rem",
                      fontSize: "0.85rem",
                      lineHeight: 1.5,
                    }}
                  >
                    <span style={{ color: "#f87171", flexShrink: 0 }}>↑</span>
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Radar chart */}
          <div>
            <p
              style={{
                fontSize: "0.75rem",
                color: MUTED,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontWeight: 600,
                marginBottom: "0.25rem",
              }}
            >
              Skill Profile
            </p>
            <SkillRadar report={r} />
          </div>

          {/* Recommendations */}
          {(r.recommendations ?? []).length > 0 && (
            <div>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: MUTED,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontWeight: 600,
                  marginBottom: "0.6rem",
                }}
              >
                Recommendations
              </p>
              <ol
                style={{
                  margin: 0,
                  paddingLeft: "1.25rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.4rem",
                }}
              >
                {r.recommendations.map((rec, i) => (
                  <li
                    key={i}
                    style={{
                      fontSize: "0.875rem",
                      lineHeight: 1.6,
                      color: "#e4e4e7",
                    }}
                  >
                    {rec}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Export PDF button */}
          <div
            style={{
              paddingTop: "0.75rem",
              borderTop: `1px solid ${BORDER}`,
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPrint();
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.55rem 1.1rem",
                borderRadius: "0.375rem",
                border: `1px solid ${BORDER}`,
                background: "transparent",
                color: MUTED,
                fontSize: "0.85rem",
                fontFamily: FONT,
                cursor: "pointer",
              }}
            >
              <Printer size={14} />
              Export PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Filters ────────────────────────────────────────────────────────────────────

function FilterSelect({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
}) {
  return (
    <div style={{ position: "relative" }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          background: SURFACE,
          border: `1px solid ${BORDER}`,
          borderRadius: "0.5rem",
          padding: "0.6rem 2.25rem 0.6rem 0.875rem",
          color: value ? "#fff" : MUTED,
          fontSize: "0.875rem",
          fontFamily: FONT,
          outline: "none",
          appearance: "none",
          cursor: "pointer",
          minWidth: "180px",
        }}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDownIcon
        size={14}
        style={{
          position: "absolute",
          right: "0.65rem",
          top: "50%",
          transform: "translateY(-50%)",
          color: MUTED,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

// ── Reports page ───────────────────────────────────────────────────────────────

export function Reports() {
  const { data: reports, isLoading } = useReports();

  const [athleteFilter, setAthleteFilter] = useState("");
  const [sportFilter, setSportFilter] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [printingReport, setPrintingReport] = useState<FullReport | null>(null);

  // Derived filter options
  const uniqueAthletes = Array.from(
    new Map(
      (reports ?? []).map((r) => [
        r.athleteId,
        { value: r.athleteId, label: r.athleteName },
      ]),
    ).values(),
  ).sort((a, b) => a.label.localeCompare(b.label));

  const uniqueSports = Array.from(new Set((reports ?? []).map((r) => r.sport)))
    .sort()
    .map((s) => ({ value: s, label: s }));

  const filteredReports = (reports ?? [])
    .filter((r) => !athleteFilter || r.athleteId === athleteFilter)
    .filter((r) => !sportFilter || r.sport === sportFilter);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handlePrint = (report: FullReport) => {
    setPrintingReport(report);
    console.log("[Reports] printing report for:", report.athleteName);
    // Allow the DOM to render the print section before triggering print
    setTimeout(() => {
      window.print();
      setPrintingReport(null);
    }, 150);
  };

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
          maxWidth: "900px",
        }}
      >
        {/* Header */}
        <h1
          style={{
            fontSize: "1.75rem",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            marginBottom: "0.25rem",
          }}
        >
          Scouting Reports
        </h1>
        <p style={{ color: MUTED, fontSize: "0.9rem", marginBottom: "2rem" }}>
          View and export all AI-generated scouting reports.
        </p>

        {/* Filters */}
        {!isLoading && (reports ?? []).length > 0 && (
          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              marginBottom: "1.5rem",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <FilterSelect
              value={athleteFilter}
              onChange={setAthleteFilter}
              placeholder="All athletes"
              options={uniqueAthletes}
            />
            <FilterSelect
              value={sportFilter}
              onChange={setSportFilter}
              placeholder="All sports"
              options={uniqueSports}
            />
            {(athleteFilter || sportFilter) && (
              <button
                onClick={() => {
                  setAthleteFilter("");
                  setSportFilter("");
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: ACCENT,
                  fontSize: "0.875rem",
                  cursor: "pointer",
                  fontFamily: FONT,
                  padding: "0.6rem 0",
                }}
              >
                Clear filters
              </button>
            )}
            <span
              style={{
                fontSize: "0.8rem",
                color: MUTED,
                marginLeft: "auto",
              }}
            >
              {filteredReports.length} report
              {filteredReports.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <p style={{ color: MUTED, fontSize: "0.9rem" }}>Loading reports…</p>
        ) : filteredReports.length === 0 ? (
          <div
            style={{
              background: SURFACE,
              border: `1px solid ${BORDER}`,
              borderRadius: "0.75rem",
              padding: "4rem 2rem",
              textAlign: "center",
            }}
          >
            <p style={{ color: MUTED, fontSize: "0.95rem" }}>
              {(reports ?? []).length === 0
                ? "No reports yet. Analyse a video to generate your first scouting report."
                : "No reports match the current filters."}
            </p>
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
          >
            {filteredReports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                expanded={expandedIds.has(report.id)}
                onToggle={() => toggleExpand(report.id)}
                onPrint={() => handlePrint(report)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Hidden section revealed by @media print */}
      {printingReport && <PrintSection report={printingReport} />}

      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #scout-print-section { display: block !important; }
          #scout-print-section,
          #scout-print-section * { visibility: visible; }
          #scout-print-section {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            background: white;
            color: black;
          }
        }
      `}</style>
    </div>
  );
}
