import { z } from "zod";

import { AppError } from "@/lib/errors";

export async function parseJsonBody<T extends z.ZodTypeAny>(
  request: Request,
  schema: T,
): Promise<z.infer<T>> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    throw new AppError("Malformed JSON body", 400);
  }

  return schema.parse(body);
}

export function parseQuery<T extends z.ZodTypeAny>(
  entries: URLSearchParams,
  schema: T,
): z.infer<T> {
  const plain = Object.fromEntries(entries.entries());
  return schema.parse(plain);
}
