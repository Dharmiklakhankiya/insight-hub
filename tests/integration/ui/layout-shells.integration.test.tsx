/* @vitest-environment jsdom */

import { render, screen } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { describe, expect, it, vi } from "vitest";

import AuthLayout from "@/app/(auth)/layout";
import AppThemeProvider from "@/components/app-theme-provider";

vi.mock("@/components/protected-layout", () => ({
  default: ({ children }: PropsWithChildren) => <section data-testid="protected-wrapper">{children}</section>,
}));

import ProtectedRouteLayout from "@/app/(protected)/layout";

describe("layout shell integration", () => {
  it("renders auth layout children", () => {
    render(
      <AuthLayout>
        <p>Auth Child</p>
      </AuthLayout>,
    );

    expect(screen.getByText("Auth Child")).toBeInTheDocument();
  });

  it("renders protected route layout through wrapper component", () => {
    render(
      <ProtectedRouteLayout>
        <p>Protected Child</p>
      </ProtectedRouteLayout>,
    );

    expect(screen.getByTestId("protected-wrapper")).toHaveTextContent("Protected Child");
  });

  it("provides MUI theme context and renders children", () => {
    render(
      <AppThemeProvider>
        <button type="button">Themed Action</button>
      </AppThemeProvider>,
    );

    expect(screen.getByRole("button", { name: "Themed Action" })).toBeInTheDocument();
  });
});
