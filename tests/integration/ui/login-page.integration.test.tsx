/* @vitest-environment jsdom */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

const pushMock = vi.hoisted(() => vi.fn());
const refreshMock = vi.hoisted(() => vi.fn());
const apiPostMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
  }),
}));
vi.mock("@/lib/client-api", () => ({
  apiPost: apiPostMock,
}));

import LoginPage from "@/app/(auth)/login/page";
import { registerSchema } from "@/lib/validators/auth.schema";

function submitAuthForm() {
  const form = document.querySelector("form") as HTMLFormElement;
  fireEvent.submit(form);
}

function setLoginCredentials(email: string, password: string) {
  const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
  const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement;

  fireEvent.change(emailInput, { target: { value: email } });
  fireEvent.change(passwordInput, { target: { value: password } });
}

function setRegisterRole(role: "admin" | "lawyer" | "clerk") {
  const roleInput = document.querySelector("input.MuiSelect-nativeInput") as HTMLInputElement;
  fireEvent.change(roleInput, { target: { value: role } });
}

describe("login page integration", () => {
  beforeEach(() => {
    apiPostMock.mockReset();
    window.history.pushState({}, "", "/login");
    apiPostMock.mockResolvedValue({ user: { id: "u1" } });
  });

  it("shows client-side validation errors for invalid login payload", async () => {
    render(<LoginPage />);

    submitAuthForm();

    await waitFor(() => {
      const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
      expect(emailInput).toHaveAttribute("aria-invalid", "true");
      expect(apiPostMock).not.toHaveBeenCalled();
    });
  });

  it("submits login and redirects to next path", async () => {
    window.history.pushState({}, "", "/login?next=/cases");
    render(<LoginPage />);

    setLoginCredentials("neha@example.com", "StrongPass123");

    submitAuthForm();

    await waitFor(() => {
      expect(apiPostMock).toHaveBeenCalledWith("/api/auth/login", {
        email: "neha@example.com",
        password: "StrongPass123",
      });
      expect(pushMock).toHaveBeenCalledWith("/cases");
      expect(refreshMock).toHaveBeenCalled();
    });
  });

  it("handles root-level validation issues without calling API", async () => {
    const rootIssueResult = z
      .object({})
      .refine(() => false, { message: "root issue" })
      .safeParse({});
    if (rootIssueResult.success) {
      throw new Error("expected root issue");
    }

    const safeParseSpy = vi
      .spyOn(registerSchema, "safeParse")
      .mockReturnValue(rootIssueResult as never);

    render(<LoginPage />);

    fireEvent.click(screen.getByRole("tab", { name: "Create account" }));
    submitAuthForm();

    await waitFor(() => {
      expect(apiPostMock).not.toHaveBeenCalled();
    });

    safeParseSpy.mockRestore();
  });

  it("shows API failure message for login errors", async () => {
    apiPostMock.mockRejectedValueOnce(new Error("bad credentials"));
    render(<LoginPage />);

    setLoginCredentials("neha@example.com", "StrongPass123");

    submitAuthForm();

    await waitFor(() => {
      expect(
        screen.getByText("Authentication failed. Check your credentials and try again."),
      ).toBeInTheDocument();
    });
  });

  it("handles register mode validation and successful register submission", async () => {
    render(<LoginPage />);

    fireEvent.click(screen.getByRole("tab", { name: "Create account" }));

    submitAuthForm();

    await waitFor(() => {
      const nameInput = document.querySelector('input[type="text"]') as HTMLInputElement;
      expect(nameInput).toHaveAttribute("aria-invalid", "true");
      expect(apiPostMock).not.toHaveBeenCalled();
    });

    const nameInput = document.querySelector('input[type="text"]') as HTMLInputElement;
    const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
    const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement;

    fireEvent.change(nameInput, { target: { value: "Neha Singh" } });
    fireEvent.change(emailInput, { target: { value: "neha@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "StrongPass123" } });
    setRegisterRole("admin");

    submitAuthForm();

    await waitFor(() => {
      expect(apiPostMock).toHaveBeenCalledWith("/api/auth/register", {
        name: "Neha Singh",
        email: "neha@example.com",
        password: "StrongPass123",
        role: "admin",
      });
      expect(pushMock).toHaveBeenCalledWith("/dashboard");
    });
  });
});
