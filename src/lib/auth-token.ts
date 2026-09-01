import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET =
  process.env.JWT_SECRET || "hisabdo_jwt_secret_key_2026_production_safe_string_32chars";

const secretKey = new TextEncoder().encode(JWT_SECRET);

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  shopName?: string;
  phone?: string;
};

export async function createAuthToken(user: AuthUser): Promise<string> {
  return new SignJWT({
    sub: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    shopName: user.shopName || "",
    phone: user.phone || "",
    type: "access",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secretKey);
}

export async function createRefreshToken(user: AuthUser): Promise<string> {
  return new SignJWT({
    sub: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    shopName: user.shopName || "",
    phone: user.phone || "",
    type: "refresh",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}

export async function verifyAuthToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);

    if (payload.type !== "access") {
      return null;
    }

    return {
      id: payload.sub as string,
      name: (payload.name as string) || "",
      email: (payload.email as string) || "",
      role: (payload.role as "user" | "admin") || "user",
      shopName: (payload.shopName as string) || undefined,
      phone: (payload.phone as string) || undefined,
    };
  } catch (error) {
    return null;
  }
}

export async function verifyRefreshToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);

    if (payload.type !== "refresh") {
      return null;
    }

    return {
      id: payload.sub as string,
      name: (payload.name as string) || "",
      email: (payload.email as string) || "",
      role: (payload.role as "user" | "admin") || "user",
      shopName: (payload.shopName as string) || undefined,
      phone: (payload.phone as string) || undefined,
    };
  } catch (error) {
    return null;
  }
}