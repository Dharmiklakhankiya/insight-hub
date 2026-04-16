import { type NextRequest } from "next/server";

import { handleRegister } from "@/controllers/auth.controller";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  return handleRegister(request);
}
