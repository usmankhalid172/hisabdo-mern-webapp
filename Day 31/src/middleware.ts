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
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("hisabdo_auth_token")?.value;

  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  let isAuthenticated = false;

  if (token) {
    const user = await verifyAuthToken(token);
    if (user) {
      isAuthenticated = true;
    }
  }

  // 1. Protected Route Protection: Redirect unauthenticated users to login
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);

    const response = NextResponse.redirect(loginUrl);
    if (token) {
      // Clear invalid/expired cookie
      response.cookies.set("hisabdo_auth_token", "", {
        path: "/",
        maxAge: 0,
      });
    }
    return response;
  }

  // 2. Auth Route Protection: Redirect already authenticated users to dashboard
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
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
