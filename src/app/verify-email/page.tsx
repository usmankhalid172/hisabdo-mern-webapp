"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Mail, RefreshCw, LogOut, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function VerifyEmailPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const [email, setEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push("/login");
          return;
        }

        if (user.email_confirmed_at) {
          router.push("/dashboard");
          return;
        }

        setEmail(user.email || "");
      } catch (err) {
        console.warn("Failed checking user verification status:", err);
      } finally {
        setChecking(false);
      }
    };

    checkUser();
  }, [router]);

  const handleResend = async () => {
    if (!email) {
      setError("Email address is missing. Please try logging in again.");
      return;
    }

    setResending(true);
    setMessage("");
    setError("");

    try {
      const supabase = createClient();
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (resendError) {
        setError(resendError.message);
      } else {
        setMessage("Verification email sent! Please check your inbox and spam folder.");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to resend verification email.");
    } finally {
      setResending(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (logout) {
        await logout();
      } else {
        const supabase = createClient();
        await supabase.auth.signOut();
        localStorage.removeItem("hisabdo_user");
        localStorage.removeItem("hisabdo_token");
        document.cookie = "hisabdo_auth_token=; path=/; max-age=0";
        router.push("/login");
      }
    } catch {
      router.push("/login");
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4">
            <Mail className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Check your inbox
          </h1>
          <p className="text-slate-400 text-sm">
            We sent a verification link to
          </p>
          <p className="text-emerald-400 font-semibold mt-1 break-all">{email || "your email"}</p>
        </div>

        {message && (
          <div className="mb-4 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-start gap-3 text-emerald-400 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">{message}</div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-3 text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">{error}</div>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleResend}
            disabled={resending}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resending ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>Resend verification email</span>
              </>
            )}
          </button>

          <button
            onClick={handleLogout}
            className="w-full text-slate-400 hover:text-white text-sm py-2 flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Back to Login</span>
          </button>
        </div>

        <p className="text-slate-500 text-xs text-center mt-6">
          Didn&apos;t receive the email? Check your spam folder.
        </p>
      </div>
    </div>
  );
}

