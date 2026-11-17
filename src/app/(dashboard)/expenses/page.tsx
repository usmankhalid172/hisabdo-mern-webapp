"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Receipt,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Search,
  Filter,
  ArrowUpRight,
  X,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { Card } from "@/components/ui/design-system/Card";
import { PageHeading } from "@/components/ui/design-system/PageHeading";
import { LoadingState } from "@/components/ui/design-system/LoadingState";
import { EmptyState } from "@/components/ui/design-system/EmptyState";
import { ErrorState } from "@/components/ui/design-system/ErrorState";
import { AddExpenseForm } from "@/components/transactions/AddExpenseForm";
import { hisabDoService, Expense, Customer } from "@/services/hisabdoService";

export default function ExpensesPage() {
  const { user } = useAuth();
  const { formatMoney, currencySymbol, t } = useSettings();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "month">("all");

  // Create Modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Edit Modal
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Delete Confirmation Modal
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Action Feedback
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Auto-dismiss feedback after 5 seconds
  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => {
      setFeedback(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [feedback]);

  // Load Expenses & Customers Data
  const loadExpenses = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      const userId = user?.id || "guest";
      const [expenseData, customerData] = await Promise.all([
        hisabDoService.getExpenses(userId),
        hisabDoService.getCustomers(userId),
      ]);
      setExpenses(expenseData);
      setCustomers(customerData);
    } catch (e: any) {
      console.error("Error loading expenses:", e);
      setLoadError(e?.message || "Failed to load expense records.");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  // Customer Map for Fast Lookup
  const customerMap = useMemo(() => {
    const map = new Map<string, string>();
    customers.forEach((c) => {
      map.set(c.id, c.name);
    });
    return map;
  }, [customers]);

  // Handle Delete Confirmation
  const handleConfirmDelete = async () => {
    if (!expenseToDelete) return;
    if (isDeleting) return; // Prevent duplicate clicks

    try {
      setIsDeleting(true);
      const userId = user?.id || "guest";
      await hisabDoService.deleteExpense(userId, expenseToDelete.id);
      setFeedback({
        type: "success",
        message: "Expense entry deleted successfully.",
      });
      setExpenseToDelete(null);
      await loadExpenses();
    } catch (err: any) {
      console.error("Failed to delete expense:", err);
      setFeedback({
        type: "error",
        message: err?.message || "Failed to delete expense entry. Please try again.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter Logic (Search, Category, and Period)
  const filteredExpenses = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return expenses.filter((e) => {
      // 1. Search across description, category, and customer name
      if (search) {
        const descMatch = e.description ? e.description.toLowerCase().includes(search) : false;
        const catMatch = e.category_id ? e.category_id.toLowerCase().includes(search) : false;
        const custName = e.customer_id ? customerMap.get(e.customer_id) : undefined;
        const custMatch = custName ? custName.toLowerCase().includes(search) : false;

        if (!descMatch && !catMatch && !custMatch) return false;
      }

      // 2. Category filter
      if (selectedCategory !== "all" && e.category_id !== selectedCategory) {
        return false;
      }

      // 3. Date / Period filter
      if (dateFilter !== "all") {
        const expDate = new Date(e.expense_date);
        const now = new Date();

        if (dateFilter === "today") {
          const isToday =
            expDate.getDate() === now.getDate() &&
            expDate.getMonth() === now.getMonth() &&
            expDate.getFullYear() === now.getFullYear();
          if (!isToday) return false;
        } else if (dateFilter === "week") {
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(now.getDate() - 7);
          oneWeekAgo.setHours(0, 0, 0, 0);
          if (expDate.getTime() < oneWeekAgo.getTime()) return false;
        } else if (dateFilter === "month") {
          const isCurrentMonth =
            expDate.getMonth() === now.getMonth() &&
            expDate.getFullYear() === now.getFullYear();
          if (!isCurrentMonth) return false;
        }
      }

      return true;
    });
  }, [expenses, searchTerm, selectedCategory, dateFilter, customerMap]);

  const isFiltered =
    Boolean(searchTerm.trim()) || selectedCategory !== "all" || dateFilter !== "all";

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setDateFilter("all");
  };

  const totalExpenseAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, item) => sum + Number(item.amount), 0);
  }, [filteredExpenses]);

  const categories = useMemo(() => {
    return Array.from(new Set(expenses.map((e) => e.category_id || "General"))).filter(Boolean);
  }, [expenses]);

  return (
    <div className="space-y-6">
      {/* Top Header with PageHeading */}
      <PageHeading
        title={t("expenses") || "Expenses"}
        description="Track daily operating business expenses, utility bills, and staff salaries"
        action={
          <Button
            variant="danger"
            size="sm"
            icon={Plus}
            onClick={() => setIsModalOpen(true)}
          >
            {t("addExpense") || "Add Expense"}
          </Button>
        }
      />

      {/* Action Feedback Banner */}
      {feedback && (
        <div
          role="status"
          aria-live="polite"
          className={`flex items-center justify-between p-3.5 rounded-card border transition-all ${
            feedback.type === "success"
              ? "border-success/30 bg-success/10 text-success"
              : "border-danger/30 bg-danger/10 text-danger"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-success" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-danger" />
            )}
            <span className="text-xs sm:text-sm font-semibold">
              {feedback.message}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="p-1 rounded hover:opacity-75 transition focus-visible:outline-none"
            aria-label="Dismiss message"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 sm:p-5">
          <span className="text-xs font-semibold text-muted-foreground block mb-1">
            Total Operating Expenses
          </span>
          <p className="text-2xl sm:text-3xl font-black text-danger">
            -{formatMoney(totalExpenseAmount)}
          </p>
          <span className="text-[11px] text-muted-foreground mt-1 block">
            {filteredExpenses.length} entries recorded
          </span>
        </Card>

        <Card className="p-4 sm:p-5">
          <span className="text-xs font-semibold text-muted-foreground block mb-1">
            Active Expense Categories
          </span>
          <p className="text-2xl sm:text-3xl font-black text-primary">
            {categories.length}
          </p>
          <span className="text-[11px] text-muted-foreground mt-1 block truncate">
            Rent, Utilities, Staff, Supplies
          </span>
        </Card>

        <Card className="p-4 sm:p-5">
          <span className="text-xs font-semibold text-muted-foreground block mb-1">
            Total Ledger Entries
          </span>
          <p className="text-2xl sm:text-3xl font-black text-foreground">
            {expenses.length}
          </p>
          <span className="text-[11px] text-muted-foreground mt-1 block">
            Across all time periods
          </span>
        </Card>
      </div>

      {/* Search & Filter Toolbar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder="Search expense description, category, party..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search expenses"
              className="w-full rounded-control border border-border bg-surface-muted ps-9 pe-4 py-2 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Period Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground font-medium">Period:</span>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as any)}
                aria-label="Filter by period"
                className="rounded-control border border-border bg-surface-muted ps-2.5 pe-8 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground font-medium">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                aria-label="Filter by category"
                className="rounded-control border border-border bg-surface-muted ps-2.5 pe-8 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary max-w-[150px] truncate"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters Button */}
            {isFiltered && (
              <Button
                variant="secondary"
                size="sm"
                icon={RotateCcw}
                onClick={resetFilters}
                className="text-xs py-1"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Expenses Table Card */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <LoadingState variant="skeleton" message="Loading business expenses..." />
        ) : loadError ? (
          <ErrorState
            title="Unable to Load Expenses"
            message={loadError}
            onRetry={loadExpenses}
          />
        ) : filteredExpenses.length === 0 ? (
          <EmptyState
            title={isFiltered ? "No matching expenses" : "No expenses recorded yet"}
            message={
              isFiltered
                ? "No expense entries matched your current search and filter criteria. Try adjusting or clearing your filters."
                : "Record your business overheads, bills, and operational expenses to keep your ledger accurate."
            }
            action={
              isFiltered ? (
                <Button variant="secondary" size="sm" onClick={resetFilters}>
                  Clear Filters
                </Button>
              ) : (
                <Button
                  variant="danger"
                  size="sm"
                  icon={Plus}
                  onClick={() => setIsModalOpen(true)}
                  className="mt-2"
                >
                  Add Expense
                </Button>
              )
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] border-collapse text-sm">
              <thead className="border-b border-border bg-surface-muted text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th scope="col" className="px-4 py-3.5 text-start">Date</th>
                  <th scope="col" className="px-4 py-3.5 text-start">Category</th>
                  <th scope="col" className="px-4 py-3.5 text-start">Description</th>
                  <th scope="col" className="px-4 py-3.5 text-start">Payment Method</th>
                  <th scope="col" className="px-4 py-3.5 text-end">Amount</th>
                  <th scope="col" className="px-4 py-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredExpenses.map((exp) => (
                  <tr
                    key={exp.id}
                    className="transition-colors hover:bg-surface-muted/50"
                  >
                    <td className="px-4 py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(exp.expense_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <Badge variant="red" className="gap-1">
                        <ArrowUpRight className="w-3 h-3 text-danger" />
                        <span>{exp.category_id || "General"}</span>
                      </Badge>
                    </td>

                    <td className="px-4 py-3.5 text-xs text-foreground font-medium max-w-sm truncate">
                      {exp.description}
                    </td>

                    <td className="px-4 py-3.5 text-xs text-muted-foreground capitalize whitespace-nowrap">
                      <span className="rounded-control border border-border bg-surface-muted px-2 py-0.5 text-[11px] font-semibold text-foreground">
                        {exp.payment_method ? exp.payment_method.replace("_", " ") : "Cash"}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-end font-black text-sm text-danger whitespace-nowrap">
                      -{formatMoney(exp.amount)}
                    </td>

                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1 justify-center">
                        <button
                          type="button"
                          onClick={() => setEditingExpense(exp)}
                          title="Edit expense"
                          className="p-1.5 rounded-control text-muted-foreground hover:text-primary hover:bg-surface-muted transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span className="sr-only">Edit expense</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setExpenseToDelete(exp)}
                          title="Delete expense"
                          className="p-1.5 rounded-control text-muted-foreground hover:text-danger hover:bg-surface-muted transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="sr-only">Delete expense</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Modal using ConfirmDialog */}
      {expenseToDelete && (
        <ConfirmDialog
          isOpen={Boolean(expenseToDelete)}
          onClose={() => setExpenseToDelete(null)}
          onConfirm={handleConfirmDelete}
          isLoading={isDeleting}
          title="Delete Expense Entry"
          message={`Are you sure you want to delete this expense of ${currencySymbol}${expenseToDelete.amount} (${
            expenseToDelete.description || expenseToDelete.category_id || "Expense"
          })? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
        />
      )}

      {/* ================= REUSABLE ADD EXPENSE FORM ================= */}
      {/* Create Modal */}
      <AddExpenseForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          setFeedback({
            type: "success",
            message: "Expense recorded successfully.",
          });
          loadExpenses();
        }}
        customers={customers}
      />

      {/* Edit Modal reusing AddExpenseForm */}
      {editingExpense && (
        <AddExpenseForm
          isOpen={Boolean(editingExpense)}
          onClose={() => setEditingExpense(null)}
          onSuccess={() => {
            setEditingExpense(null);
            loadExpenses();
          }}
          customers={customers}
          initialAmount={editingExpense.amount}
          initialCategory={editingExpense.category_id || undefined}
          initialDescription={editingExpense.description}
          initialDate={
            editingExpense.expense_date
              ? editingExpense.expense_date.split("T")[0]
              : undefined
          }
          customerId={editingExpense.customer_id || undefined}
          paymentMethod={editingExpense.payment_method}
          onSubmitCustom={async (payload) => {
            try {
              const userId = user?.id || "guest";
              await hisabDoService.updateExpense(userId, editingExpense.id, {
                amount: payload.amount,
                customer_id: payload.customerId,
                description: payload.description,
                category_id: payload.category,
                payment_method: payload.paymentMethod,
                expense_date: payload.date,
              });
              setFeedback({
                type: "success",
                message: "Expense entry updated successfully.",
              });
              setEditingExpense(null);
              await loadExpenses();
            } catch (err: any) {
              console.error("Failed to update expense:", err);
              setFeedback({
                type: "error",
                message: err?.message || "Failed to update expense. Please try again.",
              });
              throw err;
            }
          }}
        />
      )}
    </div>
  );
}
