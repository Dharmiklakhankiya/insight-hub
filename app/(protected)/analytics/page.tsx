"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
      <div className="flex items-center gap-2 py-10">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900"></div>
        <span>Loading analytics...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {error ?? "Failed to load analytics."}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-3">
      <h1 className="text-4xl font-extrabold">Analytics</h1>

      <Card>
        <CardHeader>
          <CardTitle>Case Type Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {data.caseTypeDistribution.length === 0 ? (
            <Alert>
              <AlertDescription>
                No case type distribution data available.
              </AlertDescription>
            </Alert>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Case Type</TableCell>
                  <TableCell className="text-right">Count</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.caseTypeDistribution.map((item) => (
                  <TableRow key={item.case_type}>
                    <TableCell>{item.case_type}</TableCell>
                    <TableCell className="text-right">{item.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lawyer Workload</CardTitle>
        </CardHeader>
        <CardContent>
          {data.lawyerWorkload.length === 0 ? (
            <Alert>
              <AlertDescription>
                No lawyer workload data available.
              </AlertDescription>
            </Alert>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Lawyer</TableCell>
                  <TableCell className="text-right">Assigned Cases</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.lawyerWorkload.map((item) => (
                  <TableRow key={item.lawyer}>
                    <TableCell>{item.lawyer}</TableCell>
                    <TableCell className="text-right">
                      {item.caseCount}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Insight Generator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {data.insights.map((insight) => (
              <div
                key={insight}
                className="rounded-lg bg-[rgba(0,33,71,0.05)] px-3 py-2 border-none"
              >
                <p>{insight}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
