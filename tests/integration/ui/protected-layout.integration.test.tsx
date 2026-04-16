/* @vitest-environment jsdom */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const usePathnameMock = vi.hoisted(() => vi.fn());
const pushMock = vi.hoisted(() => vi.fn());
const refreshMock = vi.hoisted(() => vi.fn());
const apiPostMock = vi.hoisted(() => vi.fn());
const clearCsrfCacheMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  usePathname: usePathnameMock,
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
  }),
}));
vi.mock("next/link", () => ({
  default: ({ children, href, ...rest }: PropsWithChildren<{ href: string }>) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));
vi.mock("@/lib/client-api", () => ({
  apiPost: apiPostMock,
  clearCsrfCache: clearCsrfCacheMock,
}));

import ProtectedLayout from "@/components/protected-layout";

describe("protected layout integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    usePathnameMock.mockReturnValue("/cases/123");
    apiPostMock.mockResolvedValue({ success: true });
  });

  it("renders navigation and children for active protected route", () => {
    render(
      <ProtectedLayout>
        <p>Protected Content</p>
      </ProtectedLayout>,
    );

    expect(screen.getByText("Insight Hub")).toBeInTheDocument();
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign out" })).toBeInTheDocument();
  });

  it("opens mobile drawer menu", () => {
    usePathnameMock.mockReturnValue("/unknown");
    render(
      <ProtectedLayout>
        <p>Content</p>
      </ProtectedLayout>,
    );

    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[buttons.length - 1]);

    expect(screen.getByText("Navigation")).toBeInTheDocument();
  });

  it("logs out and clears csrf cache on success", async () => {
    render(
      <ProtectedLayout>
        <p>Content</p>
      </ProtectedLayout>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Sign out" }));

    await waitFor(() => {
      expect(apiPostMock).toHaveBeenCalledWith("/api/auth/logout", {});
      expect(clearCsrfCacheMock).toHaveBeenCalled();
      expect(pushMock).toHaveBeenCalledWith("/login");
      expect(refreshMock).toHaveBeenCalled();
    });
  });

  it("still redirects to login if logout API fails", async () => {
    apiPostMock.mockRejectedValueOnce(new Error("network"));

    render(
      <ProtectedLayout>
        <p>Content</p>
      </ProtectedLayout>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Sign out" }));

    await waitFor(() => {
      expect(clearCsrfCacheMock).toHaveBeenCalled();
      expect(pushMock).toHaveBeenCalledWith("/login");
      expect(refreshMock).toHaveBeenCalled();
    });
  });
});
