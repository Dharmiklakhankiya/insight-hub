import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  AnalyticsOutlined,
  ArrowForward,
  CheckCircleRounded,
  GavelOutlined,
  SearchOutlined,
  SecurityOutlined,
  ShieldOutlined,
  TrendingUpOutlined,
  WorkOutlineOutlined,
} from "@mui/icons-material";

import { getSessionFromCookies } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "InsightHub | The Sovereign Archive for Legal Intelligence",
  description:
    "InsightHub is a secure legal case management platform for firms that need case tracking, document control, and analytics in one system.",
};

const features = [
  {
    icon: SecurityOutlined,
    title: "Secure archive access",
    description:
      "Protected case records, document storage, and role-aware access controls built for sensitive legal work.",
  },
  {
    icon: AnalyticsOutlined,
    title: "Actionable analytics",
    description:
      "Track active matters, monitor progress, and surface patterns across your caseload in seconds.",
  },
  {
    icon: SearchOutlined,
    title: "Fast discovery",
    description:
      "Search across matters, clients, and document metadata without digging through scattered systems.",
  },
];

const stats = [
  { label: "Cases managed", value: "12.4k" },
  { label: "Avg. resolution lift", value: "38%" },
  { label: "Document retrieval", value: "< 2s" },
];

const workflow = [
  {
    step: "01",
    title: "Create the matter",
    description:
      "Record case details, assign counsel, and establish the timeline from intake onward.",
  },
  {
    step: "02",
    title: "Attach evidence",
    description:
      "Upload documents, tag files by issue or hearing, and keep every artifact organized.",
  },
  {
    step: "03",
    title: "Track the outcome",
    description:
      "Monitor hearings, deadlines, and status changes with analytics that stay current.",
  },
];

export default async function Home() {
  const session = await getSessionFromCookies();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#f6f4ef] text-slate-950">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-8rem] top-[-7rem] h-[22rem] w-[22rem] rounded-full bg-[#d9e6ff] blur-3xl" />
        <div className="absolute right-[-6rem] top-[12rem] h-[18rem] w-[18rem] rounded-full bg-[#f4ddc8] blur-3xl" />
        <div className="absolute bottom-[-8rem] left-[20%] h-[24rem] w-[24rem] rounded-full bg-[#dfe9df] blur-3xl" />
      </div>

      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <Link href="#top" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-950/20">
              <GavelOutlined fontSize="small" />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="font-heading text-xl font-extrabold tracking-tight text-slate-950">
                InsightHub
              </span>
              <span className="text-xs uppercase tracking-[0.24em] text-slate-500">
                Legal intelligence workspace
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <Link href="#features" className="transition-colors hover:text-slate-950">
              Features
            </Link>
            <Link href="#workflow" className="transition-colors hover:text-slate-950">
              Workflow
            </Link>
            <Link href="#security" className="transition-colors hover:text-slate-950">
              Security
            </Link>
            <Link href="#footer" className="transition-colors hover:text-slate-950">
              Contact
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login?next=/dashboard"
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
            >
              Sign in
            </Link>
          </div>
        </div>
      </header>

      <section id="top" className="mx-auto max-w-7xl px-6 pb-20 pt-14 lg:px-8 lg:pb-28 lg:pt-20">
        <div className="grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/85 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-slate-700 shadow-sm">
              <ShieldOutlined fontSize="small" />
              Sovereign legal archive
            </div>

            <h1 className="max-w-3xl font-heading text-5xl font-extrabold tracking-tight text-slate-950 md:text-7xl">
              The modern control center for legal case intelligence.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 md:text-xl">
              InsightHub gives law firms one secure place to manage cases, coordinate documents,
              and surface analytics that help teams move faster with confidence.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/login?next=/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-amber-200 bg-amber-400 px-6 py-3.5 text-base font-extrabold text-slate-950 shadow-[0_18px_40px_rgba(245,158,11,0.28)] transition hover:-translate-y-0.5 hover:bg-amber-300 hover:shadow-[0_22px_50px_rgba(245,158,11,0.34)]"
              >
                Open secure access
                <ArrowForward fontSize="small" className="text-slate-950" />
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3.5 text-base font-semibold text-slate-900 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
              >
                Explore platform
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="text-3xl font-heading font-extrabold text-slate-950">{stat.value}</div>
                  <div className="mt-1 text-sm text-slate-500">{stat.label}</div>
                </div>
              ))}
            </div>
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
                    <h2 className="mt-3 font-heading text-2xl font-extrabold">
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
                    <div key={label} className="rounded-2xl border border-white/10 bg-white/6 p-4">
                      <div className="text-sm text-white/65">{label}</div>
                      <div className="mt-2 text-3xl font-heading font-extrabold">{value}</div>
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
                      <div key={item} className="flex items-center gap-3 rounded-xl bg-white/8 px-4 py-3">
                        <CheckCircleRounded fontSize="small" className="text-emerald-300" />
                        <span className="text-sm text-white/88">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 bg-[#fbfaf8] p-6 sm:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-500">Search snapshot</span>
                    <SearchOutlined fontSize="small" className="text-slate-400" />
                  </div>
                  <div className="mt-4 rounded-2xl bg-slate-950 px-4 py-3 text-sm text-slate-100">
                    <span className="text-slate-400">Query:</span> breach of contract filings
                  </div>
                  <div className="mt-4 space-y-3">
                    {[
                      ["Miller v. Orion", "Civil • Filed 2d ago"],
                      ["Atlas Holdings matter", "Pending • 4 attachments"],
                      ["State compliance review", "Closed • Judgment entered"],
                    ].map(([title, meta]) => (
                      <div key={title} className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 px-4 py-3">
                        <div>
                          <div className="font-semibold text-slate-950">{title}</div>
                          <div className="mt-1 text-sm text-slate-500">{meta}</div>
                        </div>
                        <TrendingUpOutlined fontSize="small" className="mt-1 text-emerald-600" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="text-sm font-semibold text-slate-500">Access governance</div>
                  <div className="mt-4 space-y-3">
                    {[
                      "Role-based permissions",
                      "Audit-ready document trail",
                      "Case-level file tagging",
                      "CSRF protected session flow",
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                        <CheckCircleRounded fontSize="small" className="text-slate-950" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white/70 py-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-12 gap-y-4 px-6 text-sm font-semibold uppercase tracking-[0.22em] text-slate-400 lg:px-8">
          <span>Trusted by modern legal teams</span>
          <span>Discovery</span>
          <span>Litigation</span>
          <span>Compliance</span>
          <span>Client operations</span>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
        <div className="max-w-2xl">
          <div className="text-sm font-bold uppercase tracking-[0.24em] text-slate-500">
            Platform overview
          </div>
          <h2 className="mt-4 font-heading text-4xl font-extrabold tracking-tight text-slate-950 md:text-5xl">
            Built like a premium software product, not a generic portal.
          </h2>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article
                key={feature.title}
                className="rounded-[1.8rem] border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-950/15">
                  <Icon />
                </div>
                <h3 className="mt-6 font-heading text-2xl font-extrabold text-slate-950">
                  {feature.title}
                </h3>
                <p className="mt-3 leading-7 text-slate-600">{feature.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="max-w-2xl">
          <div className="text-sm font-bold uppercase tracking-[0.24em] text-slate-500">
            Capabilities
          </div>
          <h2 className="mt-4 font-heading text-4xl font-extrabold tracking-tight text-slate-950">
            Everything required to operate a modern legal practice.
          </h2>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Matter lifecycle control",
              desc: "Track cases from intake through resolution with structured timelines and status transitions.",
            },
            {
              title: "Document intelligence",
              desc: "Attach, tag, and retrieve files with metadata that reflects legal workflows.",
            },
            {
              title: "Advanced filtering",
              desc: "Segment cases by jurisdiction, counsel, stage, or outcome instantly.",
            },
            {
              title: "Audit traceability",
              desc: "Every action is recorded, enabling compliance-ready oversight at any time.",
            },
            {
              title: "Role-based access",
              desc: "Control who sees what with precision across teams and departments.",
            },
            {
              title: "Performance analytics",
              desc: "Identify bottlenecks and optimize case throughput using real data.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h3 className="font-heading text-xl font-extrabold text-slate-950">
                {item.title}
              </h3>
              <p className="mt-3 leading-7 text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#f8f7f3] py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="text-sm font-bold uppercase tracking-[0.24em] text-slate-500">
              Use cases
            </div>
            <h2 className="mt-4 font-heading text-4xl font-extrabold text-slate-950">
              Designed for real legal operations.
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Litigation teams",
                desc: "Manage hearings, filings, and evidence without fragmentation.",
              },
              {
                title: "Corporate legal",
                desc: "Maintain compliance records and internal case tracking at scale.",
              },
              {
                title: "Regulatory teams",
                desc: "Monitor audits, enforcement actions, and documentation centrally.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <h3 className="font-heading text-xl font-extrabold text-slate-950">
                  {item.title}
                </h3>
                <p className="mt-3 text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="max-w-2xl">
          <div className="text-sm font-bold uppercase tracking-[0.24em] text-slate-500">
            Testimonials
          </div>
          <h2 className="mt-4 font-heading text-4xl font-extrabold text-slate-950">
            Trusted by professionals who manage high-stakes cases.
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              quote:
                "InsightHub replaced three systems and reduced our case retrieval time dramatically.",
              author: "Senior Partner, Litigation Firm",
            },
            {
              quote: "The audit trail alone justified the adoption for our compliance team.",
              author: "Head of Legal Ops",
            },
            {
              quote: "We finally have visibility across every active matter.",
              author: "Corporate Counsel",
            },
            {
              quote:
                "Implementation was seamless. Our team was productive within days, not weeks.",
              author: "Managing Director, Corporate Legal",
            },
            {
              quote:
                "The search functionality alone saves us hours every week. It's a game-changer.",
              author: "Senior Associate, IP Practice",
            },
            {
              quote:
                "Our clients love how quickly we can now surface case history and documents.",
              author: "Partner, Regulatory Practice",
            },
            {
              quote:
                "Role-based access means partners and paralegals see exactly what they need.",
              author: "COO, Mid-Market Firm",
            },
            {
              quote:
                "We reduced document errors by 40% thanks to the structured filing system.",
              author: "Operations Manager",
            },
            {
              quote:
                "A single source of truth for every active matter. Finally.",
              author: "Chief Operating Officer",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <p className="leading-7 text-slate-700">"{item.quote}"</p>
              <div className="mt-4 text-sm font-semibold text-slate-500">
                {item.author}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="workflow" className="mx-auto max-w-7xl px-6 py-6 lg:px-8 lg:py-12">
        <div className="grid gap-6 rounded-[2rem] bg-slate-950 p-8 text-white lg:grid-cols-[0.95fr_1.05fr] lg:p-12">
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
              Workflow
            </div>
            <h2 className="mt-4 font-heading text-3xl font-extrabold tracking-tight md:text-4xl">
              A clean path from intake to final resolution.
            </h2>
            <p className="mt-4 max-w-xl text-white/70 leading-7">
              The platform keeps every case organized, so teams can move from first filing to
              closeout without losing context or documents along the way.
            </p>
          </div>

          <div className="grid gap-4">
            {workflow.map((item) => (
              <div key={item.step} className="rounded-3xl border border-white/10 bg-white/6 p-5">
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-white px-3 py-2 text-sm font-extrabold text-slate-950">
                    {item.step}
                  </div>
                  <div>
                    <div className="font-heading text-xl font-extrabold">{item.title}</div>
                    <p className="mt-2 text-sm leading-6 text-white/70">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="security" className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm lg:p-10">
            <div className="text-sm font-bold uppercase tracking-[0.24em] text-slate-500">
              Security
            </div>
            <h2 className="mt-4 font-heading text-4xl font-extrabold tracking-tight text-slate-950">
              The same precision you expect from enterprise legal software.
            </h2>
            <p className="mt-4 max-w-2xl leading-7 text-slate-600">
              InsightHub combines JWT authentication, CSRF protection, rate limiting, and secure
              role-aware access so your team can focus on the matter instead of the middleware.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                "JWT-based sign in",
                "HTTP-only session cookies",
                "Document uploads with validation",
                "Audit-friendly data model",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                  <CheckCircleRounded fontSize="small" className="text-emerald-600" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] bg-gradient-to-br from-[#f0e4d4] to-[#dce8ff] p-8 shadow-sm lg:p-10">
            <div className="flex items-center gap-3 text-slate-950">
              <WorkOutlineOutlined />
              <span className="text-sm font-semibold uppercase tracking-[0.22em]">Ready to start</span>
            </div>
            <h3 className="mt-6 max-w-md font-heading text-3xl font-extrabold tracking-tight text-slate-950">
              Bring your team into one focused workspace.
            </h3>
            <p className="mt-4 leading-7 text-slate-700">
              Open the secure login flow to continue into the dashboard, or use the same entry
              point to onboard a new matter quickly.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/login?next=/dashboard"
                className="inline-flex items-center justify-center rounded-full border border-amber-200 bg-amber-400 px-6 py-3.5 text-base font-extrabold text-slate-950 shadow-[0_18px_40px_rgba(245,158,11,0.28)] transition hover:-translate-y-0.5 hover:bg-amber-300 hover:shadow-[0_22px_50px_rgba(245,158,11,0.34)]"
              >
                Sign in now
              </Link>
              <Link
                href="#top"
                className="inline-flex items-center justify-center rounded-full border border-slate-950/15 bg-white/80 px-6 py-3.5 text-base font-semibold text-slate-950 transition hover:bg-white"
              >
                Back to top
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <div className="text-sm font-bold uppercase tracking-[0.24em] text-slate-500">
            Pricing
          </div>
          <h2 className="mt-4 font-heading text-4xl font-extrabold text-slate-950">
            Simple, scalable pricing.
          </h2>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { name: "Starter", price: "$29/mo" },
              { name: "Professional", price: "$79/mo" },
              { name: "Enterprise", price: "Custom" },
            ].map((plan) => (
              <div
                key={plan.name}
                className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
              >
                <div className="text-xl font-bold text-slate-950">{plan.name}</div>
                <div className="mt-4 text-3xl font-extrabold text-slate-950">
                  {plan.price}
                </div>
                <button className="mt-6 w-full rounded-full bg-slate-950 py-3 font-semibold text-white transition hover:bg-slate-800">
                  Get started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-20 lg:px-8">
        <div className="text-center">
          <div className="text-sm font-bold uppercase tracking-[0.24em] text-slate-500">
            FAQ
          </div>
          <h2 className="mt-4 font-heading text-4xl font-extrabold text-slate-950">
            Common questions
          </h2>
        </div>

        <div className="mt-12 space-y-6">
          {[
            {
              q: "Is InsightHub suitable for small firms?",
              a: "Yes. The platform scales from small teams to enterprise-level operations.",
            },
            {
              q: "How secure is the system?",
              a: "Built with modern authentication, access control, and audit logging standards.",
            },
            {
              q: "Can we migrate existing cases?",
              a: "Yes. Structured import pipelines can be integrated.",
            },
            {
              q: "What file formats are supported?",
              a: "PDF, DOCX, PNG, and JPEG files up to 10 MB each.",
            },
            {
              q: "Is there a free trial?",
              a: "Contact our sales team for trial access tailored to your firm.",
            },
            {
              q: "How quickly can we get up and running?",
              a: "Most teams are productive within days thanks to our streamlined onboarding.",
            },
          ].map((item) => (
            <div key={item.q} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="font-semibold text-slate-950">{item.q}</div>
              <p className="mt-2 text-slate-600">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      <footer id="footer" className="border-t border-slate-200 bg-white/70">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 lg:grid-cols-[1.1fr_0.9fr_0.9fr] lg:px-8">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
                <GavelOutlined fontSize="small" />
              </span>
              <div>
                <div className="font-heading text-xl font-extrabold text-slate-950">InsightHub</div>
                <div className="text-sm text-slate-500">Legal intelligence workspace</div>
              </div>
            </div>
            <p className="mt-4 max-w-md leading-7 text-slate-600">
              A polished control plane for law firms that need case management, secure document
              handling, and analytics in one place.
            </p>
          </div>

          <div>
            <div className="text-sm font-bold uppercase tracking-[0.24em] text-slate-500">
              Product
            </div>
            <ul className="mt-4 space-y-3 text-slate-600">
              <li>Case management</li>
              <li>Document archive</li>
              <li>Search and analytics</li>
            </ul>
          </div>

          <div>
            <div className="text-sm font-bold uppercase tracking-[0.24em] text-slate-500">
              Access
            </div>
            <div className="mt-4 flex flex-col gap-3">
              <Link href="/login?next=/dashboard" className="text-slate-700 transition hover:text-slate-950">
                Sign in
              </Link>
              <Link href="/login?next=/dashboard" className="text-slate-700 transition hover:text-slate-950">
                Start session
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
