"use client";

import {
  Eye,
  EyeOff,
  Lock,
  Shield,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import { ZodError } from "zod";

import { apiPost } from "@/lib/client-api";
import type { User } from "@/lib/types";
import { loginSchema } from "@/lib/validators/auth.schema";

const C = {
  primary: "#000a1e",
  primaryContainer: "#002147",
  onPrimaryContainer: "#708ab5",
  surfTint: "#465f88",
  surface: "#f8f9fa",
  surfHighest: "#e1e3e4",
  onSurface: "#191c1d",
  onSurfaceVar: "#44474e",
  outlineVar: "#c4c6cf",
};

function mapZodErrors(error: ZodError): Record<string, string> {
  return error.issues.reduce<Record<string, string>>((acc, issue) => {
    const key = issue.path[0] ? String(issue.path[0]) : "root";
    if (!acc[key]) acc[key] = issue.message;
    return acc;
  }, {});
}

export default function LoginPage() {
  const router = useRouter();
  const [nextPath, setNextPath] = useState("/dashboard");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const next = new URLSearchParams(window.location.search).get("next");
    if (next && next.startsWith("/")) setNextPath(next);
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setApiError(null);
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const parsed = loginSchema.safeParse({ email, password });
      if (!parsed.success) {
        setFieldErrors(mapZodErrors(parsed.error));
        return;
      }
      await apiPost<{ user: User }>("/api/auth/login", parsed.data);
      router.push(nextPath);
      router.refresh();
    } catch {
      setApiError(
        "Authentication failed. Verify your credentials and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: C.surfHighest,
    border: "none",
    borderBottom: "2px solid transparent",
    padding: "16px",
    fontFamily: "var(--font-inter), sans-serif",
    fontSize: 14,
    color: C.onSurface,
    borderRadius: 2,
    outline: "none",
    transition: "border-color 0.2s",
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* ---- Left: Visual Anchor ---- */}
      <div
        className="hidden md:flex w-1/2 relative overflow-hidden flex-col justify-end p-8"
        style={{
          background: `linear-gradient(160deg, ${C.primaryContainer} 0%, ${C.primary} 100%)`,
        }}
      >
        {/* Decorative pattern overlay */}
        <div
          className="absolute inset-0 opacity-6 pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.1) 40px, rgba(255,255,255,0.1) 42px)",
          }}
        />
        {/* Subtle radial glow */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 30% 80%, rgba(70,95,136,0.35) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(174,199,246,0.12) 0%, transparent 50%)",
          }}
        />

        <div className="relative z-10">
          <h1
            className="font-['Manrope'] font-black text-5xl text-white mb-3 max-w-96"
            style={{ letterSpacing: "-0.03em", lineHeight: 1.1 }}
          >
            InsightHub.
          </h1>
          <p
            className="text-base leading-7 max-w-96"
            style={{
              color: C.onPrimaryContainer,
              opacity: 0.9,
            }}
          >
            Precision in record-keeping, unshakeable in security. Welcome to the
            centralized intelligence hub for the modern legal professional.
          </p>

          <div className="flex gap-12 mt-8">
            <div>
              <h2 className="font-['Manrope'] font-bold text-2xl text-white">
                256-bit
              </h2>
              <p
                className="text-xs font-semibold uppercase tracking-widest mt-2"
                style={{ color: C.onPrimaryContainer }}
              >
                End-to-End Encryption
              </p>
            </div>
            <div>
              <h2 className="font-['Manrope'] font-bold text-2xl text-white">
                RBAC
              </h2>
              <p
                className="text-xs font-semibold uppercase tracking-widest mt-2"
                style={{ color: C.onPrimaryContainer }}
              >
                Role-Based Access Control
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ---- Right: Login Form ---- */}
      <div
        className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-10"
        style={{ background: C.surface }}
      >
        <div className="w-full max-w-96">
          {/* Heading */}
          <div className="mb-6">
            {/* Mobile-only branding */}
            <h2
              className="md:hidden font-['Manrope'] font-black text-2xl mb-3"
              style={{ color: C.primary }}
            >
              InsightHub
            </h2>
            <h1
              className="font-['Manrope'] font-bold text-3xl mb-1"
              style={{ color: C.primary }}
            >
              Secure Archive Access
            </h1>
            <p className="text-sm" style={{ color: C.onSurfaceVar }}>
              Please verify your credentials to enter the sovereign database.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-7">
            {/* API Error */}
            {apiError && (
              <div
                className="px-2 py-1.5 rounded text-sm font-medium"
                style={{
                  background: "#ffdad6",
                  color: "#93000a",
                }}
              >
                {apiError}
              </div>
            )}

            {/* Email */}
            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-widest mb-2"
                style={{
                  color: C.onSurfaceVar,
                  fontFamily: "var(--font-inter)",
                }}
              >
                Official Email Address
              </label>
              <input
                type="email"
                required
                placeholder="name@organization.gov"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  ...inputStyle,
                  borderBottomColor: fieldErrors.email
                    ? "#ba1a1a"
                    : "transparent",
                }}
                onFocus={(e) => (e.target.style.borderBottomColor = C.surfTint)}
                onBlur={(e) =>
                  (e.target.style.borderBottomColor = fieldErrors.email
                    ? "#ba1a1a"
                    : "transparent")
                }
              />
              {fieldErrors.email && (
                <p className="text-xs mt-1" style={{ color: "#ba1a1a" }}>
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label
                  className="text-xs font-semibold uppercase tracking-widest"
                  style={{
                    color: C.onSurfaceVar,
                    fontFamily: "var(--font-inter)",
                  }}
                >
                  Security Key
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    ...inputStyle,
                    paddingRight: 48,
                    borderBottomColor: fieldErrors.password
                      ? "#ba1a1a"
                      : "transparent",
                  }}
                  onFocus={(e) =>
                    (e.target.style.borderBottomColor = C.surfTint)
                  }
                  onBlur={(e) =>
                    (e.target.style.borderBottomColor = fieldErrors.password
                      ? "#ba1a1a"
                      : "transparent")
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-none border-none cursor-pointer p-1 flex items-center"
                  style={{ color: C.onSurfaceVar }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-xs mt-1" style={{ color: "#ba1a1a" }}>
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Submit */}
            <div className="pt-1 flex flex-col gap-1.5">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-between items-center px-6 py-4 text-white border-none rounded text-base font-bold transition-opacity"
                style={{
                  background: `linear-gradient(to right, ${C.primary}, ${C.primaryContainer})`,
                  fontFamily: "var(--font-manrope)",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  opacity: isSubmitting ? 0.7 : 1,
                }}
              >
                <span>{isSubmitting ? "Verifying…" : "Verify Identity"}</span>
                <ArrowRight className="h-5 w-5" />
              </button>
              <p
                className="text-center text-sm mt-1"
                style={{ color: C.onSurfaceVar }}
              >
                User accounts are managed by your organization administrator.
              </p>
            </div>
          </form>

          {/* Trust Signals */}
          <div
            className="mt-10 pt-4 flex flex-wrap gap-3 justify-between"
            style={{ borderTop: `1px solid ${C.outlineVar}33` }}
          >
            {[
              {
                icon: <Lock className="h-4 w-4" />,
                label: "256-bit Encryption",
              },
              {
                icon: <CheckCircle2 className="h-4 w-4" />,
                label: "RBAC Protocol",
              },
              {
                icon: <Shield className="h-4 w-4" />,
                label: "Tenant Isolation",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-0.75 transition-all opacity-40 grayscale hover:opacity-100 hover:grayscale-0"
              >
                {item.icon}
                <p className="text-xs font-bold uppercase tracking-tighter">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
