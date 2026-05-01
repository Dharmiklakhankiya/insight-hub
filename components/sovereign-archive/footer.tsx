"use client";

import * as React from "react";
import Link from "next/link";
import GavelOutlined from "@mui/icons-material/GavelOutlined";
import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";

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
  const [isPrivacyOpen, setIsPrivacyOpen] = React.useState(false);
  const [isTermsOpen, setIsTermsOpen] = React.useState(false);

  const openPrivacy = () => {
    setIsTermsOpen(false);
    setIsPrivacyOpen(true);
  };

  const openTerms = () => {
    setIsPrivacyOpen(false);
    setIsTermsOpen(true);
  };

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
          <button
            type="button"
            onClick={openPrivacy}
            className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            aria-haspopup="dialog"
          >
            Privacy Policy
          </button>
          <button
            type="button"
            onClick={openTerms}
            className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            aria-haspopup="dialog"
          >
            Terms of Service
          </button>
        </div>
      </div>

      <Dialog
        open={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              overflow: "hidden",
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
              background: "#fff",
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            pr: 6,
            position: "sticky",
            top: 0,
            zIndex: 10,
            background: "linear-gradient(to right, #002147, #003875)",
            color: "white",
            fontWeight: 600,
            letterSpacing: "0.02em",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          Privacy Policy
          <IconButton
            onClick={() => setIsPrivacyOpen(false)}
            sx={{
              color: "white",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.15)",
              },
            }}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent
          dividers
          sx={{
            px: { xs: 2.5, md: 4 },
            py: 3,
            lineHeight: 1.75,
            background: "#f8fafc",
          }}
        >
          <Box className="space-y-8">
            <section>
              <h2 className="text-lg font-semibold mb-2 text-[#002147]">
                1. Information We Collect
              </h2>
              <p className="text-slate-600">
                We collect information you provide directly to us, such as when
                you create an account, upload documents, or communicate with us.
                We may also collect information automatically as you navigate
                the System.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2 text-[#002147]">
                2. Use of Information
              </h2>
              <p className="text-slate-600">
                We use the information we collect to provide, maintain, and
                improve our services, to protect our rights and the rights of
                others, and to comply with our legal obligations.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2 text-[#002147]">
                3. Sharing of Information
              </h2>
              <p className="text-slate-600">
                We do not share your personal information with third parties
                except as described in this Privacy Policy or with your consent.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2 text-[#002147]">
                4. Data Security
              </h2>
              <p className="text-slate-600">
                We take reasonable measures to help protect information about
                you from loss, theft, misuse and unauthorized access,
                disclosure, alteration, and destruction.
              </p>
            </section>
          </Box>
        </DialogContent>
      </Dialog>

      {/* ================= TERMS ================= */}

      <Dialog
        open={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              overflow: "hidden",
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
              background: "#fff",
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            pr: 6,
            position: "sticky",
            top: 0,
            zIndex: 10,
            background: "linear-gradient(to right, #002147, #003875)",
            color: "white",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          Terms of Service
          <IconButton
            onClick={() => setIsTermsOpen(false)}
            sx={{
              color: "white",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.15)",
              },
            }}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent
          dividers
          sx={{
            px: { xs: 2.5, md: 4 },
            py: 3,
            lineHeight: 1.75,
            background: "#f8fafc",
          }}
        >
          <Box className="space-y-8">
            <section>
              <h2 className="text-lg font-semibold mb-2 text-[#002147]">
                1. Acceptance of Terms
              </h2>
              <p className="text-slate-600">
                By accessing the Sovereign Archive (the "System"), you
                acknowledge that you have read, understood, and agree to be
                bound by these Terms of Service. If you do not agree to these
                terms, you must cease all use of the System immediately.
              </p>
              <p className="text-slate-600 mt-2">
                We reserve the right to modify these terms at any time. Your
                continued use of the System following the posting of changes
                constitutes your acceptance of such changes.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2 text-[#002147]">
                2. Limitations of Liability
              </h2>
              <p className="text-slate-600">
                To the maximum extent permitted by applicable law, InsightHub
                shall not be liable for any indirect, incidental, special,
                consequential, or punitive damages, or any loss of profits or
                revenues, whether incurred directly or indirectly.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2 text-[#002147]">
                3. Governing Law
              </h2>
              <p className="text-slate-600">
                These Terms shall be governed and construed in accordance with
                the laws of the Sovereign District, without regard to its
                conflict of law provisions. Any dispute arising out of or
                related to these Terms shall be resolved exclusively in the
                courts of the Sovereign District.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2 text-[#002147]">
                4. Data Sovereignty
              </h2>
              <p className="text-slate-600">
                The Sovereign Archive maintains strict protocols for data
                integrity. Users are responsible for maintaining the
                confidentiality of their credentials and all activities
                occurring under their account.
              </p>
            </section>
          </Box>
        </DialogContent>
      </Dialog>
    </footer>
  );
}
