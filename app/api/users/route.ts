import { type NextRequest } from "next/server";

import {
  handleCreateUser,
  handleListUsers,
} from "@/controllers/user.controller";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return handleListUsers(request);
}

export async function POST(request: NextRequest) {
  return handleCreateUser(request);
}
