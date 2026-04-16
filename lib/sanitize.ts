const suspiciousPatterns = [
  /<script/i,
  /javascript:/i,
  /onerror\s*=/i,
  /onload\s*=/i,
  /\{\s*"\$[a-z]+"\s*:/i,
  /\$ne|\$gt|\$lt|\$regex|\$where/i,
  /\.\.\//,
];

export function hasSuspiciousContent(value: string): boolean {
  const normalized = value.trim();
  return suspiciousPatterns.some((pattern) => pattern.test(normalized));
}

export function sanitizeText(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}
