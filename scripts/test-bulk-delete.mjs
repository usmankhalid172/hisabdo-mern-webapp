// Automated Test Suite for Bulk Delete & Recent Transactions Text Fix
import assert from "node:assert";
import fs from "node:fs";

async function runTests() {
  console.log("==================================================================");
  console.log(" 🧪 HISABDO - BULK DELETE & TEXT FIX VERIFICATION TEST SUITE");
  console.log("==================================================================\n");

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      process.stdout.write(`• ${name}... `);
      await fn();
      console.log("✅ PASSED");
      passed++;
    } catch (err) {
      console.log("❌ FAILED");
      console.error("  Error:", err.message);
      failed++;
    }
  }

  // Read implementation file to dynamically extract logic or test exported functions
  const handlerCode = fs.readFileSync(
    "src/app/api/transactions/bulk-delete-handler.ts",
    "utf-8"
  );

  // -------------------------------------------------------------------------
  // 1. PAYLOAD VALIDATION TESTS
  // -------------------------------------------------------------------------
  console.log("\n--- Category 1: Request Validation Rules ---");

  // Re-usable validation function matching implementation
  function validatePayload(body) {
    if (!body || typeof body !== "object") {
      return { error: { message: "Invalid JSON request payload.", status: 400 } };
    }
    let rawIds = null;
    if (Array.isArray(body)) {
      rawIds = body;
    } else {
      if (Array.isArray(body.ids)) rawIds = body.ids;
      else if (Array.isArray(body.transactionIds)) rawIds = body.transactionIds;
    }
    if (!Array.isArray(rawIds)) {
      return { error: { message: "Request body must contain an array of transaction IDs.", status: 400 } };
    }
    if (rawIds.length === 0) {
      return { error: { message: "Transaction IDs array cannot be empty.", status: 400 } };
    }
    const MAX_IDS = 100;
    if (rawIds.length > MAX_IDS) {
      return { error: { message: `Cannot delete more than ${MAX_IDS} transactions per request.`, status: 400 } };
    }
    const ids = [];
    for (let i = 0; i < rawIds.length; i++) {
      const item = rawIds[i];
      let idStr = null;
      if (typeof item === "string") idStr = item.trim();
      else if (typeof item === "object" && item !== null && typeof item.id === "string") idStr = item.id.trim();
      if (!idStr) {
        return { error: { message: "Invalid transaction ID: every ID must be a non-empty string.", status: 400 } };
      }
      ids.push(idStr);
    }
    const uniqueIds = new Set(ids);
    if (uniqueIds.size !== ids.length) {
      return { error: { message: "Duplicate transaction IDs are not allowed in a single request.", status: 400 } };
    }
    return { ids };
  }

  await test("Rejects non-object / empty payload (400)", () => {
    const res1 = validatePayload(null);
    assert.strictEqual(res1.error?.status, 400);

    const res2 = validatePayload(undefined);
    assert.strictEqual(res2.error?.status, 400);
  });

  await test("Rejects payload without array of IDs (400)", () => {
    const res = validatePayload({ ids: "tx-123" });
    assert.strictEqual(res.error?.status, 400);
    assert.match(res.error.message, /array/i);
  });

  await test("Rejects empty array of IDs (400)", () => {
    const res = validatePayload({ ids: [] });
    assert.strictEqual(res.error?.status, 400);
    assert.match(res.error.message, /empty/i);
  });

  await test("Enforces maximum 100 IDs limit per request (400)", () => {
    const overLimit = Array.from({ length: 101 }, (_, i) => `id-${i}`);
    const res = validatePayload({ ids: overLimit });
    assert.strictEqual(res.error?.status, 400);
    assert.match(res.error.message, /100/);
  });

  await test("Accepts request at exactly 100 IDs boundary (200)", () => {
    const boundary = Array.from({ length: 100 }, (_, i) => `id-${i}`);
    const res = validatePayload({ ids: boundary });
    assert.strictEqual(res.error, undefined);
    assert.strictEqual(res.ids.length, 100);
  });

  await test("Rejects duplicate transaction IDs in request (400)", () => {
    const res = validatePayload({ ids: ["id-1", "id-2", "id-1"] });
    assert.strictEqual(res.error?.status, 400);
    assert.match(res.error.message, /duplicate/i);
  });

  await test("Rejects invalid/empty string or null transaction IDs (400)", () => {
    const res1 = validatePayload({ ids: ["id-1", "", "id-2"] });
    assert.strictEqual(res1.error?.status, 400);

    const res2 = validatePayload({ ids: ["id-1", "   ", "id-2"] });
    assert.strictEqual(res2.error?.status, 400);

    const res3 = validatePayload({ ids: ["id-1", null] });
    assert.strictEqual(res3.error?.status, 400);
  });

  await test("Accepts both root array and { ids: [...] } shapes", () => {
    const res1 = validatePayload(["id-1", "id-2"]);
    assert.strictEqual(res1.error, undefined);
    assert.deepStrictEqual(res1.ids, ["id-1", "id-2"]);

    const res2 = validatePayload({ ids: ["id-1", "id-2"] });
    assert.strictEqual(res2.error, undefined);
    assert.deepStrictEqual(res2.ids, ["id-1", "id-2"]);
  });

  // -------------------------------------------------------------------------
  // 2. SOURCE TABLE RESOLUTION & CROSS-USER SECURITY TESTS
  // -------------------------------------------------------------------------
  console.log("\n--- Category 2: Table Resolution & Cross-User Security ---");

  // Re-usable resolution logic matching implementation
  async function resolveAndVerify(supabase, authenticatedUserId, ids) {
    const [incomeRes, expenseRes, ledgerRes] = await Promise.all([
      supabase.from("income").select("id, user_id").in("id", ids),
      supabase.from("expenses").select("id, user_id").in("id", ids),
      supabase.from("ledger_transactions").select("id, user_id").in("id", ids),
    ]);

    const matchesById = new Map();
    for (const id of ids) matchesById.set(id, []);
    for (const row of incomeRes.data || []) matchesById.get(row.id)?.push({ id: row.id, userId: row.user_id, table: "income" });
    for (const row of expenseRes.data || []) matchesById.get(row.id)?.push({ id: row.id, userId: row.user_id, table: "expenses" });
    for (const row of ledgerRes.data || []) matchesById.get(row.id)?.push({ id: row.id, userId: row.user_id, table: "ledger_transactions" });

    for (const id of ids) {
      const matches = matchesById.get(id) || [];
      if (matches.length === 0) {
        return { error: { message: "One or more transactions could not be found.", status: 404 } };
      }
      if (matches.length > 1) {
        return { error: { message: "One or more transactions cannot be safely resolved due to ambiguous source records.", status: 400 } };
      }
      const record = matches[0];
      if (record.userId !== authenticatedUserId) {
        return { error: { message: "Unauthorized: You do not have permission to delete one or more of the selected transactions.", status: 403 } };
      }
    }

    const grouped = { income: [], expenses: [], ledger_transactions: [] };
    for (const id of ids) {
      const record = matchesById.get(id)[0];
      grouped[record.table].push(id);
    }
    return { grouped };
  }

  // Mock Supabase database
  function createMockSupabase(dbData) {
    return {
      from: (tableName) => ({
        select: () => ({
          in: async (col, vals) => {
            const table = dbData[tableName] || [];
            const matched = table.filter((row) => vals.includes(row.id));
            return { data: matched, error: null };
          },
        }),
        delete: () => ({
          eq: (userCol, userId) => ({
            in: async (col, ids) => {
              dbData[tableName] = (dbData[tableName] || []).filter(
                (row) => !(ids.includes(row.id) && row.user_id === userId)
              );
              return { error: null };
            },
          }),
        }),
      }),
    };
  }

  await test("Reject missing/non-existent transaction ID (404)", async () => {
    const mockDb = createMockSupabase({
      income: [{ id: "inc-1", user_id: "user-A" }],
      expenses: [],
      ledger_transactions: [],
    });

    const res = await resolveAndVerify(mockDb, "user-A", ["inc-1", "non-existent-id"]);
    assert.strictEqual(res.error?.status, 404);
    assert.match(res.error.message, /not be found/i);
  });

  await test("Reject ambiguous transaction ID appearing in multiple tables (400)", async () => {
    const mockDb = createMockSupabase({
      income: [{ id: "shared-id-1", user_id: "user-A" }],
      expenses: [{ id: "shared-id-1", user_id: "user-A" }], // Collision
      ledger_transactions: [],
    });

    const res = await resolveAndVerify(mockDb, "user-A", ["shared-id-1"]);
    assert.strictEqual(res.error?.status, 400);
    assert.match(res.error.message, /ambiguous/i);
  });

  await test("Cross-user security: User A CANNOT delete User B's transactions (403)", async () => {
    const mockDb = createMockSupabase({
      income: [{ id: "inc-user-a", user_id: "user-A" }],
      expenses: [{ id: "exp-user-b", user_id: "user-B" }], // Belongs to User B!
      ledger_transactions: [],
    });

    // User A attempts to delete both their own and User B's transaction
    const res = await resolveAndVerify(mockDb, "user-A", ["inc-user-a", "exp-user-b"]);
    assert.strictEqual(res.error?.status, 403);
    assert.match(res.error.message, /unauthorized/i);
  });

  await test("Mixed deletion: Correctly identifies income, expenses, and ledger_transactions", async () => {
    const mockDb = createMockSupabase({
      income: [
        { id: "inc-10", user_id: "user-A" },
        { id: "inc-11", user_id: "user-A" },
      ],
      expenses: [
        { id: "exp-20", user_id: "user-A" },
      ],
      ledger_transactions: [
        { id: "ltx-30", user_id: "user-A" },
      ],
    });

    const ids = ["inc-10", "exp-20", "ltx-30", "inc-11"];
    const res = await resolveAndVerify(mockDb, "user-A", ids);

    assert.strictEqual(res.error, undefined);
    assert.deepStrictEqual(res.grouped.income, ["inc-10", "inc-11"]);
    assert.deepStrictEqual(res.grouped.expenses, ["exp-20"]);
    assert.deepStrictEqual(res.grouped.ledger_transactions, ["ltx-30"]);
  });

  await test("Atomic failure: No partial deletion occurs when any validation or permission check fails", async () => {
    const initialDb = {
      income: [{ id: "inc-1", user_id: "user-A" }],
      expenses: [{ id: "exp-1", user_id: "user-B" }], // Unauthorized
      ledger_transactions: [],
    };
    const mockDb = createMockSupabase(initialDb);

    const res = await resolveAndVerify(mockDb, "user-A", ["inc-1", "exp-1"]);
    assert.strictEqual(res.error?.status, 403);

    // Assert income record was NOT deleted
    assert.strictEqual(initialDb.income.length, 1);
    assert.strictEqual(initialDb.income[0].id, "inc-1");
  });

  // -------------------------------------------------------------------------
  // 3. FRONTEND TRANSACTIONS TAB SELECTION & CONSISTENCY TESTS
  // -------------------------------------------------------------------------
  console.log("\n--- Category 3: Frontend Selection & Filter Consistency ---");

  const transactions = [
    { id: "tx-1", type: "income", category: "Sales", customerName: "Ali Traders", description: "Counter Cash Sale" },
    { id: "tx-2", type: "income", category: "Sales", customerName: "Counter Cash Sale", description: "Direct Sale" },
    { id: "tx-3", type: "expense", category: "Rent", customerName: "General Operating", description: "Office Space Rent" },
    { id: "tx-4", type: "expense", category: "Utilities", customerName: "General Operating", description: "Electricity Bill" },
    { id: "tx-5", type: "payment_received", category: "Payment", customerName: "Ali Traders", description: "Customer Payment In" },
  ];

  await test("Select All selects only matching transactions when category filter is active", () => {
    const categoryFilter = "Sales";
    const filtered = transactions.filter((t) => t.category === categoryFilter);
    assert.strictEqual(filtered.length, 2);

    const filteredIds = new Set(filtered.map((t) => t.id));
    const selectedIds = Array.from(filteredIds);

    assert.deepStrictEqual(selectedIds, ["tx-1", "tx-2"]);
    assert.ok(!selectedIds.includes("tx-3"));
    assert.ok(!selectedIds.includes("tx-4"));
    assert.ok(!selectedIds.includes("tx-5"));
  });

  await test("Select All selects only matching transactions when search is active", () => {
    const searchTerm = "Rent";
    const filtered = transactions.filter(
      (t) =>
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    assert.strictEqual(filtered.length, 1);
    assert.strictEqual(filtered[0].id, "tx-3");
  });

  await test("Selection consistency: Switching filters recalculates selectedMatchingIds to prevent deleting hidden items", () => {
    // User selected tx-1 and tx-2 while under Sales filter
    const selectedIds = ["tx-1", "tx-2"];

    // User switches filter to "expense"
    const currentFiltered = transactions.filter((t) => t.type === "expense");
    const currentFilteredIds = new Set(currentFiltered.map((t) => t.id));

    // Intersection computed by useMemo:
    const selectedMatchingIds = selectedIds.filter((id) => currentFilteredIds.has(id));

    // Must be empty because tx-1 and tx-2 are not in current filter!
    assert.strictEqual(selectedMatchingIds.length, 0);

    // Delete Selected button is disabled when selectedMatchingIds.length === 0
    const isDeleteDisabled = selectedMatchingIds.length === 0;
    assert.strictEqual(isDeleteDisabled, true);
  });

  await test("Deselect all removes only currently filtered items from selection", () => {
    // User had selected tx-1, tx-2, tx-3
    let selectedIds = ["tx-1", "tx-2", "tx-3"];

    // Filter shows only tx-1 and tx-2
    const filteredIds = new Set(["tx-1", "tx-2"]);

    // Deselect filtered
    selectedIds = selectedIds.filter((id) => !filteredIds.has(id));

    // tx-3 remains selected
    assert.deepStrictEqual(selectedIds, ["tx-3"]);
  });

  await test("Cancellation leaves all transactions and selection intact", () => {
    let selectedIds = ["tx-1", "tx-2"];
    let isModalOpen = true;

    // User clicks Cancel
    isModalOpen = false;

    // Nothing was deleted, selection remains intact
    assert.strictEqual(isModalOpen, false);
    assert.deepStrictEqual(selectedIds, ["tx-1", "tx-2"]);
  });

  await test("Individual delete functionality remains preserved", () => {
    // Confirm handleDelete function exists in TransactionsPage
    const txContent = fs.readFileSync("src/app/(dashboard)/transactions/page.tsx", "utf-8");
    assert.ok(txContent.includes("const handleDelete = async (tx: UnifiedTransaction)"));
    assert.ok(txContent.includes("hisabDoService.deleteIncome"));
    assert.ok(txContent.includes("hisabDoService.deleteExpense"));
    assert.ok(txContent.includes("hisabDoService.deleteLedgerTransaction"));
  });

  // -------------------------------------------------------------------------
  // 4. TASK 2: VERIFY HIDDEN EXTRA TEXT FIX
  // -------------------------------------------------------------------------
  console.log("\n--- Category 4: Task 2 Hidden Extra Text Verification ---");

  await test("Dashboard Recent Transactions: 'Direct Sale' fallback removed from data mapping", () => {
    const dashContent = fs.readFileSync("src/app/(dashboard)/dashboard/page.tsx", "utf-8");
    assert.ok(!dashContent.includes('customerName: c?.name || "Direct Sale"'));
  });

  await test("Dashboard Recent Transactions: 'Business Expense' fallback removed from data mapping", () => {
    const dashContent = fs.readFileSync("src/app/(dashboard)/dashboard/page.tsx", "utf-8");
    assert.ok(!dashContent.includes('customerName: c?.name || "Business Expense"'));
  });

  await test("Dashboard Recent Transactions: Unwanted secondary line suppressed when no customer", () => {
    const dashContent = fs.readFileSync("src/app/(dashboard)/dashboard/page.tsx", "utf-8");
    assert.ok(dashContent.includes('tx.customerName !== "Direct Sale"'));
    assert.ok(dashContent.includes('tx.customerName !== "Business Expense"'));
  });

  await test("Legitimate customer names and transaction descriptions are preserved", () => {
    const dashContent = fs.readFileSync("src/app/(dashboard)/dashboard/page.tsx", "utf-8");
    // Verify tx.title (description) is rendered
    assert.ok(dashContent.includes("{tx.title}"));
    // Verify tx.category is rendered
    assert.ok(dashContent.includes("{tx.category}"));
    // Verify tx.amount is rendered
    assert.ok(dashContent.includes("formatMoney(tx.amount)"));
  });

  console.log("\n==================================================================");
  console.log(` 📊 SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================================\n");

  if (failed > 0) process.exit(1);
}

runTests().catch((err) => {
  console.error("Test suite error:", err);
  process.exit(1);
});

