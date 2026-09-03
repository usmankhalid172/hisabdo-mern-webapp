"use client";

import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";

interface Transaction {
  id: string;
  name: string;
  type: "in" | "out";
  amount: number;
  date: string;
}

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(false);
      } catch (err) {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#111726]/80 border border-slate-800/80 p-6 rounded-2xl backdrop-blur-md shadow-xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Dashboard Overview</h1>
          <p className="text-slate-400 text-sm mt-1">
            Track your daily transactions, cash flow, and balances in real time.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Entry</span>
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-[#111726]/80 border border-slate-800/80 p-5 rounded-2xl backdrop-blur-md">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Total Cash In</span>
          <p className="text-2xl font-extrabold text-emerald-400 mt-2">Rs. 0.00</p>
        </div>

        <div className="bg-[#111726]/80 border border-slate-800/80 p-5 rounded-2xl backdrop-blur-md">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Total Cash Out</span>
          <p className="text-2xl font-extrabold text-rose-400 mt-2">Rs. 0.00</p>
        </div>

        <div className="bg-[#111726]/80 border border-slate-800/80 p-5 rounded-2xl backdrop-blur-md">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Net Balance</span>
          <p className="text-2xl font-extrabold text-white mt-2">Rs. 0.00</p>
        </div>
      </div>
    </div>
  );
}