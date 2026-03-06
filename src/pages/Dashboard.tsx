import { Link } from "react-router-dom";
import { Users, Video, FileText, CreditCard, Upload } from "lucide-react";
import { format } from "date-fns";
import { Sidebar } from "../components/layout/Sidebar";
import { useAuth } from "../contexts/AuthContext";
import {
  useDashboardStats,
  useRecentReports,
  type RecentReport,
} from "../hooks/useDashboardStats";

const ACCENT = "#6366f1";
const MUTED = "#a1a1aa";
const SURFACE = "#111111";
const BORDER = "#222222";
const FONT =
  "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

// ── Stat card ─────────────────────────────────────────────────────────────────

type StatCardProps = {
  label: string;
  value: string | number;
  icon: React.ReactNode;
};

function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div
      style={{
        background: SURFACE,
        border: `1px solid ${BORDER}`,
        borderRadius: "0.75rem",
        padding: "1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <p style={{ fontSize: "0.85rem", color: MUTED, margin: 0 }}>{label}</p>
        <span style={{ color: ACCENT }}>{icon}</span>
      </div>
      <p
        style={{
          fontSize: "2rem",
          fontWeight: 700,
          letterSpacing: "-0.02em",
          color: "#ffffff",
          margin: 0,
        }}
      >
        {value}
      </p>
    </div>
  );
}

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: RecentReport["status"] }) {
  const isCompleted = status === "completed";
  return (
    <span
      style={{
        display: "inline-block",
        padding: "0.25rem 0.65rem",
        borderRadius: "9999px",
        fontSize: "0.75rem",
        fontWeight: 500,
        background: isCompleted
          ? "rgba(34,197,94,0.15)"
          : "rgba(234,179,8,0.15)",
        color: isCompleted ? "#4ade80" : "#fbbf24",
        border: `1px solid ${
          isCompleted ? "rgba(34,197,94,0.3)" : "rgba(234,179,8,0.3)"
        }`,
      }}
    >
      {isCompleted ? "Completed" : "Pending"}
    </span>
  );
}

// ── Dashboard page ────────────────────────────────────────────────────────────

export function Dashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: reports, isLoading: reportsLoading } = useRecentReports();

  const planLabel = stats
    ? stats.plan.charAt(0).toUpperCase() + stats.plan.slice(1)
    : "—";

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

      <main style={{ flex: 1, padding: "2.5rem", overflowY: "auto" }}>
        {/* ── Header ─────────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2.5rem",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "1.75rem",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                marginBottom: "0.25rem",
              }}
            >
              Welcome back
              {user?.email ? (
                <span style={{ color: ACCENT }}>, {user.email}</span>
              ) : null}
            </h1>
            <p style={{ color: MUTED, fontSize: "0.9rem" }}>
              Here&apos;s an overview of your scouting activity.
            </p>
          </div>

          <Link
            to="/analysis"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              background: ACCENT,
              color: "#ffffff",
              padding: "0.7rem 1.25rem",
              borderRadius: "0.5rem",
              fontWeight: 600,
              fontSize: "0.9rem",
              textDecoration: "none",
            }}
          >
            <Upload size={16} />
            Upload Video for Analysis
          </Link>
        </div>

        {/* ── Stat cards ─────────────────────────────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
            marginBottom: "2.5rem",
          }}
        >
          <StatCard
            label="Total Athletes"
            value={statsLoading ? "…" : (stats?.athleteCount ?? 0)}
            icon={<Users size={20} />}
          />
          <StatCard
            label="Videos Analysed"
            value={statsLoading ? "…" : (stats?.videoCount ?? 0)}
            icon={<Video size={20} />}
          />
          <StatCard
            label="Reports Generated"
            value={statsLoading ? "…" : (stats?.reportCount ?? 0)}
            icon={<FileText size={20} />}
          />
          <StatCard
            label="Plan"
            value={statsLoading ? "…" : planLabel}
            icon={<CreditCard size={20} />}
          />
        </div>

        {/* ── Recent reports table ────────────────────────────────── */}
        <div
          style={{
            background: SURFACE,
            border: `1px solid ${BORDER}`,
            borderRadius: "0.75rem",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "1.25rem 1.5rem",
              borderBottom: `1px solid ${BORDER}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h2 style={{ fontSize: "1rem", fontWeight: 600, margin: 0 }}>
              Recent Reports
            </h2>
            <Link
              to="/reports"
              style={{
                fontSize: "0.85rem",
                color: ACCENT,
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              View all
            </Link>
          </div>

          {reportsLoading ? (
            <p
              style={{
                padding: "2rem 1.5rem",
                color: MUTED,
                fontSize: "0.9rem",
              }}
            >
              Loading reports…
            </p>
          ) : !reports || reports.length === 0 ? (
            <p
              style={{
                padding: "2rem 1.5rem",
                color: MUTED,
                fontSize: "0.9rem",
              }}
            >
              No reports yet.{" "}
              <Link
                to="/analysis"
                style={{ color: ACCENT, textDecoration: "none" }}
              >
                Upload a video to get started.
              </Link>
            </p>
          ) : (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.9rem",
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: `1px solid ${BORDER}`,
                    color: MUTED,
                    fontSize: "0.8rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {["Athlete", "Sport", "Date", "Status"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "0.75rem 1.5rem",
                        textAlign: "left",
                        fontWeight: 500,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reports.map((report, idx) => (
                  <tr
                    key={report.id}
                    style={{
                      borderBottom:
                        idx < reports.length - 1
                          ? `1px solid ${BORDER}`
                          : "none",
                    }}
                  >
                    <td style={{ padding: "1rem 1.5rem", fontWeight: 500 }}>
                      {report.athleteName}
                    </td>
                    <td style={{ padding: "1rem 1.5rem", color: MUTED }}>
                      {report.sport}
                    </td>
                    <td style={{ padding: "1rem 1.5rem", color: MUTED }}>
                      {format(new Date(report.createdAt), "MMM d, yyyy")}
                    </td>
                    <td style={{ padding: "1rem 1.5rem" }}>
                      <StatusBadge status={report.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
