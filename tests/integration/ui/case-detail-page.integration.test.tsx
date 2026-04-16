/* @vitest-environment jsdom */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const useParamsMock = vi.hoisted(() => vi.fn());
const apiGetMock = vi.hoisted(() => vi.fn());
const apiPatchMock = vi.hoisted(() => vi.fn());
const apiUploadMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useParams: useParamsMock,
}));
vi.mock("@/lib/client-api", () => ({
  apiGet: apiGetMock,
  apiPatch: apiPatchMock,
  apiUpload: apiUploadMock,
}));

import CaseDetailPage from "@/app/(protected)/cases/[id]/page";
import { caseUpdateSchema } from "@/lib/validators/case.schema";

function setUpdateFormSelects(status: string, eventType?: string) {
  const updateForm = document.querySelectorAll("form")[0] as HTMLFormElement;
  const selectInputs = updateForm.querySelectorAll("input.MuiSelect-nativeInput");

  fireEvent.change(selectInputs[0] as HTMLInputElement, { target: { value: status } });

  if (eventType) {
    fireEvent.change(selectInputs[1] as HTMLInputElement, {
      target: { value: eventType },
    });
  }
}

const baseCase = {
  _id: "c1",
  title: "Corporate Contract Breach",
  client_name: "Vikram Patel",
  case_type: "Commercial",
  court: "Mumbai High Court",
  judge: "Justice Menon",
  status: "ongoing",
  assigned_lawyers: ["Neha Singh"],
  filing_date: "2026-04-12",
  closing_date: null,
  timeline: [{ type: "filing", date: "2026-04-12", note: "Case filed" }],
  documents: [],
  createdAt: "2026-04-12",
  updatedAt: "2026-04-12",
};

describe("case detail page integration", () => {
  beforeEach(() => {
    apiGetMock.mockReset();
    apiPatchMock.mockReset();
    apiUploadMock.mockReset();
    useParamsMock.mockReturnValue({ id: "507f1f77bcf86cd799439011" });
    apiGetMock.mockResolvedValue({ case: baseCase });
  });

  it("keeps loading state when case id is missing", async () => {
    useParamsMock.mockReturnValue({});
    render(<CaseDetailPage />);

    expect(screen.getByText("Loading case details...")).toBeInTheDocument();
    expect(apiGetMock).not.toHaveBeenCalled();
  });

  it("shows error state when case fetch fails", async () => {
    apiGetMock.mockRejectedValueOnce(new Error("fetch failed"));
    render(<CaseDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Failed to load case details.")).toBeInTheDocument();
    });
  });

  it("renders case details with empty timeline/docs branches", async () => {
    apiGetMock.mockResolvedValueOnce({ case: { ...baseCase, timeline: [], documents: [] } });
    render(<CaseDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Corporate Contract Breach")).toBeInTheDocument();
      expect(screen.getByText("No timeline events available.")).toBeInTheDocument();
      expect(screen.getByText("No documents uploaded for this case.")).toBeInTheDocument();
    });
  });

  it("renders closed case metadata and uploaded documents", async () => {
    apiGetMock.mockResolvedValueOnce({
      case: {
        ...baseCase,
        status: "closed",
        closing_date: "2026-05-01",
        documents: [
          {
            _id: "d1",
            case_id: baseCase._id,
            tags: ["evidence"],
            file_path: "uploads/doc.pdf",
            mime_type: "application/pdf",
            original_name: "doc.pdf",
            uploaded_by: "u1",
            createdAt: "2026-05-02T10:00:00.000Z",
            updatedAt: "2026-05-02T10:00:00.000Z",
          },
        ],
      },
    });

    render(<CaseDetailPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("2026-05-01")).toBeInTheDocument();
      expect(screen.getByText("doc.pdf")).toBeInTheDocument();
      expect(screen.getByText("Tags: evidence")).toBeInTheDocument();
    });
  });

  it("shows load error when API returns null case payload", async () => {
    apiGetMock.mockResolvedValueOnce({ case: null });

    render(<CaseDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Failed to load case details.")).toBeInTheDocument();
    });
  });

  it("shows document fallback when documents field is missing", async () => {
    apiGetMock.mockResolvedValueOnce({ case: { ...baseCase, documents: undefined } });

    render(<CaseDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("No documents uploaded for this case.")).toBeInTheDocument();
    });
  });

  it("validates and updates timeline events", async () => {
    apiPatchMock.mockResolvedValue({ case: baseCase });
    apiGetMock.mockResolvedValue({ case: baseCase });

    render(<CaseDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Update Case and Timeline")).toBeInTheDocument();
    });

    setUpdateFormSelects("closed", "judgment");
    fireEvent.change(screen.getByLabelText("Closing Date"), {
      target: { value: "2026-04-25" },
    });

    fireEvent.change(screen.getByLabelText("Event Date"), { target: { value: "2026-04-20" } });
    fireEvent.change(screen.getByLabelText("Event Note"), {
      target: { value: "<script>alert(1)</script>" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));

    await waitFor(() => {
      expect(screen.getByText("note contains unsafe content")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText("Event Note"), {
      target: { value: "Initial hearing scheduled." },
    });

    fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));

    await waitFor(() => {
      expect(apiPatchMock).toHaveBeenCalled();
      expect(screen.getByText("Case updated successfully.")).toBeInTheDocument();
    });
  });

  it("updates case without adding timeline event when date/note are omitted", async () => {
    apiPatchMock.mockResolvedValueOnce({ case: baseCase });
    render(<CaseDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Update Case and Timeline")).toBeInTheDocument();
    });

    setUpdateFormSelects("pending");
    fireEvent.change(screen.getByLabelText("Closing Date"), {
      target: { value: "2026-05-15" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));

    await waitFor(() => {
      expect(apiPatchMock).toHaveBeenCalledWith(
        "/api/cases/507f1f77bcf86cd799439011",
        expect.objectContaining({
          status: "pending",
          closing_date: "2026-05-15",
          timeline: baseCase.timeline,
        }),
      );
    });
  });

  it("falls back to generic update validation error when schema returns no issues", async () => {
    const safeParseSpy = vi
      .spyOn(caseUpdateSchema, "safeParse")
      .mockReturnValue({ success: false, error: { issues: [] } } as never);

    render(<CaseDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Update Case and Timeline")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));

    await waitFor(() => {
      expect(screen.getByText("Invalid case update data.")).toBeInTheDocument();
    });

    safeParseSpy.mockRestore();
  });

  it("shows update failure when patch request errors", async () => {
    apiPatchMock.mockReset();
    apiPatchMock.mockRejectedValueOnce(new Error("patch failed"));
    render(<CaseDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Update Case and Timeline")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText("Event Date"), { target: { value: "2026-04-22" } });
    fireEvent.change(screen.getByLabelText("Event Note"), {
      target: { value: "Adjourned for additional documents" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));

    await waitFor(() => {
      expect(screen.getByText("Failed to update case.")).toBeInTheDocument();
    });
  });

  it("handles upload validation, success, and failure", async () => {
    apiUploadMock.mockResolvedValueOnce({ document: { _id: "d1" } });
    render(<CaseDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Upload Document")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Upload" }));
    await waitFor(() => {
      expect(screen.getByText("Select a file to upload.")).toBeInTheDocument();
    });

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [] } });

    const file = new File(["pdf"], "brief.pdf", { type: "application/pdf" });
    fireEvent.change(fileInput, { target: { files: [file] } });

    fireEvent.click(screen.getByRole("button", { name: "Upload" }));
    await waitFor(() => {
      expect(screen.getByText("At least one tag is required.")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText("Tags (comma separated)"), {
      target: { value: "evidence,affidavit" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Upload" }));

    await waitFor(() => {
      expect(apiUploadMock).toHaveBeenCalled();
      expect(screen.getByText("Document uploaded successfully.")).toBeInTheDocument();
    });

    apiUploadMock.mockRejectedValueOnce(new Error("upload failed"));
    fireEvent.change(fileInput, { target: { files: [file] } });
    fireEvent.change(screen.getByLabelText("Tags (comma separated)"), {
      target: { value: "evidence" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Upload" }));

    await waitFor(() => {
      expect(screen.getByText("Failed to upload document.")).toBeInTheDocument();
    });
  });
});
