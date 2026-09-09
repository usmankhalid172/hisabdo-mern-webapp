import { NextRequest } from "next/server";
import { verifyAuthToken, AuthUser } from "@/lib/auth";

export async function getAuthenticatedUser(
  request: NextRequest
): Promise<AuthUser | null> {
  // 1. Check HTTP-only cookie first
  let token = request.cookies.get("hisabdo_auth_token")?.value;

  // 2. Fallback to Authorization Header
  if (!token) {
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    return null;
  }

  const user = await verifyAuthToken(token);
  return user;
}

export async function requireAuth(
  request: NextRequest
): Promise<AuthUser> {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    throw new Error("UNAUTHORIZED");
  }

  return user;
}

export async function requireRole(
  request: NextRequest,
  role: "user" | "admin"
): Promise<AuthUser> {
  const user = await requireAuth(request);

  if (user.role !== role) {
    throw new Error("FORBIDDEN");
  }

  return user;
}