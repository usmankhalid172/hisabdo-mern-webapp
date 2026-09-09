import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json(
    {
      success: true,
      message: "Logged out successfully.",
    },
    { status: 200 }
  );

  // Clear HTTP-only auth cookies
  response.cookies.set("hisabdo_auth_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });

  response.cookies.set("hisabdo_refresh_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });

  return response;
}