import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
      .update({ type, amount: Number(amount), description, date: date || new Date().toISOString() })
      .eq("id", params.id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw error;
    if (!transaction) {
      return NextResponse.json({ success: false, message: "Transaction not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Transaction updated successfully", transaction }, { status: 200 });
  } catch (error) {
    console.error("PUT transaction error:", error);
    return NextResponse.json({ success: false, message: "Failed to update transaction" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { data: transaction, error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", params.id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw error;
    if (!transaction) {
      return NextResponse.json({ success: false, message: "Transaction not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Transaction deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("DELETE transaction error:", error);
    return NextResponse.json({ success: false, message: "Failed to delete transaction" }, { status: 500 });
  }
}
