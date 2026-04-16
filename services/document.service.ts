import { Types } from "mongoose";

import { connectDb } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { persistUploadedFile } from "@/lib/file-storage";
import type { DocumentMetaInput } from "@/lib/validators/document.schema";
import { CaseModel } from "@/models/Case";
import { DocumentModel } from "@/models/Document";

export async function uploadDocument(input: {
  file: File;
  metadata: DocumentMetaInput;
  uploadedBy: string;
}) {
  await connectDb();

  const caseExists = await CaseModel.exists({ _id: input.metadata.case_id });
  if (!caseExists) {
    throw new AppError("Case not found", 404);
  }

  const stored = await persistUploadedFile(input.file);

  const saved = await DocumentModel.create({
    case_id: new Types.ObjectId(input.metadata.case_id),
    tags: input.metadata.tags,
    file_path: stored.relativePath,
    mime_type: input.file.type,
    original_name: input.file.name,
    uploaded_by: new Types.ObjectId(input.uploadedBy),
  });

  return saved.toObject();
}

export async function listDocumentsByCase(caseId: string, tag?: string) {
  await connectDb();

  const query: { case_id: string; tags?: string } = {
    case_id: caseId,
  };

  if (tag) {
    query.tags = tag;
  }

  return DocumentModel.find(query).sort({ createdAt: -1 }).lean();
}
