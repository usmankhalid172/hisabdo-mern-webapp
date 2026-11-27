"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Calculator as CalcIcon,
  Percent,
  RotateCcw,
  Copy,
  Check,
  History,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/ui/FormField";
import { Card } from "@/components/ui/design-system/Card";
import { PageHeading } from "@/components/ui/design-system/PageHeading";
import { EmptyState } from "@/components/ui/design-system/EmptyState";
import { useSettings } from "@/context/SettingsContext";

export default function CalculatorPage() {
  const { formatMoney, currencySymbol } = useSettings();

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
    <div className="mx-auto max-w-4xl space-y-6 pb-16">
      <PageHeading
        title="Retail & Khata Calculator"
        description="Fast percentage markups, retail discounts, sales tax, and cash counter accounting"
        action={
          <div className="flex flex-wrap items-center gap-1 rounded-card border border-border bg-surface-muted p-1">
            <Button
              type="button"
              size="sm"
              variant={activeTab === "percentage" ? "primary" : "secondary"}
              onClick={() => setActiveTab("percentage")}
              icon={Percent}
            >
              Percentage Tool
            </Button>
            <Button
              type="button"
              size="sm"
              variant={activeTab === "standard" ? "primary" : "secondary"}
              onClick={() => setActiveTab("standard")}
              icon={CalcIcon}
            >
              Standard Counter
            </Button>
          </div>
        }
      />

      {/* ================= TAB 1: PERCENTAGE CALCULATOR ================= */}
      {activeTab === "percentage" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Inputs Card */}
          <Card className="lg:col-span-7 space-y-5 p-6">
            <div className="border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">Percentage Inputs</h3>
              <p className="text-sm text-muted-foreground">
                Calculate GST, store margin, or customer discount
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <FormField label={`Base Amount (${currencySymbol})`}>
                  <div className="relative">
                    <Input
                      type="number"
                      step="any"
                      placeholder="e.g. 5000"
                      value={pctAmount}
                      onChange={(e) => setPctAmount(e.target.value)}
                      className="pe-14 text-lg font-bold"
                      autoFocus
                    />
                    {pctAmount && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setPctAmount("")}
                        className="absolute inset-y-0 end-2 my-auto"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                </FormField>
              </div>

              <div>
                <FormField label="Percentage Rate (%)">
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      step="any"
                      placeholder="e.g. 15"
                      value={pctRate}
                      onChange={(e) => setPctRate(e.target.value)}
                      className="text-lg font-bold"
                    />
                    <div className="rounded-card border border-primary/20 bg-primary/10 px-4 py-2.5 font-bold text-primary">
                      %
                    </div>
                  </div>
                </FormField>

                <div className="mt-3">
                  <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                    Quick Preset Rates:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {pctPresets.map((rate) => (
                      <Button
                        key={rate}
                        type="button"
                        size="sm"
                        variant={pctRate === rate ? "primary" : "secondary"}
                        onClick={() => setPctRate(rate)}
                      >
                        {rate}%
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setPctAmount("");
                    setPctRate("");
                  }}
                  className="flex-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Calculator</span>
                </Button>
              </div>
            </div>
          </Card>

          {/* Results Card */}
          <Card className="lg:col-span-5 flex flex-col justify-between space-y-6 p-6">
            <div>
              <div className="mb-4 border-b border-border pb-3">
                <h3 className="text-base font-bold text-foreground">Calculation Breakdown</h3>
                <p className="text-sm text-muted-foreground">Live computed values</p>
              </div>

              {calculatedPercentage ? (
                <div className="space-y-4">
                  <div className="relative rounded-card border border-primary/20 bg-primary/10 p-4">
                    <span className="mb-1 block text-xs font-semibold text-primary">
                      {pctRate}% Computed Value:
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black text-foreground">
                        {formatMoney(calculatedPercentage.percentValue)}
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => copyToClipboard(String(calculatedPercentage.percentValue.toFixed(2)), "pctValue")}
                        icon={copiedField === "pctValue" ? Check : Copy}
                        aria-label="Copy computed value"
                      />
                    </div>
                  </div>

                  <div className="rounded-card border border-success/20 bg-success/10 p-4">
                    <span className="mb-1 block text-xs font-semibold text-success">
                      Total with Markup / GST (+):
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black text-success">
                        {formatMoney(calculatedPercentage.totalWithAdd)}
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => copyToClipboard(String(calculatedPercentage.totalWithAdd.toFixed(2)), "totalAdd")}
                        icon={copiedField === "totalAdd" ? Check : Copy}
                        aria-label="Copy markup total"
                      />
                    </div>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      Cost ({formatMoney(Number(pctAmount))}) + {pctRate}% profit margin
                    </span>
                  </div>

                  <div className="rounded-card border border-danger/20 bg-danger/10 p-4">
                    <span className="mb-1 block text-xs font-semibold text-danger">
                      Total with Discount (-):
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black text-danger">
                        {formatMoney(calculatedPercentage.totalWithDiscount)}
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => copyToClipboard(String(calculatedPercentage.totalWithDiscount.toFixed(2)), "totalDisc")}
                        icon={copiedField === "totalDisc" ? Check : Copy}
                        aria-label="Copy discounted total"
                      />
                    </div>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      Original ({formatMoney(Number(pctAmount))}) - {pctRate}% customer concession
                    </span>
                  </div>
                </div>
              ) : (
                <EmptyState
                  title="Ready to calculate"
                  message="Enter a base amount and percentage rate to see live calculations."
                  className="rounded-card border border-border bg-surface-muted"
                />
              )}
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-border pt-4">
              <Link href="/dashboard" className="flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground">
                &larr; Back to Dashboard
              </Link>
              <Link href="/customers" className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                Go to Customers &rarr;
              </Link>
            </div>
          </Card>
        </div>
      )}

      {/* ================= TAB 2: STANDARD CASH COUNTER CALCULATOR ================= */}
      {activeTab === "standard" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Keypad & Display */}
          <Card className="lg:col-span-8 space-y-4 p-6">
            <div className="space-y-1 rounded-card border border-border bg-surface-muted p-5 text-end">
              <span className="block h-5 truncate font-mono text-xs text-muted-foreground">
                {equation || "\u00A0"}
              </span>
              <span className="block truncate font-mono text-4xl font-black tracking-tight text-foreground">
                {display}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2.5 pt-2">
              {/*
                Row 1
              */}
              <Button
                type="button"
                size="lg"
                variant="danger"
                onClick={() => handleKeypadPress("C")}
                className="h-14 w-full text-xl"
              >
                C
              </Button>
              <Button
                type="button"
                size="lg"
                variant="secondary"
                onClick={() => handleKeypadPress("backspace")}
                className="h-14 w-full text-xl"
                title="Backspace"
              >
                ←
              </Button>
              <Button
                type="button"
                size="lg"
                variant="secondary"
                onClick={() => handleKeypadPress("%")}
                className="h-14 w-full text-xl"
              >
                %
              </Button>
              <Button
                type="button"
                size="lg"
                variant="primary"
                onClick={() => handleKeypadPress("/")}
                className="h-14 w-full text-xl"
              >
                ÷
              </Button>

              {/*
                Row 2
              */}
              <Button
                type="button"
                size="lg"
                variant="secondary"
                onClick={() => handleKeypadPress("7")}
                className="h-14 w-full text-xl"
              >
                7
              </Button>
              <Button
                type="button"
                size="lg"
                variant="secondary"
                onClick={() => handleKeypadPress("8")}
                className="h-14 w-full text-xl"
              >
                8
              </Button>
              <Button
                type="button"
                size="lg"
                variant="secondary"
                onClick={() => handleKeypadPress("9")}
                className="h-14 w-full text-xl"
              >
                9
              </Button>
              <Button
                type="button"
                size="lg"
                variant="primary"
                onClick={() => handleKeypadPress("*")}
                className="h-14 w-full text-xl"
              >
                ×
              </Button>

              {/*
                Row 3
              */}
              <Button
                type="button"
                size="lg"
                variant="secondary"
                onClick={() => handleKeypadPress("4")}
                className="h-14 w-full text-xl"
              >
                4
              </Button>
              <Button
                type="button"
                size="lg"
                variant="secondary"
                onClick={() => handleKeypadPress("5")}
                className="h-14 w-full text-xl"
              >
                5
              </Button>
              <Button
                type="button"
                size="lg"
                variant="secondary"
                onClick={() => handleKeypadPress("6")}
                className="h-14 w-full text-xl"
              >
                6
              </Button>
              <Button
                type="button"
                size="lg"
                variant="primary"
                onClick={() => handleKeypadPress("-")}
                className="h-14 w-full text-xl"
              >
                −
              </Button>

              {/*
                Row 4
              */}
              <Button
                type="button"
                size="lg"
                variant="secondary"
                onClick={() => handleKeypadPress("1")}
                className="h-14 w-full text-xl"
              >
                1
              </Button>
              <Button
                type="button"
                size="lg"
                variant="secondary"
                onClick={() => handleKeypadPress("2")}
                className="h-14 w-full text-xl"
              >
                2
              </Button>
              <Button
                type="button"
                size="lg"
                variant="secondary"
                onClick={() => handleKeypadPress("3")}
                className="h-14 w-full text-xl"
              >
                3
              </Button>
              <Button
                type="button"
                size="lg"
                variant="primary"
                onClick={() => handleKeypadPress("+")}
                className="h-14 w-full text-xl"
              >
                +
              </Button>

              {/*
                Row 5
              */}
              <Button
                type="button"
                size="lg"
                variant="secondary"
                onClick={() => handleKeypadPress("0")}
                className="col-span-2 h-14 w-full text-xl"
              >
                0
              </Button>
              <Button
                type="button"
                size="lg"
                variant="secondary"
                onClick={() => handleKeypadPress(".")}
                className="h-14 w-full text-xl"
              >
                .
              </Button>
              <Button
                type="button"
                size="lg"
                variant="success"
                onClick={() => handleKeypadPress("=")}
                className="h-14 w-full text-2xl"
              >
                =
              </Button>
            </div>
          </Card>

          {/* Calculation History Feed */}
          <Card className="lg:col-span-4 flex flex-col justify-between space-y-4 p-6">
            <div>
              <div className="mb-3 flex items-center justify-between border-b border-border pb-3">
                <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <History className="h-4 w-4 text-primary" />
                  Calculation Tape
                </h3>
                {history.length > 0 && (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => setHistory([])}
                    icon={Trash2}
                    aria-label="Clear calculation history"
                  />
                )}
              </div>

              {history.length === 0 ? (
                <EmptyState
                  title="No calculations yet"
                  message="Your recent calculations will appear here."
                  className="rounded-card border border-border bg-surface-muted"
                />
              ) : (
                <div className="max-h-80 space-y-2 overflow-y-auto pe-1">
                  {history.map((h, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setDisplay(h.result)}
                      className="w-full rounded-card border border-border bg-surface-muted p-2.5 text-end transition hover:bg-surface-raised"
                    >
                      <span className="block truncate font-mono text-xs text-muted-foreground">{h.equation} =</span>
                      <span className="block font-mono text-base font-bold text-foreground">{h.result}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-border pt-3 text-center text-xs text-muted-foreground">
              Tip: You can use physical numpad keys (0-9, +, -, *, /, Enter).
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
