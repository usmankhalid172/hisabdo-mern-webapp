"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  Users,
  Plus,
  Minus,
  ArrowRightLeft,
  Receipt,
  Calendar,
  Wallet,
  Clock,
  CheckCircle2,
  X,
  Loader2,
  ArrowRight,
  BarChart3,
  Calculator,
  PlusCircle,
  MinusCircle,
  Percent,
  ListOrdered,
  ChevronRight,
  DollarSign,
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

// Standard categories matching HisabDo Flutter Mobile App
const INCOME_CATEGORIES = ["Sales", "Salary", "Gift", "Other"];
const EXPENSE_CATEGORIES = ["Rent", "Food", "Transport", "Bills", "Shopping", "Other"];

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { formatMoney, t, currencySymbol, theme } = useSettings();

  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalReceivable: 0,
    totalPayable: 0,
    netBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    cashFlowProfit: 0,
    totalCustomers: 0,
    totalTransactions: 0,
  });

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  // Modals state
  const [activeModal, setActiveModal] = useState<"income" | "expense" | "customer" | "payment" | "calculator" | null>(null);

  // Form states
  const [formCustomer, setFormCustomer] = useState({ name: "", phone: "", opening_balance: 0, notes: "", address: "" });
  const [formIncome, setFormIncome] = useState({ amount: "", customer_id: "", description: "", payment_method: "cash", category_id: "Sales", date: new Date().toISOString().split("T")[0] });
  const [formExpense, setFormExpense] = useState({ amount: "", customer_id: "", description: "", payment_method: "cash", category_id: "Rent", date: new Date().toISOString().split("T")[0] });
  const [formPayment, setFormPayment] = useState({ customerId: "", amount: "", type: "received" as "received" | "paid", category: "Payment", note: "", date: new Date().toISOString().split("T")[0] });
  const [submitting, setSubmitting] = useState(false);

  // Calculator Modal States
  const [calcTab, setCalcTab] = useState<"standard" | "percentage">("percentage");
  const [calcDisplay, setCalcDisplay] = useState("0");
  const [calcEquation, setCalcEquation] = useState("");
  // Percentage Calculator States (matching percentage_calculator_screen.dart)
  const [pctAmount, setPctAmount] = useState("");
  const [pctPercent, setPctPercent] = useState("");

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const userId = user?.id || "guest";
      const [m, custs, incs, exps, pmts] = await Promise.all([
        hisabDoService.getDashboardMetrics(userId),
        hisabDoService.getCustomers(userId),
        hisabDoService.getIncomes(userId),
        hisabDoService.getExpenses(userId),
        hisabDoService.getLedgerTransactions(userId),
      ]);

      setMetrics(m);
      setCustomers(custs);
      setIncomes(incs);
      setExpenses(exps);

      // Build unified recent transactions list
      const combined: any[] = [];
      incs.forEach((i) => {
        const c = custs.find((c) => c.id === i.customer_id);
        combined.push({
          id: i.id,
          date: i.income_date,
          type: "income",
          title: i.description || "Income Sale",
          category: i.category_id || "Sales",
          customerName: c?.name || "Direct Sale",
          amount: Number(i.amount),
        });
      });

      exps.forEach((e) => {
        const c = custs.find((c) => c.id === e.customer_id);
        combined.push({
          id: e.id,
          date: e.expense_date,
          type: "expense",
          title: e.description || "Expense",
          category: e.category_id || "Rent",
          customerName: c?.name || "Business Expense",
          amount: Number(e.amount),
        });
      });

      pmts.forEach((p) => {
        const c = custs.find((c) => c.id === p.customerId);
        combined.push({
          id: p.id,
          date: p.date,
          type: p.type === "received" ? "payment_received" : "payment_sent",
          title: p.note || (p.type === "received" ? "Payment Received" : "Payment Sent"),
          category: p.category || "Payment",
          customerName: c?.name || "Customer",
          amount: Number(p.amount),
        });
      });

      combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRecentTransactions(combined.slice(0, 6));
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Form Submits
  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCustomer.name.trim()) return;
    setSubmitting(true);
    try {
      await hisabDoService.addCustomer(user?.id || "guest", {
        name: formCustomer.name,
        phone: formCustomer.phone,
        address: formCustomer.address,
        opening_balance: Number(formCustomer.opening_balance || 0),
        currency: "PKR",
        notes: formCustomer.notes,
      });
      setFormCustomer({ name: "", phone: "", opening_balance: 0, notes: "", address: "" });
      setActiveModal(null);
      await loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formIncome.amount) return;
    setSubmitting(true);
    try {
      await hisabDoService.addIncome(user?.id || "guest", {
        amount: Number(formIncome.amount),
        customer_id: formIncome.customer_id || null,
        description: formIncome.description || `${formIncome.category_id} Income`,
        income_date: formIncome.date,
        payment_method: formIncome.payment_method,
        category_id: formIncome.category_id,
      });
      setFormIncome({ amount: "", customer_id: "", description: "", payment_method: "cash", category_id: "Sales", date: new Date().toISOString().split("T")[0] });
      setActiveModal(null);
      await loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formExpense.amount) return;
    setSubmitting(true);
    try {
      await hisabDoService.addExpense(user?.id || "guest", {
        amount: Number(formExpense.amount),
        customer_id: formExpense.customer_id || null,
        description: formExpense.description || `${formExpense.category_id} Expense`,
        expense_date: formExpense.date,
        payment_method: formExpense.payment_method,
        category_id: formExpense.category_id,
      });
      setFormExpense({ amount: "", customer_id: "", description: "", payment_method: "cash", category_id: "Rent", date: new Date().toISOString().split("T")[0] });
      setActiveModal(null);
      await loadData();
    } finally {
      setSubmitting(false);
    }
  };

  // Calculator Logic
  const handleCalcButton = (char: string) => {
    if (char === "C") {
      setCalcDisplay("0");
      setCalcEquation("");
    } else if (char === "=") {
      try {
        // Safe evaluation of standard arithmetic
        const sanitized = calcEquation + calcDisplay;
        const validExpr = sanitized.replace(/[^0-9+\-*/.]/g, "");
        // eslint-disable-next-line no-eval
        const result = Function(`'use strict'; return (${validExpr})`)();
        setCalcDisplay(String(Number(result.toFixed(2))));
        setCalcEquation("");
      } catch {
        setCalcDisplay("Error");
      }
    } else if (["+", "-", "*", "/"].includes(char)) {
      setCalcEquation(calcEquation + calcDisplay + " " + char + " ");
      setCalcDisplay("0");
    } else {
      setCalcDisplay((prev) => (prev === "0" ? char : prev + char));
    }
  };

  // Percentage Calculations
  const calculatedPercentage = useMemo(() => {
    const amt = parseFloat(pctAmount);
    const pct = parseFloat(pctPercent);
    if (isNaN(amt) || isNaN(pct)) return null;
    const value = (amt * pct) / 100;
    return {
      percentValue: value,
      totalWithAdd: amt + value,
      totalWithDiscount: amt - value,
    };
  }, [pctAmount, pctPercent]);

  // Overall totals matching mobile provider
  const totalIncome = incomes.reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const totalExpense = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const totalProfit = totalIncome - totalExpense;

  return (
    <div className="space-y-8 pb-16">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2">
            Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            HisabDo Merchant Ledger &amp; Cash Flow Manager
          </p>
        </div>

        {/* Date Indicator */}
        <div className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-800 bg-[#1E1E1E] text-xs font-medium text-slate-300">
          <Calendar className="w-3.5 h-3.5 text-emerald-400" />
          <span>{new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
        </div>
      </div>

      {/* ================= 1. SUMMARY CARDS (MATCHING FLUTTER MOBILE APP) ================= */}
      <div className="space-y-3">
        {/* Row 1: Side-by-Side Income & Expense (Clickable -> opens filtered Transactions) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Green Income Card (Arrow Downward) */}
          <div
            onClick={() => router.push("/transactions?type=income")}
            className="group cursor-pointer p-6 rounded-2xl bg-gradient-to-br from-[#2E7D32] to-[#1B5E20] text-white shadow-xl shadow-emerald-950/40 border border-emerald-500/30 transition-all transform hover:-translate-y-1 active:scale-[0.99]"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-100 flex items-center gap-1.5">
                <ArrowDownLeft className="w-4 h-4 text-emerald-200" />
                Income (Lene / Wusooli)
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white group-hover:bg-white/30 transition">
                View List &rarr;
              </span>
            </div>
            <h2 className="text-3xl font-black tracking-tight">
              {formatMoney(totalIncome)}
            </h2>
            <p className="text-[11px] text-emerald-200/80 mt-2 flex items-center justify-between">
              <span>Total earnings &amp; credit sales</span>
              <span className="text-white/60">Tap to filter</span>
            </p>
          </div>

          {/* Red Expense Card (Arrow Upward) */}
          <div
            onClick={() => router.push("/transactions?type=expense")}
            className="group cursor-pointer p-6 rounded-2xl bg-gradient-to-br from-[#C62828] to-[#B71C1C] text-white shadow-xl shadow-rose-950/40 border border-rose-500/30 transition-all transform hover:-translate-y-1 active:scale-[0.99]"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-100 flex items-center gap-1.5">
                <ArrowUpRight className="w-4 h-4 text-rose-200" />
                Expense (Dene / Adaigi)
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white group-hover:bg-white/30 transition">
                View List &rarr;
              </span>
            </div>
            <h2 className="text-3xl font-black tracking-tight">
              {formatMoney(totalExpense)}
            </h2>
            <p className="text-[11px] text-rose-200/80 mt-2 flex items-center justify-between">
              <span>Total store bills &amp; outgoings</span>
              <span className="text-white/60">Tap to filter</span>
            </p>
          </div>
        </div>

        {/* Row 2: Full-Width Profit / Net Balance Card (Wallet Icon) */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-[#1565C0] via-[#0D47A1] to-[#1A237E] text-white shadow-xl shadow-blue-950/40 border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-100 block">
                Profit / Net Balance (Nafa / Khata)
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <h2 className="text-3xl font-black tracking-tight">
                  {formatMoney(totalProfit)}
                </h2>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  totalProfit >= 0 ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30" : "bg-rose-500/20 text-rose-300 border border-rose-400/30"
                }`}>
                  {totalProfit >= 0 ? "Net Positive" : "Net Deficit"}
                </span>
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right border-t sm:border-t-0 sm:border-l border-white/10 pt-3 sm:pt-0 sm:pl-6 text-xs text-blue-100/90 space-y-1">
            <div>Customer Receivables: <strong className="text-emerald-300 font-bold">{formatMoney(metrics.totalReceivable)}</strong></div>
            <div>Outstanding Payables: <strong className="text-rose-300 font-bold">{formatMoney(metrics.totalPayable)}</strong></div>
          </div>
        </div>
      </div>

      {/* ================= 2. QUICK ACTION MENU TILES (MATCHING MOBILE _menuCard) ================= */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
          Core Modules &amp; Actions
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Tile 1: Add Income (Green) */}
          <button
            onClick={() => setActiveModal("income")}
            className="flex items-center justify-between p-4 rounded-2xl bg-[#1E1E1E] hover:bg-[#252525] border border-slate-800 hover:border-emerald-500/40 text-left transition-all group shadow-sm"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/15 text-[#00E676] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <PlusCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Add Income</h4>
                <p className="text-xs text-slate-400">Lene Add Karein (Sale / Jama)</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition" />
          </button>

          {/* Tile 2: Add Expense (Red) */}
          <button
            onClick={() => setActiveModal("expense")}
            className="flex items-center justify-between p-4 rounded-2xl bg-[#1E1E1E] hover:bg-[#252525] border border-slate-800 hover:border-rose-500/40 text-left transition-all group shadow-sm"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-rose-500/15 text-[#E53935] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <MinusCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Add Expense</h4>
                <p className="text-xs text-slate-400">Dene Add Karein (Kharcha / Naam)</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-rose-400 group-hover:translate-x-0.5 transition" />
          </button>

          {/* Tile 3: Transactions (Orange) */}
          <Link
            href="/transactions"
            className="flex items-center justify-between p-4 rounded-2xl bg-[#1E1E1E] hover:bg-[#252525] border border-slate-800 hover:border-amber-500/40 text-left transition-all group shadow-sm"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <ListOrdered className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Transactions</h4>
                <p className="text-xs text-slate-400">Len Den History &amp; Records</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition" />
          </Link>

          {/* Tile 4: Customers / Khata (Teal) */}
          <Link
            href="/customers"
            className="flex items-center justify-between p-4 rounded-2xl bg-[#1E1E1E] hover:bg-[#252525] border border-slate-800 hover:border-teal-500/40 text-left transition-all group shadow-sm"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-teal-500/15 text-teal-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Customers</h4>
                <p className="text-xs text-slate-400">{customers.length} Grahak Khata Accounts</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400 group-hover:translate-x-0.5 transition" />
          </Link>

          {/* Tile 5: Reports (Blue) */}
          <Link
            href="/reports"
            className="flex items-center justify-between p-4 rounded-2xl bg-[#1E1E1E] hover:bg-[#252525] border border-slate-800 hover:border-blue-500/40 text-left transition-all group shadow-sm"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Reports &amp; P&amp;L</h4>
                <p className="text-xs text-slate-400">Statement breakdown &amp; ratio</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition" />
          </Link>

          {/* Tile 6: Calculator & Percentage (Purple) */}
          <button
            onClick={() => setActiveModal("calculator")}
            className="flex items-center justify-between p-4 rounded-2xl bg-[#1E1E1E] hover:bg-[#252525] border border-slate-800 hover:border-purple-500/40 text-left transition-all group shadow-sm"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Calculator className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Retail Calculator</h4>
                <p className="text-xs text-slate-400">Profit, Discount &amp; Percentage</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-0.5 transition" />
          </button>
        </div>
      </div>

      {/* ================= 3. RECENT TRANSACTIONS FEED ================= */}
      <div className="rounded-2xl border border-slate-800 bg-[#1E1E1E] p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Recent Transactions</h3>
            <p className="text-xs text-slate-400">Latest business activity across store</p>
          </div>
          <Link
            href="/transactions"
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            <span>View All ({metrics.totalTransactions})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            <Receipt className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            <p>No transactions recorded yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {recentTransactions.map((tx) => {
              const isIncome = tx.type === "income" || tx.type === "payment_received";
              return (
                <div key={tx.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isIncome ? "bg-emerald-500/15 text-[#00E676]" : "bg-rose-500/15 text-[#E53935]"
                      }`}
                    >
                      {isIncome ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white truncate">{tx.title}</span>
                        <span className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-slate-800">
                          {tx.category}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 block truncate">{tx.customerName}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`text-sm font-black block ${
                        isIncome ? "text-[#00E676]" : "text-[#E53935]"
                      }`}
                    >
                      {isIncome ? "+" : "-"}
                      {formatMoney(tx.amount)}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {new Date(tx.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ================= MODALS ================= */}

      {/* Modal 1: Add Income Modal (Lene Add Karein) */}
      {activeModal === "income" && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-[#1E1E1E] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-[#00E676] flex items-center gap-2">
                <PlusCircle className="w-5 h-5" /> Record Income (Lene / Sale)
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddIncome} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Amount ({currencySymbol}) *
                </label>
                <input
                  type="number"
                  required
                  step="any"
                  placeholder="0.00"
                  value={formIncome.amount}
                  onChange={(e) => setFormIncome({ ...formIncome, amount: e.target.value })}
                  className="w-full px-3 py-2 text-xl font-bold rounded-xl border border-slate-700 bg-[#121212] text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Customer (Optional for Credit Sale)
                </label>
                <select
                  value={formIncome.customer_id}
                  onChange={(e) => setFormIncome({ ...formIncome, customer_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-sm border border-slate-700 bg-[#121212] text-white focus:outline-none"
                >
                  <option value="">Direct Counter Sale (No Customer)</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.phone ? `(${c.phone})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                <select
                  value={formIncome.category_id}
                  onChange={(e) => setFormIncome({ ...formIncome, category_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-sm border border-slate-700 bg-[#121212] text-white focus:outline-none"
                >
                  {INCOME_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Date</label>
                <input
                  type="date"
                  value={formIncome.date}
                  onChange={(e) => setFormIncome({ ...formIncome, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-sm border border-slate-700 bg-[#121212] text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description / Items</label>
                <input
                  type="text"
                  placeholder="e.g. Counter sales, retail stock sale"
                  value={formIncome.description}
                  onChange={(e) => setFormIncome({ ...formIncome, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-sm border border-slate-700 bg-[#121212] text-white focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-slate-700 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-[#2E7D32] hover:bg-[#256628] text-white flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Income
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Add Expense Modal (Dene Add Karein) */}
      {activeModal === "expense" && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-[#1E1E1E] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-[#E53935] flex items-center gap-2">
                <MinusCircle className="w-5 h-5" /> Record Expense (Dene / Kharcha)
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Amount ({currencySymbol}) *
                </label>
                <input
                  type="number"
                  required
                  step="any"
                  placeholder="0.00"
                  value={formExpense.amount}
                  onChange={(e) => setFormExpense({ ...formExpense, amount: e.target.value })}
                  className="w-full px-3 py-2 text-xl font-bold rounded-xl border border-slate-700 bg-[#121212] text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Customer / Supplier (Optional)
                </label>
                <select
                  value={formExpense.customer_id}
                  onChange={(e) => setFormExpense({ ...formExpense, customer_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-sm border border-slate-700 bg-[#121212] text-white focus:outline-none"
                >
                  <option value="">General Store Overhead</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.phone ? `(${c.phone})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                <select
                  value={formExpense.category_id}
                  onChange={(e) => setFormExpense({ ...formExpense, category_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-sm border border-slate-700 bg-[#121212] text-white focus:outline-none"
                >
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Date</label>
                <input
                  type="date"
                  value={formExpense.date}
                  onChange={(e) => setFormExpense({ ...formExpense, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-sm border border-slate-700 bg-[#121212] text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Shop rent, electricity bill, tea"
                  value={formExpense.description}
                  onChange={(e) => setFormExpense({ ...formExpense, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-sm border border-slate-700 bg-[#121212] text-white focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-slate-700 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-[#C62828] hover:bg-[#A82020] text-white flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Retail & Percentage Calculator Modal (Matching Mobile Flutter App) */}
      {activeModal === "calculator" && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl border border-slate-700 bg-[#1E1E1E] p-5 space-y-4 shadow-2xl">
            {/* Header with Tab switcher */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-1 bg-[#121212] p-1 rounded-xl border border-slate-700">
                <button
                  onClick={() => setCalcTab("percentage")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    calcTab === "percentage" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Percentage (%)
                </button>
                <button
                  onClick={() => setCalcTab("standard")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    calcTab === "standard" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Standard
                </button>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab 1: Percentage Calculator (Matching Flutter percentage_calculator_screen.dart) */}
            {calcTab === "percentage" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Total Amount ({currencySymbol})</label>
                  <input
                    type="number"
                    placeholder="e.g. 5000"
                    value={pctAmount}
                    onChange={(e) => setPctAmount(e.target.value)}
                    className="w-full px-3 py-2 text-base font-bold rounded-xl border border-slate-700 bg-[#121212] text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Percentage Rate (%)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="e.g. 15"
                      value={pctPercent}
                      onChange={(e) => setPctPercent(e.target.value)}
                      className="w-full px-3 py-2 text-base font-bold rounded-xl border border-slate-700 bg-[#121212] text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                    <span className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 font-bold">%</span>
                  </div>

                  {/* Preset chips */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {["5", "10", "15", "18", "20", "25"].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPctPercent(p)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition ${
                          pctPercent === p
                            ? "bg-purple-600 text-white border-purple-500"
                            : "border-slate-800 bg-[#121212] text-slate-400 hover:text-white"
                        }`}
                      >
                        {p}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Calculation Results Card */}
                {calculatedPercentage ? (
                  <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-800/40 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-purple-300 font-medium">{pctPercent}% Value:</span>
                      <span className="text-base font-black text-white">
                        {formatMoney(calculatedPercentage.percentValue)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs border-t border-purple-900/50 pt-2">
                      <span className="text-slate-400">Total with Margin (+):</span>
                      <span className="font-bold text-emerald-400">
                        {formatMoney(calculatedPercentage.totalWithAdd)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs border-t border-purple-900/50 pt-2">
                      <span className="text-slate-400">Total with Discount (-):</span>
                      <span className="font-bold text-rose-400">
                        {formatMoney(calculatedPercentage.totalWithDiscount)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-[#121212] border border-slate-800 text-center text-xs text-slate-500">
                    Enter amount and percentage to compute value
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPctAmount("");
                      setPctPercent("");
                    }}
                    className="w-full py-2 rounded-xl text-xs font-semibold border border-slate-700 hover:bg-slate-800 text-slate-400"
                  >
                    Clear Fields
                  </button>
                </div>
              </div>
            )}

            {/* Tab 2: Standard Calculator (Matching Flutter calculator_screen.dart) */}
            {calcTab === "standard" && (
              <div className="space-y-3">
                {/* Display */}
                <div className="p-3 rounded-xl bg-[#121212] border border-slate-800 text-right">
                  <span className="text-xs text-slate-500 block h-4 truncate">{calcEquation}</span>
                  <span className="text-2xl font-black text-white block truncate">{calcDisplay}</span>
                </div>

                {/* Keypad */}
                <div className="grid grid-cols-4 gap-2">
                  {["C", "/", "*", "-"].map((op) => (
                    <button
                      key={op}
                      onClick={() => handleCalcButton(op)}
                      className="py-3 rounded-xl bg-purple-950/40 text-purple-300 font-bold hover:bg-purple-900/60 transition"
                    >
                      {op}
                    </button>
                  ))}
                  {["7", "8", "9", "+"].map((k) => (
                    <button
                      key={k}
                      onClick={() => handleCalcButton(k)}
                      className={`py-3 rounded-xl font-bold transition ${
                        k === "+" ? "bg-purple-950/40 text-purple-300 hover:bg-purple-900/60" : "bg-slate-800/80 text-white hover:bg-slate-700"
                      }`}
                    >
                      {k}
                    </button>
                  ))}
                  {["4", "5", "6", "="].map((k) => (
                    <button
                      key={k}
                      onClick={() => handleCalcButton(k)}
                      className={`py-3 rounded-xl font-bold transition ${
                        k === "=" ? "bg-purple-600 text-white hover:bg-purple-500 row-span-2 flex items-center justify-center" : "bg-slate-800/80 text-white hover:bg-slate-700"
                      }`}
                    >
                      {k}
                    </button>
                  ))}
                  {["1", "2", "3"].map((k) => (
                    <button
                      key={k}
                      onClick={() => handleCalcButton(k)}
                      className="py-3 rounded-xl bg-slate-800/80 text-white font-bold hover:bg-slate-700 transition"
                    >
                      {k}
                    </button>
                  ))}
                  {["0", "."].map((k) => (
                    <button
                      key={k}
                      onClick={() => handleCalcButton(k)}
                      className="py-3 rounded-xl bg-slate-800/80 text-white font-bold hover:bg-slate-700 transition col-span-1"
                    >
                      {k}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}