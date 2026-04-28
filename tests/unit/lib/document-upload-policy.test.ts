import { describe, expect, it, vi } from "vitest";

describe("uploadPolicy fileFilter", () => {
  it("accepts allowed MIME types and rejects disallowed files", async () => {
    vi.resetModules();

    const multerFactory = vi.fn((config: any) => config);
    const memoryStorage = vi.fn(() => "memory-storage");

    class FakeMulterError extends Error {
      constructor(
        public code: string,
        public field: string,
      ) {
        super(code);
      }
    }

    Object.assign(multerFactory, {
      memoryStorage,
      MulterError: FakeMulterError,
    });

    vi.doMock("multer", () => ({ default: multerFactory }));

    const { uploadPolicy } = await import("@/lib/validators/document.schema");

    expect(multerFactory).toHaveBeenCalled();
    const policy = uploadPolicy as {
      fileFilter: (
        req: any,
        file: { mimetype: string; fieldname: string },
        cb: (err: any, ok?: boolean) => void,
      ) => void;
    };

    const allowCb = vi.fn();
    policy.fileFilter(
      {},
      { mimetype: "application/pdf", fieldname: "file" },
      allowCb,
    );
    expect(allowCb).toHaveBeenCalledWith(null, true);

    const rejectCb = vi.fn();
    policy.fileFilter(
      {},
      { mimetype: "text/plain", fieldname: "file" },
      rejectCb,
    );
    const [firstArg] = rejectCb.mock.calls[0];
    expect(firstArg).toBeInstanceOf(FakeMulterError);
  });
});
