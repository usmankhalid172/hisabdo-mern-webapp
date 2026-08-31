"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const forgotSchema = z.object({
  email: z.string().email("Invalid email address"),
});



type ForgotFormData = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = () => {
    setSubmitted(true);
  };

  return (
        <div className="w-full max-w-md">
        <div className="bg-slate-900 border border-slate-800 w-full max-w-md p-8 rounded-2xl shadow-2xl">
        <h1 className="text-2xl font-bold text-white mb-1 text-center">Reset Password</h1>
        <p className="text-slate-400 text-sm mb-6 text-center">
          Enter your email to receive password reset instructions
        </p>

        {submitted ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-lg text-sm text-center space-y-3">
            <p>Password reset link has been sent to your email!</p>
            <Link href="/login" className="block font-semibold text-white underline">
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Email Address</label>
              <input
                {...register("email")}
                placeholder="name@company.com"
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
              />
              {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email.message}</p>}
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold py-2.5 rounded-lg transition"
            >
              Send Reset Link
            </button>
          </form>
        )}

        <p className="text-slate-400 text-xs text-center mt-6">
          Back to{" "}
          <Link href="/login" className="text-emerald-400 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}