import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getAuthenticatedUser } from "@/lib/server-auth";
import { handleBulkDelete } from "./bulk-delete-handler";

// Admin client that bypasses Postgres role restrictions
function getAdminSupabase() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_SUPABASE_URL ||
    "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return createSupabaseClient(url, serviceKey);
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      console.log("❌ GET /api/transactions: Unauthorized");
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const supabase = getAdminSupabase();
    const { data: transactions, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    if (error) {
      console.error("❌ Supabase Fetch Error:", error);
      throw error;
    }

    return NextResponse.json({ success: true, transactions }, { status: 200 });
  } catch (error) {
    console.error("GET transactions error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      console.log("❌ POST /api/transactions: Unauthorized");
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log("📦 Incoming transaction payload:", body);

    const supabase = getAdminSupabase();
    const { data: newTransaction, error } = await supabase
      .from("transactions")
      .insert([{ ...body, user_id: user.id }])
      .select()
      .single();

    if (error) {
      console.error("❌ Supabase DB Insert Error:", error);
      throw error;
    }

    console.log("✅ Transaction created successfully:", newTransaction);
    return NextResponse.json(
      { success: true, transaction: newTransaction },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST transaction catch block error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create transaction" },
      { status: 500 }
    );
  }
}
export async function DELETE(request: NextRequest) {
  return handleBulkDelete(request);
}
