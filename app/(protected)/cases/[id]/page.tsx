"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { type FormEvent, useEffect, useMemo, useState } from "react";

import Avatar from "@/components/ui/avatar";
import Icon from "@/components/ui/icon";
import StatusBadge from "@/components/ui/status-badge";
import { apiGet, apiPatch, apiUpload } from "@/lib/client-api";
import type { CaseItem, DocumentItem } from "@/lib/types";
import { caseUpdateSchema } from "@/lib/validators/case.schema";

type CaseDetailResponse = { case: CaseItem };
type DocumentResponse = { document: DocumentItem };

/* ── Document icon helper ── */
function docIcon(name: string) {
  if (name.endsWith(".pdf")) return "picture_as_pdf";
  if (name.endsWith(".docx") || name.endsWith(".doc")) return "article";
  if (name.endsWith(".xlsx") || name.endsWith(".xls")) return "table_chart";
  return "insert_drive_file";
}

function docIconColor(name: string) {
  if (name.endsWith(".pdf")) return "text-error";
  if (name.endsWith(".docx") || name.endsWith(".doc"))
    return "text-primary-container";
  if (name.endsWith(".xlsx") || name.endsWith(".xls"))
    return "text-on-tertiary-container";
  return "text-on-surface-variant";
}

export default function CaseDetailPage() {
  const params = useParams<{ id: string }>();
  const caseId = useMemo(() => params.id, [params.id]);

  const [record, setRecord] = useState<CaseItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Update form
  const [status, setStatus] = useState<CaseItem["status"]>("ongoing");
  const [closingDate, setClosingDate] = useState("");
  const [timelineType, setTimelineType] = useState<
    "filing" | "hearing" | "adjournment" | "judgment"
  >("hearing");
  const [timelineDate, setTimelineDate] = useState("");
  const [timelineNote, setTimelineNote] = useState("");
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);
  const [showUpdateForm, setShowUpdateForm] = useState(false);

  // Upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileTags, setFileTags] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  async function loadCase() {
    try {
      setLoading(true);
      setError(null);
      const response = await apiGet<CaseDetailResponse>(`/api/cases/${caseId}`);
      setRecord(response.case);
      setStatus(response.case.status);
      setClosingDate(
        response.case.closing_date
          ? response.case.closing_date.slice(0, 10)
          : "",
      );
    } catch {
      setError("Failed to load case details.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!caseId) return;
    void loadCase();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId]);

  async function handleUpdateCase(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setUpdateError(null);
    setUpdateSuccess(null);
    if (!record) return;

    const nextTimeline =
      timelineDate && timelineNote.trim()
        ? [
            ...record.timeline,
            { type: timelineType, date: timelineDate, note: timelineNote },
          ]
        : record.timeline;

    const payload = {
      status,
      closing_date: closingDate ? closingDate : null,
      timeline: nextTimeline,
    };

    const parsed = caseUpdateSchema.safeParse(payload);
    if (!parsed.success) {
      setUpdateError(
        parsed.error.issues[0]?.message ?? "Invalid case update data.",
      );
      return;
    }

    try {
      await apiPatch<CaseDetailResponse, typeof parsed.data>(
        `/api/cases/${caseId}`,
        parsed.data,
      );
      await loadCase();
      setTimelineDate("");
      setTimelineNote("");
      setUpdateSuccess("Case updated successfully.");
      setShowUpdateForm(false);
    } catch {
      setUpdateError("Failed to update case.");
    }
  }

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setUploadError(null);
    setUploadSuccess(null);

    if (!selectedFile) {
      setUploadError("Select a file to upload.");
      return;
    }
    const tags = fileTags
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);
    if (tags.length === 0) {
      setUploadError("At least one tag is required.");
      return;
    }

    const formData = new FormData();
    formData.set("file", selectedFile);
    formData.set("tags", tags.join(","));

    try {
      await apiUpload<DocumentResponse>(
        `/api/cases/${caseId}/documents`,
        formData,
      );
      setSelectedFile(null);
      setFileTags("");
      setUploadSuccess("Document uploaded successfully.");
      await loadCase();
    } catch {
      setUploadError("Failed to upload document.");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-on-surface-variant">
        <Icon name="progress_activity" className="animate-spin mr-3" />
        Loading case details...
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="p-6 bg-error-container text-on-error-container rounded">
        {error ?? "Case not found."}
      </div>
    );
  }

  return (
    <>
      {/* ── Case Header ── */}
      <header className="bg-surface-container-lowest -mx-10 -mt-10 px-12 py-10 mb-10 flex flex-col gap-6">
        <div className="flex items-center gap-4 text-sm text-on-surface-variant font-label">
          <Link
            href="/cases"
            className="hover:text-primary cursor-pointer transition-colors"
          >
            Case Ledger
          </Link>
          <Icon name="chevron_right" className="text-xs" />
          <span className="font-semibold text-primary">{record.title}</span>
        </div>
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <h2 className="font-display text-4xl font-extrabold text-primary tracking-tight">
              {record.title}
            </h2>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-xs font-semibold tracking-wide">
                {record.case_type}
              </span>
              <span className="flex items-center gap-1 text-xs font-medium">
                <StatusBadge status={record.status} />
              </span>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setShowUpdateForm(!showUpdateForm)}
              className="px-6 py-2 bg-primary text-white font-label text-sm font-semibold hover:opacity-90 transition-all rounded"
            >
              {showUpdateForm ? "Close Editor" : "Edit Case File"}
            </button>
          </div>
        </div>
      </header>

      {/* ── Update Form (toggled) ── */}
      {showUpdateForm && (
        <section className="mb-10 bg-surface-container-low p-8 rounded-lg">
          <h3 className="font-display text-lg font-bold uppercase tracking-tight text-primary mb-6 flex items-center gap-2">
            <Icon name="edit_note" className="text-primary" />
            Update Case &amp; Timeline
          </h3>
          <form onSubmit={handleUpdateCase} className="space-y-4">
            {updateError && (
              <div className="p-3 bg-error-container text-on-error-container text-sm rounded">
                {updateError}
              </div>
            )}
            {updateSuccess && (
              <div className="p-3 bg-green-50 text-green-700 text-sm rounded">
                {updateSuccess}
              </div>
            )}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant block mb-1">
                  Status
                </label>
                <select
                  className="w-full bg-surface-container-high border-none p-3 text-sm rounded"
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as CaseItem["status"])
                  }
                >
                  <option value="ongoing">Ongoing</option>
                  <option value="pending">Pending</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant block mb-1">
                  Closing Date
                </label>
                <input
                  type="date"
                  className="w-full bg-surface-container-high border-none p-3 text-sm rounded"
                  value={closingDate}
                  onChange={(e) => setClosingDate(e.target.value)}
                />
              </div>
            </div>
            <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-widest pt-2">
              Add Timeline Event (optional)
            </p>
            <div className="grid grid-cols-3 gap-4">
              <select
                className="bg-surface-container-high border-none p-3 text-sm rounded"
                value={timelineType}
                onChange={(e) =>
                  setTimelineType(
                    e.target.value as typeof timelineType,
                  )
                }
              >
                <option value="filing">Filing</option>
                <option value="hearing">Hearing</option>
                <option value="adjournment">Adjournment</option>
                <option value="judgment">Judgment</option>
              </select>
              <input
                type="date"
                className="bg-surface-container-high border-none p-3 text-sm rounded"
                value={timelineDate}
                onChange={(e) => setTimelineDate(e.target.value)}
              />
              <input
                className="bg-surface-container-high border-none p-3 text-sm rounded"
                placeholder="Event note..."
                value={timelineNote}
                onChange={(e) => setTimelineNote(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-primary text-white text-sm font-semibold rounded hover:opacity-90 transition-opacity"
            >
              Save Changes
            </button>
          </form>
        </section>
      )}

      {/* ── Bento Grid ── */}
      <div className="grid grid-cols-12 gap-8">
        {/* Left Column: 8/12 */}
        <div className="col-span-8 space-y-8">
          {/* Jurisdiction & Counsel */}
          <div className="grid grid-cols-2 gap-8">
            <section className="bg-surface-container-low p-8 rounded-lg">
              <div className="flex items-center gap-2 mb-6">
                <Icon name="account_balance" className="text-primary" />
                <h3 className="font-display text-lg font-bold uppercase tracking-tight text-primary">
                  Jurisdiction &amp; Authority
                </h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] text-on-secondary-container font-label uppercase tracking-widest font-bold">
                    Court
                  </p>
                  <p className="text-sm font-medium text-primary">
                    {record.court}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-on-secondary-container font-label uppercase tracking-widest font-bold">
                    Presiding Judge
                  </p>
                  <p className="text-sm font-medium text-primary">
                    {record.judge}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-on-secondary-container font-label uppercase tracking-widest font-bold">
                    Filing Date
                  </p>
                  <p className="text-sm font-medium text-primary">
                    {new Date(record.filing_date).toLocaleDateString("en-US", {
                      month: "long",
                      day: "2-digit",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </section>
            <section className="bg-surface-container-low p-8 rounded-lg">
              <div className="flex items-center gap-2 mb-6">
                <Icon name="badge" className="text-primary" />
                <h3 className="font-display text-lg font-bold uppercase tracking-tight text-primary">
                  Counsel Record
                </h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] text-on-secondary-container font-label uppercase tracking-widest font-bold">
                    Client
                  </p>
                  <p className="text-sm font-medium text-primary">
                    {record.client_name}
                  </p>
                </div>
                {record.assigned_lawyers.map((lawyer) => (
                  <div key={lawyer} className="flex items-center gap-3">
                    <Avatar name={lawyer} size="sm" />
                    <p className="text-sm font-medium text-primary">{lawyer}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Case Vault */}
          <section className="bg-surface-container-lowest rounded-lg overflow-hidden">
            <div className="px-8 py-6 flex justify-between items-center bg-surface-container-high/30">
              <div className="flex items-center gap-2">
                <Icon name="folder_managed" className="text-primary" />
                <h3 className="font-display text-lg font-bold uppercase tracking-tight text-primary">
                  Case Vault Repository
                </h3>
              </div>
            </div>

            {/* Upload Form */}
            <form
              onSubmit={handleUpload}
              className="px-8 py-4 border-b border-outline-variant/10 flex flex-wrap gap-3 items-end"
            >
              {uploadError && (
                <span className="text-xs text-error w-full">
                  {uploadError}
                </span>
              )}
              {uploadSuccess && (
                <span className="text-xs text-green-600 w-full">
                  {uploadSuccess}
                </span>
              )}
              <label className="px-4 py-2 bg-surface-container-high text-sm rounded cursor-pointer hover:bg-surface-container transition-colors">
                {selectedFile ? selectedFile.name : "Choose File"}
                <input
                  hidden
                  type="file"
                  onChange={(e) =>
                    setSelectedFile(e.target.files?.[0] ?? null)
                  }
                />
              </label>
              <input
                className="bg-surface-container-high border-none p-2 text-sm rounded flex-1 min-w-[200px]"
                placeholder="Tags (comma separated)"
                value={fileTags}
                onChange={(e) => setFileTags(e.target.value)}
              />
              <button
                type="submit"
                className="px-4 py-2 bg-primary-container text-white text-xs font-bold rounded hover:bg-primary transition-all"
              >
                <Icon name="upload_file" className="text-sm mr-1" />
                Upload
              </button>
            </form>

            {/* Document List */}
            <div className="flex flex-col">
              <div className="grid grid-cols-12 px-8 py-3 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest bg-surface-container">
                <div className="col-span-6">Document Name</div>
                <div className="col-span-2">Type</div>
                <div className="col-span-2">Tags</div>
                <div className="col-span-2 text-right">Date</div>
              </div>
              {!record.documents || record.documents.length === 0 ? (
                <p className="px-8 py-6 text-sm text-on-surface-variant">
                  No documents uploaded for this case.
                </p>
              ) : (
                record.documents.map((doc) => (
                  <div
                    key={doc._id}
                    className="case-ledger-stripe grid grid-cols-12 px-8 py-4 items-center group hover:bg-primary-fixed/30 transition-colors"
                  >
                    <div className="col-span-6 flex items-center gap-3">
                      <Icon
                        name={docIcon(doc.original_name)}
                        className={docIconColor(doc.original_name)}
                      />
                      <span className="text-sm font-medium text-primary">
                        {doc.original_name}
                      </span>
                    </div>
                    <div className="col-span-2 text-xs text-on-surface-variant font-label">
                      {doc.mime_type.split("/").pop()}
                    </div>
                    <div className="col-span-2 text-xs text-on-surface-variant">
                      {doc.tags.join(", ")}
                    </div>
                    <div className="col-span-2 text-right text-xs text-on-surface-variant">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Right Column: 4/12 */}
        <div className="col-span-4 space-y-8">
          {/* Procedural Timeline */}
          <section className="bg-surface-container-low p-8 rounded-lg flex flex-col">
            <div className="flex items-center gap-2 mb-8">
              <Icon name="history" className="text-primary" />
              <h3 className="font-display text-lg font-bold uppercase tracking-tight text-primary">
                Procedural History
              </h3>
            </div>
            <div className="relative flex-grow">
              <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-outline-variant/30" />
              <div className="space-y-8 relative">
                {record.timeline.length === 0 ? (
                  <p className="text-sm text-on-surface-variant pl-10">
                    No timeline events yet.
                  </p>
                ) : (
                  [...record.timeline].reverse().map((evt, i) => (
                    <div key={`${evt.type}-${evt.date}-${i}`} className="flex gap-6 items-start">
                      <div
                        className={`w-6 h-6 rounded-full flex-shrink-0 z-10 flex items-center justify-center border-4 border-surface-container-low ${
                          i === 0
                            ? "bg-primary"
                            : "bg-outline-variant"
                        }`}
                      >
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                      <div className={i > 0 ? "opacity-70" : ""}>
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                          {new Date(evt.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "2-digit",
                            year: "numeric",
                          })}
                        </p>
                        <p
                          className={`text-sm mt-1 ${
                            i === 0
                              ? "font-bold text-primary"
                              : "font-medium text-on-surface-variant"
                          }`}
                        >
                          {evt.type.charAt(0).toUpperCase() + evt.type.slice(1)}
                        </p>
                        <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                          {evt.note}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Archival Stats */}
            <div className="mt-auto pt-10">
              <div className="bg-primary-container p-6 rounded-lg text-white">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4 text-on-primary-container">
                  Archival Stats
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-2xl font-display font-extrabold">
                      {record.timeline.length}
                    </p>
                    <p className="text-[10px] uppercase text-on-primary-container font-medium">
                      Timeline Events
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-display font-extrabold">
                      {record.documents?.length ?? 0}
                    </p>
                    <p className="text-[10px] uppercase text-on-primary-container font-medium">
                      Documents
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
