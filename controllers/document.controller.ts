import { type NextRequest } from "next/server";

import { errorResponse, successResponse } from "@/lib/api";
import { requireSessionRole } from "@/lib/api-auth";
import { validateCsrf } from "@/lib/csrf";
import {
  assertUploadFile,
  documentMetaSchema,
  documentTagQuerySchema,
} from "@/lib/validators/document.schema";
import { objectIdSchema } from "@/lib/validators/common";
import {
  listDocumentsByCase,
  uploadDocument,
} from "@/services/document.service";

function parseTags(rawTags: FormDataEntryValue | null): string[] {
  if (typeof rawTags !== "string") {
    return [];
  }

  const trimmed = rawTags.trim();
  if (!trimmed) {
    return [];
  }

  if (trimmed.startsWith("[")) {
    try {
      const jsonValue = JSON.parse(trimmed);
      return Array.isArray(jsonValue)
        ? jsonValue.map((entry) => String(entry).trim()).filter(Boolean)
        : [];
    } catch {
      return [];
    }
  }

  return trimmed
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export async function handleListDocuments(
  request: NextRequest,
  caseId: string,
) {
  try {
    requireSessionRole(request, ["super_admin", "admin", "lawyer", "clerk"]);
    const parsedCaseId = objectIdSchema.parse(caseId);

    const url = new URL(request.url);
    const query = documentTagQuerySchema.parse({
      case_id: parsedCaseId,
      tag: url.searchParams.get("tag") ?? undefined,
    });

    const documents = await listDocumentsByCase(parsedCaseId, query.tag);

    return successResponse({ documents });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function handleUploadDocument(
  request: NextRequest,
  caseId: string,
) {
  try {
    await validateCsrf(request);
    const session = requireSessionRole(request, [
      "super_admin",
      "admin",
      "lawyer",
      "clerk",
    ]);

    const parsedCaseId = objectIdSchema.parse(caseId);
    const formData = await request.formData();
    const fileEntry = formData.get("file");

    if (!(fileEntry instanceof File)) {
      return successResponse(
        {
          error: "Validation failed",
          details: [{ field: "file", message: "file is required" }],
        },
        400,
      );
    }

    assertUploadFile(fileEntry);

    const metadata = documentMetaSchema.parse({
      case_id: parsedCaseId,
      tags: parseTags(formData.get("tags")),
    });

    const saved = await uploadDocument({
      file: fileEntry,
      metadata,
      uploadedBy: session.sub,
    });

    return successResponse({ document: saved }, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
