export const runtime = 'nodejs';
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

// Single direct encoding with fallback
const secretKey = new TextEncoder().encode(
  process.env.JWT_SECRET || "hisabdo_default_secret_fallback_key"
);

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
) {
  return bcrypt.compare(password, hashedPassword);
}
export async function createAuthToken(user: AuthUser) {
  return new SignJWT({
    sub: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    type: "access",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(secretKey);
}
export async function createRefreshToken(user: AuthUser) {
  return new SignJWT({
    sub: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    type: "refresh",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}
export async function verifyAuthToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secretKey);

    if (payload.type !== "access") {
      return null;
    }

    return {
      id: payload.sub as string,
      name: payload.name as string,
      email: payload.email as string,
      role: payload.role as "user" | "admin",
    };
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secretKey);

    if (payload.type !== "refresh") {
      return null;
    }

    return {
      id: payload.sub as string,
      name: payload.name as string,
      email: payload.email as string,
      role: payload.role as "user" | "admin",
    };
  } catch {
    return null;
  }
}