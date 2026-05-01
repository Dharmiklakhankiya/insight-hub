import { z } from "zod";

import { USER_ROLES } from "@/lib/constants";
import { safeText } from "@/lib/validators/common";

/**
 * Login schema – unchanged; any role can log in.
 */
export const loginSchema = z
  .object({
    email: z.string().trim().email("Invalid email address").max(120),
    password: z
      .string()
      .min(1, "Password is required")
      .max(128, "Password must be at most 128 characters"),
  })
  .strict();

/**
 * Self-registration is disabled. Users are created by ADMIN / SUPER_ADMIN
 * through the user management endpoints. This register schema is kept for
 * the initial SUPER_ADMIN seed only.
 */
export const registerSchema = z
  .object({
    name: safeText("name", 2, 80),
    email: z.string().trim().email("Invalid email address").max(120),
    password: z
      .string()
      .min(10, "Password must be at least 10 characters")
      .max(128, "Password must be at most 128 characters")
      .regex(/[A-Z]/, "Password must include an uppercase letter")
      .regex(/[a-z]/, "Password must include a lowercase letter")
      .regex(/[\d]/, "Password must include a number"),
    role: z.enum(USER_ROLES).default("clerk"),
    tenantId: z.string().nullable().optional(),
  })
  .strict();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
