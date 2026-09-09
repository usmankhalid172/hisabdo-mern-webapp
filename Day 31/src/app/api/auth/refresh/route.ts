import { NextRequest, NextResponse } from "next/server";
import { verifyRefreshToken, createAuthToken, createRefreshToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get("hisabdo_refresh_token")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        {
          success: false,
          message: "No refresh token provided.",
        },
        { status: 401 }
      );
    }

    const user = await verifyRefreshToken(refreshToken);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired refresh token. Please log in again.",
        },
        { status: 401 }
      );
    }

    // Generate new token pair
    const newAccessToken = await createAuthToken(user);
    const newRefreshToken = await createRefreshToken(user);

    const response = NextResponse.json(
      {
        success: true,
        message: "Token refreshed successfully.",
        token: newAccessToken,
        user,
      },
      { status: 200 }
    );

    response.cookies.set("hisabdo_auth_token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    response.cookies.set("hisabdo_refresh_token", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error("Token refresh error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to refresh token.",
      },
      { status: 500 }
    );
  }
}