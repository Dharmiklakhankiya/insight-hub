import { type NextRequest } from "next/server";

import { requireSessionRole } from "@/lib/api-auth";
import { errorResponse, successResponse } from "@/lib/api";
import { validateCsrf } from "@/lib/csrf";
import { parseJsonBody } from "@/lib/request";
import {
  createUserSchema,
  resetPasswordSchema,
  updateUserSchema,
} from "@/lib/validators/user.schema";
import {
  createUser,
  deleteUser,
  listUsers,
  resetPassword,
  updateUser,
} from "@/services/user.service";

/* ------------------------------------------------------------------ */
/*  GET /api/users                                                     */
/* ------------------------------------------------------------------ */

export async function handleListUsers(request: NextRequest) {
  try {
    const session = requireSessionRole(request, [
      "super_admin",
      "admin",
    ]);
    const users = await listUsers(session);
    return successResponse({ users });
  } catch (error) {
    return errorResponse(error);
  }
}

/* ------------------------------------------------------------------ */
/*  POST /api/users                                                    */
/* ------------------------------------------------------------------ */

export async function handleCreateUser(request: NextRequest) {
  try {
    await validateCsrf(request);
    const session = requireSessionRole(request, [
      "super_admin",
      "admin",
    ]);
    const input = await parseJsonBody(request, createUserSchema);
    const user = await createUser(session, input);
    return successResponse({ user }, 201);
  } catch (error) {
    return errorResponse(error);
  }
}

/* ------------------------------------------------------------------ */
/*  PATCH /api/users/[userId]                                          */
/* ------------------------------------------------------------------ */

export async function handleUpdateUser(
  request: NextRequest,
  userId: string,
) {
  try {
    await validateCsrf(request);
    const session = requireSessionRole(request, [
      "super_admin",
      "admin",
    ]);
    const input = await parseJsonBody(request, updateUserSchema);
    const user = await updateUser(session, userId, input);
    return successResponse({ user });
  } catch (error) {
    return errorResponse(error);
  }
}

/* ------------------------------------------------------------------ */
/*  DELETE /api/users/[userId]                                         */
/* ------------------------------------------------------------------ */

export async function handleDeleteUser(
  request: NextRequest,
  userId: string,
) {
  try {
    await validateCsrf(request);
    const session = requireSessionRole(request, [
      "super_admin",
      "admin",
    ]);
    await deleteUser(session, userId);
    return successResponse({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}

/* ------------------------------------------------------------------ */
/*  POST /api/users/reset-password                                     */
/* ------------------------------------------------------------------ */

export async function handleResetPassword(request: NextRequest) {
  try {
    await validateCsrf(request);
    const session = requireSessionRole(request, [
      "super_admin",
      "admin",
    ]);
    const input = await parseJsonBody(request, resetPasswordSchema);
    await resetPassword(session, input);
    return successResponse({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
