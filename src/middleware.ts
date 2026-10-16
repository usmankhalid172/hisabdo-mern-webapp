import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/auth-token";
import { decodeJwt } from "jose/jwt/decode";

const PROTECTED_ROUTES = [
  "/dashboard",
  "/customers",
  "/expenses",
  "/reports",
  "/profile",
  "/settings",
  "/businesses",
  "/cashbook",
  "/vendors",
  "/transactions",
];

const AUTH_ROUTES = ["/login", "/register", "/forgot-password"];

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // 1. Supabase email verification redirect: rewrite /?code=... to /auth/callback
  const code = searchParams.get("code");
  if (code && pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/callback";
    return NextResponse.rewrite(url);
  }

  const token = request.cookies.get("hisabdo_auth_token")?.value;
  const isGuestCookie = request.cookies.get("hisabdo_guest")?.value;
  const allCookies = request.cookies.getAll();
  const hasSupabaseToken = allCookies.some((c) => c.name.startsWith("sb-") && c.value);

  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  const isDemoSession = token === "demo-token";
  const isGuestSession = isGuestCookie === "true" || token === "guest-token";
  let isRealUser = false;

  if (hasSupabaseToken) {
    isRealUser = true;
  }

  if (token && !isDemoSession && !isGuestSession) {
    const user = await verifyAuthToken(token);
    if (user) {
      isRealUser = true;
    } else {
      // Validate if it is a valid, unexpired Supabase JWT
      try {
        const payload = decodeJwt(token);
        if (payload?.sub && payload?.exp && payload.exp * 1000 > Date.now()) {
          isRealUser = true;
        }
      } catch {}
    }
  }

  const isAuthenticated = isRealUser || isDemoSession || isGuestSession;

  // 2. Auth Route Protection (/login, /register, /forgot-password)
  if (isAuthRoute) {
    // If user is currently in demo or guest mode, end that session cleanly when accessing auth pages
    if (isDemoSession || isGuestSession) {
      const response = NextResponse.next();
      response.cookies.delete("hisabdo_guest");
      response.cookies.delete("hisabdo_auth_token");
      return response;
    }

    // Only genuine, verified logged-in users get redirected to dashboard
    if (isRealUser) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  }

  // 3. Protected Route Protection: Redirect unauthenticated visitors to /login
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/customers/:path*",
    "/expenses/:path*",
    "/reports/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/businesses/:path*",
    "/cashbook/:path*",
    "/vendors/:path*",
    "/transactions/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/verify-email",
  ],
};
