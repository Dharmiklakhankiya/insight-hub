import { type NextRequest } from "next/server";

import { errorResponse, successResponse } from "@/lib/api";
import { requireSessionRole } from "@/lib/api-auth";
import { validateCsrf } from "@/lib/csrf";
import { parseJsonBody, parseQuery } from "@/lib/request";
import {
  caseCreateSchema,
  caseUpdateSchema,
} from "@/lib/validators/case.schema";
import { objectIdSchema } from "@/lib/validators/common";
import { searchQuerySchema } from "@/lib/validators/search.schema";
import {
  createCase,
  deleteCase,
  getCaseById,
  listCases,
  updateCase,
} from "@/services/case.service";

export async function handleListCases(request: NextRequest) {
  try {
    requireSessionRole(request, ["super_admin", "admin", "lawyer", "clerk"]);

    const url = new URL(request.url);
    const query = parseQuery(url.searchParams, searchQuerySchema);
    const result = await listCases(query);

    return successResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function handleCreateCase(request: NextRequest) {
  try {
    await validateCsrf(request);
    const session = requireSessionRole(request, [
      "super_admin",
      "admin",
      "lawyer",
    ]);

    const input = await parseJsonBody(request, caseCreateSchema);
    const created = await createCase(input, session.sub);

    return successResponse({ case: created }, 201);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function handleGetCaseById(request: NextRequest, caseId: string) {
  try {
    requireSessionRole(request, ["super_admin", "admin", "lawyer", "clerk"]);

    const parsedId = objectIdSchema.parse(caseId);
    const result = await getCaseById(parsedId);

    return successResponse({ case: result });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function handleUpdateCase(request: NextRequest, caseId: string) {
  try {
    await validateCsrf(request);
    requireSessionRole(request, ["super_admin", "admin", "lawyer"]);

    const parsedId = objectIdSchema.parse(caseId);
    const input = await parseJsonBody(request, caseUpdateSchema);
    const updated = await updateCase(parsedId, input);

    return successResponse({ case: updated });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function handleDeleteCase(request: NextRequest, caseId: string) {
  try {
    await validateCsrf(request);
    requireSessionRole(request, ["super_admin", "admin", "lawyer"]);

    const parsedId = objectIdSchema.parse(caseId);
    await deleteCase(parsedId);

    return successResponse({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
