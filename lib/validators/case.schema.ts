import { z } from "zod";

import { CASE_STATUSES, TIMELINE_EVENT_TYPES } from "@/lib/constants";
import { isoDateSchema, safeText } from "@/lib/validators/common";

export const timelineEventSchema = z
  .object({
    type: z.enum(TIMELINE_EVENT_TYPES),
    date: isoDateSchema,
    note: safeText("note", 2, 240),
  })
  .strict();

const caseBaseSchema = z
  .object({
    title: safeText("title", 3, 140),
    client_name: safeText("client_name", 3, 120),
    case_type: safeText("case_type", 2, 80),
    court: safeText("court", 2, 120),
    judge: safeText("judge", 2, 120),
    status: z.enum(CASE_STATUSES),
    assigned_lawyers: z
      .array(safeText("assigned_lawyer", 2, 80))
      .min(1, "At least one lawyer is required")
      .max(20, "Too many assigned lawyers"),
    filing_date: isoDateSchema,
    closing_date: isoDateSchema.optional().nullable(),
    timeline: z.array(timelineEventSchema).max(100).default([]),
  })
  .strict();

export const caseCreateSchema = caseBaseSchema.superRefine((data, ctx) => {
  if (data.closing_date) {
    const filing = new Date(data.filing_date).valueOf();
    const closing = new Date(data.closing_date).valueOf();
    if (closing < filing) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["closing_date"],
        message: "closing_date must be after filing_date",
      });
    }
  }
});

export const caseUpdateSchema = caseBaseSchema
  .partial()
  .strict()
  .superRefine((data, ctx) => {
    if (data.closing_date && data.filing_date) {
      const filing = new Date(data.filing_date).valueOf();
      const closing = new Date(data.closing_date).valueOf();
      if (closing < filing) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["closing_date"],
          message: "closing_date must be after filing_date",
        });
      }
    }
  });

export type CaseCreateInput = z.infer<typeof caseCreateSchema>;
export type CaseUpdateInput = z.infer<typeof caseUpdateSchema>;
export type TimelineEventInput = z.infer<typeof timelineEventSchema>;
