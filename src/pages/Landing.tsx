import { Link } from "react-router-dom";
import { Video, Users, FileText, LayoutDashboard, Check } from "lucide-react";

const ACCENT = "#6366f1";
const MUTED = "#a1a1aa";
const SURFACE = "#111111";
const BORDER = "#222222";
const FONT =
  "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

function scrollToFeatures() {
  document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
}

const features = [
  {
    icon: <Video size={28} color={ACCENT} />,
    title: "Video Analysis",
    description:
      "Upload match clips and let AI extract key performance metrics from every frame.",
  },
  {
    icon: <Users size={28} color={ACCENT} />,
    title: "Athlete Profiles",
    description:
      "Maintain detailed profiles for every athlete with stats, position, and history.",
  },
  {
    icon: <FileText size={28} color={ACCENT} />,
    title: "Scouting Reports",
    description:
      "Get AI-generated structured reports covering strengths, weaknesses, and recommendations.",
  },
  {
    icon: <LayoutDashboard size={28} color={ACCENT} />,
    title: "Team Dashboard",
    description:
      "Track all your athletes, uploaded videos, and generated reports in one place.",
  },
];

const plans = [
  {
    name: "Starter",
    price: 29,
    perks: [
      "5 athletes",
      "10 videos / month",
      "AI scouting reports",
      "Email support",
    ],
    highlighted: false,
  },
  {
    name: "Pro",
    price: 79,
    perks: [
      "25 athletes",
      "50 videos / month",
      "Priority AI processing",
      "Priority support",
    ],
    highlighted: true,
  },
  {
    name: "Unlimited",
    price: 149,
    perks: [
      "Unlimited athletes",
      "Unlimited videos",
      "Advanced analytics",
      "Dedicated support",
    ],
    highlighted: false,
  },
];

export function Landing() {
  return (
    <div
      style={{
        background: "#0a0a0a",
        color: "#ffffff",
        fontFamily: FONT,
        minHeight: "100vh",
        overflowX: "hidden",
      }}
    >
      {/* ─── Hero ───────────────────────────────────────────────────── */}
      <section
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          minHeight: "100vh",
          padding: "0 1.5rem",
        }}
      >
        <span
          style={{
            display: "inline-block",
            background: "rgba(99,102,241,0.15)",
            color: ACCENT,
            border: "1px solid rgba(99,102,241,0.3)",
            borderRadius: "9999px",
            padding: "0.35rem 1rem",
            fontSize: "0.8rem",
            fontWeight: 500,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            marginBottom: "1.5rem",
          }}
        >
          Powered by GPT-4o Vision
        </span>

        <h1
          style={{
            fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            maxWidth: "800px",
            marginBottom: "1.5rem",
          }}
        >
          AI-Powered <span style={{ color: ACCENT }}>Sports Scouting</span>
        </h1>

        <p
          style={{
            fontSize: "clamp(1rem, 2vw, 1.25rem)",
            color: MUTED,
            maxWidth: "560px",
            lineHeight: 1.7,
            marginBottom: "2.5rem",
          }}
        >
          Upload match clips and get instant AI-generated scouting reports for
          every athlete.
        </p>

        <div
          style={{
            display: "flex",
            gap: "1rem",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <Link
            to="/signup"
            style={{
              background: ACCENT,
              color: "#ffffff",
              padding: "0.85rem 2rem",
              borderRadius: "0.5rem",
              fontWeight: 600,
              fontSize: "1rem",
              textDecoration: "none",
              letterSpacing: "0.01em",
            }}
          >
            Get Started Free
          </Link>
          <button
            onClick={scrollToFeatures}
            style={{
              background: "transparent",
              color: "#ffffff",
              padding: "0.85rem 2rem",
              borderRadius: "0.5rem",
              fontWeight: 600,
              fontSize: "1rem",
              border: `1px solid ${BORDER}`,
              cursor: "pointer",
              letterSpacing: "0.01em",
              fontFamily: FONT,
            }}
          >
            See How It Works
          </button>
        </div>
      </section>

      {/* ─── Features ───────────────────────────────────────────────── */}
      <section
        id="features"
        style={{
          padding: "6rem 1.5rem",
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            marginBottom: "0.75rem",
          }}
        >
          Everything you need to scout smarter
        </h2>
        <p
          style={{
            textAlign: "center",
            color: MUTED,
            fontSize: "1rem",
            marginBottom: "3.5rem",
          }}
        >
          From raw footage to structured insights in minutes.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {features.map((f) => (
            <div
              key={f.title}
              style={{
                background: SURFACE,
                border: `1px solid ${BORDER}`,
                borderRadius: "0.75rem",
                padding: "2rem",
              }}
            >
              <div style={{ marginBottom: "1rem" }}>{f.icon}</div>
              <h3
                style={{
                  fontWeight: 600,
                  fontSize: "1.1rem",
                  marginBottom: "0.5rem",
                }}
              >
                {f.title}
              </h3>
              <p style={{ color: MUTED, fontSize: "0.9rem", lineHeight: 1.6 }}>
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Pricing ────────────────────────────────────────────────── */}
      <section
        style={{
          padding: "6rem 1.5rem",
          background: "#080808",
        }}
      >
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <h2
            style={{
              textAlign: "center",
              fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              marginBottom: "0.75rem",
            }}
          >
            Simple, transparent pricing
          </h2>
          <p
            style={{
              textAlign: "center",
              color: MUTED,
              fontSize: "1rem",
              marginBottom: "3.5rem",
            }}
          >
            No hidden fees. Cancel any time.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "1.5rem",
              alignItems: "start",
            }}
          >
            {plans.map((plan) => (
              <div
                key={plan.name}
                style={{
                  background: plan.highlighted ? ACCENT : SURFACE,
                  border: plan.highlighted
                    ? `2px solid ${ACCENT}`
                    : `1px solid ${BORDER}`,
                  borderRadius: "0.75rem",
                  padding: "2rem",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {plan.highlighted && (
                  <span
                    style={{
                      alignSelf: "flex-start",
                      background: "rgba(255,255,255,0.2)",
                      color: "#ffffff",
                      borderRadius: "9999px",
                      padding: "0.25rem 0.75rem",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      marginBottom: "1rem",
                    }}
                  >
                    Most Popular
                  </span>
                )}

                <h3
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    marginBottom: "0.5rem",
                  }}
                >
                  {plan.name}
                </h3>

                <div style={{ marginBottom: "1.75rem" }}>
                  <span
                    style={{
                      fontSize: "2.75rem",
                      fontWeight: 800,
                      letterSpacing: "-0.03em",
                    }}
                  >
                    ${plan.price}
                  </span>
                  <span
                    style={{
                      color: plan.highlighted ? "rgba(255,255,255,0.7)" : MUTED,
                      fontSize: "0.9rem",
                    }}
                  >
                    {" "}
                    / mo
                  </span>
                </div>

                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: "0 0 2rem 0",
                    flexGrow: 1,
                  }}
                >
                  {plan.perks.map((perk) => (
                    <li
                      key={perk}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.6rem",
                        marginBottom: "0.75rem",
                        fontSize: "0.95rem",
                        color: plan.highlighted
                          ? "rgba(255,255,255,0.9)"
                          : "#e4e4e7",
                      }}
                    >
                      <Check
                        size={16}
                        color={plan.highlighted ? "#ffffff" : ACCENT}
                      />
                      {perk}
                    </li>
                  ))}
                </ul>

                <Link
                  to="/signup"
                  style={{
                    display: "block",
                    textAlign: "center",
                    background: plan.highlighted ? "#ffffff" : ACCENT,
                    color: plan.highlighted ? ACCENT : "#ffffff",
                    padding: "0.85rem",
                    borderRadius: "0.5rem",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    textDecoration: "none",
                  }}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────────────────── */}
      <footer
        style={{
          textAlign: "center",
          padding: "3rem 1.5rem",
          borderTop: `1px solid ${BORDER}`,
        }}
      >
        <p
          style={{
            fontWeight: 700,
            fontSize: "1.1rem",
            marginBottom: "0.5rem",
          }}
        >
          ScoutVision
        </p>
        <p style={{ color: MUTED, fontSize: "0.875rem" }}>
          AI-powered scouting. Built for coaches who mean business.
        </p>
      </footer>
    </div>
  );
}
