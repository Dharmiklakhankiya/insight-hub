"use client";

import Link from "next/link";
import GavelOutlined from "@mui/icons-material/GavelOutlined";

export interface NavLink {
  label: string;
  href: string;
}

export interface HeaderProps {
  navLinks?: NavLink[];
  ctaLabel?: string;
  ctaHref?: string;
}

export function Header({
  navLinks = [
    { label: "Litigation Portfolio", href: "#portfolio" },
    { label: "Workflow", href: "#workflow" },
    { label: "Security Protocols", href: "#security" },
  ],
  ctaLabel = "Access Vault",
  ctaHref = "/login?next=/dashboard",
}: HeaderProps) {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 md:px-8">
        <Link
          href="#top"
          className="flex items-center gap-3 transition-opacity hover:opacity-80"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#002147] text-white shadow-lg shadow-slate-950/20">
            <GavelOutlined fontSize="small" />
          </span>
          <span className="font-['Manrope'] text-xl font-black uppercase tracking-tighter text-[#002147]">
            InsightHub
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-['Manrope'] font-medium text-slate-600 transition-colors hover:text-[#002147]"
            >
              {link.label}
            </a>
          ))}
        </div>

        <Link
          href={ctaHref}
          className="rounded-full border border-[#00D384]/30 bg-[#00D384] px-6 py-2.5 text-sm font-bold text-[#002147] transition-all hover:-translate-y-0.5 hover:bg-[#0be091] active:scale-[0.98]"
        >
          {ctaLabel}
        </Link>
      </nav>
    </header>
  );
}
