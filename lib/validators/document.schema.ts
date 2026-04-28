import multer from "multer";
import { z } from "zod";

import { ALLOWED_UPLOAD_MIME_TYPES, MAX_UPLOAD_BYTES } from "@/lib/constants";
import { AppError } from "@/lib/errors";
import { objectIdSchema, safeText } from "@/lib/validators/common";

export const uploadPolicy = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_UPLOAD_BYTES,
    files: 1,
  },
  fileFilter(_req, file, callback) {
    if (
      ALLOWED_UPLOAD_MIME_TYPES.includes(
        file.mimetype as (typeof ALLOWED_UPLOAD_MIME_TYPES)[number],
      )
    ) {
      callback(null, true);
      return;
    }

    callback(new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname));
  },
});

export const documentMetaSchema = z
  .object({
    case_id: objectIdSchema,
    tags: z
      .array(safeText("tag", 2, 40))
      .min(1)
      .max(20),
  })
  .strict();

export const documentTagQuerySchema = z
  .object({
    case_id: objectIdSchema.optional(),
    tag: safeText("tag", 2, 40).optional(),
  })
  .strict();

export function assertUploadFile(file: File): void {
  const mimeType = file.type;
  if (
    !ALLOWED_UPLOAD_MIME_TYPES.includes(
      mimeType as (typeof ALLOWED_UPLOAD_MIME_TYPES)[number],
    )
  ) {
    throw new AppError("Unsupported file type", 400);
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    throw new AppError("File exceeds upload size limit", 400);
  }
}

export type DocumentMetaInput = z.infer<typeof documentMetaSchema>;
