import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/auth-token";

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

  // ⚠️ NEW: Supabase email verification redirect
  // Root (/) pe ?code=... aaye to /auth/callback pe rewrite karo
  const code = searchParams.get("code");
  if (code && pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/callback";
    return NextResponse.rewrite(url);
  }

  const token = request.cookies.get("hisabdo_auth_token")?.value;
  const isGuest = request.cookies.get("hisabdo_guest")?.value;
  const allCookies = request.cookies.getAll();
  const hasSupabaseToken = allCookies.some((c) => c.name.startsWith("sb-") && c.value);

  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  let isAuthenticated = false;

  if (isGuest === "true") {
    isAuthenticated = true;
  } else if (hasSupabaseToken) {
    isAuthenticated = true;
  } else if (token) {
    if (token === "guest-token" || token === "demo-token") {
      isAuthenticated = true;
    } else {
      const user = await verifyAuthToken(token);
      if (user) {
        isAuthenticated = true;
      }
    }
  }

  // 1. Protected Route Protection
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Auth Route Protection
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
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
  ],
};