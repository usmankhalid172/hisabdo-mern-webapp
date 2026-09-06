"use client";

import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { dashboardService } from "@/services/dashboardService";
import { transactionService } from "@/services/transactionService";
import { SummaryCards } from "@/components/dashboard-analytics/SummaryCards";
import { CashFlowChart } from "@/components/dashboard-analytics/CashFlowChart";
import {
  TransactionModal,
  TransactionFormData,
} from "@/components/TransactionModal";

interface DashboardSummary {
  totalCashIn: number;
  totalCashOut: number;
  netBalance: number;
}

interface TransactionItem {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  description: string;
  date: string;
  created_at?: string;
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary>({
    totalCashIn: 0,
    totalCashOut: 0,
    netBalance: 0,
  });
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchSummary = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await dashboardService.getSummary();

      setSummary({
        totalCashIn: Number(data.totalCashIn || data.totalReceivables) || 0,
        totalCashOut: Number(data.totalCashOut || data.totalPayables) || 0,
        netBalance: Number(data.netBalance) || 0,
      });

      if (data.transactions && Array.isArray(data.transactions)) {
        setTransactions(data.transactions);
      }
    } catch (err) {
      console.error("Failed to load dashboard summary:", err);
      setError("Unable to load dashboard data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleAddEntry = async (data: TransactionFormData) => {
    try {
      setError(null);

      const apiData = {
        type: data.type === "Got Money" ? "income" : "expense",
        amount: data.amount,
        description: data.partyName,
        date: data.date,
      };

      await transactionService.create(apiData);
      await fetchSummary();
    } catch (err) {
      console.error("Failed to add transaction:", err);
      setError("Failed to save transaction. Please try again.");
    }
  };

  return (
    <div className="space-y-6 text-slate-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#111726]/80 border border-slate-800/80 p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Dashboard Overview
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Track your daily transactions, cash flow, and balances in real time.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setError(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl text-sm transition-colors"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Entry</span>
        </button>
      </div>

      {error && (
        <div className="bg-rose-950/30 border border-rose-900/50 text-rose-400 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <SummaryCards
        totalCashIn={summary.totalCashIn}
        totalCashOut={summary.totalCashOut}
        netBalance={summary.netBalance}
        isLoading={isLoading}
      />

      <CashFlowChart
        totalCashIn={summary.totalCashIn}
        totalCashOut={summary.totalCashOut}
        isLoading={isLoading}
      />

      {/* Recent Activity Section */}
      <div className="rounded-2xl border border-slate-800/80 bg-[#111726]/80 p-6 shadow-lg">
        <h3 className="mb-4 text-lg font-bold text-white">Recent Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="border-b border-slate-800 text-xs uppercase text-slate-400">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Party / Description</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {transactions && transactions.length > 0 ? (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 text-slate-400">{tx.date}</td>
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {tx.description || "N/A"}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block rounded-md px-2.5 py-1 text-xs font-semibold ${
                          tx.type === "income" || tx.type === "inflow"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        }`}
                      >
                        {tx.type === "income" || tx.type === "inflow"
                          ? "Cash In"
                          : "Cash Out"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-white">
                      Rs. {Number(tx.amount).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500">
                    No transaction entries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddEntry}
      />
    </div>
  );
}