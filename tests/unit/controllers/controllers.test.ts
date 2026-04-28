import { beforeEach, describe, expect, it, vi } from "vitest";

const successResponseMock = vi.hoisted(() => vi.fn());
const errorResponseMock = vi.hoisted(() => vi.fn());

const requireSessionRoleMock = vi.hoisted(() => vi.fn());
const requireSessionMock = vi.hoisted(() => vi.fn());

const validateCsrfMock = vi.hoisted(() => vi.fn());
const getOrCreateCsrfTokenMock = vi.hoisted(() => vi.fn());
const parseJsonBodyMock = vi.hoisted(() => vi.fn());
const parseQueryMock = vi.hoisted(() => vi.fn());
const checkRateLimitMock = vi.hoisted(() => vi.fn());

const registerUserMock = vi.hoisted(() => vi.fn());
const loginUserMock = vi.hoisted(() => vi.fn());
const getUserByIdMock = vi.hoisted(() => vi.fn());

const listCasesMock = vi.hoisted(() => vi.fn());
const createCaseMock = vi.hoisted(() => vi.fn());
const getCaseByIdMock = vi.hoisted(() => vi.fn());
const updateCaseMock = vi.hoisted(() => vi.fn());
const deleteCaseMock = vi.hoisted(() => vi.fn());

const listDocumentsByCaseMock = vi.hoisted(() => vi.fn());
const uploadDocumentMock = vi.hoisted(() => vi.fn());
const searchCasesMock = vi.hoisted(() => vi.fn());
const getAnalyticsSummaryMock = vi.hoisted(() => vi.fn());

const assertUploadFileMock = vi.hoisted(() => vi.fn());
const documentMetaParseMock = vi.hoisted(() => vi.fn());
const documentTagQueryParseMock = vi.hoisted(() => vi.fn());

const getAuthCookieOptionsMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/api", () => ({
  successResponse: successResponseMock,
  errorResponse: errorResponseMock,
}));
vi.mock("@/lib/api-auth", () => ({
  requireSessionRole: requireSessionRoleMock,
  requireSession: requireSessionMock,
}));
vi.mock("@/lib/csrf", () => ({
  validateCsrf: validateCsrfMock,
  getOrCreateCsrfToken: getOrCreateCsrfTokenMock,
}));
vi.mock("@/lib/request", () => ({
  parseJsonBody: parseJsonBodyMock,
  parseQuery: parseQueryMock,
}));
vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: checkRateLimitMock,
}));
vi.mock("@/services/auth.service", () => ({
  registerUser: registerUserMock,
  loginUser: loginUserMock,
  getUserById: getUserByIdMock,
}));
vi.mock("@/services/case.service", () => ({
  listCases: listCasesMock,
  createCase: createCaseMock,
  getCaseById: getCaseByIdMock,
  updateCase: updateCaseMock,
  deleteCase: deleteCaseMock,
}));
vi.mock("@/services/document.service", () => ({
  listDocumentsByCase: listDocumentsByCaseMock,
  uploadDocument: uploadDocumentMock,
}));
vi.mock("@/services/search.service", () => ({ searchCases: searchCasesMock }));
vi.mock("@/services/analytics.service", () => ({
  getAnalyticsSummary: getAnalyticsSummaryMock,
}));
vi.mock("@/lib/validators/document.schema", () => ({
  assertUploadFile: assertUploadFileMock,
  documentMetaSchema: { parse: documentMetaParseMock },
  documentTagQuerySchema: { parse: documentTagQueryParseMock },
}));
vi.mock("@/lib/auth", () => ({
  getAuthCookieOptions: getAuthCookieOptionsMock,
}));

import { handleAnalytics } from "@/controllers/analytics.controller";
import {
  handleLogin,
  handleLogout,
  handleMe,
  handleRegister,
} from "@/controllers/auth.controller";
import {
  handleCreateCase,
  handleDeleteCase,
  handleGetCaseById,
  handleListCases,
  handleUpdateCase,
} from "@/controllers/case.controller";
import {
  handleListDocuments,
  handleUploadDocument,
} from "@/controllers/document.controller";
import { handleSearchCases } from "@/controllers/search.controller";

function makeMockResponse() {
  return {
    cookies: {
      set: vi.fn(),
    },
  };
}

describe("controllers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    successResponseMock.mockImplementation(() => makeMockResponse());
    errorResponseMock.mockImplementation((error) => ({ error }));
    getAuthCookieOptionsMock.mockReturnValue({
      httpOnly: true,
      path: "/",
      sameSite: "strict",
    });
  });

  it("handles analytics success and failure", async () => {
    getAnalyticsSummaryMock.mockResolvedValue({ totalCases: 1 });
    await handleAnalytics({} as never);
    expect(requireSessionRoleMock).toHaveBeenCalledWith({}, [
      "admin",
      "lawyer",
      "clerk",
    ]);
    expect(successResponseMock).toHaveBeenCalledWith({ totalCases: 1 });

    requireSessionRoleMock.mockImplementationOnce(() => {
      throw new Error("denied");
    });
    await handleAnalytics({} as never);
    expect(errorResponseMock).toHaveBeenCalled();
  });

  it("handles auth register/login/logout/me flows", async () => {
    parseJsonBodyMock.mockResolvedValueOnce({
      name: "N",
      email: "n@example.com",
    });
    registerUserMock.mockResolvedValueOnce({
      user: { id: "u1" },
      token: "jwt",
    });
    getOrCreateCsrfTokenMock.mockResolvedValueOnce("csrf");

    const registerResponse = (await handleRegister({} as never)) as ReturnType<
      typeof makeMockResponse
    >;
    expect(checkRateLimitMock).toHaveBeenCalledWith(
      {},
      "auth-register",
      20,
      15 * 60 * 1000,
    );
    expect(registerResponse.cookies.set).toHaveBeenCalled();

    parseJsonBodyMock.mockResolvedValueOnce({
      email: "n@example.com",
      password: "StrongPass123",
    });
    loginUserMock.mockResolvedValueOnce({
      user: { id: "u1" },
      token: "jwt-login",
    });
    getOrCreateCsrfTokenMock.mockResolvedValueOnce("csrf-login");

    const loginResponse = (await handleLogin({} as never)) as ReturnType<
      typeof makeMockResponse
    >;
    expect(checkRateLimitMock).toHaveBeenCalledWith(
      {},
      "auth-login",
      15,
      15 * 60 * 1000,
    );
    expect(loginResponse.cookies.set).toHaveBeenCalled();

    const logoutResponse = (await handleLogout({} as never)) as ReturnType<
      typeof makeMockResponse
    >;
    expect(validateCsrfMock).toHaveBeenCalled();
    expect(logoutResponse.cookies.set).toHaveBeenCalledTimes(2);

    requireSessionMock.mockReturnValue({ sub: "u1" });
    getUserByIdMock.mockResolvedValue({ id: "u1", email: "n@example.com" });
    await handleMe({} as never);
    expect(successResponseMock).toHaveBeenCalledWith({
      user: { id: "u1", email: "n@example.com" },
    });

    checkRateLimitMock.mockImplementationOnce(() => {
      throw new Error("rate limit");
    });
    await handleRegister({} as never);

    checkRateLimitMock.mockImplementationOnce(() => {
      throw new Error("login rate limit");
    });
    await handleLogin({} as never);

    validateCsrfMock.mockRejectedValueOnce(new Error("csrf fail"));
    await handleLogout({} as never);

    requireSessionMock.mockImplementationOnce(() => {
      throw new Error("no session");
    });
    await handleMe({} as never);

    expect(errorResponseMock).toHaveBeenCalled();
  });

  it("handles case controller flows", async () => {
    const request = { url: "http://localhost:3000/api/cases?page=1" } as never;

    parseQueryMock.mockReturnValue({ page: 1 });
    listCasesMock.mockResolvedValue({ items: [] });
    await handleListCases(request);
    expect(listCasesMock).toHaveBeenCalledWith({ page: 1 });

    validateCsrfMock.mockResolvedValue(undefined);
    requireSessionRoleMock.mockReturnValue({ sub: "u1" });
    parseJsonBodyMock.mockResolvedValue({ title: "Case" });
    createCaseMock.mockResolvedValue({ _id: "c1" });
    await handleCreateCase({} as never);
    expect(createCaseMock).toHaveBeenCalledWith({ title: "Case" }, "u1");

    getCaseByIdMock.mockResolvedValue({ _id: "c1" });
    await handleGetCaseById({} as never, "507f1f77bcf86cd799439011");

    updateCaseMock.mockResolvedValue({ _id: "c1", status: "closed" });
    parseJsonBodyMock.mockResolvedValue({ status: "closed" });
    await handleUpdateCase({} as never, "507f1f77bcf86cd799439011");

    deleteCaseMock.mockResolvedValue({});
    await handleDeleteCase({} as never, "507f1f77bcf86cd799439011");

    listCasesMock.mockRejectedValueOnce(new Error("failed"));
    await handleListCases(request);

    parseJsonBodyMock.mockRejectedValueOnce(new Error("invalid create body"));
    await handleCreateCase({} as never);

    await handleGetCaseById({} as never, "invalid-id");

    validateCsrfMock.mockRejectedValueOnce(new Error("csrf update"));
    await handleUpdateCase({} as never, "507f1f77bcf86cd799439011");

    validateCsrfMock.mockRejectedValueOnce(new Error("csrf delete"));
    await handleDeleteCase({} as never, "507f1f77bcf86cd799439011");

    expect(errorResponseMock).toHaveBeenCalled();
  });

  it("handles document controller list and upload paths", async () => {
    requireSessionRoleMock.mockReturnValue({ sub: "u1" });
    documentTagQueryParseMock.mockReturnValue({ tag: "evidence" });
    listDocumentsByCaseMock.mockResolvedValue([{ _id: "d1" }]);

    await handleListDocuments(
      {
        url: "http://localhost:3000/api/cases/1/documents?tag=evidence",
      } as never,
      "507f1f77bcf86cd799439011",
    );
    expect(listDocumentsByCaseMock).toHaveBeenCalledWith(
      "507f1f77bcf86cd799439011",
      "evidence",
    );

    documentTagQueryParseMock.mockReturnValueOnce({ tag: undefined });
    listDocumentsByCaseMock.mockResolvedValueOnce([]);
    await handleListDocuments(
      { url: "http://localhost:3000/api/cases/1/documents" } as never,
      "507f1f77bcf86cd799439011",
    );
    expect(documentTagQueryParseMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ tag: undefined }),
    );

    const noFileForm = new FormData();
    const noFileRequest = {
      formData: async () => noFileForm,
    } as never;
    await handleUploadDocument(noFileRequest, "507f1f77bcf86cd799439011");
    expect(successResponseMock).toHaveBeenCalledWith(
      expect.objectContaining({ error: "Validation failed" }),
      400,
    );

    const file = new File(["pdf"], "brief.pdf", { type: "application/pdf" });
    const uploadForm = new FormData();
    uploadForm.set("file", file);
    uploadForm.set("tags", '["evidence","affidavit"]');

    documentMetaParseMock.mockReturnValue({
      case_id: "507f1f77bcf86cd799439011",
      tags: ["evidence"],
    });
    uploadDocumentMock.mockResolvedValue({ _id: "d2" });

    await handleUploadDocument(
      { formData: async () => uploadForm } as never,
      "507f1f77bcf86cd799439011",
    );
    expect(assertUploadFileMock).toHaveBeenCalledWith(file);
    expect(uploadDocumentMock).toHaveBeenCalled();

    const invalidJsonTagsForm = new FormData();
    invalidJsonTagsForm.set("file", file);
    invalidJsonTagsForm.set("tags", "[invalid");
    await handleUploadDocument(
      { formData: async () => invalidJsonTagsForm } as never,
      "507f1f77bcf86cd799439011",
    );
    expect(documentMetaParseMock).toHaveBeenCalledWith(
      expect.objectContaining({ tags: [] }),
    );

    const emptyStringTagsForm = new FormData();
    emptyStringTagsForm.set("file", file);
    emptyStringTagsForm.set("tags", "   ");
    await handleUploadDocument(
      { formData: async () => emptyStringTagsForm } as never,
      "507f1f77bcf86cd799439011",
    );
    expect(documentMetaParseMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ tags: [] }),
    );

    const objectJsonTagsForm = new FormData();
    objectJsonTagsForm.set("file", file);
    objectJsonTagsForm.set("tags", '{"tag":"x"}');
    await handleUploadDocument(
      { formData: async () => objectJsonTagsForm } as never,
      "507f1f77bcf86cd799439011",
    );
    expect(documentMetaParseMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ tags: ['{"tag":"x"}'] }),
    );

    const commaTagsForm = new FormData();
    commaTagsForm.set("file", file);
    commaTagsForm.set("tags", "a,b");
    await handleUploadDocument(
      { formData: async () => commaTagsForm } as never,
      "507f1f77bcf86cd799439011",
    );
    expect(documentMetaParseMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ tags: ["a", "b"] }),
    );

    const nonStringTagsForm = new FormData();
    nonStringTagsForm.set("file", file);
    nonStringTagsForm.set(
      "tags",
      new File(["x"], "x.txt", { type: "text/plain" }),
    );
    await handleUploadDocument(
      { formData: async () => nonStringTagsForm } as never,
      "507f1f77bcf86cd799439011",
    );
    expect(documentMetaParseMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ tags: [] }),
    );

    uploadDocumentMock.mockRejectedValueOnce(new Error("save failed"));
    await handleUploadDocument(
      { formData: async () => uploadForm } as never,
      "507f1f77bcf86cd799439011",
    );

    listDocumentsByCaseMock.mockRejectedValueOnce(new Error("oops"));
    await handleListDocuments(
      { url: "http://localhost:3000/api/cases/1/documents" } as never,
      "bad-id",
    );
    expect(errorResponseMock).toHaveBeenCalled();
  });

  it("handles search controller success and failure", async () => {
    parseQueryMock.mockReturnValue({ query: "breach" });
    searchCasesMock.mockResolvedValue({ items: [{ _id: "c1" }] });

    await handleSearchCases({
      url: "http://localhost:3000/api/search?query=breach",
    } as never);
    expect(searchCasesMock).toHaveBeenCalledWith({ query: "breach" });

    searchCasesMock.mockRejectedValueOnce(new Error("search failed"));
    await handleSearchCases({
      url: "http://localhost:3000/api/search?query=breach",
    } as never);
    expect(errorResponseMock).toHaveBeenCalled();
  });
});
