import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { CheckCircle } from "lucide-react";
import { supabase } from "../lib/supabase";

const ACCENT = "#6366f1";
const MUTED = "#a1a1aa";
const BORDER = "#2a2a2a";
const FONT =
  "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

interface SignupForm {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export function Signup() {
  const [success, setSuccess] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupForm>();

  const onSubmit = async (data: SignupForm) => {
    setAuthError(null);

    // signUp with full_name in metadata — the on_auth_user_created trigger
    // reads raw_user_meta_data to insert the profiles row (SECURITY DEFINER)
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { full_name: data.fullName },
      },
    });

    if (error) {
      console.error("[Signup] Auth error:", error.message);
      setAuthError(error.message);
      return;
    }

    console.log("[Signup] Account created, profile row inserted via trigger");
    setSuccess(true);
  };

  // ── Success state ────────────────────────────────────────────────────────
  if (success) {
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
            textAlign: "center",
          }}
        >
          <CheckCircle
            size={48}
            color="#22c55e"
            style={{ margin: "0 auto 1.25rem" }}
          />
          <p
            style={{
              fontSize: "1.5rem",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "#ffffff",
              marginBottom: "0.75rem",
            }}
          >
            Scout<span style={{ color: ACCENT }}>Vision</span>
          </p>
          <p
            style={{
              fontSize: "1rem",
              fontWeight: 600,
              color: "#ffffff",
              marginBottom: "0.5rem",
            }}
          >
            Check your email to confirm your account
          </p>
          <p
            style={{
              fontSize: "0.875rem",
              color: MUTED,
              marginBottom: "1.75rem",
            }}
          >
            We sent a confirmation link to your inbox. Click it to activate your
            account and get started.
          </p>
          <Link
            to="/login"
            style={{
              display: "inline-block",
              color: ACCENT,
              textDecoration: "none",
              fontWeight: 500,
              fontSize: "0.875rem",
            }}
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  // ── Form ─────────────────────────────────────────────────────────────────
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
            Create your free account
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
          {/* Full name */}
          <div style={{ marginBottom: "1rem" }}>
            <label
              htmlFor="signup-name"
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "#e4e4e7",
                marginBottom: "0.4rem",
              }}
            >
              Full name
            </label>
            <input
              id="signup-name"
              type="text"
              placeholder="Alex Johnson"
              style={{
                width: "100%",
                background: "#1a1a1a",
                border: `1px solid ${errors.fullName ? "#ef4444" : BORDER}`,
                borderRadius: "0.5rem",
                padding: "0.75rem 1rem",
                color: "#ffffff",
                fontSize: "1rem",
                fontFamily: FONT,
                outline: "none",
                boxSizing: "border-box",
              }}
              {...register("fullName", { required: "Full name is required" })}
            />
            {errors.fullName && (
              <p
                style={{
                  color: "#f87171",
                  fontSize: "0.8rem",
                  marginTop: "0.35rem",
                }}
              >
                {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div style={{ marginBottom: "1rem" }}>
            <label
              htmlFor="signup-email"
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
              id="signup-email"
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
          <div style={{ marginBottom: "1rem" }}>
            <label
              htmlFor="signup-password"
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
              id="signup-password"
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
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
              })}
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

          {/* Confirm password */}
          <div style={{ marginBottom: "1.75rem" }}>
            <label
              htmlFor="signup-confirm"
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "#e4e4e7",
                marginBottom: "0.4rem",
              }}
            >
              Confirm password
            </label>
            <input
              id="signup-confirm"
              type="password"
              placeholder="••••••••"
              style={{
                width: "100%",
                background: "#1a1a1a",
                border: `1px solid ${errors.confirmPassword ? "#ef4444" : BORDER}`,
                borderRadius: "0.5rem",
                padding: "0.75rem 1rem",
                color: "#ffffff",
                fontSize: "1rem",
                fontFamily: FONT,
                outline: "none",
                boxSizing: "border-box",
              }}
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (val, { password }) =>
                  val === password || "Passwords do not match",
              })}
            />
            {errors.confirmPassword && (
              <p
                style={{
                  color: "#f87171",
                  fontSize: "0.8rem",
                  marginTop: "0.35rem",
                }}
              >
                {errors.confirmPassword.message}
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
            {isSubmitting ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: "0.875rem", color: MUTED }}>
          Already have an account?{" "}
          <Link
            to="/login"
            style={{ color: ACCENT, textDecoration: "none", fontWeight: 500 }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
