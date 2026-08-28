import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { data: transactions, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, transactions }, { status: 200 });
  } catch (error) {
    console.error("GET transactions error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch transactions" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { type, amount, description, date } = await request.json();

    if (!type || amount === undefined || !description) {
      return NextResponse.json({ success: false, message: "Type, amount and description are required" }, { status: 400 });
    }

    if (!["income", "expense"].includes(type)) {
      return NextResponse.json({ success: false, message: "Type must be income or expense" }, { status: 400 });
    }

    if (Number(amount) < 0) {
      return NextResponse.json({ success: false, message: "Amount cannot be negative" }, { status: 400 });
    }

    const { data: transaction, error } = await supabase
      .from("transactions")
      .insert({ user_id: user.id, type, amount: Number(amount), description, date: date || new Date().toISOString() })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Transaction created successfully", transaction }, { status: 201 });
  } catch (error) {
    console.error("POST transaction error:", error);
    return NextResponse.json({ success: false, message: "Failed to create transaction" }, { status: 500 });
  }
}
