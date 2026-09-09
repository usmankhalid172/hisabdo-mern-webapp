"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { loginSchema, LoginFormData } from "@/lib/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/dashboard";

  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDemoLoggingIn, setIsDemoLoggingIn] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setAuthError(null);
    setIsSubmitting(true);

    try {
      const result = await login(data.email, data.password);

      if (!result.success) {
        setAuthError(result.message || "Invalid credentials. Please try again.");
        return;
      }

      router.replace(redirectUrl);
    } catch (err) {
      setAuthError("Unable to connect to the authentication server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string, demoPass: string) => {
    setAuthError(null);
    setIsDemoLoggingIn(true);
    setValue("email", demoEmail);
    setValue("password", demoPass);

    try {
      const result = await login(demoEmail, demoPass);
      if (result.success) {
        router.replace(redirectUrl);
      } else {
        setAuthError(result.message || "Demo login failed.");
      }
    } catch {
      setAuthError("Failed to authenticate demo account.");
    } finally {
      setIsDemoLoggingIn(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-xl p-8 rounded-2xl shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-2">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h1>
          <p className="text-slate-400 text-xs">
            Sign in to access your merchant Khata ledger & business cashbook
          </p>
        </div>

        {/* Error Alert */}
        {authError && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-3 text-rose-400 text-xs animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">{authError}</div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                {...register("email")}
                placeholder="merchant@hisabdo.com"
                disabled={isSubmitting || isDemoLoggingIn}
                className="w-full bg-slate-950/80 border border-slate-800 text-white rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition disabled:opacity-50"
              />
            </div>
            {errors.email && (
              <p className="text-[11px] text-rose-400 font-medium mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">Password</label>
              <Link
                href="/forgot-password"
                className="text-xs text-emerald-400 hover:text-emerald-300 transition"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                placeholder="••••••••"
                disabled={isSubmitting || isDemoLoggingIn}
                className="w-full bg-slate-950/80 border border-slate-800 text-white rounded-xl pl-9 pr-10 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-0.5 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-[11px] text-rose-400 font-medium mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || isDemoLoggingIn}
            className="w-full bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-slate-950 font-bold py-2.5 rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* 1-Click Demo Evaluation Login */}
        <div className="pt-3 border-t border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Quick 1-Click Evaluation Login:</span>
            <span className="flex items-center gap-1 text-emerald-500 font-semibold">
              <Zap className="w-3 h-3 fill-emerald-500" /> Instant Access
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin("merchant@hisabdo.com", "password123")}
              disabled={isSubmitting || isDemoLoggingIn}
              className="px-3 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 hover:border-slate-700 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Demo Merchant</span>
            </button>

            <button
              type="button"
              onClick={() =>
                handleDemoLogin("hamza.merchant@hisabdo.com", "password123")
              }
              disabled={isSubmitting || isDemoLoggingIn}
              className="px-3 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 hover:border-slate-700 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>Hamza Admin</span>
            </button>
          </div>
        </div>

        {/* Footer Link */}
        <p className="text-slate-400 text-xs text-center pt-2">
          Don't have a merchant account?{" "}
          <Link
            href="/register"
            className="text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-4 transition"
          >
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md p-8 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}