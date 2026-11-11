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
  MessageCircle,
  FileText,
  Sparkles,
  Phone,
  Activity,
  CreditCard,
  Building,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/design-system/Card";
import { PageHeading } from "@/components/ui/design-system/PageHeading";
import { LoadingState } from "@/components/ui/design-system/LoadingState";
import { EmptyState } from "@/components/ui/design-system/EmptyState";
import { ErrorState } from "@/components/ui/design-system/ErrorState";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import {
  hisabDoService,
  Customer,
  Income,
  Expense,
  LedgerTransaction,
} from "@/services/hisabdoService";

// Standard categories matching HisabDo Mobile App
const INCOME_CATEGORIES = ["Sales", "Salary", "Gift", "Other"];
const EXPENSE_CATEGORIES = ["Rent", "Food", "Transport", "Bills", "Shopping", "Other"];

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { formatMoney, t, currencySymbol, theme, businessProfile } = useSettings();

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
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
  const [customerBalances, setCustomerBalances] = useState<Record<string, number>>({});
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [txFilter, setTxFilter] = useState<"all" | "income" | "expense">("all");

  // Modals state
  const [activeModal, setActiveModal] = useState<"income" | "expense" | "customer" | "payment" | "calculator" | null>(null);

  // Form states
  const [formCustomer, setFormCustomer] = useState({ name: "", phone: "", opening_balance: 0, notes: "", address: "" });
  const [formIncome, setFormIncome] = useState({ amount: "", customer_id: "", description: "", payment_method: "cash", category_id: "Sales", date: new Date().toISOString().split("T")[0] });
  const [formExpense, setFormExpense] = useState({ amount: "", customer_id: "", description: "", payment_method: "cash", category_id: "Rent", date: new Date().toISOString().split("T")[0] });
  const [submitting, setSubmitting] = useState(false);

  // Calculator Modal States
  const [calcTab, setCalcTab] = useState<"standard" | "percentage">("percentage");
  const [calcDisplay, setCalcDisplay] = useState("0");
  const [calcEquation, setCalcEquation] = useState("");
  // Percentage Calculator States
  const [pctAmount, setPctAmount] = useState("");
  const [pctPercent, setPctPercent] = useState("");

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
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

      // Compute quick running balances for customer cards
      const balances: Record<string, number> = {};
      for (const c of custs.slice(0, 8)) {
        try {
          const { summary } = await hisabDoService.getCustomerLedgerTimeline(userId, c.id);
          balances[c.id] = summary.netBalance;
        } catch {
          balances[c.id] = c.opening_balance || 0;
        }
      }
      setCustomerBalances(balances);

      // Build unified recent transactions list
      const combined: any[] = [];
      incs.forEach((i) => {
        const c = custs.find((c) => c.id === i.customer_id);
        combined.push({
          id: i.id,
          date: i.income_date,
          type: "income",
          title: i.description || "Counter Sale",
          category: i.category_id || "Sales",
          customerName: c?.name || "Counter / Direct Sale",
          customerId: c?.id,
          amount: Number(i.amount),
        });
      });

      exps.forEach((e) => {
        const c = custs.find((c) => c.id === e.customer_id);
        combined.push({
          id: e.id,
          date: e.expense_date,
          type: "expense",
          title: e.description || "Expense Record",
          category: e.category_id || "Rent",
          customerName: c?.name || "Store Overhead",
          customerId: c?.id,
          amount: Number(e.amount),
        });
      });

      pmts.forEach((p) => {
        const c = custs.find((c) => c.id === p.customerId);
        combined.push({
          id: p.id,
          date: p.date,
          type: p.type === "received" ? "payment_received" : "payment_sent",
          title: p.note || (p.type === "received" ? "Khata Payment Received" : "Khata Payment Sent"),
          category: p.category || "Payment",
          customerName: c?.name || "Customer",
          customerId: c?.id,
          amount: Number(p.amount),
        });
      });

      combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRecentTransactions(combined.slice(0, 10));
    } catch (err: any) {
      console.error("Dashboard data load error:", err);
      setLoadError(
        err?.message ||
          "Failed to load dashboard metrics. Please check your network connection and try again."
      );
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

  // Overall totals
  const totalIncome = incomes.reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const totalExpense = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const totalProfit = totalIncome - totalExpense;

  // Check if initial merchant financial data is empty
  const isDataEmpty = useMemo(() => {
    return (
      incomes.length === 0 &&
      expenses.length === 0 &&
      customers.length === 0 &&
      (metrics.totalReceivable || 0) === 0 &&
      (metrics.totalPayable || 0) === 0
    );
  }, [incomes, expenses, customers, metrics]);

  // Top Debtors (Customers with highest receivable balance)
  const topDebtors = useMemo(() => {
    return customers
      .map((c) => ({
        ...c,
        balance: customerBalances[c.id] ?? c.opening_balance ?? 0,
      }))
      .filter((c) => c.balance > 0)
      .sort((a, b) => b.balance - a.balance)
      .slice(0, 5);
  }, [customers, customerBalances]);

  // Filtered transactions for the desktop table
  const filteredTransactions = useMemo(() => {
    if (txFilter === "income") {
      return recentTransactions.filter((t) => t.type === "income" || t.type === "payment_received");
    }
    if (txFilter === "expense") {
      return recentTransactions.filter((t) => t.type === "expense" || t.type === "payment_sent");
    }
    return recentTransactions;
  }, [recentTransactions, txFilter]);

  // Cash flow ratio
  const cashflowPercentage = totalIncome > 0 ? Math.min(100, Math.round((totalProfit / totalIncome) * 100)) : 0;
  const expenseRatio = totalIncome > 0 ? Math.min(100, Math.round((totalExpense / totalIncome) * 100)) : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* ================= 1. REBUILT MODERN HEADER & QUICK ACTIONS (MERGED DESIGN SYSTEM) ================= */}
      <div className="pb-2 border-b border-slate-200 dark:border-slate-800/80">
        <PageHeading
          title="Dashboard"
          description="Real-time merchant ledger, cash flow performance, and customer khata balances."
          action={
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="green" className="hidden sm:inline-flex">
                Live Cloud Sync
              </Badge>

              {/* Date Indicator */}
              <div className="flex items-center gap-1.5 ps-3 pe-3 py-2 rounded-control hisab-card text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-card">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                <span>{new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
              </div>

              <Button
                variant="accent"
                size="sm"
                icon={Plus}
                onClick={() => setActiveModal("income")}
              >
                Record Income
              </Button>

              <Button
                variant="danger"
                size="sm"
                icon={Minus}
                onClick={() => setActiveModal("expense")}
              >
                Record Expense
              </Button>

              <Button
                variant="secondary"
                size="sm"
                icon={Calculator}
                onClick={() => setActiveModal("calculator")}
                title="Open Retail & Percentage Calculator"
              >
                Calculator
              </Button>
            </div>
          }
        />
      </div>

      {/* ================= 2. REBUILT 5 SUMMARY CARDS (MERGED DESIGN SYSTEM) ================= */}
      {isLoading ? (
        /* Loading Skeleton State: 5 cards preventing misleading zeroes */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4" aria-busy="true" aria-label="Loading summary metrics">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="shadow-card">
              <LoadingState variant="skeleton" message="Loading summary metrics" className="p-5" />
            </Card>
          ))}
        </div>
      ) : loadError ? (
        /* Error State with Retry Action */
        <Card className="shadow-card border-danger/30 bg-danger/5">
          <ErrorState
            title="Unable to Load Dashboard Data"
            message={loadError}
            onRetry={loadData}
          />
        </Card>
      ) : (
        /* Actual Financial Summary Cards */
        <div className="space-y-3">
          {/* Empty State Banner if merchant has zero transaction data */}
          {isDataEmpty && (
            <Card className="shadow-card border-info/20 bg-info/5">
              <EmptyState
                title="Welcome to your HisabDo Ledger"
                message="No transactions recorded yet. Record your first sale or add customer khata to see live analytics."
                action={
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="accent"
                      size="sm"
                      icon={Plus}
                      onClick={() => setActiveModal("income")}
                    >
                      First Sale
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      icon={Users}
                      onClick={() => setActiveModal("customer")}
                    >
                      Add Customer
                    </Button>
                  </div>
                }
              />
            </Card>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {/* 1. Total Income Summary Card */}
            <Card
              onClick={() => router.push("/transactions?type=income")}
              className="p-5 rounded-card shadow-card cursor-pointer hover:shadow-md hover:border-success/40 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    Income (Lene)
                  </span>
                  <div className="p-2 rounded-control bg-success/10 text-success group-hover:scale-105 transition-transform shrink-0">
                    <ArrowDownLeft className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2.5">
                  <h3 className="text-xl xl:text-2xl font-black tracking-tight text-success">
                    {formatMoney(totalIncome)}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
                    {incomes.length === 0 ? "No sales recorded yet" : `${incomes.length} sales & receipts`}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
                <Badge variant="green">Inflow</Badge>
                <span className="text-success font-bold group-hover:underline inline-flex items-center gap-0.5">
                  <span>View</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Card>

            {/* 2. Total Expenses Summary Card */}
            <Card
              onClick={() => router.push("/transactions?type=expense")}
              className="p-5 rounded-card shadow-card cursor-pointer hover:shadow-md hover:border-danger/40 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    Expenses (Dene)
                  </span>
                  <div className="p-2 rounded-control bg-danger/10 text-danger group-hover:scale-105 transition-transform shrink-0">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2.5">
                  <h3 className="text-xl xl:text-2xl font-black tracking-tight text-danger">
                    {formatMoney(totalExpense)}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
                    {expenses.length === 0 ? "No expenses recorded yet" : `${expenses.length} operating bills`}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
                <Badge variant="red">Outflow</Badge>
                <span className="text-danger font-bold group-hover:underline inline-flex items-center gap-0.5">
                  <span>View</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Card>

            {/* 3. Net Profit Summary Card */}
            <Card className="p-5 rounded-card shadow-card transition-all hover:shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    Profit (Nafa)
                  </span>
                  <div className={`p-2 rounded-control ${totalProfit >= 0 ? "bg-success/10 text-success" : "bg-danger/10 text-danger"} shrink-0`}>
                    {totalProfit >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  </div>
                </div>
                <div className="mt-2.5">
                  <h3 className={`text-xl xl:text-2xl font-black tracking-tight ${totalProfit >= 0 ? "text-slate-900 dark:text-white" : "text-danger"}`}>
                    {formatMoney(totalProfit)}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
                    {incomes.length === 0 && expenses.length === 0
                      ? "Awaiting transactions"
                      : totalIncome > 0
                      ? `${((totalProfit / totalIncome) * 100).toFixed(1)}% operating margin`
                      : "Income minus expenses"}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
                <Badge variant={totalProfit >= 0 ? "green" : "red"}>
                  {totalProfit >= 0 ? "Net Positive" : "Deficit"}
                </Badge>
                <span className="text-slate-400 text-[10px] truncate">
                  {totalProfit >= 0 ? "Surplus" : "Operating loss"}
                </span>
              </div>
            </Card>

            {/* 4. Khata Receivables Summary Card */}
            <Card
              onClick={() => router.push("/customers")}
              className="p-5 rounded-card shadow-card cursor-pointer hover:shadow-md hover:border-primary/40 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    Receivables (Lene)
                  </span>
                  <div className="p-2 rounded-control bg-primary/10 text-primary group-hover:scale-105 transition-transform shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2.5">
                  <h3 className="text-xl xl:text-2xl font-black tracking-tight text-primary">
                    {formatMoney(metrics.totalReceivable)}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
                    {metrics.totalReceivable === 0
                      ? "No pending receivables"
                      : `${customers.length} customer accounts`}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
                <Badge variant="purple">To Collect</Badge>
                <span className="text-primary font-bold group-hover:underline inline-flex items-center gap-0.5">
                  <span>Parties</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Card>

            {/* 5. Total Payables Summary Card */}
            <Card
              onClick={() => router.push("/vendors")}
              className="p-5 rounded-card shadow-card cursor-pointer hover:shadow-md hover:border-warning/40 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    Payables (Dene)
                  </span>
                  <div className="p-2 rounded-control bg-warning/10 text-warning group-hover:scale-105 transition-transform shrink-0">
                    <CreditCard className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2.5">
                  <h3 className="text-xl xl:text-2xl font-black tracking-tight text-warning">
                    {formatMoney(metrics.totalPayable)}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
                    {metrics.totalPayable === 0
                      ? "No pending payables"
                      : "Supplier & vendor liabilities"}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
                <Badge variant="amber">To Pay</Badge>
                <span className="text-warning font-bold group-hover:underline inline-flex items-center gap-0.5">
                  <span>Vendors</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ================= 3. SPLIT MAIN WORKSPACE (8 COLS DATA / 4 COLS ACTION & DEBTORS) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 of 12): Cashflow Trend + Recent Activity Table */}
        <div className="lg:col-span-8 space-y-6">
          {/* Visual Cash Flow Health Breakdown */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#18181B] shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  Store Cash Flow &amp; Operating Margin
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Revenue retention ratio and operational expenditure balance.
                </p>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-xs font-semibold text-slate-500">Margin:</span>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                  {totalIncome > 0 ? `${((totalProfit / totalIncome) * 100).toFixed(1)}%` : "0%"}
                </span>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="space-y-1.5">
              <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
                <div
                  style={{ width: `${Math.max(5, 100 - expenseRatio)}%` }}
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                  title={`Net Margin: ${100 - expenseRatio}%`}
                />
                <div
                  style={{ width: `${Math.min(95, expenseRatio)}%` }}
                  className="h-full bg-gradient-to-r from-rose-500 to-orange-400 transition-all duration-500"
                  title={`Expense Ratio: ${expenseRatio}%`}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 px-0.5">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Net Profit ({totalIncome > 0 ? Math.max(0, 100 - expenseRatio) : 0}%)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Operating Costs ({expenseRatio}%)
                </span>
              </div>
            </div>

            {/* Sub-Metrics Cards */}
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#202024] border border-slate-200/60 dark:border-slate-800 text-center">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Total Sales</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 block truncate">
                  {formatMoney(totalIncome)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#202024] border border-slate-200/60 dark:border-slate-800 text-center">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Total Outgoings</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 block truncate">
                  {formatMoney(totalExpense)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#202024] border border-slate-200/60 dark:border-slate-800 text-center">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Active Parties</span>
                <span className="text-sm font-bold text-indigo-500 mt-0.5 block">
                  {customers.length} Accounts
                </span>
              </div>
            </div>
          </div>

          {/* Desktop-Grade Recent Transactions Table */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#18181B] shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                  Recent Ledger Activity
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Latest commercial sales, expenses, and khata adjustments.
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-[#222226] border border-slate-200/80 dark:border-slate-800 self-start sm:self-auto">
                <button
                  onClick={() => setTxFilter("all")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    txFilter === "all"
                      ? "bg-white dark:bg-[#2B2B30] text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  All ({recentTransactions.length})
                </button>
                <button
                  onClick={() => setTxFilter("income")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    txFilter === "income"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-slate-500 hover:text-emerald-500"
                  }`}
                >
                  Income
                </button>
                <button
                  onClick={() => setTxFilter("expense")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    txFilter === "expense"
                      ? "bg-rose-600 text-white shadow-sm"
                      : "text-slate-500 hover:text-rose-500"
                  }`}
                >
                  Expenses
                </button>
              </div>
            </div>

            {/* Table Content */}
            {filteredTransactions.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                <Receipt className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No transactions match the selected filter.</p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-6 px-6">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                      <th className="pb-3 pr-4">Date</th>
                      <th className="pb-3 px-4">Transaction / Description</th>
                      <th className="pb-3 px-4">Party / Account</th>
                      <th className="pb-3 px-4">Category</th>
                      <th className="pb-3 pl-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                    {filteredTransactions.map((tx) => {
                      const isIncome = tx.type === "income" || tx.type === "payment_received";
                      return (
                        <tr
                          key={tx.id}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                        >
                          <td className="py-3.5 pr-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            {new Date(tx.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white max-w-[200px] truncate">
                            {tx.title}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 max-w-[160px] truncate">
                            {tx.customerId ? (
                              <Link
                                href={`/customers/${tx.customerId}`}
                                className="hover:text-indigo-500 hover:underline inline-flex items-center gap-1"
                              >
                                {tx.customerName}
                              </Link>
                            ) : (
                              <span>{tx.customerName}</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              {tx.category}
                            </span>
                          </td>
                          <td className="py-3.5 pl-4 text-right whitespace-nowrap">
                            <span
                              className={`font-black text-sm ${
                                isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                              }`}
                            >
                              {isIncome ? "+" : "-"}
                              {formatMoney(tx.amount)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Footer View All */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Showing {filteredTransactions.length} of {metrics.totalTransactions} total entries
              </span>
              <Link
                href="/transactions"
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>Full Ledger Explorer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column (4 of 12): Fast Action Drawer & Top Khata Debtors */}
        <div className="lg:col-span-4 space-y-6">
          {/* Rebuilt Fast Actions & Entries Launcher Panel (Merged Card Component) */}
          <Card className="p-5 rounded-card shadow-card space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Fast Actions &amp; Entries
            </h3>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setActiveModal("income")}
                className="p-3.5 rounded-control border border-success/20 bg-success/5 hover:bg-success/10 text-start transition group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success"
              >
                <div className="w-8 h-8 rounded-control bg-success/15 text-success flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <PlusCircle className="w-4 h-4" />
                </div>
                <div className="font-bold text-xs text-slate-900 dark:text-white">Add Income</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Counter Sale</div>
              </button>

              <button
                type="button"
                onClick={() => setActiveModal("expense")}
                className="p-3.5 rounded-control border border-danger/20 bg-danger/5 hover:bg-danger/10 text-start transition group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
              >
                <div className="w-8 h-8 rounded-control bg-danger/15 text-danger flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <MinusCircle className="w-4 h-4" />
                </div>
                <div className="font-bold text-xs text-slate-900 dark:text-white">Add Expense</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Bills &amp; Rent</div>
              </button>

              <button
                type="button"
                onClick={() => setActiveModal("customer")}
                className="p-3.5 rounded-control border border-primary/20 bg-primary/5 hover:bg-primary/10 text-start transition group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <div className="w-8 h-8 rounded-control bg-primary/15 text-primary flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <Users className="w-4 h-4" />
                </div>
                <div className="font-bold text-xs text-slate-900 dark:text-white">New Party</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Add Customer</div>
              </button>

              <button
                type="button"
                onClick={() => setActiveModal("calculator")}
                className="p-3.5 rounded-control border border-warning/20 bg-warning/5 hover:bg-warning/10 text-start transition group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning"
              >
                <div className="w-8 h-8 rounded-control bg-warning/15 text-warning flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <Percent className="w-4 h-4" />
                </div>
                <div className="font-bold text-xs text-slate-900 dark:text-white">Calculator</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Profit &amp; %</div>
              </button>
            </div>
          </Card>

          {/* Top Khata Debtors Panel (Direct WhatsApp Reminders) */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#18181B] shadow-sm space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                  Top Khata Debtors
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Parties with largest receivable balance
                </p>
              </div>
              <Link
                href="/customers"
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                View All
              </Link>
            </div>

            {topDebtors.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                <Users className="w-6 h-6 mx-auto mb-1.5 opacity-50" />
                <p>No outstanding customer balances.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {topDebtors.map((debtor) => {
                  const whatsappUrl = hisabDoService.generateWhatsAppReminderUrl({
                    customerName: debtor.name,
                    phone: debtor.phone,
                    currency: currencySymbol,
                    netBalance: debtor.balance,
                    shopName: businessProfile.businessName || "HisabDo Store",
                    shopPhone: businessProfile.phone || "",
                  });

                  return (
                    <div key={debtor.id} className="py-2.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0">
                          {debtor.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/customers/${debtor.id}`}
                            className="font-bold text-xs text-slate-900 dark:text-white hover:underline block truncate"
                          >
                            {debtor.name}
                          </Link>
                          <span className="text-[10px] text-slate-400 block truncate">
                            {debtor.phone || "No phone"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400">
                          {formatMoney(debtor.balance)}
                        </span>
                        {debtor.phone && (
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 transition"
                            title="Send WhatsApp Khata Reminder"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Accounting Summary Card */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-indigo-900/10 to-purple-900/10 dark:from-[#1D1B36] dark:to-[#17142A] space-y-2">
            <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
              Business Health Summary
            </span>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Total of <strong>{metrics.totalCustomers}</strong> registered customer accounts with <strong>{metrics.totalTransactions}</strong> lifetime ledger transactions.
            </p>
            <div className="pt-2 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span>Currency: <strong>{currencySymbol} (PKR)</strong></span>
              <span>&bull;</span>
              <span>Ledger: <strong>Double-entry Parity</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MODALS (FULLY THEMED) ================= */}

      {/* Modal 1: Add Income Modal */}
      {activeModal === "income" && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1E1E1E] text-slate-900 dark:text-white p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <PlusCircle className="w-5 h-5" /> Record Income (Sale / Wusooli)
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddIncome} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Amount ({currencySymbol}) *
                </label>
                <input
                  type="number"
                  required
                  step="any"
                  placeholder="0.00"
                  value={formIncome.amount}
                  onChange={(e) => setFormIncome({ ...formIncome, amount: e.target.value })}
                  className="w-full px-3 py-2 text-xl font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#121212] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Customer (Optional for Credit Sale)
                </label>
                <select
                  value={formIncome.customer_id}
                  onChange={(e) => setFormIncome({ ...formIncome, customer_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#121212] text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="">Direct Counter Sale (No Customer)</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.phone ? `(${c.phone})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select
                    value={formIncome.category_id}
                    onChange={(e) => setFormIncome({ ...formIncome, category_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#121212] text-slate-900 dark:text-white focus:outline-none"
                  >
                    {INCOME_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    value={formIncome.date}
                    onChange={(e) => setFormIncome({ ...formIncome, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#121212] text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description / Items</label>
                <input
                  type="text"
                  placeholder="e.g. Counter sales, retail stock sale"
                  value={formIncome.description}
                  onChange={(e) => setFormIncome({ ...formIncome, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#121212] text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 transition"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Income
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Add Expense Modal */}
      {activeModal === "expense" && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1E1E1E] text-slate-900 dark:text-white p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <MinusCircle className="w-5 h-5" /> Record Expense (Kharcha / Adaigi)
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Amount ({currencySymbol}) *
                </label>
                <input
                  type="number"
                  required
                  step="any"
                  placeholder="0.00"
                  value={formExpense.amount}
                  onChange={(e) => setFormExpense({ ...formExpense, amount: e.target.value })}
                  className="w-full px-3 py-2 text-xl font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#121212] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Supplier / Party (Optional)
                </label>
                <select
                  value={formExpense.customer_id}
                  onChange={(e) => setFormExpense({ ...formExpense, customer_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#121212] text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="">General Store Overhead</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.phone ? `(${c.phone})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select
                    value={formExpense.category_id}
                    onChange={(e) => setFormExpense({ ...formExpense, category_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#121212] text-slate-900 dark:text-white focus:outline-none"
                  >
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    value={formExpense.date}
                    onChange={(e) => setFormExpense({ ...formExpense, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#121212] text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Shop rent, electricity bill, supplies"
                  value={formExpense.description}
                  onChange={(e) => setFormExpense({ ...formExpense, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#121212] text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center gap-2 transition"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Add Customer Modal */}
      {activeModal === "customer" && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1E1E1E] text-slate-900 dark:text-white p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                <Users className="w-5 h-5" /> Add Customer / Khata Account
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomer} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Customer / Business Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Muhammad Ahmad"
                  value={formCustomer.name}
                  onChange={(e) => setFormCustomer({ ...formCustomer, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#121212] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Phone Number (for WhatsApp Reminders)
                </label>
                <input
                  type="tel"
                  placeholder="03001234567"
                  value={formCustomer.phone}
                  onChange={(e) => setFormCustomer({ ...formCustomer, phone: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#121212] text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Opening Balance ({currencySymbol})
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="0.00"
                  value={formCustomer.opening_balance || ""}
                  onChange={(e) => setFormCustomer({ ...formCustomer, opening_balance: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#121212] text-slate-900 dark:text-white focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Positive = Customer owes you (Lene). Negative = You owe customer (Dene).
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Shop Address / Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Shop # 12, Main Market"
                  value={formCustomer.address}
                  onChange={(e) => setFormCustomer({ ...formCustomer, address: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#121212] text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center gap-2 transition"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Party
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Retail & Percentage Calculator Modal */}
      {activeModal === "calculator" && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1E1E1E] text-slate-900 dark:text-white p-5 space-y-4 shadow-2xl">
            {/* Header with Tab switcher */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#121212] p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setCalcTab("percentage")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    calcTab === "percentage"
                      ? "bg-purple-600 text-white shadow-sm"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Percentage (%)
                </button>
                <button
                  onClick={() => setCalcTab("standard")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    calcTab === "standard"
                      ? "bg-purple-600 text-white shadow-sm"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Standard
                </button>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab 1: Percentage Calculator */}
            {calcTab === "percentage" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Total Amount ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 5000"
                    value={pctAmount}
                    onChange={(e) => setPctAmount(e.target.value)}
                    className="w-full px-3 py-2 text-base font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#121212] text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Percentage Rate (%)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="e.g. 15"
                      value={pctPercent}
                      onChange={(e) => setPctPercent(e.target.value)}
                      className="w-full px-3 py-2 text-base font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#121212] text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                    <span className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold">%</span>
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
                            : "border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121212] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        {p}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Calculation Results Card */}
                {calculatedPercentage ? (
                  <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-purple-700 dark:text-purple-300 font-medium">{pctPercent}% Value:</span>
                      <span className="text-base font-black text-slate-900 dark:text-white">
                        {formatMoney(calculatedPercentage.percentValue)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs border-t border-purple-200 dark:border-purple-900/50 pt-2">
                      <span className="text-slate-500 dark:text-slate-400">Total with Margin (+):</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {formatMoney(calculatedPercentage.totalWithAdd)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs border-t border-purple-200 dark:border-purple-900/50 pt-2">
                      <span className="text-slate-500 dark:text-slate-400">Total with Discount (-):</span>
                      <span className="font-bold text-rose-600 dark:text-rose-400">
                        {formatMoney(calculatedPercentage.totalWithDiscount)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                    Enter amount and percentage to compute margin
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPctAmount("");
                      setPctPercent("");
                    }}
                    className="w-full py-2 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                  >
                    Clear Fields
                  </button>
                </div>
              </div>
            )}

            {/* Tab 2: Standard Calculator */}
            {calcTab === "standard" && (
              <div className="space-y-3">
                {/* Display */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-slate-800 text-right">
                  <span className="text-xs text-slate-400 block h-4 truncate">{calcEquation}</span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white block truncate">{calcDisplay}</span>
                </div>

                {/* Keypad */}
                <div className="grid grid-cols-4 gap-2">
                  {["C", "/", "*", "-"].map((op) => (
                    <button
                      key={op}
                      onClick={() => handleCalcButton(op)}
                      className="py-3 rounded-xl bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-bold hover:bg-purple-200 dark:hover:bg-purple-900/60 transition"
                    >
                      {op}
                    </button>
                  ))}
                  {["7", "8", "9", "+"].map((k) => (
                    <button
                      key={k}
                      onClick={() => handleCalcButton(k)}
                      className={`py-3 rounded-xl font-bold transition ${
                        k === "+"
                          ? "bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-200"
                          : "bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700"
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
                        k === "="
                          ? "bg-purple-600 text-white hover:bg-purple-500 row-span-2 flex items-center justify-center shadow-md"
                          : "bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      {k}
                    </button>
                  ))}
                  {["1", "2", "3"].map((k) => (
                    <button
                      key={k}
                      onClick={() => handleCalcButton(k)}
                      className="py-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-white font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                    >
                      {k}
                    </button>
                  ))}
                  {["0", "."].map((k) => (
                    <button
                      key={k}
                      onClick={() => handleCalcButton(k)}
                      className="py-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-white font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition col-span-1"
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
