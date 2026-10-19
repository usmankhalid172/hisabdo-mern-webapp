import { NextRequest, NextResponse } from "next/server";
import {
  getAuthenticatedUser,
  getRequestToken,
  getSupabaseClient,
} from "@/lib/server-auth";
import { transactionCreateSchema } from "@/lib/validations/transactionSchema";

function errorResponse(message, status, extra = {}) {
  return NextResponse.json(
    { success: false, message, error: message, ...extra },
    { status }
  );
}

async function findOwnedCustomer(supabase, customerId, userId) {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("id", customerId)
    .eq("user_id", userId)
    .is("deleted_at", null)
    .maybeSingle();

  if (data || error) return { data, error };

  return supabase
    .from("customers")
    .select("*")
    .eq("client_uuid", customerId)
    .eq("user_id", userId)
    .is("deleted_at", null)
    .maybeSingle();
}

function formatTransaction(tx) {
  const meta = tx.metadata || {};
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

function formatCustomer(customer, netBalanceOverride) {
  const meta = customer.metadata || {};
  const netBalance =
    netBalanceOverride !== undefined
      ? netBalanceOverride
      : Number(meta.netBalance ?? meta.opening_balance ?? 0);

  return {
    ...customer,
    _id: customer.id,
    address: meta.address || null,
    city: meta.city || "Lahore",
    category: meta.category || "Retail",
    creditLimit: Number(meta.creditLimit ?? 50000),
    initialBalance: Number(meta.initialBalance ?? meta.opening_balance ?? 0),
    netBalance,
    opening_balance: Number(meta.opening_balance ?? meta.initialBalance ?? 0),
    currency: meta.currency || "PKR",
    paymentTermsDays: Number(meta.paymentTermsDays ?? 15),
    status: meta.status || (customer.deleted_at ? "inactive" : "active"),
  };
}

function calculateNetBalance(initialBalance, transactions) {
  return (transactions || []).reduce((balance, tx) => {
    const amount = Number(tx.amount) || 0;
    if (
      tx.type === "GAVE_CREDIT" ||
      tx.type === "PURCHASE_BILL" ||
      tx.type === "paid"
    ) {
      return balance + amount;
    }
    if (
      tx.type === "GOT_PAYMENT" ||
      tx.type === "PAID_PAYMENT" ||
      tx.type === "received"
    ) {
      return balance - amount;
    }
    return balance;
  }, Number(initialBalance || 0));
}

export async function GET(request, context) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return errorResponse(
        "Please log in again to continue.",
        401
      );
    }

    const { id } = await context.params;
    const token = getRequestToken(request);
    const supabase = await getSupabaseClient(token);

    const { data: customer, error: customerError } =
      await findOwnedCustomer(supabase, id, user.id);

    if (customerError) {
      console.error(
        "GET customer transaction: customer lookup failed:",
        customerError
      );
      return errorResponse("Unable to load this customer.", 500);
    }

    if (!customer) {
      return errorResponse("Customer not found.", 404);
    }

    const { data: transactions, error } = await supabase
      .from("ledger_transactions")
      .select("*")
      .eq("user_id", user.id)
      .eq("customer_id", customer.id)
      .is("deleted_at", null)
      .order("date", { ascending: false });

    if (error) {
      console.error(
        "GET customer transactions Supabase error:",
        error
      );
      return errorResponse(
        "Unable to load this customer's transactions.",
        500
      );
    }

    const formattedTxs = (transactions || []).map(formatTransaction);
    const initialBal = Number(
      customer.metadata?.initialBalance ??
      customer.metadata?.opening_balance ??
      0
    );
    const currentBalance = calculateNetBalance(initialBal, transactions);
    const formattedCust = formatCustomer(customer, currentBalance);

    return NextResponse.json({
      success: true,
      count: formattedTxs.length,
      customer: formattedCust,
      data: formattedTxs,
    });
  } catch (error) {
    console.error("GET customer transactions error:", error);

    return errorResponse(
      "Unable to load transactions. Please try again.",
      500
    );
  }
}

export async function POST(request, context) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return errorResponse(
        "Please log in again to continue.",
        401
      );
    }

    const { id } = await context.params;
    const token = getRequestToken(request);
    const supabase = await getSupabaseClient(token);

    const { data: customer, error: customerError } =
      await findOwnedCustomer(supabase, id, user.id);

    if (customerError) {
      console.error(
        "POST customer transaction: customer lookup failed:",
        customerError
      );
      return errorResponse("Unable to verify this customer.", 500);
    }

    if (!customer) {
      return errorResponse(
        "This customer could not be found or you do not have permission to access it.",
        404
      );
    }

    let body;

    try {
      body = await request.json();
    } catch {
      return errorResponse(
        "Please submit valid transaction information.",
        400
      );
    }

    const validation = transactionCreateSchema.safeParse(body);

    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors;
      const message =
        validation.error.issues[0]?.message ||
        "Transaction information is invalid.";

      return errorResponse(message, 400, { fieldErrors });
    }

    const payload = validation.data;

    if (payload.partyType !== "Customer") {
      return errorResponse(
        "This endpoint only supports customer transactions.",
        400
      );
    }

    const dateStr = payload.date
      ? String(payload.date).slice(0, 10)
      : new Date().toISOString().slice(0, 10);

    const transactionToInsert = {
      client_uuid: crypto.randomUUID(),
      user_id: user.id,
      customer_id: customer.id,
      amount: payload.amount,
      type: payload.type,
      category: payload.paymentMethod || "Payment",
      date: dateStr,
      note: payload.description || payload.billNumber || "",
      metadata: {
        partyType: "Customer",
        customerId: customer.id,
        paymentMethod: payload.paymentMethod,
        billNumber: payload.billNumber || "",
        description: payload.description || "",
        originalType: payload.type,
      },
    };

    const { data: rawTx, error: insertError } = await supabase
      .from("ledger_transactions")
      .insert(transactionToInsert)
      .select("*")
      .single();

    if (insertError) {
      console.error(
        "POST customer transaction Supabase error:",
        insertError
      );

      return errorResponse(
        "Transaction could not be saved: " + (insertError.message || "database error"),
        500
      );
    }

    const transaction = formatTransaction(rawTx);

    // Query active transactions to recalculate customer netBalance
    const { data: savedTransactions, error: balanceQueryError } =
      await supabase
        .from("ledger_transactions")
        .select("type, amount, date")
        .eq("user_id", user.id)
        .eq("customer_id", customer.id)
        .is("deleted_at", null)
        .order("date", { ascending: true });

    const initialBal = Number(
      customer.metadata?.initialBalance ??
      customer.metadata?.opening_balance ??
      0
    );

    const netBalance = balanceQueryError
      ? calculateNetBalance(initialBal, [
          { type: payload.type, amount: payload.amount },
        ])
      : calculateNetBalance(initialBal, savedTransactions);

    const updatedMetadata = {
      ...(customer.metadata || {}),
      netBalance,
    };

    const { data: rawUpdatedCustomer, error: updateError } =
      await supabase
        .from("customers")
        .update({
          metadata: updatedMetadata,
          updated_at: new Date().toISOString(),
        })
        .eq("id", customer.id)
        .eq("user_id", user.id)
        .select("*")
        .single();

    if (updateError) {
      console.error(
        "Customer balance update failed:",
        updateError
      );

      return NextResponse.json(
        {
          success: true,
          message:
            "Transaction saved, but the customer balance could not be updated.",
          warning:
            "Transaction recorded, but customer balance update failed: " +
            updateError.message,
          data: transaction,
          transaction,
          customer: formatCustomer(customer, netBalance),
        },
        { status: 201 }
      );
    }

    const updatedCustomer = formatCustomer(
      rawUpdatedCustomer || customer,
      netBalance
    );

    return NextResponse.json(
      {
        success: true,
        message: "Transaction recorded successfully.",
        data: transaction,
        transaction,
        customer: updatedCustomer,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST customer transaction error:", error);

    return errorResponse(
      "Unable to record the transaction. Please try again.",
      500
    );
  }
}