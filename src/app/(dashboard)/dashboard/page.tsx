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

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary>({
    totalCashIn: 0,
    totalCashOut: 0,
    netBalance: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchSummary = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await dashboardService.getSummary();

      setSummary({
        totalCashIn: Number(data.totalCashIn) || 0,
        totalCashOut: Number(data.totalCashOut) || 0,
        netBalance: Number(data.netBalance) || 0,
      });
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#111726]/80 border border-slate-800/80 p-6 rounded-2xl backdrop-blur-md shadow-xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Dashboard Overview
          </h1>

          <p className="text-slate-400 text-sm mt-1">
            Track your daily transactions, cash flow, and balances in real
            time.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setError(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
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
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddEntry}
      />
    </div>
  );
}
