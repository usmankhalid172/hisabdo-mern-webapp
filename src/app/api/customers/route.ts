import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/server-auth";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    const { data, error } = await supabaseServer
      .from("customers")
      .select("*")
      .eq("user_id", user.id)
      .order("id", { ascending: false });

    if (error) {
      console.error("Get customers error:", error);

      return NextResponse.json(
        { success: false, message: "Failed to fetch customers" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      customers: data,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    console.error("Customers GET error:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    const body = await request.json();

    const { name, phone, email } = body;

    if (!name || !String(name).trim()) {
      return NextResponse.json(
        { success: false, message: "Customer name is required" },
        { status: 400 }
      );
    }

    const trimmedPhone = phone ? String(phone).trim() : null;
    const trimmedEmail = email ? String(email).trim() : null;

    // Duplicate phone check within same account (empty phone is not checked)
    if (trimmedPhone) {
      const { data: existingPhone } = await supabaseServer
        .from("customers")
        .select("id, name")
        .eq("user_id", user.id)
        .eq("phone", trimmedPhone)
        .limit(1);

      if (existingPhone && existingPhone.length > 0) {
        return NextResponse.json(
          {
            success: false,
            message: `A customer with phone ${trimmedPhone} already exists (${existingPhone[0].name}).`,
          },
          { status: 400 }
        );
      }
    }

    // Duplicate email check within same account (empty email is not checked)
    if (trimmedEmail) {
      const { data: existingEmail } = await supabaseServer
        .from("customers")
        .select("id, name")
        .eq("user_id", user.id)
        .eq("email", trimmedEmail)
        .limit(1);

      if (existingEmail && existingEmail.length > 0) {
        return NextResponse.json(
          {
            success: false,
            message: `A customer with email ${trimmedEmail} already exists (${existingEmail[0].name}).`,
          },
          { status: 400 }
        );
      }
    }

    const { data, error } = await supabaseServer
      .from("customers")
      .insert({
        user_id: user.id,
        name: String(name).trim(),
        phone: trimmedPhone,
        email: trimmedEmail,
      })
      .select()
      .single();

    if (error) {
      console.error("Create customer error:", error);

      return NextResponse.json(
        { success: false, message: "Failed to create customer" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Customer created successfully",
        customer: data,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    console.error("Customers POST error:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}