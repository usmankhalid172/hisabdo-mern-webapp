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

function formatTransaction(tx: Record<string, any>) {
  const meta = (tx.metadata as Record<string, any>) || {};
  return {
    ...tx,
    _id: tx.id,
    customerId: tx.customer_id,
    partyType: meta.partyType || "Customer",
    paymentMethod: meta.paymentMethod || tx.category || "Cash",
    billNumber: meta.billNumber || "",
    description: tx.note || meta.description || "",
    type: tx.type,
    amount: Number(tx.amount),
    date: tx.date,
    createdAt: tx.created_at,
    updatedAt: tx.updated_at,
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
      .from("ledger_transactions")
      .select("*")
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .order("date", { ascending: false });

    if (error) {
      console.error("GET /api/transactions Supabase error:", error);
      return errorResponse("Unable to load transactions. Please try again.", 500);
    }

    const formatted = (data || []).map(formatTransaction);

    return NextResponse.json({
      success: true,
      count: formatted.length,
      transactions: formatted,
      data: formatted,
    });
  } catch (error) {
    console.error("GET /api/transactions error:", error);
    return errorResponse("Unable to load transactions. Please try again.", 500);
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
      return errorResponse("Please submit valid transaction information.", 400);
    }

    const amount = Number(body.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return errorResponse("Transaction amount must be greater than zero.", 400, {
        fieldErrors: { amount: ["Transaction amount must be greater than zero."] },
      });
    }

    if (!body.type) {
      return errorResponse("Transaction type is required.", 400, {
        fieldErrors: { type: ["Transaction type is required."] },
      });
    }

    const token = getRequestToken(request);
    const supabase = await getSupabaseClient(token);

    const customerId = (body.customerId || body.customer_id) as string | undefined;
    const dateStr = body.date
      ? String(body.date).slice(0, 10)
      : new Date().toISOString().slice(0, 10);

    const transactionToInsert = {
      client_uuid: crypto.randomUUID(),
      user_id: user.id,
      customer_id: customerId || null,
      amount,
      type: String(body.type),
      category: String(body.paymentMethod || body.category || "Payment"),
      date: dateStr,
      note: String(body.description || body.billNumber || body.note || ""),
      metadata: {
        partyType: body.partyType || (customerId ? "Customer" : "General"),
        customerId: customerId || null,
        paymentMethod: body.paymentMethod || "Cash",
        billNumber: body.billNumber || "",
        description: body.description || "",
        originalType: body.type,
      },
    };

    const { data: rawTx, error } = await supabase
      .from("ledger_transactions")
      .insert(transactionToInsert)
      .select("*")
      .single();

    if (error) {
      console.error("POST /api/transactions Supabase error:", error);
      return errorResponse(
        "Transaction could not be saved: " + (error.message || "database error"),
        500
      );
    }

    const transaction = formatTransaction(rawTx);

    return NextResponse.json(
      {
        success: true,
        message: "Transaction recorded successfully.",
        transaction,
        data: transaction,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/transactions error:", error);
    return errorResponse("Unable to record the transaction. Please try again.", 500);
  }
}