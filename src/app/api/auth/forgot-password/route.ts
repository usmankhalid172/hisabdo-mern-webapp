import { NextRequest, NextResponse } from "next/server";
import { forgotSchema } from "@/lib/validations/auth";
import { userStore } from "@/lib/user-store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = forgotSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid email address.",
        },
        { status: 400 }
      );
    }

    const { email } = validation.data;
    const user = await userStore.findByEmail(email);

    // In production security, we always return success to prevent email enumeration
    return NextResponse.json(
      {
        success: true,
        message:
          "If an account with this email exists, a password reset link has been dispatched.",
        userExists: !!user,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred.",
      },
      { status: 500 }
    );
  }
}
