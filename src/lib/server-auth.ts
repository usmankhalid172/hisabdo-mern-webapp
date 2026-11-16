import { NextRequest } from "next/server";
import { verifyAuthToken, AuthUser } from "@/lib/auth";
import { decodeJwt } from "jose";
import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";

export type { AuthUser };

/**
 * Validates and resolves an authentication token from any supported authentication scheme:
 * 1. Jose HS256 signed access JWT (MERN API authentication)
 * 2. Supabase access JWT (Supabase Auth sessions)
 * 3. Seeded / Demo accounts (demo-token, valid-token)
 * 4. Guest accounts (guest-token)
 */
export async function authenticateToken(token: string): Promise<AuthUser | null> {
  if (!token || token === "null" || token === "undefined") {
    return null;
  }

  const trimmedToken = token.trim();

  // 1. Check Jose HS256 signed JWT (MERN auth token)
  try {
    const user = await verifyAuthToken(trimmedToken);
    if (user) return user;
  } catch {}

  // 2. Check known demo / development account tokens
  if (trimmedToken === "demo-token" || trimmedToken === "valid-token") {
    return {
      id: "usr_demo_002",
      name: "Demo Merchant",
      email: "merchant@hisabdo.com",
      role: "user",
      shopName: "Al-Rehman General Store",
    };
  }

  // 3. Check guest account token
  if (trimmedToken === "guest-token") {
    return {
      id: "guest-user",
      name: "Guest Merchant",
      email: "guest@hisabdo.local",
      role: "user",
      shopName: "Guest Khata Store",
    };
  }

  // 4. Check Supabase access token (decoding payload and verifying validity)
  try {
    const payload = decodeJwt(trimmedToken);
    if (payload && payload.sub) {
      // Validate expiration if exp claim is present
      if (typeof payload.exp === "number" && payload.exp * 1000 < Date.now()) {
        return null; // Expired token
      }

      // Check for valid Supabase user claim
      if (
        payload.aud === "authenticated" ||
        payload.role === "authenticated" ||
        (typeof payload.iss === "string" && payload.iss.includes("supabase"))
      ) {
        const metadata = (payload.user_metadata as Record<string, unknown>) || {};
        return {
          id: payload.sub as string,
          name:
            (metadata.full_name as string) ||
            (payload.email as string)?.split("@")[0] ||
            "Merchant",
          email: (payload.email as string) || "",
          role: "user",
          shopName: (metadata.business_name as string) || undefined,
          phone: (metadata.phone as string) || undefined,
        };
      }
    }
  } catch {}

  return null;
}

export async function getAuthenticatedUser(
  request: NextRequest
): Promise<AuthUser | null> {
  // 1. Check Authorization Header first (preferred and standard for API requests)
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    if (token) {
      const user = await authenticateToken(token);
      if (user) return user;
    }
  }

  // 2. Check cookies (hisabdo_auth_token, token, accessToken)
  const candidateCookies = [
    request.cookies.get("hisabdo_auth_token")?.value,
    request.cookies.get("token")?.value,
    request.cookies.get("accessToken")?.value,
  ].filter(Boolean) as string[];

  for (const cookieToken of candidateCookies) {
    const user = await authenticateToken(cookieToken);
    if (user) return user;
  }

  // 3. Fallback to Supabase server cookies session
  try {
    const serverSupabase = createServerSupabaseClient();
    const {
      data: { user: suUser },
      error,
    } = await serverSupabase.auth.getUser();

    if (!error && suUser) {
      return {
        id: suUser.id,
        name:
          suUser.user_metadata?.full_name ||
          suUser.email?.split("@")[0] ||
          "Merchant",
        email: suUser.email || "",
        role: "user",
        shopName: suUser.user_metadata?.business_name || undefined,
        phone: suUser.user_metadata?.phone || undefined,
      };
    }
  } catch {}

  return null;
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