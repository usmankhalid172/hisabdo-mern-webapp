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
import { AddIncomeForm } from "@/components/transactions/AddIncomeForm";
import { AddExpenseForm } from "@/components/transactions/AddExpenseForm";
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

  // Core Data States
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [ledgerTransactions, setLedgerTransactions] = useState<LedgerTransaction[]>([]);
  const [customerBalances, setCustomerBalances] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Active Modals & Tabs
  const [activeModal, setActiveModal] = useState<"income" | "expense" | "customer" | "calculator" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [txFilter, setTxFilter] = useState<"all" | "income" | "expense">("all");

  // Form State: Add Customer / Khata Modal
  const [formCustomer, setFormCustomer] = useState({
    name: "",
    phone: "",
    opening_balance: 0,
    address: "",
  });

  // Calculator State
  const [calcTab, setCalcTab] = useState<"percentage" | "standard">("percentage");
  const [pctAmount, setPctAmount] = useState<string>("");
  const [pctPercent, setPctPercent] = useState<string>("");
  const [calcDisplay, setCalcDisplay] = useState<string>("0");
  const [calcEquation, setCalcEquation] = useState<string>("");

  // Load all core ledger data from hisabDoService
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      const userId = user?.id || "guest";

      const [cList, iList, eList, ledger] = await Promise.all([
        hisabDoService.getCustomers(userId),
        hisabDoService.getIncomes(userId),
        hisabDoService.getExpenses(userId),
        hisabDoService.getLedgerTransactions(userId).catch(() => []),
      ]);

      setCustomers(cList || []);
      setIncomes(iList || []);
      setExpenses(eList || []);
      setLedgerTransactions(ledger || []);

      // Calculate customer khata balances directly from ledger
      const balances: Record<string, number> = {};
      (cList || []).forEach((c) => {
        balances[c.id] = Number(c.opening_balance || 0);
      });

      (ledger || []).forEach((tx) => {
        const cId = tx.customerId || (tx as any).customer_id;
        if (cId && balances[cId] !== undefined) {
          const type = tx.type as string;
          if (type === "payment_received" || type === "credit" || type === "received") {
            balances[cId] -= Number(tx.amount || 0);
          } else if (type === "payment_sent" || type === "debit" || type === "paid") {
            balances[cId] += Number(tx.amount || 0);
          }
        }
      });

      setCustomerBalances(balances);
    } catch (err: any) {
      console.error("Failed to load dashboard data:", err);
      setLoadError(err?.message || "Failed to sync merchant ledger. Please click retry.");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Compute Master Financial Totals
  const totalIncome = useMemo(() => {
    return incomes.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  }, [incomes]);

  const totalExpense = useMemo(() => {
    return expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  }, [expenses]);

  const totalProfit = useMemo(() => {
    return totalIncome - totalExpense;
  }, [totalIncome, totalExpense]);

  // Compute Store Metrics & Summary
  const metrics = useMemo(() => {
    let totalReceivable = 0;
    let totalPayable = 0;

    Object.values(customerBalances).forEach((bal) => {
      if (bal > 0) totalReceivable += bal;
      if (bal < 0) totalPayable += Math.abs(bal);
    });

    return {
      totalReceivable,
      totalPayable,
      netKhataWorth: totalReceivable - totalPayable,
      totalCustomers: customers.length,
      totalTransactions: incomes.length + expenses.length + ledgerTransactions.length,
    };
  }, [customerBalances, customers, incomes, expenses, ledgerTransactions]);

  const isDataEmpty = useMemo(() => {
    return (
      !isLoading &&
      incomes.length === 0 &&
      expenses.length === 0 &&
      customers.length === 0 &&
      ledgerTransactions.length === 0
    );
  }, [isLoading, incomes, expenses, customers, ledgerTransactions]);

  // Handle Quick Add Customer Submission
  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCustomer.name.trim()) return;
    setSubmitting(true);
    try {
      const userId = user?.id || "guest";
      await hisabDoService.addCustomer(userId, {
        name: formCustomer.name.trim(),
        phone: formCustomer.phone.trim(),
        opening_balance: Number(formCustomer.opening_balance || 0),
        currency: "PKR",
        address: formCustomer.address.trim(),
      });
      setFormCustomer({ name: "", phone: "", opening_balance: 0, address: "" });
      setActiveModal(null);
      await loadData();
    } catch (err) {
      console.error("Error creating customer:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Calculator Logic
  const calculatedPercentage = useMemo(() => {
    const amt = parseFloat(pctAmount);
    const pct = parseFloat(pctPercent);
    if (isNaN(amt) || isNaN(pct)) return null;
    const percentValue = (amt * pct) / 100;
    const totalWithAdd = amt + percentValue;
    const totalWithDiscount = amt - percentValue;
    return { percentValue, totalWithAdd, totalWithDiscount };
  }, [pctAmount, pctPercent]);

  const handleCalcButton = (val: string) => {
    if (val === "C") {
      setCalcDisplay("0");
      setCalcEquation("");
      return;
    }
    if (val === "=") {
      try {
        // Safe evaluation of basic math expressions
        const sanitized = calcEquation.replace(/[^0-9+\-*/.]/g, "");
        // eslint-disable-next-line no-eval
        const result = Function(`'use strict'; return (${sanitized})`)();
        setCalcDisplay(String(result));
        setCalcEquation(String(result));
      } catch {
        setCalcDisplay("Error");
      }
      return;
    }
    if (["+", "-", "*", "/"].includes(val)) {
      setCalcEquation((prev) => prev + " " + val + " ");
      setCalcDisplay(val);
      return;
    }
    if (calcDisplay === "0" || ["+", "-", "*", "/"].includes(calcDisplay)) {
      setCalcDisplay(val);
    } else {
      setCalcDisplay((prev) => prev + val);
    }
    setCalcEquation((prev) => prev + val);
  };

  // Combined & unified transaction history for live feed
  const recentTransactions = useMemo(() => {
    const customerMap = new Map(customers.map((c) => [c.id, c.name]));

    const incomeRows = incomes.map((inc) => ({
      id: inc.id || inc.client_uuid || Math.random().toString(),
      type: "income" as const,
      amount: Number(inc.amount || 0),
      date: inc.income_date || inc.created_at || new Date().toISOString(),
      title: inc.description || "Counter Sale",
      category: inc.category_id || "Sales",
      customerId: inc.customer_id,
      customerName: inc.customer_id ? customerMap.get(inc.customer_id) || "" : "",
    }));

    const expenseRows = expenses.map((exp) => ({
      id: exp.id || exp.client_uuid || Math.random().toString(),
      type: "expense" as const,
      amount: Number(exp.amount || 0),
      date: exp.expense_date || exp.created_at || new Date().toISOString(),
      title: exp.description || "Business Outgoing",
      category: exp.category_id || "General",
      customerId: exp.customer_id,
      customerName: exp.customer_id ? customerMap.get(exp.customer_id) || "" : "",
    }));

    return [...incomeRows, ...expenseRows]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  }, [incomes, expenses, customers]);

  // Top Debtors (Customers with positive balances: owe money to merchant)
  const topDebtors = useMemo(() => {
    return customers
      .map((c) => ({
        ...c,
        balance: customerBalances[c.id] || 0,
      }))
      .filter((c) => c.balance > 0)
      .sort((a, b) => b.balance - a.balance)
      .slice(0, 5);
  }, [customers, customerBalances]);

  // Filtered transactions for the desktop table
  const filteredTransactions = useMemo(() => {
    if (txFilter === "income") {
      return recentTransactions.filter((t) => (t.type as string) === "income" || (t.type as string) === "payment_received");
    }
    if (txFilter === "expense") {
      return recentTransactions.filter((t) => (t.type as string) === "expense" || (t.type as string) === "payment_sent");
    }
    return recentTransactions;
  }, [recentTransactions, txFilter]);

  // Cash flow ratio
  const cashflowPercentage = totalIncome > 0 ? Math.min(100, Math.round((totalProfit / totalIncome) * 100)) : 0;
  const expenseRatio = totalIncome > 0 ? Math.min(100, Math.round((totalExpense / totalIncome) * 100)) : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* ================= 1. REBUILT MODERN HEADER & QUICK ACTIONS (MERGED DESIGN SYSTEM) ================= */}
      <div className="pb-2 border-b border-border">
        <PageHeading
          title="Dashboard"
          description="Real-time merchant ledger, cash flow performance, and customer khata balances."
          action={
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="green" className="hidden sm:inline-flex">
                Live Cloud Sync
              </Badge>

              {/* Date Indicator */}
              <div className="flex items-center gap-1.5 ps-3 pe-3 py-2 rounded-control bg-surface border border-border text-xs font-semibold text-foreground shadow-card">
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
                  <span className="text-xs font-bold text-muted-foreground">
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
                  <p className="text-[11px] text-muted-foreground mt-1 truncate">
                    {incomes.length === 0 ? "No sales recorded yet" : `${incomes.length} sales & receipts`}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border text-[11px]">
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
                  <span className="text-xs font-bold text-muted-foreground">
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
                  <p className="text-[11px] text-muted-foreground mt-1 truncate">
                    {expenses.length === 0 ? "No expenses recorded yet" : `${expenses.length} operating bills`}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border text-[11px]">
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
                  <span className="text-xs font-bold text-muted-foreground">
                    Profit (Nafa)
                  </span>
                  <div className={`p-2 rounded-control ${totalProfit >= 0 ? "bg-success/10 text-success" : "bg-danger/10 text-danger"} shrink-0`}>
                    {totalProfit >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  </div>
                </div>
                <div className="mt-2.5">
                  <h3 className={`text-xl xl:text-2xl font-black tracking-tight ${totalProfit >= 0 ? "text-foreground" : "text-danger"}`}>
                    {formatMoney(totalProfit)}
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-1 truncate">
                    {incomes.length === 0 && expenses.length === 0
                      ? "Awaiting transactions"
                      : totalIncome > 0
                      ? `${((totalProfit / totalIncome) * 100).toFixed(1)}% operating margin`
                      : "Income minus expenses"}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border text-[11px]">
                <Badge variant={totalProfit >= 0 ? "green" : "red"}>
                  {totalProfit >= 0 ? "Net Positive" : "Deficit"}
                </Badge>
                <span className="text-muted-foreground text-[10px] truncate">
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
                  <span className="text-xs font-bold text-muted-foreground">
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
                  <p className="text-[11px] text-muted-foreground mt-1 truncate">
                    {metrics.totalReceivable === 0
                      ? "No pending receivables"
                      : `${customers.length} customer accounts`}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border text-[11px]">
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
                  <span className="text-xs font-bold text-muted-foreground">
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
                  <p className="text-[11px] text-muted-foreground mt-1 truncate">
                    {metrics.totalPayable === 0
                      ? "No pending payables"
                      : "Supplier & vendor liabilities"}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border text-[11px]">
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
          <Card className="p-6 rounded-card border border-border bg-surface text-foreground shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold tracking-tight text-foreground flex items-center gap-2">
                  <Activity className="w-4 h-4 text-success" />
                  Store Cash Flow &amp; Operating Margin
                </h3>
                <p className="text-xs text-muted-foreground">
                  Revenue retention ratio and operational expenditure balance.
                </p>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-xs font-semibold text-muted-foreground">Margin:</span>
                <span className="text-xs font-black text-success px-2 py-0.5 rounded-control bg-success/10 border border-success/20">
                  {totalIncome > 0 ? `${((totalProfit / totalIncome) * 100).toFixed(1)}%` : "0%"}
                </span>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="space-y-1.5">
              <div className="h-3 w-full rounded-full bg-surface-muted overflow-hidden flex">
                <div
                  style={{ width: `${Math.max(5, 100 - expenseRatio)}%` }}
                  className="h-full bg-success transition-all duration-500"
                  title={`Net Margin: ${100 - expenseRatio}%`}
                />
                <div
                  style={{ width: `${Math.min(95, expenseRatio)}%` }}
                  className="h-full bg-danger transition-all duration-500"
                  title={`Expense Ratio: ${expenseRatio}%`}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground px-0.5">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-success" />
                  Net Profit ({totalIncome > 0 ? Math.max(0, 100 - expenseRatio) : 0}%)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-danger" />
                  Operating Costs ({expenseRatio}%)
                </span>
              </div>
            </div>

            {/* Sub-Metrics Cards */}
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border">
              <div className="p-3 rounded-control bg-surface-muted border border-border text-center">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Total Sales</span>
                <span className="text-sm font-bold text-foreground mt-0.5 block truncate">
                  {formatMoney(totalIncome)}
                </span>
              </div>
              <div className="p-3 rounded-control bg-surface-muted border border-border text-center">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Total Outgoings</span>
                <span className="text-sm font-bold text-foreground mt-0.5 block truncate">
                  {formatMoney(totalExpense)}
                </span>
              </div>
              <div className="p-3 rounded-control bg-surface-muted border border-border text-center">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Active Parties</span>
                <span className="text-sm font-bold text-primary mt-0.5 block">
                  {customers.length} Accounts
                </span>
              </div>
            </div>
          </Card>

          {/* Desktop-Grade Recent Transactions Table */}
          <Card className="p-6 rounded-card border border-border bg-surface text-foreground shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-base font-bold tracking-tight text-foreground">
                  Recent Ledger Activity
                </h3>
                <p className="text-xs text-muted-foreground">
                  Latest commercial sales, expenses, and khata adjustments.
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 p-1 rounded-control bg-surface-muted border border-border self-start sm:self-auto">
                <button
                  onClick={() => setTxFilter("all")}
                  className={`px-2.5 py-1 rounded-control text-xs font-semibold transition ${
                    txFilter === "all"
                      ? "bg-surface text-foreground shadow-card"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  All ({recentTransactions.length})
                </button>
                <button
                  onClick={() => setTxFilter("income")}
                  className={`px-2.5 py-1 rounded-control text-xs font-semibold transition ${
                    txFilter === "income"
                      ? "bg-success text-white shadow-card"
                      : "text-muted-foreground hover:text-success"
                  }`}
                >
                  Income
                </button>
                <button
                  onClick={() => setTxFilter("expense")}
                  className={`px-2.5 py-1 rounded-control text-xs font-semibold transition ${
                    txFilter === "expense"
                      ? "bg-danger text-white shadow-card"
                      : "text-muted-foreground hover:text-danger"
                  }`}
                >
                  Expenses
                </button>
              </div>
            </div>

            {/* Table Content */}
            {filteredTransactions.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground text-sm">
                <Receipt className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No transactions match the selected filter.</p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-6 px-6">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                      <th className="pb-3 pr-4">Date</th>
                      <th className="pb-3 px-4">Transaction / Description</th>
                      <th className="pb-3 px-4">Party / Account</th>
                      <th className="pb-3 px-4">Category</th>
                      <th className="pb-3 pl-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border font-medium">
                    {filteredTransactions.map((tx) => {
                      const isIncome = (tx.type as string) === "income" || (tx.type as string) === "payment_received";
                      return (
                        <tr
                          key={tx.id}
                          className="hover:bg-surface-muted/60 transition-colors group"
                        >
                          <td className="py-3.5 pr-4 text-muted-foreground whitespace-nowrap">
                            {new Date(tx.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-foreground max-w-[200px] truncate">
                            {tx.title}
                          </td>
                          <td className="py-3.5 px-4 text-foreground/90 max-w-[160px] truncate">
                            {tx.customerId ? (
                              <Link
                                href={`/customers/${tx.customerId}`}
                                className="hover:text-primary hover:underline inline-flex items-center gap-1"
                              >
                                {tx.customerName}
                              </Link>
                            ) : (
                              tx.customerName && tx.customerName !== "Direct Sale" && tx.customerName !== "Business Expense" ? (
                                <span>{tx.customerName}</span>
                              ) : null
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="inline-block px-2 py-0.5 rounded-control text-[10px] font-semibold bg-surface-muted text-muted-foreground border border-border">
                              {tx.category}
                            </span>
                          </td>
                          <td className="py-3.5 pl-4 text-right whitespace-nowrap">
                            <span
                              className={`font-black text-sm ${
                                isIncome ? "text-success" : "text-danger"
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
            <div className="pt-3 border-t border-border flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Showing {filteredTransactions.length} of {metrics.totalTransactions} total entries
              </span>
              <Link
                href="/transactions"
                className="text-xs font-bold text-success hover:underline flex items-center gap-1"
              >
                <span>Full Ledger Explorer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </Card>
        </div>

        {/* Right Column (4 of 12): Fast Action Drawer & Top Khata Debtors */}
        <div className="lg:col-span-4 space-y-6">
          {/* Rebuilt Fast Actions & Entries Launcher Panel (Merged Card Component) */}
          <Card className="p-5 rounded-card border border-border bg-surface text-foreground shadow-card space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
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
                <div className="font-bold text-xs text-foreground">Add Income</div>
                <div className="text-[10px] text-muted-foreground">Counter Sale</div>
              </button>

              <button
                type="button"
                onClick={() => setActiveModal("expense")}
                className="p-3.5 rounded-control border border-danger/20 bg-danger/5 hover:bg-danger/10 text-start transition group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
              >
                <div className="w-8 h-8 rounded-control bg-danger/15 text-danger flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <MinusCircle className="w-4 h-4" />
                </div>
                <div className="font-bold text-xs text-foreground">Add Expense</div>
                <div className="text-[10px] text-muted-foreground">Bills &amp; Rent</div>
              </button>

              <button
                type="button"
                onClick={() => setActiveModal("customer")}
                className="p-3.5 rounded-control border border-primary/20 bg-primary/5 hover:bg-primary/10 text-start transition group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <div className="w-8 h-8 rounded-control bg-primary/15 text-primary flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <Users className="w-4 h-4" />
                </div>
                <div className="font-bold text-xs text-foreground">New Party</div>
                <div className="text-[10px] text-muted-foreground">Add Customer</div>
              </button>

              <button
                type="button"
                onClick={() => setActiveModal("calculator")}
                className="p-3.5 rounded-control border border-warning/20 bg-warning/5 hover:bg-warning/10 text-start transition group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning"
              >
                <div className="w-8 h-8 rounded-control bg-warning/15 text-warning flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <Percent className="w-4 h-4" />
                </div>
                <div className="font-bold text-xs text-foreground">Calculator</div>
                <div className="text-[10px] text-muted-foreground">Profit &amp; %</div>
              </button>
            </div>
          </Card>

          {/* Top Khata Debtors Panel (Direct WhatsApp Reminders) */}
          <Card className="p-5 rounded-card border border-border bg-surface text-foreground shadow-card space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold tracking-tight text-foreground">
                  Top Khata Debtors
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Parties with largest receivable balance
                </p>
              </div>
              <Link
                href="/customers"
                className="text-xs font-bold text-primary hover:underline"
              >
                View All
              </Link>
            </div>

            {topDebtors.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground text-xs">
                <Users className="w-6 h-6 mx-auto mb-1.5 opacity-50" />
                <p>No outstanding customer balances.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
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
                        <div className="w-8 h-8 rounded-control bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                          {debtor.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/customers/${debtor.id}`}
                            className="font-bold text-xs text-foreground hover:underline block truncate"
                          >
                            {debtor.name}
                          </Link>
                          <span className="text-[10px] text-muted-foreground block truncate">
                            {debtor.phone || "No phone"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-bold text-xs text-success">
                          {formatMoney(debtor.balance)}
                        </span>
                        {debtor.phone && (
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-control bg-success/10 hover:bg-success/20 text-success transition"
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
          </Card>

          {/* Quick Accounting Summary Card */}
          <Card className="p-5 rounded-card border border-border bg-surface text-foreground shadow-card space-y-2">
            <span className="text-[11px] font-bold text-primary uppercase tracking-wider block">
              Business Health Summary
            </span>
            <p className="text-xs text-foreground/80">
              Total of <strong>{metrics.totalCustomers}</strong> registered customer accounts with <strong>{metrics.totalTransactions}</strong> lifetime ledger transactions.
            </p>
            <div className="pt-2 flex items-center gap-3 text-xs text-muted-foreground">
              <span>Currency: <strong>{currencySymbol} (PKR)</strong></span>
              <span>&bull;</span>
              <span>Ledger: <strong>Double-entry Parity</strong></span>
            </div>
          </Card>
        </div>
      </div>

      {/* ================= MODALS (FULLY THEMED) ================= */}

      {/* Reusable Add Income Form */}
      <AddIncomeForm
        isOpen={activeModal === "income"}
        onClose={() => setActiveModal(null)}
        onSuccess={loadData}
        customers={customers}
      />

      {/* Reusable Add Expense Form */}
      <AddExpenseForm
        isOpen={activeModal === "expense"}
        onClose={() => setActiveModal(null)}
        onSuccess={loadData}
        customers={customers}
      />

      {/* Modal 3: Add Customer Modal */}
      {activeModal === "customer" && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-card border border-border bg-surface text-foreground p-6 space-y-4 shadow-dialog">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-primary flex items-center gap-2">
                <Users className="w-5 h-5" /> Add Customer / Khata Account
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-control transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomer} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Customer / Business Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Muhammad Ahmad"
                  value={formCustomer.name}
                  onChange={(e) => setFormCustomer({ ...formCustomer, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-control border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Phone Number (for WhatsApp Reminders)
                </label>
                <input
                  type="tel"
                  placeholder="03001234567"
                  value={formCustomer.phone}
                  onChange={(e) => setFormCustomer({ ...formCustomer, phone: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-control border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Opening Balance ({currencySymbol})
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="0.00"
                  value={formCustomer.opening_balance || ""}
                  onChange={(e) => setFormCustomer({ ...formCustomer, opening_balance: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm rounded-control border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <span className="text-[10px] text-muted-foreground mt-1 block">
                  Positive = Customer owes you (Lene). Negative = You owe customer (Dene).
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Shop Address / Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Shop # 12, Main Market"
                  value={formCustomer.address}
                  onChange={(e) => setFormCustomer({ ...formCustomer, address: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-control border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setActiveModal(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={submitting}
                  className="flex-1"
                >
                  Save Party
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Retail & Percentage Calculator Modal */}
      {activeModal === "calculator" && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-card border border-border bg-surface text-foreground p-5 space-y-4 shadow-dialog">
            {/* Header with Tab switcher */}
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-1 bg-surface-muted p-1 rounded-control border border-border">
                <button
                  type="button"
                  onClick={() => setCalcTab("percentage")}
                  className={`px-3 py-1 rounded-control text-xs font-bold transition ${
                    calcTab === "percentage"
                      ? "bg-primary text-white shadow-card"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Percentage (%)
                </button>
                <button
                  type="button"
                  onClick={() => setCalcTab("standard")}
                  className={`px-3 py-1 rounded-control text-xs font-bold transition ${
                    calcTab === "standard"
                      ? "bg-primary text-white shadow-card"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Standard
                </button>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-control transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab 1: Percentage Calculator */}
            {calcTab === "percentage" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Total Amount ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 5000"
                    value={pctAmount}
                    onChange={(e) => setPctAmount(e.target.value)}
                    className="w-full px-3 py-2 text-base font-bold rounded-control border border-border bg-surface text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Percentage Rate (%)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="e.g. 15"
                      value={pctPercent}
                      onChange={(e) => setPctPercent(e.target.value)}
                      className="w-full px-3 py-2 text-base font-bold rounded-control border border-border bg-surface text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <span className="p-2.5 rounded-control bg-primary/10 text-primary font-bold">%</span>
                  </div>

                  {/* Preset chips */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {["5", "10", "15", "18", "20", "25"].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPctPercent(p)}
                        className={`px-2.5 py-1 rounded-control text-xs font-bold border transition ${
                          pctPercent === p
                            ? "bg-primary text-white border-primary"
                            : "border-border bg-surface text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {p}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Calculation Results Card */}
                {calculatedPercentage ? (
                  <div className="p-4 rounded-control bg-surface-muted border border-border space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-foreground font-medium">{pctPercent}% Value:</span>
                      <span className="text-base font-black text-foreground">
                        {formatMoney(calculatedPercentage.percentValue)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs border-t border-border pt-2">
                      <span className="text-muted-foreground">Total with Margin (+):</span>
                      <span className="font-bold text-success">
                        {formatMoney(calculatedPercentage.totalWithAdd)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs border-t border-border pt-2">
                      <span className="text-muted-foreground">Total with Discount (-):</span>
                      <span className="font-bold text-danger">
                        {formatMoney(calculatedPercentage.totalWithDiscount)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-control bg-surface-muted border border-border text-center text-xs text-muted-foreground">
                    Enter amount and percentage to compute margin
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setPctAmount("");
                      setPctPercent("");
                    }}
                    className="w-full"
                  >
                    Clear Fields
                  </Button>
                </div>
              </div>
            )}

            {/* Tab 2: Standard Calculator */}
            {calcTab === "standard" && (
              <div className="space-y-3">
                {/* Display */}
                <div className="p-3 rounded-control bg-surface-muted border border-border text-right">
                  <span className="text-xs text-muted-foreground block h-4 truncate">{calcEquation}</span>
                  <span className="text-2xl font-black text-foreground block truncate">{calcDisplay}</span>
                </div>

                {/* Keypad */}
                <div className="grid grid-cols-4 gap-2">
                  {["C", "/", "*", "-"].map((op) => (
                    <button
                      key={op}
                      type="button"
                      onClick={() => handleCalcButton(op)}
                      className="py-3 rounded-control bg-primary/10 text-primary font-bold hover:bg-primary/20 transition"
                    >
                      {op}
                    </button>
                  ))}
                  {["7", "8", "9", "+"].map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => handleCalcButton(k)}
                      className={`py-3 rounded-control font-bold transition ${
                        k === "+"
                          ? "bg-primary/10 text-primary hover:bg-primary/20"
                          : "bg-surface-muted text-foreground hover:bg-surface-muted/80 border border-border"
                      }`}
                    >
                      {k}
                    </button>
                  ))}
                  {["4", "5", "6", "="].map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => handleCalcButton(k)}
                      className={`py-3 rounded-control font-bold transition ${
                        k === "="
                          ? "bg-primary text-white hover:bg-primary-hover row-span-2 flex items-center justify-center shadow-card font-bold"
                          : "bg-surface-muted text-foreground hover:bg-surface-muted/80 border border-border"
                      }`}
                    >
                      {k}
                    </button>
                  ))}
                  {["1", "2", "3"].map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => handleCalcButton(k)}
                      className="py-3 rounded-control bg-surface-muted text-foreground font-bold hover:bg-surface-muted/80 border border-border transition"
                    >
                      {k}
                    </button>
                  ))}
                  {["0", "."].map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => handleCalcButton(k)}
                      className="py-3 rounded-control bg-surface-muted text-foreground font-bold hover:bg-surface-muted/80 border border-border transition col-span-1"
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
