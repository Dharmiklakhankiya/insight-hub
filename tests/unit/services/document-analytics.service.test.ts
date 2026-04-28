import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppError } from "@/lib/errors";

const connectDbMock = vi.hoisted(() => vi.fn());
const persistUploadedFileMock = vi.hoisted(() => vi.fn());
const caseExistsMock = vi.hoisted(() => vi.fn());
const caseCountDocumentsMock = vi.hoisted(() => vi.fn());
const caseAggregateMock = vi.hoisted(() => vi.fn());
const documentCreateMock = vi.hoisted(() => vi.fn());
const documentFindMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/db", () => ({ connectDb: connectDbMock }));
vi.mock("@/lib/file-storage", () => ({
  persistUploadedFile: persistUploadedFileMock,
}));
vi.mock("@/models/Case", () => ({
  CaseModel: {
    exists: caseExistsMock,
    countDocuments: caseCountDocumentsMock,
    aggregate: caseAggregateMock,
  },
}));
vi.mock("@/models/Document", () => ({
  DocumentModel: {
    create: documentCreateMock,
    find: documentFindMock,
  },
}));

import { getAnalyticsSummary } from "@/services/analytics.service";
import {
  listDocumentsByCase,
  uploadDocument,
} from "@/services/document.service";

function mockAggregateByPipeline(mapper: (pipeline: any[]) => any) {
  caseAggregateMock.mockImplementation((pipeline: any[]) =>
    Promise.resolve(mapper(pipeline)),
  );
}

describe("document.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    connectDbMock.mockResolvedValue(undefined);
  });

  it("rejects upload when case does not exist", async () => {
    caseExistsMock.mockResolvedValue(null);

    await expect(
      uploadDocument({
        file: new File(["x"], "brief.pdf", { type: "application/pdf" }),
        metadata: { case_id: "507f1f77bcf86cd799439011", tags: ["evidence"] },
        uploadedBy: "507f1f77bcf86cd799439012",
      }),
    ).rejects.toMatchObject<AppError>({
      message: "Case not found",
      statusCode: 404,
    });

    expect(documentCreateMock).not.toHaveBeenCalled();
  });

  it("uploads document and lists by case with optional tag filter", async () => {
    caseExistsMock.mockResolvedValue({ _id: "c1" });
    persistUploadedFileMock.mockResolvedValue({
      absolutePath: "C:/uploads/file.pdf",
      relativePath: "uploads/file.pdf",
    });
    documentCreateMock.mockResolvedValue({
      toObject: vi.fn().mockReturnValue({ _id: "d1" }),
    });

    await expect(
      uploadDocument({
        file: new File(["pdf"], "brief.pdf", { type: "application/pdf" }),
        metadata: { case_id: "507f1f77bcf86cd799439011", tags: ["evidence"] },
        uploadedBy: "507f1f77bcf86cd799439012",
      }),
    ).resolves.toEqual({ _id: "d1" });

    const findChainA = {
      sort: vi
        .fn()
        .mockReturnValue({ lean: vi.fn().mockResolvedValue([{ _id: "d1" }]) }),
    };
    documentFindMock.mockReturnValueOnce(findChainA);
    await expect(listDocumentsByCase("c1")).resolves.toEqual([{ _id: "d1" }]);
    expect(documentFindMock).toHaveBeenCalledWith({ case_id: "c1" });

    const findChainB = {
      sort: vi
        .fn()
        .mockReturnValue({ lean: vi.fn().mockResolvedValue([{ _id: "d2" }]) }),
    };
    documentFindMock.mockReturnValueOnce(findChainB);
    await expect(listDocumentsByCase("c1", "evidence")).resolves.toEqual([
      { _id: "d2" },
    ]);
    expect(documentFindMock).toHaveBeenCalledWith({
      case_id: "c1",
      tags: "evidence",
    });
  });
});

describe("analytics.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    connectDbMock.mockResolvedValue(undefined);
  });

  it("computes summary with top type, imbalance, and long duration insight", async () => {
    caseCountDocumentsMock.mockResolvedValue(5);

    mockAggregateByPipeline((pipeline) => {
      const first = pipeline[0] as Record<string, any>;
      if (
        "$group" in first &&
        (first.$group as Record<string, any>)._id === "$status"
      ) {
        return [
          { _id: "closed", count: 2 },
          { _id: "ongoing", count: 3 },
        ];
      }
      if (
        "$group" in first &&
        (first.$group as Record<string, any>)._id === "$case_type"
      ) {
        return [{ _id: "Commercial", count: 4 }];
      }
      if ("$project" in first) {
        return [{ _id: null, avgDuration: 220 }];
      }
      return [
        { _id: "Lawyer A", caseCount: 4 },
        { _id: "Lawyer B", caseCount: 1 },
      ];
    });

    const summary = await getAnalyticsSummary();

    expect(summary.totalCases).toBe(5);
    expect(summary.closedCount).toBe(2);
    expect(summary.activeCount).toBe(3);
    expect(summary.caseTypeDistribution).toEqual([
      { case_type: "Commercial", count: 4 },
    ]);
    expect(summary.lawyerWorkload[0]).toEqual({
      lawyer: "Lawyer A",
      caseCount: 4,
    });
    expect(summary.insights.join(" | ")).toContain(
      "Most frequent case type is Commercial",
    );
    expect(summary.insights.join(" | ")).toContain(
      "Workload imbalance detected",
    );
    expect(summary.insights.join(" | ")).toContain(
      "indicating long resolution cycles",
    );
  });

  it("computes summary with balanced workload and expected duration insights", async () => {
    caseCountDocumentsMock.mockResolvedValue(2);

    mockAggregateByPipeline((pipeline) => {
      const first = pipeline[0] as Record<string, any>;
      if (
        "$group" in first &&
        (first.$group as Record<string, any>)._id === "$status"
      ) {
        return [{ _id: "ongoing", count: 2 }];
      }
      if (
        "$group" in first &&
        (first.$group as Record<string, any>)._id === "$case_type"
      ) {
        return [];
      }
      if ("$project" in first) {
        return [{ _id: null, avgDuration: 10 }];
      }
      return [
        { _id: "Lawyer A", caseCount: 2 },
        { _id: "Lawyer B", caseCount: 2 },
      ];
    });

    const summary = await getAnalyticsSummary();

    expect(summary.closedCount).toBe(0);
    expect(summary.activeCount).toBe(2);
    expect(summary.caseTypeDistribution).toEqual([]);
    expect(summary.averageCaseDuration).toBe(10);
    expect(summary.insights).toContain(
      "Lawyer workload is relatively balanced.",
    );
    expect(summary.insights.join(" | ")).toContain("within expected range");
  });

  it("handles empty duration aggregation and single-lawyer workload", async () => {
    caseCountDocumentsMock.mockResolvedValue(1);

    mockAggregateByPipeline((pipeline) => {
      const first = pipeline[0] as Record<string, any>;
      if (
        "$group" in first &&
        (first.$group as Record<string, any>)._id === "$status"
      ) {
        return [{ _id: "closed", count: 1 }];
      }
      if (
        "$group" in first &&
        (first.$group as Record<string, any>)._id === "$case_type"
      ) {
        return [{ _id: "Civil", count: 1 }];
      }
      if ("$project" in first) {
        return [];
      }
      return [{ _id: "Solo Lawyer", caseCount: 1 }];
    });

    const summary = await getAnalyticsSummary();

    expect(summary.averageCaseDuration).toBe(0);
    expect(summary.lawyerWorkload).toEqual([
      { lawyer: "Solo Lawyer", caseCount: 1 },
    ]);
    expect(summary.insights).not.toContain(
      "Lawyer workload is relatively balanced.",
    );
    expect(summary.insights.join(" | ")).toContain("within expected range");
  });
});
