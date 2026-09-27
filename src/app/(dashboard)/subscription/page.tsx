"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Check,
  ShieldCheck,
  Zap,
  Clock,
  FileText,
  FileCheck,
  Share2,
  Cloud,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { subscriptionService, SubscriptionPlan } from "@/services/subscriptionService";

export default function SubscriptionPage() {
  const { user } = useAuth();
  const userId = user?.id || "guest";

  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan>("free");
  const [invoiceUsage, setInvoiceUsage] = useState({ used: 0, limit: 5 });
  const [pdfUsage, setPdfUsage] = useState({ used: 0, limit: 5 });
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    refreshPlanState();
  }, [userId]);

  const refreshPlanState = () => {
    const plan = subscriptionService.getPlan(userId);
    setCurrentPlan(plan);
    const inv = subscriptionService.getUsage(userId, "invoice_create");
    const pdf = subscriptionService.getUsage(userId, "invoice_pdf");
    setInvoiceUsage({ used: inv.used, limit: inv.limit });
    setPdfUsage({ used: pdf.used, limit: pdf.limit });
  };

  const handleUpgrade = () => {
    subscriptionService.setPlan(userId, "pro");
    refreshPlanState();
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 5000);
  };

  const handleDowngrade = () => {
    subscriptionService.setPlan(userId, "free");
    refreshPlanState();
  };

  return (
    <div className="space-y-8 text-slate-100 max-w-5xl mx-auto py-2">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          HisabDo Pro Subscription Plans
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Simple, Transparent Plans for Your Business
        </h1>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          Start free with daily limits or upgrade to Pro for unlimited PDF statements, branded invoices, and instant merchant tools.
        </p>
      </div>

      {isSuccess && (
        <div className="bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 px-5 py-3.5 rounded-2xl text-sm flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>🎉 <strong>HisabDo Pro Activated!</strong> You now have unlimited access to invoices and PDF exports.</span>
          </div>
        </div>
      )}

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        {/* FREE PLAN */}
        <div className={`rounded-2xl border ${
          currentPlan === "free"
            ? "border-slate-700 bg-[#141A28] shadow-lg ring-1 ring-slate-600"
            : "border-slate-800 bg-[#111726]/60"
        } p-6 sm:p-8 flex flex-col justify-between transition-all`}>
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                  Starter Tier
                </span>
                <h3 className="text-2xl font-bold text-white mt-1">HisabDo Free</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Perfect for micro-retailers & local shopkeepers.
                </p>
              </div>
              {currentPlan === "free" && (
                <span className="bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold px-2.5 py-1 rounded-full">
                  Current Plan
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-white">Rs. 0</span>
              <span className="text-xs text-slate-400">/ forever free</span>
            </div>

            {/* Daily Usage Meters */}
            <div className="bg-[#182032] border border-slate-700/60 rounded-xl p-4 space-y-3">
              <span className="text-xs font-semibold text-slate-300 block">Daily Entitlement Limits:</span>
              
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Daily Invoices:</span>
                  <span className="font-semibold text-indigo-400">
                    {invoiceUsage.used} / {invoiceUsage.limit} used today
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: `${Math.min(100, (invoiceUsage.used / 5) * 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Daily PDF Statements:</span>
                  <span className="font-semibold text-indigo-400">
                    {pdfUsage.used} / {pdfUsage.limit} used today
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: `${Math.min(100, (pdfUsage.used / 5) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Features */}
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Unlimited customer khata entries</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Up to <strong>5 Invoices per day</strong></span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Up to <strong>5 PDF Statements per day</strong></span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>WhatsApp payment reminder messages</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Retail & Percentage calculators</span>
              </li>
            </ul>
          </div>

          <div className="pt-8">
            {currentPlan === "free" ? (
              <button
                disabled
                className="w-full py-3 px-4 rounded-xl border border-slate-700 bg-slate-800/40 text-slate-400 text-xs font-semibold cursor-default"
              >
                Active Plan
              </button>
            ) : (
              <button
                onClick={handleDowngrade}
                className="w-full py-3 px-4 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors"
              >
                Switch to Free Plan
              </button>
            )}
          </div>
        </div>

        {/* PRO PLAN */}
        <div className={`relative rounded-2xl border ${
          currentPlan === "pro"
            ? "border-emerald-500/50 bg-gradient-to-b from-[#1A1F36] to-[#121626] ring-2 ring-emerald-500/30"
            : "border-indigo-500/40 bg-gradient-to-b from-[#181C32] to-[#111424] shadow-2xl"
        } p-6 sm:p-8 flex flex-col justify-between overflow-hidden`}>
          {/* Badge */}
          <div className="absolute top-4 right-4">
            <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-xs font-extrabold px-3 py-1 rounded-full shadow-md">
              RECOMMENDED
            </span>
          </div>

          <div className="space-y-6">
            <div>
              <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Enterprise & Growth
              </span>
              <h3 className="text-2xl font-bold text-white mt-1">HisabDo Pro</h3>
              <p className="text-xs text-slate-300 mt-1">
                Zero restrictions for growing distributors and busy merchants.
              </p>
            </div>

            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-extrabold text-white">Rs. 999</span>
              <span className="text-xs text-slate-400">/ month</span>
            </div>

            <p className="text-xs text-slate-300 bg-indigo-950/40 border border-indigo-500/20 p-3 rounded-xl">
              Includes unlimited daily invoice generation, statement exports, and ad-free experience.
            </p>

            {/* Features List */}
            <ul className="space-y-3.5 text-xs text-slate-200">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>Unlimited Invoices</strong> with custom shop logo & branding</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>Unlimited PDF exports</strong> for ledgers & reports</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Ad-Free experience across web & mobile app</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Multi-device cloud synchronization & automated backups</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Instant 24/7 AI Khata Assistant with priority responses</span>
              </li>
            </ul>
          </div>

          <div className="pt-8">
            {currentPlan === "pro" ? (
              <div className="w-full py-3 px-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold text-center flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Active Pro Membership
              </div>
            ) : (
              <button
                onClick={handleUpgrade}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-xl shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                Upgrade to Pro (Rs. 999/mo)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
