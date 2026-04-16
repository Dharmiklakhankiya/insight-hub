"use client";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useParams } from "next/navigation";
import { type FormEvent, useEffect, useMemo, useState } from "react";

import { apiGet, apiPatch, apiUpload } from "@/lib/client-api";
import type { CaseItem, DocumentItem } from "@/lib/types";
import { caseUpdateSchema } from "@/lib/validators/case.schema";

type CaseDetailResponse = {
  case: CaseItem;
};

type DocumentResponse = {
  document: DocumentItem;
};

export default function CaseDetailPage() {
  const params = useParams<{ id: string }>();
  const caseId = useMemo(() => params.id, [params.id]);

  const [record, setRecord] = useState<CaseItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [status, setStatus] = useState<CaseItem["status"]>("ongoing");
  const [closingDate, setClosingDate] = useState("");
  const [timelineType, setTimelineType] = useState<
    "filing" | "hearing" | "adjournment" | "judgment"
  >("hearing");
  const [timelineDate, setTimelineDate] = useState("");
  const [timelineNote, setTimelineNote] = useState("");

  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileTags, setFileTags] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  async function loadCase() {
    try {
      setLoading(true);
      setError(null);

      const response = await apiGet<CaseDetailResponse>(`/api/cases/${caseId}`);
      setRecord(response.case);
      setStatus(response.case.status);
      setClosingDate(response.case.closing_date ? response.case.closing_date.slice(0, 10) : "");
    } catch {
      setError("Failed to load case details.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!caseId) {
      return;
    }

    void loadCase();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId]);

  async function handleUpdateCase(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setUpdateError(null);
    setUpdateSuccess(null);

    if (!record) {
      return;
    }

    const nextTimeline =
      timelineDate && timelineNote.trim()
        ? [
            ...record.timeline,
            {
              type: timelineType,
              date: timelineDate,
              note: timelineNote,
            },
          ]
        : record.timeline;

    const payload = {
      status,
      closing_date: closingDate ? closingDate : null,
      timeline: nextTimeline,
    };

    const parsed = caseUpdateSchema.safeParse(payload);
    if (!parsed.success) {
      setUpdateError(parsed.error.issues[0]?.message ?? "Invalid case update data.");
      return;
    }

    try {
      await apiPatch<CaseDetailResponse, typeof parsed.data>(
        `/api/cases/${caseId}`,
        parsed.data,
      );
      await loadCase();
      setTimelineDate("");
      setTimelineNote("");
      setUpdateSuccess("Case updated successfully.");
    } catch {
      setUpdateError("Failed to update case.");
    }
  }

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setUploadError(null);
    setUploadSuccess(null);

    if (!selectedFile) {
      setUploadError("Select a file to upload.");
      return;
    }

    const tags = fileTags
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);

    if (tags.length === 0) {
      setUploadError("At least one tag is required.");
      return;
    }

    const formData = new FormData();
    formData.set("file", selectedFile);
    formData.set("tags", tags.join(","));

    try {
      await apiUpload<DocumentResponse>(`/api/cases/${caseId}/documents`, formData);
      setSelectedFile(null);
      setFileTags("");
      setUploadSuccess("Document uploaded successfully.");
      await loadCase();
    } catch {
      setUploadError("Failed to upload document.");
    }
  }

  if (loading) {
    return (
      <Stack
        direction="row"
        spacing={2}
        className="py-10"
        sx={{ alignItems: "center" }}
      >
        <CircularProgress size={22} />
        <Typography>Loading case details...</Typography>
      </Stack>
    );
  }

  if (error || !record) {
    return <Alert severity="error">{error ?? "Case not found."}</Alert>;
  }

  return (
    <Stack spacing={3}>
      <Card elevation={0}>
        <CardContent>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            {record.title}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Client: {record.client_name} | Type: {record.case_type}
          </Typography>
          <Box className="mt-3 flex flex-wrap gap-2">
            <Chip label={record.status} color={record.status === "closed" ? "success" : "warning"} />
            <Chip label={`Court: ${record.court}`} variant="outlined" />
            <Chip label={`Judge: ${record.judge}`} variant="outlined" />
          </Box>
        </CardContent>
      </Card>

      <Card elevation={0}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
            Update Case and Timeline
          </Typography>
          <Stack component="form" spacing={2} onSubmit={handleUpdateCase}>
            {updateError ? <Alert severity="error">{updateError}</Alert> : null}
            {updateSuccess ? <Alert severity="success">{updateSuccess}</Alert> : null}

            <TextField
              select
              label="Status"
              value={status}
              onChange={(event) => setStatus(event.target.value as CaseItem["status"])}
            >
              <MenuItem value="ongoing">Ongoing</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="closed">Closed</MenuItem>
            </TextField>

            <TextField
              label="Closing Date"
              type="date"
              value={closingDate}
              onChange={(event) => setClosingDate(event.target.value)}
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
            />

            <Typography variant="subtitle2" color="text.secondary">
              Add Timeline Event (optional)
            </Typography>

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                select
                label="Event Type"
                value={timelineType}
                onChange={(event) =>
                  setTimelineType(
                    event.target.value as
                      | "filing"
                      | "hearing"
                      | "adjournment"
                      | "judgment",
                  )
                }
                className="min-w-40"
              >
                <MenuItem value="filing">Filing</MenuItem>
                <MenuItem value="hearing">Hearing</MenuItem>
                <MenuItem value="adjournment">Adjournment</MenuItem>
                <MenuItem value="judgment">Judgment</MenuItem>
              </TextField>
              <TextField
                label="Event Date"
                type="date"
                value={timelineDate}
                onChange={(event) => setTimelineDate(event.target.value)}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />
            </Stack>

            <TextField
              label="Event Note"
              value={timelineNote}
              onChange={(event) => setTimelineNote(event.target.value)}
              multiline
              minRows={2}
            />

            <Button type="submit" variant="contained">
              Save Changes
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Card elevation={0}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
            Upload Document
          </Typography>
          <Stack component="form" spacing={2} onSubmit={handleUpload}>
            {uploadError ? <Alert severity="error">{uploadError}</Alert> : null}
            {uploadSuccess ? <Alert severity="success">{uploadSuccess}</Alert> : null}

            <Button variant="outlined" component="label">
              {selectedFile ? selectedFile.name : "Choose File"}
              <input
                hidden
                type="file"
                onChange={(event) =>
                  setSelectedFile(event.target.files?.[0] ?? null)
                }
              />
            </Button>

            <TextField
              label="Tags (comma separated)"
              value={fileTags}
              onChange={(event) => setFileTags(event.target.value)}
              placeholder="evidence, affidavit"
            />

            <Button type="submit" variant="contained">
              Upload
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Card elevation={0}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
            Timeline
          </Typography>

          {record.timeline.length === 0 ? (
            <Alert severity="info">No timeline events available.</Alert>
          ) : (
            <Stack spacing={1.5}>
              {record.timeline.map((event, index) => (
                <Box
                  key={`${event.type}-${event.date}-${index}`}
                  className="rounded-lg px-3 py-2"
                  sx={{ backgroundColor: "rgba(0,95,115,0.08)" }}
                >
                  <Typography sx={{ fontWeight: 700 }}>
                    {event.type.toUpperCase()} - {new Date(event.date).toLocaleDateString()}
                  </Typography>
                  <Typography>{event.note}</Typography>
                </Box>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>

      <Card elevation={0}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
            Documents
          </Typography>

          {!record.documents || record.documents.length === 0 ? (
            <Alert severity="info">No documents uploaded for this case.</Alert>
          ) : (
            <Stack spacing={1.5}>
              {record.documents.map((document) => (
                <Box
                  key={document._id}
                  className="rounded-lg px-3 py-2"
                  sx={{
                    border: "1px solid rgba(0,0,0,0.08)",
                    backgroundColor: "#fff",
                  }}
                >
                  <Typography sx={{ fontWeight: 700 }}>{document.original_name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {document.mime_type} | {new Date(document.createdAt).toLocaleString()}
                  </Typography>
                  <Typography variant="body2">Tags: {document.tags.join(", ")}</Typography>
                </Box>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}
