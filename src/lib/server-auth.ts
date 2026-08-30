import { NextRequest } from "next/server";
import { verifyAuthToken, AuthUser } from "@/lib/auth";
export async function getAuthenticatedUser(
  request: NextRequest
): Promise<AuthUser | null> {
  const token = request.cookies.get("hisabdo_auth_token")?.value;

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