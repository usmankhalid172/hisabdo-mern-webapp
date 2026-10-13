import { NextRequest, NextResponse } from "next/server";
import {
  getAuthenticatedUser,
  getRequestToken,
  getSupabaseClient,
} from "@/lib/server-auth";

function errorResponse(message: string, status: number, extra: Record<string, unknown> = {}) {
  return NextResponse.json(
    { success: false, message, error: message, ...extra },
    { status }
  );
}

function formatCustomer(row: Record<string, any>) {
  const meta = (row.metadata as Record<string, any>) || {};
  return {
    ...row,
    _id: row.id,
    address: meta.address || null,
    city: meta.city || "Lahore",
    category: meta.category || "Retail",
    creditLimit: Number(meta.creditLimit ?? 50000),
    initialBalance: Number(meta.initialBalance ?? meta.opening_balance ?? 0),
    netBalance: Number(meta.netBalance ?? meta.opening_balance ?? 0),
    opening_balance: Number(meta.opening_balance ?? meta.initialBalance ?? 0),
    currency: meta.currency || "PKR",
    status: meta.status || (row.deleted_at ? "inactive" : "active"),
    paymentTermsDays: Number(meta.paymentTermsDays ?? 15),
  };
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return errorResponse("Please log in again to continue.", 401);
    }

    const token = getRequestToken(request);
    const supabase = await getSupabaseClient(token);

    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("GET /api/customers Supabase error:", error);
      return errorResponse("Unable to load customers. Please try again.", 500);
    }

    const formatted = (data || []).map(formatCustomer);

    return NextResponse.json({
      success: true,
      count: formatted.length,
      customers: formatted,
      data: formatted,
    });
  } catch (error) {
    console.error("GET /api/customers error:", error);
    return errorResponse("Unable to load customers. Please try again.", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return errorResponse("Please log in again to continue.", 401);
    }

    let body: Record<string, unknown>;

    try {
      body = await request.json();
    } catch {
      return errorResponse("Please submit valid customer information.", 400);
    }

    const name = String(body.name ?? "").trim();

    if (!name) {
      return errorResponse("Customer name is required.", 400, {
        fieldErrors: { name: ["Customer name is required."] },
      });
    }

    const phone = String(body.phone ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const address = String(body.address ?? "").trim();
    const city = String(body.city ?? "").trim();
    const category = String(body.category ?? "Retail").trim();
    const creditLimit = Number(body.creditLimit ?? 50000);
    const initialBalance = Number(body.initialBalance ?? 0);
    const paymentTermsDays = Number(body.paymentTermsDays ?? 15);

    if (!Number.isFinite(creditLimit) || creditLimit < 0) {
      return errorResponse("Credit limit must be 0 or greater.", 400, {
        fieldErrors: { creditLimit: ["Credit limit must be 0 or greater."] },
      });
    }

    if (!Number.isFinite(initialBalance)) {
      return errorResponse("Please enter a valid opening balance.", 400, {
        fieldErrors: { initialBalance: ["Please enter a valid opening balance."] },
      });
    }

    if (!Number.isFinite(paymentTermsDays) || paymentTermsDays < 0) {
      return errorResponse("Payment terms must be 0 or greater.", 400, {
        fieldErrors: { paymentTermsDays: ["Payment terms must be 0 or greater."] },
      });
    }

    const token = getRequestToken(request);
    const supabase = await getSupabaseClient(token);

    const customerToInsert = {
      client_uuid: crypto.randomUUID(),
      user_id: user.id,
      name,
      phone: phone || null,
      email: email || null,
      notes: String(body.notes || address || ""),
      metadata: {
        address: address || null,
        city: city || "Lahore",
        category: category || "Retail",
        creditLimit,
        initialBalance,
        netBalance: initialBalance,
        opening_balance: initialBalance,
        currency: "PKR",
        status: "active",
        paymentTermsDays,
      },
    };

    const { data: rawCustomer, error } = await supabase
      .from("customers")
      .insert(customerToInsert)
      .select("*")
      .single();

    if (error) {
      console.error("POST /api/customers Supabase error:", error);

      return errorResponse(
        "Customer could not be saved: " + (error.message || "Database constraint error"),
        500
      );
    }

    const customer = formatCustomer(rawCustomer);

    return NextResponse.json(
      {
        success: true,
        message: "Customer created successfully.",
        customer,
        data: customer,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/customers error:", error);
    return errorResponse("Unable to create customer. Please try again.", 500);
  }
}