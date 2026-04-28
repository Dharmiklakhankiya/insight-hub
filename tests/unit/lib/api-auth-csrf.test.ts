import jwt from "jsonwebtoken";
import { z } from "zod";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  AUTH_COOKIE_NAME,
  CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME,
} from "@/lib/constants";
import { AppError } from "@/lib/errors";

const cookiesMock = vi.hoisted(() => vi.fn());

vi.mock("next/headers", () => ({
  cookies: cookiesMock,
}));

import {
  assert,
  errorResponse,
  successResponse,
  validationErrorResponse,
} from "@/lib/api";
import {
  isValidRole,
  requireSession,
  requireSessionRole,
} from "@/lib/api-auth";
import {
  comparePassword,
  getAuthCookieOptions,
  getSessionFromCookies,
  hashPassword,
  requireRole,
  signSessionToken,
  verifySessionToken,
} from "@/lib/auth";
import { env } from "@/lib/env";
import {
  getCsrfCookieOptions,
  getOrCreateCsrfToken,
  validateCsrf,
} from "@/lib/csrf";

describe("api helpers", () => {
  it("creates success and validation responses", async () => {
    const ok = successResponse({ done: true }, 201);
    expect(ok.status).toBe(201);
    await expect(ok.json()).resolves.toEqual({ done: true });

    const err = z.object({ name: z.string().min(2) }).safeParse({ name: "a" });
    if (err.success) throw new Error("expected validation failure");

    const validation = validationErrorResponse(err.error);
    expect(validation.status).toBe(400);
    await expect(validation.json()).resolves.toMatchObject({
      error: "Validation failed",
    });

    const rootIssueResult = z
      .object({})
      .refine(() => false, { message: "root issue" })
      .safeParse({});
    if (rootIssueResult.success)
      throw new Error("expected root validation failure");

    const rootValidation = validationErrorResponse(rootIssueResult.error);
    await expect(rootValidation.json()).resolves.toMatchObject({
      details: [{ field: "root", message: "root issue" }],
    });
  });

  it("handles AppError, ZodError, and unknown errors", async () => {
    const zodResult = z
      .object({ id: z.string().uuid() })
      .safeParse({ id: "bad" });
    if (zodResult.success) throw new Error("expected zod failure");

    const zodResponse = errorResponse(zodResult.error);
    expect(zodResponse.status).toBe(400);

    const appError = new AppError("forbidden", 403, { reason: "role" });
    const appResponse = errorResponse(appError);
    expect(appResponse.status).toBe(403);
    await expect(appResponse.json()).resolves.toEqual({
      error: "forbidden",
      details: { reason: "role" },
    });

    const appErrorWithoutDetails = errorResponse(
      new AppError("bad request", 400),
    );
    await expect(appErrorWithoutDetails.json()).resolves.toEqual({
      error: "bad request",
      details: null,
    });

    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const unknownResponse = errorResponse(new Error("boom"));
    expect(unknownResponse.status).toBe(500);
    await expect(unknownResponse.json()).resolves.toEqual({
      error: "Internal server error",
    });
    expect(consoleSpy).toHaveBeenCalled();
  });

  it("assert helper enforces conditions", () => {
    expect(() => assert(true, "ok")).not.toThrow();
    expect(() => assert(false, "bad", 422)).toThrowError("bad");
  });
});

describe("auth and api-auth", () => {
  beforeEach(() => {
    cookiesMock.mockReset();
  });

  it("hashes and verifies passwords", async () => {
    const hash = await hashPassword("StrongPass123");
    expect(hash).not.toBe("StrongPass123");
    await expect(comparePassword("StrongPass123", hash)).resolves.toBe(true);
    await expect(comparePassword("WrongPass123", hash)).resolves.toBe(false);
  });

  it("signs and verifies valid session tokens", () => {
    const token = signSessionToken({
      sub: "user-1",
      role: "lawyer",
      email: "lawyer@example.com",
    });

    expect(verifySessionToken(token)).toEqual({
      sub: "user-1",
      role: "lawyer",
      email: "lawyer@example.com",
    });
  });

  it("rejects invalid tokens and roles", () => {
    const malformed = jwt.sign(
      { sub: "x", role: "invalid", email: "x@example.com" },
      env.JWT_SECRET,
      { issuer: "insight-hub" },
    );

    expect(() => verifySessionToken(malformed)).toThrowError("Unauthorized");

    const missingEmail = jwt.sign({ sub: "x", role: "admin" }, env.JWT_SECRET, {
      issuer: "insight-hub",
    });

    expect(() => verifySessionToken(missingEmail)).toThrowError("Unauthorized");
    expect(() => verifySessionToken("not-a-jwt")).toThrowError("Unauthorized");
  });

  it("returns cookie session when available and null when absent/invalid", async () => {
    const token = signSessionToken({
      sub: "user-2",
      role: "admin",
      email: "admin@example.com",
    });

    cookiesMock.mockResolvedValueOnce({
      get: (name: string) =>
        name === AUTH_COOKIE_NAME ? { value: token } : undefined,
    });
    await expect(getSessionFromCookies()).resolves.toEqual({
      sub: "user-2",
      role: "admin",
      email: "admin@example.com",
    });

    cookiesMock.mockResolvedValueOnce({ get: () => undefined });
    await expect(getSessionFromCookies()).resolves.toBeNull();

    cookiesMock.mockResolvedValueOnce({
      get: () => ({ value: "bad-token" }),
    });
    await expect(getSessionFromCookies()).resolves.toBeNull();
  });

  it("exposes auth cookie options and enforces role checks", () => {
    const options = getAuthCookieOptions();
    expect(options.httpOnly).toBe(true);
    expect(options.sameSite).toBe("strict");
    expect(options.maxAge).toBe(900);

    expect(() => requireRole("lawyer", ["lawyer", "admin"])).not.toThrow();
    expect(() => requireRole("clerk", ["admin"])).toThrowError("Forbidden");
  });

  it("requires request session token and allowed roles", () => {
    const token = signSessionToken({
      sub: "user-3",
      role: "clerk",
      email: "clerk@example.com",
    });

    const request = {
      cookies: {
        get: (name: string) =>
          name === AUTH_COOKIE_NAME ? { value: token } : undefined,
      },
    } as never;

    expect(requireSession(request)).toMatchObject({ sub: "user-3" });
    expect(requireSessionRole(request, ["clerk"]).role).toBe("clerk");
    expect(() => requireSessionRole(request, ["admin"])).toThrowError(
      "Forbidden",
    );

    const unauthorizedRequest = {
      cookies: {
        get: () => undefined,
      },
    } as never;
    expect(() => requireSession(unauthorizedRequest)).toThrowError(
      "Unauthorized",
    );

    expect(isValidRole("admin")).toBe(true);
    expect(isValidRole("guest")).toBe(false);
  });
});

describe("csrf", () => {
  beforeEach(() => {
    cookiesMock.mockReset();
  });

  it("returns existing token or creates and stores a new token", async () => {
    const setCookie = vi.fn();
    cookiesMock.mockResolvedValueOnce({
      get: (name: string) =>
        name === CSRF_COOKIE_NAME ? { value: "existing-token" } : undefined,
      set: setCookie,
    });

    await expect(getOrCreateCsrfToken()).resolves.toBe("existing-token");
    expect(setCookie).not.toHaveBeenCalled();

    cookiesMock.mockResolvedValueOnce({
      get: () => undefined,
      set: setCookie,
    });

    const token = await getOrCreateCsrfToken();
    expect(token).toHaveLength(64);
    expect(setCookie).toHaveBeenCalledWith(
      CSRF_COOKIE_NAME,
      token,
      expect.objectContaining({ sameSite: "strict" }),
    );
  });

  it("validates CSRF tokens for mutation methods", async () => {
    const readonlyRequest = {
      method: "GET",
      cookies: { get: () => undefined },
      headers: new Headers(),
    } as never;
    await expect(validateCsrf(readonlyRequest)).resolves.toBeUndefined();

    const missingToken = {
      method: "POST",
      cookies: { get: () => undefined },
      headers: new Headers(),
    } as never;
    await expect(validateCsrf(missingToken)).rejects.toMatchObject({
      message: "Invalid CSRF token",
      statusCode: 403,
    });

    const mismatch = {
      method: "PATCH",
      cookies: { get: () => ({ value: "abc" }) },
      headers: new Headers({ [CSRF_HEADER_NAME]: "abcd" }),
    } as never;
    await expect(validateCsrf(mismatch)).rejects.toMatchObject({
      message: "Invalid CSRF token",
      statusCode: 403,
    });

    const valid = {
      method: "DELETE",
      cookies: { get: () => ({ value: "same-token" }) },
      headers: new Headers({ [CSRF_HEADER_NAME]: "same-token" }),
    } as never;
    await expect(validateCsrf(valid)).resolves.toBeUndefined();
  });

  it("exposes csrf cookie options", () => {
    expect(getCsrfCookieOptions()).toEqual(
      expect.objectContaining({
        httpOnly: false,
        sameSite: "strict",
        maxAge: 3600,
      }),
    );
  });
});
