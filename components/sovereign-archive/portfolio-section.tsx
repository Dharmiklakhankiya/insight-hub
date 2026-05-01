"use client";

import { ReactNode } from "react";
import { TrendingUpOutlined, CheckCircleOutlined } from "@mui/icons-material";

export interface PortfolioActivity {
  icon: string;
  title: string;
  description: string;
  timestamp: string;
  status: string;
  statusColor: string;
}

export interface ComplianceItem {
  icon: string;
  title: string;
  subtitle: string;
}

interface PortfolioSectionProps {
  id?: string;
  title?: string;
  subtitle?: string;
  stats?: Array<{ label: string; value: string; color?: string }>;
  activities?: PortfolioActivity[];
  complianceItems?: ComplianceItem[];
}

export function PortfolioSection({
  id = "portfolio",
  title = "Matter Overview",
  subtitle = "Comprehensive view of all active matters and filing statuses across your organization.",
  stats = [
    { label: "Active Matters", value: "248" },
    { label: "Filed Sports", value: "91" },
    { label: "Open Tasks", value: "12", color: "#331d00" },
  ],
  activities = [
    {
      icon: "description",
      title: "Motion for Summary Judgment Filed",
      description: "Case #8821-B • 2 hours ago",
      timestamp: "2 hours ago",
      status: "FILED",
      statusColor: "bg-[#006d42]/10 text-[#006d42]",
    },
    {
      icon: "assignment_ind",
      title: "Lead Counsel Assigned",
      description: "Matter: Global Logistics v. TechCorp • 5 hours ago",
      timestamp: "5 hours ago",
      status: "ASSIGNED",
      statusColor: "bg-[#002147]/10 text-[#002147]",
    },
  ],
  complianceItems = [
    {
      icon: "check_circle",
      title: "Document Retention Compliance",
      subtitle: "System verified 08:00 AM",
    },
    {
      icon: "check_circle",
      title: "E-Discovery Chain of Custody",
      subtitle: "Immutable logs active",
    },
    {
      icon: "check_circle",
      title: "Access Control Audit",
      subtitle: "No unauthorized attempts",
    },
  ],
}: PortfolioSectionProps) {
  return (
    <section id={id} className="bg-[#f6f4ef] py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="mb-2 text-4xl font-black text-[#002147] md:text-5xl">
              {title}
            </h2>
            <p className="max-w-md text-slate-600">{subtitle}</p>
          </div>
          <div className="flex gap-2">
            <span className="rounded border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-[#002147]">
              Quarterly View
            </span>
            <span className="flex items-center gap-1 rounded border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-[#002147]">
              <TrendingUpOutlined fontSize="small" /> Filters
            </span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm md:col-span-3">
            <div className="mb-8 flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-2xl font-black text-[#002147]">
                Matter Overview
              </h3>
              <span className="flex items-center gap-1 text-sm font-bold text-[#006d42]">
                <TrendingUpOutlined fontSize="small" /> +12% this month
              </span>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              {stats.map((stat, idx) => (
                <div key={idx} className="rounded-[1rem] bg-[#f6f4ef] p-6">
                  <div
                    className="text-[40px] font-black leading-none"
                    style={{ color: stat.color || "#002147" }}
                  >
                    {stat.value}
                  </div>
                  <div className="mt-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <div className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
                Recent Activity
              </div>
              <div className="space-y-4">
                {activities.map((activity, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 rounded-2xl border border-transparent bg-white p-3 transition-all hover:border-[#00D384] hover:shadow-sm"
                  >
                    <span className="text-2xl text-slate-400">📄</span>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-[#002147]">
                        {activity.title}
                      </div>
                      <div className="text-xs text-slate-500">
                        {activity.description}
                      </div>
                    </div>
                    <span
                      className={`rounded px-2 py-1 text-[10px] font-bold ${activity.statusColor}`}
                    >
                      {activity.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
