import crypto from "crypto";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

import { CSRF_COOKIE_NAME, CSRF_HEADER_NAME } from "@/lib/constants";
import { isProduction } from "@/lib/env";
import { AppError } from "@/lib/errors";

const csrfCookieOptions = {
  httpOnly: false,
  secure: isProduction,
  sameSite: "strict" as const,
  path: "/",
  maxAge: 60 * 60,
};

export async function getOrCreateCsrfToken(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(CSRF_COOKIE_NAME)?.value;

  if (existing) {
    return existing;
  }

  const generated = crypto.randomBytes(32).toString("hex");
  cookieStore.set(CSRF_COOKIE_NAME, generated, csrfCookieOptions);
  return generated;
}

export async function validateCsrf(request: NextRequest): Promise<void> {
  const method = request.method.toUpperCase();
  if (["GET", "HEAD", "OPTIONS"].includes(method)) {
    return;
  }

  const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;
  const headerToken = request.headers.get(CSRF_HEADER_NAME);

  if (!cookieToken || !headerToken) {
    throw new AppError("Invalid CSRF token", 403);
  }

  const isMatch =
    cookieToken.length === headerToken.length &&
    crypto.timingSafeEqual(Buffer.from(cookieToken), Buffer.from(headerToken));

  if (!isMatch) {
    throw new AppError("Invalid CSRF token", 403);
  }
}

export function getCsrfCookieOptions() {
  return csrfCookieOptions;
}
