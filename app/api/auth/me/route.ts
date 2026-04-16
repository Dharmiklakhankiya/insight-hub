import { type NextRequest } from "next/server";

import { handleMe } from "@/controllers/auth.controller";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return handleMe(request);
}
