"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useState } from "react";
import { ZodError } from "zod";

import Icon from "@/components/ui/icon";
import StatusBadge from "@/components/ui/status-badge";
import { apiGet, apiPost } from "@/lib/client-api";
import type { CaseItem, PaginatedCases } from "@/lib/types";
import { caseCreateSchema } from "@/lib/validators/case.schema";

/* ── Helpers ── */

type CaseFilters = {
  query: string;
  status: "" | "ongoing" | "closed" | "pending";
  court: string;
};

type CaseFormState = {
  title: string;
  client_name: string;
  case_type: string;
  court: string;
  judge: string;
  status: "ongoing" | "closed" | "pending";
  assignedLawyersInput: string;
  filing_date: string;
  closing_date: string;
};

const blankForm: CaseFormState = {
  title: "",
  client_name: "",
  case_type: "",
  court: "",
  judge: "",
  status: "ongoing",
  assignedLawyersInput: "",
  filing_date: "",
  closing_date: "",
};

function mapZodErrors(error: ZodError): Record<string, string> {
  return error.issues.reduce<Record<string, string>>((acc, issue) => {
    const key = issue.path[0] ? String(issue.path[0]) : "root";
    if (!acc[key]) acc[key] = issue.message;
    return acc;
  }, {});
}

/* ── Page ── */

export default function CasesPage() {
  const [filters, setFilters] = useState<CaseFilters>({
    query: "",
    status: "",
    court: "",
  });
  const [listData, setListData] = useState<PaginatedCases | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // Create-case dialog
  const [showCreate, setShowCreate] = useState(false);
  const [caseForm, setCaseForm] = useState<CaseFormState>(blankForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  async function loadCases(p = page) {
    try {
      setLoadingList(true);
      setListError(null);
      const params = new URLSearchParams();
      if (filters.query) params.set("query", filters.query);
      if (filters.status) params.set("status", filters.status);
      if (filters.court) params.set("court", filters.court);
      params.set("page", String(p));
      params.set("limit", "20");

      const response = await apiGet<PaginatedCases>(
        `/api/cases?${params.toString()}`,
      );
      setListData(response);
    } catch {
      setListError("Failed to load cases.");
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    void loadCases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    await loadCases(1);
  }

  async function handleCreateCase(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreateError(null);
    setCreateSuccess(null);
    setFormErrors({});
    setCreating(true);

    try {
      const assignedLawyers = caseForm.assignedLawyersInput
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean);
      const payload = {
        title: caseForm.title,
        client_name: caseForm.client_name,
        case_type: caseForm.case_type,
        court: caseForm.court,
        judge: caseForm.judge,
        status: caseForm.status,
        assigned_lawyers: assignedLawyers,
        filing_date: caseForm.filing_date,
        closing_date: caseForm.closing_date || null,
        timeline: [
          {
            type: "filing" as const,
            date: caseForm.filing_date,
            note: `Case filed for ${caseForm.client_name}`,
          },
        ],
      };
      const parsed = caseCreateSchema.safeParse(payload);
      if (!parsed.success) {
        setFormErrors(mapZodErrors(parsed.error));
        return;
      }
      await apiPost<{ case: CaseItem }, typeof parsed.data>(
        "/api/cases",
        parsed.data,
      );
      setCreateSuccess("Case created successfully.");
      setCaseForm(blankForm);
      setShowCreate(false);
      await loadCases();
    } catch {
      setCreateError("Failed to create case.");
    } finally {
      setCreating(false);
    }
  }

  const cases = listData?.items ?? [];
  const totalCases = listData?.total ?? 0;

  return (
    <>
      {/* ── Header & Stats ── */}
      <header className="mb-12">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-4xl font-display font-extrabold text-primary tracking-tight mb-2">
              Case Ledger
            </h2>
            <p className="text-on-secondary-container font-body">
              Managing {totalCases} active litigation matters.
            </p>
          </div>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-surface-container-lowest text-on-surface text-sm font-medium shadow-sm hover:bg-surface-container transition-colors rounded">
              <Icon name="file_download" className="text-[20px]" />
              Export Archive
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium shadow-sm hover:opacity-90 transition-opacity rounded"
            >
              <Icon name="add" className="text-[20px]" />
              New Case
            </button>
          </div>
        </div>

        {/* Bento Stats Grid */}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-4 bg-surface-container-lowest p-6 flex flex-col justify-between h-32 rounded shadow-[0_4px_20px_-4px_rgba(0,10,30,0.04)]">
            <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant opacity-60">
              Total Active Cases
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-display font-extrabold text-primary">
                {totalCases}
              </span>
            </div>
          </div>
          <div className="col-span-4 bg-surface-container-lowest p-6 flex flex-col justify-between h-32 rounded shadow-[0_4px_20px_-4px_rgba(0,10,30,0.04)]">
            <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant opacity-60">
              Pending Judgments
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-display font-extrabold text-primary">
                {cases.filter((c) => c.status === "pending").length}
              </span>
              <span className="text-xs text-on-surface-variant font-medium">
                Awaiting final orders
              </span>
            </div>
          </div>
          <div className="col-span-4 bg-primary text-white p-6 flex flex-col justify-between h-32 rounded overflow-hidden relative">
            <div className="relative z-10">
              <span className="text-xs font-bold uppercase tracking-widest text-on-primary-container">
                Ongoing Cases
              </span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-display font-extrabold">
                  {String(
                    cases.filter((c) => c.status === "ongoing").length,
                  ).padStart(2, "0")}
                </span>
                <span className="text-xs text-on-primary-container font-medium">
                  Active proceedings
                </span>
              </div>
            </div>
            <div className="absolute right-0 bottom-0 opacity-10 translate-x-4 translate-y-4">
              <Icon
                name="notification_important"
                className="text-8xl"
              />
            </div>
          </div>
        </div>
      </header>

      {/* ── Search & Filter Bar ── */}
      <section className="mb-6 flex flex-wrap gap-4 items-center">
        <form
          onSubmit={handleSearch}
          className="flex-1 min-w-[300px] relative"
        >
          <Icon
            name="search"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-outline"
          />
          <input
            className="w-full bg-surface-container-highest border-none focus:ring-0 focus:outline-none p-4 pl-12 text-sm font-body rounded"
            placeholder="Search by case name, client, or docket number..."
            type="text"
            value={filters.query}
            onChange={(e) =>
              setFilters((f) => ({ ...f, query: e.target.value }))
            }
          />
        </form>
        <div className="flex gap-2">
          <select
            className="bg-surface-container-low border-none text-xs font-bold uppercase tracking-wider py-3 px-4 focus:ring-0 rounded"
            value={filters.status}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                status: e.target.value as CaseFilters["status"],
              }))
            }
          >
            <option value="">Status: All</option>
            <option value="ongoing">Ongoing</option>
            <option value="pending">Pending</option>
            <option value="closed">Closed</option>
          </select>
          <button
            onClick={() => {
              setPage(1);
              void loadCases(1);
            }}
            className="px-4 py-2 bg-primary text-white text-xs font-bold rounded hover:opacity-90 transition-opacity"
          >
            Apply
          </button>
        </div>
      </section>

      {/* ── Error / Loading ── */}
      {listError && (
        <div className="mb-6 p-4 bg-error-container text-on-error-container rounded text-sm">
          {listError}
        </div>
      )}

      {loadingList ? (
        <div className="flex items-center justify-center py-20 text-on-surface-variant">
          <Icon name="progress_activity" className="animate-spin mr-3" />
          Loading cases...
        </div>
      ) : cases.length === 0 ? (
        <div className="text-center py-20 text-on-surface-variant">
          No cases found for current filters.
        </div>
      ) : (
        /* ── Case Table ── */
        <section className="bg-surface-container-lowest overflow-hidden shadow-sm rounded">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-high text-on-surface">
                  <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest">
                    Case Name
                  </th>
                  <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest">
                    Client
                  </th>
                  <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest">
                    Judge
                  </th>
                  <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest">
                    Court
                  </th>
                  <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest">
                    Filed Date
                  </th>
                  <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest">
                    Status
                  </th>
                  <th className="py-4 px-6" />
                </tr>
              </thead>
              <tbody>
                {cases.map((item, i) => (
                  <tr
                    key={item._id}
                    className={`group transition-colors ${
                      i % 2 === 0
                        ? "bg-surface hover:bg-surface-container-low"
                        : "bg-surface-container-low hover:bg-surface-container-high"
                    }`}
                  >
                    <td className="py-5 px-6">
                      <div className="flex flex-col">
                        <Link
                          href={`/cases/${item._id}`}
                          className="text-sm font-bold text-primary group-hover:text-surface-tint transition-colors"
                        >
                          {item.title}
                        </Link>
                        <span className="text-[10px] text-on-surface-variant font-mono opacity-60">
                          {item.case_type}
                        </span>
                      </div>
                    </td>
                    <td className="py-5 px-6 text-sm text-on-secondary-container">
                      {item.client_name}
                    </td>
                    <td className="py-5 px-6 text-sm">{item.judge}</td>
                    <td className="py-5 px-6 text-sm italic">{item.court}</td>
                    <td className="py-5 px-6 text-sm font-label">
                      {new Date(item.filing_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "2-digit",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-5 px-6">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="py-5 px-6 text-right">
                      <Link
                        href={`/cases/${item._id}`}
                        className="text-on-surface-variant hover:text-primary transition-colors"
                      >
                        <Icon name="chevron_right" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center px-6 py-4 bg-surface-container-high">
            <span className="text-xs text-on-secondary-container font-medium">
              Showing {cases.length} of {totalCases} matters
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => {
                  setPage((p) => p - 1);
                  void loadCases(page - 1);
                }}
                className="w-8 h-8 flex items-center justify-center bg-surface-container-lowest rounded shadow-sm hover:bg-white disabled:opacity-30"
              >
                <Icon name="chevron_left" className="text-sm" />
              </button>
              {Array.from(
                { length: Math.min(listData?.totalPages ?? 1, 5) },
                (_, i) => i + 1,
              ).map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setPage(p);
                    void loadCases(p);
                  }}
                  className={`w-8 h-8 flex items-center justify-center rounded shadow-sm text-xs font-bold ${
                    p === page
                      ? "bg-primary text-white"
                      : "bg-surface-container-lowest text-on-surface hover:bg-white"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                disabled={page >= (listData?.totalPages ?? 1)}
                onClick={() => {
                  setPage((p) => p + 1);
                  void loadCases(page + 1);
                }}
                className="w-8 h-8 flex items-center justify-center bg-surface-container-lowest rounded shadow-sm hover:bg-white disabled:opacity-30"
              >
                <Icon name="chevron_right" className="text-sm" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ── Bottom Insight Panels ── */}
      <section className="mt-12 grid grid-cols-12 gap-8">
        <div className="col-span-8">
          <div className="bg-surface-container-low p-8 relative overflow-hidden h-full rounded">
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div>
                <h3 className="text-2xl font-bold text-primary tracking-tight">
                  Recent Activity
                </h3>
                <p className="text-sm text-on-secondary-container">
                  Latest case updates across the ledger.
                </p>
              </div>
              <Icon
                name="event_note"
                filled
                className="text-6xl text-primary opacity-10 absolute -top-4 -right-4"
              />
            </div>
            <div className="space-y-4 relative z-10">
              {cases.slice(0, 2).map((c) => (
                <Link
                  key={c._id}
                  href={`/cases/${c._id}`}
                  className="flex items-center gap-4 p-4 bg-white/50 backdrop-blur-sm rounded hover:bg-white transition-colors"
                >
                  <div
                    className={`w-2 h-12 rounded-full ${
                      c.status === "ongoing"
                        ? "bg-surface-tint"
                        : c.status === "pending"
                          ? "bg-tertiary-fixed-dim"
                          : "bg-outline-variant"
                    }`}
                  />
                  <div className="flex-1">
                    <h4 className="text-sm font-bold">{c.title}</h4>
                    <p className="text-xs text-on-surface-variant">
                      {c.client_name} • {c.court}
                    </p>
                  </div>
                  <StatusBadge status={c.status} />
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="col-span-4">
          <div className="bg-primary-container text-white p-8 h-full rounded flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold mb-4">Firm Intelligence</h3>
              <p className="text-sm text-on-primary-container leading-relaxed">
                InsightHub tracks case activity patterns across your
                jurisdictions to surface actionable insights.
              </p>
            </div>
            <div className="mt-8 border-t border-white/10 pt-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded bg-white/10 flex items-center justify-center">
                  <Icon
                    name="auto_awesome"
                    className="text-tertiary-fixed-dim"
                  />
                </div>
                <span className="text-xs font-bold tracking-widest uppercase">
                  Generate Forecast
                </span>
              </div>
              <p className="text-[10px] text-white/60">
                Calculated based on current ledger volume and regional filing
                trends.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Create Case Dialog ── */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-8 py-6 border-b border-outline-variant/10 flex justify-between items-center">
              <h3 className="text-xl font-display font-extrabold text-primary">
                Create New Case
              </h3>
              <button
                onClick={() => setShowCreate(false)}
                className="text-on-surface-variant hover:text-primary transition-colors"
              >
                <Icon name="close" />
              </button>
            </div>
            <form onSubmit={handleCreateCase} className="px-8 py-6 space-y-4">
              {createError && (
                <div className="p-3 bg-error-container text-on-error-container text-sm rounded">
                  {createError}
                </div>
              )}
              {createSuccess && (
                <div className="p-3 bg-green-50 text-green-700 text-sm rounded">
                  {createSuccess}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant block mb-1">
                    Title *
                  </label>
                  <input
                    className="w-full bg-surface-container-high border-none p-3 text-sm rounded focus:ring-1 focus:ring-surface-tint"
                    value={caseForm.title}
                    onChange={(e) =>
                      setCaseForm((f) => ({ ...f, title: e.target.value }))
                    }
                    required
                  />
                  {formErrors.title && (
                    <p className="text-xs text-error mt-1">
                      {formErrors.title}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant block mb-1">
                    Client Name *
                  </label>
                  <input
                    className="w-full bg-surface-container-high border-none p-3 text-sm rounded focus:ring-1 focus:ring-surface-tint"
                    value={caseForm.client_name}
                    onChange={(e) =>
                      setCaseForm((f) => ({
                        ...f,
                        client_name: e.target.value,
                      }))
                    }
                    required
                  />
                  {formErrors.client_name && (
                    <p className="text-xs text-error mt-1">
                      {formErrors.client_name}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant block mb-1">
                    Case Type *
                  </label>
                  <input
                    className="w-full bg-surface-container-high border-none p-3 text-sm rounded focus:ring-1 focus:ring-surface-tint"
                    value={caseForm.case_type}
                    onChange={(e) =>
                      setCaseForm((f) => ({
                        ...f,
                        case_type: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant block mb-1">
                    Court *
                  </label>
                  <input
                    className="w-full bg-surface-container-high border-none p-3 text-sm rounded focus:ring-1 focus:ring-surface-tint"
                    value={caseForm.court}
                    onChange={(e) =>
                      setCaseForm((f) => ({ ...f, court: e.target.value }))
                    }
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant block mb-1">
                    Judge *
                  </label>
                  <input
                    className="w-full bg-surface-container-high border-none p-3 text-sm rounded focus:ring-1 focus:ring-surface-tint"
                    value={caseForm.judge}
                    onChange={(e) =>
                      setCaseForm((f) => ({ ...f, judge: e.target.value }))
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant block mb-1">
                    Status
                  </label>
                  <select
                    className="w-full bg-surface-container-high border-none p-3 text-sm rounded focus:ring-1 focus:ring-surface-tint"
                    value={caseForm.status}
                    onChange={(e) =>
                      setCaseForm((f) => ({
                        ...f,
                        status: e.target.value as CaseFormState["status"],
                      }))
                    }
                  >
                    <option value="ongoing">Ongoing</option>
                    <option value="pending">Pending</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant block mb-1">
                    Filing Date *
                  </label>
                  <input
                    type="date"
                    className="w-full bg-surface-container-high border-none p-3 text-sm rounded focus:ring-1 focus:ring-surface-tint"
                    value={caseForm.filing_date}
                    onChange={(e) =>
                      setCaseForm((f) => ({
                        ...f,
                        filing_date: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant block mb-1">
                    Closing Date
                  </label>
                  <input
                    type="date"
                    className="w-full bg-surface-container-high border-none p-3 text-sm rounded focus:ring-1 focus:ring-surface-tint"
                    value={caseForm.closing_date}
                    onChange={(e) =>
                      setCaseForm((f) => ({
                        ...f,
                        closing_date: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant block mb-1">
                  Assigned Lawyers (comma separated) *
                </label>
                <input
                  className="w-full bg-surface-container-high border-none p-3 text-sm rounded focus:ring-1 focus:ring-surface-tint"
                  value={caseForm.assignedLawyersInput}
                  onChange={(e) =>
                    setCaseForm((f) => ({
                      ...f,
                      assignedLawyersInput: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/10">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-6 py-2 text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-6 py-2 bg-primary text-white text-sm font-semibold rounded hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Create Case"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
