import { z } from "zod";

import { USER_ROLES } from "@/lib/constants";
import { safeText } from "@/lib/validators/common";

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
  })
  .strict();

export const loginSchema = z
  .object({
    email: z.string().trim().email("Invalid email address").max(120),
    password: z
      .string()
      .min(1, "Password is required")
      .max(128, "Password must be at most 128 characters"),
  })
  .strict();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
