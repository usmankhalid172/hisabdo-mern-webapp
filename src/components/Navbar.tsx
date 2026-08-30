'use client';

import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/60 bg-[#0B0F17]/80 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center border border-emerald-500/30">
            H
          </div>
          <span className="font-semibold text-lg tracking-tight text-white">HisabDo</span>
        </Link>

        {/* Center Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <Link href="/features" className="hover:text-emerald-400 transition-colors">Features</Link>
          <Link href="/pricing" className="hover:text-emerald-400 transition-colors">Pricing</Link>
          <Link href="/contact" className="hover:text-emerald-400 transition-colors">Contact</Link>
        </nav>

        {/* Auth CTA Buttons */}
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Log In
          </Link>
          <Link href="/register" className="btn-emerald">
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}