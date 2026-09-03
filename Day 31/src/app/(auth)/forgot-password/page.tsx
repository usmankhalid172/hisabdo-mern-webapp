"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { forgotSchema, ForgotFormData } from "@/lib/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  KeyRound,
  Mail,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotFormData) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        setErrorMessage(result.message || "Failed to process password reset.");
        return;
      }

      setSubmittedEmail(data.email);
    } catch {
      setErrorMessage("Network error while connecting to server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-xl p-8 rounded-2xl shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-2">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Reset Password</h1>
          <p className="text-slate-400 text-xs">
            Enter your account email to receive recovery instructions
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-3 text-rose-400 text-xs animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">{errorMessage}</div>
          </div>
        )}

        {submittedEmail ? (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Reset Link Dispatched</h3>
            <p className="text-xs text-slate-300">
              We have sent password recovery instructions to:
              <br />
              <strong className="text-emerald-400 font-mono text-xs">{submittedEmail}</strong>
            </p>
            <p className="text-[11px] text-slate-400">
              Please check your spam or inbox folders. For security, the link expires in 30 minutes.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition shadow-lg shadow-emerald-500/20 w-full mt-2"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Registered Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  {...register("email")}
                  placeholder="name@company.com"
                  disabled={isSubmitting}
                  className="w-full bg-slate-950/80 border border-slate-800 text-white rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition disabled:opacity-50"
                />
              </div>
              {errors.email && (
                <p className="text-[11px] text-rose-400 font-medium mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Dispatching Link...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Reset Instructions</span>
                </>
              )}
            </button>
          </form>
        )}

        <div className="text-center pt-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}