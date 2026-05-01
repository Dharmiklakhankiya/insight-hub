"use client";

import Link from "next/link";
import GavelOutlined from "@mui/icons-material/GavelOutlined";

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}

export interface FooterProps {
  id?: string;
  sections?: FooterSection[];
  copyright?: string;
  socialLinks?: Array<{ icon: string; href: string }>;
}

export function Footer({
  id,
  sections = [
    {
      title: "Platform",
      links: [
        { label: "Litigation Portfolio", href: "/#portfolio" },
        { label: "Case Governance", href: "/#features" },
        { label: "Security Protocols", href: "/#security" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Pricing", href: "/#pricing" },
        { label: "Documentation", href: "/#workflow" },
        { label: "Terms of Service", href: "#" },
      ],
    },
  ],
  copyright = `© ${new Date().getFullYear()} InsightHub. All Rights Reserved.`,
  socialLinks = [
    { icon: "share", href: "#" },
    { icon: "public", href: "#" },
    { icon: "mail", href: "#" },
  ],
}: FooterProps) {
  return (
    <footer
      id={id}
      className="border-t border-slate-200 bg-white dark:border-slate-800/50 dark:bg-[#001126] relative overflow-hidden"
    >
      {/* Decorative background element for premium feel */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent opacity-50 dark:opacity-100 pointer-events-none"></div>

      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-16 md:grid-cols-4 md:px-8 relative z-10">
        <div className="col-span-2 md:col-span-1">
          <Link href="#top" className="mb-6 flex items-center gap-3 group">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#002147] to-[#003875] text-white shadow-lg shadow-blue-900/20 transition-transform group-hover:scale-105 group-hover:rotate-3 duration-300">
              <GavelOutlined fontSize="small" />
            </span>
            <span className="text-xl font-bold text-[#002147] dark:text-white tracking-tight">
              InsightHub
            </span>
          </Link>
          <p className="mb-8 text-sm leading-relaxed text-slate-500 dark:text-slate-300">
            The leading platform for precision legal intelligence and secure
            case management.
          </p>
          <div className="flex gap-4">
            {socialLinks.map((social, idx) => (
              <Link
                key={idx}
                href={social.href}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 transition-all hover:-translate-y-1 hover:bg-[#002147] hover:text-white hover:border-[#002147] dark:hover:bg-blue-600 dark:hover:text-white dark:hover:border-blue-500 shadow-sm"
              >
                <span className="text-xs font-bold uppercase tracking-wider">
                  {social.icon.slice(0, 2)}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Link Sections */}
        {sections.map((section, idx) => (
          <div key={idx}>
            <h4 className="font-semibold text-[#002147] dark:text-white mb-6 text-sm uppercase tracking-wider">
              {section.title}
            </h4>
            <ul className="space-y-4">
              {section.links.map((link, lidx) => (
                <li key={lidx}>
                  <a
                    href={link.href}
                    className="text-slate-500 dark:text-slate-300 hover:text-[#002147] dark:hover:text-blue-400 transition-colors text-sm flex items-center gap-2 group"
                  >
                    <span className="h-px w-0 bg-[#002147] dark:bg-blue-400 transition-all duration-300 group-hover:w-4"></span>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Global Settings */}
        <div>
          <h4 className="font-semibold text-[#002147] dark:text-white mb-6 text-sm uppercase tracking-wider">
            Global
          </h4>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-slate-500 dark:text-slate-300 text-sm p-3 rounded-lg bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/50 transition-colors hover:border-slate-200 dark:hover:border-slate-700">
              <span className="text-lg">🌐</span> English (US)
            </div>
            <div className="flex items-center gap-3 text-slate-500 dark:text-slate-300 text-sm p-3 rounded-lg bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/50 transition-colors hover:border-slate-200 dark:hover:border-slate-700">
              <span className="text-lg">🔒</span> Encryption Active
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="mx-auto max-w-7xl border-t border-slate-200/50 dark:border-slate-800/50 px-6 py-8 md:px-8 relative z-10 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {copyright}
        </p>
        <div className="flex gap-6 text-sm text-slate-400 dark:text-slate-500">
          <Link
            href="#"
            className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            Privacy Policy
          </Link>
          <Link
            href="#"
            className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}
