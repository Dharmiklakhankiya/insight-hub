"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import Icon from "@/components/ui/icon";
import { apiGet } from "@/lib/client-api";
import type { AnalyticsSummary, User } from "@/lib/types";

type DashboardPayload = { user: User; analytics: AnalyticsSummary };

export default function DashboardPage() {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        const [me, analytics] = await Promise.all([
          apiGet<{ user: User }>("/api/auth/me"),
          apiGet<AnalyticsSummary>("/api/analytics"),
        ]);
        if (!active) return;
        setData({ user: me.user, analytics });
      } catch {
        if (active) setError("Failed to load dashboard data.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-on-surface-variant">
        <Icon name="progress_activity" className="animate-spin mr-3" />
        Loading dashboard...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-error-container text-on-error-container rounded">
        {error ?? "Failed to load dashboard."}
      </div>
    );
  }

  const a = data.analytics;

  return (
    <>
      {/* ── Header ── */}
      <header className="mb-12">
        <h2 className="text-4xl font-display font-extrabold text-primary tracking-tight mb-2">
          Welcome back, {data.user.name}
        </h2>
        <p className="text-on-secondary-container font-body">
          Role: {data.user.role.toUpperCase()} — Track active caseload,
          outcomes, and workload distribution.
        </p>
      </header>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-12 gap-4 mb-12">
        <div className="col-span-3 bg-surface-container-lowest p-6 flex flex-col justify-between h-32 rounded shadow-[0_4px_20px_-4px_rgba(0,10,30,0.04)]">
          <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant opacity-60">
            Total Cases
          </span>
          <span className="text-3xl font-display font-extrabold text-primary">
            {a.totalCases}
          </span>
        </div>
        <div className="col-span-3 bg-surface-container-lowest p-6 flex flex-col justify-between h-32 rounded shadow-[0_4px_20px_-4px_rgba(0,10,30,0.04)]">
          <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant opacity-60">
            Active Cases
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-display font-extrabold text-primary">
              {a.activeCount}
            </span>
            <span className="text-xs text-green-600 font-bold">Ongoing</span>
          </div>
        </div>
        <div className="col-span-3 bg-surface-container-lowest p-6 flex flex-col justify-between h-32 rounded shadow-[0_4px_20px_-4px_rgba(0,10,30,0.04)]">
          <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant opacity-60">
            Closed Cases
          </span>
          <span className="text-3xl font-display font-extrabold text-primary">
            {a.closedCount}
          </span>
        </div>
        <div className="col-span-3 bg-primary text-white p-6 flex flex-col justify-between h-32 rounded overflow-hidden relative">
          <div className="relative z-10">
            <span className="text-xs font-bold uppercase tracking-widest text-on-primary-container">
              Avg Duration
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-display font-extrabold">
                {Math.round(a.averageCaseDuration)}
              </span>
              <span className="text-xs text-on-primary-container font-medium">
                days
              </span>
            </div>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10 translate-x-4 translate-y-4">
            <Icon name="timer" className="text-8xl" />
          </div>
        </div>
      </div>

      {/* ── Bottom Panels ── */}
      <div className="grid grid-cols-12 gap-8">
        {/* Insights */}
        <div className="col-span-8">
          <div className="bg-surface-container-low p-8 rounded relative overflow-hidden h-full">
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div>
                <h3 className="text-2xl font-bold text-primary tracking-tight">
                  Deterministic Insights
                </h3>
                <p className="text-sm text-on-secondary-container">
                  Key patterns detected across the current caseload.
                </p>
              </div>
              <Icon
                name="insights"
                filled
                className="text-6xl text-primary opacity-10 absolute -top-4 -right-4"
              />
            </div>
            <div className="space-y-3 relative z-10">
              {a.insights.length === 0 ? (
                <p className="text-sm text-on-surface-variant">
                  No insights available yet.
                </p>
              ) : (
                a.insights.map((insight) => (
                  <div
                    key={insight}
                    className="p-4 bg-white/50 backdrop-blur-sm rounded flex items-start gap-3"
                  >
                    <Icon
                      name="lightbulb"
                      className="text-tertiary-fixed-dim mt-0.5"
                    />
                    <p className="text-sm text-on-surface">{insight}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="col-span-4">
          <div className="bg-primary-container text-white p-8 h-full rounded flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/cases"
                  className="flex items-center gap-3 p-3 bg-white/10 rounded hover:bg-white/20 transition-colors"
                >
                  <Icon name="gavel" className="text-tertiary-fixed-dim" />
                  <span className="text-sm font-medium">View Case Ledger</span>
                </Link>
                <Link
                  href="/analytics"
                  className="flex items-center gap-3 p-3 bg-white/10 rounded hover:bg-white/20 transition-colors"
                >
                  <Icon name="analytics" className="text-tertiary-fixed-dim" />
                  <span className="text-sm font-medium">
                    Full Analytics Report
                  </span>
                </Link>
              </div>
            </div>
            <div className="mt-8 border-t border-white/10 pt-6">
              <p className="text-[10px] text-white/60">
                InsightHub Intelligence — Calculated from your current
                jurisdiction data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
