"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowRightLeft,
  Search,
  Plus,
  Filter,
  Calendar,
  Trash2,
  Edit2,
  TrendingDown,
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  Loader2,
  X,
  CreditCard,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import {
  hisabDoService,
  Customer,
  Income,
  Expense,
  LedgerTransaction,
} from "@/services/hisabdoService";

interface UnifiedTransaction {
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
  const { formatMoney, currencySymbol, theme, t } = useSettings();

  const [transactions, setTransactions] = useState<UnifiedTransaction[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense" | "payment">("all");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "month" | "custom">("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // New Transaction Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"income" | "expense">("income");
  const [formData, setFormData] = useState({
    amount: "",
    customerId: "",
    description: "",
    category: "General",
    paymentMethod: "cash",
    date: new Date().toISOString().split("T")[0],
  });
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
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
    } catch (err) {
      console.error("Error loading transactions:", err);
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

  // Handle Create Transaction
  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount) return;
    setSubmitting(true);
    const userId = user?.id || "guest";
    try {
      if (modalType === "income") {
        await hisabDoService.addIncome(userId, {
          amount: Number(formData.amount),
          customer_id: formData.customerId || null,
          description: formData.description,
          category_id: formData.category,
          payment_method: formData.paymentMethod,
          income_date: formData.date,
        });
      } else {
        await hisabDoService.addExpense(userId, {
          amount: Number(formData.amount),
          customer_id: formData.customerId || null,
          description: formData.description,
          category_id: formData.category,
          payment_method: formData.paymentMethod,
          expense_date: formData.date,
        });
      }

      setIsModalOpen(false);
      setFormData({
        amount: "",
        customerId: "",
        description: "",
        category: "General",
        paymentMethod: "cash",
        date: new Date().toISOString().split("T")[0],
      });
      await loadData();
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete
  const handleDelete = async (tx: UnifiedTransaction) => {
    if (!confirm("Are you sure you want to delete this transaction record?")) return;
    const userId = user?.id || "guest";
    if (tx.sourceTable === "income") {
      await hisabDoService.deleteIncome(userId, tx.id);
    } else if (tx.sourceTable === "expenses") {
      await hisabDoService.deleteExpense(userId, tx.id);
    } else if (tx.sourceTable === "ledger_transactions") {
      await hisabDoService.deleteLedgerTransaction(userId, tx.id);
    }
    await loadData();
  };

  // Filter Logic
  const filteredTransactions = transactions.filter((tx) => {
    // Search
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      tx.description.toLowerCase().includes(search) ||
      (tx.customerName && tx.customerName.toLowerCase().includes(search)) ||
      tx.category.toLowerCase().includes(search);

    if (!matchesSearch) return false;

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

  // Unique categories for filter dropdown
  const categories = Array.from(new Set(transactions.map((t) => t.category))).filter(Boolean);

  // Totals for filtered transactions
  const totalFilteredIncome = filteredTransactions
    .filter((t) => t.type === "income" || t.type === "payment_received")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalFilteredExpense = filteredTransactions
    .filter((t) => t.type === "expense" || t.type === "payment_sent")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {t("transactions")}
          </h1>
          <p className="text-sm text-slate-400">
            Unified chronological ledger of all cashflow, sales, expenses, and party settlements
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setModalType("income");
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-[#00E676] hover:bg-[#00C853] text-[#0B0F17] font-bold text-xs rounded-xl shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Income</span>
          </button>

          <button
            onClick={() => {
              setModalType("expense");
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-[#E53935] hover:bg-rose-600 text-white font-bold text-xs rounded-xl shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Expense</span>
          </button>
        </div>
      </div>

      {/* Summary Filter Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`p-4 rounded-2xl border ${theme === "dark" ? "bg-[#1E1E1E] border-[#2E2E2E]" : "bg-white border-slate-200 shadow-sm"}`}>
          <span className="text-xs font-semibold text-slate-400 block mb-1">Total Filtered Inflow</span>
          <p className="text-2xl font-black text-[#00E676]">+{formatMoney(totalFilteredIncome)}</p>
          <span className="text-[11px] text-slate-400">Sales and payments received</span>
        </div>

        <div className={`p-4 rounded-2xl border ${theme === "dark" ? "bg-[#1E1E1E] border-[#2E2E2E]" : "bg-white border-slate-200 shadow-sm"}`}>
          <span className="text-xs font-semibold text-slate-400 block mb-1">Total Filtered Outflow</span>
          <p className="text-2xl font-black text-[#E53935]">-{formatMoney(totalFilteredExpense)}</p>
          <span className="text-[11px] text-slate-400">Expenses and payments paid</span>
        </div>

        <div className={`p-4 rounded-2xl border ${theme === "dark" ? "bg-[#1E1E1E] border-[#2E2E2E]" : "bg-white border-slate-200 shadow-sm"}`}>
          <span className="text-xs font-semibold text-slate-400 block mb-1">Net Cashflow Position</span>
          <p className={`text-2xl font-black ${
            totalFilteredIncome - totalFilteredExpense >= 0 ? "text-[#00E676]" : "text-[#E53935]"
          }`}>
            {formatMoney(totalFilteredIncome - totalFilteredExpense)}
          </p>
          <span className="text-[11px] text-slate-400">{filteredTransactions.length} records matching</span>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className={`p-4 rounded-2xl border space-y-3 ${
        theme === "dark" ? "bg-[#1E1E1E] border-[#2E2E2E]" : "bg-white border-slate-200 shadow-sm"
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search description, notes, customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                theme === "dark" ? "bg-[#252525] border-[#353535] text-white" : "bg-slate-50 border-slate-200"
              }`}
            />
          </div>

          {/* Type Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setTypeFilter("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                typeFilter === "all"
                  ? "bg-[#1A237E] text-white"
                  : theme === "dark"
                  ? "text-slate-400 hover:bg-[#252525]"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setTypeFilter("income")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                typeFilter === "income"
                  ? "bg-emerald-500/20 text-[#00E676] border border-emerald-500/30"
                  : theme === "dark"
                  ? "text-slate-400 hover:bg-[#252525]"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Income (Sales)
            </button>
            <button
              onClick={() => setTypeFilter("expense")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                typeFilter === "expense"
                  ? "bg-rose-500/20 text-[#E53935] border border-rose-500/30"
                  : theme === "dark"
                  ? "text-slate-400 hover:bg-[#252525]"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Expenses
            </button>
            <button
              onClick={() => setTypeFilter("payment")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                typeFilter === "payment"
                  ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                  : theme === "dark"
                  ? "text-slate-400 hover:bg-[#252525]"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Payments
            </button>
          </div>
        </div>

        {/* Secondary Filters: Date Range, Customer, Category */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800/40 text-xs">
          {/* Date Range Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Period:</span>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className={`px-2.5 py-1.5 rounded-xl border focus:outline-none ${
                theme === "dark" ? "bg-[#252525] border-[#353535] text-white" : "bg-slate-50 border-slate-200"
              }`}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week (Last 7 Days)</option>
              <option value="month">This Month</option>
              <option value="custom">Custom Date Range</option>
            </select>
          </div>

          {dateFilter === "custom" && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={`px-2 py-1 rounded-xl border text-xs ${
                  theme === "dark" ? "bg-[#252525] border-[#353535]" : "bg-white border-slate-200"
                }`}
              />
              <span className="text-slate-400">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={`px-2 py-1 rounded-xl border text-xs ${
                  theme === "dark" ? "bg-[#252525] border-[#353535]" : "bg-white border-slate-200"
                }`}
              />
            </div>
          )}

          {/* Customer filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Customer:</span>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className={`px-2.5 py-1.5 rounded-xl border focus:outline-none max-w-[160px] truncate ${
                theme === "dark" ? "bg-[#252525] border-[#353535] text-white" : "bg-slate-50 border-slate-200"
              }`}
            >
              <option value="all">All Customers</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`px-2.5 py-1.5 rounded-xl border focus:outline-none max-w-[150px] truncate ${
                theme === "dark" ? "bg-[#252525] border-[#353535] text-white" : "bg-slate-50 border-slate-200"
              }`}
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
      </div>

      {/* Transactions Table */}
      <div className={`rounded-2xl border overflow-hidden ${
        theme === "dark" ? "bg-[#1E1E1E] border-[#2E2E2E]" : "bg-white border-slate-200 shadow-sm"
      }`}>
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#00E676] animate-spin" />
            <p className="text-xs text-slate-400">Loading transactions...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            <ArrowRightLeft className="w-10 h-10 text-slate-500 mx-auto mb-2" />
            <p>No transactions found matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className={`text-xs uppercase border-b ${
                theme === "dark" ? "bg-[#181818] border-slate-800 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-500"
              }`}>
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Customer / Party</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${theme === "dark" ? "divide-slate-800/60" : "divide-slate-100"}`}>
                {filteredTransactions.map((tx) => {
                  const isPositive = tx.type === "income" || tx.type === "payment_received";
                  return (
                    <tr
                      key={tx.id}
                      className={`transition-colors ${
                        theme === "dark" ? "hover:bg-slate-800/30" : "hover:bg-slate-50"
                      }`}
                    >
                      <td className="py-3 px-4 text-xs text-slate-400 whitespace-nowrap">
                        {new Date(tx.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          tx.type === "income"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : tx.type === "expense"
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            : tx.type === "payment_received"
                            ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}>
                          {tx.type === "income" && <ArrowDownLeft className="w-3 h-3 text-[#00E676]" />}
                          {tx.type === "expense" && <ArrowUpRight className="w-3 h-3 text-[#E53935]" />}
                          {tx.type === "payment_received" && <ArrowDownLeft className="w-3 h-3 text-indigo-400" />}
                          {tx.type === "payment_sent" && <ArrowUpRight className="w-3 h-3 text-amber-400" />}
                          {tx.type === "income" && "Income"}
                          {tx.type === "expense" && "Expense"}
                          {tx.type === "payment_received" && "Payment In"}
                          {tx.type === "payment_sent" && "Payment Out"}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-xs font-semibold whitespace-nowrap">
                        {tx.customerId ? (
                          <Link href={`/customers/${tx.customerId}`} className="hover:underline text-indigo-400">
                            {tx.customerName}
                          </Link>
                        ) : (
                          <span className="text-slate-400">{tx.customerName}</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-xs text-slate-300 max-w-xs truncate">
                        {tx.description}
                      </td>

                      <td className="py-3 px-4 text-xs text-slate-400 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-slate-800/40 border border-slate-700/50">
                          {tx.category}
                        </span>
                      </td>

                      <td className={`py-3 px-4 text-right font-black text-sm whitespace-nowrap ${
                        isPositive ? "text-[#00E676]" : "text-[#E53935]"
                      }`}>
                        {isPositive ? "+" : "-"}{formatMoney(tx.amount)}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleDelete(tx)}
                          title="Delete entry"
                          className="p-1 text-slate-500 hover:text-rose-400 rounded transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================= ADD TRANSACTION MODAL ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-2xl border p-6 space-y-4 shadow-2xl ${
            theme === "dark" ? "bg-[#1E1E1E] border-[#303030]" : "bg-white border-slate-200"
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">
                  {modalType === "income" ? "+ Add Income Entry" : "+ Add Expense Entry"}
                </h3>
                <p className="text-xs text-slate-400">Record a new accounting transaction</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Amount ({currencySymbol}) *</label>
                <input
                  type="number"
                  required
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className={`w-full px-3 py-2 text-lg font-bold rounded-xl border bg-transparent focus:outline-none focus:ring-1 ${
                    modalType === "income" ? "focus:ring-emerald-500" : "focus:ring-rose-500"
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Associated Customer / Party</label>
                <select
                  value={formData.customerId}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl text-sm border focus:outline-none ${
                    theme === "dark" ? "bg-[#252525] border-slate-700" : "bg-white border-slate-200"
                  }`}
                >
                  <option value="">Direct / Walk-in (No Party)</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Category</label>
                <input
                  type="text"
                  placeholder={modalType === "income" ? "e.g. Sales, Service Fee" : "e.g. Rent, Utilities"}
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-sm border bg-transparent focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Description / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Sold accessories, paid bill"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-sm border bg-transparent focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-sm border bg-transparent focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 rounded-xl text-sm font-semibold border hover:bg-slate-800/40"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`flex-1 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 ${
                    modalType === "income"
                      ? "bg-[#00E676] text-black hover:bg-[#00C853]"
                      : "bg-[#E53935] text-white hover:bg-rose-600"
                  }`}
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
