import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, Video, FileText, LogOut } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const ACCENT = "#6366f1";
const FONT =
  "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard size={18} />,
  },
  { label: "Athletes", href: "/athletes", icon: <Users size={18} /> },
  { label: "Video Analysis", href: "/analysis", icon: <Video size={18} /> },
  { label: "Reports", href: "/reports", icon: <FileText size={18} /> },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    console.log("[Sidebar] Signing out");
    await signOut();
    navigate("/");
  };

  return (
    <aside
      style={{
        width: "240px",
        minWidth: "240px",
        background: "#111111",
        borderRight: "1px solid #222222",
        display: "flex",
        flexDirection: "column",
        position: "sticky",
        top: 0,
        height: "100vh",
        overflowY: "auto",
        fontFamily: FONT,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "1.5rem 1.25rem",
          borderBottom: "1px solid #222222",
          flexShrink: 0,
        }}
      >
        <p
          style={{
            fontWeight: 800,
            fontSize: "1.1rem",
            letterSpacing: "-0.02em",
            color: "#ffffff",
            margin: 0,
          }}
        >
          Scout<span style={{ color: ACCENT }}>Vision</span>
        </p>
      </div>

      {/* Nav links */}
      <nav style={{ padding: "0.75rem", flex: 1 }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.65rem",
                padding: "0.6rem 0.75rem",
                borderRadius: "0.5rem",
                color: isActive ? "#ffffff" : "#a1a1aa",
                background: isActive ? "rgba(99,102,241,0.15)" : "transparent",
                textDecoration: "none",
                fontSize: "0.9rem",
                fontWeight: isActive ? 600 : 400,
                marginBottom: "0.2rem",
              }}
            >
              <span
                style={{
                  color: isActive ? ACCENT : "#71717a",
                  display: "flex",
                }}
              >
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User info + sign out */}
      <div
        style={{
          padding: "1rem 1.25rem",
          borderTop: "1px solid #222222",
          flexShrink: 0,
        }}
      >
        <p
          style={{
            fontSize: "0.8rem",
            color: "#71717a",
            marginBottom: "0.75rem",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {user?.email ?? ""}
        </p>
        <button
          onClick={handleSignOut}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            color: "#a1a1aa",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            fontSize: "0.875rem",
            fontFamily: FONT,
            padding: 0,
          }}
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
