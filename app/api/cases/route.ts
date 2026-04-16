import { type NextRequest } from "next/server";

import { handleCreateCase, handleListCases } from "@/controllers/case.controller";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return handleListCases(request);
}

export async function POST(request: NextRequest) {
  return handleCreateCase(request);
}
