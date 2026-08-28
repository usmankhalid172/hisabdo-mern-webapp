import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("hisabdo_auth_token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    const response = NextResponse.redirect(new URL("/login", request.url));
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
