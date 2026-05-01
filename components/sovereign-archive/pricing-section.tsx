"use client";

import Link from "next/link";

export interface PricingPlan {
  name: string;
  price: string | number;
  description?: string;
  features: string[];
  cta?: {
    label: string;
    href: string;
  };
  highlighted?: boolean;
}

interface PricingProps {
  id?: string;
  sectionLabel?: string;
  title: string;
  subtitle?: string;
  plans: PricingPlan[];
}

export function PricingSection({
  id,
  sectionLabel = "Transparent Scale",
  title = "Simple, scalable pricing.",
  subtitle = "Predictable pricing for sovereign control of your legal intelligence.",
  plans = [],
}: PricingProps) {
  return (
    <section id={id} className="bg-[#f6f4ef] py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="mb-16 text-center">
          <span className="mb-2 block text-xs font-bold uppercase tracking-[0.24em] text-[#006d42]">
            {sectionLabel}
          </span>
          <h2 className="text-4xl font-black text-[#002147] md:text-5xl">
            {title}
          </h2>
          {subtitle && (
            <p className="mx-auto mt-4 max-w-2xl text-slate-600">{subtitle}</p>
          )}
        </div>

        <div className="mb-20 grid gap-8 md:grid-cols-3">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`relative rounded-[1.75rem] border p-8 shadow-sm transition-all ${
                plan.highlighted
                  ? "scale-105 border-[#00D384] bg-[#002147] text-white shadow-xl"
                  : "border-slate-200 bg-white"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded bg-[#00D384] px-4 py-1 text-xs font-black uppercase tracking-widest text-[#002147]">
                  Most Popular
                </div>
              )}

              <div
                className={`text-lg font-bold mb-2 ${
                  plan.highlighted ? "text-[#00D384]" : "text-[#002147]"
                }`}
              >
                {plan.name}
              </div>

              <div
                className={`text-3xl font-black mb-6 ${
                  plan.highlighted ? "text-white" : "text-[#002147]"
                }`}
              >
                {typeof plan.price === "string" ? plan.price : `$${plan.price}`}
                {typeof plan.price === "number" && (
                  <span className="text-sm font-normal text-slate-400">
                    /mo
                  </span>
                )}
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, fidx) => (
                  <li
                    key={fidx}
                    className={`flex items-center gap-2 text-sm ${
                      plan.highlighted ? "text-slate-300" : "text-slate-600"
                    }`}
                  >
                    <span
                      className={
                        plan.highlighted ? "text-[#00D384]" : "text-[#006d42]"
                      }
                    >
                      ✓
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>

              {plan.cta && (
                <Link
                  href={plan.cta.href}
                  className={`w-full py-3 rounded font-bold text-sm transition-all block text-center ${
                    plan.highlighted
                      ? "bg-[#00D384] text-[#002147] hover:bg-[#0be091]"
                      : "border-2 border-[#002147] text-[#002147] hover:bg-[#002147] hover:text-white"
                  }`}
                >
                  {plan.cta.label}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
