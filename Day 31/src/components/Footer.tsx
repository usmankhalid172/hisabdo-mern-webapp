import Link from "next/link";
import { Wallet } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 py-10 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xl mb-3">
            <Wallet className="h-6 w-6" />
            <span>HisabDo</span>
          </div>
          <p className="text-sm">Local-first digital ledger & daily expense tracking for small businesses and individuals.</p>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3 text-sm">Product</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/features" className="hover:text-emerald-400">Features</Link></li>
            <li><Link href="/pricing" className="hover:text-emerald-400">Pricing</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3 text-sm">Company</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/about" className="hover:text-emerald-400">About Us</Link></li>
            <li><Link href="/contact" className="hover:text-emerald-400">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3 text-sm">Support</h4>
          <p className="text-sm">Email: <span className="text-emerald-400">hisabdo.app@gmail.com</span></p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-slate-900 text-xs text-center text-slate-500">
        © {new Date().getFullYear()} HisabDo. All rights reserved.
      </div>
    </footer>
  );
}