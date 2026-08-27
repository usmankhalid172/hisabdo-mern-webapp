import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import {
  verifyPassword,
  createAuthToken,
  createRefreshToken,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const { data: user, error } = await supabase
      .from("users")
      .select("id, name, email, password, role")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (error) {
      console.error("User lookup error:", error);
      return NextResponse.json(
        { message: "Something went wrong during login" },
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const passwordValid = await verifyPassword(password, user.password);

    if (!passwordValid) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const authUser = {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      role: user.role as "user" | "admin",
    };

    const accessToken = await createAuthToken(authUser);
    const refreshToken = await createRefreshToken(authUser);

    const response = NextResponse.json(
      {
        message: "Login successful",
        user: authUser,
      },
      { status: 200 }
    );

    response.cookies.set({
      name: "hisabdo_auth_token",
      value: accessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 15,
    });

    response.cookies.set({
      name: "hisabdo_refresh_token",
      value: refreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      { message: "Something went wrong during login" },
      { status: 500 }
    );
  }
}