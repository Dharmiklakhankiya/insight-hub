import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { AppError, isAppError } from "@/lib/errors";

type ValidationDetail = {
  field: string;
  message: string;
};

export function successResponse<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

export function validationErrorResponse(error: ZodError): NextResponse {
  const details: ValidationDetail[] = error.issues.map((issue) => ({
    field: issue.path.join(".") || "root",
    message: issue.message,
  }));

  return NextResponse.json(
    {
      error: "Validation failed",
      details,
    },
    { status: 400 },
  );
}

export function errorResponse(error: unknown): NextResponse {
  if (error instanceof ZodError) {
    return validationErrorResponse(error);
  }

  if (isAppError(error)) {
    return NextResponse.json(
      {
        error: error.message,
        details: error.details ?? null,
      },
      { status: error.statusCode },
    );
  }

  console.error("Unhandled error", error);

  return NextResponse.json(
    {
      error: "Internal server error",
    },
    { status: 500 },
  );
}

export function assert(condition: unknown, message: string, statusCode = 400): asserts condition {
  if (!condition) {
    throw new AppError(message, statusCode);
  }
}
