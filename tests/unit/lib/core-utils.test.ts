import { z } from "zod";
import { describe, expect, it, beforeEach, vi } from "vitest";

import {
  ALLOWED_UPLOAD_MIME_TYPES,
  AUTH_COOKIE_NAME,
  CASE_STATUSES,
  CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME,
  MAX_UPLOAD_BYTES,
  TIMELINE_EVENT_TYPES,
  USER_ROLES,
} from "@/lib/constants";
import { AppError, isAppError } from "@/lib/errors";
import { parseJsonBody, parseQuery } from "@/lib/request";
import { checkRateLimit, resetRateLimitStore } from "@/lib/rate-limit";
import { hasSuspiciousContent, sanitizeText } from "@/lib/sanitize";

describe("constants", () => {
  it("exports immutable system constants", () => {
    expect(USER_ROLES).toEqual(["admin", "lawyer", "clerk"]);
    expect(CASE_STATUSES).toEqual(["ongoing", "closed", "pending"]);
    expect(TIMELINE_EVENT_TYPES).toEqual([
      "filing",
      "hearing",
      "adjournment",
      "judgment",
    ]);
    expect(AUTH_COOKIE_NAME).toBe("insight_hub_auth");
    expect(CSRF_COOKIE_NAME).toBe("insight_hub_csrf");
    expect(CSRF_HEADER_NAME).toBe("x-csrf-token");
    expect(ALLOWED_UPLOAD_MIME_TYPES).toContain("application/pdf");
    expect(MAX_UPLOAD_BYTES).toBe(10 * 1024 * 1024);
  });
});

describe("AppError", () => {
  it("creates typed errors and detects them", () => {
    const error = new AppError("boom", 418, { reason: "teapot" });
    expect(error.message).toBe("boom");
    expect(error.name).toBe("AppError");
    expect(error.statusCode).toBe(418);
    expect(error.details).toEqual({ reason: "teapot" });
    expect(isAppError(error)).toBe(true);
    expect(isAppError(new Error("x"))).toBe(false);
  });
});

describe("sanitize", () => {
  it("detects suspicious content and normalizes safe text", () => {
    expect(hasSuspiciousContent("<script>alert(1)</script>")).toBe(true);
    expect(hasSuspiciousContent("javascript:alert(1)")).toBe(true);
    expect(hasSuspiciousContent('{"$ne":""}')).toBe(true);
    expect(hasSuspiciousContent("../../etc/passwd")).toBe(true);
    expect(hasSuspiciousContent("Legitimate filing note")).toBe(false);

    expect(sanitizeText("   hello    world   ")).toBe("hello world");
  });
});

describe("request parsing", () => {
  it("parses JSON body and validates query objects", async () => {
    const schema = z.object({ name: z.string() }).strict();
    const request = new Request("http://localhost:3000", {
      method: "POST",
      body: JSON.stringify({ name: "Neha" }),
    });

    await expect(parseJsonBody(request, schema)).resolves.toEqual({
      name: "Neha",
    });

    const querySchema = z.object({ page: z.coerce.number().int() }).strict();
    const parsed = parseQuery(
      new URLSearchParams([["page", "2"]]),
      querySchema,
    );
    expect(parsed.page).toBe(2);
  });

  it("throws AppError for malformed JSON", async () => {
    const request = new Request("http://localhost:3000", {
      method: "POST",
      body: "{",
      headers: { "Content-Type": "application/json" },
    });

    await expect(parseJsonBody(request, z.object({}))).rejects.toMatchObject({
      message: "Malformed JSON body",
      statusCode: 400,
    });
  });
});

describe("rate limiting", () => {
  beforeEach(() => {
    resetRateLimitStore();
    vi.restoreAllMocks();
  });

  it("allows requests within budget and identifies client IP by forwarding headers", () => {
    const request = {
      headers: new Headers({ "x-forwarded-for": "10.1.1.1, 10.2.2.2" }),
    } as never;

    checkRateLimit(request, "auth", 2, 1000);
    checkRateLimit(request, "auth", 2, 1000);

    expect(() => checkRateLimit(request, "auth", 2, 1000)).toThrowError(
      "Too many requests",
    );
  });

  it("falls back to x-real-ip and unknown IP, and resets after window expiration", () => {
    const nowSpy = vi.spyOn(Date, "now");
    nowSpy
      .mockReturnValueOnce(1000)
      .mockReturnValueOnce(1001)
      .mockReturnValueOnce(2100);

    const realIpRequest = {
      headers: new Headers({ "x-real-ip": "127.0.0.1" }),
    } as never;

    checkRateLimit(realIpRequest, "cases", 1, 1000);
    expect(() => checkRateLimit(realIpRequest, "cases", 1, 1000)).toThrowError(
      "Too many requests",
    );

    checkRateLimit(realIpRequest, "cases", 1, 1000);

    const unknownRequest = { headers: new Headers() } as never;
    checkRateLimit(unknownRequest, "search", 1, 1000);
  });
});
