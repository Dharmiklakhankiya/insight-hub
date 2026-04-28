import { afterEach, describe, expect, it, vi } from "vitest";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
  vi.resetModules();
});

describe("env module", () => {
  it("uses secure defaults when variables are unset", async () => {
    delete process.env.NODE_ENV;
    delete process.env.MONGODB_URI;
    delete process.env.JWT_SECRET;
    delete process.env.JWT_EXPIRES_IN;
    delete process.env.APP_URL;

    const { env, isProduction } = await import("@/lib/env");
    expect(env.NODE_ENV).toBe("development");
    expect(env.MONGODB_URI).toBe("mongodb://localhost:27017/insight_hub");
    expect(env.JWT_EXPIRES_IN).toBe("15m");
    expect(env.APP_URL).toBe("http://localhost:3000");
    expect(isProduction).toBe(false);
  });

  it("reflects explicit production values", async () => {
    process.env.NODE_ENV = "production";
    process.env.MONGODB_URI = "mongodb://localhost:27017/custom";
    process.env.JWT_SECRET = "12345678901234567890123456789012";
    process.env.JWT_EXPIRES_IN = "30m";
    process.env.APP_URL = "https://insight.example.com";

    const { env, isProduction } = await import("@/lib/env");
    expect(env.NODE_ENV).toBe("production");
    expect(env.MONGODB_URI).toBe("mongodb://localhost:27017/custom");
    expect(env.JWT_EXPIRES_IN).toBe("30m");
    expect(env.APP_URL).toBe("https://insight.example.com");
    expect(isProduction).toBe(true);
  });
});

describe("next config", () => {
  it("includes dev CSP with unsafe-eval", async () => {
    process.env.NODE_ENV = "development";
    const configModule = await import("@/next.config");
    const config = configModule.default;

    const headers = await config.headers?.();
    const csp = headers?.[0].headers.find(
      (h) => h.key === "Content-Security-Policy",
    )?.value;
    expect(csp).toContain("'unsafe-eval'");
    expect(config.poweredByHeader).toBe(false);
  });

  it("omits unsafe-eval in production CSP", async () => {
    process.env.NODE_ENV = "production";
    vi.resetModules();
    const configModule = await import("@/next.config");
    const config = configModule.default;

    const headers = await config.headers?.();
    const csp = headers?.[0].headers.find(
      (h) => h.key === "Content-Security-Policy",
    )?.value;
    expect(csp).not.toContain("'unsafe-eval'");
    expect(headers?.[0].source).toBe("/:path*");
  });
});
