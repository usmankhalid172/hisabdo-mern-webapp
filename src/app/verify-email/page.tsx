"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Mail, RefreshCw, LogOut, CheckCircle2, AlertCircle } from "lucide-react";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;

    const checkUser = async () => {
      const requestedEmail =
        new URLSearchParams(window.location.search).get("email")?.trim() || "";
      const params = new URLSearchParams(window.location.search);
      if (params.get("error") === "verification_failed") {
        setError("That verification link is invalid or expired. You can request a new one.");
      }

      try {
        const supabase = createClient();
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (!active) return;

        if (userError && userError.name !== "AuthSessionMissingError") {
          setError(userError.message);
        }

        if (user?.email_confirmed_at) {
          router.replace("/dashboard");
          return;
        }

        setEmail(user?.email || requestedEmail);
        setChecking(false);
      } catch (checkError) {
        console.error("Unable to check verification status:", checkError);
        if (active) {
          setEmail(requestedEmail);
          setError("We could not check your verification status. You can still request a new link.");
          setChecking(false);
        }
      }
    };

    checkUser();

    return () => {
      active = false;
    };
  }, [router]);

  const handleResend = async () => {
    setResending(true);
    setMessage("");
    setError("");

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setError(error.message);
      } else {
        setMessage("Verification email sent! Please check your inbox.");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to resend verification email.");
    } finally {
      setResending(false);
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    localStorage.removeItem("hisabdo_user");
    localStorage.removeItem("hisabdo_token");
    document.cookie = "hisabdo_auth_token=; path=/; max-age=0";
    router.push("/login");
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
            Enter your email address to receive a verification link
          </p>
          {email ? (
            <p className="text-emerald-400 font-semibold mt-1 break-all">{email}</p>
          ) : (
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="mt-3 w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
            />
          )}
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
            disabled={resending || !email.trim()}
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
            className="w-full text-slate-400 hover:text-white text-sm py-2 flex items-center justify-center gap-2 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>

        <p className="text-slate-500 text-xs text-center mt-6">
          Didn&apos;t receive the email? Check your spam folder.
        </p>
      </div>
    </div>
  );
}