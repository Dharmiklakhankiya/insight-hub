import { beforeEach, describe, expect, it, vi } from "vitest";

const handleAnalyticsMock = vi.hoisted(() => vi.fn());
const handleLoginMock = vi.hoisted(() => vi.fn());
const handleLogoutMock = vi.hoisted(() => vi.fn());
const handleMeMock = vi.hoisted(() => vi.fn());
const handleRegisterMock = vi.hoisted(() => vi.fn());
const handleCreateCaseMock = vi.hoisted(() => vi.fn());
const handleListCasesMock = vi.hoisted(() => vi.fn());
const handleGetCaseByIdMock = vi.hoisted(() => vi.fn());
const handleUpdateCaseMock = vi.hoisted(() => vi.fn());
const handleDeleteCaseMock = vi.hoisted(() => vi.fn());
const handleListDocumentsMock = vi.hoisted(() => vi.fn());
const handleUploadDocumentMock = vi.hoisted(() => vi.fn());
const handleSearchCasesMock = vi.hoisted(() => vi.fn());
const getOrCreateCsrfTokenMock = vi.hoisted(() => vi.fn());
const successResponseMock = vi.hoisted(() => vi.fn());
const errorResponseMock = vi.hoisted(() => vi.fn());

vi.mock("@/controllers/analytics.controller", () => ({
  handleAnalytics: handleAnalyticsMock,
}));
vi.mock("@/controllers/auth.controller", () => ({
  handleLogin: handleLoginMock,
  handleLogout: handleLogoutMock,
  handleMe: handleMeMock,
  handleRegister: handleRegisterMock,
}));
vi.mock("@/controllers/case.controller", () => ({
  handleCreateCase: handleCreateCaseMock,
  handleListCases: handleListCasesMock,
  handleGetCaseById: handleGetCaseByIdMock,
  handleUpdateCase: handleUpdateCaseMock,
  handleDeleteCase: handleDeleteCaseMock,
}));
vi.mock("@/controllers/document.controller", () => ({
  handleListDocuments: handleListDocumentsMock,
  handleUploadDocument: handleUploadDocumentMock,
}));
vi.mock("@/controllers/search.controller", () => ({
  handleSearchCases: handleSearchCasesMock,
}));
vi.mock("@/lib/csrf", () => ({
  getOrCreateCsrfToken: getOrCreateCsrfTokenMock,
}));
vi.mock("@/lib/api", () => ({
  successResponse: successResponseMock,
  errorResponse: errorResponseMock,
}));

import * as analyticsRoute from "@/app/api/analytics/route";
import * as authLoginRoute from "@/app/api/auth/login/route";
import * as authLogoutRoute from "@/app/api/auth/logout/route";
import * as authMeRoute from "@/app/api/auth/me/route";
import * as authRegisterRoute from "@/app/api/auth/register/route";
import * as casesRoute from "@/app/api/cases/route";
import * as caseByIdRoute from "@/app/api/cases/[id]/route";
import * as caseDocumentsRoute from "@/app/api/cases/[id]/documents/route";
import * as csrfRoute from "@/app/api/csrf/route";
import * as searchRoute from "@/app/api/search/route";

describe("API routes integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    handleAnalyticsMock.mockResolvedValue({ ok: true });
    handleLoginMock.mockResolvedValue({ ok: true });
    handleLogoutMock.mockResolvedValue({ ok: true });
    handleMeMock.mockResolvedValue({ ok: true });
    handleRegisterMock.mockResolvedValue({ ok: true });
    handleCreateCaseMock.mockResolvedValue({ ok: true });
    handleListCasesMock.mockResolvedValue({ ok: true });
    handleGetCaseByIdMock.mockResolvedValue({ ok: true });
    handleUpdateCaseMock.mockResolvedValue({ ok: true });
    handleDeleteCaseMock.mockResolvedValue({ ok: true });
    handleListDocumentsMock.mockResolvedValue({ ok: true });
    handleUploadDocumentMock.mockResolvedValue({ ok: true });
    handleSearchCasesMock.mockResolvedValue({ ok: true });
    getOrCreateCsrfTokenMock.mockResolvedValue("csrf-token");
    successResponseMock.mockReturnValue({ ok: true });
    errorResponseMock.mockReturnValue({ error: true });
  });

  it("uses force-dynamic strategy for all handlers", () => {
    expect(analyticsRoute.dynamic).toBe("force-dynamic");
    expect(authLoginRoute.dynamic).toBe("force-dynamic");
    expect(authLogoutRoute.dynamic).toBe("force-dynamic");
    expect(authMeRoute.dynamic).toBe("force-dynamic");
    expect(authRegisterRoute.dynamic).toBe("force-dynamic");
    expect(casesRoute.dynamic).toBe("force-dynamic");
    expect(caseByIdRoute.dynamic).toBe("force-dynamic");
    expect(caseDocumentsRoute.dynamic).toBe("force-dynamic");
    expect(csrfRoute.dynamic).toBe("force-dynamic");
    expect(searchRoute.dynamic).toBe("force-dynamic");
  });

  it("delegates all auth/analytics/search route calls to controllers", async () => {
    const request = { url: "http://localhost:3000" } as never;

    await analyticsRoute.GET(request);
    expect(handleAnalyticsMock).toHaveBeenCalledWith(request);

    await authLoginRoute.POST(request);
    expect(handleLoginMock).toHaveBeenCalledWith(request);

    await authLogoutRoute.POST(request);
    expect(handleLogoutMock).toHaveBeenCalledWith(request);

    await authMeRoute.GET(request);
    expect(handleMeMock).toHaveBeenCalledWith(request);

    await authRegisterRoute.POST(request);
    expect(handleRegisterMock).toHaveBeenCalledWith(request);

    await searchRoute.GET(request);
    expect(handleSearchCasesMock).toHaveBeenCalledWith(request);
  });

  it("delegates case routes and resolves dynamic params", async () => {
    const request = { url: "http://localhost:3000" } as never;
    const context = {
      params: Promise.resolve({ id: "507f1f77bcf86cd799439011" }),
    };

    await casesRoute.GET(request);
    expect(handleListCasesMock).toHaveBeenCalledWith(request);

    await casesRoute.POST(request);
    expect(handleCreateCaseMock).toHaveBeenCalledWith(request);

    await caseByIdRoute.GET(request, context);
    expect(handleGetCaseByIdMock).toHaveBeenCalledWith(
      request,
      "507f1f77bcf86cd799439011",
    );

    await caseByIdRoute.PATCH(request, context);
    expect(handleUpdateCaseMock).toHaveBeenCalledWith(
      request,
      "507f1f77bcf86cd799439011",
    );

    await caseByIdRoute.DELETE(request, context);
    expect(handleDeleteCaseMock).toHaveBeenCalledWith(
      request,
      "507f1f77bcf86cd799439011",
    );

    await caseDocumentsRoute.GET(request, context);
    expect(handleListDocumentsMock).toHaveBeenCalledWith(
      request,
      "507f1f77bcf86cd799439011",
    );

    await caseDocumentsRoute.POST(request, context);
    expect(handleUploadDocumentMock).toHaveBeenCalledWith(
      request,
      "507f1f77bcf86cd799439011",
    );
  });

  it("handles csrf route success and error branches", async () => {
    await csrfRoute.GET();
    expect(getOrCreateCsrfTokenMock).toHaveBeenCalled();
    expect(successResponseMock).toHaveBeenCalledWith({
      csrfToken: "csrf-token",
    });

    getOrCreateCsrfTokenMock.mockRejectedValueOnce(new Error("csrf failure"));
    await csrfRoute.GET();
    expect(errorResponseMock).toHaveBeenCalled();
  });
});
