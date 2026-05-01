import { type NextRequest } from "next/server";

import {
  handleDeleteUser,
  handleUpdateUser,
} from "@/controllers/user.controller";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ userId: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { userId } = await context.params;
  return handleUpdateUser(request, userId);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { userId } = await context.params;
  return handleDeleteUser(request, userId);
}
