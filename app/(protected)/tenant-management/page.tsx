"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import Icon from "@/components/ui/icon";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/client-api";
import type { User, Tenant } from "@/lib/types";

/* ── Dialog Shell ── */
function Dialog({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-surface-container-lowest rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="px-8 py-6 border-b border-outline-variant/10 flex justify-between items-center">
          <h3 className="text-xl font-display font-extrabold text-primary">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-primary transition-colors"
          >
            <Icon name="close" />
          </button>
        </div>
        <div className="px-8 py-6">{children}</div>
      </div>
    </div>
  );
}

/* ── Toast ── */
function Toast({
  msg,
  severity,
  onClose,
}: {
  msg: string;
  severity: "success" | "error";
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div
        className={`px-6 py-3 rounded-lg shadow-lg text-sm font-medium text-white ${
          severity === "success" ? "bg-green-600" : "bg-error"
        }`}
      >
        {msg}
      </div>
    </div>
  );
}

/* ── Confirm Dialog ── */
function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-surface-container-lowest rounded-lg shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-8 py-6 border-b border-outline-variant/10">
          <h3 className="text-lg font-display font-extrabold text-primary">
            {title}
          </h3>
        </div>
        <div className="px-8 py-6">
          <p className="text-sm text-on-surface-variant leading-relaxed">
            {message}
          </p>
        </div>
        <div className="px-8 py-4 bg-surface-container-low/30 flex justify-end gap-3 border-t border-outline-variant/10">
          <button
            onClick={onCancel}
            className="px-6 py-2 text-sm font-semibold text-on-surface-variant hover:text-primary"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-error text-white text-sm font-semibold rounded hover:opacity-90"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Page ── */

export default function TenantManagementPage() {
  const [me, setMe] = useState<User | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [toast, setToast] = useState<{
    msg: string;
    sev: "success" | "error";
  } | null>(null);

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editTenant, setEditTenant] = useState<Tenant | null>(null);
  const [editName, setEditName] = useState("");

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<Tenant | null>(null);

  /* ── Data fetching ── */
  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [meR, tR, uR] = await Promise.all([
        apiGet<{ user: User }>("/api/auth/me"),
        apiGet<{ tenants: Tenant[] }>("/api/tenants"),
        apiGet<{ users: User[] }>("/api/users"),
      ]);
      setMe(meR.user);
      setTenants(tR.tenants);
      setUsers(uR.users);
    } catch {
      setToast({ msg: "Failed to load data", sev: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /* ── Filtered ── */
  const filtered = useMemo(() => {
    if (!search) return tenants;
    const q = search.toLowerCase();
    return tenants.filter((t) => t.name.toLowerCase().includes(q));
  }, [tenants, search]);

  /* ── Member count per tenant ── */
  const memberCount = useCallback(
    (tenantId: string) =>
      users.filter((u) => u.tenantId === tenantId).length,
    [users],
  );

  /* ── Handlers ── */
  async function handleCreate() {
    if (!createName.trim()) return;
    try {
      await apiPost("/api/tenants", { name: createName.trim() });
      setToast({ msg: "Tenant created", sev: "success" });
      setCreateOpen(false);
      setCreateName("");
      await load();
    } catch {
      setToast({ msg: "Failed to create tenant", sev: "error" });
    }
  }

  function openEdit(t: Tenant) {
    setEditTenant(t);
    setEditName(t.name);
    setEditOpen(true);
  }

  async function handleEdit() {
    if (!editTenant || !editName.trim()) return;
    try {
      await apiPatch(`/api/tenants/${editTenant.id}`, {
        name: editName.trim(),
      });
      setToast({ msg: "Tenant updated", sev: "success" });
      setEditOpen(false);
      await load();
    } catch {
      setToast({ msg: "Failed to update tenant", sev: "error" });
    }
  }

  async function handleDelete() {
    if (!deleteConfirm) return;
    try {
      await apiDelete(`/api/tenants/${deleteConfirm.id}`);
      setToast({ msg: "Tenant deleted", sev: "success" });
      setDeleteConfirm(null);
      await load();
    } catch {
      setToast({ msg: "Failed to delete tenant", sev: "error" });
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-on-surface-variant">
        <Icon name="progress_activity" className="animate-spin mr-3" />
        Loading...
      </div>
    );
  }

  if (!me || me.role !== "super_admin") {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant gap-4">
        <Icon name="shield" className="text-5xl text-error" />
        <p className="text-lg font-semibold">Access Denied</p>
        <p className="text-sm opacity-60">
          Only Super Admins can manage tenants.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* ── Page Header ── */}
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-display text-4xl font-extrabold text-primary tracking-tight mb-2">
            Tenant Management
          </h1>
          <p className="text-on-secondary-container font-body font-medium">
            Manage organizational entities and jurisdictional boundaries.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-surface-container-highest flex items-center px-4 rounded border-b-2 border-transparent focus-within:border-surface-tint transition-all">
            <Icon name="search" className="text-outline" />
            <input
              className="bg-transparent border-none focus:ring-0 focus:outline-none text-sm py-3 w-64 placeholder:text-outline"
              placeholder="Search tenants..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={() => setCreateOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-primary to-primary-container text-white text-sm font-semibold rounded-md shadow-sm hover:opacity-90 transition-all"
          >
            New Tenant
          </button>
        </div>
      </header>

      {/* ── Stats Cards ── */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icon name="corporate_fare" className="text-primary text-xl" />
            </div>
            <span className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">
              Total Tenants
            </span>
          </div>
          <p className="text-3xl font-display font-extrabold text-on-surface">
            {tenants.length}
          </p>
        </div>
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icon name="group" className="text-primary text-xl" />
            </div>
            <span className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">
              Total Members
            </span>
          </div>
          <p className="text-3xl font-display font-extrabold text-on-surface">
            {users.filter((u) => u.tenantId).length}
          </p>
        </div>
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icon name="person_off" className="text-primary text-xl" />
            </div>
            <span className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">
              Unassigned Users
            </span>
          </div>
          <p className="text-3xl font-display font-extrabold text-on-surface">
            {users.filter((u) => !u.tenantId).length}
          </p>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-surface-container-lowest overflow-hidden rounded-xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-body">
            <thead>
              <tr className="bg-surface-container-high/50">
                <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant">
                  Tenant Entity
                </th>
                <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant text-center">
                  Members
                </th>
                <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low">
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-8 py-12 text-center text-on-surface-variant"
                  >
                    {search
                      ? "No tenants match your search"
                      : "No tenants created yet"}
                  </td>
                </tr>
              )}
              {filtered.map((t, i) => {
                const count = memberCount(t.id);
                return (
                  <tr
                    key={t.id}
                    className={`group transition-colors ${
                      i % 2 === 0
                        ? "hover:bg-surface-container-low"
                        : "bg-surface-container-low hover:bg-surface-container-high"
                    }`}
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white font-display font-extrabold text-sm shadow-sm">
                          {t.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-on-surface">
                            {t.name}
                          </p>
                          <p className="text-[11px] text-on-surface-variant">
                            ID: {t.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          count > 0
                            ? "bg-primary/10 text-primary"
                            : "bg-surface-container-high text-on-surface-variant"
                        }`}
                      >
                        <Icon name="group" className="text-sm" />
                        {count}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEdit(t)}
                          className="p-1 hover:text-primary transition-colors text-on-surface-variant"
                          title="Rename Tenant"
                        >
                          <Icon name="edit" className="text-xl" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(t)}
                          className="p-1 hover:text-error transition-colors text-on-surface-variant"
                          title="Delete Tenant"
                        >
                          <Icon name="delete" className="text-xl" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-surface-container-low/30 flex items-center justify-between border-t border-outline-variant/10">
          <p className="text-xs text-on-secondary-container font-medium">
            Showing {filtered.length} of {tenants.length} tenants
          </p>
        </div>
      </div>

      {/* ── Create Dialog ── */}
      <Dialog
        open={createOpen}
        title="Create Tenant"
        onClose={() => setCreateOpen(false)}
      >
        <div className="space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant block mb-1">
              Organization Name *
            </label>
            <input
              className="w-full bg-surface-container-high border-none p-3 text-sm rounded focus:ring-1 focus:ring-surface-tint"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              placeholder="e.g. Lakhankiya & Associates"
              required
            />
            <p className="text-[10px] text-on-surface-variant mt-1 opacity-60">
              Must be 2–120 characters. Must be unique.
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/10">
            <button
              onClick={() => setCreateOpen(false)}
              className="px-6 py-2 text-sm font-semibold text-on-surface-variant hover:text-primary"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              className="px-6 py-2 bg-primary text-white text-sm font-semibold rounded hover:opacity-90"
            >
              Create
            </button>
          </div>
        </div>
      </Dialog>

      {/* ── Edit Dialog ── */}
      <Dialog
        open={editOpen}
        title="Rename Tenant"
        onClose={() => setEditOpen(false)}
      >
        <div className="space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant block mb-1">
              Organization Name *
            </label>
            <input
              className="w-full bg-surface-container-high border-none p-3 text-sm rounded focus:ring-1 focus:ring-surface-tint"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/10">
            <button
              onClick={() => setEditOpen(false)}
              className="px-6 py-2 text-sm font-semibold text-on-surface-variant hover:text-primary"
            >
              Cancel
            </button>
            <button
              onClick={handleEdit}
              className="px-6 py-2 bg-primary text-white text-sm font-semibold rounded hover:opacity-90"
            >
              Save
            </button>
          </div>
        </div>
      </Dialog>

      {/* ── Delete Confirmation ── */}
      <ConfirmDialog
        open={!!deleteConfirm}
        title="Delete Tenant"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? All users assigned to this tenant will become unassigned. This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />

      {/* ── Toast ── */}
      {toast && (
        <Toast
          msg={toast.msg}
          severity={toast.sev}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
