import { errorResponse, successResponse } from "@/lib/api";
import { getOrCreateCsrfToken } from "@/lib/csrf";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const csrfToken = await getOrCreateCsrfToken();
    return successResponse({ csrfToken });
  } catch (error) {
    return errorResponse(error);
  }
}
