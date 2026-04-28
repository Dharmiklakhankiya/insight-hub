import { describe, expect, it, vi } from "vitest";

import { AppError } from "@/lib/errors";
import {
  caseCreateSchema,
  caseUpdateSchema,
  documentMetaSchema,
  documentTagQuerySchema,
  loginSchema,
  objectIdSchema,
  registerSchema,
  safeText,
  searchQuerySchema,
  assertUploadFile,
  isoDateSchema,
  CaseModel,
  DocumentModel,
  UserModel,
} from "./validators-models-proxy.test-imports";

// The import aggregation above keeps this file concise while still executing all source modules.

describe("validators", () => {
  it("validates object identifiers and safe text", () => {
    expect(objectIdSchema.parse("507f1f77bcf86cd799439011")).toBe(
      "507f1f77bcf86cd799439011",
    );
    expect(() => objectIdSchema.parse("bad-id")).toThrow(
      "Invalid identifier format",
    );

    const nameSchema = safeText("name", 2, 20);
    expect(nameSchema.parse("  Neha   Singh ")).toBe("Neha Singh");
    expect(() => nameSchema.parse("javascript:1")).toThrow(
      "name contains unsafe content",
    );

    expect(isoDateSchema.parse("2026-01-01")).toBe("2026-01-01");
    expect(() => isoDateSchema.parse("not-a-date")).toThrow("Invalid date");
  });

  it("validates auth schemas", () => {
    const registered = registerSchema.parse({
      name: "Aarav Mehta",
      email: "aarav@example.com",
      password: "StrongPass123",
    });
    expect(registered.role).toBe("clerk");

    expect(() =>
      registerSchema.parse({
        name: "A",
        email: "bad",
        password: "weak",
      }),
    ).toThrow();

    expect(loginSchema.parse({ email: "x@y.com", password: "abc" })).toEqual({
      email: "x@y.com",
      password: "abc",
    });
    expect(() =>
      loginSchema.parse({ email: "bad-email", password: "" }),
    ).toThrow();
  });

  it("validates case, search, and document schemas", () => {
    const baseCase = {
      title: "Corporate Breach",
      client_name: "Vikram Patel",
      case_type: "Commercial",
      court: "Mumbai High Court",
      judge: "Justice Menon",
      status: "ongoing" as const,
      assigned_lawyers: ["Neha Singh"],
      filing_date: "2026-04-12",
      closing_date: null,
      timeline: [
        { type: "filing" as const, date: "2026-04-12", note: "Case filed" },
      ],
    };

    expect(caseCreateSchema.parse(baseCase).title).toBe("Corporate Breach");

    expect(
      caseCreateSchema.parse({ ...baseCase, closing_date: "2026-04-20" })
        .closing_date,
    ).toBe("2026-04-20");

    expect(() =>
      caseCreateSchema.parse({ ...baseCase, closing_date: "2026-01-01" }),
    ).toThrow("closing_date must be after filing_date");

    expect(caseUpdateSchema.parse({ status: "closed" })).toEqual({
      status: "closed",
      timeline: [],
    });
    expect(
      caseUpdateSchema.parse({
        filing_date: "2026-01-01",
        closing_date: "2026-02-01",
      }),
    ).toEqual({
      filing_date: "2026-01-01",
      closing_date: "2026-02-01",
      timeline: [],
    });
    expect(() =>
      caseUpdateSchema.parse({
        filing_date: "2026-10-01",
        closing_date: "2026-01-01",
      }),
    ).toThrow("closing_date must be after filing_date");

    const searchDefaults = searchQuerySchema.parse({});
    expect(searchDefaults).toMatchObject({
      page: 1,
      limit: 10,
      sortOrder: "desc",
    });

    expect(
      searchQuerySchema.parse({ page: "2", limit: "5", sortOrder: "asc" }),
    ).toMatchObject({
      page: 2,
      limit: 5,
      sortOrder: "asc",
    });

    expect(
      documentMetaSchema.parse({
        case_id: "507f1f77bcf86cd799439011",
        tags: ["evidence"],
      }),
    ).toMatchObject({ tags: ["evidence"] });

    expect(documentTagQuerySchema.parse({ tag: "brief" }).tag).toBe("brief");
  });

  it("enforces upload file constraints", () => {
    const valid = new File(["pdf"], "brief.pdf", { type: "application/pdf" });
    expect(() => assertUploadFile(valid)).not.toThrow();

    const badType = new File(["x"], "bad.txt", { type: "text/plain" });
    expect(() => assertUploadFile(badType)).toThrowError(AppError);

    const oversized = new File(
      [new Uint8Array(10 * 1024 * 1024 + 1)],
      "large.pdf",
      {
        type: "application/pdf",
      },
    );
    expect(() => assertUploadFile(oversized)).toThrowError(AppError);
  });
});

describe("models and middleware", () => {
  it("loads mongoose models and their schema metadata", () => {
    expect(CaseModel.modelName).toBe("Case");
    expect(DocumentModel.modelName).toBe("Document");
    expect(UserModel.modelName).toBe("User");

    expect(CaseModel.schema.path("title")).toBeDefined();
    expect(DocumentModel.schema.path("mime_type")).toBeDefined();
    expect(UserModel.schema.path("email")).toBeDefined();

    const caseIndexes = CaseModel.schema.indexes();
    expect(caseIndexes.some((entry) => "title" in entry[0])).toBe(true);

    const caseLawyerValidator = (
      CaseModel.schema.path("assigned_lawyers") as any as {
        options: { validate: { validator: (values: string[]) => boolean } };
      }
    ).options.validate.validator;
    expect(caseLawyerValidator(["Neha Singh"])).toBe(true);
    expect(caseLawyerValidator([])).toBe(false);

    const documentTagValidator = (
      DocumentModel.schema.path("tags") as any as {
        options: { validate: { validator: (values: string[]) => boolean } };
      }
    ).options.validate.validator;
    expect(documentTagValidator(["evidence"])).toBe(true);
    expect(documentTagValidator([])).toBe(false);
  });

  it("evaluates proxy middleware authorization decisions", async () => {
    vi.doMock("@/lib/auth", () => ({ verifySessionToken: vi.fn() }));
    const { proxy, config } = await import("@/proxy");
    const { verifySessionToken } = await import("@/lib/auth");
    const verifyMock = vi.mocked(verifySessionToken);

    const unauthorizedApi = proxy({
      nextUrl: { pathname: "/api/cases" },
      url: "http://localhost:3000/api/cases",
      cookies: { get: () => undefined },
    } as never);
    expect(unauthorizedApi.status).toBe(401);

    const unauthorizedPage = proxy({
      nextUrl: { pathname: "/dashboard" },
      url: "http://localhost:3000/dashboard",
      cookies: { get: () => undefined },
    } as never);
    expect(unauthorizedPage.status).toBe(307);
    expect(unauthorizedPage.headers.get("location")).toContain(
      "/login?next=%2Fdashboard",
    );

    verifyMock.mockImplementation(() => {
      throw new Error("bad token");
    });
    const invalidApi = proxy({
      nextUrl: { pathname: "/api/search" },
      url: "http://localhost:3000/api/search",
      cookies: { get: () => ({ value: "invalid" }) },
    } as never);
    expect(invalidApi.status).toBe(401);

    const invalidPage = proxy({
      nextUrl: { pathname: "/dashboard" },
      url: "http://localhost:3000/dashboard",
      cookies: { get: () => ({ value: "invalid" }) },
    } as never);
    expect(invalidPage.status).toBe(307);
    expect(invalidPage.headers.get("location")).toContain(
      "/login?next=%2Fdashboard",
    );

    verifyMock.mockReturnValue({
      sub: "1",
      role: "admin",
      email: "a@b.com",
    } as never);
    const allowed = proxy({
      nextUrl: { pathname: "/cases" },
      url: "http://localhost:3000/cases",
      cookies: { get: () => ({ value: "good" }) },
    } as never);
    expect(allowed.headers.get("x-middleware-next")).toBe("1");

    expect(config.matcher).toContain("/dashboard/:path*");
  });
});
