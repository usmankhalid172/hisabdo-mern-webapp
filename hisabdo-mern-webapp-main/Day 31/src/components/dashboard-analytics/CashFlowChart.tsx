"use client";

import React from "react";

interface CashFlowProps {
  totalCashIn: number;
  totalCashOut: number;
  isLoading?: boolean;
}

export const CashFlowChart: React.FC<CashFlowProps> = ({
  totalCashIn,
  totalCashOut,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-72 animate-pulse flex items-center justify-center">
        <span className="text-slate-500 text-sm font-medium">Loading Cash Analytics...</span>
      </div>
    );
  }

  const maxAmount = Math.max(totalCashIn, totalCashOut, 1000);

  const calculateY = (amount: number) => {
    if (amount <= 0) return 130; 
    const ratio = amount / maxAmount;
    return Math.max(20, Math.round(130 - ratio * 100));
  };

  const inY = calculateY(totalCashIn);
  const outY = calculateY(totalCashOut);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Cash Flow Analytics</h2>
          <p className="text-xs text-slate-400">Live dynamic flow trajectory</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Inflow
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span> Outflow
          </span>
        </div>
      </div>

      <div className="relative h-48 w-full">
        <svg viewBox="0 0 500 150" className="w-full h-full overflow-visible" preserveAspectRatio="none">
          <defs>
            <linearGradient id="inflowGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="outflowGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          <line x1="0" y1="30" x2="500" y2="30" stroke="#1e293b" strokeDasharray="4 4" />
          <line x1="0" y1="80" x2="500" y2="80" stroke="#1e293b" strokeDasharray="4 4" />
          <line x1="0" y1="130" x2="500" y2="130" stroke="#334155" strokeDasharray="2 2" />

          <path
            d={`M 0,130 Q 250,${(130 + inY) / 2} 500,${inY} L 500,130 L 0,130 Z`}
            fill="url(#inflowGrad)"
          />
          <path
            d={`M 0,130 Q 250,${(130 + inY) / 2} 500,${inY}`}
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            strokeLinecap="round"
          />

          <path
            d={`M 0,130 Q 250,${(130 + outY) / 2} 500,${outY} L 500,130 L 0,130 Z`}
            fill="url(#outflowGrad)"
          />
          <path
            d={`M 0,130 Q 250,${(130 + outY) / 2} 500,${outY}`}
            fill="none"
            stroke="#f43f5e"
            strokeWidth="2.5"
            strokeDasharray="6 3"
            strokeLinecap="round"
          />

          {totalCashIn > 0 && (
            <>
              <circle cx="500" cy={inY} r="5" fill="#10b981" className="animate-ping opacity-75" />
              <circle cx="500" cy={inY} r="4" fill="#10b981" />
            </>
          )}

          {totalCashOut > 0 && (
            <circle cx="500" cy={outY} r="4" fill="#f43f5e" />
          )}
        </svg>

        <div className="flex justify-between text-[11px] text-slate-500 font-mono mt-3">
          <span>Start</span>
          <span>Mid Month</span>
          <span>Today (Live)</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-800/80">
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
          <p className="text-[11px] text-slate-400 font-medium">Total Cash In</p>
          <p className="text-base font-bold text-emerald-400 font-mono mt-0.5">
            Rs. {totalCashIn.toLocaleString()}
          </p>
        </div>

        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
          <p className="text-[11px] text-slate-400 font-medium">Total Cash Out</p>
          <p className="text-base font-bold text-rose-400 font-mono mt-0.5">
            Rs. {totalCashOut.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};