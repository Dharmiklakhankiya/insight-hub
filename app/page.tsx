import type { Metadata } from "next";
import { getSessionFromCookies } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  Header,
  HeroSection,
  PortfolioSection,
  FeaturesGrid,
  WorkflowSection,
  SecuritySection,
  TestimonialsSection,
  PricingSection,
  CTASection,
  Footer,
} from "@/components/sovereign-archive";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "InsightHub | Legal Intelligence Platform",
  description:
    "InsightHub is a secure legal case management platform for firms that need case tracking, document control, and analytics in one system.",
};

const platformFeatures = [
  {
    icon: "🔒",
    title: "Secure Archive Access",
    description:
      "Centralize all legal assets in an encrypted vault designed for instantaneous retrieval and secure control.",
  },
  {
    icon: "📊",
    title: "Actionable Analytics",
    description:
      "Transform raw data into strategic insights for litigation forecasting and resource allocation.",
  },
  {
    icon: "⚡",
    title: "Fast Discovery",
    description:
      "Reduce discovery cycles from weeks to hours with AI-assisted document classification.",
  },
];

const capabilities = [
  {
    icon: "🎯",
    title: "Matter Control",
    description: "Lifecycle management from intake to final resolution.",
  },
  {
    icon: "🧠",
    title: "Doc Intelligence",
    description: "Automated content extraction and indexing.",
  },
  {
    icon: "🔍",
    title: "Advanced Filtering",
    description: "Multi-vector search across millions of records.",
  },
  {
    icon: "📋",
    title: "Audit Traceability",
    description: "Full immutable history of every interaction.",
  },
  {
    icon: "👤",
    title: "Role-Based Access",
    description: "Precision control across teams and departments.",
  },
  {
    icon: "📈",
    title: "Performance Analytics",
    description: "Identify bottlenecks and optimize throughput.",
  },
];

const testimonials = [
  {
    quote:
      "The precision of InsightHub's search and retrieval is unparalleled. It has fundamentally changed how we manage high-velocity discovery.",
    author: "David Sterling",
    role: "Partner, Sterling & Associates",
    rating: 5,
  },
  {
    quote:
      "Security was our #1 priority. InsightHub exceeded every regulatory requirement while remaining remarkably intuitive for our team.",
    author: "Elena Rodriguez",
    role: "General Counsel, NexaCorp",
    rating: 5,
  },
  {
    quote:
      "The analytics dashboard gives us a level of foresight we never had. We can now predict case resource needs with 90% accuracy.",
    author: "Marcus Thorne",
    role: "COO, Global Legal Partners",
    rating: 5,
  },
];

const pricingPlans = [
  {
    name: "Starter",
    price: 499,
    features: [
      "Up to 50 active matters",
      "500GB secure storage",
      "Standard analytics",
    ],
    cta: { label: "Select Plan", href: "/login?next=/dashboard" },
  },
  {
    name: "Professional",
    price: 1299,
    features: [
      "Unlimited active matters",
      "2TB secure storage",
      "Advanced portfolio AI",
      "Multi-office sync",
    ],
    cta: { label: "Select Plan", href: "/login?next=/dashboard" },
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    features: [
      "On-premise deployment",
      "Custom API integrations",
      "24/7 dedicated lead counsel",
    ],
    cta: { label: "Contact Sales", href: "#" },
  },
];

const workflowSteps = [
  {
    step: "01",
    title: "Intake matters cleanly",
    description:
      "Capture new matters with structured metadata and a deliberate intake path.",
  },
  {
    step: "02",
    title: "Coordinate filings",
    description:
      "Track evidence, deadlines, and hearing notes in one controlled timeline.",
  },
  {
    step: "03",
    title: "Resolve with context",
    description:
      "Close matters with a complete audit trail and a reusable knowledge archive.",
  },
];

const securityCheckpoints = [
  "JWT-based sign in",
  "HTTP-only session cookies",
  "Document uploads with validation",
  "Audit-friendly data model",
];

const securityHighlights = [
  { icon: "🔒", label: "256-bit AES" },
  { icon: "🛡️", label: "SOC2 Type II" },
  { icon: "✓", label: "GDPR Compliant" },
];

export default async function Home() {
  const session = await getSessionFromCookies();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen overflow-hidden bg-white text-slate-950">
      <Header />

      <HeroSection
        title="The modern control center for legal case intelligence."
        description="Securely manage high-stakes litigation with surgical precision. Access immutable records and real-time portfolio analytics through a single, authoritative interface."
        primaryCTA={{
          label: "Open secure access",
          href: "/login?next=/dashboard",
        }}
        secondaryCTA={{ label: "Request Demo", href: "#" }}
        stats={[
          { value: "12.4k", label: "Cases Archived" },
          { value: "38%", label: "Improvement" },
          { value: "< 2s", label: "Retrieval" },
        ]}
      />

      <PortfolioSection
        id="portfolio"
        title="Litigation Portfolio"
        subtitle="Comprehensive view of all active matters and filing statuses across your organization."
      />

      <FeaturesGrid
        id="features"
        sectionLabel="The InsightHub Advantage"
        title="Built like a premium software product, not a generic portal."
        features={platformFeatures}
        columns={3}
        bgColor="bg-white"
      />

      <FeaturesGrid
        id="governance"
        sectionLabel="Modern Legal Practice"
        title="Everything required to operate a modern legal practice."
        features={capabilities}
        columns={3}
        bgColor="bg-slate-50"
      />

      <WorkflowSection id="workflow" steps={workflowSteps} />

      <SecuritySection
        id="security"
        checkpoints={securityCheckpoints}
        highlights={securityHighlights}
        primaryCTA={{ label: "Sign in now", href: "/login?next=/dashboard" }}
        secondaryCTA={{ label: "Back to top", href: "#top" }}
      />

      <TestimonialsSection
        sectionLabel="Testimonials"
        title="Trusted by the world's most demanding legal teams."
        testimonials={testimonials}
        stats={[
          { value: "500+", label: "Firms" },
          { value: "Fortune 100", label: "Trusted" },
        ]}
      />

      <PricingSection
        id="pricing"
        sectionLabel="Transparent Scale"
        title="Simple, scalable pricing."
        subtitle="Predictable pricing for total control of your legal intelligence."
        plans={pricingPlans}
      />

      <CTASection
        id="cta"
        title="A clean path from intake to resolution."
        description="Join the modern era of legal case management. Deploy InsightHub for your firm today."
        buttons={[
          { label: "Start Your Free Trial", href: "/login", primary: true },
          { label: "Schedule an Audit", href: "#" },
        ]}
        trustItems={[
          { icon: "🔒", label: "256-bit AES" },
          { icon: "🛡️", label: "SOC2 Type II" },
          { icon: "✓", label: "GDPR Compliant" },
        ]}
        bgColor="bg-[#002147]"
      />

      <Footer
        id="footer"
        sections={[
          {
            title: "Platform",
            links: [
              { label: "Litigation Portfolio", href: "#" },
              { label: "Case Governance", href: "#" },
              { label: "Security Protocols", href: "#" },
            ],
          },
          {
            title: "Resources",
            links: [
              { label: "Pricing", href: "#" },
              { label: "Documentation", href: "#" },
              { label: "Terms of Service", href: "#" },
            ],
          },
        ]}
        copyright="© 2024 InsightHub. All Rights Reserved."
      />
    </main>
  );
}
