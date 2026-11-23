import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("Day 5 Step 1: Reusable Forms in Any Dialog", async (t) => {
  const incomeSrc = fs.readFileSync("src/components/transactions/AddIncomeForm.tsx", "utf8").replace(/\r\n/g, "\n");
  const expenseSrc = fs.readFileSync("src/components/transactions/AddExpenseForm.tsx", "utf8").replace(/\r\n/g, "\n");

  await t.test("Income and Expense forms accept optional customerId, onSuccess, and onCancel", () => {
    // Check AddIncomeFormProps interface
    assert.ok(incomeSrc.includes("customerId?: string;"), "AddIncomeFormProps has optional customerId");
    assert.ok(incomeSrc.includes("onSuccess?: () => void;"), "AddIncomeFormProps has optional onSuccess");
    assert.ok(incomeSrc.includes("onCancel?: () => void;"), "AddIncomeFormProps has optional onCancel");

    // Check AddExpenseFormProps interface
    assert.ok(expenseSrc.includes("customerId?: string;"), "AddExpenseFormProps has optional customerId");
    assert.ok(expenseSrc.includes("onSuccess?: () => void;"), "AddExpenseFormProps has optional onSuccess");
    assert.ok(expenseSrc.includes("onCancel?: () => void;"), "AddExpenseFormProps has optional onCancel");
  });

  await t.test("Preselect supplied customerId and hide customer picker when customerId is provided", () => {
    // AddIncomeForm hides customer picker when customerId is provided
    assert.ok(incomeSrc.includes("!customerId && ("), "AddIncomeForm hides picker when customerId is present");
    assert.ok(incomeSrc.includes("customerId: customerId"), "AddIncomeForm preselects customerId");

    // AddExpenseForm hides customer picker when customerId is provided
    assert.ok(expenseSrc.includes("!customerId && ("), "AddExpenseForm hides picker when customerId is present");
    assert.ok(expenseSrc.includes("customerId: customerId"), "AddExpenseForm preselects customerId");
  });

  await t.test("onCancel callback called on cancellation", () => {
    assert.ok(incomeSrc.includes("handleCancel"), "AddIncomeForm has handleCancel handler");
    assert.ok(incomeSrc.includes("if (onCancel) {\n      onCancel();\n    }"), "AddIncomeForm calls onCancel");
    assert.ok(expenseSrc.includes("handleCancel"), "AddExpenseForm has handleCancel handler");
    assert.ok(expenseSrc.includes("if (onCancel) {\n      onCancel();\n    }"), "AddExpenseForm calls onCancel");
  });

  await t.test("onSuccess callback called only on successful save and not on error", () => {
    // Both call onSuccess only inside try block after addIncome / addExpense
    const incomeTryBlock = incomeSrc.substring(incomeSrc.indexOf("try {"), incomeSrc.indexOf("} catch"));
    assert.ok(incomeTryBlock.includes("if (onSuccess) {\n        await onSuccess();\n      }"), "AddIncomeForm calls onSuccess on success");
    const incomeCatchBlock = incomeSrc.substring(incomeSrc.indexOf("} catch"), incomeSrc.indexOf("} finally"));
    assert.ok(!incomeCatchBlock.includes("onSuccess"), "AddIncomeForm does NOT call onSuccess on failure");

    const expenseTryBlock = expenseSrc.substring(expenseSrc.indexOf("try {"), expenseSrc.indexOf("} catch"));
    assert.ok(expenseTryBlock.includes("if (onSuccess) {\n        await onSuccess();\n      }"), "AddExpenseForm calls onSuccess on success");
    const expenseCatchBlock = expenseSrc.substring(expenseSrc.indexOf("} catch"), expenseSrc.indexOf("} finally"));
    assert.ok(!expenseCatchBlock.includes("onSuccess"), "AddExpenseForm does NOT call onSuccess on failure");
  });
});
