'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../hooks/useAuth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setAuthError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setAuthError(
          result.message || "Invalid email or password. Please try again."
        );
        return;
      }

      router.replace("/dashboard");
    } catch (error) {
      console.error("Login error:", error);

      setAuthError(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md p-8 rounded-2xl shadow-2xl">
        <h1 className="text-2xl font-bold text-white mb-1 text-center">
          Welcome Back
        </h1>

        <p className="text-slate-400 text-sm mb-6 text-center">
          Log in to manage your business ledger
        </p>
        {authError && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-center gap-2 text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{authError}</span>
          </div>
        )}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Email
            </label>

            <input
              type="email"
              {...register("email")}
              placeholder="name@company.com"
              disabled={loading}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 disabled:opacity-50"
            />

            {errors.email && (
              <p className="text-xs text-rose-500 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">

              <label className="block text-xs font-semibold text-slate-400">
                Password
              </label>

              <Link
                href="/forgot-password"
                className="text-xs text-emerald-400 hover:underline"
              >
                Forgot Password?
              </Link>

            </div>

            <input
              type="password"
              {...register("password")}
              placeholder="••••••••"
              disabled={loading}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 disabled:opacity-50"
            />

            {errors.password && (
              <p className="text-xs text-rose-500 mt-1">
                {errors.password.message}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-700 disabled:cursor-not-allowed text-slate-950 font-semibold py-2.5 rounded-lg transition cursor-pointer"
          >
            {loading ? "Logging In..." : "Log In"}
          </button>

        </form>
        <p className="text-slate-400 text-xs text-center mt-6">
          Don't have an account?{" "}

          <Link
            href="/register"
            className="text-emerald-400 hover:underline"
          >
            Register
          </Link>
        </p>

      </div>
    </div>
  );
}