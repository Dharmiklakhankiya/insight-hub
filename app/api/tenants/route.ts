import { type NextRequest } from "next/server";

import {
  handleCreateTenant,
  handleListTenants,
} from "@/controllers/tenant.controller";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return handleListTenants(request);
}

export async function POST(request: NextRequest) {
  return handleCreateTenant(request);
}
