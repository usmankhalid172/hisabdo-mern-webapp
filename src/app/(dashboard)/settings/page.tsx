"use client";

import React, { useState } from "react";
import {
  Globe,
  DollarSign,
  Store,
  Save,
  Check,
  Shield,
  Trash2,
  LogOut,
  Sun,
  Moon,
  Upload,
  User,
  Phone,
  MapPin,
  Mail,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSettings, LanguageCode, CurrencyCode } from "@/context/SettingsContext";

export default function SettingsPage() {
  const { user, logout, isGuest } = useAuth();
  const {
    theme,
    toggleTheme,
    language,
    setLanguage,
    currency,
    setCurrency,
    businessProfile,
    updateBusinessProfile,
    t,
  } = useSettings();

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [profileForm, setProfileForm] = useState({
    businessName: businessProfile.businessName || "",
    ownerName: businessProfile.ownerName || "",
    phone: businessProfile.phone || "",
    address: businessProfile.address || "",
    email: businessProfile.email || "",
    taxNumber: businessProfile.taxNumber || "",
  });

  const languages: { code: LanguageCode; label: string; desc: string }[] = [
    { code: "en", label: "English", desc: "Default international format" },
    { code: "ur", label: "اردو (Urdu)", desc: "مکمل اردو ترجمہ اور دائیں سے بائیں (RTL)" },
    { code: "ur_roman", label: "Roman Urdu", desc: "Aasan Roman Urdu me hisab kitab" },
    { code: "hi", label: "हिंदी (Hindi)", desc: "हिंदी भाषा और भारतीय संदर्भ" },
    { code: "ar", label: "العربية (Arabic)", desc: "اللغة العربية ودعم RTL الكامل" },
  ];

  const currencies: { code: CurrencyCode; label: string; symbol: string }[] = [
    { code: "PKR", label: "Pakistani Rupee", symbol: "Rs." },
    { code: "USD", label: "United States Dollar", symbol: "$" },
    { code: "AED", label: "UAE Dirham", symbol: "AED" },
    { code: "SAR", label: "Saudi Riyal", symbol: "SAR" },
    { code: "INR", label: "Indian Rupee", symbol: "₹" },
    { code: "EUR", label: "Euro", symbol: "€" },
    { code: "GBP", label: "British Pound", symbol: "£" },
  ];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusinessProfile(profileForm);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleResetCache = () => {
    if (confirm("Are you sure you want to clear local application cache and sign out?")) {
      localStorage.clear();
      logout();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
          {t("settings")}
        </h1>
        <p className="text-sm text-slate-400">
          Customize your business identity, language, currency, and visual appearance
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-3 text-emerald-400 text-sm">
          <Check className="w-5 h-5 flex-shrink-0" />
          <span>Settings and business profile saved successfully!</span>
        </div>
      )}

      {/* 1. Business Profile Section */}
      <div className={`p-6 rounded-2xl border ${
        theme === "dark" ? "bg-[#1E1E1E] border-[#2E2E2E]" : "bg-white border-slate-200 shadow-sm"
      } space-y-5`}>
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800/40">
          <Store className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-bold tracking-tight">
            {t("businessProfile")}
          </h2>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Business / Shop Name *</label>
              <input
                type="text"
                required
                value={profileForm.businessName}
                onChange={(e) => setProfileForm({ ...profileForm, businessName: e.target.value })}
                placeholder="e.g. Hamza Traders Enterprise"
                className={`w-full px-3 py-2 rounded-xl text-sm border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                  theme === "dark" ? "bg-[#252525] border-[#353535] text-white" : "bg-slate-50 border-slate-200"
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Owner / Merchant Name</label>
              <input
                type="text"
                value={profileForm.ownerName}
                onChange={(e) => setProfileForm({ ...profileForm, ownerName: e.target.value })}
                placeholder="e.g. Hamza Merchant"
                className={`w-full px-3 py-2 rounded-xl text-sm border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                  theme === "dark" ? "bg-[#252525] border-[#353535] text-white" : "bg-slate-50 border-slate-200"
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Contact Phone (WhatsApp)</label>
              <input
                type="text"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                placeholder="+92 300 1234567"
                className={`w-full px-3 py-2 rounded-xl text-sm border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                  theme === "dark" ? "bg-[#252525] border-[#353535] text-white" : "bg-slate-50 border-slate-200"
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Official Business Email</label>
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                placeholder="billing@hisabdo.com"
                className={`w-full px-3 py-2 rounded-xl text-sm border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                  theme === "dark" ? "bg-[#252525] border-[#353535] text-white" : "bg-slate-50 border-slate-200"
                }`}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold mb-1">Business Address & Market</label>
              <input
                type="text"
                value={profileForm.address}
                onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                placeholder="Shop #, Plaza / Market Name, City, Country"
                className={`w-full px-3 py-2 rounded-xl text-sm border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                  theme === "dark" ? "bg-[#252525] border-[#353535] text-white" : "bg-slate-50 border-slate-200"
                }`}
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-[#00E676] hover:bg-[#00C853] text-[#0B0F17] font-bold text-xs rounded-xl shadow-md transition"
            >
              <Save className="w-4 h-4" />
              <span>Save Business Profile</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. Localization & Language Switch */}
      <div className={`p-6 rounded-2xl border ${
        theme === "dark" ? "bg-[#1E1E1E] border-[#2E2E2E]" : "bg-white border-slate-200 shadow-sm"
      } space-y-4`}>
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800/40">
          <Globe className="w-5 h-5 text-indigo-400" />
          <div>
            <h2 className="text-base font-bold tracking-tight">{t("language")} & Region</h2>
            <p className="text-xs text-slate-400">Choose your preferred language and native RTL formatting</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {languages.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => setLanguage(l.code)}
              className={`p-4 rounded-xl border text-left transition-all ${
                language === l.code
                  ? "bg-[#1A237E] border-indigo-500 text-white shadow-md shadow-indigo-900/30"
                  : theme === "dark"
                  ? "bg-[#252525] border-[#323232] hover:bg-[#282828] text-slate-300"
                  : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm">{l.label}</span>
                {language === l.code && <Check className="w-4 h-4 text-emerald-400" />}
              </div>
              <p className={`text-[11px] mt-1 ${language === l.code ? "text-indigo-200" : "text-slate-400"}`}>
                {l.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Currency Selector */}
      <div className={`p-6 rounded-2xl border ${
        theme === "dark" ? "bg-[#1E1E1E] border-[#2E2E2E]" : "bg-white border-slate-200 shadow-sm"
      } space-y-4`}>
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800/40">
          <DollarSign className="w-5 h-5 text-indigo-400" />
          <div>
            <h2 className="text-base font-bold tracking-tight">{t("currency")}</h2>
            <p className="text-xs text-slate-400">Default accounting currency symbol and formatting</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {currencies.map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => setCurrency(c.code)}
              className={`p-3.5 rounded-xl border text-center transition-all ${
                currency === c.code
                  ? "bg-emerald-500/20 border-emerald-500/40 text-[#00E676] font-bold"
                  : theme === "dark"
                  ? "bg-[#252525] border-[#323232] hover:bg-[#282828] text-slate-300"
                  : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
              }`}
            >
              <span className="text-lg font-black block">{c.symbol}</span>
              <span className="text-xs font-semibold block mt-0.5">{c.code}</span>
              <span className="text-[10px] text-slate-400 block truncate">{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Appearance & Cache Security */}
      <div className={`p-6 rounded-2xl border ${
        theme === "dark" ? "bg-[#1E1E1E] border-[#2E2E2E]" : "bg-white border-slate-200 shadow-sm"
      } space-y-4`}>
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800/40">
          <Shield className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-bold tracking-tight">{t("appearance")} & Security</h2>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold">Theme Mode</p>
            <p className="text-xs text-slate-400">Switch between dark mode and light mode</p>
          </div>
          <button
            onClick={toggleTheme}
            className={`px-4 py-2 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 ${
              theme === "dark" ? "bg-[#252525] border-[#353535] text-slate-200" : "bg-slate-100 border-slate-200 text-slate-700"
            }`}
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-900" />}
            <span>{theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}</span>
          </button>
        </div>

        <div className="pt-4 border-t border-slate-800/40 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-rose-400">Clear Application Cache</p>
            <p className="text-xs text-slate-400">Remove stored local storage session and reset data</p>
          </div>
          <button
            onClick={handleResetCache}
            className="px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 font-bold text-xs flex items-center justify-center gap-1.5 transition"
          >
            <Trash2 className="w-4 h-4" />
            <span>Reset Cache & Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}