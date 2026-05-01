"use client";

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Alert,
  Stack,
  TextField,
  Tooltip,
  Typography,
  Menu,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import EditIcon from "@mui/icons-material/Edit";
import LockResetIcon from "@mui/icons-material/LockReset";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import DomainIcon from "@mui/icons-material/Domain";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useCallback, useEffect, useMemo, useState } from "react";

import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/client-api";
import type { User, Tenant } from "@/lib/types";
import type { UserRole } from "@/lib/constants";

/* ------------------------------------------------------------------ */
/*  Design constants                                                   */
/* ------------------------------------------------------------------ */

const C = {
  primary: "#000a1e",
  primaryContainer: "#002147",
  secondary: "#4c616c",
  secondaryContainer: "#cfe6f2",
  onSecondaryContainer: "#526772",
  surface: "#f8f9fa",
  surfLow: "#f3f4f5",
  surfHigh: "#e7e8e9",
  surfHighest: "#e1e3e4",
  surfLowest: "#ffffff",
  onSurface: "#191c1d",
  onSurfaceVar: "#44474e",
  outline: "#74777f",
  outlineVar: "#c4c6cf",
  surfTint: "#465f88",
} as const;

const ROLE_BADGE: Record<UserRole, { bg: string; label: string }> = {
  super_admin: { bg: C.primaryContainer, label: "SUPER_ADMIN" },
  admin: { bg: C.secondary, label: "ADMIN" },
  lawyer: { bg: "#3b6a5e", label: "LAWYER" },
  clerk: { bg: "#6d5e3a", label: "CLERK" },
};

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function creatableRoles(r: UserRole): UserRole[] {
  if (r === "super_admin") return ["admin", "lawyer", "clerk"];
  if (r === "admin") return ["lawyer", "clerk"];
  return [];
}

function canManage(actor: UserRole, target: UserRole) {
  return creatableRoles(actor).includes(target);
}

const PER_PAGE = 10;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function UserManagementPage() {
  const [me, setMe] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "">("");
  const [page, setPage] = useState(1);

  // Snackbar
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

  // Context menu
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuUser, setMenuUser] = useState<User | null>(null);

  /* ---- Data fetching ---- */
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

  /* ---- Filtered + paginated ---- */
  const filtered = useMemo(() => {
    let list = users;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (u) =>
          u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
      );
    }
    if (roleFilter) list = list.filter((u) => u.role === roleFilter);
    return list;
  }, [users, search, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  /* ---- Handlers ---- */
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
      setMenuAnchor(null);
      await load();
    } catch {
      setToast({ msg: "Failed to delete", sev: "error" });
    }
  }

  const tenantName = (tid: string | null) =>
    tenants.find((t) => t.id === tid)?.name ?? (tid ? "—" : "Global");

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 16 }}>
        <Typography
          sx={{ color: C.onSurfaceVar, fontFamily: "var(--font-inter)" }}
        >
          Loading…
        </Typography>
      </Box>
    );
  }
  if (!me) return null;

  const roles = creatableRoles(me.role);
  const isSA = me.role === "super_admin";

  return (
    <>
      {/* ---- Page Header ---- */}
      <Box sx={{ mb: 5 }}>
        <Typography
          sx={{
            fontFamily: "var(--font-manrope)",
            fontWeight: 800,
            fontSize: "2.25rem",
            color: C.primary,
            letterSpacing: "-0.02em",
            mb: 0.5,
          }}
        >
          User Management
        </Typography>
        <Typography
          sx={{ color: C.onSurfaceVar, maxWidth: 640, lineHeight: 1.7 }}
        >
          Oversee access control, manage jurisdictional permissions, and audit
          system credentials across the archive&apos;s sovereign entities.
        </Typography>
      </Box>

      {/* ---- Search & Filter ---- */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 2,
          mb: 6,
        }}
      >
        <Box sx={{ position: "relative", flex: 1 }}>
          <SearchIcon
            sx={{
              position: "absolute",
              left: 16,
              top: "50%",
              transform: "translateY(-50%)",
              color: C.outlineVar,
            }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name or email…"
            style={{
              width: "100%",
              paddingLeft: 48,
              paddingRight: 16,
              paddingTop: 16,
              paddingBottom: 16,
              background: C.surfHighest,
              border: "none",
              borderRadius: 2,
              color: C.onSurface,
              fontFamily: "var(--font-inter)",
              fontSize: 14,
              outline: "none",
            }}
          />
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select
              displayEmpty
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value as UserRole | "");
                setPage(1);
              }}
              sx={{ background: C.surfLow, fontWeight: 600, fontSize: 14 }}
              startAdornment={<FilterListIcon sx={{ mr: 1, fontSize: 18 }} />}
            >
              <MenuItem value="">All Roles</MenuItem>
              <MenuItem value="super_admin">Super Admin</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="lawyer">Lawyer</MenuItem>
              <MenuItem value="clerk">Clerk</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* ---- Table Header ---- */}
      <Box
        sx={{
          display: { xs: "none", md: "grid" },
          gridTemplateColumns: "4fr 2fr 3fr 3fr",
          gap: 2,
          px: 3,
          py: 2,
          fontSize: 11,
          fontWeight: 700,
          color: C.outlineVar,
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          fontFamily: "var(--font-inter)",
        }}
      >
        <Box>User Identity</Box>
        <Box>Access Level</Box>
        <Box>Jurisdiction (Tenant)</Box>
        <Box sx={{ textAlign: "right" }}>Administrative Actions</Box>
      </Box>

      {/* ---- Rows ---- */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        {paged.map((u, i) => {
          const manageable = canManage(me.role, u.role);
          const badge = ROLE_BADGE[u.role];
          const even = i % 2 === 0;

          return (
            <Box
              key={u.id}
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "4fr 2fr 3fr 3fr" },
                gap: 2,
                alignItems: "center",
                px: 3,
                py: 3,
                background: even ? C.surfLowest : C.surfLow,
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                transition: "background 0.15s",
                "&:hover": { background: "#ffffff" },
              }}
            >
              {/* Identity */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: 16,
                    fontFamily: "var(--font-manrope)",
                    background: even
                      ? "rgba(0,33,71,0.08)"
                      : C.secondaryContainer,
                    color: even ? C.primary : C.onSecondaryContainer,
                  }}
                >
                  {initials(u.name)}
                </Box>
                <Box>
                  <Typography
                    sx={{
                      fontFamily: "var(--font-manrope)",
                      fontWeight: 700,
                      color: C.primary,
                      fontSize: 15,
                    }}
                  >
                    {u.name}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 13,
                      color: C.onSurfaceVar,
                      fontWeight: 500,
                    }}
                  >
                    {u.email}
                  </Typography>
                </Box>
              </Box>

              {/* Role Badge */}
              <Box>
                <Box
                  component="span"
                  sx={{
                    display: "inline-block",
                    px: 1.5,
                    py: 0.5,
                    background: badge.bg,
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 900,
                    borderRadius: 99,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  {badge.label}
                </Box>
              </Box>

              {/* Tenant */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  color: C.onSurfaceVar,
                  fontWeight: 500,
                  fontSize: 14,
                }}
              >
                <DomainIcon sx={{ fontSize: 16 }} />
                {isSA ? tenantName(u.tenantId) : tenantName(u.tenantId)}
              </Box>

              {/* Actions — hidden completely for non-manageable */}
              <Box
                sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}
              >
                {manageable && (
                  <>
                    <Tooltip title="Edit User">
                      <IconButton
                        size="small"
                        onClick={() => openEdit(u)}
                        sx={{
                          color: C.onSurfaceVar,
                          "&:hover": {
                            background: C.surfHigh,
                            color: C.primary,
                          },
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Reset Password">
                      <IconButton
                        size="small"
                        onClick={() => openReset(u)}
                        sx={{
                          color: C.onSurfaceVar,
                          "&:hover": {
                            background: C.surfHigh,
                            color: C.primary,
                          },
                        }}
                      >
                        <LockResetIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="More Options">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          setMenuAnchor(e.currentTarget);
                          setMenuUser(u);
                        }}
                        sx={{
                          color: C.onSurfaceVar,
                          "&:hover": {
                            background: C.surfHigh,
                            color: C.primary,
                          },
                        }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </>
                )}
              </Box>
            </Box>
          );
        })}

        {paged.length === 0 && (
          <Box sx={{ textAlign: "center", py: 8, color: C.onSurfaceVar }}>
            <Typography>No users found</Typography>
          </Box>
        )}
      </Box>

      {/* ---- Pagination ---- */}
      <Box
        sx={{
          mt: 6,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          alignItems: "center",
          gap: 3,
        }}
      >
        <Typography sx={{ fontSize: 14, color: C.onSurfaceVar }}>
          Showing <strong style={{ color: C.primary }}>{paged.length}</strong>{" "}
          of <strong style={{ color: C.primary }}>{filtered.length}</strong>{" "}
          verified agents
        </Typography>
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <IconButton
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            sx={{
              width: 48,
              height: 48,
              background: C.surfLow,
              borderRadius: "2px",
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(
            (p) => (
              <Button
                key={p}
                onClick={() => setPage(p)}
                sx={{
                  minWidth: 48,
                  height: 48,
                  borderRadius: "2px",
                  fontWeight: 700,
                  background: p === page ? C.primaryContainer : C.surfLow,
                  color: p === page ? "#fff" : C.onSurfaceVar,
                  "&:hover": {
                    background: p === page ? C.primaryContainer : C.surfHigh,
                  },
                }}
              >
                {p}
              </Button>
            ),
          )}
          <IconButton
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            sx={{
              width: 48,
              height: 48,
              background: C.surfLow,
              borderRadius: "2px",
            }}
          >
            <ChevronRightIcon />
          </IconButton>
        </Box>
      </Box>

      {/* ---- FAB ---- */}
      {roles.length > 0 && (
        <IconButton
          onClick={() => setCreateOpen(true)}
          sx={{
            position: "fixed",
            bottom: 40,
            right: 32,
            width: 64,
            height: 64,
            borderRadius: "12px",
            background: `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryContainer} 100%)`,
            color: "#fff",
            boxShadow: "0 8px 32px rgba(0,10,30,0.3)",
            "&:hover": { transform: "scale(1.05)" },
            transition: "transform 0.2s",
            zIndex: 40,
          }}
        >
          <AddIcon sx={{ fontSize: 32 }} />
        </IconButton>
      )}

      {/* ---- Context Menu ---- */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem
          onClick={() => {
            if (menuUser) handleDelete(menuUser.id);
          }}
          sx={{ color: C.primary, gap: 1 }}
        >
          <DeleteIcon fontSize="small" sx={{ color: "#ba1a1a" }} />
          <Typography sx={{ color: "#ba1a1a", fontWeight: 600, fontSize: 14 }}>
            Delete User
          </Typography>
        </MenuItem>
      </Menu>

      {/* ---- Create Dialog ---- */}
      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: "4px" } } }}
      >
        <DialogTitle
          sx={{
            fontFamily: "var(--font-manrope)",
            fontWeight: 800,
            color: C.primary,
          }}
        >
          Create User
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Full Name"
              value={cForm.name}
              onChange={(e) =>
                setCForm((f) => ({ ...f, name: e.target.value }))
              }
              fullWidth
              required
            />
            <TextField
              label="Email"
              type="email"
              value={cForm.email}
              onChange={(e) =>
                setCForm((f) => ({ ...f, email: e.target.value }))
              }
              fullWidth
              required
            />
            <TextField
              label="Password"
              type="password"
              value={cForm.password}
              onChange={(e) =>
                setCForm((f) => ({ ...f, password: e.target.value }))
              }
              helperText="Min 10 chars, uppercase, lowercase, number"
              fullWidth
              required
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                label="Role"
                value={cForm.role}
                onChange={(e) =>
                  setCForm((f) => ({ ...f, role: e.target.value as UserRole }))
                }
              >
                {roles.map((r) => (
                  <MenuItem key={r} value={r}>
                    {ROLE_BADGE[r].label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {isSA && (
              <FormControl fullWidth>
                <InputLabel>Tenant</InputLabel>
                <Select
                  label="Tenant"
                  value={cForm.tenantId}
                  onChange={(e) =>
                    setCForm((f) => ({ ...f, tenantId: e.target.value }))
                  }
                >
                  <MenuItem value="">
                    <em>None (Super Admin)</em>
                  </MenuItem>
                  {tenants.map((t) => (
                    <MenuItem key={t.id} value={t.id}>
                      {t.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            sx={{ background: C.primaryContainer }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* ---- Edit Dialog ---- */}
      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: "4px" } } }}
      >
        <DialogTitle
          sx={{
            fontFamily: "var(--font-manrope)",
            fontWeight: 800,
            color: C.primary,
          }}
        >
          Edit User
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Full Name"
              value={eForm.name}
              onChange={(e) =>
                setEForm((f) => ({ ...f, name: e.target.value }))
              }
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={eForm.email}
              onChange={(e) =>
                setEForm((f) => ({ ...f, email: e.target.value }))
              }
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                label="Role"
                value={eForm.role}
                onChange={(e) =>
                  setEForm((f) => ({ ...f, role: e.target.value as UserRole }))
                }
              >
                {roles.map((r) => (
                  <MenuItem key={r} value={r}>
                    {ROLE_BADGE[r].label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleEdit}
            sx={{ background: C.primaryContainer }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* ---- Reset Password Dialog ---- */}
      <Dialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: "4px" } } }}
      >
        <DialogTitle
          sx={{
            fontFamily: "var(--font-manrope)",
            fontWeight: 800,
            color: C.primary,
          }}
        >
          Reset Password — {resetUser?.name}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="New Password"
              type="password"
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              helperText="Min 10 chars, uppercase, lowercase, number"
              fullWidth
              required
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setResetOpen(false)}>Cancel</Button>
          <Button variant="contained" color="warning" onClick={handleReset}>
            Reset Password
          </Button>
        </DialogActions>
      </Dialog>

      {/* ---- Toast ---- */}
      <Snackbar
        open={!!toast}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={toast?.sev ?? "info"}
          onClose={() => setToast(null)}
          variant="filled"
        >
          {toast?.msg}
        </Alert>
      </Snackbar>
    </>
  );
}
