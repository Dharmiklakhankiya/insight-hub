import { describe, expect, it, vi } from "vitest";

const redirectMock = vi.hoisted(() =>
  vi.fn((path: string) => {
    throw new Error(`redirect:${path}`);
  }),
);
const getSessionFromCookiesMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));
vi.mock("@/lib/auth", () => ({
  getSessionFromCookies: getSessionFromCookiesMock,
}));

import Home, { dynamic } from "@/app/page";

describe("home page integration", () => {
  it("forces dynamic rendering strategy", () => {
    expect(dynamic).toBe("force-dynamic");
  });

  it("redirects authenticated users to dashboard", async () => {
    getSessionFromCookiesMock.mockResolvedValue({ sub: "u1" });
    await expect(Home()).rejects.toThrowError("redirect:/dashboard");
  });

  it("redirects unauthenticated users to login", async () => {
    getSessionFromCookiesMock.mockResolvedValue(null);
    await expect(Home()).rejects.toThrowError("redirect:/login");
  });
});
