"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Check, X, ShieldCheck } from "lucide-react";
import { subscriptionService } from "@/services/subscriptionService";

interface UpgradeProModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  featureName?: string;
  onUpgraded?: () => void;
}

export function UpgradeProModal({
  isOpen,
  onClose,
  userId,
  featureName = "Invoices or PDF Exports",
  onUpgraded,
}: UpgradeProModalProps) {
  if (!isOpen) return null;

  const handleUpgrade = () => {
    subscriptionService.setPlan(userId, "pro");
    if (onUpgraded) onUpgraded();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md rounded-2xl bg-gradient-to-b from-[#1E1E2E] to-[#12121A] border border-indigo-500/30 p-6 text-white shadow-2xl overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/20 blur-3xl rounded-full pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xs uppercase font-extrabold tracking-wider text-indigo-400">
              Daily Limit Reached
            </span>
            <h3 className="text-xl font-bold text-white">Upgrade to HisabDo Pro</h3>
          </div>
        </div>

        <p className="text-sm text-slate-300 mb-5 leading-relaxed">
          You have reached your daily free limit of <strong className="text-white">5 {featureName}</strong> today. Upgrade to Pro for unlimited access and an ad-free business experience.
        </p>

        {/* Feature List */}
        <div className="space-y-2.5 mb-6 bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2.5 text-xs text-slate-200">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span><strong>Unlimited Invoices</strong> with custom business branding</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-slate-200">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span><strong>Unlimited PDF statement exports</strong> & customer summaries</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-slate-200">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Instant WhatsApp & SMS reminders with zero delay</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-slate-200">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Multi-device cloud synchronization & automatic backups</span>
          </div>
        </div>

        {/* Pricing info */}
        <div className="flex items-baseline justify-between mb-6 px-1">
          <div>
            <span className="text-2xl font-extrabold text-white">Rs. 999</span>
            <span className="text-xs text-slate-400"> / month</span>
          </div>
          <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-4 h-4" /> Cancel anytime
          </span>
        </div>

        {/* Actions */}
        <div className="space-y-2.5">
          <button
            onClick={handleUpgrade}
            className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Activate HisabDo Pro
          </button>
          <Link
            href="/subscription"
            onClick={onClose}
            className="w-full block text-center py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
          >
            View all plan details →
          </Link>
        </div>
      </div>
    </div>
  );
}
