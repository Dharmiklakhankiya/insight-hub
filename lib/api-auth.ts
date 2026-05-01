import { type NextRequest } from "next/server";

import { AUTH_COOKIE_NAME, USER_ROLES, type UserRole } from "@/lib/constants";
import { type SessionPayload, verifySessionToken } from "@/lib/auth";
import { AppError } from "@/lib/errors";

export function requireSession(request: NextRequest): SessionPayload {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    throw new AppError("Unauthorized", 401);
  }

  return verifySessionToken(token);
}

export function requireSessionRole(
  request: NextRequest,
  allowedRoles: UserRole[],
): SessionPayload {
  const session = requireSession(request);
  if (!allowedRoles.includes(session.role)) {
    throw new AppError("Forbidden", 403);
  }
  return session;
}

/**
 * Requires a session with one of the allowed roles AND validates that the
 * user belongs to the tenant specified in the URL (or query).
 * SUPER_ADMIN bypasses the tenant check.
 */
export function requireTenantAccess(
  request: NextRequest,
  allowedRoles: UserRole[],
  urlTenantId?: string,
): SessionPayload {
  const session = requireSessionRole(request, allowedRoles);

  if (session.role === "super_admin") {
    return session;
  }

  if (urlTenantId && session.tenantId !== urlTenantId) {
    throw new AppError("Cross-tenant access is not allowed", 403);
  }

  return session;
}

export function isValidRole(value: string): value is UserRole {
  return (USER_ROLES as readonly string[]).includes(value);
}
