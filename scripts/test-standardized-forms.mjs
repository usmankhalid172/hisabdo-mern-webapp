import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  isValidDateString,
  getTodayDateString,
  validateTransactionDate,
  DEFAULT_INCOME_CATEGORIES,
  DEFAULT_EXPENSE_CATEGORIES,
} from "../src/lib/validations/formDateValidation.ts";

test("================ HISABDO FORM STANDARDIZATION TESTS ================", async (t) => {
  // 1. COMPONENT REUSE AND SINGLE IMPLEMENTATION VERIFICATION
  await t.test("1. Component Reuse Across All Entry Points", () => {
    const transactionsSrc = fs.readFileSync("src/app/(dashboard)/transactions/page.tsx", "utf8");
    const dashboardSrc = fs.readFileSync("src/app/(dashboard)/dashboard/page.tsx", "utf8");
    const expensesSrc = fs.readFileSync("src/app/(dashboard)/expenses/page.tsx", "utf8");
    const customerDetailSrc = fs.readFileSync("src/app/(dashboard)/customers/[id]/page.tsx", "utf8");

    // Check imports of reusable components
    assert.ok(
      transactionsSrc.includes("AddIncomeForm") && transactionsSrc.includes("AddExpenseForm"),
      "Transactions page must import and use both AddIncomeForm and AddExpenseForm"
    );
    assert.ok(
      dashboardSrc.includes("AddIncomeForm") && dashboardSrc.includes("AddExpenseForm"),
      "Dashboard page must import and use both AddIncomeForm and AddExpenseForm"
    );
    assert.ok(
      expensesSrc.includes("AddExpenseForm"),
      "Expenses page must import and use AddExpenseForm"
    );
    assert.ok(
      customerDetailSrc.includes("AddIncomeForm") && customerDetailSrc.includes("AddExpenseForm"),
      "Customer detail page must import and use both AddIncomeForm and AddExpenseForm"
    );

    // Verify no separate/duplicate form implementations in Dashboard
    assert.ok(
      !dashboardSrc.includes("Record Income (Lene / Sale)"),
      "Dashboard must not contain a duplicate inline Income modal"
    );
    assert.ok(
      !dashboardSrc.includes("Record Expense (Dene / Kharcha)"),
      "Dashboard must not contain a duplicate inline Expense modal"
    );

    // Verify no separate/duplicate form implementations in Expenses page
    assert.ok(
      !expensesSrc.includes("+ Record Expense"),
      "Expenses page must not contain a duplicate inline Expense modal"
    );

    // Verify reusable components are exported from central locations
    assert.ok(fs.existsSync("src/components/transactions/AddIncomeForm.tsx"), "AddIncomeForm exists");
    assert.ok(fs.existsSync("src/components/transactions/AddExpenseForm.tsx"), "AddExpenseForm exists");
    assert.ok(fs.existsSync("src/components/transactions/index.ts"), "Barrel export exists");
    assert.ok(fs.existsSync("src/components/AddIncomeForm.tsx"), "Root alias export for AddIncomeForm exists");
    assert.ok(fs.existsSync("src/components/AddExpenseForm.tsx"), "Root alias export for AddExpenseForm exists");
  });

  // 2. DASHBOARD QUICK ACCESS VERIFICATION
  await t.test("2. Direct Access Through Dashboard Quick Access", () => {
    const dashboardSrc = fs.readFileSync("src/app/(dashboard)/dashboard/page.tsx", "utf8");

    // Tile 1: Add Income triggers modal directly on Dashboard
    assert.ok(
      dashboardSrc.includes('onClick={() => setActiveModal("income")}'),
      "Dashboard Quick Access Add Income tile must trigger activeModal 'income'"
    );

    // Tile 2: Add Expense triggers modal directly on Dashboard
    assert.ok(
      dashboardSrc.includes('onClick={() => setActiveModal("expense")}'),
      "Dashboard Quick Access Add Expense tile must trigger activeModal 'expense'"
    );

    // Forms open in-place on Dashboard without navigating away
    assert.ok(
      dashboardSrc.includes('<AddIncomeForm\n        isOpen={activeModal === "income"}') ||
      dashboardSrc.includes('isOpen={activeModal === "income"}'),
      "Dashboard must render AddIncomeForm with activeModal === 'income'"
    );
    assert.ok(
      dashboardSrc.includes('<AddExpenseForm\n        isOpen={activeModal === "expense"}') ||
      dashboardSrc.includes('isOpen={activeModal === "expense"}'),
      "Dashboard must render AddExpenseForm with activeModal === 'expense'"
    );
  });

  // 3. CORRECT FORM AND TRANSACTION TYPE SELECTION
  await t.test("3. Correct Form and Transaction Type Selection", () => {
    const incomeSrc = fs.readFileSync("src/components/transactions/AddIncomeForm.tsx", "utf8");
    const expenseSrc = fs.readFileSync("src/components/transactions/AddExpenseForm.tsx", "utf8");

    // Headers match reference
    assert.ok(incomeSrc.includes("+ Add Income Entry"), "AddIncomeForm has + Add Income Entry title");
    assert.ok(expenseSrc.includes("+ Add Expense Entry"), "AddExpenseForm has + Add Expense Entry title");

    // Save functions target correct services
    assert.ok(incomeSrc.includes("hisabDoService.addIncome"), "AddIncomeForm invokes hisabDoService.addIncome");
    assert.ok(expenseSrc.includes("hisabDoService.addExpense"), "AddExpenseForm invokes hisabDoService.addExpense");

    // Styling matches respective reference
    assert.ok(incomeSrc.includes("focus:ring-emerald-500"), "AddIncomeForm uses emerald styling");
    assert.ok(incomeSrc.includes("#00E676"), "AddIncomeForm uses green action button");
    assert.ok(expenseSrc.includes("focus:ring-rose-500"), "AddExpenseForm uses rose styling");
    assert.ok(expenseSrc.includes("#E53935"), "AddExpenseForm uses red action button");
  });

  // 4. DATE PICKER BEHAVIOR, MANUAL ENTRY, AND DATE LIMITS
  await t.test("4. Date Picker Behavior, Manual Date Entry, and Date Limits", () => {
    const today = getTodayDateString();
    assert.match(today, /^\d{4}-\d{2}-\d{2}$/, "Today date returns YYYY-MM-DD format");

    // Valid calendar dates
    assert.equal(isValidDateString("2026-10-20"), true, "Valid current date accepted");
    assert.equal(isValidDateString("2024-02-29"), true, "Leap year Feb 29 accepted");
    assert.equal(isValidDateString("2026-02-29"), false, "Non-leap year Feb 29 rejected");
    assert.equal(isValidDateString("2026-04-31"), false, "31st day in 30-day month rejected");
    assert.equal(isValidDateString("2026-13-01"), false, "Month > 12 rejected");
    assert.equal(isValidDateString("2026-00-10"), false, "Month 00 rejected");
    assert.equal(isValidDateString("invalid"), false, "Arbitrary string rejected");
    assert.equal(isValidDateString("2026/10/20"), false, "Non-hyphenated format rejected");

    // Empty date
    const emptyCheck = validateTransactionDate("");
    assert.equal(emptyCheck.isValid, false);
    assert.equal(emptyCheck.error, "Date is required");

    // Valid date within bounds
    const validCheck = validateTransactionDate("2025-06-15", { minDate: "2020-01-01", maxDate: "2026-12-31" });
    assert.equal(validCheck.isValid, true);
    assert.equal(validCheck.error, undefined);

    // Future date limit check
    const futureDate = "2099-01-01";
    const futureCheck = validateTransactionDate(futureDate, { maxDate: today });
    assert.equal(futureCheck.isValid, false);
    assert.ok(futureCheck.error?.includes("future"), "Future date correctly prevented");

    // Past date limit check
    const ancientDate = "1980-01-01";
    const pastCheck = validateTransactionDate(ancientDate, { minDate: "2000-01-01" });
    assert.equal(pastCheck.isValid, false);
    assert.ok(pastCheck.error?.includes("earlier"), "Date before minDate correctly prevented");

    // Calendar picker button and hidden input in component
    const incomeSrc = fs.readFileSync("src/components/transactions/AddIncomeForm.tsx", "utf8");
    assert.ok(incomeSrc.includes("showPicker"), "AddIncomeForm has calendar picker trigger");
    assert.ok(incomeSrc.includes('type="date"'), "AddIncomeForm has native date picker element");
    assert.ok(incomeSrc.includes('type="text"'), "AddIncomeForm allows manual typing of date");
  });

  // 5. REQUIRED CATEGORY VALIDATION
  await t.test("5. Required Category Dropdown and Validation", () => {
    // Exactly one Category dropdown
    const incomeSrc = fs.readFileSync("src/components/transactions/AddIncomeForm.tsx", "utf8");
    const expenseSrc = fs.readFileSync("src/components/transactions/AddExpenseForm.tsx", "utf8");

    // Ensure only 1 category field and no free text category input
    const incomeCatMatches = incomeSrc.match(/name="category"/g);
    assert.equal(incomeCatMatches?.length, 1, "AddIncomeForm must have exactly one category field");
    assert.ok(incomeSrc.includes("<select"), "Category must be a select dropdown");
    assert.ok(!incomeSrc.includes('type="text"\n            name="category"'), "Category must not be a free text input");

    const expenseCatMatches = expenseSrc.match(/name="category"/g);
    assert.equal(expenseCatMatches?.length, 1, "AddExpenseForm must have exactly one category field");
    assert.ok(expenseSrc.includes("<select"), "Expense category must be a select dropdown");

    // Options exist and match domain models
    assert.ok(DEFAULT_INCOME_CATEGORIES.includes("Sales"), "Income categories contain Sales");
    assert.ok(DEFAULT_INCOME_CATEGORIES.includes("Salary"), "Income categories contain Salary");
    assert.ok(DEFAULT_EXPENSE_CATEGORIES.includes("Rent"), "Expense categories contain Rent");
    assert.ok(DEFAULT_EXPENSE_CATEGORIES.includes("Utilities"), "Expense categories contain Utilities");

    // Missing category validation message
    assert.ok(incomeSrc.includes("Please select a category"), "AddIncomeForm checks for required category");
    assert.ok(expenseSrc.includes("Please select a category"), "AddExpenseForm checks for required category");
  });

  // 6. SUCCESSFUL AND FAILED SUBMISSIONS & DUPLICATE PREVENTION
  await t.test("6. Successful and Failed Submission Handling", async () => {
    const incomeSrc = fs.readFileSync("src/components/transactions/AddIncomeForm.tsx", "utf8");

    // Prevents duplicate submissions while submitting
    assert.ok(incomeSrc.includes("if (submitting) return"), "Prevents duplicate submission while active");
    assert.ok(incomeSrc.includes("disabled={submitting}"), "Submit button is disabled during submission");

    // Error banner is present for failures
    assert.ok(incomeSrc.includes("errors.general"), "Displays error banner when save fails");
    assert.ok(incomeSrc.includes("Failed to save income transaction"), "Provides meaningful fallback error message");

    // Does not close modal or call onSuccess on failure
    assert.ok(
      incomeSrc.includes("catch (err"),
      "Catches submission errors without navigating or prematurely showing success"
    );
  });

  // 7. RECENT TRANSACTIONS UNWANTED SECONDARY TEXT REMOVAL
  await t.test("7. Recent Transactions Unwanted Secondary Text Removal", () => {
    const dashboardSrc = fs.readFileSync("src/app/(dashboard)/dashboard/page.tsx", "utf8");
    const transactionsSrc = fs.readFileSync("src/app/(dashboard)/transactions/page.tsx", "utf8");

    // Ensure Dashboard does NOT assign unwanted fallback strings "Direct Sale" or "Business Expense"
    assert.ok(
      !dashboardSrc.includes('customerName: c?.name || "Direct Sale"'),
      "Dashboard must not use 'Direct Sale' fallback for Recent Transactions"
    );
    assert.ok(
      !dashboardSrc.includes('customerName: c?.name || "Business Expense"'),
      "Dashboard must not use 'Business Expense' fallback for Recent Transactions"
    );

    // Ensure Recent Transactions hides or filters out "Direct Sale" and "Business Expense"
    assert.ok(
      dashboardSrc.includes('tx.customerName !== "Direct Sale"') &&
      dashboardSrc.includes('tx.customerName !== "Business Expense"'),
      "Recent Transactions rendering must guard against displaying 'Direct Sale' and 'Business Expense'"
    );

    // Ensure other transaction views (e.g. transactions tab) are NOT modified
    assert.ok(
      transactionsSrc.includes('"Counter Cash Sale"'),
      "Other transaction views must remain unaffected"
    );
  });
});

