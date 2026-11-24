"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Plus,
  Trash2,
  Edit2,
  ArrowDownLeft,
  ArrowUpRight,
  Loader2,
  Calendar,
  RotateCcw,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/design-system/Card";
import { PageHeading } from "@/components/ui/design-system/PageHeading";
import { LoadingState } from "@/components/ui/design-system/LoadingState";
import { EmptyState } from "@/components/ui/design-system/EmptyState";
import { ErrorState } from "@/components/ui/design-system/ErrorState";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { FilterBar } from "@/components/ui/FilterBar";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { AddTransactionDialog } from "@/components/transactions/AddTransactionDialog";
import { AddIncomeForm } from "@/components/transactions/AddIncomeForm";
import { AddExpenseForm } from "@/components/transactions/AddExpenseForm";
import {
  hisabDoService,
  Customer,
  Income,
  Expense,
  LedgerTransaction,
} from "@/services/hisabdoService";

export interface UnifiedTransaction {
  id: string;
  sourceTable: "income" | "expenses" | "ledger_transactions";
  type: "income" | "expense" | "payment_received" | "payment_sent";
  amount: number;
  date: string;
  category: string;
  description: string;
  customerId?: string | null;
  customerName?: string;
  paymentMethod: string;
}

export default function TransactionsPage() {
  const { user } = useAuth();
  const { formatMoney, currencySymbol, t } = useSettings();

  const [transactions, setTransactions] = useState<UnifiedTransaction[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Feedback state
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Auto-dismiss feedback after 5 seconds
  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => {
      setFeedback(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [feedback]);

  // Delete & Edit states
  const [deleteTarget, setDeleteTarget] = useState<UnifiedTransaction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<UnifiedTransaction | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense" | "payment">("all");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "month" | "custom">("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Danish's Add Transaction Dialog State
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [transactionDialogType, setTransactionDialogType] = useState<"income" | "expense">("income");

  const handleOpenAddIncome = () => {
    setTransactionDialogType("income");
    setIsTransactionDialogOpen(true);
  };

  const handleOpenAddExpense = () => {
    setTransactionDialogType("expense");
    setIsTransactionDialogOpen(true);
  };

  const handleTransactionSuccess = async () => {
    setFeedback({
      type: "success",
      message: `${transactionDialogType === "income" ? "Income" : "Expense"} transaction recorded successfully!`,
    });
    await loadData();
  };

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      const userId = user?.id || "guest";
      const [custs, incs, exps, pmts] = await Promise.all([
        hisabDoService.getCustomers(userId),
        hisabDoService.getIncomes(userId),
        hisabDoService.getExpenses(userId),
        hisabDoService.getLedgerTransactions(userId).catch(() => []),
      ]);

      setCustomers(custs || []);

      const combined: UnifiedTransaction[] = [];

      (incs || []).forEach((i: Income) => {
        const c = (custs || []).find((cust: Customer) => cust.id === i.customer_id);
        combined.push({
          id: i.id,
          sourceTable: "income",
          type: "income",
          amount: Number(i.amount),
          date: i.income_date,
          category: i.category_id || "Sales",
          description: i.description || "Credit / Cash Sale",
          customerId: i.customer_id,
          customerName: c?.name || "Counter Cash Sale",
          paymentMethod: i.payment_method,
        });
      });

      (exps || []).forEach((e: Expense) => {
        const c = (custs || []).find((cust: Customer) => cust.id === e.customer_id);
        combined.push({
          id: e.id,
          sourceTable: "expenses",
          type: "expense",
          amount: Number(e.amount),
          date: e.expense_date,
          category: e.category_id || "General",
          description: e.description || "Shop Expense",
          customerId: e.customer_id,
          customerName: c?.name || "General Operating",
          paymentMethod: e.payment_method,
        });
      });

      (pmts || []).forEach((p: LedgerTransaction) => {
        const c = (custs || []).find((cust: Customer) => cust.id === p.customerId);
        combined.push({
          id: p.id,
          sourceTable: "ledger_transactions",
          type: p.type === "received" ? "payment_received" : "payment_sent",
          amount: Number(p.amount),
          date: p.date,
          category: p.category || "Payment",
          description: p.note || (p.type === "received" ? "Payment Received" : "Payment Sent"),
          customerId: p.customerId,
          customerName: c?.name || "Direct Customer",
          paymentMethod: p.category || "Cash",
        });
      });

      combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setTransactions(combined);
    } catch (err: any) {
      console.error("Error loading transactions:", err);
      setLoadError(
        err?.message ||
          "Failed to load transaction records. Please check your network connection and try again."
      );
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlType = params.get("type");
      if (urlType === "income" || urlType === "expense" || urlType === "payment") {
        setTypeFilter(urlType);
      }
    }
  }, [loadData]);

  // Handle Delete with feedback
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const userId = user?.id || "guest";
    try {
      setIsDeleting(true);
      if (deleteTarget.sourceTable === "income") {
        await hisabDoService.deleteIncome(userId, deleteTarget.id);
      } else if (deleteTarget.sourceTable === "expenses") {
        await hisabDoService.deleteExpense(userId, deleteTarget.id);
      } else if (deleteTarget.sourceTable === "ledger_transactions") {
        await hisabDoService.deleteLedgerTransaction(userId, deleteTarget.id);
      }
      setDeleteTarget(null);
      setFeedback({
        type: "success",
        message: "Transaction record deleted successfully.",
      });
      await loadData();
    } catch (err: any) {
      console.error("Failed to delete transaction:", err);
      setFeedback({
        type: "error",
        message: err?.message || "Failed to delete transaction record.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle Edit Submit with feedback
  const handleEditSubmit = async (payload: {
    amount: number;
    customerId: string | null;
    category: string;
    description: string;
    date: string;
    paymentMethod: string;
  }) => {
    if (!editingTransaction) return;
    const userId = user?.id || "guest";
    try {
      if (editingTransaction.sourceTable === "income") {
        await hisabDoService.updateIncome(userId, editingTransaction.id, {
          amount: payload.amount,
          customer_id: payload.customerId || undefined,
          category_id: payload.category,
          description: payload.description,
          income_date: payload.date,
          payment_method: payload.paymentMethod,
        });
      } else if (editingTransaction.sourceTable === "expenses") {
        await hisabDoService.updateExpense(userId, editingTransaction.id, {
          amount: payload.amount,
          customer_id: payload.customerId || undefined,
          category_id: payload.category,
          description: payload.description,
          expense_date: payload.date,
          payment_method: payload.paymentMethod,
        });
      } else if (editingTransaction.sourceTable === "ledger_transactions") {
        await hisabDoService.updateLedgerTransaction(userId, editingTransaction.id, {
          amount: payload.amount,
          customerId: payload.customerId || undefined,
          category: payload.category,
          note: payload.description,
          date: payload.date,
        });
      }
      setEditingTransaction(null);
      setFeedback({
        type: "success",
        message: "Transaction updated successfully.",
      });
      await loadData();
    } catch (err: any) {
      console.error("Failed to update transaction:", err);
      setFeedback({
        type: "error",
        message: err?.message || "Failed to update transaction record.",
      });
      throw err;
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchTerm("");
    setTypeFilter("all");
    setDateFilter("all");
    setStartDate("");
    setEndDate("");
    setSelectedCustomerId("all");
    setSelectedCategory("all");
  };

  // Filter Logic (Search across description, customer, category, payment method, amount)
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Search
      const search = searchTerm.trim().toLowerCase();
      if (search) {
        const matchesSearch =
          tx.description.toLowerCase().includes(search) ||
          (tx.customerName && tx.customerName.toLowerCase().includes(search)) ||
          tx.category.toLowerCase().includes(search) ||
          (tx.paymentMethod && tx.paymentMethod.toLowerCase().includes(search)) ||
          String(tx.amount).includes(search);
        if (!matchesSearch) return false;
      }

      // Type filter
      if (typeFilter === "income" && tx.type !== "income") return false;
      if (typeFilter === "expense" && tx.type !== "expense") return false;
      if (typeFilter === "payment" && tx.type !== "payment_received" && tx.type !== "payment_sent") return false;

      // Customer filter
      if (selectedCustomerId !== "all" && tx.customerId !== selectedCustomerId) return false;

      // Category filter
      if (selectedCategory !== "all" && tx.category !== selectedCategory) return false;

      // Date filter
      const txDate = new Date(tx.date);
      const now = new Date();
      if (dateFilter === "today") {
        const isToday =
          txDate.getDate() === now.getDate() &&
          txDate.getMonth() === now.getMonth() &&
          txDate.getFullYear() === now.getFullYear();
        if (!isToday) return false;
      } else if (dateFilter === "week") {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);
        if (txDate < oneWeekAgo) return false;
      } else if (dateFilter === "month") {
        const isCurrentMonth =
          txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
        if (!isCurrentMonth) return false;
      } else if (dateFilter === "custom") {
        if (startDate && new Date(tx.date) < new Date(startDate)) return false;
        if (endDate && new Date(tx.date) > new Date(endDate)) return false;
      }

      return true;
    });
  }, [transactions, searchTerm, typeFilter, selectedCustomerId, selectedCategory, dateFilter, startDate, endDate]);

  // Unique categories for filter dropdown
  const categories = useMemo(() => {
    return Array.from(new Set(transactions.map((t) => t.category))).filter(Boolean);
  }, [transactions]);

  // Totals for filtered transactions
  const totalFilteredIncome = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === "income" || t.type === "payment_received")
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const totalFilteredExpense = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === "expense" || t.type === "payment_sent")
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const netCashflow = totalFilteredIncome - totalFilteredExpense;

  const isFiltered =
    searchTerm !== "" ||
    typeFilter !== "all" ||
    dateFilter !== "all" ||
    selectedCustomerId !== "all" ||
    selectedCategory !== "all";

  // DataTable column definitions
  const columns: DataTableColumn<UnifiedTransaction>[] = [
    {
      key: "date",
      header: "Date",
      sortable: true,
      render: (tx) => (
        <span className="whitespace-nowrap text-xs text-muted-foreground">
          {new Date(tx.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      key: "type",
      header: "Type",
      sortable: true,
      render: (tx) => {
        const isIncome = tx.type === "income";
        const isExpense = tx.type === "expense";
        const isPaymentIn = tx.type === "payment_received";

        const badgeVariant = isIncome
          ? "green"
          : isExpense
          ? "red"
          : isPaymentIn
          ? "purple"
          : "amber";

        const label = isIncome
          ? "Income"
          : isExpense
          ? "Expense"
          : isPaymentIn
          ? "Payment In"
          : "Payment Out";

        const Icon = isIncome || isPaymentIn ? ArrowDownLeft : ArrowUpRight;

        return (
          <Badge variant={badgeVariant} className="whitespace-nowrap">
            <Icon className="w-3 h-3" />
            <span>{label}</span>
          </Badge>
        );
      },
    },
    {
      key: "customerName",
      header: "Customer / Party",
      sortable: true,
      render: (tx) => (
        <span className="whitespace-nowrap text-xs font-semibold">
          {tx.customerId ? (
            <Link
              href={`/customers/${tx.customerId}`}
              className="text-primary hover:underline"
            >
              {tx.customerName}
            </Link>
          ) : (
            <span className="text-muted-foreground">{tx.customerName}</span>
          )}
        </span>
      ),
    },
    {
      key: "description",
      header: "Description",
      sortable: true,
      render: (tx) => (
        <span className="max-w-xs truncate text-xs text-foreground block">
          {tx.description}
        </span>
      ),
    },
    {
      key: "category",
      header: "Category",
      sortable: true,
      render: (tx) => (
        <span className="whitespace-nowrap">
          <Badge variant="neutral">{tx.category}</Badge>
        </span>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      sortable: true,
      align: "right",
      render: (tx) => {
        const isPositive = tx.type === "income" || tx.type === "payment_received";
        return (
          <span
            className={`whitespace-nowrap font-black text-sm text-end ${
              isPositive ? "text-success" : "text-danger"
            }`}
          >
            {isPositive ? "+" : "-"}
            {formatMoney(tx.amount)}
          </span>
        );
      },
    },
    {
      key: "action",
      header: "Action",
      align: "center",
      render: (tx) => (
        <div className="flex items-center justify-center gap-1">
          <button
            type="button"
            onClick={() => setEditingTransaction(tx)}
            title="Edit transaction"
            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-surface-muted rounded-control transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span className="sr-only">Edit transaction</span>
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget(tx)}
            title="Delete entry"
            disabled={isDeleting && deleteTarget?.id === tx.id}
            className="p-1.5 text-muted-foreground hover:text-danger hover:bg-surface-muted rounded-control transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
          >
            {isDeleting && deleteTarget?.id === tx.id ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
            <span className="sr-only">Delete entry</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* ================= 1. PAGE HEADING & QUICK ACTIONS ================= */}
      <div className="pb-2 border-b border-border">
        <PageHeading
          title={t("transactions") || "Transactions"}
          description="Unified chronological ledger of all cashflow, sales, expenses, and party settlements."
          action={
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="accent"
                size="sm"
                icon={Plus}
                onClick={handleOpenAddIncome}
              >
                Add Income
              </Button>
              <Button
                variant="danger"
                size="sm"
                icon={Plus}
                onClick={handleOpenAddExpense}
              >
                Add Expense
              </Button>
            </div>
          }
        />
      </div>

      {/* ================= ACTION FEEDBACK BANNER ================= */}
      {feedback && (
        <div
          role="alert"
          className={`p-3.5 rounded-control text-xs font-semibold flex items-center justify-between border ${
            feedback.type === "success"
              ? "bg-success/10 text-success border-success/30"
              : "bg-danger/10 text-danger border-danger/30"
          }`}
        >
          <span>{feedback.message}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="p-1 rounded-control hover:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current ms-2"
            aria-label="Dismiss feedback message"
          >
            ✕
          </button>
        </div>
      )}

      {/* ================= 2. SUMMARY METRICS CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Inflow */}
        <Card className="p-4 rounded-card shadow-card space-y-1">
          <span className="text-xs font-semibold text-muted-foreground block">
            Total Filtered Inflow
          </span>
          <p className="text-2xl font-black text-success">
            +{formatMoney(totalFilteredIncome)}
          </p>
          <span className="text-[11px] text-muted-foreground block">
            Sales and payments received
          </span>
        </Card>

        {/* Total Outflow */}
        <Card className="p-4 rounded-card shadow-card space-y-1">
          <span className="text-xs font-semibold text-muted-foreground block">
            Total Filtered Outflow
          </span>
          <p className="text-2xl font-black text-danger">
            -{formatMoney(totalFilteredExpense)}
          </p>
          <span className="text-[11px] text-muted-foreground block">
            Expenses and payments paid
          </span>
        </Card>

        {/* Net Cashflow Position */}
        <Card className="p-4 rounded-card shadow-card space-y-1">
          <span className="text-xs font-semibold text-muted-foreground block">
            Net Cashflow Position
          </span>
          <p
            className={`text-2xl font-black ${
              netCashflow >= 0 ? "text-success" : "text-danger"
            }`}
          >
            {formatMoney(netCashflow)}
          </p>
          <span className="text-[11px] text-muted-foreground block">
            {filteredTransactions.length} records matching
          </span>
        </Card>
      </div>

      {/* ================= 3. FILTERBAR & TOOLBAR ================= */}
      <div className="space-y-3">
        <FilterBar
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search description, notes, customer name, category..."
          actions={
            isFiltered ? (
              <Button
                variant="secondary"
                size="sm"
                icon={RotateCcw}
                onClick={handleResetFilters}
              >
                Reset Filters
              </Button>
            ) : null
          }
        >
          {/* Type Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setTypeFilter("all")}
              className={`px-3 py-1.5 rounded-control text-xs font-semibold whitespace-nowrap transition ${
                typeFilter === "all"
                  ? "bg-primary text-white shadow-card"
                  : "bg-surface-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              All Types
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter("income")}
              className={`px-3 py-1.5 rounded-control text-xs font-semibold whitespace-nowrap transition ${
                typeFilter === "income"
                  ? "bg-success/20 text-success border border-success/30 font-bold"
                  : "bg-surface-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              Income (Sales)
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter("expense")}
              className={`px-3 py-1.5 rounded-control text-xs font-semibold whitespace-nowrap transition ${
                typeFilter === "expense"
                  ? "bg-danger/20 text-danger border border-danger/30 font-bold"
                  : "bg-surface-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              Expenses
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter("payment")}
              className={`px-3 py-1.5 rounded-control text-xs font-semibold whitespace-nowrap transition ${
                typeFilter === "payment"
                  ? "bg-primary/20 text-primary border border-primary/30 font-bold"
                  : "bg-surface-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              Payments
            </button>
          </div>
        </FilterBar>

        {/* Secondary Filters: Period, Customer, Category */}
        <Card className="p-3 rounded-card shadow-card">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {/* Period Selector */}
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-muted-foreground font-medium">Period:</span>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as any)}
                className="px-2.5 py-1.5 rounded-control border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-xs"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week (Last 7 Days)</option>
                <option value="month">This Month</option>
                <option value="custom">Custom Date Range</option>
              </select>
            </div>

            {/* Custom Date Inputs */}
            {dateFilter === "custom" && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-2 py-1 rounded-control border border-border bg-surface text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <span className="text-muted-foreground">to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-2 py-1 rounded-control border border-border bg-surface text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            )}

            {/* Customer Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground font-medium">Customer:</span>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="px-2.5 py-1.5 rounded-control border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary max-w-[160px] truncate text-xs"
              >
                <option value="all">All Customers</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground font-medium">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-2.5 py-1.5 rounded-control border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary max-w-[150px] truncate text-xs"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>
      </div>

      {/* ================= 4. TRANSACTIONS TABLE / STATES ================= */}
      {isLoading ? (
        <Card className="p-8 shadow-card" aria-busy="true">
          <LoadingState
            variant="skeleton"
            message="Loading transaction records..."
          />
        </Card>
      ) : loadError ? (
        <Card className="shadow-card border-danger/30 bg-danger/5">
          <ErrorState
            title="Unable to Load Transactions"
            message={loadError}
            onRetry={loadData}
          />
        </Card>
      ) : transactions.length === 0 ? (
        <Card className="shadow-card">
          <EmptyState
            title="No transactions recorded yet"
            message="All your cash sales, operating expenses, and customer khata settlements will appear here."
            action={
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button
                  variant="accent"
                  size="sm"
                  icon={Plus}
                  onClick={handleOpenAddIncome}
                >
                  Add Income
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  icon={Plus}
                  onClick={handleOpenAddExpense}
                >
                  Add Expense
                </Button>
              </div>
            }
          />
        </Card>
      ) : (
        <DataTable
          columns={columns}
          data={filteredTransactions}
          rowKey={(tx) => tx.id}
          emptyTitle="No matching transactions"
          emptyMessage="No transaction records match the selected search or filter criteria."
          emptyAction={
            isFiltered ? (
              <Button
                variant="secondary"
                size="sm"
                icon={RotateCcw}
                onClick={handleResetFilters}
              >
                Reset Filters
              </Button>
            ) : undefined
          }
        />
      )}

      {/* ================= 5. REUSABLE TRANSACTION FORMS (PRESERVED & WIRED FOR EDITING) ================= */}
      {editingTransaction && (editingTransaction.sourceTable === "income" || (editingTransaction.sourceTable === "ledger_transactions" && editingTransaction.type === "payment_received")) && (
        <AddIncomeForm
          key={`edit-income-${editingTransaction.id}`}
          isOpen={true}
          onClose={() => setEditingTransaction(null)}
          onCancel={() => setEditingTransaction(null)}
          onSuccess={async () => {
            setEditingTransaction(null);
            await loadData();
          }}
          customers={customers}
          initialAmount={editingTransaction.amount}
          initialCategory={editingTransaction.category}
          initialDescription={editingTransaction.description}
          initialDate={editingTransaction.date ? editingTransaction.date.split("T")[0] : undefined}
          paymentMethod={editingTransaction.paymentMethod || "cash"}
          customerId={editingTransaction.customerId || undefined}
          onSubmitCustom={handleEditSubmit}
        />
      )}

      {editingTransaction && (editingTransaction.sourceTable === "expenses" || (editingTransaction.sourceTable === "ledger_transactions" && editingTransaction.type === "payment_sent")) && (
        <AddExpenseForm
          key={`edit-expense-${editingTransaction.id}`}
          isOpen={true}
          onClose={() => setEditingTransaction(null)}
          onCancel={() => setEditingTransaction(null)}
          onSuccess={async () => {
            setEditingTransaction(null);
            await loadData();
          }}
          customers={customers}
          initialAmount={editingTransaction.amount}
          initialCategory={editingTransaction.category}
          initialDescription={editingTransaction.description}
          initialDate={editingTransaction.date ? editingTransaction.date.split("T")[0] : undefined}
          paymentMethod={editingTransaction.paymentMethod || "cash"}
          customerId={editingTransaction.customerId || undefined}
          onSubmitCustom={handleEditSubmit}
        />
      )}

      {/* ================= 6. DANISH'S ADD TRANSACTION DIALOG (MERGED COMPONENT) ================= */}
      <AddTransactionDialog
        open={isTransactionDialogOpen}
        onOpenChange={setIsTransactionDialogOpen}
        type={transactionDialogType}
        customerId={selectedCustomerId !== "all" ? selectedCustomerId : undefined}
        onSuccess={handleTransactionSuccess}
      />

      {/* ================= 7. CONFIRM DELETE DIALOG (SHARED DESIGN-SYSTEM COMPONENT) ================= */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction record? This action will permanently remove it from the ledger."
        isLoading={isDeleting}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}
