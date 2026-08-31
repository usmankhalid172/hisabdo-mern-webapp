"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col p-4 sm:p-6">
      {/* Header */}
      <header className="w-full max-w-6xl mx-auto flex flex-col gap-4 py-2 sm:flex-row sm:items-center sm:justify-between">
        {/* Back to Home */}
        <Link
          href="/"
          className="self-start inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 px-3 py-2 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
          <span>Back to Home</span>
        </Link>

        {/* Logo */}
        <div className="flex items-center gap-2 self-center sm:self-auto">
          <div className="w-7 h-7 rounded-md bg-emerald-500 flex items-center justify-center text-slate-950 font-bold text-sm shrink-0">
            H
          </div>

          <span className="font-bold text-base tracking-tight text-white whitespace-nowrap">
            HisabDo
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full flex items-center justify-center py-8 sm:py-10">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center text-xs text-slate-600 py-2">
        &copy; {new Date().getFullYear()} HisabDo App. All rights reserved.
      </footer>
    </div>
  );
}