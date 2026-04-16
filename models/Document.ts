import { model, models, Schema, type InferSchemaType, Types } from "mongoose";

const documentSchema = new Schema(
  {
    case_id: {
      type: Types.ObjectId,
      ref: "Case",
      required: true,
      index: true,
    },
    tags: {
      type: [String],
      required: true,
      default: [],
      validate: {
        validator: (values: string[]) => values.length > 0,
        message: "At least one tag is required",
      },
    },
    file_path: {
      type: String,
      required: true,
    },
    mime_type: {
      type: String,
      required: true,
    },
    original_name: {
      type: String,
      required: true,
    },
    uploaded_by: {
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

documentSchema.index({ tags: 1 });

documentSchema.index({ case_id: 1, tags: 1 });

export type DocumentRecord = InferSchemaType<typeof documentSchema>;

export const DocumentModel =
  models.Document || model("Document", documentSchema);
