import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  getTodayDateString,
  getTodayDmyString,
  dmyToYmd,
  ymdToDmy,
  isLeapYear,
  getDaysInMonth,
  isValidCalendarDate,
  isValidDmyDateString,
  isValidDateString,
  getDateLimits,
  validateDateRestrictions,
  formatDateInput,
  parsePastedDate,
} from "../src/lib/validations/formDateValidation.ts";

test("================ HISABDO DAY 5 FORMS FOLLOW-UP TESTS ================", async (t) => {
  const incomeSrc = fs.readFileSync("src/components/transactions/AddIncomeForm.tsx", "utf8").replace(/\r\n/g, "\n");
  const expenseSrc = fs.readFileSync("src/components/transactions/AddExpenseForm.tsx", "utf8").replace(/\r\n/g, "\n");
  const popoverSrc = fs.readFileSync("src/components/ui/DatePickerPopover.tsx", "utf8").replace(/\r\n/g, "\n");
  const serviceSrc = fs.readFileSync("src/services/hisabdoService.ts", "utf8").replace(/\r\n/g, "\n");

  // 1. STEP 1: REUSABILITY IN ANY DIALOG
  await t.test("Step 1: Forms Reusability with customerId, onSuccess, and onCancel", () => {
    // Both interfaces accept optional props
    assert.ok(incomeSrc.includes("customerId?: string;"), "AddIncomeForm has optional customerId");
    assert.ok(incomeSrc.includes("onSuccess?: () => void;"), "AddIncomeForm has optional onSuccess");
    assert.ok(incomeSrc.includes("onCancel?: () => void;"), "AddIncomeForm has optional onCancel");

    assert.ok(expenseSrc.includes("customerId?: string;"), "AddExpenseForm has optional customerId");
    assert.ok(expenseSrc.includes("onSuccess?: () => void;"), "AddExpenseForm has optional onSuccess");
    assert.ok(expenseSrc.includes("onCancel?: () => void;"), "AddExpenseForm has optional onCancel");

    // Preselects customerId and hides customer picker when customerId is provided
    assert.ok(incomeSrc.includes("!customerId && ("), "AddIncomeForm hides picker when customerId is present");
    assert.ok(incomeSrc.includes("customerId: customerId"), "AddIncomeForm preselects customerId");
    assert.ok(expenseSrc.includes("!customerId && ("), "AddExpenseForm hides picker when customerId is present");
    assert.ok(expenseSrc.includes("customerId: customerId"), "AddExpenseForm preselects customerId");

    // Existing behavior preserved when omitted
    assert.ok(incomeSrc.includes('customerId = ""'), "AddIncomeForm default customerId is empty string");
    assert.ok(expenseSrc.includes('customerId = ""'), "AddExpenseForm default customerId is empty string");

    // Callbacks
    assert.ok(incomeSrc.includes("handleCancel"), "AddIncomeForm has handleCancel handler");
    assert.ok(incomeSrc.includes("if (onCancel) {\n      onCancel();\n    }"), "AddIncomeForm calls onCancel on cancel");
    assert.ok(expenseSrc.includes("handleCancel"), "AddExpenseForm has handleCancel handler");
    assert.ok(expenseSrc.includes("if (onCancel) {\n      onCancel();\n    }"), "AddExpenseForm calls onCancel on cancel");

    // onSuccess only on success, not in catch block
    const incomeTry = incomeSrc.substring(incomeSrc.indexOf("try {"), incomeSrc.indexOf("} catch"));
    assert.ok(incomeTry.includes("if (onSuccess) {\n        await onSuccess();\n      }"), "Income calls onSuccess on save");
    const incomeCatch = incomeSrc.substring(incomeSrc.indexOf("} catch"), incomeSrc.indexOf("} finally"));
    assert.ok(!incomeCatch.includes("onSuccess"), "Income does not call onSuccess on save failure");

    const expenseTry = expenseSrc.substring(expenseSrc.indexOf("try {"), expenseSrc.indexOf("} catch"));
    assert.ok(expenseTry.includes("if (onSuccess) {\n        await onSuccess();\n      }"), "Expense calls onSuccess on save");
    const expenseCatch = expenseSrc.substring(expenseSrc.indexOf("} catch"), expenseSrc.indexOf("} finally"));
    assert.ok(!expenseCatch.includes("onSuccess"), "Expense does not call onSuccess on save failure");
  });

  // 2. STEP 2: DESIGN TOKENS AND COLORS AUDIT
  await t.test("Step 2: No Hard-coded Hex Colors or Arbitrary text-[var(--...)] Classes", () => {
    // Check no hard-coded hex colors in AddIncomeForm
    const hexRegex = /#[0-9a-fA-F]{3,8}/g;
    const incomeHexMatches = incomeSrc.match(hexRegex);
    assert.equal(incomeHexMatches, null, `AddIncomeForm should have zero hard-coded hex colors, found: ${incomeHexMatches}`);

    // Check no hard-coded hex colors in AddExpenseForm
    const expenseHexMatches = expenseSrc.match(hexRegex);
    assert.equal(expenseHexMatches, null, `AddExpenseForm should have zero hard-coded hex colors, found: ${expenseHexMatches}`);

    // Check no hard-coded hex colors in DatePickerPopover
    const popoverHexMatches = popoverSrc.match(hexRegex);
    assert.equal(popoverHexMatches, null, `DatePickerPopover should have zero hard-coded hex colors, found: ${popoverHexMatches}`);

    // Check no text-[var(--...)] arbitrary classes
    assert.ok(!incomeSrc.includes("text-[var("), "AddIncomeForm has no text-[var(--...)] arbitrary classes");
    assert.ok(!expenseSrc.includes("text-[var("), "AddExpenseForm has no text-[var(--...)] arbitrary classes");
    assert.ok(!popoverSrc.includes("text-[var("), "DatePickerPopover has no text-[var(--...)] arbitrary classes");

    // Verify presence of standard design tokens
    assert.ok(incomeSrc.includes("bg-surface"), "AddIncomeForm uses bg-surface");
    assert.ok(incomeSrc.includes("text-foreground"), "AddIncomeForm uses text-foreground");
    assert.ok(incomeSrc.includes("text-muted-foreground"), "AddIncomeForm uses text-muted-foreground");
    assert.ok(incomeSrc.includes("border-border"), "AddIncomeForm uses border-border");
    assert.ok(incomeSrc.includes("rounded-card"), "AddIncomeForm uses rounded-card");
    assert.ok(incomeSrc.includes("rounded-control"), "AddIncomeForm uses rounded-control");
    assert.ok(incomeSrc.includes("text-success"), "AddIncomeForm uses text-success token");

    assert.ok(expenseSrc.includes("bg-surface"), "AddExpenseForm uses bg-surface");
    assert.ok(expenseSrc.includes("text-foreground"), "AddExpenseForm uses text-foreground");
    assert.ok(expenseSrc.includes("text-muted-foreground"), "AddExpenseForm uses text-muted-foreground");
    assert.ok(expenseSrc.includes("border-border"), "AddExpenseForm uses border-border");
    assert.ok(expenseSrc.includes("rounded-card"), "AddExpenseForm uses rounded-card");
    assert.ok(expenseSrc.includes("rounded-control"), "AddExpenseForm uses rounded-control");
    assert.ok(expenseSrc.includes("text-danger"), "AddExpenseForm uses text-danger token");
  });

  // 3. STEP 3: THEMED CALENDAR POPOVER
  await t.test("Step 3: Themed Calendar Popover Replaces Native Date Picker", () => {
    // Both forms use DatePickerPopover
    assert.ok(incomeSrc.includes("<DatePickerPopover"), "AddIncomeForm renders DatePickerPopover");
    assert.ok(expenseSrc.includes("<DatePickerPopover"), "AddExpenseForm renders DatePickerPopover");

    // No native browser date picker input (type="date")
    assert.ok(!incomeSrc.includes('type="date"'), "AddIncomeForm does NOT contain native type='date' input");
    assert.ok(!expenseSrc.includes('type="date"'), "AddExpenseForm does NOT contain native type='date' input");
    assert.ok(!popoverSrc.includes('type="date"'), "DatePickerPopover does NOT contain native type='date' input");

    // DatePickerPopover implements themed dialog, weekdays, and month navigation
    assert.ok(popoverSrc.includes('role="dialog"'), "DatePickerPopover has accessible dialog role");
    assert.ok(popoverSrc.includes("ChevronLeft"), "DatePickerPopover has previous month button");
    assert.ok(popoverSrc.includes("ChevronRight"), "DatePickerPopover has next month button");
    assert.ok(popoverSrc.includes("handleSelectToday"), "DatePickerPopover has quick today jump");
  });

  // 4. STEP 4: DATE FORMATTING AND CALENDAR VALIDATION
  await t.test("Step 4: Date Formatting (DD-MM-YYYY) and Calendar Validity", () => {
    // Digits only formatting with automatic dashes
    assert.equal(formatDateInput("1"), "1");
    assert.equal(formatDateInput("16"), "16");
    assert.equal(formatDateInput("161"), "16-1");
    assert.equal(formatDateInput("1611"), "16-11");
    assert.equal(formatDateInput("16112"), "16-11-2");
    assert.equal(formatDateInput("16112026"), "16-11-2026");
    assert.equal(formatDateInput("16abc11def2026"), "16-11-2026", "Strips non-digits");

    // Support pasted dates
    assert.equal(parsePastedDate("2026-11-16"), "16-11-2026", "Converts pasted YYYY-MM-DD to DD-MM-YYYY");
    assert.equal(parsePastedDate("16/11/2026"), "16-11-2026", "Converts pasted DD/MM/YYYY to DD-MM-YYYY");
    assert.equal(parsePastedDate("16.11.2026"), "16-11-2026", "Converts pasted DD.MM.YYYY to DD-MM-YYYY");
    assert.equal(parsePastedDate("16-11-2026"), "16-11-2026", "Preserves valid DD-MM-YYYY");
    assert.equal(parsePastedDate("16112026"), "16-11-2026", "Formats 8 digits as DD-MM-YYYY");

    // Conversion without timezone shifts
    assert.equal(dmyToYmd("16-11-2026"), "2026-11-16");
    assert.equal(ymdToDmy("2026-11-16"), "16-11-2026");

    // Leap year checks
    assert.equal(isLeapYear(2024), true, "2024 is a leap year");
    assert.equal(isLeapYear(2025), false, "2025 is not a leap year");
    assert.equal(isLeapYear(2026), false, "2026 is not a leap year");
    assert.equal(isLeapYear(2000), true, "2000 is a leap year");
    assert.equal(isLeapYear(1900), false, "1900 is not a leap year");

    // Reject impossible dates
    assert.equal(isValidDmyDateString("31-04-2026"), false, "31-04-2026 rejected (April has 30 days)");
    assert.equal(isValidDmyDateString("30-02-2026"), false, "30-02-2026 rejected (Feb has at most 29 days)");
    assert.equal(isValidDmyDateString("29-02-2025"), false, "29-02-2025 rejected (2025 is not a leap year)");
    assert.equal(isValidDmyDateString("29-02-2024"), true, "29-02-2024 accepted (2024 is a leap year)");
    assert.equal(isValidDmyDateString("31-12-2026"), true, "31-12-2026 accepted");

    // YMD validity
    assert.equal(isValidDateString("2026-04-31"), false, "2026-04-31 rejected");
    assert.equal(isValidDateString("2026-02-30"), false, "2026-02-30 rejected");
    assert.equal(isValidDateString("2025-02-29"), false, "2025-02-29 rejected");
    assert.equal(isValidDateString("2024-02-29"), true, "2024-02-29 accepted");
  });

  // 5. STEP 5: DATE RESTRICTIONS (HARD LIMITS & CONFIRMATION WARNINGS)
  await t.test("Step 5: Hard Date Limits and Confirmation Warnings", () => {
    const fixedToday = new Date(2026, 10, 16); // 16 Nov 2026
    const limits = getDateLimits(fixedToday);

    assert.equal(limits.minHardDate, "2021-11-16", "5 years past hard limit is 2021-11-16");
    assert.equal(limits.maxHardDate, "2029-11-16", "3 years future hard limit is 2029-11-16");
    assert.equal(limits.warningPastDate, "2026-08-18", "90 days past limit calculated accurately");
    assert.equal(limits.warningFutureDate, "2027-11-16", "1 year future limit is 2027-11-16");

    // Hard limit: older than 5 years rejected
    const tooOld = validateDateRestrictions("2021-11-15", fixedToday);
    assert.equal(tooOld.isValid, false);
    assert.ok(tooOld.error?.includes("older than 5 years"), "Rejects older than 5 years");

    // Hard limit: more than 3 years in future rejected
    const tooFarFuture = validateDateRestrictions("2029-11-17", fixedToday);
    assert.equal(tooFarFuture.isValid, false);
    assert.ok(tooFarFuture.error?.includes("more than 3 years in the future"), "Rejects more than 3 years future");

    // Warning: more than 90 days in past
    const warnPast = validateDateRestrictions("2026-08-01", fixedToday);
    assert.equal(warnPast.isValid, true);
    assert.equal(warnPast.isWarning, true);
    assert.ok(warnPast.warningMessage?.includes("more than 90 days in the past"), "Generates 90 days past warning");

    // Warning: more than 1 year in future
    const warnFuture = validateDateRestrictions("2027-12-01", fixedToday);
    assert.equal(warnFuture.isValid, true);
    assert.equal(warnFuture.isWarning, true);
    assert.ok(warnFuture.warningMessage?.includes("more than 1 year in the future"), "Generates 1 year future warning");

    // Normal date inside regular range: valid with no warning
    const normalDate = validateDateRestrictions("2026-10-15", fixedToday);
    assert.equal(normalDate.isValid, true);
    assert.equal(normalDate.isWarning, undefined);

    // ConfirmDialog presence in both forms
    assert.ok(incomeSrc.includes("<ConfirmDialog"), "AddIncomeForm integrates ConfirmDialog for warnings");
    assert.ok(expenseSrc.includes("<ConfirmDialog"), "AddExpenseForm integrates ConfirmDialog for warnings");
    assert.ok(incomeSrc.includes('title="Are you sure?"'), "AddIncomeForm uses 'Are you sure?' confirmation");
    assert.ok(expenseSrc.includes('title="Are you sure?"'), "AddExpenseForm uses 'Are you sure?' confirmation");
  });

  // 6. STEP 6: SERVICE AND FORM VALIDATION (CATEGORY, AMOUNT, DATE)
  await t.test("Step 6: Category, Amount, and Date Validation in hisabdoService and Forms", () => {
    // 1. Service addIncome validation enforcement
    const addIncomeMatch = serviceSrc.substring(serviceSrc.indexOf("addIncome("), serviceSrc.indexOf("addIncome(") + 900);
    assert.ok(addIncomeMatch.includes("numAmount <= 0"), "addIncome checks for positive amount");
    assert.ok(addIncomeMatch.includes('throw new Error("Amount must be greater than zero")'), "addIncome throws for zero/negative amount");
    assert.ok(addIncomeMatch.includes("if (!category)"), "addIncome checks for required category");
    assert.ok(addIncomeMatch.includes('throw new Error("Category is required")'), "addIncome throws for missing category");
    assert.ok(addIncomeMatch.includes("validateDateRestrictions(dateStr)"), "addIncome validates date restrictions");

    // 2. Service addExpense validation enforcement
    const addExpenseMatch = serviceSrc.substring(serviceSrc.indexOf("addExpense("), serviceSrc.indexOf("addExpense(") + 900);
    assert.ok(addExpenseMatch.includes("numAmount <= 0"), "addExpense checks for positive amount");
    assert.ok(addExpenseMatch.includes('throw new Error("Amount must be greater than zero")'), "addExpense throws for zero/negative amount");
    assert.ok(addExpenseMatch.includes("if (!category)"), "addExpense checks for required category");
    assert.ok(addExpenseMatch.includes('throw new Error("Category is required")'), "addExpense throws for missing category");
    assert.ok(addExpenseMatch.includes("validateDateRestrictions(dateStr)"), "addExpense validates date restrictions");

    // 3. Form validation checks in AddIncomeForm
    assert.ok(incomeSrc.includes("numAmount <= 0"), "AddIncomeForm validates amount > 0");
    assert.ok(incomeSrc.includes("Please enter a valid amount greater than 0"), "AddIncomeForm amount error message");
    assert.ok(incomeSrc.includes("!formData.category"), "AddIncomeForm validates category required");
    assert.ok(incomeSrc.includes("Please select a category"), "AddIncomeForm category error message");
    assert.ok(incomeSrc.includes("validateDateRestrictions(formData.date)"), "AddIncomeForm validates date restrictions");

    // 4. Form validation checks in AddExpenseForm
    assert.ok(expenseSrc.includes("numAmount <= 0"), "AddExpenseForm validates amount > 0");
    assert.ok(expenseSrc.includes("Please enter a valid amount greater than 0"), "AddExpenseForm amount error message");
    assert.ok(expenseSrc.includes("!formData.category"), "AddExpenseForm validates category required");
    assert.ok(expenseSrc.includes("Please select a category"), "AddExpenseForm category error message");
    assert.ok(expenseSrc.includes("validateDateRestrictions(formData.date)"), "AddExpenseForm validates date restrictions");
  });
});
