import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../contexts/AuthContext";

const ACCENT = "#6366f1";
const MUTED = "#a1a1aa";
const BORDER = "#2a2a2a";
const FONT =
  "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

interface LoginForm {
  email: string;
  password: string;
}

export function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setAuthError(null);
    try {
      await signIn(data.email, data.password);
      console.log("[Login] Sign in successful");
      navigate("/dashboard");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sign in failed";
      console.error("[Login] Auth error:", msg);
      setAuthError(msg);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        fontFamily: FONT,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          background: "#111111",
          border: `1px solid ${BORDER}`,
          borderRadius: "0.75rem",
          padding: "2.5rem",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <p
            style={{
              fontSize: "1.5rem",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "#ffffff",
              marginBottom: "0.4rem",
            }}
          >
            Scout<span style={{ color: ACCENT }}>Vision</span>
          </p>
          <p style={{ fontSize: "0.875rem", color: MUTED }}>
            Sign in to your account
          </p>
        </div>

        {/* Auth error banner */}
        {authError && (
          <div
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: "0.5rem",
              padding: "0.75rem 1rem",
              color: "#f87171",
              fontSize: "0.875rem",
              marginBottom: "1.25rem",
            }}
          >
            {authError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Email */}
          <div style={{ marginBottom: "1rem" }}>
            <label
              htmlFor="login-email"
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "#e4e4e7",
                marginBottom: "0.4rem",
              }}
            >
              Email
            </label>
            <input
              id="login-email"
              type="email"
              placeholder="you@example.com"
              style={{
                width: "100%",
                background: "#1a1a1a",
                border: `1px solid ${errors.email ? "#ef4444" : BORDER}`,
                borderRadius: "0.5rem",
                padding: "0.75rem 1rem",
                color: "#ffffff",
                fontSize: "1rem",
                fontFamily: FONT,
                outline: "none",
                boxSizing: "border-box",
              }}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: "Enter a valid email address",
                },
              })}
            />
            {errors.email && (
              <p
                style={{
                  color: "#f87171",
                  fontSize: "0.8rem",
                  marginTop: "0.35rem",
                }}
              >
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div style={{ marginBottom: "1.75rem" }}>
            <label
              htmlFor="login-password"
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "#e4e4e7",
                marginBottom: "0.4rem",
              }}
            >
              Password
            </label>
            <input
              id="login-password"
              type="password"
              placeholder="••••••••"
              style={{
                width: "100%",
                background: "#1a1a1a",
                border: `1px solid ${errors.password ? "#ef4444" : BORDER}`,
                borderRadius: "0.5rem",
                padding: "0.75rem 1rem",
                color: "#ffffff",
                fontSize: "1rem",
                fontFamily: FONT,
                outline: "none",
                boxSizing: "border-box",
              }}
              {...register("password", { required: "Password is required" })}
            />
            {errors.password && (
              <p
                style={{
                  color: "#f87171",
                  fontSize: "0.8rem",
                  marginTop: "0.35rem",
                }}
              >
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: "100%",
              background: ACCENT,
              color: "#ffffff",
              border: "none",
              borderRadius: "0.5rem",
              padding: "0.85rem",
              fontSize: "1rem",
              fontWeight: 600,
              fontFamily: FONT,
              cursor: isSubmitting ? "not-allowed" : "pointer",
              opacity: isSubmitting ? 0.7 : 1,
              marginBottom: "1.25rem",
            }}
          >
            {isSubmitting ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: "0.875rem", color: MUTED }}>
          Don&apos;t have an account?{" "}
          <Link
            to="/signup"
            style={{ color: ACCENT, textDecoration: "none", fontWeight: 500 }}
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
