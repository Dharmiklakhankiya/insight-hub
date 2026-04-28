import crypto from "crypto";
import path from "path";
import { mkdir, writeFile } from "fs/promises";

import { AppError } from "@/lib/errors";

const uploadsDir = path.join(process.cwd(), "uploads");

export async function ensureUploadsDir(): Promise<void> {
  await mkdir(uploadsDir, { recursive: true });
}

export async function persistUploadedFile(file: File): Promise<{
  absolutePath: string;
  relativePath: string;
}> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const safeExt = path
    .extname(file.name)
    .toLowerCase()
    .replace(/[^.a-z0-9]/g, "");
  const generatedName = `${Date.now()}-${crypto.randomUUID()}${safeExt}`;
  const absolutePath = path.join(uploadsDir, generatedName);

  try {
    await ensureUploadsDir();
    await writeFile(absolutePath, buffer, { flag: "wx" });
  } catch {
    throw new AppError("Failed to persist uploaded file", 500);
  }

  return {
    absolutePath,
    relativePath: path.join("uploads", generatedName).replace(/\\/g, "/"),
  };
}
