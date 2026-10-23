import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { verifyAuthToken } from "@/lib/auth-token";
import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";

export function getAdminSupabase() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_SUPABASE_URL ||
    "https://ooabmcalzsgesdgrgilu.supabase.co";
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vYWJtY2FsenNnZXNkZ3JnaWx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyNTE1MzYsImV4cCI6MjA5OTgyNzUzNn0.jWWLyBu_mHDqxry_Jak9ssb2gqgjJoSGhTXzEXjairw";
  return createSupabaseClient(url, serviceKey, { db: { schema: "app" } });
}

export async function getAuthenticatedUser(request: NextRequest) {
  // 1. Check Bearer token from Authorization header
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    if (token && token !== "null" && token !== "undefined") {
      const user = await verifyAuthToken(token);
      if (user) return user;

      // Also try Supabase auth verification with token
      try {
        const supabase = getAdminSupabase();
        const {
          data: { user: suUser },
          error,
        } = await supabase.auth.getUser(token);
        if (!error && suUser) {
          return {
            id: suUser.id,
            name: suUser.user_metadata?.full_name || suUser.email || "Merchant",
            email: suUser.email || "",
            role: "user" as const,
          };
        }
      } catch {}
    }
  }

  // 2. Check HTTP-only cookies
  const cookieToken =
    request.cookies.get("hisabdo_auth_token")?.value ||
    request.cookies.get("token")?.value ||
    request.cookies.get("accessToken")?.value;

  if (cookieToken) {
    const user = await verifyAuthToken(cookieToken);
    if (user) return user;
  }

  // 3. Check Supabase cookies
  try {
    const serverSupabase = createServerSupabaseClient();
    const {
      data: { user: suUser },
      error,
    } = await serverSupabase.auth.getUser();
    if (!error && suUser) {
      return {
        id: suUser.id,
        name: suUser.user_metadata?.full_name || suUser.email || "Merchant",
        email: suUser.email || "",
        role: "user" as const,
      };
    }
  } catch {}

  return null;
}

export type SourceTable = "income" | "expenses" | "ledger_transactions";

export interface FoundRecord {
  id: string;
  userId: string;
  table: SourceTable;
}

export interface GroupedTransactionIds {
  income: string[];
  expenses: string[];
  ledger_transactions: string[];
}

export interface ValidationResult {
  error?: { message: string; status: number };
  ids?: string[];
}

export interface ResolutionResult {
  error?: { message: string; status: number };
  grouped?: GroupedTransactionIds;
}

/**
 * Validates the bulk delete request payload according to business rules:
 * - Must be an array or object containing `ids` or `transactionIds`
 * - Non-empty array
 * - Maximum 100 IDs per request
 * - Non-empty string IDs
 * - No duplicate IDs
 */
export function validateBulkDeletePayload(body: unknown): ValidationResult {
  if (!body || typeof body !== "object") {
    return {
      error: { message: "Invalid JSON request payload.", status: 400 },
    };
  }

  let rawIds: unknown = null;
  if (Array.isArray(body)) {
    rawIds = body;
  } else {
    const b = body as Record<string, unknown>;
    if (Array.isArray(b.ids)) {
      rawIds = b.ids;
    } else if (Array.isArray(b.transactionIds)) {
      rawIds = b.transactionIds;
    }
  }

  if (!Array.isArray(rawIds)) {
    return {
      error: {
        message: "Request body must contain an array of transaction IDs.",
        status: 400,
      },
    };
  }

  if (rawIds.length === 0) {
    return {
      error: {
        message: "Transaction IDs array cannot be empty.",
        status: 400,
      },
    };
  }

  const MAX_IDS = 100;
  if (rawIds.length > MAX_IDS) {
    return {
      error: {
        message: `Cannot delete more than ${MAX_IDS} transactions per request.`,
        status: 400,
      },
    };
  }

  const ids: string[] = [];
  for (let i = 0; i < rawIds.length; i++) {
    const item = rawIds[i];
    let idStr: string | null = null;
    if (typeof item === "string") {
      idStr = item.trim();
    } else if (
      typeof item === "object" &&
      item !== null &&
      typeof (item as Record<string, unknown>).id === "string"
    ) {
      idStr = ((item as Record<string, unknown>).id as string).trim();
    }

    if (!idStr) {
      return {
        error: {
          message: "Invalid transaction ID: every ID must be a non-empty string.",
          status: 400,
        },
      };
    }

    ids.push(idStr);
  }

  const uniqueIds = new Set(ids);
  if (uniqueIds.size !== ids.length) {
    return {
      error: {
        message: "Duplicate transaction IDs are not allowed in a single request.",
        status: 400,
      },
    };
  }

  return { ids };
}

/**
 * Resolves each transaction ID to its true source table (income, expenses, ledger_transactions),
 * verifies ownership against the authenticated user, and checks for ambiguous/missing records.
 */
export async function resolveAndVerifyOwnership(
  supabase: any,
  authenticatedUserId: string,
  ids: string[]
): Promise<ResolutionResult> {
  const [incomeRes, expenseRes, ledgerRes] = await Promise.all([
    supabase.from("income").select("id, user_id").in("id", ids),
    supabase.from("expenses").select("id, user_id").in("id", ids),
    supabase.from("ledger_transactions").select("id, user_id").in("id", ids),
  ]);

  if (
    incomeRes.error?.code === "22P02" ||
    expenseRes.error?.code === "22P02" ||
    ledgerRes.error?.code === "22P02"
  ) {
    return {
      error: {
        message: "One or more transaction IDs have an invalid format.",
        status: 400,
      },
    };
  }

  const matchesById = new Map<string, FoundRecord[]>();
  for (const id of ids) {
    matchesById.set(id, []);
  }

  for (const row of incomeRes.data || []) {
    matchesById.get(row.id)?.push({
      id: row.id,
      userId: row.user_id,
      table: "income",
    });
  }

  for (const row of expenseRes.data || []) {
    matchesById.get(row.id)?.push({
      id: row.id,
      userId: row.user_id,
      table: "expenses",
    });
  }

  for (const row of ledgerRes.data || []) {
    matchesById.get(row.id)?.push({
      id: row.id,
      userId: row.user_id,
      table: "ledger_transactions",
    });
  }

  for (const id of ids) {
    const matches = matchesById.get(id) || [];

    if (matches.length === 0) {
      return {
        error: {
          message: "One or more transactions could not be found.",
          status: 404,
        },
      };
    }

    if (matches.length > 1) {
      return {
        error: {
          message:
            "One or more transactions cannot be safely resolved due to ambiguous source records.",
          status: 400,
        },
      };
    }

    const record = matches[0];
    if (record.userId !== authenticatedUserId) {
      return {
        error: {
          message:
            "Unauthorized: You do not have permission to delete one or more of the selected transactions.",
          status: 403,
        },
      };
    }
  }

  const grouped: GroupedTransactionIds = {
    income: [],
    expenses: [],
    ledger_transactions: [],
  };

  for (const id of ids) {
    const record = matchesById.get(id)![0];
    grouped[record.table].push(id);
  }

  return { grouped };
}

/**
 * Executes deletions on the identified source tables, strictly enforcing
 * user_id scoping on each query for guaranteed isolation.
 */
export async function executeBulkDeletions(
  supabase: any,
  authenticatedUserId: string,
  grouped: GroupedTransactionIds
) {
  if (grouped.income.length > 0) {
    const { error: incErr } = await supabase
      .from("income")
      .delete()
      .eq("user_id", authenticatedUserId)
      .in("id", grouped.income);
    if (incErr) {
      console.error("Income bulk delete error:", incErr);
      throw new Error("Failed to delete income transactions.");
    }
  }

  if (grouped.expenses.length > 0) {
    const { error: expErr } = await supabase
      .from("expenses")
      .delete()
      .eq("user_id", authenticatedUserId)
      .in("id", grouped.expenses);
    if (expErr) {
      console.error("Expenses bulk delete error:", expErr);
      throw new Error("Failed to delete expense transactions.");
    }
  }

  if (grouped.ledger_transactions.length > 0) {
    const { error: ledErr } = await supabase
      .from("ledger_transactions")
      .delete()
      .eq("user_id", authenticatedUserId)
      .in("id", grouped.ledger_transactions);
    if (ledErr) {
      console.error("Ledger transactions bulk delete error:", ledErr);
      throw new Error("Failed to delete ledger transactions.");
    }
  }

  const totalCount =
    grouped.income.length +
    grouped.expenses.length +
    grouped.ledger_transactions.length;

  return {
    success: true,
    deletedCount: totalCount,
    details: {
      incomeCount: grouped.income.length,
      expenseCount: grouped.expenses.length,
      ledgerCount: grouped.ledger_transactions.length,
    },
  };
}

/**
 * Main HTTP entrypoint for bulk delete requests.
 */
export async function handleBulkDelete(request: NextRequest) {
  try {
    // 1. Authenticate user
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Parse request body
    let body: any = null;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON request payload." },
        { status: 400 }
      );
    }

    // 3. Validate payload rules
    const validation = validateBulkDeletePayload(body);
    if (validation.error) {
      return NextResponse.json(
        { success: false, message: validation.error.message },
        { status: validation.error.status }
      );
    }

    const ids = validation.ids!;

    // 4. Resolve source tables and verify ownership against user.id
    const supabase = getAdminSupabase();
    const resolution = await resolveAndVerifyOwnership(supabase, user.id, ids);
    if (resolution.error) {
      return NextResponse.json(
        { success: false, message: resolution.error.message },
        { status: resolution.error.status }
      );
    }

    // 5. Execute deletions
    const result = await executeBulkDeletions(supabase, user.id, resolution.grouped!);

    return NextResponse.json(
      {
        success: true,
        message: `Successfully deleted ${result.deletedCount} transaction${
          result.deletedCount > 1 ? "s" : ""
        }.`,
        deletedCount: result.deletedCount,
        details: result.details,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Bulk delete internal error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error during bulk deletion." },
      { status: 500 }
    );
  }
}
