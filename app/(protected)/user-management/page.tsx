"use client";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import LockResetIcon from "@mui/icons-material/LockReset";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { useCallback, useEffect, useState } from "react";

import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
} from "@/lib/client-api";
import type { User, Tenant } from "@/lib/types";
import type { UserRole } from "@/lib/constants";

/* ------------------------------------------------------------------ */
/*  Role helpers                                                       */
/* ------------------------------------------------------------------ */

const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  lawyer: "Lawyer",
  clerk: "Clerk",
};

const ROLE_COLORS: Record<UserRole, "error" | "warning" | "primary" | "default"> = {
  super_admin: "error",
  admin: "warning",
  lawyer: "primary",
  clerk: "default",
};

function creatableRoles(actorRole: UserRole): UserRole[] {
  if (actorRole === "super_admin") return ["admin", "lawyer", "clerk"];
  if (actorRole === "admin") return ["lawyer", "clerk"];
  return [];
}

function canManage(actorRole: UserRole, targetRole: UserRole): boolean {
  const manageable = creatableRoles(actorRole);
  return manageable.includes(targetRole);
}

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

export default function UserManagementPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Create user dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "clerk" as UserRole,
    tenantId: "",
  });

  // Edit user dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    role: "clerk" as UserRole,
  });

  // Reset password dialog
  const [resetOpen, setResetOpen] = useState(false);
  const [resetTarget, setResetTarget] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState("");

  /* ---- Fetching ---- */

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [meRes, usersRes] = await Promise.all([
        apiGet<{ user: User }>("/api/auth/me"),
        apiGet<{ users: User[] }>("/api/users"),
      ]);

      setCurrentUser(meRes.user);
      setUsers(usersRes.users);

      // Fetch tenants if SUPER_ADMIN
      if (meRes.user.role === "super_admin") {
        const tenantsRes = await apiGet<{ tenants: Tenant[] }>("/api/tenants");
        setTenants(tenantsRes.tenants);
      }
    } catch {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ---- Create ---- */

  async function handleCreate() {
    try {
      setError(null);
      await apiPost("/api/users", {
        name: createForm.name,
        email: createForm.email,
        password: createForm.password,
        role: createForm.role,
        tenantId: createForm.tenantId || null,
      });
      setSuccess("User created successfully");
      setCreateOpen(false);
      setCreateForm({
        name: "",
        email: "",
        password: "",
        role: "clerk",
        tenantId: "",
      });
      await fetchData();
    } catch {
      setError("Failed to create user");
    }
  }

  /* ---- Edit ---- */

  function openEdit(user: User) {
    setEditTarget(user);
    setEditForm({ name: user.name, email: user.email, role: user.role });
    setEditOpen(true);
  }

  async function handleEdit() {
    if (!editTarget) return;
    try {
      setError(null);
      await apiPatch(`/api/users/${editTarget.id}`, editForm);
      setSuccess("User updated successfully");
      setEditOpen(false);
      setEditTarget(null);
      await fetchData();
    } catch {
      setError("Failed to update user");
    }
  }

  /* ---- Delete ---- */

  async function handleDelete(userId: string) {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      setError(null);
      await apiDelete(`/api/users/${userId}`);
      setSuccess("User deleted successfully");
      await fetchData();
    } catch {
      setError("Failed to delete user");
    }
  }

  /* ---- Reset password ---- */

  function openReset(user: User) {
    setResetTarget(user);
    setNewPassword("");
    setResetOpen(true);
  }

  async function handleReset() {
    if (!resetTarget) return;
    try {
      setError(null);
      await apiPost("/api/users/reset-password", {
        userId: resetTarget.id,
        newPassword,
      });
      setSuccess("Password reset successfully");
      setResetOpen(false);
      setResetTarget(null);
      setNewPassword("");
    } catch {
      setError("Failed to reset password");
    }
  }

  /* ---- Render ---- */

  if (loading) {
    return (
      <Box className="flex items-center justify-center py-20">
        <Typography color="text.secondary">Loading…</Typography>
      </Box>
    );
  }

  if (!currentUser) return null;

  const actorRole = currentUser.role;
  const availableRoles = creatableRoles(actorRole);

  return (
    <Stack spacing={3}>
      <Box className="flex items-center justify-between">
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          User Management
        </Typography>
        {availableRoles.length > 0 && (
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={() => setCreateOpen(true)}
          >
            Create User
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid rgba(0,0,0,0.09)",
          overflow: "hidden",
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow
                  sx={{
                    background:
                      "linear-gradient(130deg, rgba(0,10,30,0.04) 0%, rgba(0,33,71,0.06) 100%)",
                  }}
                >
                  <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                  {actorRole === "super_admin" && (
                    <TableCell sx={{ fontWeight: 700 }}>Tenant</TableCell>
                  )}
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => {
                  const manageable = canManage(actorRole, user.role);
                  const tenantName = tenants.find(
                    (t) => t.id === user.tenantId,
                  )?.name;

                  return (
                    <TableRow key={user.id} hover>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={ROLE_LABELS[user.role]}
                          color={ROLE_COLORS[user.role]}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      {actorRole === "super_admin" && (
                        <TableCell>
                          {tenantName ?? (user.tenantId ? user.tenantId : "—")}
                        </TableCell>
                      )}
                      <TableCell align="right">
                        {manageable && (
                          <>
                            <Tooltip title="Edit user">
                              <IconButton
                                size="small"
                                onClick={() => openEdit(user)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reset password">
                              <IconButton
                                size="small"
                                onClick={() => openReset(user)}
                              >
                                <LockResetIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete user">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDelete(user.id)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}

                {users.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={actorRole === "super_admin" ? 5 : 4}
                      align="center"
                    >
                      <Typography color="text.secondary" sx={{ py: 4 }}>
                        No users found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* ---- Create User Dialog ---- */}
      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Create User</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Full Name"
              value={createForm.name}
              onChange={(e) =>
                setCreateForm((f) => ({ ...f, name: e.target.value }))
              }
              fullWidth
              required
            />
            <TextField
              label="Email"
              type="email"
              value={createForm.email}
              onChange={(e) =>
                setCreateForm((f) => ({ ...f, email: e.target.value }))
              }
              fullWidth
              required
            />
            <TextField
              label="Password"
              type="password"
              value={createForm.password}
              onChange={(e) =>
                setCreateForm((f) => ({ ...f, password: e.target.value }))
              }
              helperText="Min 10 chars, uppercase, lowercase, and number required"
              fullWidth
              required
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                label="Role"
                value={createForm.role}
                onChange={(e) =>
                  setCreateForm((f) => ({
                    ...f,
                    role: e.target.value as UserRole,
                  }))
                }
              >
                {availableRoles.map((r) => (
                  <MenuItem key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {actorRole === "super_admin" && (
              <FormControl fullWidth>
                <InputLabel>Tenant</InputLabel>
                <Select
                  label="Tenant"
                  value={createForm.tenantId}
                  onChange={(e) =>
                    setCreateForm((f) => ({
                      ...f,
                      tenantId: e.target.value,
                    }))
                  }
                >
                  <MenuItem value="">
                    <em>None (for Super Admin)</em>
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
          <Button variant="contained" onClick={handleCreate}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* ---- Edit User Dialog ---- */}
      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Edit User</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Full Name"
              value={editForm.name}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, name: e.target.value }))
              }
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={editForm.email}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, email: e.target.value }))
              }
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                label="Role"
                value={editForm.role}
                onChange={(e) =>
                  setEditForm((f) => ({
                    ...f,
                    role: e.target.value as UserRole,
                  }))
                }
              >
                {availableRoles.map((r) => (
                  <MenuItem key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleEdit}>
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
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Reset Password for {resetTarget?.name}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              helperText="Min 10 chars, uppercase, lowercase, and number required"
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
    </Stack>
  );
}
