import { z } from "zod";

import { USER_ROLES } from "@/lib/constants";
import { objectIdSchema, safeText } from "@/lib/validators/common";

/* ------------------------------------------------------------------ */
/*  Create user (admin-managed)                                        */
/* ------------------------------------------------------------------ */

export const createUserSchema = z
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
    role: z.enum(USER_ROLES),
    tenantId: z.string().nullable().optional(),
  })
  .strict();

export type CreateUserInput = z.infer<typeof createUserSchema>;

/* ------------------------------------------------------------------ */
/*  Update user                                                        */
/* ------------------------------------------------------------------ */

export const updateUserSchema = z
  .object({
    name: safeText("name", 2, 80).optional(),
    email: z.string().trim().email("Invalid email address").max(120).optional(),
    role: z.enum(USER_ROLES).optional(),
  })
  .strict();

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

/* ------------------------------------------------------------------ */
/*  Reset password                                                     */
/* ------------------------------------------------------------------ */

export const resetPasswordSchema = z
  .object({
    userId: objectIdSchema,
    newPassword: z
      .string()
      .min(10, "Password must be at least 10 characters")
      .max(128, "Password must be at most 128 characters")
      .regex(/[A-Z]/, "Password must include an uppercase letter")
      .regex(/[a-z]/, "Password must include a lowercase letter")
      .regex(/[\d]/, "Password must include a number"),
  })
  .strict();

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

/* ------------------------------------------------------------------ */
/*  Tenant schemas                                                     */
/* ------------------------------------------------------------------ */

export const createTenantSchema = z
  .object({
    name: safeText("name", 2, 120),
  })
  .strict();

export type CreateTenantInput = z.infer<typeof createTenantSchema>;

export const updateTenantSchema = z
  .object({
    name: safeText("name", 2, 120).optional(),
  })
  .strict();

export type UpdateTenantInput = z.infer<typeof updateTenantSchema>;
