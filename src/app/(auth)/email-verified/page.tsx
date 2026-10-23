
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function EmailVerifiedPage() {
  return (
    <div className="w-full max-w-md">
      <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-xl p-8 rounded-2xl shadow-2xl space-y-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Email Verified!
          </h1>
          <p className="text-slate-400 text-sm leading-6">
            Your email has been successfully verified. You can now sign in to
            your HisabDo account.
          </p>
        </div>

        <Link
          href="/login"
          className="w-full px-4 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-sm font-semibold transition flex items-center justify-center"
        >
          Go to sign in
        </Link>
      </div>
    </div>
  );
}
