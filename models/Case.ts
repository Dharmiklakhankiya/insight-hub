import { model, models, Schema, type InferSchemaType, Types } from "mongoose";

import { CASE_STATUSES, TIMELINE_EVENT_TYPES } from "@/lib/constants";

const timelineSchema = new Schema(
  {
    type: {
      type: String,
      enum: TIMELINE_EVENT_TYPES,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    note: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 240,
    },
  },
  { _id: false },
);

const caseSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 140,
    },
    client_name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 120,
    },
    case_type: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    court: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    judge: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    status: {
      type: String,
      enum: CASE_STATUSES,
      required: true,
    },
    assigned_lawyers: {
      type: [String],
      required: true,
      validate: {
        validator: (values: string[]) => values.length > 0,
        message: "At least one lawyer is required",
      },
    },
    filing_date: {
      type: Date,
      required: true,
    },
    closing_date: {
      type: Date,
      required: false,
      default: null,
    },
    timeline: {
      type: [timelineSchema],
      default: [],
      required: true,
    },
    created_by: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

caseSchema.index({
  title: "text",
  client_name: "text",
  case_type: "text",
});

caseSchema.index({ status: 1, court: 1, judge: 1 });

export type CaseDocument = InferSchemaType<typeof caseSchema>;

export const CaseModel = models.Case || model("Case", caseSchema);
