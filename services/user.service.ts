import type { SessionPayload } from "@/lib/auth";
import { hashPassword } from "@/lib/auth";
import type { UserRole } from "@/lib/constants";
import { connectDb } from "@/lib/db";
import { AppError } from "@/lib/errors";
import {
  assertCanManageUser,
  assertCanResetPassword,
  tenantFilter,
} from "@/lib/rbac";
import type {
  CreateUserInput,
  ResetPasswordInput,
  UpdateUserInput,
} from "@/lib/validators/user.schema";
import { UserModel } from "@/models/User";
import { type SafeUser, toSafeUser } from "@/services/auth.service";

/* ------------------------------------------------------------------ */
/*  List users (tenant-isolated)                                       */
/* ------------------------------------------------------------------ */

export async function listUsers(session: SessionPayload): Promise<SafeUser[]> {
  await connectDb();

  const filter = tenantFilter(session.role, session.tenantId);

  const users = await UserModel.find(filter).sort({ createdAt: -1 }).lean();

  return users.map((u) =>
    toSafeUser({
      _id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      tenantId: u.tenantId,
    }),
  );
}

/* ------------------------------------------------------------------ */
/*  Create user                                                        */
/* ------------------------------------------------------------------ */

export async function createUser(
  session: SessionPayload,
  input: CreateUserInput,
): Promise<SafeUser> {
  await connectDb();

  // Determine the tenant the new user will belong to
  let assignedTenantId: string | null = null;

  if (input.role === "super_admin") {
    // Only SUPER_ADMIN can create other SUPER_ADMINs (and they have no tenant)
    if (session.role !== "super_admin") {
      throw new AppError("Only SUPER_ADMIN can create SUPER_ADMIN users", 403);
    }
    assignedTenantId = null;
  } else if (session.role === "super_admin") {
    // SUPER_ADMIN must specify a tenantId for non-super_admin users
    if (!input.tenantId) {
      throw new AppError(
        "tenantId is required when SUPER_ADMIN creates a tenant-scoped user",
        400,
      );
    }
    assignedTenantId = input.tenantId;
  } else {
    // ADMIN creates users within their own tenant
    assignedTenantId = session.tenantId;
  }

  // Permission check
  assertCanManageUser(
    { role: session.role, tenantId: session.tenantId },
    { role: input.role, tenantId: assignedTenantId },
  );

  // Uniqueness
  const normalizedEmail = input.email.toLowerCase();
  const exists = await UserModel.findOne({ email: normalizedEmail }).lean();
  if (exists) {
    throw new AppError("Email is already registered", 409);
  }

  const passwordHash = await hashPassword(input.password);

  const created = await UserModel.create({
    name: input.name,
    email: normalizedEmail,
    passwordHash,
    role: input.role,
    tenantId: assignedTenantId,
  });

  return toSafeUser({
    _id: created._id,
    name: created.name,
    email: created.email,
    role: created.role,
    tenantId: created.tenantId,
  });
}

/* ------------------------------------------------------------------ */
/*  Update user                                                        */
/* ------------------------------------------------------------------ */

export async function updateUser(
  session: SessionPayload,
  userId: string,
  input: UpdateUserInput,
): Promise<SafeUser> {
  await connectDb();

  const target = await UserModel.findById(userId);
  if (!target) {
    throw new AppError("User not found", 404);
  }

  // Permission check against the CURRENT role of the target
  assertCanManageUser(
    { role: session.role, tenantId: session.tenantId },
    {
      role: target.role as UserRole,
      tenantId: target.tenantId ? String(target.tenantId) : null,
    },
  );

  // If changing the role, also check permission on the NEW role
  if (input.role && input.role !== target.role) {
    assertCanManageUser(
      { role: session.role, tenantId: session.tenantId },
      {
        role: input.role,
        tenantId: target.tenantId ? String(target.tenantId) : null,
      },
    );
  }

  // If changing email, ensure uniqueness
  if (input.email) {
    const normalizedEmail = input.email.toLowerCase();
    const duplicate = await UserModel.findOne({
      email: normalizedEmail,
      _id: { $ne: userId },
    }).lean();
    if (duplicate) {
      throw new AppError("Email is already registered", 409);
    }
    target.email = normalizedEmail;
  }

  if (input.name) target.name = input.name;
  if (input.role) target.role = input.role;

  await target.save();

  return toSafeUser({
    _id: target._id,
    name: target.name,
    email: target.email,
    role: target.role,
    tenantId: target.tenantId,
  });
}

/* ------------------------------------------------------------------ */
/*  Delete user                                                        */
/* ------------------------------------------------------------------ */

export async function deleteUser(
  session: SessionPayload,
  userId: string,
): Promise<void> {
  await connectDb();

  const target = await UserModel.findById(userId);
  if (!target) {
    throw new AppError("User not found", 404);
  }

  assertCanManageUser(
    { role: session.role, tenantId: session.tenantId },
    {
      role: target.role as UserRole,
      tenantId: target.tenantId ? String(target.tenantId) : null,
    },
  );

  await target.deleteOne();
}

/* ------------------------------------------------------------------ */
/*  Reset password                                                     */
/* ------------------------------------------------------------------ */

export async function resetPassword(
  session: SessionPayload,
  input: ResetPasswordInput,
): Promise<void> {
  await connectDb();

  const target = await UserModel.findById(input.userId);
  if (!target) {
    throw new AppError("User not found", 404);
  }

  assertCanResetPassword(
    { role: session.role, tenantId: session.tenantId },
    {
      role: target.role as UserRole,
      tenantId: target.tenantId ? String(target.tenantId) : null,
    },
  );

  target.passwordHash = await hashPassword(input.newPassword);
  await target.save();
}
