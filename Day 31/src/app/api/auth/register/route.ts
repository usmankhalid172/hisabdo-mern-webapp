import { NextRequest, NextResponse } from "next/server";
import { registerSchema } from "@/lib/validations/auth";
import { hashPassword, createAuthToken, createRefreshToken } from "@/lib/auth";
import { userStore } from "@/lib/user-store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validation = registerSchema.safeParse(body);
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

    const { name, email, password, phone, shopName } = validation.data;

    // Check if user already exists
    const existingUser = await userStore.findByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "An account with this email address already exists. Please log in.",
        },
        { status: 400 }
      );
    }

    // Hash password and save user
    const passwordHash = await hashPassword(password);
    const newUser = await userStore.createUser({
      name,
      email,
      passwordHash,
      phone,
      shopName,
      role: "user",
    });

    const authUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      phone: newUser.phone,
      shopName: newUser.shopName,
    };

    // Generate JWT access & refresh tokens
    const accessToken = await createAuthToken(authUser);
    const refreshToken = await createRefreshToken(authUser);

    const response = NextResponse.json(
      {
        success: true,
        message: "Account registered successfully!",
        user: authUser,
        token: accessToken,
      },
      { status: 201 }
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
    console.error("Registration error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "An unexpected error occurred during registration.",
      },
      { status: 500 }
    );
  }
}
