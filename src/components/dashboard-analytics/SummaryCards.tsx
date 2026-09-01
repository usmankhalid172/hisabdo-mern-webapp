import React from "react";
import { ArrowUpRight, ArrowDownLeft, Wallet } from "lucide-react";

interface SummaryCardsProps {
  totalCashIn: number;
  totalCashOut: number;
  netBalance: number;
  isLoading: boolean;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  totalCashIn,
  totalCashOut,
  netBalance,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-slate-800/50 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
        <div className="flex justify-between items-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <span>Total Receivables (Cash In)</span>
          <ArrowUpRight className="w-4 h-4 text-emerald-400" />
        </div>
        <p className="text-2xl font-bold text-emerald-400 mt-2">
          Rs. {totalCashIn.toLocaleString()}
        </p>
        <span className="text-xs text-slate-500">Across active entries</span>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
        <div className="flex justify-between items-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <span>Total Payables (Cash Out)</span>
          <ArrowDownLeft className="w-4 h-4 text-rose-400" />
        </div>
        <p className="text-2xl font-bold text-rose-400 mt-2">
          Rs. {totalCashOut.toLocaleString()}
        </p>
        <span className="text-xs text-slate-500">Across outgoing expenses</span>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
        <div className="flex justify-between items-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <span>Net Balance</span>
          <Wallet className="w-4 h-4 text-blue-400" />
        </div>
        <p className={`text-2xl font-bold mt-2 ${netBalance >= 0 ? "text-white" : "text-rose-500"}`}>
          Rs. {netBalance.toLocaleString()}
        </p>
        <span className="text-xs text-slate-500">
          {netBalance >= 0 ? "Positive net liquidity" : "Deficit balance"}
        </span>
      </div>
    </div>
  );
};