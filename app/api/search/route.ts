import { type NextRequest } from "next/server";

import { handleSearchCases } from "@/controllers/search.controller";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return handleSearchCases(request);
}
