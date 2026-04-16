import { type NextRequest } from "next/server";

import {
  handleListDocuments,
  handleUploadDocument,
} from "@/controllers/document.controller";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return handleListDocuments(request, id);
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return handleUploadDocument(request, id);
}
