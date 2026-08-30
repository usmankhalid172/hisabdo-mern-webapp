import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json(
    {
      success: true,
      message: "Logged out successfully",
    },
    { status: 200 }
  );

  response.cookies.delete("hisabdo_auth_token");
  response.cookies.delete("hisabdo_refresh_token");

  return response;
}