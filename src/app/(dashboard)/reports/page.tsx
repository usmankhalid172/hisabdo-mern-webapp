"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Receipt,
  Wallet,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { transactionService } from "@/services/transactionService";

interface Transaction {
  _id: string;
  user: string;
  type: "income" | "expense";
  amount: number;
  description: string;
  date: string;
}

export default function ReportsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTransactions = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await transactionService.getAll();

      setTransactions(data?.transactions || []);
    } catch (err) {
      console.error("Failed to load reports:", err);
      setError("Unable to load report data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const reportData = useMemo(() => {
    const totalIncome = transactions
      .filter((transaction) => transaction.type === "income")
      .reduce(
        (sum, transaction) => sum + Number(transaction.amount || 0),
        0
      );

    const totalExpenses = transactions
      .filter((transaction) => transaction.type === "expense")
      .reduce(
        (sum, transaction) => sum + Number(transaction.amount || 0),
        0
      );

    const netBalance = totalIncome - totalExpenses;

    const incomeCount = transactions.filter(
      (transaction) => transaction.type === "income"
    ).length;

    const expenseCount = transactions.filter(
      (transaction) => transaction.type === "expense"
    ).length;

    return {
      totalIncome,
      totalExpenses,
      netBalance,
      incomeCount,
      expenseCount,
    };
  }, [transactions]);

  const maxAmount = Math.max(
    reportData.totalIncome,
    reportData.totalExpenses,
    1
  );

  const incomeWidth = `${(reportData.totalIncome / maxAmount) * 100}%`;
  const expenseWidth = `${(reportData.totalExpenses / maxAmount) * 100}%`;

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header */}
      <div className="bg-[#111726]/80 border border-slate-800/80 p-6 rounded-2xl backdrop-blur-md shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 rounded-xl">
            <BarChart3 className="w-6 h-6 text-emerald-400" />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Reports & Analytics
            </h1>

            <p className="text-slate-400 text-sm mt-1">
              Review your income, expenses, and overall financial performance.
            </p>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-rose-950/30 border border-rose-900/50 text-rose-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Loading */}
      {isLoading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-3" />

          <p className="text-slate-400 text-sm">
            Loading report data...
          </p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Income */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-400">
                    Total Income
                  </p>

                  <h2 className="text-2xl font-bold text-emerald-400 mt-1">
                    Rs. {reportData.totalIncome.toLocaleString()}
                  </h2>
                </div>

                <div className="p-3 bg-emerald-500/10 rounded-xl">
                  <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                </div>
              </div>

              <p className="text-xs text-slate-500 mt-3">
                {reportData.incomeCount} income transaction
                {reportData.incomeCount !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Total Expenses */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-400">
                    Total Expenses
                  </p>

                  <h2 className="text-2xl font-bold text-rose-400 mt-1">
                    Rs. {reportData.totalExpenses.toLocaleString()}
                  </h2>
                </div>

                <div className="p-3 bg-rose-500/10 rounded-xl">
                  <ArrowDownRight className="w-5 h-5 text-rose-400" />
                </div>
              </div>

              <p className="text-xs text-slate-500 mt-3">
                {reportData.expenseCount} expense transaction
                {reportData.expenseCount !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Net Balance */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-400">
                    Net Balance
                  </p>

                  <h2
                    className={`text-2xl font-bold mt-1 ${
                      reportData.netBalance >= 0
                        ? "text-emerald-400"
                        : "text-rose-400"
                    }`}
                  >
                    Rs. {reportData.netBalance.toLocaleString()}
                  </h2>
                </div>

                <div className="p-3 bg-slate-800 rounded-xl">
                  <Wallet className="w-5 h-5 text-slate-300" />
                </div>
              </div>

              <p className="text-xs text-slate-500 mt-3">
                Income minus expenses
              </p>
            </div>
          </div>

          {/* Income vs Expenses */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-slate-800 rounded-lg">
                <BarChart3 className="w-5 h-5 text-slate-300" />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-white">
                  Income vs Expenses
                </h2>

                <p className="text-xs text-slate-400">
                  Comparison based on your recorded transactions
                </p>
              </div>
            </div>

            {transactions.length === 0 ? (
              <div className="py-12 text-center">
                <Receipt className="w-10 h-10 text-slate-600 mx-auto mb-3" />

                <h3 className="text-sm font-semibold text-slate-300">
                  No transaction data
                </h3>

                <p className="text-xs text-slate-500 mt-1">
                  Add transactions to generate your financial report.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Income Bar */}
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-slate-300">Income</span>

                    <span className="text-emerald-400 font-semibold">
                      Rs. {reportData.totalIncome.toLocaleString()}
                    </span>
                  </div>

                  <div className="h-4 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: incomeWidth }}
                    />
                  </div>
                </div>

                {/* Expense Bar */}
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-slate-300">Expenses</span>

                    <span className="text-rose-400 font-semibold">
                      Rs. {reportData.totalExpenses.toLocaleString()}
                    </span>
                  </div>

                  <div className="h-4 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-rose-500 rounded-full transition-all duration-500"
                      style={{ width: expenseWidth }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Recent Transactions */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-800">
              <h2 className="text-lg font-semibold text-white">
                Recent Transactions
              </h2>

              <p className="text-xs text-slate-400 mt-1">
                Latest financial activity
              </p>
            </div>

            {transactions.length === 0 ? (
              <div className="p-10 text-center">
                <Receipt className="w-10 h-10 text-slate-600 mx-auto mb-3" />

                <p className="text-sm text-slate-400">
                  No transactions available.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-xs border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-4">Description</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4 text-right">Amount</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-800/50">
                    {transactions.slice(0, 10).map((transaction) => (
                      <tr
                        key={transaction._id}
                        className="hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="px-6 py-4 font-medium text-white">
                          {transaction.description}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                              transaction.type === "income"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                            }`}
                          >
                            {transaction.type === "income"
                              ? "Income"
                              : "Expense"}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-slate-400">
                          {new Date(
                            transaction.date
                          ).toLocaleDateString()}
                        </td>

                        <td
                          className={`px-6 py-4 text-right font-semibold ${
                            transaction.type === "income"
                              ? "text-emerald-400"
                              : "text-rose-400"
                          }`}
                        >
                          {transaction.type === "income" ? "+" : "-"} Rs.{" "}
                          {Number(transaction.amount).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}