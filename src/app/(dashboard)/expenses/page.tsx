"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus,
  Trash2,
  Edit2,
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
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { FilterBar } from "@/components/ui/FilterBar";
import { AddTransactionDialog } from "@/components/transactions/AddTransactionDialog";
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

  // Danish's Add Transaction Dialog State
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedCustomerIdForAdd, setSelectedCustomerIdForAdd] = useState<string | undefined>(undefined);

  // Edit Modal State (reusing AddExpenseForm for custom edit submissions)
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
      setExpenses(expenseData || []);
      setCustomers(customerData || []);
    } catch (e: any) {
      console.error("Error loading expenses:", e);
      setLoadError(e?.message || "Failed to load expense records. Please try again.");
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

  // DataTable column definitions
  const columns: DataTableColumn<Expense>[] = [
    {
      key: "expense_date",
      header: "Date",
      sortable: true,
      render: (exp) => (
        <span className="whitespace-nowrap text-xs text-muted-foreground">
          {new Date(exp.expense_date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      key: "category_id",
      header: "Category",
      sortable: true,
      render: (exp) => (
        <span className="whitespace-nowrap">
          <Badge variant="red" className="gap-1">
            <ArrowUpRight className="w-3 h-3 text-danger" />
            <span>{exp.category_id || "General"}</span>
          </Badge>
        </span>
      ),
    },
    {
      key: "description",
      header: "Description",
      sortable: true,
      render: (exp) => {
        const custName = exp.customer_id ? customerMap.get(exp.customer_id) : undefined;
        return (
          <div className="max-w-sm truncate text-xs text-foreground font-medium">
            <span>{exp.description}</span>
            {custName && (
              <span className="block text-[11px] text-muted-foreground truncate">
                Party: {custName}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "payment_method",
      header: "Payment Method",
      sortable: true,
      render: (exp) => (
        <span className="rounded-control border border-border bg-surface-muted px-2 py-0.5 text-[11px] font-semibold text-foreground capitalize whitespace-nowrap">
          {exp.payment_method ? exp.payment_method.replace("_", " ") : "Cash"}
        </span>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      sortable: true,
      align: "right",
      render: (exp) => (
        <span className="whitespace-nowrap font-black text-sm text-danger text-end">
          -{formatMoney(exp.amount)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "center",
      render: (exp) => (
        <div className="inline-flex items-center gap-1 justify-center whitespace-nowrap">
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
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header with PageHeading */}
      <div className="pb-2 border-b border-border">
        <PageHeading
          title={t("expenses") || "Expenses"}
          description="Track daily operating business expenses, utility bills, and staff salaries."
          action={
            <Button
              variant="danger"
              size="sm"
              icon={Plus}
              onClick={() => {
                setSelectedCustomerIdForAdd(undefined);
                setIsAddDialogOpen(true);
              }}
            >
              {t("addExpense") || "Add Expense"}
            </Button>
          }
        />
      </div>

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
            className="p-1 rounded-control hover:opacity-75 transition focus-visible:outline-none"
            aria-label="Dismiss message"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 sm:p-5 rounded-card shadow-card space-y-1">
          <span className="text-xs font-semibold text-muted-foreground block">
            Total Operating Expenses
          </span>
          <p className="text-2xl sm:text-3xl font-black text-danger">
            -{formatMoney(totalExpenseAmount)}
          </p>
          <span className="text-[11px] text-muted-foreground block">
            {filteredExpenses.length} entries recorded
          </span>
        </Card>

        <Card className="p-4 sm:p-5 rounded-card shadow-card space-y-1">
          <span className="text-xs font-semibold text-muted-foreground block">
            Active Expense Categories
          </span>
          <p className="text-2xl sm:text-3xl font-black text-primary">
            {categories.length}
          </p>
          <span className="text-[11px] text-muted-foreground block truncate">
            Rent, Utilities, Staff, Supplies
          </span>
        </Card>

        <Card className="p-4 sm:p-5 rounded-card shadow-card space-y-1">
          <span className="text-xs font-semibold text-muted-foreground block">
            Total Ledger Entries
          </span>
          <p className="text-2xl sm:text-3xl font-black text-foreground">
            {expenses.length}
          </p>
          <span className="text-[11px] text-muted-foreground block">
            Across all time periods
          </span>
        </Card>
      </div>

      {/* Search & Filter Toolbar with FilterBar */}
      <FilterBar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search expense description, category, party..."
        actions={
          isFiltered ? (
            <Button
              variant="secondary"
              size="sm"
              icon={RotateCcw}
              onClick={resetFilters}
            >
              Clear
            </Button>
          ) : null
        }
      >
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
        </div>
      </FilterBar>

      {/* Expenses Table Card / States */}
      {isLoading ? (
        <Card className="p-8 shadow-card" aria-busy="true">
          <LoadingState variant="skeleton" message="Loading business expenses..." />
        </Card>
      ) : loadError ? (
        <Card className="shadow-card border-danger/30 bg-danger/5">
          <ErrorState
            title="Unable to Load Expenses"
            message={loadError}
            onRetry={loadExpenses}
          />
        </Card>
      ) : expenses.length === 0 ? (
        <Card className="shadow-card">
          <EmptyState
            title="No expenses recorded yet"
            message="Record your business overheads, bills, and operational expenses to keep your ledger accurate."
            action={
              <Button
                variant="danger"
                size="sm"
                icon={Plus}
                onClick={() => {
                  setSelectedCustomerIdForAdd(undefined);
                  setIsAddDialogOpen(true);
                }}
                className="mt-2"
              >
                Add Expense
              </Button>
            }
          />
        </Card>
      ) : (
        <DataTable
          columns={columns}
          data={filteredExpenses}
          rowKey={(exp) => exp.id}
          emptyTitle="No matching expenses"
          emptyMessage="No expense entries matched your current search and filter criteria. Try adjusting or clearing your filters."
          emptyAction={
            isFiltered ? (
              <Button variant="secondary" size="sm" onClick={resetFilters}>
                Clear Filters
              </Button>
            ) : undefined
          }
        />
      )}

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

      {/* ================= DANISH'S MERGED ADD TRANSACTION DIALOG ================= */}
      <AddTransactionDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        type="expense"
        customerId={selectedCustomerIdForAdd}
        onSuccess={() => {
          setFeedback({
            type: "success",
            message: "Expense recorded successfully.",
          });
          loadExpenses();
        }}
      />

      {/* ================= EDIT MODAL (REUSING ADDEXPENSEFORM) ================= */}
      {editingExpense && (
        <AddExpenseForm
          isOpen={Boolean(editingExpense)}
          onClose={() => setEditingExpense(null)}
          onSuccess={() => {
            setEditingExpense(null);
            setFeedback({
              type: "success",
              message: "Expense entry updated successfully.",
            });
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
