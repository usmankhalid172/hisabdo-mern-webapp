"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  BarChart3,
  TrendingDown,
  TrendingUp,
  Download,
  Calendar,
  FileSpreadsheet,
  PieChart as PieChartIcon,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Loader2,
  Filter,
  CheckCircle2,
  Receipt,
  Wallet,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import { hisabDoService, Income, Expense, Customer } from "@/services/hisabdoService";
import { subscriptionService } from "@/services/subscriptionService";
import { UpgradeProModal } from "@/components/UpgradeProModal";

export default function ReportsPage() {
  const { user } = useAuth();
  const { formatMoney, currencySymbol, theme, t, businessProfile } = useSettings();

  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  // Filters
  const [period, setPeriod] = useState<"all" | "monthly" | "weekly" | "yearly" | "custom">("monthly");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const userId = user?.id || "guest";
      const [incs, exps, custs] = await Promise.all([
        hisabDoService.getIncomes(userId),
        hisabDoService.getExpenses(userId),
        hisabDoService.getCustomers(userId),
      ]);
      setIncomes(incs);
      setExpenses(exps);
      setCustomers(custs);
    } catch (err) {
      console.error("Error loading report data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Date Filtering calculation
  const { filteredIncomes, filteredExpenses } = useMemo(() => {
    const now = new Date();

    const isMatch = (dateStr: string) => {
      if (period === "all") return true;
      const d = new Date(dateStr);
      if (period === "weekly") {
        const last7 = new Date();
        last7.setDate(now.getDate() - 7);
        return d >= last7;
      }
      if (period === "monthly") {
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }
      if (period === "yearly") {
        return d.getFullYear() === now.getFullYear();
      }
      if (period === "custom") {
        if (customStart && d < new Date(customStart)) return false;
        if (customEnd && d > new Date(customEnd)) return false;
        return true;
      }
      return true;
    };

    return {
      filteredIncomes: incomes.filter((i) => isMatch(i.income_date)),
      filteredExpenses: expenses.filter((e) => isMatch(e.expense_date)),
    };
  }, [incomes, expenses, period, customStart, customEnd]);

  // Overall P&L Metrics
  const totalIncome = filteredIncomes.reduce((sum, i) => sum + Number(i.amount), 0);
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const netProfit = totalIncome - totalExpenses;
  const totalFlow = totalIncome + totalExpenses;

  // Percentage calculations: (value / total) * 100
  const incomePercent = totalFlow > 0 ? Math.round((totalIncome / totalFlow) * 100) : 0;
  const expensePercent = totalFlow > 0 ? 100 - incomePercent : 0;

  // Category breakdown for expenses
  const expenseCategories = useMemo(() => {
    const map: Record<string, number> = {};
    filteredExpenses.forEach((e) => {
      const cat = e.category_id || "Other";
      map[cat] = (map[cat] || 0) + Number(e.amount);
    });
    return Object.entries(map).map(([name, amount]) => ({
      name,
      amount,
      percentage: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0,
    }));
  }, [filteredExpenses, totalExpenses]);

  // Category breakdown for income
  const incomeCategories = useMemo(() => {
    const map: Record<string, number> = {};
    filteredIncomes.forEach((i) => {
      const cat = i.category_id || "Sales";
      map[cat] = (map[cat] || 0) + Number(i.amount);
    });
    return Object.entries(map).map(([name, amount]) => ({
      name,
      amount,
      percentage: totalIncome > 0 ? Math.round((amount / totalIncome) * 100) : 0,
    }));
  }, [filteredIncomes, totalIncome]);

  // SVG Pie Chart Geometry
  const size = 220;
  const strokeWidth = 32;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const incomeStrokeDash = (incomePercent / 100) * circumference;
  const expenseStrokeDash = (expensePercent / 100) * circumference;

  // CSV Export
  const handleExportCSV = () => {
    const rows = [
      ["Date", "Type", "Category", "Description", "Amount", "Currency"],
      ...filteredIncomes.map((i) => [
        i.income_date,
        "Income",
        i.category_id || "Sales",
        `"${(i.description || "").replace(/"/g, '""')}"`,
        i.amount,
        currencySymbol,
      ]),
      ...filteredExpenses.map((e) => [
        e.expense_date,
        "Expense",
        e.category_id || "General",
        `"${(e.description || "").replace(/"/g, '""')}"`,
        e.amount,
        currencySymbol,
      ]),
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `HisabDo_Report_${period}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PDF Export
  const handleExportPDF = () => {
    const userId = user?.id || "guest";
    if (!subscriptionService.canPerform(userId, "summary_pdf")) {
      setUpgradeModalOpen(true);
      return;
    }

    const doc = new jsPDF();

    // Banner Header
    doc.setFillColor(26, 35, 126); // Brand Primary
    doc.rect(0, 0, 210, 36, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(businessProfile.businessName || "HisabDo Accounting Enterprise", 14, 18);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`FINANCIAL STATEMENT & PROFIT/LOSS REPORT (${period.toUpperCase()})`, 14, 26);
    doc.text(`Generated: ${new Date().toLocaleDateString()} | Currency: ${currencySymbol}`, 14, 32);

    // Summary Card Box
    doc.setFillColor(248, 249, 253);
    doc.roundedRect(14, 42, 182, 30, 3, 3, "F");

    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    doc.setFont("helvetica", "bold");
    doc.text("Total Income / Receivable:", 20, 52);
    doc.text(`${currencySymbol} ${totalIncome.toLocaleString()} (${incomePercent}%)`, 80, 52);

    doc.text("Total Operating Expenses:", 20, 60);
    doc.text(`${currencySymbol} ${totalExpenses.toLocaleString()} (${expensePercent}%)`, 80, 60);

    doc.text("Net Balance (Profit/Loss):", 125, 52);
    doc.setTextColor(netProfit >= 0 ? 0 : 229, netProfit >= 0 ? 150 : 57, netProfit >= 0 ? 80 : 53);
    doc.text(`${currencySymbol} ${netProfit.toLocaleString()}`, 125, 60);

    // Table Data
    const tableData = [
      ...filteredIncomes.map((i) => [
        i.income_date,
        "Income",
        i.category_id || "Sales",
        i.description || "Credit/Cash Sale",
        `+${currencySymbol} ${Number(i.amount).toLocaleString()}`,
      ]),
      ...filteredExpenses.map((e) => [
        e.expense_date,
        "Expense",
        e.category_id || "General",
        e.description || "Expense Record",
        `-${currencySymbol} ${Number(e.amount).toLocaleString()}`,
      ]),
    ];

    autoTable(doc, {
      startY: 80,
      head: [["Date", "Type", "Category", "Description", "Amount"]],
      body: tableData,
      headStyles: {
        fillColor: [26, 35, 126],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      alternateRowStyles: {
        fillColor: [248, 249, 253],
      },
    });

    doc.save(`HisabDo_Financial_Report_${period}.pdf`);
    subscriptionService.incrementUsage(userId, "summary_pdf");
  };

  const chartColors = ["#00E676", "#1565C0", "#F57C00", "#7C3AED", "#EC4899", "#3B82F6"];

  if (isLoading) {
    return (
      <div className="p-20 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        <p className="text-xs text-slate-500 dark:text-slate-400">Loading analytics &amp; financial reports...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Reports &amp; P&amp;L Analysis
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Visual Income vs. Expense distribution, cash flow ratios, and downloadable statements
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E1E1E] hover:bg-slate-50 dark:hover:bg-[#2A2A2A] text-slate-700 dark:text-slate-200 shadow-sm transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1A237E] hover:bg-[#0D47A1] text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-950/20 transition"
          >
            <Download className="w-4 h-4" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Date Period Filter Bar */}
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#18181B] flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Reporting Timeframe:</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(["all", "monthly", "weekly", "yearly", "custom"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition ${
                period === p
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-[#121212] border border-slate-200 dark:border-slate-800"
              }`}
            >
              {p === "all" ? "All Time" : p}
            </button>
          ))}
        </div>

        {period === "custom" && (
          <div className="flex items-center gap-2 text-xs">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-2.5 py-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#121212] text-slate-900 dark:text-white"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-2.5 py-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#121212] text-slate-900 dark:text-white"
            />
          </div>
        )}
      </div>

      {/* ================= 1. THE 3 SUMMARY CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Receivable (Income / Green) */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#18181B] shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold mb-2">
            <span>Receivable (Income / Wusooli)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {formatMoney(totalIncome)}
          </p>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
            <span>{filteredIncomes.length} sales entries</span>
            <span className="font-bold text-emerald-500">{incomePercent}% of total</span>
          </div>
        </div>

        {/* Payable (Expense / Red) */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#18181B] shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold mb-2">
            <span>Payable (Expense / Adaigi)</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400">
            {formatMoney(totalExpenses)}
          </p>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
            <span>{filteredExpenses.length} expense entries</span>
            <span className="font-bold text-rose-500">{expensePercent}% of total</span>
          </div>
        </div>

        {/* Balance (Profit / Blue) */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#18181B] shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold mb-2">
            <span>Net Balance (Profit / Loss)</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-2xl font-black ${netProfit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
            {formatMoney(netProfit)}
          </p>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
            <span>{netProfit >= 0 ? "Net Positive Balance" : "Operating Deficit"}</span>
            <span className={`font-bold ${netProfit >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
              {netProfit >= 0 ? "Profitable" : "Deficit"}
            </span>
          </div>
        </div>
      </div>

      {/* ================= 2. PIE CHART CARD ================= */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#18181B] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-6 gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-emerald-500" />
              Income vs. Expense Distribution (Pie Chart)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Visual breakdown of cash inflow vs. outflow ratio
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-slate-700 dark:text-slate-300">Income ({incomePercent}%)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              <span className="text-slate-700 dark:text-slate-300">Expense ({expensePercent}%)</span>
            </span>
          </div>
        </div>

        {totalFlow === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            <Receipt className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p>No transactions found for this reporting period.</p>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row items-center justify-around gap-8 py-4">
            {/* SVG Interactive Donut/Pie Chart */}
            <div className="relative flex items-center justify-center">
              <svg width={size} height={size} className="transform -rotate-90">
                {/* Background base ring */}
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke={theme === "dark" ? "#27272A" : "#E2E8F0"}
                  strokeWidth={strokeWidth}
                  fill="transparent"
                />

                {/* Income Arc (Green) */}
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke="#10B981"
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${incomeStrokeDash} ${circumference}`}
                  strokeDashoffset={0}
                  fill="transparent"
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />

                {/* Expense Arc (Red) */}
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke="#F43F5E"
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${expenseStrokeDash} ${circumference}`}
                  strokeDashoffset={-incomeStrokeDash}
                  fill="transparent"
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              </svg>

              {/* Center Metrics Hole */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Total Flow
                </span>
                <span className="text-lg font-black text-slate-900 dark:text-white">
                  {formatMoney(totalFlow)}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 ${
                  netProfit >= 0 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                }`}>
                  {netProfit >= 0 ? "Profit" : "Loss"}
                </span>
              </div>
            </div>

            {/* Side Metric Details */}
            <div className="w-full md:w-80 space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    Total Income
                  </span>
                  <span className="text-slate-900 dark:text-white font-bold">{formatMoney(totalIncome)}</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div style={{ width: `${incomePercent}%` }} className="bg-emerald-500 h-full rounded-full" />
                </div>
                <div className="text-[10px] text-slate-400 text-right">{incomePercent}% of cashflow</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    Total Expenses
                  </span>
                  <span className="text-slate-900 dark:text-white font-bold">{formatMoney(totalExpenses)}</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div style={{ width: `${expensePercent}%` }} className="bg-rose-500 h-full rounded-full" />
                </div>
                <div className="text-[10px] text-slate-400 text-right">{expensePercent}% of cashflow</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ================= 3. CATEGORY DISTRIBUTION BARS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Category Breakdown */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#18181B] space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-rose-500" /> Expense Categories
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">{expenseCategories.length} categories</span>
          </div>

          {expenseCategories.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">No expenses recorded for this period.</div>
          ) : (
            <div className="space-y-3 pt-1">
              {expenseCategories.map((cat, idx) => (
                <div key={cat.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{cat.name}</span>
                    <span className="text-slate-500 dark:text-slate-400">
                      {formatMoney(cat.amount)} ({cat.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${cat.percentage}%`, backgroundColor: chartColors[idx % chartColors.length] }}
                      className="h-full rounded-full transition-all duration-300"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Income Sources Breakdown */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#18181B] space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" /> Income Sources
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">{incomeCategories.length} categories</span>
          </div>

          {incomeCategories.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">No income recorded for this period.</div>
          ) : (
            <div className="space-y-3 pt-1">
              {incomeCategories.map((cat) => (
                <div key={cat.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{cat.name}</span>
                    <span className="text-slate-500 dark:text-slate-400">
                      {formatMoney(cat.amount)} ({cat.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${cat.percentage}%` }}
                      className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upgrade Pro Modal */}
      <UpgradeProModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        userId={user?.id || "guest"}
        featureName="PDF Statement Exports"
      />
    </div>
  );
}
