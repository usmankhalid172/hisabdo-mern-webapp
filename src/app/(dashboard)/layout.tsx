"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Receipt,
  BarChart3,
  Settings,
  ArrowRightLeft,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Globe,
  Store,
  ChevronDown,
  UserCheck,
  ShieldAlert,
  Calculator,
  FileText,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSettings, LanguageCode } from "@/context/SettingsContext";
import { AiChatbotWidget } from "@/components/AiChatbotWidget";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, isGuest, logout, loginAsGuest } = useAuth();
  const { theme, toggleTheme, language, setLanguage, t, isRTL, businessProfile } = useSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const navItems = [
    { name: t("dashboard"), href: "/dashboard", icon: LayoutDashboard },
    { name: t("customers"), href: "/customers", icon: Users },
    { name: t("transactions"), href: "/transactions", icon: ArrowRightLeft },
    { name: t("expenses"), href: "/expenses", icon: Receipt },
    { name: "Invoices & Bills", href: "/invoices", icon: FileText },
    { name: t("reports"), href: "/reports", icon: BarChart3 },
    { name: "Retail Calculator", href: "/calculator", icon: Calculator },
    { name: "Pricing & Pro", href: "/subscription", icon: Sparkles },
    { name: t("settings"), href: "/settings", icon: Settings },
  ];

  const languages: { code: LanguageCode; label: string }[] = [
    { code: "en", label: "English" },
    { code: "ur", label: "اردو (Urdu)" },
    { code: "ur_roman", label: "Roman Urdu" },
    { code: "hi", label: "हिंदी (Hindi)" },
    { code: "ar", label: "العربية (Arabic)" },
  ];

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-[#121212] text-slate-100" : "bg-[#F8F9FD] text-slate-900"} flex flex-col md:flex-row transition-colors duration-200`}>
      {/* Mobile Top Header */}
      <header className={`md:hidden flex items-center justify-between px-4 py-3 border-b sticky top-0 z-50 ${theme === "dark" ? "bg-[#1A1A1A] border-[#2A2A2A]" : "bg-white border-slate-200 shadow-sm"}`}>
        <div className="flex items-center gap-2.5">
          <img
            src="/logo.png"
            alt="HisabDo"
            className="w-8 h-8 rounded-lg object-contain shadow"
          />
          <div>
            <span className="font-bold text-base tracking-tight block">HisabDo</span>
            <span className="text-[10px] text-emerald-500 font-semibold block leading-none">
              {businessProfile.businessName || "Web Portal"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg ${theme === "dark" ? "text-slate-300 hover:bg-[#2A2A2A]" : "text-slate-600 hover:bg-slate-100"}`}
            title="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-900" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2 rounded-lg ${theme === "dark" ? "text-slate-300 hover:bg-[#2A2A2A]" : "text-slate-600 hover:bg-slate-100"}`}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Guest Mode Banner if browsing without full login */}
      {isGuest && (
        <div className="md:hidden bg-amber-500/10 border-b border-amber-500/20 px-4 py-1.5 text-xs text-amber-500 flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldAlert className="w-3.5 h-3.5" /> Guest Mode Active
          </span>
          <Link href="/login" className="underline font-semibold">
            Sign In
          </Link>
        </div>
      )}

      {/* Left Sidebar (Desktop + Mobile Drawer) */}
      <aside
        className={`${
          mobileMenuOpen ? "block" : "hidden"
        } md:flex flex-col justify-between w-full md:w-64 shrink-0 border-r md:sticky md:top-0 md:h-screen z-40 transition-colors duration-200 ${
          theme === "dark" ? "bg-[#181818] border-[#2A2A2A]" : "bg-white border-slate-200 shadow-sm"
        }`}
      >
        <div className="p-4 space-y-6">
          {/* Logo & Shop Info (Desktop) */}
          <div className="hidden md:flex items-center gap-3 px-2 py-1">
            <img
              src="/logo.png"
              alt="HisabDo Logo"
              className="w-10 h-10 rounded-xl object-contain shadow-md shadow-indigo-900/30"
            />
            <div className="overflow-hidden">
              <span className="font-extrabold text-lg tracking-tight block">HisabDo</span>
              <span className="text-[11px] text-emerald-500 font-semibold truncate block">
                {businessProfile.businessName || "Business Khata"}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                    isActive
                      ? "bg-[#1A237E] text-white shadow-md shadow-indigo-900/20 font-semibold"
                      : theme === "dark"
                      ? "text-slate-300 hover:bg-[#252525] hover:text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-emerald-400" : ""}`} />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Profile & Controls */}
        <div className={`p-4 border-t ${theme === "dark" ? "border-[#2A2A2A]" : "border-slate-200"} space-y-3`}>
          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium border ${
                theme === "dark" ? "bg-[#202020] border-[#303030] text-slate-300" : "bg-slate-50 border-slate-200 text-slate-700"
              }`}
            >
              <span className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-indigo-400" />
                {languages.find((l) => l.code === language)?.label}
              </span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>

            {langDropdownOpen && (
              <div
                className={`absolute bottom-full left-0 right-0 mb-1 rounded-xl border p-1 shadow-xl z-50 ${
                  theme === "dark" ? "bg-[#252525] border-[#353535]" : "bg-white border-slate-200"
                }`}
              >
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLanguage(l.code);
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      language === l.code
                        ? "bg-[#1A237E] text-white"
                        : theme === "dark"
                        ? "text-slate-300 hover:bg-[#303030]"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Status Card */}
          <div className={`p-3 rounded-xl border flex items-center justify-between ${
            theme === "dark" ? "bg-[#202020] border-[#303030]" : "bg-slate-50 border-slate-200"
          }`}>
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                {user?.name?.[0]?.toUpperCase() || "M"}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold truncate leading-tight">
                  {user?.name || (isGuest ? "Guest User" : "Merchant")}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {isGuest ? "Guest Account" : user?.email || "Connected"}
                </p>
              </div>
            </div>

            <button
              onClick={() => logout()}
              title="Logout"
              className={`p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors`}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Top Bar */}
        <header className={`hidden md:flex items-center justify-between px-8 py-4 border-b ${
          theme === "dark" ? "bg-[#181818]/60 border-[#2A2A2A]" : "bg-white/80 border-slate-200 shadow-sm"
        } backdrop-blur-md sticky top-0 z-30`}>
          <div className="flex items-center gap-3">
            <Store className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-sm font-bold tracking-tight">{businessProfile.businessName || "HisabDo Web App"}</h2>
              <p className="text-[11px] text-slate-400">
                {businessProfile.address || "Digital Cloud & Local Ledger"}
              </p>
            </div>
            {isGuest && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded-full ml-2">
                <ShieldAlert className="w-3 h-3" /> Guest Mode
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl border flex items-center gap-2 text-xs font-medium transition-colors ${
                theme === "dark"
                  ? "bg-[#202020] border-[#303030] text-slate-300 hover:bg-[#282828]"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              {theme === "dark" ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" /> Light Mode
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-900" /> Dark Mode
                </>
              )}
            </button>

            <Link
              href="/customers"
              className="px-3.5 py-1.5 text-xs font-semibold bg-[#00E676] hover:bg-[#00C853] text-[#0B0F17] rounded-xl transition-all shadow-sm flex items-center gap-1.5"
            >
              + {t("addCustomer")}
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto pb-24 md:pb-8">
          {children}
        </main>

        {/* Mobile Bottom Navigation Bar (Matching Flutter Mobile App) */}
        <div className={`md:hidden fixed bottom-0 left-0 right-0 border-t py-2 px-4 flex items-center justify-around z-40 ${
          theme === "dark" ? "bg-[#181818] border-[#2A2A2A]" : "bg-white border-slate-200 shadow-lg"
        }`}>
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
                  isActive
                    ? "text-[#00E676] font-bold"
                    : theme === "dark"
                    ? "text-slate-400"
                    : "text-slate-500"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-[#00E676]" : ""}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Floating AI Chatbot Widget */}
      <AiChatbotWidget />
    </div>
  );
}