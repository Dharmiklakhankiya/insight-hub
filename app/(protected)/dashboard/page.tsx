"use client";

import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

import { apiGet } from "@/lib/client-api";
import type { AnalyticsSummary, User } from "@/lib/types";

type DashboardPayload = {
  user: User;
  analytics: AnalyticsSummary;
};

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <Card elevation={0} sx={{ borderLeft: `6px solid ${accent}` }}>
      <CardContent>
        <Typography color="text.secondary" variant="body2">
          {label}
        </Typography>
        <Typography variant="h4" sx={{ mt: 1, fontWeight: 800 }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        const [me, analytics] = await Promise.all([
          apiGet<{ user: User }>("/api/auth/me"),
          apiGet<AnalyticsSummary>("/api/analytics"),
        ]);

        if (!active) {
          return;
        }

        setData({
          user: me.user,
          analytics,
        });
      } catch {
        if (active) {
          setError("Failed to load dashboard data.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadDashboard();

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
        <Typography>Loading dashboard...</Typography>
      </Stack>
    );
  }

  if (error || !data) {
    return <Alert severity="error">{error ?? "Failed to load dashboard."}</Alert>;
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Welcome back, {data.user.name}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          Role: {data.user.role.toUpperCase()} | Track active caseload, outcomes, and workload distribution.
        </Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Total Cases"
            value={String(data.analytics.totalCases)}
            accent="#005f73"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Active Cases"
            value={String(data.analytics.activeCount)}
            accent="#0a9396"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Closed Cases"
            value={String(data.analytics.closedCount)}
            accent="#ca6702"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Avg Duration"
            value={`${Math.round(data.analytics.averageCaseDuration)} days`}
            accent="#ae2012"
          />
        </Grid>
      </Grid>

      <Card elevation={0}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            Deterministic Insights
          </Typography>

          {data.analytics.insights.length === 0 ? (
            <Typography color="text.secondary">No insights available yet.</Typography>
          ) : (
            <Stack spacing={1}>
              {data.analytics.insights.map((insight) => (
                <Box
                  key={insight}
                  className="rounded-lg px-3 py-2"
                  sx={{
                    backgroundColor: "rgba(0,95,115,0.08)",
                    border: "1px solid rgba(0,95,115,0.15)",
                  }}
                >
                  <Typography>{insight}</Typography>
                </Box>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}
