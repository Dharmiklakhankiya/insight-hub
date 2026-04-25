"use client";

import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

import { apiGet } from "@/lib/client-api";
import type { AnalyticsSummary } from "@/lib/types";

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadAnalytics() {
      try {
        setLoading(true);
        const response = await apiGet<AnalyticsSummary>("/api/analytics");
        if (active) {
          setData(response);
        }
      } catch {
        if (active) {
          setError("Failed to load analytics.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadAnalytics();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <Stack
        direction="row"
        spacing={2}
        className="py-10"
        sx={{ alignItems: "center" }}
      >
        <CircularProgress size={24} />
        <Typography>Loading analytics...</Typography>
      </Stack>
    );
  }

  if (error || !data) {
    return <Alert severity="error">{error ?? "Failed to load analytics."}</Alert>;
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h4" sx={{ fontWeight: 800 }}>
        Analytics
      </Typography>

      <Card elevation={0}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
            Case Type Distribution
          </Typography>

          {data.caseTypeDistribution.length === 0 ? (
            <Alert severity="info">No case type distribution data available.</Alert>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Case Type</TableCell>
                  <TableCell align="right">Count</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.caseTypeDistribution.map((item) => (
                  <TableRow key={item.case_type}>
                    <TableCell>{item.case_type}</TableCell>
                    <TableCell align="right">{item.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card elevation={0}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
            Lawyer Workload
          </Typography>

          {data.lawyerWorkload.length === 0 ? (
            <Alert severity="info">No lawyer workload data available.</Alert>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Lawyer</TableCell>
                  <TableCell align="right">Assigned Cases</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.lawyerWorkload.map((item) => (
                  <TableRow key={item.lawyer}>
                    <TableCell>{item.lawyer}</TableCell>
                    <TableCell align="right">{item.caseCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card elevation={0}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
            Insight Generator
          </Typography>
          <Stack spacing={1}>
            {data.insights.map((insight) => (
              <Box
                key={insight}
                className="rounded-lg px-3 py-2"
                sx={{
                  backgroundColor: "rgba(0,33,71,0.05)",
                  border: "none",
                }}
              >
                <Typography>{insight}</Typography>
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
