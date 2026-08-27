import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("hisabdo_auth_token")?.value;
  const pathname = request.nextUrl.pathname;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  const user = await verifyAuthToken(token);
  console.log("MIDDLEWARE TOKEN:", token ? "TOKEN EXISTS" : "NO TOKEN");
console.log("MIDDLEWARE USER:", user);
  if (!user) {
    const response = NextResponse.redirect(
      new URL("/login", request.url)
    );
    response.cookies.delete("hisabdo_auth_token");

    return response;
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
  ],
};