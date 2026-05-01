"use client";

import Link from "next/link";

export interface SecurityHighlight {
  icon: string;
  label: string;
}

interface SecuritySectionProps {
  id?: string;
  sectionLabel?: string;
  title?: string;
  description?: string;
  checkpoints?: string[];
  highlights?: SecurityHighlight[];
  primaryCTA?: { label: string; href: string };
  secondaryCTA?: { label: string; href: string };
}

export function SecuritySection({
  id,
  sectionLabel = "Security",
  title = "The same precision you expect from enterprise legal software.",
  description = "InsightHub combines JWT authentication, CSRF protection, rate limiting, and secure role-aware access so your team can focus on the matter instead of the middleware.",
  checkpoints = [
    "JWT-based sign in",
    "HTTP-only session cookies",
    "Document uploads with validation",
    "Audit-friendly data model",
  ],
  highlights = [
    { icon: "🔒", label: "256-bit AES" },
    { icon: "🛡️", label: "SOC2 Type II" },
    { icon: "✓", label: "GDPR Compliant" },
  ],
  primaryCTA = { label: "Sign in now", href: "/login?next=/dashboard" },
  secondaryCTA = { label: "Back to top", href: "#top" },
}: SecuritySectionProps) {
  return (
    <section id={id} className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm lg:p-10">
          <div className="text-sm font-bold uppercase tracking-[0.24em] text-slate-500">
            {sectionLabel}
          </div>
          <h2 className="mt-4 text-4xl font-black tracking-tight text-[#002147]">
            {title}
          </h2>
          <p className="mt-4 max-w-2xl leading-7 text-slate-600">
            {description}
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {checkpoints.map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700"
              >
                <span className="text-emerald-600">✓</span>
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] bg-gradient-to-br from-[#f0e4d4] to-[#dce8ff] p-8 shadow-sm lg:p-10">
          <div className="flex items-center gap-3 text-[#002147]">
            <span className="text-lg">◎</span>
            <span className="text-sm font-semibold uppercase tracking-[0.22em]">
              Ready to start
            </span>
          </div>
          <h3 className="mt-6 max-w-md text-3xl font-black tracking-tight text-[#002147]">
            Bring your team into one focused workspace.
          </h3>
          <p className="mt-4 leading-7 text-slate-700">
            Open the secure login flow to continue into the dashboard, or use
            the same entry point to onboard a new matter quickly.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              href={primaryCTA.href}
              className="inline-flex items-center justify-center rounded-full border border-amber-200 bg-amber-400 px-6 py-3.5 text-base font-extrabold text-[#002147] shadow-[0_18px_40px_rgba(245,158,11,0.28)] transition hover:-translate-y-0.5 hover:bg-amber-300 hover:shadow-[0_22px_50px_rgba(245,158,11,0.34)]"
            >
              {primaryCTA.label}
            </Link>
            <Link
              href={secondaryCTA.href}
              className="inline-flex items-center justify-center rounded-full border border-slate-950/15 bg-white/80 px-6 py-3.5 text-base font-semibold text-[#002147] transition hover:bg-white"
            >
              {secondaryCTA.label}
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {highlights.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-[#002147] shadow-sm"
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
