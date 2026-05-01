import { type NextRequest } from "next/server";

import { errorResponse, successResponse } from "@/lib/api";
import { requireSessionRole } from "@/lib/api-auth";
import { getAnalyticsSummary } from "@/services/analytics.service";

export async function handleAnalytics(request: NextRequest) {
  try {
    requireSessionRole(request, ["super_admin", "admin", "lawyer", "clerk"]);

    const analytics = await getAnalyticsSummary();
    return successResponse(analytics);
  } catch (error) {
    return errorResponse(error);
  }
}
