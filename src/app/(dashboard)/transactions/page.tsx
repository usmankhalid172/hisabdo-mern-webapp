"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Trash2,
  Edit2,
  ArrowDownLeft,
  ArrowUpRight,
  RotateCcw,
  Calendar,
  X,
  CheckCircle2,
  AlertCircle,
  Filter,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { FilterBar } from "@/components/ui/FilterBar";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { Card } from "@/components/ui/design-system/Card";
import { PageHeading } from "@/components/ui/design-system/PageHeading";
import { LoadingState } from "@/components/ui/design-system/LoadingState";
import { EmptyState } from "@/components/ui/design-system/EmptyState";
import { ErrorState } from "@/components/ui/design-system/ErrorState";
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

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense" | "payment">("all");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "month" | "custom">("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Create Transaction Modals
  const [createModalType, setCreateModalType] = useState<"income" | "expense" | null>(null);

  // Edit Transaction Modal
  const [editingTx, setEditingTx] = useState<UnifiedTransaction | null>(null);

  // Delete Confirmation
  const [txToDelete, setTxToDelete] = useState<UnifiedTransaction | null>(null);
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

  // Load Transactions & Customers
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      const userId = user?.id || "guest";
      const [custs, incs, exps, pmts] = await Promise.all([
        hisabDoService.getCustomers(userId),
        hisabDoService.getIncomes(userId),
        hisabDoService.getExpenses(userId),
        hisabDoService.getLedgerTransactions(userId),
      ]);

      setCustomers(custs);

      const combined: UnifiedTransaction[] = [];

      incs.forEach((i) => {
        const c = custs.find((c) => c.id === i.customer_id);
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

      exps.forEach((e) => {
        const c = custs.find((c) => c.id === e.customer_id);
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

      pmts.forEach((p) => {
        const c = custs.find((c) => c.id === p.customerId);
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
      setLoadError(err?.message || "Failed to load transaction ledger records.");
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

  // Handle Delete Confirmation
  const handleConfirmDelete = async () => {
    if (!txToDelete) return;
    if (isDeleting) return; // Prevent duplicate clicks

    try {
      setIsDeleting(true);
      const userId = user?.id || "guest";
      if (txToDelete.sourceTable === "income") {
        await hisabDoService.deleteIncome(userId, txToDelete.id);
      } else if (txToDelete.sourceTable === "expenses") {
        await hisabDoService.deleteExpense(userId, txToDelete.id);
      } else if (txToDelete.sourceTable === "ledger_transactions") {
        await hisabDoService.deleteLedgerTransaction(userId, txToDelete.id);
      }

      setFeedback({
        type: "success",
        message: `${
          txToDelete.type === "income"
            ? "Income"
            : txToDelete.type === "expense"
            ? "Expense"
            : "Payment"
        } transaction deleted successfully.`,
      });
      setTxToDelete(null);
      await loadData();
    } catch (err: any) {
      console.error("Failed to delete transaction:", err);
      setFeedback({
        type: "error",
        message: err?.message || "Failed to delete transaction. Please try again.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle Edit Submission
  const handleUpdate = async (
    tx: UnifiedTransaction,
    payload: {
      amount: number;
      customerId: string | null;
      category: string;
      description: string;
      date: string;
      paymentMethod: string;
    }
  ) => {
    try {
      const userId = user?.id || "guest";
      if (tx.sourceTable === "income") {
        await hisabDoService.updateIncome(userId, tx.id, {
          amount: payload.amount,
          customer_id: payload.customerId,
          description: payload.description,
          category_id: payload.category,
          payment_method: payload.paymentMethod,
          income_date: payload.date,
        });
      } else if (tx.sourceTable === "expenses") {
        await hisabDoService.updateExpense(userId, tx.id, {
          amount: payload.amount,
          customer_id: payload.customerId,
          description: payload.description,
          category_id: payload.category,
          payment_method: payload.paymentMethod,
          expense_date: payload.date,
        });
      } else if (tx.sourceTable === "ledger_transactions") {
        await hisabDoService.updateLedgerTransaction(userId, tx.id, {
          amount: payload.amount,
          customerId: payload.customerId || tx.customerId || "",
          note: payload.description,
          category: payload.category,
          date: payload.date,
        });
      }

      setFeedback({
        type: "success",
        message: "Transaction updated successfully.",
      });
      setEditingTx(null);
      await loadData();
    } catch (err: any) {
      console.error("Failed to update transaction:", err);
      setFeedback({
        type: "error",
        message: err?.message || "Failed to update transaction. Please try again.",
      });
    }
  };

  // Unique categories for filter dropdown
  const categories = useMemo(() => {
    return Array.from(new Set(transactions.map((t) => t.category))).filter(Boolean);
  }, [transactions]);

  // Combined Filter and Search Logic
  const filteredTransactions = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return transactions.filter((tx) => {
      // 1. Search filter: description, category, and customer name
      if (search) {
        const descMatch = tx.description ? tx.description.toLowerCase().includes(search) : false;
        const catMatch = tx.category ? tx.category.toLowerCase().includes(search) : false;
        const custMatch = tx.customerName ? tx.customerName.toLowerCase().includes(search) : false;

        if (!descMatch && !catMatch && !custMatch) {
          return false;
        }
      }

      // 2. Type filter
      if (typeFilter === "income" && tx.type !== "income") return false;
      if (typeFilter === "expense" && tx.type !== "expense") return false;
      if (typeFilter === "payment" && tx.type !== "payment_received" && tx.type !== "payment_sent") return false;

      // 3. Customer filter
      if (selectedCustomerId !== "all" && tx.customerId !== selectedCustomerId) return false;

      // 4. Category filter
      if (selectedCategory !== "all" && tx.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }

      // 5. Date filter
      const txDate = new Date(tx.date);
      const now = new Date();

      if (dateFilter === "today") {
        const isToday =
          txDate.getDate() === now.getDate() &&
          txDate.getMonth() === now.getMonth() &&
          txDate.getFullYear() === now.getFullYear();
        if (!isToday) return false;
      } else if (dateFilter === "week") {
        const txTime = new Date(tx.date).getTime();
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);
        oneWeekAgo.setHours(0, 0, 0, 0);
        if (txTime < oneWeekAgo.getTime()) return false;
      } else if (dateFilter === "month") {
        const isCurrentMonth =
          txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
        if (!isCurrentMonth) return false;
      } else if (dateFilter === "custom") {
        if (startDate) {
          const start = new Date(startDate + "T00:00:00");
          if (txDate < start) return false;
        }
        if (endDate) {
          const end = new Date(endDate + "T23:59:59.999");
          if (txDate > end) return false;
        }
      }

      return true;
    });
  }, [
    transactions,
    searchTerm,
    typeFilter,
    selectedCustomerId,
    selectedCategory,
    dateFilter,
    startDate,
    endDate,
  ]);

  // Check if any filter is actively applied
  const isFiltered =
    Boolean(searchTerm.trim()) ||
    typeFilter !== "all" ||
    dateFilter !== "all" ||
    selectedCategory !== "all" ||
    selectedCustomerId !== "all" ||
    Boolean(startDate) ||
    Boolean(endDate);

  const resetFilters = () => {
    setSearchTerm("");
    setTypeFilter("all");
    setDateFilter("all");
    setStartDate("");
    setEndDate("");
    setSelectedCategory("all");
    setSelectedCustomerId("all");
  };

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

  return (
    <div className="space-y-6">
      {/* Top Page Heading with Design System Actions */}
      <PageHeading
        title={t("transactions") || "Transactions"}
        description="Unified chronological ledger of all cashflow, sales, expenses, and customer settlements"
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="accent"
              size="sm"
              icon={Plus}
              onClick={() => setCreateModalType("income")}
            >
              Add Income
            </Button>
            <Button
              variant="danger"
              size="sm"
              icon={Plus}
              onClick={() => setCreateModalType("expense")}
            >
              Add Expense
            </Button>
          </div>
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

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <span className="text-xs font-semibold text-muted-foreground block mb-1">
            Total Filtered Inflow
          </span>
          <p className="text-2xl font-black text-success">
            +{formatMoney(totalFilteredIncome)}
          </p>
          <span className="text-[11px] text-muted-foreground">
            Sales & payments received
          </span>
        </Card>

        <Card className="p-4">
          <span className="text-xs font-semibold text-muted-foreground block mb-1">
            Total Filtered Outflow
          </span>
          <p className="text-2xl font-black text-danger">
            -{formatMoney(totalFilteredExpense)}
          </p>
          <span className="text-[11px] text-muted-foreground">
            Expenses & payments paid
          </span>
        </Card>

        <Card className="p-4">
          <span className="text-xs font-semibold text-muted-foreground block mb-1">
            Net Cashflow Position
          </span>
          <p
            className={`text-2xl font-black ${
              totalFilteredIncome - totalFilteredExpense >= 0
                ? "text-success"
                : "text-danger"
            }`}
          >
            {formatMoney(totalFilteredIncome - totalFilteredExpense)}
          </p>
          <span className="text-[11px] text-muted-foreground">
            {filteredTransactions.length} records matching
          </span>
        </Card>
      </div>

      {/* Filters Toolbar */}
      <Card className="p-4 space-y-3">
        {/* Search & Type Filter Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Working Search Bar */}
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder="Search description, category, customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search transactions"
              className="w-full rounded-control border border-border bg-surface-muted ps-9 pe-4 py-2 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Type Toggle Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            <button
              type="button"
              onClick={() => setTypeFilter("all")}
              className={`px-3 py-1.5 rounded-control text-xs font-semibold whitespace-nowrap transition-colors ${
                typeFilter === "all"
                  ? "bg-primary text-white shadow-card"
                  : "text-muted-foreground hover:bg-surface-muted hover:text-foreground"
              }`}
            >
              All Types
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter("income")}
              className={`px-3 py-1.5 rounded-control text-xs font-semibold whitespace-nowrap transition-colors ${
                typeFilter === "income"
                  ? "bg-success/20 text-success border border-success/40"
                  : "text-muted-foreground hover:bg-surface-muted hover:text-foreground"
              }`}
            >
              Income
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter("expense")}
              className={`px-3 py-1.5 rounded-control text-xs font-semibold whitespace-nowrap transition-colors ${
                typeFilter === "expense"
                  ? "bg-danger/20 text-danger border border-danger/40"
                  : "text-muted-foreground hover:bg-surface-muted hover:text-foreground"
              }`}
            >
              Expenses
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter("payment")}
              className={`px-3 py-1.5 rounded-control text-xs font-semibold whitespace-nowrap transition-colors ${
                typeFilter === "payment"
                  ? "bg-info/20 text-info border border-info/40"
                  : "text-muted-foreground hover:bg-surface-muted hover:text-foreground"
              }`}
            >
              Payments
            </button>
          </div>
        </div>

        {/* Secondary Filter Controls: Date Range, Customer, Category */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-border text-xs">
          {/* Period Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground font-medium">Period:</span>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              aria-label="Filter by time period"
              className="rounded-control border border-border bg-surface-muted ps-2.5 pe-8 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
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
            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                aria-label="Start date"
                className="rounded-control border border-border bg-surface-muted ps-2 pe-2 py-1 text-xs text-foreground focus:border-primary focus:outline-none"
              />
              <span className="text-muted-foreground">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                aria-label="End date"
                className="rounded-control border border-border bg-surface-muted ps-2 pe-2 py-1 text-xs text-foreground focus:border-primary focus:outline-none"
              />
            </div>
          )}

          {/* Customer Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground font-medium">Customer:</span>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              aria-label="Filter by customer"
              className="rounded-control border border-border bg-surface-muted ps-2.5 pe-8 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary max-w-[160px] truncate"
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
              aria-label="Filter by category"
              className="rounded-control border border-border bg-surface-muted ps-2.5 pe-8 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary max-w-[150px] truncate"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters Action */}
          {isFiltered && (
            <div className="ms-auto">
              <Button
                variant="secondary"
                size="sm"
                icon={RotateCcw}
                onClick={resetFilters}
                className="text-xs py-1"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Transaction History Table Card */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <LoadingState variant="skeleton" message="Loading transaction ledger..." />
        ) : loadError ? (
          <ErrorState
            title="Unable to Load Transactions"
            message={loadError}
            onRetry={loadData}
          />
        ) : filteredTransactions.length === 0 ? (
          <EmptyState
            title={isFiltered ? "No matching transactions" : "No transactions found"}
            message={
              isFiltered
                ? "No transactions match your current search and filter criteria. Try adjusting or clearing your filters."
                : "No transactions recorded yet. Record your business income or operational expenses to start tracking cashflow."
            }
            action={
              isFiltered ? (
                <Button variant="secondary" size="sm" onClick={resetFilters}>
                  Clear Filters
                </Button>
              ) : (
                <div className="flex items-center gap-2 mt-2">
                  <Button
                    variant="accent"
                    size="sm"
                    icon={Plus}
                    onClick={() => setCreateModalType("income")}
                  >
                    Add Income
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    icon={Plus}
                    onClick={() => setCreateModalType("expense")}
                  >
                    Add Expense
                  </Button>
                </div>
              )
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse text-sm">
              <thead className="border-b border-border bg-surface-muted text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <tr>
                  {/* Reserved column space for future checkbox (space & structure reserved, no actual checkbox) */}
                  <th scope="col" className="w-10 px-3 py-3.5 text-center" aria-hidden="true" />
                  <th scope="col" className="px-4 py-3.5 text-start">Date</th>
                  <th scope="col" className="px-4 py-3.5 text-start">Type</th>
                  <th scope="col" className="px-4 py-3.5 text-start">Customer / Party</th>
                  <th scope="col" className="px-4 py-3.5 text-start">Description</th>
                  <th scope="col" className="px-4 py-3.5 text-start">Category</th>
                  <th scope="col" className="px-4 py-3.5 text-end">Amount</th>
                  <th scope="col" className="px-4 py-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTransactions.map((tx) => {
                  const isPositive = tx.type === "income" || tx.type === "payment_received";
                  return (
                    <tr
                      key={`${tx.sourceTable}-${tx.id}`}
                      className="transition-colors hover:bg-surface-muted/50"
                    >
                      {/* Reserved column space for future checkbox */}
                      <td className="w-10 px-3 py-3.5 text-center" aria-hidden="true" />

                      <td className="px-4 py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(tx.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {tx.type === "income" ? (
                          <Badge variant="green" className="gap-1">
                            <ArrowDownLeft className="w-3 h-3 text-success" />
                            <span>Income</span>
                          </Badge>
                        ) : tx.type === "expense" ? (
                          <Badge variant="red" className="gap-1">
                            <ArrowUpRight className="w-3 h-3 text-danger" />
                            <span>Expense</span>
                          </Badge>
                        ) : tx.type === "payment_received" ? (
                          <Badge variant="blue" className="gap-1">
                            <ArrowDownLeft className="w-3 h-3 text-info" />
                            <span>Payment In</span>
                          </Badge>
                        ) : (
                          <Badge variant="amber" className="gap-1">
                            <ArrowUpRight className="w-3 h-3 text-warning" />
                            <span>Payment Out</span>
                          </Badge>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-xs font-medium whitespace-nowrap">
                        {tx.customerId ? (
                          <Link
                            href={`/customers/${tx.customerId}`}
                            className="text-primary hover:underline font-semibold"
                          >
                            {tx.customerName}
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">{tx.customerName}</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-xs text-foreground font-medium max-w-xs truncate">
                        {tx.description}
                      </td>

                      <td className="px-4 py-3.5 text-xs whitespace-nowrap">
                        <Badge variant="slate">{tx.category}</Badge>
                      </td>

                      <td
                        className={`px-4 py-3.5 text-end font-bold text-sm whitespace-nowrap ${
                          isPositive ? "text-success" : "text-danger"
                        }`}
                      >
                        {isPositive ? "+" : "-"}
                        {formatMoney(tx.amount)}
                      </td>

                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1 justify-center">
                          <button
                            type="button"
                            onClick={() => setEditingTx(tx)}
                            title="Edit transaction"
                            className="p-1.5 rounded-control text-muted-foreground hover:text-primary hover:bg-surface-muted transition"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span className="sr-only">Edit transaction</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setTxToDelete(tx)}
                            title="Delete transaction"
                            className="p-1.5 rounded-control text-muted-foreground hover:text-danger hover:bg-surface-muted transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="sr-only">Delete transaction</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Modal using ConfirmDialog */}
      {txToDelete && (
        <ConfirmDialog
          isOpen={Boolean(txToDelete)}
          onClose={() => setTxToDelete(null)}
          onConfirm={handleConfirmDelete}
          isLoading={isDeleting}
          title="Delete Transaction Record"
          message={`Are you sure you want to delete this ${
            txToDelete.type === "income"
              ? "income"
              : txToDelete.type === "expense"
              ? "expense"
              : "payment"
          } transaction of ${currencySymbol}${txToDelete.amount}? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
        />
      )}

      {/* ================= REUSABLE TRANSACTION FORMS ================= */}
      {/* Create Forms */}
      <AddIncomeForm
        isOpen={createModalType === "income"}
        onClose={() => setCreateModalType(null)}
        onSuccess={() => {
          setCreateModalType(null);
          setFeedback({
            type: "success",
            message: "Income transaction recorded successfully.",
          });
          loadData();
        }}
        customers={customers}
      />

      <AddExpenseForm
        isOpen={createModalType === "expense"}
        onClose={() => setCreateModalType(null)}
        onSuccess={() => {
          setCreateModalType(null);
          setFeedback({
            type: "success",
            message: "Expense transaction recorded successfully.",
          });
          loadData();
        }}
        customers={customers}
      />

      {/* Edit Form for Income / Payment In */}
      {editingTx &&
        (editingTx.sourceTable === "income" ||
          editingTx.type === "income" ||
          editingTx.type === "payment_received") && (
          <AddIncomeForm
            isOpen={Boolean(editingTx)}
            onClose={() => setEditingTx(null)}
            onSuccess={() => {
              setEditingTx(null);
              loadData();
            }}
            customers={customers}
            initialAmount={editingTx.amount}
            initialCategory={editingTx.category}
            initialDescription={editingTx.description}
            initialDate={editingTx.date ? editingTx.date.split("T")[0] : undefined}
            customerId={editingTx.customerId || undefined}
            paymentMethod={editingTx.paymentMethod}
            onSubmitCustom={(payload) => handleUpdate(editingTx, payload)}
          />
        )}

      {/* Edit Form for Expense / Payment Out */}
      {editingTx &&
        (editingTx.sourceTable === "expenses" ||
          editingTx.type === "expense" ||
          editingTx.type === "payment_sent") && (
          <AddExpenseForm
            isOpen={Boolean(editingTx)}
            onClose={() => setEditingTx(null)}
            onSuccess={() => {
              setEditingTx(null);
              loadData();
            }}
            customers={customers}
            initialAmount={editingTx.amount}
            initialCategory={editingTx.category}
            initialDescription={editingTx.description}
            initialDate={editingTx.date ? editingTx.date.split("T")[0] : undefined}
            customerId={editingTx.customerId || undefined}
            paymentMethod={editingTx.paymentMethod}
            onSubmitCustom={(payload) => handleUpdate(editingTx, payload)}
          />
        )}
    </div>
  );
}
