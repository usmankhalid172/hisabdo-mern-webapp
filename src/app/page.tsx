import Link from "next/link";
import Navbar from "@/components/Navbar"; // Uses the Navbar we created earlier

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col justify-between overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-emerald-500/10 blur-[150px] rounded-full pointer-events-none" />

      {/* Top Navigation */}
      <header className="relative z-10 flex justify-between items-center px-6 py-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
            H
          </div>
          <span className="font-bold text-xl tracking-tight text-white">HisabDo</span>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Log In
          </Link>
          <Link href="/register" className="py-2 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20">
            Get Started
          </Link>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-16 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Smart Local-First Khata
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Manage Your <span className="text-emerald-400">Ledger</span> & <br />
          <span className="text-emerald-400">Expenses</span> Effortlessly
        </h1>

        <p className="text-slate-400 text-base sm:text-lg max-w-2xl mt-6">
          HisabDo helps shopkeepers, freelancers, and small businesses log balances, track payments, and manage daily expenses offline and securely.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mt-8">
          <Link
            href="/register"
            className="w-full sm:w-auto py-3.5 px-6 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2"
          >
            Create Free Account →
          </Link>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto py-3.5 px-6 bg-[#111726]/80 hover:bg-[#161f33] border border-slate-700/80 text-white font-semibold rounded-xl text-sm transition-all shadow-md"
          >
            Go to Dashboard
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full text-left">
          <div className="bg-[#111726]/80 border border-slate-800/80 p-6 rounded-2xl backdrop-blur-md">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">📖</div>
            <h3 className="font-bold text-white text-base mb-1">Digital Khata</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Keep clear track of Udhar and Got Money with exact dates, categories, and payment notes.</p>
          </div>

          <div className="bg-[#111726]/80 border border-slate-800/80 p-6 rounded-2xl backdrop-blur-md">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">🧾</div>
            <h3 className="font-bold text-white text-base mb-1">Daily Expense Tracker</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Categorize daily business overheads like rent, utilities, and stock inventory to stay on top of daily cash flow.</p>
          </div>

          <div className="bg-[#111726]/80 border border-slate-800/80 p-6 rounded-2xl backdrop-blur-md">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">🛡️</div>
            <h3 className="font-bold text-white text-base mb-1">Offline-First Architecture</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Your data is stored locally on your device for lightning-fast loading and full control over private records.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-xs text-slate-500 border-t border-slate-800/60">
        © 2026 HisabDo App. Built for seamless business accounting.
      </footer>
    </div>
  );
}