"use client";

import Link from "next/link";
import { ArrowForward } from "@mui/icons-material";

export interface HeroProps {
  badge?: string;
  title: string;
  description: string;
  primaryCTA: {
    label: string;
    href: string;
  };
  secondaryCTA?: {
    label: string;
    href: string;
  };
  stats?: Array<{
    value: string;
    label: string;
  }>;
  imageSrc?: string;
  imageAlt?: string;
}

export function HeroSection({
  badge = "Archive Analyze Act",
  title = "The modern control center for legal case intelligence.",
  description = "Securely manage high-stakes litigation with surgical precision. Access immutable records and real-time portfolio analytics through a single, authoritative interface.",
  primaryCTA = { label: "Open secure access", href: "/login?next=/dashboard" },
  secondaryCTA = { label: "Request Demo", href: "#" },
  stats = [
    { value: "12.4k", label: "Cases Archived" },
    { value: "38%", label: "Improvement" },
    { value: "< 2s", label: "Retrieval" },
  ],
  imageSrc,
  imageAlt = "Legal intelligence dashboard",
}: HeroProps) {
  return (
    <section
      id="top"
      className="relative overflow-hidden bg-white pb-20 pt-28 lg:pb-28 lg:pt-32"
    >
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-8rem] top-[-6rem] h-[22rem] w-[22rem] rounded-full bg-[#d9e6ff] blur-3xl" />
        <div className="absolute right-[-6rem] top-[12rem] h-[18rem] w-[18rem] rounded-full bg-[#f4ddc8] blur-3xl" />
        <div className="absolute bottom-[-8rem] left-[20%] h-[24rem] w-[24rem] rounded-full bg-[#dfe9df] blur-3xl" />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 md:px-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative z-10">
          {badge && (
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/85 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-slate-700 shadow-sm">
              {badge}
            </span>
          )}

          <h1 className="max-w-3xl text-5xl font-black tracking-tight text-[#002147] md:text-7xl">
            {title}
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 md:text-xl">
            {description}
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              href={primaryCTA.href}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-amber-200 bg-amber-400 px-6 py-3.5 text-base font-extrabold text-[#002147] shadow-[0_18px_40px_rgba(245,158,11,0.28)] transition hover:-translate-y-0.5 hover:bg-amber-300 hover:shadow-[0_22px_50px_rgba(245,158,11,0.34)]"
            >
              {primaryCTA.label}
              <ArrowForward fontSize="small" />
            </Link>
            {secondaryCTA && (
              <Link
                href={secondaryCTA.href}
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3.5 text-base font-semibold text-slate-900 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
              >
                {secondaryCTA.label}
              </Link>
            )}
          </div>

          {stats && stats.length > 0 && (
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {stats.map((stat, idx) => (
                <div key={idx}>
                  <div className="text-3xl font-black text-[#002147]">
                    {stat.value}
                  </div>
                  <div className="mt-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <div className="absolute -left-8 top-8 h-24 w-24 rounded-full bg-[#dce9ff] blur-2xl" />
          <div className="absolute -right-6 bottom-10 h-28 w-28 rounded-full bg-[#ead8c2] blur-3xl" />

          <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white p-4 shadow-[0_24px_80px_rgba(15,23,42,0.14)]">
            <div className="rounded-[1.6rem] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.24em] text-slate-400">
                    Case command center
                  </div>
                  <h2 className="mt-3 text-2xl font-black">
                    Litigation portfolio overview
                  </h2>
                </div>
                <div className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
                  Live
                </div>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {[
                  ["Active matters", "248"],
                  ["Closed this quarter", "91"],
                  ["Open alerts", "12"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-white/10 bg-white/6 p-4"
                  >
                    <div className="text-sm text-white/65">{label}</div>
                    <div className="mt-2 text-3xl font-black">{value}</div>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-white/6 p-4">
                <div className="flex items-center justify-between text-sm text-white/70">
                  <span>Today&apos;s workflow</span>
                  <span>Hearing in 3h 20m</span>
                </div>
                <div className="mt-4 space-y-3">
                  {[
                    "Upload evidence bundle",
                    "Review hearing notes",
                    "Update assigned counsel",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 rounded-xl bg-white/8 px-4 py-3"
                    >
                      <span className="text-emerald-300">●</span>
                      <span className="text-sm text-white/88">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-4 bg-[#fbfaf8] p-6 sm:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-500">
                    Search snapshot
                  </span>
                  <span className="text-slate-400">⌕</span>
                </div>
                <div className="mt-4 rounded-2xl bg-slate-950 px-4 py-3 text-sm text-slate-100">
                  <span className="text-slate-400">Query:</span> breach of
                  contract filings
                </div>
                <div className="mt-4 space-y-3">
                  {[
                    ["Miller v. Orion", "Civil • Filed 2d ago"],
                    ["Atlas Holdings matter", "Pending • 4 attachments"],
                    ["State compliance review", "Closed • Judgment entered"],
                  ].map(([itemTitle, meta]) => (
                    <div
                      key={itemTitle}
                      className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 px-4 py-3"
                    >
                      <div>
                        <div className="font-semibold text-slate-950">
                          {itemTitle}
                        </div>
                        <div className="mt-1 text-sm text-slate-500">
                          {meta}
                        </div>
                      </div>
                      <span className="mt-1 text-emerald-600">↗</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="text-sm font-semibold text-slate-500">
                  Access governance
                </div>
                <div className="mt-4 space-y-3">
                  {[
                    "Role-based permissions",
                    "Audit-ready document trail",
                    "Case-level file tagging",
                    "CSRF protected session flow",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700"
                    >
                      <span className="text-slate-950">✓</span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {imageSrc ? (
            <div className="sr-only" aria-hidden="true">
              <img alt={imageAlt} src={imageSrc} />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
