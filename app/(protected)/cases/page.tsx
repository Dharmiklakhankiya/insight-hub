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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { type FormEvent, useEffect, useState } from "react";
import { ZodError } from "zod";

import { apiGet, apiPost } from "@/lib/client-api";
import type { CaseItem, PaginatedCases } from "@/lib/types";
import { caseCreateSchema } from "@/lib/validators/case.schema";

type CaseFilters = {
  query: string;
  status: "" | "ongoing" | "closed" | "pending";
  court: string;
  judge: string;
};

type CaseFormState = {
  title: string;
  client_name: string;
  case_type: string;
  court: string;
  judge: string;
  status: "ongoing" | "closed" | "pending";
  assignedLawyersInput: string;
  filing_date: string;
  closing_date: string;
};

const initialCaseForm: CaseFormState = {
  title: "",
  client_name: "",
  case_type: "",
  court: "",
  judge: "",
  status: "ongoing",
  assignedLawyersInput: "",
  filing_date: "",
  closing_date: "",
};

function mapZodErrors(error: ZodError): Record<string, string> {
  return error.issues.reduce<Record<string, string>>((acc, issue) => {
    const key = issue.path[0] ? String(issue.path[0]) : "root";
    if (!acc[key]) {
      acc[key] = issue.message;
    }
    return acc;
  }, {});
}

function statusColor(
  status: CaseItem["status"],
): "default" | "primary" | "secondary" | "success" | "error" | "warning" {
  if (status === "closed") {
    return "default";
  }

  if (status === "ongoing") {
    return "success";
  }

  if (status === "pending") {
    return "warning";
  }

  return "secondary";
}

export default function CasesPage() {
  const [filters, setFilters] = useState<CaseFilters>({
    query: "",
    status: "",
    court: "",
    judge: "",
  });

  const [listData, setListData] = useState<PaginatedCases | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [caseForm, setCaseForm] = useState<CaseFormState>(initialCaseForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  async function loadCases() {
    try {
      setLoadingList(true);
      setListError(null);

      const params = new URLSearchParams();
      if (filters.query) {
        params.set("query", filters.query);
      }
      if (filters.status) {
        params.set("status", filters.status);
      }
      if (filters.court) {
        params.set("court", filters.court);
      }
      if (filters.judge) {
        params.set("judge", filters.judge);
      }
      params.set("page", "1");
      params.set("limit", "20");

      const response = await apiGet<PaginatedCases>(
        `/api/cases?${params.toString()}`,
      );
      setListData(response);
    } catch {
      setListError("Failed to load cases.");
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    void loadCases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreateCase(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreateError(null);
    setCreateSuccess(null);
    setFormErrors({});
    setCreating(true);

    try {
      const assignedLawyers = caseForm.assignedLawyersInput
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean);

      const payload = {
        title: caseForm.title,
        client_name: caseForm.client_name,
        case_type: caseForm.case_type,
        court: caseForm.court,
        judge: caseForm.judge,
        status: caseForm.status,
        assigned_lawyers: assignedLawyers,
        filing_date: caseForm.filing_date,
        closing_date: caseForm.closing_date || null,
        timeline: [
          {
            type: "filing" as const,
            date: caseForm.filing_date,
            note: `Case filed for ${caseForm.client_name}`,
          },
        ],
      };

      const parsed = caseCreateSchema.safeParse(payload);
      if (!parsed.success) {
        setFormErrors(mapZodErrors(parsed.error));
        return;
      }

      await apiPost<{ case: CaseItem }, typeof parsed.data>(
        "/api/cases",
        parsed.data,
      );

      setCreateSuccess("Case created successfully.");
      setCaseForm(initialCaseForm);
      await loadCases();
    } catch {
      setCreateError("Failed to create case.");
    } finally {
      setCreating(false);
    }
  }

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await loadCases();
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h4" sx={{ fontWeight: 800 }}>
        Case Management
      </Typography>

      <Card elevation={0}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
            Search and Filter Cases
          </Typography>
          <Stack
            component="form"
            onSubmit={handleSearch}
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            sx={{
              alignItems: {
                md: "flex-end",
              },
            }}
          >
            <TextField
              label="Search"
              value={filters.query}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, query: event.target.value }))
              }
              fullWidth
            />
            <TextField
              label="Status"
              select
              value={filters.status}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  status: event.target.value as CaseFilters["status"],
                }))
              }
              className="min-w-44"
            >
              <MenuItem value="">Any</MenuItem>
              <MenuItem value="ongoing">Ongoing</MenuItem>
              <MenuItem value="closed">Closed</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
            </TextField>
            <TextField
              label="Court"
              value={filters.court}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, court: event.target.value }))
              }
            />
            <TextField
              label="Judge"
              value={filters.judge}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, judge: event.target.value }))
              }
            />
            <Button type="submit" variant="contained">
              Apply
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Card elevation={0}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
            Create New Case
          </Typography>

          <Stack component="form" spacing={2} onSubmit={handleCreateCase}>
            {createError ? <Alert severity="error">{createError}</Alert> : null}
            {createSuccess ? (
              <Alert severity="success">{createSuccess}</Alert>
            ) : null}

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                label="Title"
                value={caseForm.title}
                onChange={(event) =>
                  setCaseForm((prev) => ({
                    ...prev,
                    title: event.target.value,
                  }))
                }
                error={Boolean(formErrors.title)}
                helperText={formErrors.title}
                fullWidth
                required
              />
              <TextField
                label="Client Name"
                value={caseForm.client_name}
                onChange={(event) =>
                  setCaseForm((prev) => ({
                    ...prev,
                    client_name: event.target.value,
                  }))
                }
                error={Boolean(formErrors.client_name)}
                helperText={formErrors.client_name}
                fullWidth
                required
              />
            </Stack>

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                label="Case Type"
                value={caseForm.case_type}
                onChange={(event) =>
                  setCaseForm((prev) => ({
                    ...prev,
                    case_type: event.target.value,
                  }))
                }
                error={Boolean(formErrors.case_type)}
                helperText={formErrors.case_type}
                fullWidth
                required
              />
              <TextField
                label="Court"
                value={caseForm.court}
                onChange={(event) =>
                  setCaseForm((prev) => ({
                    ...prev,
                    court: event.target.value,
                  }))
                }
                error={Boolean(formErrors.court)}
                helperText={formErrors.court}
                fullWidth
                required
              />
              <TextField
                label="Judge"
                value={caseForm.judge}
                onChange={(event) =>
                  setCaseForm((prev) => ({
                    ...prev,
                    judge: event.target.value,
                  }))
                }
                error={Boolean(formErrors.judge)}
                helperText={formErrors.judge}
                fullWidth
                required
              />
            </Stack>

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                label="Status"
                select
                value={caseForm.status}
                onChange={(event) =>
                  setCaseForm((prev) => ({
                    ...prev,
                    status: event.target.value as CaseFormState["status"],
                  }))
                }
                className="min-w-44"
              >
                <MenuItem value="ongoing">Ongoing</MenuItem>
                <MenuItem value="closed">Closed</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
              </TextField>

              <TextField
                label="Assigned Lawyers (comma separated)"
                value={caseForm.assignedLawyersInput}
                onChange={(event) =>
                  setCaseForm((prev) => ({
                    ...prev,
                    assignedLawyersInput: event.target.value,
                  }))
                }
                error={Boolean(formErrors.assigned_lawyers)}
                helperText={formErrors.assigned_lawyers}
                fullWidth
                required
              />
            </Stack>

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                label="Filing Date"
                type="date"
                value={caseForm.filing_date}
                onChange={(event) =>
                  setCaseForm((prev) => ({
                    ...prev,
                    filing_date: event.target.value,
                  }))
                }
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
                error={Boolean(formErrors.filing_date)}
                helperText={formErrors.filing_date}
                required
              />
              <TextField
                label="Closing Date"
                type="date"
                value={caseForm.closing_date}
                onChange={(event) =>
                  setCaseForm((prev) => ({
                    ...prev,
                    closing_date: event.target.value,
                  }))
                }
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
                error={Boolean(formErrors.closing_date)}
                helperText={formErrors.closing_date}
              />
            </Stack>

            <Button type="submit" variant="contained" disabled={creating}>
              {creating ? "Creating..." : "Create Case"}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Card elevation={0}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
            Cases
          </Typography>

          {loadingList ? (
            <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
              <CircularProgress size={20} />
              <Typography>Loading cases...</Typography>
            </Stack>
          ) : listError ? (
            <Alert severity="error">{listError}</Alert>
          ) : !listData || listData.items.length === 0 ? (
            <Alert severity="info">No cases found for current filters.</Alert>
          ) : (
            <Box className="overflow-x-auto">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Client</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Court</TableCell>
                    <TableCell>Filed</TableCell>
                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {listData.items.map((item) => (
                    <TableRow key={item._id} hover>
                      <TableCell>{item.title}</TableCell>
                      <TableCell>{item.client_name}</TableCell>
                      <TableCell>{item.case_type}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={item.status}
                          color={statusColor(item.status)}
                        />
                      </TableCell>
                      <TableCell>{item.court}</TableCell>
                      <TableCell>
                        {new Date(item.filing_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          component={Link}
                          href={`/cases/${item._id}`}
                          variant="outlined"
                          size="small"
                        >
                          Open
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}
