import { type NextRequest } from "next/server";

import { errorResponse, successResponse } from "@/lib/api";
import { requireSessionRole } from "@/lib/api-auth";
import { parseQuery } from "@/lib/request";
import { searchQuerySchema } from "@/lib/validators/search.schema";
import { searchCases } from "@/services/search.service";

export async function handleSearchCases(request: NextRequest) {
  try {
    requireSessionRole(request, ["admin", "lawyer", "clerk"]);

    const url = new URL(request.url);
    const query = parseQuery(url.searchParams, searchQuerySchema);
    const results = await searchCases(query);

    return successResponse(results);
  } catch (error) {
    return errorResponse(error);
  }
}
