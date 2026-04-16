import { type NextRequest } from "next/server";

import {
  handleDeleteCase,
  handleGetCaseById,
  handleUpdateCase,
} from "@/controllers/case.controller";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return handleGetCaseById(request, id);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return handleUpdateCase(request, id);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return handleDeleteCase(request, id);
}
