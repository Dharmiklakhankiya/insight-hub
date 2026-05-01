import { type NextRequest } from "next/server";

import { requireSessionRole } from "@/lib/api-auth";
import { errorResponse, successResponse } from "@/lib/api";
import { validateCsrf } from "@/lib/csrf";
import { parseJsonBody } from "@/lib/request";
import {
  createTenantSchema,
  updateTenantSchema,
} from "@/lib/validators/user.schema";
import {
  createTenant,
  deleteTenant,
  listTenants,
  updateTenant,
} from "@/services/tenant.service";

/* ------------------------------------------------------------------ */
/*  GET /api/tenants                                                   */
/* ------------------------------------------------------------------ */

export async function handleListTenants(request: NextRequest) {
  try {
    // SUPER_ADMIN only
    requireSessionRole(request, ["super_admin"]);
    const tenants = await listTenants();
    return successResponse({ tenants });
  } catch (error) {
    return errorResponse(error);
  }
}

/* ------------------------------------------------------------------ */
/*  POST /api/tenants                                                  */
/* ------------------------------------------------------------------ */

export async function handleCreateTenant(request: NextRequest) {
  try {
    await validateCsrf(request);
    requireSessionRole(request, ["super_admin"]);
    const input = await parseJsonBody(request, createTenantSchema);
    const tenant = await createTenant(input);
    return successResponse({ tenant }, 201);
  } catch (error) {
    return errorResponse(error);
  }
}

/* ------------------------------------------------------------------ */
/*  PATCH /api/tenants/[tenantId]                                      */
/* ------------------------------------------------------------------ */

export async function handleUpdateTenant(
  request: NextRequest,
  tenantId: string,
) {
  try {
    await validateCsrf(request);
    requireSessionRole(request, ["super_admin"]);
    const input = await parseJsonBody(request, updateTenantSchema);
    const tenant = await updateTenant(tenantId, input);
    return successResponse({ tenant });
  } catch (error) {
    return errorResponse(error);
  }
}

/* ------------------------------------------------------------------ */
/*  DELETE /api/tenants/[tenantId]                                     */
/* ------------------------------------------------------------------ */

export async function handleDeleteTenant(
  request: NextRequest,
  tenantId: string,
) {
  try {
    await validateCsrf(request);
    requireSessionRole(request, ["super_admin"]);
    await deleteTenant(tenantId);
    return successResponse({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
