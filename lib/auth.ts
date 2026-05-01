import bcrypt from "bcryptjs";
import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";
import { cookies } from "next/headers";

import { AUTH_COOKIE_NAME, USER_ROLES, type UserRole } from "@/lib/constants";
import { env, isProduction } from "@/lib/env";
import { AppError } from "@/lib/errors";

export type { UserRole };

export type SessionPayload = {
  sub: string;
  role: UserRole;
  email: string;
  tenantId: string | null;
};

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signSessionToken(payload: SessionPayload): string {
  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
    issuer: "insight-hub",
  };

  return jwt.sign(payload, env.JWT_SECRET, options);
}

export function verifySessionToken(token: string): SessionPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, {
      issuer: "insight-hub",
    }) as JwtPayload;

    if (
      typeof decoded.sub !== "string" ||
      typeof decoded.role !== "string" ||
      typeof decoded.email !== "string"
    ) {
      throw new AppError("Invalid session", 401);
    }

    if (!(USER_ROLES as readonly string[]).includes(decoded.role)) {
      throw new AppError("Invalid session role", 401);
    }

    return {
      sub: decoded.sub,
      role: decoded.role as UserRole,
      email: decoded.email,
      tenantId: typeof decoded.tenantId === "string" ? decoded.tenantId : null,
    };
  } catch {
    throw new AppError("Unauthorized", 401);
  }
}

export function getAuthCookieOptions() {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict" as const,
    path: "/",
    maxAge: 60 * 15,
  };
}

export async function getSessionFromCookies(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    return verifySessionToken(token);
  } catch {
    return null;
  }
}

export function requireRole(
  userRole: UserRole,
  allowedRoles: UserRole[],
): void {
  if (!allowedRoles.includes(userRole)) {
    throw new AppError("Forbidden", 403);
  }
}
