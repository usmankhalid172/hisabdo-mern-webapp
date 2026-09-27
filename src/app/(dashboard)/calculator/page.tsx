"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Calculator as CalcIcon,
  Percent,
  RotateCcw,
  Copy,
  Check,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  History,
  Trash2,
  PlusCircle,
  MinusCircle,
} from "lucide-react";
import { useSettings } from "@/context/SettingsContext";

export default function CalculatorPage() {
  const { formatMoney, currencySymbol, theme } = useSettings();

  const [activeTab, setActiveTab] = useState<"percentage" | "standard">("percentage");

  // ================= Percentage Calculator States =================
  const [pctAmount, setPctAmount] = useState("");
  const [pctRate, setPctRate] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const pctPresets = ["5", "10", "12", "15", "18", "20", "25", "30", "50"];

  const calculatedPercentage = useMemo(() => {
    const amt = parseFloat(pctAmount);
    const rate = parseFloat(pctRate);
    if (isNaN(amt) || isNaN(rate)) return null;

    const value = (amt * rate) / 100;
    return {
      percentValue: value,
      totalWithAdd: amt + value,
      totalWithDiscount: amt - value,
    };
  }, [pctAmount, pctRate]);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // ================= Standard Calculator States =================
  const [display, setDisplay] = useState("0");
  const [equation, setEquation] = useState("");
  const [history, setHistory] = useState<{ equation: string; result: string }[]>([]);

  const handleKeypadPress = useCallback((val: string) => {
    if (val === "C") {
      setDisplay("0");
      setEquation("");
    } else if (val === "backspace") {
      setDisplay((prev) => (prev.length > 1 ? prev.slice(0, -1) : "0"));
    } else if (val === "=") {
      try {
        const fullExpr = equation + display;
        const sanitized = fullExpr.replace(/[^0-9+\-*/.]/g, "");
        if (!sanitized) return;
        // eslint-disable-next-line no-eval
        const evaluated = Function(`'use strict'; return (${sanitized})`)();
        const resultStr = String(Number(evaluated.toFixed(2)));
        setHistory((prev) => [{ equation: fullExpr, result: resultStr }, ...prev.slice(0, 9)]);
        setDisplay(resultStr);
        setEquation("");
      } catch {
        setDisplay("Error");
      }
    } else if (val === "%") {
      try {
        const current = parseFloat(display);
        if (!isNaN(current)) {
          setDisplay(String(current / 100));
        }
      } catch {
        setDisplay("Error");
      }
    } else if (["+", "-", "*", "/"].includes(val)) {
      setEquation((prev) => prev + display + " " + val + " ");
      setDisplay("0");
    } else if (val === ".") {
      setDisplay((prev) => (prev.includes(".") ? prev : prev + "."));
    } else {
      setDisplay((prev) => (prev === "0" ? val : prev + val));
    }
  }, [display, equation]);

  // Physical keyboard support for calculator
  useEffect(() => {
    if (activeTab !== "standard") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") handleKeypadPress(e.key);
      else if (["+", "-", "*", "/"].includes(e.key)) handleKeypadPress(e.key);
      else if (e.key === "Enter" || e.key === "=") handleKeypadPress("=");
      else if (e.key === "Backspace") handleKeypadPress("backspace");
      else if (e.key === "Escape" || e.key === "c" || e.key === "C") handleKeypadPress("C");
      else if (e.key === ".") handleKeypadPress(".");
      else if (e.key === "%") handleKeypadPress("%");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab, handleKeypadPress]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Top Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
              <CalcIcon className="w-6 h-6" />
            </div>
            Retail &amp; Khata Calculator
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Fast percentage markups, retail discounts, sales tax, and counter accounting
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#161B26] border border-slate-800">
          <button
            onClick={() => setActiveTab("percentage")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "percentage"
                ? "bg-purple-600 text-white shadow-md shadow-purple-900/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Percent className="w-4 h-4" />
            <span>Percentage Tool</span>
          </button>
          <button
            onClick={() => setActiveTab("standard")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "standard"
                ? "bg-purple-600 text-white shadow-md shadow-purple-900/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <CalcIcon className="w-4 h-4" />
            <span>Standard Cash Counter</span>
          </button>
        </div>
      </div>

      {/* ================= TAB 1: PERCENTAGE CALCULATOR ================= */}
      {activeTab === "percentage" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Inputs Card */}
          <div className="lg:col-span-7 p-6 rounded-2xl border border-slate-800 bg-[#1E1E1E] space-y-5 shadow-sm">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Percentage Inputs</h3>
              <p className="text-xs text-slate-400">Calculate GST, store margin, or customer discount</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Base Amount ({currencySymbol})
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 5000"
                    value={pctAmount}
                    onChange={(e) => setPctAmount(e.target.value)}
                    className="w-full px-4 py-3 text-lg font-bold rounded-xl border border-slate-700 bg-[#121212] text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    autoFocus
                  />
                  {pctAmount && (
                    <button
                      onClick={() => setPctAmount("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-white"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Percentage Rate (%)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 15"
                    value={pctRate}
                    onChange={(e) => setPctRate(e.target.value)}
                    className="w-full px-4 py-3 text-lg font-bold rounded-xl border border-slate-700 bg-[#121212] text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <div className="px-4 py-3 rounded-xl bg-purple-500/15 text-purple-400 font-bold border border-purple-500/30">
                    %
                  </div>
                </div>

                {/* Preset Chips */}
                <div className="mt-3">
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                    Quick Preset Rates:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {pctPresets.map((rate) => (
                      <button
                        key={rate}
                        type="button"
                        onClick={() => setPctRate(rate)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                          pctRate === rate
                            ? "bg-purple-600 text-white border-purple-500 shadow-md"
                            : "border-slate-800 bg-[#121212] text-slate-400 hover:text-white hover:border-slate-700"
                        }`}
                      >
                        {rate}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setPctAmount("");
                    setPctRate("");
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold border border-slate-700 bg-[#121212] hover:bg-slate-800 text-slate-300 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Calculator</span>
                </button>
              </div>
            </div>
          </div>

          {/* Results Card */}
          <div className="lg:col-span-5 p-6 rounded-2xl border border-slate-800 bg-[#1E1E1E] flex flex-col justify-between space-y-6 shadow-sm">
            <div>
              <div className="border-b border-slate-800 pb-3 mb-4">
                <h3 className="text-base font-bold text-white">Calculation Breakdown</h3>
                <p className="text-xs text-slate-400">Live computed values</p>
              </div>

              {calculatedPercentage ? (
                <div className="space-y-4">
                  {/* Percentage Value */}
                  <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-800/40 relative">
                    <span className="text-xs font-semibold text-purple-300 block mb-1">
                      {pctRate}% Computed Value:
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black text-white">
                        {formatMoney(calculatedPercentage.percentValue)}
                      </span>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            String(calculatedPercentage.percentValue.toFixed(2)),
                            "pctValue"
                          )
                        }
                        className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 transition"
                        title="Copy to clipboard"
                      >
                        {copiedField === "pctValue" ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Total with Markup / Profit / Tax */}
                  <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40">
                    <span className="text-xs font-semibold text-emerald-300 block mb-1">
                      Total with Markup / GST (+):
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black text-[#00E676]">
                        {formatMoney(calculatedPercentage.totalWithAdd)}
                      </span>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            String(calculatedPercentage.totalWithAdd.toFixed(2)),
                            "totalAdd"
                          )
                        }
                        className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 transition"
                        title="Copy to clipboard"
                      >
                        {copiedField === "totalAdd" ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Cost ({formatMoney(Number(pctAmount))}) + {pctRate}% profit margin
                    </span>
                  </div>

                  {/* Total with Discount */}
                  <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-800/40">
                    <span className="text-xs font-semibold text-rose-300 block mb-1">
                      Total with Discount (-):
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black text-[#E53935]">
                        {formatMoney(calculatedPercentage.totalWithDiscount)}
                      </span>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            String(calculatedPercentage.totalWithDiscount.toFixed(2)),
                            "totalDisc"
                          )
                        }
                        className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 transition"
                        title="Copy to clipboard"
                      >
                        {copiedField === "totalDisc" ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Original ({formatMoney(Number(pctAmount))}) - {pctRate}% customer concession
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-10 text-center text-slate-500 text-xs rounded-xl bg-[#121212] border border-slate-800">
                  <Percent className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p>Enter base amount and percentage rate on the left to see live calculations.</p>
                </div>
              )}
            </div>

            {/* Quick Record Navigation Links */}
            <div className="border-t border-slate-800 pt-4 flex items-center justify-between gap-2">
              <Link
                href="/dashboard"
                className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1"
              >
                &larr; Back to Dashboard
              </Link>
              <Link
                href="/customers"
                className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1"
              >
                Go to Customers &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: STANDARD CASH COUNTER CALCULATOR ================= */}
      {activeTab === "standard" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Keypad & Display */}
          <div className="lg:col-span-8 p-6 rounded-2xl border border-slate-800 bg-[#1E1E1E] space-y-4 shadow-sm">
            {/* Digital Display */}
            <div className="p-5 rounded-2xl bg-[#0F141E] border border-slate-800 text-right space-y-1">
              <span className="text-xs text-slate-500 block h-5 font-mono truncate">
                {equation || "\u00A0"}
              </span>
              <span className="text-4xl font-black text-white block tracking-tight truncate font-mono">
                {display}
              </span>
            </div>

            {/* Tactile Keypad */}
            <div className="grid grid-cols-4 gap-2.5 pt-2">
              {/* Row 1 */}
              <button
                onClick={() => handleKeypadPress("C")}
                className="py-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-lg transition active:scale-95"
              >
                C
              </button>
              <button
                onClick={() => handleKeypadPress("backspace")}
                className="py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-lg transition active:scale-95 flex items-center justify-center"
                title="Backspace"
              >
                &larr;
              </button>
              <button
                onClick={() => handleKeypadPress("%")}
                className="py-4 rounded-xl bg-purple-950/50 hover:bg-purple-900/60 text-purple-300 font-bold text-lg transition active:scale-95"
              >
                %
              </button>
              <button
                onClick={() => handleKeypadPress("/")}
                className="py-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xl transition active:scale-95"
              >
                &divide;
              </button>

              {/* Row 2 */}
              <button
                onClick={() => handleKeypadPress("7")}
                className="py-4 rounded-xl bg-[#121212] hover:bg-slate-800 border border-slate-800 text-white font-bold text-xl transition active:scale-95"
              >
                7
              </button>
              <button
                onClick={() => handleKeypadPress("8")}
                className="py-4 rounded-xl bg-[#121212] hover:bg-slate-800 border border-slate-800 text-white font-bold text-xl transition active:scale-95"
              >
                8
              </button>
              <button
                onClick={() => handleKeypadPress("9")}
                className="py-4 rounded-xl bg-[#121212] hover:bg-slate-800 border border-slate-800 text-white font-bold text-xl transition active:scale-95"
              >
                9
              </button>
              <button
                onClick={() => handleKeypadPress("*")}
                className="py-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xl transition active:scale-95"
              >
                &times;
              </button>

              {/* Row 3 */}
              <button
                onClick={() => handleKeypadPress("4")}
                className="py-4 rounded-xl bg-[#121212] hover:bg-slate-800 border border-slate-800 text-white font-bold text-xl transition active:scale-95"
              >
                4
              </button>
              <button
                onClick={() => handleKeypadPress("5")}
                className="py-4 rounded-xl bg-[#121212] hover:bg-slate-800 border border-slate-800 text-white font-bold text-xl transition active:scale-95"
              >
                5
              </button>
              <button
                onClick={() => handleKeypadPress("6")}
                className="py-4 rounded-xl bg-[#121212] hover:bg-slate-800 border border-slate-800 text-white font-bold text-xl transition active:scale-95"
              >
                6
              </button>
              <button
                onClick={() => handleKeypadPress("-")}
                className="py-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xl transition active:scale-95"
              >
                &minus;
              </button>

              {/* Row 4 */}
              <button
                onClick={() => handleKeypadPress("1")}
                className="py-4 rounded-xl bg-[#121212] hover:bg-slate-800 border border-slate-800 text-white font-bold text-xl transition active:scale-95"
              >
                1
              </button>
              <button
                onClick={() => handleKeypadPress("2")}
                className="py-4 rounded-xl bg-[#121212] hover:bg-slate-800 border border-slate-800 text-white font-bold text-xl transition active:scale-95"
              >
                2
              </button>
              <button
                onClick={() => handleKeypadPress("3")}
                className="py-4 rounded-xl bg-[#121212] hover:bg-slate-800 border border-slate-800 text-white font-bold text-xl transition active:scale-95"
              >
                3
              </button>
              <button
                onClick={() => handleKeypadPress("+")}
                className="py-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xl transition active:scale-95"
              >
                +
              </button>

              {/* Row 5 */}
              <button
                onClick={() => handleKeypadPress("0")}
                className="col-span-2 py-4 rounded-xl bg-[#121212] hover:bg-slate-800 border border-slate-800 text-white font-bold text-xl transition active:scale-95"
              >
                0
              </button>
              <button
                onClick={() => handleKeypadPress(".")}
                className="py-4 rounded-xl bg-[#121212] hover:bg-slate-800 border border-slate-800 text-white font-bold text-xl transition active:scale-95"
              >
                .
              </button>
              <button
                onClick={() => handleKeypadPress("=")}
                className="py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-2xl transition active:scale-95 shadow-md shadow-emerald-900/30"
              >
                =
              </button>
            </div>
          </div>

          {/* Calculation History Feed */}
          <div className="lg:col-span-4 p-6 rounded-2xl border border-slate-800 bg-[#1E1E1E] flex flex-col justify-between space-y-4 shadow-sm">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-purple-400" />
                  Calculation Tape
                </h3>
                {history.length > 0 && (
                  <button
                    onClick={() => setHistory([])}
                    className="p-1 text-slate-500 hover:text-rose-400 transition"
                    title="Clear history"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  <CalcIcon className="w-6 h-6 text-slate-600 mx-auto mb-2" />
                  Your recent calculations will appear here.
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {history.map((h, i) => (
                    <div
                      key={i}
                      onClick={() => setDisplay(h.result)}
                      className="p-2.5 rounded-xl bg-[#121212] hover:bg-slate-800/40 border border-slate-800/60 cursor-pointer text-right transition"
                    >
                      <span className="text-[11px] text-slate-500 block truncate">{h.equation} =</span>
                      <span className="text-base font-bold text-white font-mono">{h.result}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="text-[11px] text-slate-500 text-center border-t border-slate-800 pt-3">
              Tip: You can use physical numpad keys (0-9, +, -, *, /, Enter).
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
