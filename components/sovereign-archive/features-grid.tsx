"use client";

export interface Feature {
  icon?: string;
  title: string;
  description: string;
}

interface FeaturesGridProps {
  id?: string;
  sectionLabel?: string;
  title: string;
  subtitle?: string;
  features: Feature[];
  columns?: 2 | 3;
  bgColor?: string;
}

export function FeaturesGrid({
  id,
  sectionLabel = "The InsightHub Advantage",
  title = "Built like a premium software product, not a generic portal.",
  subtitle,
  features = [],
  columns = 3,
  bgColor = "bg-white",
}: FeaturesGridProps) {
  return (
    <section id={id} className={`py-20 lg:py-28 ${bgColor}`}>
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="mb-16 text-center">
          {sectionLabel && (
            <span className="text-xs font-bold uppercase tracking-[0.24em] text-[#006d42]">
              {sectionLabel}
            </span>
          )}
          <h2 className="mt-2 text-4xl font-black text-[#002147] md:text-5xl">
            {title}
          </h2>
          {subtitle && (
            <p className="mx-auto mt-4 max-w-2xl text-slate-600">{subtitle}</p>
          )}
        </div>

        <div
          className={`grid gap-6 ${
            columns === 3
              ? "md:grid-cols-3"
              : columns === 2
                ? "md:grid-cols-2"
                : "grid-cols-1"
          }`}
        >
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              {feature.icon && (
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#002147] text-2xl text-white shadow-lg shadow-slate-950/15">
                  {feature.icon}
                </div>
              )}
              <h3 className="mb-3 text-2xl font-black text-[#002147]">
                {feature.title}
              </h3>
              <p className="text-sm leading-7 text-slate-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
