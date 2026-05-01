import { type NextRequest } from "next/server";

import { handleResetPassword } from "@/controllers/user.controller";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  return handleResetPassword(request);
}
