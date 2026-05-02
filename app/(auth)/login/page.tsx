"use client";

import {
  Box,
  Typography,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import LockIcon from "@mui/icons-material/Lock";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import ShieldIcon from "@mui/icons-material/Shield";
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
      setApiError("Authentication failed. Verify your credentials and try again.");
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
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: { xs: "column", md: "row" } }}>
      {/* ---- Left: Visual Anchor ---- */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          width: "50%",
          position: "relative",
          overflow: "hidden",
          background: `linear-gradient(160deg, ${C.primaryContainer} 0%, ${C.primary} 100%)`,
          flexDirection: "column",
          justifyContent: "flex-end",
          p: 8,
        }}
      >
        {/* Decorative pattern overlay */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            opacity: 0.06,
            backgroundImage:
              "repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.1) 40px, rgba(255,255,255,0.1) 42px)",
          }}
        />
        {/* Subtle radial glow */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at 30% 80%, rgba(70,95,136,0.35) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(174,199,246,0.12) 0%, transparent 50%)",
          }}
        />

        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Typography
            sx={{
              fontFamily: "var(--font-manrope)",
              fontWeight: 800,
              fontSize: "3.5rem",
              color: "#fff",
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              mb: 3,
              maxWidth: 420,
            }}
          >
            InsightHub.
          </Typography>
          <Typography
            sx={{
              color: C.onPrimaryContainer,
              fontSize: 16,
              lineHeight: 1.7,
              maxWidth: 400,
              opacity: 0.9,
            }}
          >
            Precision in record-keeping, unshakeable in security. Welcome to the centralized intelligence hub for the modern legal professional.
          </Typography>

          <Box sx={{ display: "flex", gap: 6, mt: 8 }}>
            <Box>
              <Typography sx={{ color: "#fff", fontFamily: "var(--font-manrope)", fontWeight: 700, fontSize: "1.5rem" }}>
                256-bit
              </Typography>
              <Typography sx={{ color: C.onPrimaryContainer, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 600 }}>
                End-to-End Encryption
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ color: "#fff", fontFamily: "var(--font-manrope)", fontWeight: 700, fontSize: "1.5rem" }}>
                RBAC
              </Typography>
              <Typography sx={{ color: C.onPrimaryContainer, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 600 }}>
                Role-Based Access Control
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ---- Right: Login Form ---- */}
      <Box
        sx={{
          width: { xs: "100%", md: "50%" },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 4, md: 10 },
          background: C.surface,
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 420 }}>
          {/* Heading */}
          <Box sx={{ mb: 6 }}>
            {/* Mobile-only branding */}
            <Typography
              sx={{
                display: { xs: "block", md: "none" },
                fontFamily: "var(--font-manrope)",
                fontWeight: 800,
                fontSize: "1.5rem",
                color: C.primary,
                mb: 3,
              }}
            >
              InsightHub
            </Typography>
            <Typography
              sx={{
                fontFamily: "var(--font-manrope)",
                fontWeight: 700,
                fontSize: "2rem",
                color: C.primary,
                mb: 1,
              }}
            >
              Secure Archive Access
            </Typography>
            <Typography sx={{ color: C.onSurfaceVar, fontSize: 14 }}>
              Please verify your credentials to enter the sovereign database.
            </Typography>
          </Box>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            {/* API Error */}
            {apiError && (
              <Box
                sx={{
                  background: "#ffdad6",
                  color: "#93000a",
                  px: 2,
                  py: 1.5,
                  borderRadius: "4px",
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                {apiError}
              </Box>
            )}

            {/* Email */}
            <Box>
              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: C.onSurfaceVar,
                  marginBottom: 8,
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
                  borderBottomColor: fieldErrors.email ? "#ba1a1a" : "transparent",
                }}
                onFocus={(e) => (e.target.style.borderBottomColor = C.surfTint)}
                onBlur={(e) => (e.target.style.borderBottomColor = fieldErrors.email ? "#ba1a1a" : "transparent")}
              />
              {fieldErrors.email && (
                <Typography sx={{ color: "#ba1a1a", fontSize: 12, mt: 0.5 }}>{fieldErrors.email}</Typography>
              )}
            </Box>

            {/* Password */}
            <Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <label
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    color: C.onSurfaceVar,
                    fontFamily: "var(--font-inter)",
                  }}
                >
                  Security Key
                </label>
              </Box>
              <Box sx={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    ...inputStyle,
                    paddingRight: 48,
                    borderBottomColor: fieldErrors.password ? "#ba1a1a" : "transparent",
                  }}
                  onFocus={(e) => (e.target.style.borderBottomColor = C.surfTint)}
                  onBlur={(e) => (e.target.style.borderBottomColor = fieldErrors.password ? "#ba1a1a" : "transparent")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 4,
                    display: "flex",
                    alignItems: "center",
                    color: C.onSurfaceVar,
                  }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <VisibilityOffIcon sx={{ fontSize: 20 }} />
                  ) : (
                    <VisibilityIcon sx={{ fontSize: 20 }} />
                  )}
                </button>
              </Box>
              {fieldErrors.password && (
                <Typography sx={{ color: "#ba1a1a", fontSize: 12, mt: 0.5 }}>{fieldErrors.password}</Typography>
              )}
            </Box>

            {/* Submit */}
            <Box sx={{ pt: 1, display: "flex", flexDirection: "column", gap: 1.5 }}>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "16px 24px",
                  background: `linear-gradient(to right, ${C.primary}, ${C.primaryContainer})`,
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  fontFamily: "var(--font-manrope)",
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  opacity: isSubmitting ? 0.7 : 1,
                  transition: "opacity 0.2s, transform 0.1s",
                }}
              >
                <span>{isSubmitting ? "Verifying…" : "Verify Identity"}</span>
                <ArrowForwardIcon sx={{ fontSize: 20 }} />
              </button>
              <Typography
                sx={{
                  textAlign: "center",
                  color: C.onSurfaceVar,
                  fontSize: 13,
                  mt: 1,
                }}
              >
                User accounts are managed by your organization administrator.
              </Typography>
            </Box>
          </form>

          {/* Trust Signals */}
          <Box
            sx={{
              mt: 10,
              pt: 4,
              borderTop: `1px solid ${C.outlineVar}33`,
              display: "flex",
              flexWrap: "wrap",
              gap: 3,
              justifyContent: "space-between",
            }}
          >
            {[
              { icon: <LockIcon sx={{ fontSize: 18 }} />, label: "256-bit Encryption" },
              { icon: <VerifiedUserIcon sx={{ fontSize: 18 }} />, label: "RBAC Protocol" },
              { icon: <ShieldIcon sx={{ fontSize: 18 }} />, label: "Tenant Isolation" },
            ].map((item) => (
              <Box
                key={item.label}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.75,
                  opacity: 0.4,
                  filter: "grayscale(1)",
                  transition: "all 0.2s",
                  "&:hover": { opacity: 1, filter: "grayscale(0)" },
                }}
              >
                {item.icon}
                <Typography sx={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "-0.02em" }}>
                  {item.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
