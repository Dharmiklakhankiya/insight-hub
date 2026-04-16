import { type NextRequest } from "next/server";

import {
  AUTH_COOKIE_NAME,
  USER_ROLES,
} from "@/lib/constants";
import {
  type SessionPayload,
  type UserRole,
  verifySessionToken,
} from "@/lib/auth";
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

export function isValidRole(value: string): value is UserRole {
  return USER_ROLES.includes(value as (typeof USER_ROLES)[number]);
}
