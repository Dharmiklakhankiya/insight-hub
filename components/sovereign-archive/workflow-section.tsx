"use client";

export interface WorkflowStep {
  step: string;
  title: string;
  description: string;
}

interface WorkflowSectionProps {
  id?: string;
  sectionLabel?: string;
  title?: string;
  description?: string;
  steps: WorkflowStep[];
}

export function WorkflowSection({
  id,
  sectionLabel = "Workflow",
  title = "A clean path from intake to final resolution.",
  description = "The platform keeps every case organized so teams can move from first filing to closeout without losing context or documents along the way.",
  steps = [],
}: WorkflowSectionProps) {
  return (
    <section
      id={id}
      className="mx-auto max-w-7xl scroll-mt-24 px-6 py-6 lg:scroll-mt-28 lg:px-8 lg:py-12"
    >
      <div className="grid gap-6 rounded-[2rem] bg-[#002147] p-8 text-white lg:grid-cols-[0.95fr_1.05fr] lg:p-12">
        <div>
          <div className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
            {sectionLabel}
          </div>
          <h2 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">
            {title}
          </h2>
          <p className="mt-4 max-w-xl leading-7 text-white/70">{description}</p>
        </div>

        <div className="grid gap-4">
          {steps.map((item) => (
            <div
              key={item.step}
              className="rounded-3xl border border-white/10 bg-white/6 p-5"
            >
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-white px-3 py-2 text-sm font-extrabold text-[#002147]">
                  {item.step}
                </div>
                <div>
                  <div className="text-xl font-black">{item.title}</div>
                  <p className="mt-2 text-sm leading-6 text-white/70">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
