import { type NextRequest } from "next/server";

import {
  handleDeleteTenant,
  handleUpdateTenant,
} from "@/controllers/tenant.controller";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ tenantId: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { tenantId } = await context.params;
  return handleUpdateTenant(request, tenantId);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { tenantId } = await context.params;
  return handleDeleteTenant(request, tenantId);
}
