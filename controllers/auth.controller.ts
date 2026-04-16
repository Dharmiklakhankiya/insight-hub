import { type NextRequest } from "next/server";

import {
  AUTH_COOKIE_NAME,
  CSRF_COOKIE_NAME,
} from "@/lib/constants";
import { getAuthCookieOptions } from "@/lib/auth";
import { requireSession } from "@/lib/api-auth";
import { errorResponse, successResponse } from "@/lib/api";
import { getOrCreateCsrfToken, validateCsrf } from "@/lib/csrf";
import { parseJsonBody } from "@/lib/request";
import { checkRateLimit } from "@/lib/rate-limit";
import { loginSchema, registerSchema } from "@/lib/validators/auth.schema";
import { getUserById, loginUser, registerUser } from "@/services/auth.service";

export async function handleRegister(request: NextRequest) {
  try {
    checkRateLimit(request, "auth-register", 20, 15 * 60 * 1000);

    const input = await parseJsonBody(request, registerSchema);
    const { user, token } = await registerUser(input);
    const csrfToken = await getOrCreateCsrfToken();

    const response = successResponse({ user, csrfToken }, 201);
    response.cookies.set(AUTH_COOKIE_NAME, token, getAuthCookieOptions());

    return response;
  } catch (error) {
    return errorResponse(error);
  }
}

export async function handleLogin(request: NextRequest) {
  try {
    checkRateLimit(request, "auth-login", 15, 15 * 60 * 1000);

    const input = await parseJsonBody(request, loginSchema);
    const { user, token } = await loginUser(input);
    const csrfToken = await getOrCreateCsrfToken();

    const response = successResponse({ user, csrfToken });
    response.cookies.set(AUTH_COOKIE_NAME, token, getAuthCookieOptions());

    return response;
  } catch (error) {
    return errorResponse(error);
  }
}

export async function handleLogout(request: NextRequest) {
  try {
    await validateCsrf(request);

    const response = successResponse({ success: true });
    response.cookies.set(AUTH_COOKIE_NAME, "", {
      ...getAuthCookieOptions(),
      maxAge: 0,
    });
    response.cookies.set(CSRF_COOKIE_NAME, "", {
      httpOnly: false,
      sameSite: "strict",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    return errorResponse(error);
  }
}

export async function handleMe(request: NextRequest) {
  try {
    const session = requireSession(request);
    const user = await getUserById(session.sub);

    return successResponse({ user });
  } catch (error) {
    return errorResponse(error);
  }
}
