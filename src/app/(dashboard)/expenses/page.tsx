"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Receipt,
  Plus,
  Trash2,
  Calendar,
  Search,
  Filter,
  Loader2,
  DollarSign,
  TrendingUp,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import { hisabDoService, Expense } from "@/services/hisabdoService";

export default function ExpensesPage() {
  const { user } = useAuth();
  const { formatMoney, currencySymbol, theme, t } = useSettings();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    category: "General",
    description: "",
    payment_method: "cash",
    expense_date: new Date().toISOString().split("T")[0],
  });
  const [submitting, setSubmitting] = useState(false);

  const loadExpenses = useCallback(async () => {
    try {
      setIsLoading(true);
      const userId = user?.id || "guest";
      const data = await hisabDoService.getExpenses(userId);
      setExpenses(data);
    } catch (e) {
      console.error("Error loading expenses:", e);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount) return;
    setSubmitting(true);
    const userId = user?.id || "guest";
    try {
      await hisabDoService.addExpense(userId, {
        amount: Number(formData.amount),
        category_id: formData.category,
        description: formData.description,
        payment_method: formData.payment_method,
        expense_date: formData.expense_date,
      });
      setIsModalOpen(false);
      setFormData({
        amount: "",
        category: "General",
        description: "",
        payment_method: "cash",
        expense_date: new Date().toISOString().split("T")[0],
      });
      await loadExpenses();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this expense entry?")) {
      await hisabDoService.deleteExpense(user?.id || "guest", id);
      await loadExpenses();
    }
  };

  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch =
      e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.category_id && e.category_id.toLowerCase().includes(searchTerm.toLowerCase()));
    if (selectedCategory !== "all" && e.category_id !== selectedCategory) return false;
    return matchesSearch;
  });

  const totalExpenseAmount = filteredExpenses.reduce((sum, item) => sum + Number(item.amount), 0);
  const categories = Array.from(new Set(expenses.map((e) => e.category_id || "General"))).filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {t("expenses")}
          </h1>
          <p className="text-sm text-slate-400">
            Track daily operating business expenses, utility bills, and staff salaries
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#E53935] hover:bg-rose-600 text-white font-bold text-xs rounded-xl shadow-md transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ {t("addExpense")}</span>
        </button>
      </div>

      {/* Summary KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className={`p-5 rounded-2xl border ${theme === "dark" ? "bg-[#1E1E1E] border-[#2E2E2E]" : "bg-white border-slate-200 shadow-sm"}`}>
          <span className="text-xs font-semibold text-slate-400 block mb-1">Total Operating Expenses</span>
          <p className="text-3xl font-black text-[#E53935]">-{formatMoney(totalExpenseAmount)}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">{filteredExpenses.length} entries recorded</span>
        </div>

        <div className={`p-5 rounded-2xl border ${theme === "dark" ? "bg-[#1E1E1E] border-[#2E2E2E]" : "bg-white border-slate-200 shadow-sm"}`}>
          <span className="text-xs font-semibold text-slate-400 block mb-1">Active Expense Categories</span>
          <p className="text-3xl font-black text-indigo-400">{categories.length}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Rent, Utilities, Staff, Supplies</span>
        </div>
      </div>

      {/* Search & Filter */}
      <div className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-3 ${
        theme === "dark" ? "bg-[#1E1E1E] border-[#2E2E2E]" : "bg-white border-slate-200 shadow-sm"
      }`}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search expense description or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-rose-500 ${
              theme === "dark" ? "bg-[#252525] border-[#353535] text-white" : "bg-slate-50 border-slate-200"
            }`}
          />
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-400 font-medium">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={`px-3 py-1.5 rounded-xl text-xs border focus:outline-none ${
              theme === "dark" ? "bg-[#252525] border-[#353535] text-white" : "bg-slate-50 border-slate-200"
            }`}
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

      {/* Expenses Table */}
      <div className={`rounded-2xl border overflow-hidden ${
        theme === "dark" ? "bg-[#1E1E1E] border-[#2E2E2E]" : "bg-white border-slate-200 shadow-sm"
      }`}>
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
            <p className="text-xs text-slate-400">Loading expenses...</p>
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            <Receipt className="w-10 h-10 text-slate-500 mx-auto mb-2" />
            <p>No expenses recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className={`text-xs uppercase border-b ${
                theme === "dark" ? "bg-[#181818] border-slate-800 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-500"
              }`}>
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${theme === "dark" ? "divide-slate-800/60" : "divide-slate-100"}`}>
                {filteredExpenses.map((exp) => (
                  <tr
                    key={exp.id}
                    className={`transition-colors ${
                      theme === "dark" ? "hover:bg-slate-800/30" : "hover:bg-slate-50"
                    }`}
                  >
                    <td className="py-3 px-4 text-xs text-slate-400 whitespace-nowrap">
                      {new Date(exp.expense_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        {exp.category_id || "General"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-300 max-w-sm truncate">
                      {exp.description}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-400 capitalize whitespace-nowrap">
                      {exp.payment_method?.replace("_", " ")}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-sm text-[#E53935] whitespace-nowrap">
                      -{formatMoney(exp.amount)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => handleDelete(exp.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 rounded transition"
                        title="Delete expense"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-2xl border p-6 space-y-4 shadow-2xl ${
            theme === "dark" ? "bg-[#1E1E1E] border-[#303030]" : "bg-white border-slate-200"
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-rose-500">+ Record Expense</h3>
                <p className="text-xs text-slate-400">Add an operating business expense</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Amount ({currencySymbol}) *</label>
                <input
                  type="number"
                  required
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 text-lg font-bold rounded-xl border bg-transparent focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl text-sm border focus:outline-none ${
                    theme === "dark" ? "bg-[#252525] border-slate-700" : "bg-white border-slate-200"
                  }`}
                >
                  <option value="Rent">Shop Rent</option>
                  <option value="Salaries">Staff Salaries</option>
                  <option value="Utilities">Electricity & Bills</option>
                  <option value="Tea & Refreshment">Tea & Refreshment</option>
                  <option value="Supplies">Packing & Supplies</option>
                  <option value="Travel">Travel & Transport</option>
                  <option value="General">Other General Expense</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Description / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Paid shop rent for September"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-sm border bg-transparent focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Payment Method</label>
                <select
                  value={formData.payment_method}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl text-sm border focus:outline-none ${
                    theme === "dark" ? "bg-[#252525] border-slate-700" : "bg-white border-slate-200"
                  }`}
                >
                  <option value="cash">Cash (Naqad)</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="easypaisa">Easypaisa</option>
                  <option value="jazzcash">JazzCash</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Date</label>
                <input
                  type="date"
                  value={formData.expense_date}
                  onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
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
                  className="flex-1 py-2 rounded-xl text-sm font-bold bg-[#E53935] text-white hover:bg-rose-600 flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}