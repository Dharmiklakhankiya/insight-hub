import { NextRequest } from "next/server";

import { AppError } from "@/lib/errors";

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

function now(): number {
  return Date.now();
}

function getIp(request: NextRequest): string {
  const xForwardedFor = request.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    return xForwardedFor.split(",")[0].trim();
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}

export function checkRateLimit(
  request: NextRequest,
  keyPrefix: string,
  maxRequests: number,
  windowMs: number,
): void {
  const key = `${keyPrefix}:${getIp(request)}`;
  const current = buckets.get(key);
  const nowMs = now();

  if (!current || current.resetAt <= nowMs) {
    buckets.set(key, {
      count: 1,
      resetAt: nowMs + windowMs,
    });
    return;
  }

  if (current.count >= maxRequests) {
    throw new AppError("Too many requests", 429);
  }

  current.count += 1;
}

export function resetRateLimitStore(): void {
  buckets.clear();
}
