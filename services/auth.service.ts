import { connectDb } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { comparePassword, hashPassword, signSessionToken } from "@/lib/auth";
import type { LoginInput, RegisterInput } from "@/lib/validators/auth.schema";
import { UserModel } from "@/models/User";

type SafeUser = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "lawyer" | "clerk";
};

function toSafeUser(user: {
  _id: unknown;
  name: string;
  email: string;
  role: "admin" | "lawyer" | "clerk";
}): SafeUser {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export async function registerUser(input: RegisterInput): Promise<{
  user: SafeUser;
  token: string;
}> {
  await connectDb();

  const normalizedEmail = input.email.toLowerCase();
  const existingUser = await UserModel.findOne({
    email: normalizedEmail,
  }).lean();
  if (existingUser) {
    throw new AppError("Email is already registered", 409);
  }

  const passwordHash = await hashPassword(input.password);

  const createdUser = await UserModel.create({
    name: input.name,
    email: normalizedEmail,
    passwordHash,
    role: input.role,
  });

  const safeUser = toSafeUser({
    _id: createdUser._id,
    name: createdUser.name,
    email: createdUser.email,
    role: createdUser.role,
  });

  const token = signSessionToken({
    sub: safeUser.id,
    role: safeUser.role,
    email: safeUser.email,
  });

  return { user: safeUser, token };
}

export async function loginUser(input: LoginInput): Promise<{
  user: SafeUser;
  token: string;
}> {
  await connectDb();

  const normalizedEmail = input.email.toLowerCase();
  const user = await UserModel.findOne({ email: normalizedEmail });

  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const passwordMatches = await comparePassword(
    input.password,
    user.passwordHash,
  );
  if (!passwordMatches) {
    throw new AppError("Invalid credentials", 401);
  }

  const safeUser = toSafeUser({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  });

  const token = signSessionToken({
    sub: safeUser.id,
    role: safeUser.role,
    email: safeUser.email,
  });

  return { user: safeUser, token };
}

export async function getUserById(userId: string): Promise<SafeUser> {
  await connectDb();

  const user = await UserModel.findById(userId).lean();
  if (!user) {
    throw new AppError("User not found", 404);
  }

  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
  };
}
