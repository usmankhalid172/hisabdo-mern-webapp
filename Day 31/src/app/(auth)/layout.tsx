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
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between p-4 sm:p-6">
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-2">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 px-3 py-2 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>

        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-emerald-500 flex items-center justify-center text-slate-950 font-bold text-xs">
            H
          </div>
          <span className="font-bold text-sm tracking-tight text-white">
            HisabDo
          </span>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center my-auto">
        {children}
      </main>
      <footer className="text-center text-xs text-slate-600 py-2">
        &copy; {new Date().getFullYear()} HisabDo App. All rights reserved.
      </footer>
    </div>
  );
}