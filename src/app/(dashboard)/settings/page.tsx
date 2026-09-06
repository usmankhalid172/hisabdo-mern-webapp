"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Bell,
  Lock,
  Globe,
  Database,
  Save,
  Check,
  Shield,
  Trash2,
  LogOut,
} from "lucide-react";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [saved, setSaved] = useState(false);
  const [currency, setCurrency] = useState("PKR");
  const [offlineSync, setOfflineSync] = useState(true);
  const [notifications, setNotifications] = useState(true);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClearCache = () => {
    if (
      confirm(
        "Are you sure you want to clear local application cache? You will be signed out."
      )
    ) {
      localStorage.clear();
      logout();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Application Settings</h1>
        <p className="text-slate-400 text-sm">
          Configure your merchant accounting preferences, security, and cache storage
        </p>
      </div>

      <div className="space-y-4">
        {/* Account Details */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            Account & Merchant Identity
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Active Account Email
              </label>
              <input
                disabled
                value={user?.email || "merchant@hisabdo.com"}
                className="w-full bg-slate-950/80 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 text-sm cursor-not-allowed font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Merchant Role
              </label>
              <input
                disabled
                value={user?.role === "admin" ? "Merchant Administrator" : "Store Merchant Owner"}
                className="w-full bg-slate-950/80 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 text-sm cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* General Preferences */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-400" />
            Accounting & Regional Preferences
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Default Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
              >
                <option value="PKR">PKR - Pakistani Rupee (Rs.)</option>
                <option value="USD">USD - US Dollar ($)</option>
                <option value="AED">AED - UAE Dirham (د.إ)</option>
                <option value="SAR">SAR - Saudi Riyal (﷼)</option>
                <option value="EUR">EUR - Euro (€)</option>
                <option value="GBP">GBP - British Pound (£)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Color Theme
              </label>
              <input
                disabled
                value="Dark Slate (HisabDo Standard)"
                className="w-full bg-slate-950/50 border border-slate-800 text-slate-500 rounded-xl px-3 py-2 text-sm cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Storage & Sync */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            Local Storage & Sync Preferences
          </h2>

          <div className="flex items-center justify-between py-2 border-b border-slate-800/60">
            <div>
              <p className="text-sm font-medium text-white">Offline Local Cache</p>
              <p className="text-xs text-slate-400">
                Automatically cache Khata ledger entries in browser memory
              </p>
            </div>
            <input
              type="checkbox"
              checked={offlineSync}
              onChange={(e) => setOfflineSync(e.target.checked)}
              className="w-4 h-4 accent-emerald-500 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between py-2 border-b border-slate-800/60">
            <div>
              <p className="text-sm font-medium text-white">SMS / WhatsApp Reminders</p>
              <p className="text-xs text-slate-400">
                Enable 1-click WhatsApp dues reminder links in customer ledgers
              </p>
            </div>
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
              className="w-4 h-4 accent-emerald-500 cursor-pointer"
            />
          </div>

          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <button
              onClick={handleClearCache}
              className="text-xs text-rose-400 hover:text-rose-300 font-medium transition flex items-center gap-1.5 self-start"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Local Storage Cache</span>
            </button>

            <button
              onClick={logout}
              className="text-xs text-slate-400 hover:text-rose-400 font-medium transition flex items-center gap-1.5 self-start"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out of Current Session</span>
            </button>
          </div>
        </div>

        {/* Save Action */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleSave}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl transition flex items-center gap-2 text-sm shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4" />
                <span>Settings Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Preferences</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}