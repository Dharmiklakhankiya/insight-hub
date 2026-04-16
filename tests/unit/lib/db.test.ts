import { beforeEach, describe, expect, it, vi } from "vitest";

describe("connectDb", () => {
  beforeEach(() => {
    vi.resetModules();
    (global as { __mongoose?: any }).__mongoose = undefined;
  });

  it("connects once and reuses the cached connection", async () => {
    const setMock = vi.fn();
    const connectMock = vi.fn().mockResolvedValue({ connected: true });

    vi.doMock("mongoose", () => ({
      default: {
        set: setMock,
        connect: connectMock,
      },
    }));

    const { connectDb } = await import("@/lib/db");

    const first = await connectDb();
    const second = await connectDb();

    expect(first).toEqual({ connected: true });
    expect(second).toEqual({ connected: true });
    expect(setMock).toHaveBeenCalledWith("strictQuery", true);
    expect(connectMock).toHaveBeenCalledTimes(1);
  });

  it("resets failed promise and allows retry", async () => {
    const connectMock = vi
      .fn()
      .mockRejectedValueOnce(new Error("db down"))
      .mockResolvedValueOnce({ connected: true });

    vi.doMock("mongoose", () => ({
      default: {
        set: vi.fn(),
        connect: connectMock,
      },
    }));

    const { connectDb } = await import("@/lib/db");

    await expect(connectDb()).rejects.toThrowError("db down");
    await expect(connectDb()).resolves.toEqual({ connected: true });
    expect(connectMock).toHaveBeenCalledTimes(2);
  });

  it("reuses in-flight connection promise for concurrent callers", async () => {
    let resolveConnect: ((value: { connected: boolean }) => void) | null = null;
    const pendingConnection = new Promise<{ connected: boolean }>((resolve) => {
      resolveConnect = resolve;
    });

    const connectMock = vi.fn().mockReturnValue(pendingConnection);

    vi.doMock("mongoose", () => ({
      default: {
        set: vi.fn(),
        connect: connectMock,
      },
    }));

    const { connectDb } = await import("@/lib/db");

    const firstCall = connectDb();
    const secondCall = connectDb();

    expect(connectMock).toHaveBeenCalledTimes(1);

    resolveConnect?.({ connected: true });

    await expect(firstCall).resolves.toEqual({ connected: true });
    await expect(secondCall).resolves.toEqual({ connected: true });
    expect(connectMock).toHaveBeenCalledTimes(1);
  });
});
