import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppError } from "@/lib/errors";

const connectDbMock = vi.hoisted(() => vi.fn());
const caseCreateMock = vi.hoisted(() => vi.fn());
const caseFindMock = vi.hoisted(() => vi.fn());
const caseCountDocumentsMock = vi.hoisted(() => vi.fn());
const caseFindByIdMock = vi.hoisted(() => vi.fn());
const caseFindByIdAndUpdateMock = vi.hoisted(() => vi.fn());
const caseFindByIdAndDeleteMock = vi.hoisted(() => vi.fn());
const documentFindMock = vi.hoisted(() => vi.fn());
const documentDeleteManyMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/db", () => ({ connectDb: connectDbMock }));
vi.mock("@/models/Case", () => ({
  CaseModel: {
    create: caseCreateMock,
    find: caseFindMock,
    countDocuments: caseCountDocumentsMock,
    findById: caseFindByIdMock,
    findByIdAndUpdate: caseFindByIdAndUpdateMock,
    findByIdAndDelete: caseFindByIdAndDeleteMock,
  },
}));
vi.mock("@/models/Document", () => ({
  DocumentModel: {
    find: documentFindMock,
    deleteMany: documentDeleteManyMock,
  },
}));

import { createCase, deleteCase, getCaseById, listCases, updateCase } from "@/services/case.service";

function makeCaseFindChain(result: any) {
  const lean = vi.fn().mockResolvedValue(result);
  const limit = vi.fn().mockReturnValue({ lean });
  const skip = vi.fn().mockReturnValue({ limit });
  const sort = vi.fn().mockReturnValue({ skip, limit, lean });
  return { sort, skip, limit, lean };
}

function makeDocFindChain(result: any) {
  const lean = vi.fn().mockResolvedValue(result);
  const sort = vi.fn().mockReturnValue({ lean });
  return { sort, lean };
}

describe("case.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    connectDbMock.mockResolvedValue(undefined);
  });

  it("creates a case and transforms date fields", async () => {
    caseCreateMock.mockResolvedValue({ toObject: vi.fn().mockReturnValue({ id: "c1" }) });

    const result = await createCase(
      {
        title: "Case",
        client_name: "Client",
        case_type: "Civil",
        court: "Court",
        judge: "Judge",
        status: "ongoing",
        assigned_lawyers: ["Lawyer A"],
        filing_date: "2026-01-01",
        closing_date: null,
        timeline: [],
      },
      "507f1f77bcf86cd799439011",
    );

    expect(caseCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        filing_date: expect.any(Date),
        created_by: expect.anything(),
      }),
    );
    expect(result).toEqual({ id: "c1" });
  });

  it("lists cases with search projection and sorting when query is present", async () => {
    const chain = makeCaseFindChain([{ _id: "c1" }]);
    caseFindMock.mockReturnValue(chain);
    caseCountDocumentsMock.mockResolvedValue(3);

    const result = await listCases({
      query: "breach",
      status: "ongoing",
      court: "Delhi",
      judge: "Justice Rao",
      page: 1,
      limit: 10,
      sortBy: "createdAt",
      sortOrder: "desc",
    });

    expect(caseFindMock).toHaveBeenCalledWith(
      {
        status: "ongoing",
        court: "Delhi",
        judge: "Justice Rao",
        $text: { $search: "breach" },
      },
      { score: { $meta: "textScore" } },
    );
    expect(chain.sort).toHaveBeenCalledWith({
      score: { $meta: "textScore" },
      createdAt: -1,
    });
    expect(result.totalPages).toBe(1);
  });

  it("lists cases with fallback totalPages and non-text sorting", async () => {
    const chain = makeCaseFindChain([]);
    caseFindMock.mockReturnValue(chain);
    caseCountDocumentsMock.mockResolvedValue(0);

    const result = await listCases({
      query: undefined,
      status: undefined,
      court: undefined,
      judge: undefined,
      page: 2,
      limit: 5,
      sortBy: "title",
      sortOrder: "asc",
    });

    expect(caseFindMock).toHaveBeenCalledWith({}, undefined);
    expect(chain.sort).toHaveBeenCalledWith({ title: 1 });
    expect(result).toMatchObject({ page: 2, limit: 5, total: 0, totalPages: 1 });
  });

  it("fetches case by id with documents and throws when missing", async () => {
    caseFindByIdMock.mockReturnValueOnce({ lean: vi.fn().mockResolvedValue(null) });
    await expect(getCaseById("missing")).rejects.toMatchObject<any>({
      message: "Case not found",
      statusCode: 404,
    });

    caseFindByIdMock.mockReturnValueOnce({
      lean: vi.fn().mockResolvedValue({ _id: "c2", title: "Case 2" }),
    });
    const docChain = makeDocFindChain([{ _id: "d1" }]);
    documentFindMock.mockReturnValueOnce(docChain);

    await expect(getCaseById("c2")).resolves.toEqual({
      _id: "c2",
      title: "Case 2",
      documents: [{ _id: "d1" }],
    });
  });

  it("updates or deletes cases and throws when records are missing", async () => {
    caseFindByIdAndUpdateMock.mockReturnValueOnce({ lean: vi.fn().mockResolvedValue(null) });
    await expect(updateCase("c3", { status: "closed" })).rejects.toMatchObject<any>({
      message: "Case not found",
      statusCode: 404,
    });

    caseFindByIdAndUpdateMock.mockReturnValueOnce({
      lean: vi.fn().mockResolvedValue({ _id: "c3", status: "closed" }),
    });
    await expect(updateCase("c3", { status: "closed", closing_date: "2026-04-01" })).resolves.toEqual({
      _id: "c3",
      status: "closed",
    });

    caseFindByIdAndDeleteMock.mockReturnValueOnce({ lean: vi.fn().mockResolvedValue(null) });
    await expect(deleteCase("c4")).rejects.toMatchObject<any>({
      message: "Case not found",
      statusCode: 404,
    });

    caseFindByIdAndDeleteMock.mockReturnValueOnce({ lean: vi.fn().mockResolvedValue({ _id: "c4" }) });
    documentDeleteManyMock.mockResolvedValue({ deletedCount: 2 });
    await expect(deleteCase("c4")).resolves.toEqual({ _id: "c4" });
    expect(documentDeleteManyMock).toHaveBeenCalledWith({ case_id: "c4" });
  });
});
