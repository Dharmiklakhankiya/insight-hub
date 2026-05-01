"use client";

import Link from "next/link";

export interface CTAButton {
  label: string;
  href: string;
  primary?: boolean;
}

interface CTASectionProps {
  id?: string;
  title: string;
  description?: string;
  buttons?: CTAButton[];
  trustItems?: Array<{ icon?: string; label: string }>;
  bgColor?: string;
}

export function CTASection({
  id,
  title = "A clean path from intake to resolution.",
  description = "Join the modern era of legal case management. Deploy the Sovereign Archive for your firm today.",
  buttons = [
    { label: "Start Your Free Trial", href: "/login", primary: true },
    { label: "Schedule an Audit", href: "#" },
  ],
  trustItems = [
    { icon: "🔒", label: "256-bit AES" },
    { icon: "🛡️", label: "SOC2 Type II" },
    { icon: "✓", label: "GDPR Compliant" },
  ],
  bgColor = "bg-[#002147]",
}: CTASectionProps) {
  return (
    <section
      id={id}
      className={`relative overflow-hidden py-20 text-white lg:py-28 ${bgColor}`}
    >
      <div className="absolute inset-0 opacity-10">
        <div className="absolute left-0 top-0 h-full w-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#006d42] via-transparent to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 text-center md:px-8">
        <h2 className="mb-6 text-4xl font-black leading-tight md:text-6xl">
          {title}
        </h2>

        {description && (
          <p className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-slate-300 md:text-lg">
            {description}
          </p>
        )}

        {buttons && buttons.length > 0 && (
          <div className="mb-16 flex flex-col justify-center gap-4 sm:flex-row">
            {buttons.map((button, idx) => (
              <Link
                key={idx}
                href={button.href}
                className={`px-10 py-4 rounded font-black text-lg transition-all ${
                  button.primary
                    ? "bg-[#00D384] text-[#002147] hover:bg-[#0be091]"
                    : "border-2 border-white text-white hover:bg-white hover:text-[#002147]"
                }`}
              >
                {button.label}
              </Link>
            ))}
          </div>
        )}

        {trustItems && trustItems.length > 0 && (
          <div className="flex flex-wrap justify-center gap-8 text-slate-400">
            {trustItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                {item.icon && <span>{item.icon}</span>}
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
