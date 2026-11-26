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
  Calendar,
  CreditCard,
  PlusCircle,
  MinusCircle,
  Percent,
  MessageCircle,
  ArrowRight,
  Calculator,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/design-system/Card";
import { PageHeading } from "@/components/ui/design-system/PageHeading";
import { LoadingState } from "@/components/ui/design-system/LoadingState";
import { EmptyState } from "@/components/ui/design-system/EmptyState";
import { ErrorState } from "@/components/ui/design-system/ErrorState";
import { IncomeExpenseChart, type ChartDataPoint } from "@/components/dashboard/IncomeExpenseChart";
import { RecentActivity, type RecentActivityTransaction } from "@/components/dashboard/RecentActivity";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import {
  hisabDoService,
  Customer,
  Income,
  Expense,
} from "@/services/hisabdoService";
import { AddIncomeForm } from "@/components/transactions/AddIncomeForm";
import { AddExpenseForm } from "@/components/transactions/AddExpenseForm";

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { formatMoney, currencySymbol, businessProfile } = useSettings();

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
  const [recentTransactions, setRecentTransactions] = useState<RecentActivityTransaction[]>([]);

  // Modals state: Add Income, Add Expense, Add Customer & Calculator modals
  const [activeModal, setActiveModal] = useState<"income" | "expense" | "customer" | "calculator" | null>(null);

  // Form states
  const [formCustomer, setFormCustomer] = useState({
    name: "",
    phone: "",
    opening_balance: 0,
    notes: "",
    address: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Calculator Modal States
  const [calcTab, setCalcTab] = useState<"standard" | "percentage">("percentage");
  const [calcDisplay, setCalcDisplay] = useState("0");
  const [calcEquation, setCalcEquation] = useState("");
  // Percentage Calculator States
  const [pctAmount, setPctAmount] = useState("");
  const [pctPercent, setPctPercent] = useState("");

  const handleAddIncome = () => {
    setActiveModal("income");
  };

  const handleAddExpense = () => {
    setActiveModal("expense");
  };

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
        hisabDoService.getLedgerTransactions(userId).catch(() => []),
      ]);

      setMetrics(m);
      setCustomers(custs);
      setIncomes(incs);
      setExpenses(exps);

      // Compute running balances for top customer cards
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

      // Build unified recent transactions list for RecentActivity component
      const combined: RecentActivityTransaction[] = [];
      incs.forEach((i) => {
        const c = custs.find((cust) => cust.id === i.customer_id);
        combined.push({
          id: i.id,
          date: i.income_date,
          type: "income",
          description: i.description || "Counter Sale",
          customerName: c?.name || "Counter Customer",
          amount: Number(i.amount),
        });
      });

      exps.forEach((e) => {
        const c = custs.find((cust) => cust.id === e.customer_id);
        const customerName = c?.name;
        if (!customerName || (customerName !== "Direct Sale" && customerName !== "Business Expense")) {
          combined.push({
            id: e.id,
            date: e.expense_date,
            type: "expense",
            description: e.description || "Expense Record",
            customerName,
            amount: Number(e.amount),
          });
        }
      });

      pmts.forEach((p) => {
        const c = custs.find((cust) => cust.id === p.customerId);
        combined.push({
          id: p.id,
          date: p.date,
          type: p.type === "received" ? "payment_received" : "payment_sent",
          description: p.note || (p.type === "received" ? "Khata Payment Received" : "Khata Payment Sent"),
          customerName: c?.name || "Khata Party",
          amount: Number(p.amount),
        });
      });

      combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRecentTransactions(
        combined.filter(
          (tx) => tx.customerName !== "Direct Sale" && tx.customerName !== "Business Expense"
        )
      );
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

  // Generate chart data for the IncomeExpenseChart component (last 6 months)
  const chartData = useMemo<ChartDataPoint[]>(() => {
    const months: { key: string; period: string; income: number; expense: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const period = d.toLocaleDateString("en-US", { month: "short" });
      months.push({ key, period, income: 0, expense: 0 });
    }

    incomes.forEach((inc) => {
      const d = new Date(inc.income_date);
      if (!isNaN(d.getTime())) {
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        const match = months.find((m) => m.key === key);
        if (match) {
          match.income += Number(inc.amount) || 0;
        }
      }
    });

    expenses.forEach((exp) => {
      const d = new Date(exp.expense_date);
      if (!isNaN(d.getTime())) {
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        const match = months.find((m) => m.key === key);
        if (match) {
          match.expense += Number(exp.amount) || 0;
        }
      }
    });

    const hasData = months.some((m) => m.income > 0 || m.expense > 0);
    if (!hasData && incomes.length === 0 && expenses.length === 0) {
      return [];
    }

    return months.map(({ period, income, expense }) => ({
      period,
      income,
      expense,
    }));
  }, [incomes, expenses]);

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

      {/* ================= 2. 5 SUMMARY CARDS (MERGED DESIGN SYSTEM) ================= */}
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
        {/* Left Column (8 of 12): Chart + Recent Activity */}
        <div className="lg:col-span-8 space-y-6">
          {/* Income vs Expense Chart (Merged Design System Component) */}
          <IncomeExpenseChart
            data={chartData}
            loading={isLoading}
            error={loadError}
            onRetry={loadData}
            title="Income vs Expense"
            currency={currencySymbol || "PKR"}
          />

          {/* Recent Activity (Merged Design System Component) */}
          <RecentActivity
            transactions={recentTransactions}
            formatMoney={formatMoney}
            isLoading={isLoading}
            error={loadError}
            onRetry={loadData}
            limit={8}
          />
        </div>

        {/* Right Column (4 of 12): Fast Action Drawer & Top Khata Debtors */}
        <div className="lg:col-span-4 space-y-6">
          {/* Fast Actions & Entries Launcher Panel (Merged Card Component) */}
          <Card className="p-5 rounded-card shadow-card space-y-3.5">
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
          <Card className="p-5 rounded-card shadow-card space-y-3.5">
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

            {isLoading ? (
              <LoadingState variant="skeleton" message="Loading khata debtors..." />
            ) : loadError ? (
              <ErrorState
                title="Unable to load debtors"
                message={loadError}
                onRetry={loadData}
              />
            ) : topDebtors.length === 0 ? (
              <EmptyState
                title="No outstanding balances"
                message="No customers have pending receivables."
              />
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
          <Card className="p-5 rounded-card shadow-card bg-primary/5 border border-primary/20 space-y-2">
            <span className="text-[11px] font-bold text-primary uppercase tracking-wider block">
              Business Health Summary
            </span>
            {isLoading ? (
              <LoadingState variant="skeleton" message="Loading summary..." />
            ) : (
              <>
                <p className="text-xs text-muted-foreground">
                  Total of <strong className="text-foreground">{metrics.totalCustomers}</strong> registered customer accounts with <strong className="text-foreground">{metrics.totalTransactions}</strong> lifetime ledger transactions.
                </p>
                <div className="pt-2 flex items-center gap-3 text-xs text-muted-foreground border-t border-border">
                  <span>Currency: <strong className="text-foreground">{currencySymbol} (PKR)</strong></span>
                  <span>&bull;</span>
                  <span>Ledger: <strong className="text-foreground">Double-entry Parity</strong></span>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>

      {/* ================= MODALS (FULLY THEMED WITH DESIGN SYSTEM TOKENS) ================= */}

      {/* Modal 1: Standardized Add Income Modal */}
      {activeModal === "income" && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <AddIncomeForm
            isOpen={activeModal === "income"}
            onSuccess={async () => {
              setActiveModal(null);
              await loadData();
            }}
            onClose={() => setActiveModal(null)}
            onCancel={() => setActiveModal(null)}
          />
        </div>
      )}

      {/* Modal 2: Standardized Add Expense Modal */}
      {activeModal === "expense" && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <AddExpenseForm
            isOpen={activeModal === "expense"}
            onSuccess={async () => {
              setActiveModal(null);
              await loadData();
            }}
            onClose={() => setActiveModal(null)}
            onCancel={() => setActiveModal(null)}
          />
        </div>
      )}

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
                  className="w-full px-3 py-2 text-sm rounded-control border border-border bg-surface text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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
                  className="w-full px-3 py-2 text-sm rounded-control border border-border bg-surface text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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
                  className="w-full px-3 py-2 text-sm rounded-control border border-border bg-surface text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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
                  className="w-full px-3 py-2 text-sm rounded-control border border-border bg-surface text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => setActiveModal(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={submitting}
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
                      ? "bg-primary text-white shadow-sm"
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
                      ? "bg-primary text-white shadow-sm"
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
                    className="w-full px-3 py-2 text-base font-bold rounded-control border border-border bg-surface-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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
                      className="w-full px-3 py-2 text-base font-bold rounded-control border border-border bg-surface-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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
                  <div className="p-4 rounded-control bg-primary/5 border border-primary/20 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-primary font-medium">{pctPercent}% Value:</span>
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
                <div className="p-3 rounded-control bg-surface-muted border border-border text-end">
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
