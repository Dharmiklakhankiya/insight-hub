/* @vitest-environment jsdom */

import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

async function loadRootLayout(appUrl?: string) {
  if (appUrl) {
    process.env.APP_URL = appUrl;
  } else {
    delete process.env.APP_URL;
  }

  vi.resetModules();

  vi.doMock("next/font/google", () => ({
    Manrope: () => ({ variable: "font-manrope-var" }),
    IBM_Plex_Sans: () => ({ variable: "font-ibm-var" }),
  }));
  vi.doMock("@/components/app-theme-provider", () => ({
    default: ({ children }: { children: ReactNode }) => <div data-theme-wrapper>{children}</div>,
  }));

  return import("@/app/layout");
}

describe("root layout integration", () => {
  it("uses default metadataBase when APP_URL is missing", async () => {
    const mod = await loadRootLayout();

    expect(mod.metadata.title).toBe("Insight Hub");
    expect(mod.metadata.description).toContain("Legal case management");
    expect(String(mod.metadata.metadataBase)).toBe("http://localhost:3000/");

    const tree = mod.default({ children: <span>child</span> }) as React.ReactElement;
    expect(tree.type).toBe("html");
    expect(tree.props.className).toContain("font-manrope-var");
    expect(tree.props.className).toContain("font-ibm-var");
  });

  it("uses APP_URL for metadataBase", async () => {
    const mod = await loadRootLayout("https://insight.example.com");
    expect(String(mod.metadata.metadataBase)).toBe("https://insight.example.com/");
  });
});
