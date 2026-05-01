import { model, models, Schema, type InferSchemaType } from "mongoose";

const tenantSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      minlength: 2,
      maxlength: 120,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export type TenantDocument = InferSchemaType<typeof tenantSchema>;

export const TenantModel = models.Tenant || model("Tenant", tenantSchema);
