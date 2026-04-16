import { type NextRequest } from "next/server";

import { handleAnalytics } from "@/controllers/analytics.controller";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return handleAnalytics(request);
}
