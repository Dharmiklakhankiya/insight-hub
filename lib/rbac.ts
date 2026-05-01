/**
 * Role-Based Access Control (RBAC) with multi-tenant isolation.
 *
 * Permission hierarchy:
 *   SUPER_ADMIN  – global, can manage all tenants and all users
 *   ADMIN        – tenant-scoped, can manage LAWYER & CLERK within own tenant
 *   LAWYER       – standard authenticated access, no user management
 *   CLERK        – limited access, no user management
 */

import type { UserRole } from "@/lib/constants";
import { AppError } from "@/lib/errors";

/* ------------------------------------------------------------------ */
/*  Role that each actor can create / update / delete                  */
/* ------------------------------------------------------------------ */

const MANAGEABLE_ROLES: Record<UserRole, readonly UserRole[]> = {
  super_admin: ["admin", "lawyer", "clerk"],
  admin: ["lawyer", "clerk"],
  lawyer: [],
  clerk: [],
};

/* ------------------------------------------------------------------ */
/*  Guards                                                             */
/* ------------------------------------------------------------------ */

/** Returns true if `actorRole` is allowed to manage users with `targetRole`. */
export function canManageRole(
  actorRole: UserRole,
  targetRole: UserRole,
): boolean {
  return (MANAGEABLE_ROLES[actorRole] as readonly string[]).includes(
    targetRole,
  );
}

/**
 * Asserts that the acting user is permitted to perform a user-management
 * operation on the target.
 *
 * Rules:
 *  1. Actor must have permission over `targetRole` (hierarchy check).
 *  2. Non-SUPER_ADMIN actors must share the same tenantId as the target.
 */
export function assertCanManageUser(
  actor: { role: UserRole; tenantId: string | null },
  target: { role: UserRole; tenantId: string | null },
): void {
  if (!canManageRole(actor.role, target.role)) {
    throw new AppError(
      "You do not have permission to manage this user role",
      403,
    );
  }

  if (actor.role !== "super_admin") {
    if (!actor.tenantId || actor.tenantId !== target.tenantId) {
      throw new AppError("Cross-tenant access is not allowed", 403);
    }
  }
}

/**
 * Asserts that the actor can reset the target user's password.
 * Same rules as `assertCanManageUser`.
 */
export function assertCanResetPassword(
  actor: { role: UserRole; tenantId: string | null },
  target: { role: UserRole; tenantId: string | null },
): void {
  assertCanManageUser(actor, target);
}

/** Returns true if `role` is allowed to access the user management UI. */
export function canAccessUserManagement(role: UserRole): boolean {
  return role === "super_admin" || role === "admin";
}

/** Returns true if `role` is allowed to manage tenants. */
export function canManageTenants(role: UserRole): boolean {
  return role === "super_admin";
}

/**
 * Builds a MongoDB filter that enforces tenant isolation.
 * SUPER_ADMIN sees all; everyone else is scoped to their tenant.
 */
export function tenantFilter(
  role: UserRole,
  tenantId: string | null,
): Record<string, unknown> {
  if (role === "super_admin") {
    return {};
  }

  if (!tenantId) {
    throw new AppError("Tenant context is required", 403);
  }

  return { tenantId };
}
