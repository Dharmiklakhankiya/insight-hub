/* @vitest-environment jsdom */

import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const apiGetMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/client-api", () => ({
  apiGet: apiGetMock,
}));

import DashboardPage from "@/app/(protected)/dashboard/page";
import AnalyticsPage from "@/app/(protected)/analytics/page";

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: any) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

const analyticsData = {
  totalCases: 10,
  activeCount: 7,
  closedCount: 3,
  caseTypeDistribution: [{ case_type: "Commercial", count: 4 }],
  averageCaseDuration: 14,
  lawyerWorkload: [{ lawyer: "Neha", caseCount: 3 }],
  insights: ["Most frequent case type is Commercial (4 cases)."],
};

describe("dashboard and analytics pages integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders dashboard success state with stats and insights", async () => {
    apiGetMock
      .mockResolvedValueOnce({ user: { name: "Neha Singh", role: "lawyer" } })
      .mockResolvedValueOnce(analyticsData);

    render(<DashboardPage />);
    expect(screen.getByText("Loading dashboard...")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Welcome back, Neha Singh")).toBeInTheDocument();
      expect(screen.getByText("Total Cases")).toBeInTheDocument();
      expect(screen.getByText("10")).toBeInTheDocument();
      expect(
        screen.getByText("Most frequent case type is Commercial (4 cases)."),
      ).toBeInTheDocument();
    });
  });

  it("renders dashboard empty insights and error states", async () => {
    apiGetMock
      .mockResolvedValueOnce({ user: { name: "Aarav", role: "clerk" } })
      .mockResolvedValueOnce({ ...analyticsData, insights: [] });

    const { unmount } = render(<DashboardPage />);

    await waitFor(() => {
      expect(
        screen.getByText("No insights available yet."),
      ).toBeInTheDocument();
    });

    unmount();

    apiGetMock.mockRejectedValueOnce(new Error("network"));
    render(<DashboardPage />);

    await waitFor(() => {
      expect(
        screen.getByText("Failed to load dashboard data."),
      ).toBeInTheDocument();
    });
  });

  it("renders analytics page success, empty, and error branches", async () => {
    apiGetMock.mockResolvedValueOnce(analyticsData);

    const { unmount } = render(<AnalyticsPage />);
    expect(screen.getByText("Loading analytics...")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Analytics")).toBeInTheDocument();
      expect(screen.getByText("Case Type Distribution")).toBeInTheDocument();
      expect(screen.getByText("Commercial")).toBeInTheDocument();
      expect(screen.getByText("Lawyer Workload")).toBeInTheDocument();
      expect(screen.getByText("Neha")).toBeInTheDocument();
      expect(
        screen.getByText("Most frequent case type is Commercial (4 cases)."),
      ).toBeInTheDocument();
    });

    unmount();

    apiGetMock.mockResolvedValueOnce({
      ...analyticsData,
      caseTypeDistribution: [],
      lawyerWorkload: [],
      insights: ["Fallback insight"],
    });
    render(<AnalyticsPage />);

    await waitFor(() => {
      expect(
        screen.getByText("No case type distribution data available."),
      ).toBeInTheDocument();
      expect(
        screen.getByText("No lawyer workload data available."),
      ).toBeInTheDocument();
      expect(screen.getByText("Fallback insight")).toBeInTheDocument();
    });

    apiGetMock.mockRejectedValueOnce(new Error("analytics failed"));
    render(<AnalyticsPage />);

    await waitFor(() => {
      expect(screen.getByText("Failed to load analytics.")).toBeInTheDocument();
    });
  });

  it("renders analytics fallback message when API returns empty payload", async () => {
    apiGetMock.mockResolvedValueOnce(undefined);

    render(<AnalyticsPage />);

    await waitFor(() => {
      expect(screen.getByText("Failed to load analytics.")).toBeInTheDocument();
    });
  });

  it("does not update analytics state after unmount", async () => {
    const successLoad = deferred<typeof analyticsData>();
    apiGetMock.mockImplementationOnce(() => successLoad.promise);

    const firstRender = render(<AnalyticsPage />);
    firstRender.unmount();

    successLoad.resolve(analyticsData);
    await Promise.resolve();

    const failedLoad = deferred<never>();
    apiGetMock.mockImplementationOnce(() => failedLoad.promise);

    const secondRender = render(<AnalyticsPage />);
    secondRender.unmount();

    failedLoad.reject(new Error("late analytics failure"));
    await Promise.resolve();

    expect(apiGetMock).toHaveBeenCalledTimes(2);
  });

  it("does not update dashboard state after unmount", async () => {
    const meLoad = deferred<{ user: { name: string; role: string } }>();
    const analyticsLoad = deferred<typeof analyticsData>();

    apiGetMock
      .mockImplementationOnce(() => meLoad.promise)
      .mockImplementationOnce(() => analyticsLoad.promise);

    const firstRender = render(<DashboardPage />);
    firstRender.unmount();

    meLoad.resolve({ user: { name: "Late User", role: "lawyer" } });
    analyticsLoad.resolve(analyticsData);
    await Promise.resolve();

    const failingMeLoad = deferred<never>();
    apiGetMock
      .mockImplementationOnce(() => failingMeLoad.promise)
      .mockResolvedValueOnce(analyticsData);

    const secondRender = render(<DashboardPage />);
    secondRender.unmount();

    failingMeLoad.reject(new Error("late dashboard failure"));
    await Promise.resolve();

    expect(apiGetMock).toHaveBeenCalledTimes(4);
  });
});
