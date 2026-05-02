"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import Avatar from "@/components/ui/avatar";
import Icon from "@/components/ui/icon";
import RoleBadge from "@/components/ui/role-badge";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/client-api";
import type { User, Tenant } from "@/lib/types";
import type { UserRole } from "@/lib/constants";

/* ── Helpers ── */

function creatableRoles(r: UserRole): UserRole[] {
  if (r === "super_admin") return ["admin", "lawyer", "clerk"];
  if (r === "admin") return ["lawyer", "clerk"];
  return [];
}

function canManage(actor: UserRole, target: UserRole) {
  return creatableRoles(actor).includes(target);
}

const PER_PAGE = 10;

const ROLE_LABELS: Record<string, string> = {
  super_admin: "SUPER_ADMIN",
  admin: "ADMIN",
  lawyer: "LAWYER",
  clerk: "CLERK",
};

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

/* ── Page ── */

export default function UserManagementPage() {
  const [me, setMe] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "">("");
  const [page, setPage] = useState(1);

  const [toast, setToast] = useState<{
    msg: string;
    sev: "success" | "error";
  } | null>(null);

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [cForm, setCForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "clerk" as UserRole,
    tenantId: "",
  });

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [eForm, setEForm] = useState({
    name: "",
    email: "",
    role: "clerk" as UserRole,
  });

  // Reset pwd dialog
  const [resetOpen, setResetOpen] = useState(false);
  const [resetUser, setResetUser] = useState<User | null>(null);
  const [newPwd, setNewPwd] = useState("");

  /* ── Data fetching ── */
  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [meR, uR] = await Promise.all([
        apiGet<{ user: User }>("/api/auth/me"),
        apiGet<{ users: User[] }>("/api/users"),
      ]);
      setMe(meR.user);
      setUsers(uR.users);
      if (meR.user.role === "super_admin") {
        const tR = await apiGet<{ tenants: Tenant[] }>("/api/tenants");
        setTenants(tR.tenants);
      }
    } catch {
      setToast({ msg: "Failed to load data", sev: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /* ── Filtered + paginated ── */
  const filtered = useMemo(() => {
    let list = users;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q),
      );
    }
    if (roleFilter) list = list.filter((u) => u.role === roleFilter);
    return list;
  }, [users, search, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  /* ── Handlers ── */
  async function handleCreate() {
    try {
      await apiPost("/api/users", {
        ...cForm,
        tenantId: cForm.tenantId || null,
      });
      setToast({ msg: "User created", sev: "success" });
      setCreateOpen(false);
      setCForm({
        name: "",
        email: "",
        password: "",
        role: "clerk",
        tenantId: "",
      });
      await load();
    } catch {
      setToast({ msg: "Failed to create user", sev: "error" });
    }
  }

  function openEdit(u: User) {
    setEditUser(u);
    setEForm({ name: u.name, email: u.email, role: u.role });
    setEditOpen(true);
  }

  async function handleEdit() {
    if (!editUser) return;
    try {
      await apiPatch(`/api/users/${editUser.id}`, eForm);
      setToast({ msg: "User updated", sev: "success" });
      setEditOpen(false);
      await load();
    } catch {
      setToast({ msg: "Failed to update", sev: "error" });
    }
  }

  function openReset(u: User) {
    setResetUser(u);
    setNewPwd("");
    setResetOpen(true);
  }

  async function handleReset() {
    if (!resetUser) return;
    try {
      await apiPost("/api/users/reset-password", {
        userId: resetUser.id,
        newPassword: newPwd,
      });
      setToast({ msg: "Password reset", sev: "success" });
      setResetOpen(false);
      await load();
    } catch {
      setToast({ msg: "Failed to reset password", sev: "error" });
    }
  }

  async function handleDelete(uid: string) {
    try {
      await apiDelete(`/api/users/${uid}`);
      setToast({ msg: "User deleted", sev: "success" });
      await load();
    } catch {
      setToast({ msg: "Failed to delete", sev: "error" });
    }
  }

  const tenantName = (tid: string | null) =>
    tenants.find((t) => t.id === tid)?.name ?? (tid ? "—" : "Global");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-on-surface-variant">
        <Icon name="progress_activity" className="animate-spin mr-3" />
        Loading...
      </div>
    );
  }
  if (!me) return null;

  const roles = creatableRoles(me.role);
  const isSA = me.role === "super_admin";

  return (
    <>
      {/* ── Page Header ── */}
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-display text-4xl font-extrabold text-primary tracking-tight mb-2">
            User Management
          </h1>
          <p className="text-on-secondary-container font-body font-medium">
            Oversee access control and jurisdictional permissions.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-surface-container-highest flex items-center px-4 rounded border-b-2 border-transparent focus-within:border-surface-tint transition-all">
            <Icon name="search" className="text-outline" />
            <input
              className="bg-transparent border-none focus:ring-0 focus:outline-none text-sm py-3 w-64 placeholder:text-outline"
              placeholder="Search members..."
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          {roles.length > 0 && (
            <button
              onClick={() => setCreateOpen(true)}
              className="px-6 py-3 bg-gradient-to-r from-primary to-primary-container text-white text-sm font-semibold rounded-md shadow-sm hover:opacity-90 transition-all"
            >
              Add New Member
            </button>
          )}
        </div>
      </header>

      {/* ── Filters Bar ── */}
      <div className="mb-8 flex flex-wrap items-center gap-4">
        <select
          className="px-4 py-2 bg-secondary-container text-on-secondary-container rounded-full text-xs font-semibold border-none focus:ring-0"
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value as UserRole | "");
            setPage(1);
          }}
        >
          <option value="">Role: All Roles</option>
          <option value="super_admin">Super Admin</option>
          <option value="admin">Admin</option>
          <option value="lawyer">Lawyer</option>
          <option value="clerk">Clerk</option>
        </select>
      </div>

      {/* ── Table ── */}
      <div className="bg-surface-container-lowest overflow-hidden rounded-xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-body">
            <thead>
              <tr className="bg-surface-container-high/50">
                <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant">
                  Member
                </th>
                <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant">
                  Role
                </th>
                <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant">
                  Tenant Entity
                </th>
                <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low">
              {paged.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-8 py-12 text-center text-on-surface-variant"
                  >
                    No users found
                  </td>
                </tr>
              )}
              {paged.map((u, i) => {
                const manageable = canManage(me.role, u.role);
                return (
                  <tr
                    key={u.id}
                    className={`group transition-colors ${
                      i % 2 === 0
                        ? "hover:bg-surface-container-low"
                        : "bg-surface-container-low hover:bg-surface-container-high"
                    }`}
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <Avatar name={u.name} size="md" />
                        <div>
                          <p className="text-sm font-semibold text-on-surface">
                            {u.name}
                          </p>
                          <p className="text-[11px] text-on-surface-variant">
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="px-8 py-6 text-sm text-on-surface-variant font-medium">
                      {isSA ? tenantName(u.tenantId) : tenantName(u.tenantId)}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        {manageable && (
                          <>
                            <button
                              onClick={() => openEdit(u)}
                              className="p-1 hover:text-primary transition-colors text-on-surface-variant"
                              title="Edit User"
                            >
                              <Icon name="edit" className="text-xl" />
                            </button>
                            <button
                              onClick={() => openReset(u)}
                              className="p-1 hover:text-primary transition-colors text-on-surface-variant"
                              title="Reset Password"
                            >
                              <Icon name="lock_reset" className="text-xl" />
                            </button>
                            <button
                              onClick={() => handleDelete(u.id)}
                              className="p-1 hover:text-error transition-colors text-on-surface-variant"
                              title="Delete User"
                            >
                              <Icon name="delete" className="text-xl" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-8 py-6 bg-surface-container-low/30 flex items-center justify-between border-t border-outline-variant/10">
          <p className="text-xs text-on-secondary-container font-medium">
            Showing {paged.length} of {filtered.length} members
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="p-2 text-outline hover:text-primary disabled:opacity-30"
            >
              <Icon name="chevron_left" />
            </button>
            {Array.from(
              { length: Math.min(totalPages, 5) },
              (_, i) => i + 1,
            ).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-full text-xs font-bold transition-colors ${
                  p === page
                    ? "bg-primary text-white shadow-sm"
                    : "hover:bg-surface-container-high text-on-surface"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-2 text-outline hover:text-primary disabled:opacity-30"
            >
              <Icon name="chevron_right" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Create Dialog ── */}
      <Dialog
        open={createOpen}
        title="Create User"
        onClose={() => setCreateOpen(false)}
      >
        <div className="space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant block mb-1">
              Full Name *
            </label>
            <input
              className="w-full bg-surface-container-high border-none p-3 text-sm rounded focus:ring-1 focus:ring-surface-tint"
              value={cForm.name}
              onChange={(e) =>
                setCForm((f) => ({ ...f, name: e.target.value }))
              }
              required
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant block mb-1">
              Email *
            </label>
            <input
              type="email"
              className="w-full bg-surface-container-high border-none p-3 text-sm rounded focus:ring-1 focus:ring-surface-tint"
              value={cForm.email}
              onChange={(e) =>
                setCForm((f) => ({ ...f, email: e.target.value }))
              }
              required
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant block mb-1">
              Password *
            </label>
            <input
              type="password"
              className="w-full bg-surface-container-high border-none p-3 text-sm rounded focus:ring-1 focus:ring-surface-tint"
              value={cForm.password}
              onChange={(e) =>
                setCForm((f) => ({ ...f, password: e.target.value }))
              }
              required
            />
            <p className="text-[10px] text-on-surface-variant mt-1 opacity-60">
              Min 10 chars, uppercase, lowercase, number
            </p>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant block mb-1">
              Role
            </label>
            <select
              className="w-full bg-surface-container-high border-none p-3 text-sm rounded focus:ring-1 focus:ring-surface-tint"
              value={cForm.role}
              onChange={(e) =>
                setCForm((f) => ({ ...f, role: e.target.value as UserRole }))
              }
            >
              {roles.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
          </div>
          {isSA && (
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant block mb-1">
                Tenant
              </label>
              <select
                className="w-full bg-surface-container-high border-none p-3 text-sm rounded focus:ring-1 focus:ring-surface-tint"
                value={cForm.tenantId}
                onChange={(e) =>
                  setCForm((f) => ({ ...f, tenantId: e.target.value }))
                }
              >
                <option value="">None (Super Admin)</option>
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          )}
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
        title="Edit User"
        onClose={() => setEditOpen(false)}
      >
        <div className="space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant block mb-1">
              Full Name
            </label>
            <input
              className="w-full bg-surface-container-high border-none p-3 text-sm rounded focus:ring-1 focus:ring-surface-tint"
              value={eForm.name}
              onChange={(e) =>
                setEForm((f) => ({ ...f, name: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant block mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full bg-surface-container-high border-none p-3 text-sm rounded focus:ring-1 focus:ring-surface-tint"
              value={eForm.email}
              onChange={(e) =>
                setEForm((f) => ({ ...f, email: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant block mb-1">
              Role
            </label>
            <select
              className="w-full bg-surface-container-high border-none p-3 text-sm rounded focus:ring-1 focus:ring-surface-tint"
              value={eForm.role}
              onChange={(e) =>
                setEForm((f) => ({ ...f, role: e.target.value as UserRole }))
              }
            >
              {roles.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
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

      {/* ── Reset Password Dialog ── */}
      <Dialog
        open={resetOpen}
        title={`Reset Password — ${resetUser?.name ?? ""}`}
        onClose={() => setResetOpen(false)}
      >
        <div className="space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant block mb-1">
              New Password *
            </label>
            <input
              type="password"
              className="w-full bg-surface-container-high border-none p-3 text-sm rounded focus:ring-1 focus:ring-surface-tint"
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              required
            />
            <p className="text-[10px] text-on-surface-variant mt-1 opacity-60">
              Min 10 chars, uppercase, lowercase, number
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/10">
            <button
              onClick={() => setResetOpen(false)}
              className="px-6 py-2 text-sm font-semibold text-on-surface-variant hover:text-primary"
            >
              Cancel
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-tertiary-fixed-dim text-on-tertiary-fixed text-sm font-semibold rounded hover:opacity-90"
            >
              Reset Password
            </button>
          </div>
        </div>
      </Dialog>

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
