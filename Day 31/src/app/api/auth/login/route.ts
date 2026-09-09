import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/lib/validations/auth";
import { verifyPassword, createAuthToken, createRefreshToken } from "@/lib/auth";
import { userStore } from "@/lib/user-store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors;
      const firstError = Object.values(fieldErrors)[0]?.[0] || "Validation failed";
      return NextResponse.json(
        {
          success: false,
          message: firstError,
          fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    // Lookup user by email
    const user = await userStore.findByEmail(email);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password. Please check your credentials.",
        },
        { status: 401 }
      );
    }

    // Verify password against stored hash
    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password. Please check your credentials.",
        },
        { status: 401 }
      );
    }

    const authUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      shopName: user.shopName,
    };

    // Generate JWT access & refresh tokens
    const accessToken = await createAuthToken(authUser);
    const refreshToken = await createRefreshToken(authUser);

    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful!",
        user: authUser,
        token: accessToken,
      },
      { status: 200 }
    );

    // Set secure HTTP-only cookies
    response.cookies.set("hisabdo_auth_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    response.cookies.set("hisabdo_refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "An unexpected error occurred during login.",
      },
      { status: 500 }
    );
  }
}
