"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role?: "user" | "admin";
  phone?: string;
  shopName?: string;
  isGuest?: boolean;
}

export interface Branch {
  id: string;
  name: string;
  location: string;
  type: string;
  cashBalance: number;
}

export interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isGuest: boolean;
  activeBranch?: Branch;
  setActiveBranch?: (branch: Branch) => void;
  login: (email: string, password: string) => Promise<{
    success: boolean;
    message?: string;
    needsVerification?: boolean;
    email?: string;
  }>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    shopName?: string;
  }) => Promise<{ success: boolean; message?: string; requiresConfirmation?: boolean }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message?: string }>;
  loginAsGuest: () => void;
  loginAsDemo: () => void;
  endDemoSession: () => void;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; message?: string }>;
  quickDemoLogin: () => Promise<void>;
}

const DEFAULT_BRANCH: Branch = {
  id: "branch-1",
  name: "Main Branch",
  location: "Main Market",
  type: "General Store",
  cashBalance: 0,
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize and verify session on load
  const verifySession = useCallback(async () => {
    try {
      // 0. Clean legacy mock data from local storage if present
      if (typeof window !== "undefined") {
        const keysToClean = [
          "hisabdo_guest_customers", "hisabdo_guest_incomes", "hisabdo_guest_expenses", "hisabdo_guest_ledger_txs",
          "hisabdo_demo-user-1_customers", "hisabdo_demo-user-1_incomes", "hisabdo_demo-user-1_expenses", "hisabdo_demo-user-1_ledger_txs",
          "hisabdo_customers", "hisabdo_expenses", "hisabdo_transactions"
        ];
        keysToClean.forEach((k) => {
          try {
            const val = localStorage.getItem(k);
            if (val && (val.includes("cust-1") || val.includes("inc-1") || val.includes("tx-1") || val.includes("Ali Traders"))) {
              localStorage.removeItem(k);
            }
          } catch {}
        });
      }

      // 1. Check local storage cache first for instant UI response
      const cachedUser = localStorage.getItem("hisabdo_user");
      const cachedToken = localStorage.getItem("hisabdo_token");

      if (cachedUser && cachedToken) {
        try {
          const parsed = JSON.parse(cachedUser);
          if (parsed && (parsed.id === "demo-user-1" || parsed.email === "merchant@hisabdo.com")) {
            parsed.id = "54fed992-4a4f-4669-9c52-161ae531dfe0";
            localStorage.setItem("hisabdo_user", JSON.stringify(parsed));
          }
          setUser(parsed);
          setToken(cachedToken);
          setIsLoading(false);
        } catch {}
      }

      // 2. Check Supabase session
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();

      if (data?.session?.user) {
        const suUser = data.session.user;
        const profile: UserProfile = {
          id: suUser.id,
          name: suUser.user_metadata?.full_name || suUser.email?.split("@")[0] || "Merchant",
          email: suUser.email || "",
          phone: suUser.user_metadata?.phone || "",
          shopName: suUser.user_metadata?.business_name || "HisabDo Store",
          isGuest: false,
        };
        setUser(profile);
        setToken(data.session.access_token);
        localStorage.setItem("hisabdo_user", JSON.stringify(profile));
        localStorage.setItem("hisabdo_token", data.session.access_token);
      } else if (cachedToken && (cachedToken === "demo-token" || cachedToken === "guest-token")) {
        // Keep demo / guest session active if cached
      } else {
        // Verify with backend /api/auth/me if local token exists
        try {
          const res = await fetch("/api/auth/me", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
          });
          if (res.ok) {
            const resData = await res.json();
            if (resData.success && resData.user) {
              setUser(resData.user);
              localStorage.setItem("hisabdo_user", JSON.stringify(resData.user));
              return;
            }
          }
        } catch {}

        // If no active session, clean up stale unauthenticated state
        setUser(null);
        setToken(null);
        localStorage.removeItem("hisabdo_user");
        localStorage.removeItem("hisabdo_token");
      }
    } catch (err) {
      console.warn("Session verification warning:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    verifySession();

    // Listen to Supabase auth state changes
    try {
      const supabase = createClient();
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const profile: UserProfile = {
            id: session.user.id,
            name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "Merchant",
            email: session.user.email || "",
            phone: session.user.user_metadata?.phone || "",
            shopName: session.user.user_metadata?.business_name || "HisabDo Store",
            isGuest: false,
          };
          setUser(profile);
          setToken(session.access_token);
          localStorage.setItem("hisabdo_user", JSON.stringify(profile));
          localStorage.setItem("hisabdo_token", session.access_token);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    } catch {}
  }, [verifySession]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // 1. Attempt Supabase authentication
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // Handle Supabase error
      if (error) {
        const errorMsg = error.message.toLowerCase();
        if (errorMsg.includes("email not confirmed") || errorMsg.includes("not verified")) {
          return {
            success: false,
            message: "Please verify your email before logging in.",
            needsVerification: true,
            email,
          };
        }

        // Try backend API /api/auth/login as fallback for registered accounts
        try {
          const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });

          const apiData = await res.json();
          if (res.ok && apiData.success && apiData.user) {
            setUser(apiData.user);
            setToken(apiData.token);
            localStorage.setItem("hisabdo_user", JSON.stringify(apiData.user));
            localStorage.setItem("hisabdo_token", apiData.token);
            document.cookie = `hisabdo_auth_token=${apiData.token}; path=/; max-age=86400`;
            return { success: true };
          }
        } catch {}

        if (errorMsg.includes("invalid login credentials") || errorMsg.includes("invalid")) {
          return { success: false, message: "Invalid email or password." };
        }

        return { success: false, message: error.message };
      }

      // Check if email confirmation is required by Supabase
      if (data?.user) {
        if (!data.user.email_confirmed_at && data.user.identities && data.user.identities.length > 0) {
          // If Supabase has email confirmation enabled and user has not confirmed yet
          const isConfirmed = !!data.user.email_confirmed_at;
          if (!isConfirmed && !data.session) {
            return {
              success: false,
              message: "Please verify your email before logging in.",
              needsVerification: true,
              email,
            };
          }
        }

        const profile: UserProfile = {
          id: data.user.id,
          name: data.user.user_metadata?.full_name || data.user.email?.split("@")[0] || "Merchant",
          email: data.user.email || "",
          phone: data.user.user_metadata?.phone || "",
          shopName: data.user.user_metadata?.business_name || "HisabDo Store",
          isGuest: false,
        };
        setUser(profile);
        const accessToken = data.session?.access_token || "";
        setToken(accessToken);
        localStorage.setItem("hisabdo_user", JSON.stringify(profile));

        if (accessToken) {
          localStorage.setItem("hisabdo_token", accessToken);
          document.cookie = `hisabdo_auth_token=${accessToken}; path=/; max-age=86400`;
        }

        return { success: true };
      }

      return { success: false, message: "Invalid email or password." };
    } catch (err: any) {
      return { success: false, message: err?.message || "Unable to log in right now. Please try again." };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (formData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    shopName?: string;
  }): Promise<{ success: boolean; message?: string; requiresConfirmation?: boolean }> => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const redirectOrigin = typeof window !== "undefined" ? window.location.origin : "";

      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: redirectOrigin ? `${redirectOrigin}/auth/callback` : undefined,
          data: {
            full_name: formData.name,
            phone: formData.phone || "",
            business_name: formData.shopName || "",
          },
        },
      });

      // Also register with local backend store for unified parity
      try {
        await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            confirmPassword: formData.password,
            phone: formData.phone,
            shopName: formData.shopName,
          }),
        });
      } catch {}

      if (error) {
        const msg = error.message.toLowerCase();
        if (
          msg.includes("already registered") ||
          msg.includes("already exists") ||
          msg.includes("user already") ||
          error.status === 400
        ) {
          return {
            success: false,
            message: "This account already exists. Please log in instead.",
          };
        }
        return { success: false, message: error.message };
      }

      if (data?.user) {
        // Detect whether this is an existing account (duplicate registration attempt)
        // 1. Under Supabase User Enumeration Defense, duplicate signup returns user with identities: []
        const hasEmptyIdentities = Array.isArray(data.user.identities) && data.user.identities.length === 0;

        // 2. Account was created prior to this signup request (identities or user created_at is in the past)
        const userCreatedAt = data.user.created_at ? new Date(data.user.created_at).getTime() : 0;
        const identityCreatedAt =
          data.user.identities?.[0]?.created_at ? new Date(data.user.identities[0].created_at).getTime() : 0;
        const isPastUser =
          (userCreatedAt > 0 && Date.now() - userCreatedAt > 15000) ||
          (identityCreatedAt > 0 && Date.now() - identityCreatedAt > 15000);

        if (hasEmptyIdentities || (isPastUser && !data.session)) {
          return {
            success: false,
            message: "This account already exists. Please log in instead.",
          };
        }

        // 3. New registration awaiting email confirmation (no active session returned)
        if (!data.session?.access_token) {
          return {
            success: true,
            requiresConfirmation: true,
            message: "Registration successful! Please check your email to confirm your account before logging in.",
          };
        }

        // 4. Confirmed active authenticated session
        const profile: UserProfile = {
          id: data.user.id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          shopName: formData.shopName,
          isGuest: false,
        };
        setUser(profile);
        setToken(data.session.access_token);
        localStorage.setItem("hisabdo_user", JSON.stringify(profile));
        localStorage.setItem("hisabdo_token", data.session.access_token);
        document.cookie = `hisabdo_auth_token=${data.session.access_token}; path=/; max-age=86400`;

        return { success: true, requiresConfirmation: false };
      }

      return {
        success: true,
        requiresConfirmation: true,
        message: "Registration successful! Please check your email to verify your account.",
      };
    } catch (err: any) {
      return { success: false, message: err?.message || "Registration failed." };
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) {
        return { success: false, message: error.message };
      }
      return { success: true, message: "Password reset instructions sent to your email." };
    } catch {
      return { success: false, message: "Failed to send reset link." };
    }
  };

  const loginAsGuest = () => {
    const guestUser: UserProfile = {
      id: "guest-user",
      name: "Guest Merchant",
      email: "guest@hisabdo.local",
      phone: "+92 300 0000000",
      shopName: "Guest Khata Store",
      isGuest: true,
    };
    setUser(guestUser);
    setToken("guest-token");
    localStorage.setItem("hisabdo_user", JSON.stringify(guestUser));
    localStorage.setItem("hisabdo_token", "guest-token");
    document.cookie = "hisabdo_guest=true; path=/; max-age=86400";
    document.cookie = "hisabdo_auth_token=guest-token; path=/; max-age=86400";
    router.push("/dashboard");
  };

  const loginAsDemo = () => {
    const demoUser: UserProfile = {
      id: "54fed992-4a4f-4669-9c52-161ae531dfe0",
      name: "Hamza Merchant (Demo)",
      email: "merchant@hisabdo.com",
      phone: "+92 300 1234567",
      shopName: "Hamza Traders & Supplier Enterprise",
      isGuest: false,
    };
    setUser(demoUser);
    setToken("demo-token");
    localStorage.setItem("hisabdo_user", JSON.stringify(demoUser));
    localStorage.setItem("hisabdo_token", "demo-token");
    document.cookie = "hisabdo_auth_token=demo-token; path=/; max-age=86400";
    router.push("/dashboard");
  };

  const endDemoSession = () => {
    const cachedToken = typeof window !== "undefined" ? localStorage.getItem("hisabdo_token") : null;
    const isGuestUser = user?.isGuest || cachedToken === "guest-token";
    const isDemoUser = cachedToken === "demo-token" || user?.email === "merchant@hisabdo.com";

    if (isGuestUser || isDemoUser) {
      setUser(null);
      setToken(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("hisabdo_user");
        localStorage.removeItem("hisabdo_token");
        document.cookie = "hisabdo_guest=; path=/; max-age=0";
        document.cookie = "hisabdo_auth_token=; path=/; max-age=0";
      }
    }
  };

  const logout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {}
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    setUser(null);
    setToken(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("hisabdo_user");
      localStorage.removeItem("hisabdo_token");
      document.cookie = "hisabdo_guest=; path=/; max-age=0";
      document.cookie = "hisabdo_auth_token=; path=/; max-age=0";
    }
    router.push("/login");
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { success: false, message: "Not logged in" };
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem("hisabdo_user", JSON.stringify(updated));
    return { success: true, message: "Profile updated successfully." };
  };

  const quickDemoLogin = async () => {
    loginAsDemo();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && (!!token || !!user?.isGuest),
        isLoading,
        isGuest: !!user?.isGuest,
        activeBranch: DEFAULT_BRANCH,
        setActiveBranch: () => {},
        login,
        register,
        forgotPassword,
        loginAsGuest,
        loginAsDemo,
        endDemoSession,
        logout,
        updateProfile,
        quickDemoLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
