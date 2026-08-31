import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Receipt,
  ShieldCheck,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col px-4 py-4 sm:p-8 lg:p-12">
      {/* Header Navigation */}
      <header className="w-full max-w-6xl mx-auto px-0 sm:px-4 lg:px-6 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-bold text-lg">
              H
            </div>

            <span className="font-bold text-lg sm:text-xl tracking-tight text-white">
              HisabDo App
            </span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="px-3 sm:px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Log In
            </Link>

            <Link
              href="/register"
              className="px-4 py-2 text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="w-full max-w-5xl mx-auto px-0 sm:px-4 lg:px-6 text-center pt-5 sm:pt-8 lg:pt-10 pb-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
          <span>Smart Local-First Khata</span>
        </div>

        {/* Main Heading */}
        <h1 className="mt-6 text-3xl leading-tight sm:text-5xl md:text-6xl font-extrabold tracking-tight">
          Manage Your{" "}
          <span className="text-emerald-400">
            Ledger &amp; Expenses
          </span>{" "}
          Effortlessly
        </h1>

        {/* Description */}
        <p className="mt-5 text-slate-400 text-sm leading-6 sm:text-lg sm:leading-7 max-w-2xl mx-auto">
          HisabDo helps shopkeepers, freelancers, and small businesses log
          balances, track payments, and manage daily expenses offline and
          securely.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 mt-7">
          <Link
            href="/register"
            className="w-full sm:w-auto min-h-12 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"
          >
            Create Free Account
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/login"
            className="w-full sm:w-auto min-h-12 px-6 py-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 font-semibold rounded-lg transition-colors flex items-center justify-center"
          >
            Sign In to Dashboard
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-10 sm:mt-14">
          {/* Digital Khata */}
          <div className="text-left bg-slate-900/60 border border-slate-800/80 p-5 sm:p-6 rounded-2xl backdrop-blur-sm">
            <BookOpen className="w-6 h-6 text-emerald-400 mb-3" />

            <h3 className="font-bold text-white text-base mb-1">
              Digital Khata
            </h3>

            <p className="text-slate-400 text-xs leading-relaxed">
              Keep clear track of &quot;Gave Money&quot; (Udhar) and
              &quot;Got Money&quot; with exact dates, categories, and payment
              notes.
            </p>
          </div>

          {/* Expense Tracker */}
          <div className="text-left bg-slate-900/60 border border-slate-800/80 p-5 sm:p-6 rounded-2xl backdrop-blur-sm">
            <Receipt className="w-6 h-6 text-emerald-400 mb-3" />

            <h3 className="font-bold text-white text-base mb-1">
              Daily Expense Tracker
            </h3>

            <p className="text-slate-400 text-xs leading-relaxed">
              Categorize daily business overheads like rent, utilities, and
              stock inventory to stay on top of daily cash flow.
            </p>
          </div>

          {/* Offline Architecture */}
          <div className="text-left bg-slate-900/60 border border-slate-800/80 p-5 sm:p-6 rounded-2xl backdrop-blur-sm">
            <ShieldCheck className="w-6 h-6 text-emerald-400 mb-3" />

            <h3 className="font-bold text-white text-base mb-1">
              Offline-First Architecture
            </h3>

            <p className="text-slate-400 text-xs leading-relaxed">
              Your data is stored locally on your device for lightning-fast
              loading and full control over your private records.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto px-0 sm:px-4 lg:px-6 py-6 text-center mt-auto">
        <p className="text-xs sm:text-sm text-slate-500">
          &copy; {new Date().getFullYear()} HisabDo App. Built for seamless
          business accounting.
        </p>
      </footer>
    </div>
  );
}