export const USER_ROLES = ["admin", "lawyer", "clerk"] as const;

export const CASE_STATUSES = ["ongoing", "closed", "pending"] as const;

export const TIMELINE_EVENT_TYPES = [
  "filing",
  "hearing",
  "adjournment",
  "judgment",
] as const;

export const AUTH_COOKIE_NAME = "insight_hub_auth";
export const CSRF_COOKIE_NAME = "insight_hub_csrf";
export const CSRF_HEADER_NAME = "x-csrf-token";

export const ALLOWED_UPLOAD_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
] as const;

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
