import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { hashPassword, createAuthToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        {
          message: "Name, email and password are required",
        },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          message: "Password must be at least 6 characters",
        },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const { data: existingUser, error: findError } = await supabase
      .from("users")
      .select("id")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (findError) {
      console.error("User lookup error:", findError);

      return NextResponse.json(
        {
          message: "Something went wrong during registration",
        },
        { status: 500 }
      );
    }

    if (existingUser) {
      return NextResponse.json(
        {
          message: "User with this email already exists",
        },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const { data: user, error: insertError } = await supabase
      .from("users")
      .insert({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: "user",
      })
      .select("id, name, email, role")
      .single();

    if (insertError || !user) {
      console.error("User insert error:", insertError);

      return NextResponse.json(
        {
          message: "Something went wrong during registration",
        },
        { status: 500 }
      );
    }

    const token = await createAuthToken({
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json(
      {
        message: "Registration successful",
        token,
        user: {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);

    return NextResponse.json(
      {
        message: "Something went wrong during registration",
      },
      { status: 500 }
    );
  }
}