import { type NextRequest } from "next/server";

import { handleLogin } from "@/controllers/auth.controller";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  return handleLogin(request);
}
