import { NextRequest, NextResponse } from "next/server";
import {
  createAuthToken,
  verifyRefreshToken,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const refreshToken =
      request.cookies.get("hisabdo_refresh_token")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        {
          success: false,
          message: "Refresh token not found",
        },
        { status: 401 }
      );
    }

    const user = await verifyRefreshToken(refreshToken);

    if (!user) {
      const response = NextResponse.json(
        {
          success: false,
          message: "Invalid or expired refresh token",
        },
        { status: 401 }
      );

      response.cookies.delete("hisabdo_auth_token");
      response.cookies.delete("hisabdo_refresh_token");

      return response;
    }

    // Create a new short-lived access token
    const newAccessToken = await createAuthToken(user);

    const response = NextResponse.json(
      {
        success: true,
        message: "Token refreshed successfully",
      },
      { status: 200 }
    );

    response.cookies.set({
      name: "hisabdo_auth_token",
      value: newAccessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 15,
    });

    return response;
  } catch (error) {
    console.error("Refresh token error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to refresh token",
      },
      { status: 500 }
    );
  }
}