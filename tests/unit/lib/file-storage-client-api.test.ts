import crypto from "crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppError } from "@/lib/errors";

const mkdirMock = vi.hoisted(() => vi.fn());
const writeFileMock = vi.hoisted(() => vi.fn());

vi.mock("fs/promises", () => ({
  mkdir: mkdirMock,
  writeFile: writeFileMock,
}));

describe("file storage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mkdirMock.mockReset();
    writeFileMock.mockReset();
  });

  it("creates upload directory", async () => {
    const { ensureUploadsDir } = await import("@/lib/file-storage");
    await ensureUploadsDir();
    expect(mkdirMock).toHaveBeenCalledWith(expect.any(String), { recursive: true });
  });

  it("persists uploaded files and normalizes returned paths", async () => {
    const randomSpy = vi.spyOn(crypto, "randomUUID").mockReturnValue("uuid-123");
    vi.spyOn(Date, "now").mockReturnValue(1700000000000);
    writeFileMock.mockResolvedValue(undefined);

    const { persistUploadedFile } = await import("@/lib/file-storage");
    const file = new File(["hello"], "Evidence.PDF", { type: "application/pdf" });

    const saved = await persistUploadedFile(file);

    expect(saved.relativePath).toBe("uploads/1700000000000-uuid-123.pdf");
    expect(saved.absolutePath).toContain("uploads");
    expect(writeFileMock).toHaveBeenCalledWith(
      expect.stringContaining("1700000000000-uuid-123.pdf"),
      expect.any(Buffer),
      { flag: "wx" },
    );

    randomSpy.mockRestore();
  });

  it("wraps write failures as AppError", async () => {
    writeFileMock.mockRejectedValue(new Error("disk full"));

    const { persistUploadedFile } = await import("@/lib/file-storage");
    const file = new File(["x"], "a.pdf", { type: "application/pdf" });

    await expect(persistUploadedFile(file)).rejects.toMatchObject<AppError>({
      message: "Failed to persist uploaded file",
      statusCode: 500,
    });
  });
});

type AxiosMockSet = {
  createMock: ReturnType<typeof vi.fn>;
  getMock: ReturnType<typeof vi.fn>;
  postMock: ReturnType<typeof vi.fn>;
  patchMock: ReturnType<typeof vi.fn>;
  deleteMock: ReturnType<typeof vi.fn>;
};

async function importClientApiWithAxiosMocks(): Promise<{
  clientApiModule: typeof import("@/lib/client-api");
  mocks: AxiosMockSet;
}> {
  vi.resetModules();

  const getMock = vi.fn();
  const postMock = vi.fn();
  const patchMock = vi.fn();
  const deleteMock = vi.fn();
  const createMock = vi.fn(() => ({
    get: getMock,
    post: postMock,
    patch: patchMock,
    delete: deleteMock,
  }));

  vi.doMock("axios", () => ({
    default: {
      create: createMock,
    },
  }));

  const clientApiModule = await import("@/lib/client-api");
  return { clientApiModule, mocks: { createMock, getMock, postMock, patchMock, deleteMock } };
}

describe("client api", () => {
  it("gets data without csrf", async () => {
    const { clientApiModule, mocks } = await importClientApiWithAxiosMocks();
    mocks.getMock.mockResolvedValue({ data: { ok: true } });

    await expect(clientApiModule.apiGet("/api/health")).resolves.toEqual({ ok: true });
    expect(mocks.getMock).toHaveBeenCalledWith("/api/health", undefined);
    expect(mocks.createMock).toHaveBeenCalledTimes(1);
  });

  it("posts with csrf token and caches the token", async () => {
    const { clientApiModule, mocks } = await importClientApiWithAxiosMocks();
    mocks.getMock.mockResolvedValue({ data: { csrfToken: "csrf-1" } });
    mocks.postMock.mockResolvedValue({ data: { success: true } });

    await expect(clientApiModule.apiPost("/api/cases", { title: "x" })).resolves.toEqual({
      success: true,
    });
    await expect(clientApiModule.apiPost("/api/cases", { title: "y" })).resolves.toEqual({
      success: true,
    });

    expect(mocks.getMock).toHaveBeenCalledTimes(1);
    expect(mocks.postMock).toHaveBeenCalledWith(
      "/api/cases",
      { title: "x" },
      expect.objectContaining({
        headers: expect.objectContaining({ "x-csrf-token": "csrf-1" }),
      }),
    );

    clientApiModule.clearCsrfCache();
    mocks.getMock.mockResolvedValueOnce({ data: { csrfToken: "csrf-2" } });
    await clientApiModule.apiPost("/api/cases", { title: "z" });
    expect(mocks.getMock).toHaveBeenCalledTimes(2);
  });

  it("patches, deletes, and uploads with csrf and merged headers", async () => {
    const { clientApiModule, mocks } = await importClientApiWithAxiosMocks();
    mocks.getMock.mockResolvedValue({ data: { csrfToken: "csrf-123" } });
    mocks.patchMock.mockResolvedValue({ data: { patched: true } });
    mocks.deleteMock.mockResolvedValue({ data: { deleted: true } });
    mocks.postMock.mockResolvedValue({ data: { uploaded: true } });

    await expect(
      clientApiModule.apiPatch("/api/cases/1", { status: "closed" }, { headers: { "x-extra": "1" } }),
    ).resolves.toEqual({ patched: true });

    await expect(
      clientApiModule.apiPatch("/api/cases/2", { status: "ongoing" }, {}),
    ).resolves.toEqual({ patched: true });

    await expect(clientApiModule.apiDelete("/api/cases/1")).resolves.toEqual({ deleted: true });

    const formData = new FormData();
    formData.set("file", new File(["pdf"], "doc.pdf", { type: "application/pdf" }));
    await expect(clientApiModule.apiUpload("/api/upload", formData)).resolves.toEqual({
      uploaded: true,
    });

    expect(mocks.patchMock).toHaveBeenCalledWith(
      "/api/cases/1",
      { status: "closed" },
      expect.objectContaining({
        headers: expect.objectContaining({
          "x-csrf-token": "csrf-123",
          "x-extra": "1",
        }),
      }),
    );
    expect(mocks.patchMock).toHaveBeenCalledWith(
      "/api/cases/2",
      { status: "ongoing" },
      expect.objectContaining({
        headers: expect.objectContaining({ "x-csrf-token": "csrf-123" }),
      }),
    );
    expect(mocks.deleteMock).toHaveBeenCalledWith(
      "/api/cases/1",
      expect.objectContaining({
        headers: expect.objectContaining({ "x-csrf-token": "csrf-123" }),
      }),
    );
    expect(mocks.postMock).toHaveBeenLastCalledWith(
      "/api/upload",
      formData,
      expect.objectContaining({
        headers: expect.objectContaining({
          "Content-Type": "multipart/form-data",
          "x-csrf-token": "csrf-123",
        }),
      }),
    );
  });
});
