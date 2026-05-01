import { model, models, Schema, Types, type InferSchemaType } from "mongoose";

import { USER_ROLES } from "@/lib/constants";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 120,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: USER_ROLES,
      required: true,
      default: "clerk",
    },
    tenantId: {
      type: Types.ObjectId,
      ref: "Tenant",
      required: false,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export type UserDocument = InferSchemaType<typeof userSchema>;

export const UserModel = models.User || model("User", userSchema);
