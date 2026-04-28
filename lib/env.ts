import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  MONGODB_URI: z
    .string()
    .trim()
    .min(1)
    .default("mongodb://localhost:27017/insight_hub"),
  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must be at least 32 characters")
    .default("change_this_development_only_jwt_secret_key_12345"),
  JWT_EXPIRES_IN: z.string().default("15m"),
  APP_URL: z.string().url().default("http://localhost:3000"),
});

export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
  APP_URL: process.env.APP_URL,
});

export const isProduction = env.NODE_ENV === "production";
