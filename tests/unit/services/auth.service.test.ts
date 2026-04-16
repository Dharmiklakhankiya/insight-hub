import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppError } from "@/lib/errors";

const connectDbMock = vi.hoisted(() => vi.fn());
const hashPasswordMock = vi.hoisted(() => vi.fn());
const comparePasswordMock = vi.hoisted(() => vi.fn());
const signSessionTokenMock = vi.hoisted(() => vi.fn());

const findOneMock = vi.hoisted(() => vi.fn());
const createMock = vi.hoisted(() => vi.fn());
const findByIdMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/db", () => ({ connectDb: connectDbMock }));
vi.mock("@/lib/auth", () => ({
  hashPassword: hashPasswordMock,
  comparePassword: comparePasswordMock,
  signSessionToken: signSessionTokenMock,
}));
vi.mock("@/models/User", () => ({
  UserModel: {
    findOne: findOneMock,
    create: createMock,
    findById: findByIdMock,
  },
}));

import { getUserById, loginUser, registerUser } from "@/services/auth.service";

describe("auth.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    connectDbMock.mockResolvedValue(undefined);
    hashPasswordMock.mockResolvedValue("hashed");
    comparePasswordMock.mockResolvedValue(true);
    signSessionTokenMock.mockReturnValue("jwt-token");
  });

  it("rejects duplicate registration", async () => {
    findOneMock.mockReturnValue({ lean: vi.fn().mockResolvedValue({ _id: "x" }) });

    await expect(
      registerUser({
        name: "Neha",
        email: "neha@example.com",
        password: "StrongPass123",
        role: "lawyer",
      }),
    ).rejects.toMatchObject<AppError>({ message: "Email is already registered", statusCode: 409 });

    expect(createMock).not.toHaveBeenCalled();
  });

  it("registers new user and returns token payload", async () => {
    findOneMock.mockReturnValue({ lean: vi.fn().mockResolvedValue(null) });
    createMock.mockResolvedValue({
      _id: "user-1",
      name: "Neha",
      email: "neha@example.com",
      role: "lawyer",
    });

    const result = await registerUser({
      name: "Neha",
      email: "NEHA@EXAMPLE.COM",
      password: "StrongPass123",
      role: "lawyer",
    });

    expect(hashPasswordMock).toHaveBeenCalledWith("StrongPass123");
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({ email: "neha@example.com", passwordHash: "hashed" }),
    );
    expect(signSessionTokenMock).toHaveBeenCalledWith({
      sub: "user-1",
      role: "lawyer",
      email: "neha@example.com",
    });
    expect(result).toEqual({
      user: {
        id: "user-1",
        name: "Neha",
        email: "neha@example.com",
        role: "lawyer",
      },
      token: "jwt-token",
    });
  });

  it("fails login for missing user", async () => {
    findOneMock.mockResolvedValue(null);

    await expect(
      loginUser({ email: "missing@example.com", password: "StrongPass123" }),
    ).rejects.toMatchObject<AppError>({ message: "Invalid credentials", statusCode: 401 });
  });

  it("fails login for password mismatch", async () => {
    findOneMock.mockResolvedValue({
      _id: "u2",
      name: "Aarav",
      email: "aarav@example.com",
      role: "clerk",
      passwordHash: "hash",
    });
    comparePasswordMock.mockResolvedValue(false);

    await expect(
      loginUser({ email: "aarav@example.com", password: "WrongPass123" }),
    ).rejects.toMatchObject<AppError>({ message: "Invalid credentials", statusCode: 401 });
  });

  it("logs in valid user", async () => {
    findOneMock.mockResolvedValue({
      _id: "u3",
      name: "Admin",
      email: "admin@example.com",
      role: "admin",
      passwordHash: "hash",
    });
    comparePasswordMock.mockResolvedValue(true);

    const result = await loginUser({ email: "ADMIN@EXAMPLE.COM", password: "StrongPass123" });

    expect(findOneMock).toHaveBeenCalledWith({ email: "admin@example.com" });
    expect(signSessionTokenMock).toHaveBeenCalledWith({
      sub: "u3",
      role: "admin",
      email: "admin@example.com",
    });
    expect(result.user.role).toBe("admin");
  });

  it("fetches user by id or throws when missing", async () => {
    findByIdMock.mockReturnValueOnce({ lean: vi.fn().mockResolvedValue(null) });
    await expect(getUserById("missing-id")).rejects.toMatchObject<AppError>({
      message: "User not found",
      statusCode: 404,
    });

    findByIdMock.mockReturnValueOnce({
      lean: vi.fn().mockResolvedValue({
        _id: "u4",
        name: "Clerk",
        email: "clerk@example.com",
        role: "clerk",
      }),
    });

    await expect(getUserById("u4")).resolves.toEqual({
      id: "u4",
      name: "Clerk",
      email: "clerk@example.com",
      role: "clerk",
    });
  });
});
