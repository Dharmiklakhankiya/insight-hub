import { z } from "zod";

import { CASE_STATUSES } from "@/lib/constants";
import { safeText } from "@/lib/validators/common";

export const searchQuerySchema = z
  .object({
    query: safeText("query", 1, 120).optional(),
    status: z.enum(CASE_STATUSES).optional(),
    court: safeText("court", 2, 120).optional(),
    judge: safeText("judge", 2, 120).optional(),
    page: z.coerce.number().int().min(1).max(100).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
    sortBy: z.enum(["createdAt", "filing_date", "title"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  })
  .strict();

export type SearchQueryInput = z.infer<typeof searchQuerySchema>;
