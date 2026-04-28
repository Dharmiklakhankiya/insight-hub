/* @vitest-environment jsdom */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

const apiGetMock = vi.hoisted(() => vi.fn());
const apiPostMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/client-api", () => ({
  apiGet: apiGetMock,
  apiPost: apiPostMock,
}));
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...rest
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

import CasesPage from "@/app/(protected)/cases/page";
import { caseCreateSchema } from "@/lib/validators/case.schema";

function getCreateCaseForm() {
  const forms = document.querySelectorAll("form");
  return forms[1] as HTMLFormElement;
}

function submitCreateCaseForm() {
  fireEvent.submit(getCreateCaseForm());
}

function setSearchStatus(value: string) {
  const searchForm = document.querySelectorAll("form")[0] as HTMLFormElement;
  const statusInput = searchForm.querySelector(
    "input.MuiSelect-nativeInput",
  ) as HTMLInputElement;
  fireEvent.change(statusInput, { target: { value } });
}

function setCreateStatus(value: string) {
  const statusInput = getCreateCaseForm().querySelector(
    "input.MuiSelect-nativeInput",
  ) as HTMLInputElement;
  fireEvent.change(statusInput, { target: { value } });
}

function fillCreateCaseForm(values: {
  title: string;
  clientName: string;
  caseType: string;
  court: string;
  judge: string;
  assignedLawyers: string;
  filingDate: string;
}) {
  const form = getCreateCaseForm();
  const textInputs = form.querySelectorAll('input[type="text"]');
  const dateInputs = form.querySelectorAll('input[type="date"]');

  fireEvent.change(textInputs[0] as HTMLInputElement, {
    target: { value: values.title },
  });
  fireEvent.change(textInputs[1] as HTMLInputElement, {
    target: { value: values.clientName },
  });
  fireEvent.change(textInputs[2] as HTMLInputElement, {
    target: { value: values.caseType },
  });
  fireEvent.change(textInputs[3] as HTMLInputElement, {
    target: { value: values.court },
  });
  fireEvent.change(textInputs[4] as HTMLInputElement, {
    target: { value: values.judge },
  });
  fireEvent.change(textInputs[5] as HTMLInputElement, {
    target: { value: values.assignedLawyers },
  });
  fireEvent.change(dateInputs[0] as HTMLInputElement, {
    target: { value: values.filingDate },
  });
}

const listPayload = {
  items: [
    {
      _id: "c1",
      title: "Commercial Breach",
      client_name: "Vikram",
      case_type: "Commercial",
      court: "Delhi High Court",
      judge: "Justice Rao",
      status: "ongoing",
      assigned_lawyers: ["Neha"],
      filing_date: "2026-04-12",
      closing_date: null,
      timeline: [],
      createdAt: "2026-04-12",
      updatedAt: "2026-04-12",
    },
    {
      _id: "c2",
      title: "Closed Matter",
      client_name: "Aarav",
      case_type: "Civil",
      court: "Delhi High Court",
      judge: "Justice Sharma",
      status: "closed",
      assigned_lawyers: ["Aarav"],
      filing_date: "2026-01-01",
      closing_date: "2026-02-01",
      timeline: [],
      createdAt: "2026-01-01",
      updatedAt: "2026-02-01",
    },
    {
      _id: "c3",
      title: "Pending Matter",
      client_name: "Riya",
      case_type: "Tax",
      court: "Bombay High Court",
      judge: "Justice Menon",
      status: "pending",
      assigned_lawyers: ["Riya"],
      filing_date: "2026-03-01",
      closing_date: null,
      timeline: [],
      createdAt: "2026-03-01",
      updatedAt: "2026-03-01",
    },
  ],
  page: 1,
  limit: 20,
  total: 3,
  totalPages: 1,
};

describe("cases page integration", () => {
  beforeEach(() => {
    apiGetMock.mockReset();
    apiPostMock.mockReset();
  });

  it("shows list loading and error states", async () => {
    apiGetMock.mockRejectedValueOnce(new Error("load failed"));
    render(<CasesPage />);

    expect(screen.getByText("Loading cases...")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Failed to load cases.")).toBeInTheDocument();
    });
  });

  it("renders empty state and filtered searches", async () => {
    apiGetMock
      .mockResolvedValueOnce({
        items: [],
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 1,
      })
      .mockResolvedValueOnce(listPayload);

    render(<CasesPage />);

    await waitFor(() => {
      expect(
        screen.getByText("No cases found for current filters."),
      ).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText("Search"), {
      target: { value: "breach" },
    });
    fireEvent.change(screen.getByLabelText("Court"), {
      target: { value: "Delhi" },
    });
    fireEvent.change(screen.getByLabelText("Judge"), {
      target: { value: "Rao" },
    });
    setSearchStatus("closed");

    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    await waitFor(() => {
      expect(apiGetMock).toHaveBeenLastCalledWith(
        expect.stringContaining("query=breach"),
      );
      expect(apiGetMock).toHaveBeenLastCalledWith(
        expect.stringContaining("status=closed"),
      );
      expect(screen.getByText("Commercial Breach")).toBeInTheDocument();
      expect(screen.getByText("Closed Matter")).toBeInTheDocument();
      expect(screen.getByText("Pending Matter")).toBeInTheDocument();
    });
  });

  it("handles root-level create validation issues", async () => {
    const rootIssueResult = z
      .object({})
      .refine(() => false, { message: "root issue" })
      .safeParse({});
    if (rootIssueResult.success) {
      throw new Error("expected root issue");
    }

    const safeParseSpy = vi
      .spyOn(caseCreateSchema, "safeParse")
      .mockReturnValue(rootIssueResult as never);

    apiGetMock.mockResolvedValueOnce({
      items: [],
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 1,
    });

    render(<CasesPage />);

    await waitFor(() => {
      expect(
        screen.getByText("No cases found for current filters."),
      ).toBeInTheDocument();
    });

    submitCreateCaseForm();

    await waitFor(() => {
      expect(apiPostMock).not.toHaveBeenCalled();
    });

    safeParseSpy.mockRestore();
  });

  it("shows validation errors, create success, and create failure", async () => {
    apiGetMock
      .mockResolvedValueOnce({
        items: [],
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 1,
      })
      .mockResolvedValueOnce(listPayload)
      .mockResolvedValueOnce(listPayload);
    apiPostMock.mockResolvedValueOnce({ case: { _id: "new" } });

    render(<CasesPage />);

    await waitFor(() => {
      expect(
        screen.getByText("No cases found for current filters."),
      ).toBeInTheDocument();
    });

    submitCreateCaseForm();

    await waitFor(() => {
      const firstTextInput =
        getCreateCaseForm().querySelector('input[type="text"]');
      expect(firstTextInput).toHaveAttribute("aria-invalid", "true");
      expect(apiPostMock).not.toHaveBeenCalled();
    });

    fillCreateCaseForm({
      title: "Corporate Breach",
      clientName: "Vikram Patel",
      caseType: "Commercial",
      court: "Delhi High Court",
      judge: "Justice Rao",
      assignedLawyers: "Neha Singh",
      filingDate: "2026-04-10",
    });
    setCreateStatus("closed");
    fireEvent.change(
      getCreateCaseForm().querySelectorAll('input[type="date"]')[1],
      {
        target: { value: "2026-04-20" },
      },
    );

    submitCreateCaseForm();

    await waitFor(() => {
      expect(apiPostMock).toHaveBeenCalledWith(
        "/api/cases",
        expect.objectContaining({ title: "Corporate Breach" }),
      );
      expect(
        screen.getByText("Case created successfully."),
      ).toBeInTheDocument();
    });

    apiPostMock.mockRejectedValueOnce(new Error("create failed"));

    fillCreateCaseForm({
      title: "Another Case",
      clientName: "Another Client",
      caseType: "Civil",
      court: "Court X",
      judge: "Judge X",
      assignedLawyers: "Lawyer X",
      filingDate: "2026-05-01",
    });
    setCreateStatus("pending");
    fireEvent.change(
      getCreateCaseForm().querySelectorAll('input[type="date"]')[1],
      {
        target: { value: "2026-05-20" },
      },
    );

    submitCreateCaseForm();

    await waitFor(() => {
      expect(screen.getByText("Failed to create case.")).toBeInTheDocument();
    });
  });
});
