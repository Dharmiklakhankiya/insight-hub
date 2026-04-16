import { z } from "zod";

import { hasSuspiciousContent, sanitizeText } from "@/lib/sanitize";

export const objectIdSchema = z
  .string()
  .trim()
  .regex(/^[a-f\d]{24}$/i, "Invalid identifier format");

export const safeText = (label: string, min = 2, max = 120) =>
  z
    .string()
    .trim()
    .min(min, `${label} must be at least ${min} characters`)
    .max(max, `${label} must be at most ${max} characters`)
    .transform((value) => sanitizeText(value))
    .refine((value) => !hasSuspiciousContent(value), {
      message: `${label} contains unsafe content`,
    });

export const isoDateSchema = z
  .string()
  .trim()
  .refine((value) => !Number.isNaN(new Date(value).valueOf()), "Invalid date");
