import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/server-auth";
import { supabaseServer } from "@/lib/supabase/server";
import { parsePhoneNumberFromString } from "libphonenumber-js";

// Normalize a name for comparison: trim, collapse whitespace, lowercase
function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

// Convert a phone number to E.164 format. Returns null if invalid.
// Falls back to PK country code (app default) if no country prefix is provided.
function toE164(phone: string): string | null {
  const trimmed = phone.trim();
  if (!trimmed) return null;

  // Try parsing with a default region of PK
  const parsed = parsePhoneNumberFromString(trimmed, "PK");
  if (parsed && parsed.isValid()) {
    return parsed.number; // already in E.164 format like +923001234567
  }

  // Try without a default region (works if user already typed +92...)
  const parsedIntl = parsePhoneNumberFromString(trimmed);
  if (parsedIntl && parsedIntl.isValid()) {
    return parsedIntl.number;
  }

  return null;
}

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

    const trimmedName = String(name).trim();
    const normalizedName = normalizeName(trimmedName);
    const trimmedEmail = email ? String(email).trim() : null;

    // Phone: convert to E.164 if provided (empty phone is not checked)
    let e164Phone: string | null = null;
    if (phone && String(phone).trim()) {
      e164Phone = toE164(String(phone));
      if (!e164Phone) {
        return NextResponse.json(
          { success: false, message: "Invalid phone number format" },
          { status: 400 }
        );
      }
    }

    // Fetch this user's customers for name and phone comparison
    const { data: existingCustomers, error: fetchError } = await supabaseServer
      .from("customers")
      .select("id, name, phone")
      .eq("user_id", user.id);

    if (fetchError) {
      console.error("Fetch customers for duplicate check failed:", fetchError);
      return NextResponse.json(
        { success: false, message: "Failed to verify duplicates" },
        { status: 500 }
      );
    }

    const customers = existingCustomers || [];

    // Duplicate name check (case-insensitive, whitespace-normalized)
    const nameMatch = customers.find(
      (c) => c.name && normalizeName(c.name) === normalizedName
    );
    if (nameMatch) {
      return NextResponse.json(
        {
          success: false,
          message: "A customer with this name already exists",
        },
        { status: 400 }
      );
    }

    // Duplicate phone check (E.164 comparison — empty phone is not checked)
    if (e164Phone) {
      const phoneMatch = customers.find((c) => {
        if (!c.phone) return false;
        const existingE164 = toE164(c.phone);
        return existingE164 && existingE164 === e164Phone;
      });
      if (phoneMatch) {
        return NextResponse.json(
          {
            success: false,
            message: "A customer with this phone already exists",
          },
          { status: 400 }
        );
      }
    }

    const { data, error } = await supabaseServer
      .from("customers")
      .insert({
        user_id: user.id,
        name: trimmedName,
        phone: e164Phone,
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