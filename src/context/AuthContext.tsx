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
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    shopName?: string;
  }) => Promise<{ success: boolean; message?: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message?: string }>;
  loginAsGuest: () => void;
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

      if (cachedUser) {
        try {
          setUser(JSON.parse(cachedUser));
        } catch {}
      }
      if (cachedToken) {
        setToken(cachedToken);
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
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Fallback for demo credentials or offline
        if (email.toLowerCase().includes("demo") || email.toLowerCase().includes("merchant")) {
          const demoUser: UserProfile = {
            id: "demo-user-1",
            name: "Hamza Merchant (Demo)",
            email: email,
            phone: "+92 300 1234567",
            shopName: "Hamza Traders & Supplier Enterprise",
            isGuest: false,
          };
          setUser(demoUser);
          setToken("demo-token");
          localStorage.setItem("hisabdo_user", JSON.stringify(demoUser));
          localStorage.setItem("hisabdo_token", "demo-token");
          return { success: true };
        }
        return { success: false, message: error.message };
      }

      if (data.user) {
        const profile: UserProfile = {
          id: data.user.id,
          name: data.user.user_metadata?.full_name || data.user.email?.split("@")[0] || "Merchant",
          email: data.user.email || "",
          phone: data.user.user_metadata?.phone || "",
          shopName: data.user.user_metadata?.business_name || "HisabDo Store",
          isGuest: false,
        };
        setUser(profile);
        setToken(data.session?.access_token || "");
        localStorage.setItem("hisabdo_user", JSON.stringify(profile));
        if (data.session?.access_token) {
          localStorage.setItem("hisabdo_token", data.session.access_token);
          document.cookie = `hisabdo_auth_token=${data.session.access_token}; path=/; max-age=86400`;
        } else {
          document.cookie = "hisabdo_auth_token=demo-token; path=/; max-age=86400";
        }
        return { success: true };
      }

      return { success: false, message: "Login failed. Please try again." };
    } catch (err: any) {
      return { success: false, message: err?.message || "Authentication error." };
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
  }) => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            phone: formData.phone || "",
            business_name: formData.shopName || "",
          },
        },
      });

      if (error) {
        return { success: false, message: error.message };
      }

      if (data.user) {
        const profile: UserProfile = {
          id: data.user.id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          shopName: formData.shopName,
          isGuest: false,
        };
        setUser(profile);
        localStorage.setItem("hisabdo_user", JSON.stringify(profile));
        if (data.session?.access_token) {
          setToken(data.session.access_token);
          localStorage.setItem("hisabdo_token", data.session.access_token);
          document.cookie = `hisabdo_auth_token=${data.session.access_token}; path=/; max-age=86400`;
        }
        return { success: true };
      }

      return { success: true, message: "Please check your email to confirm registration." };
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

  const logout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {}
    setUser(null);
    setToken(null);
    localStorage.removeItem("hisabdo_user");
    localStorage.removeItem("hisabdo_token");
    document.cookie = "hisabdo_guest=; path=/; max-age=0";
    document.cookie = "hisabdo_auth_token=; path=/; max-age=0";
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
    await login("merchant@hisabdo.com", "Password123!");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        isGuest: !!user?.isGuest,
        activeBranch: DEFAULT_BRANCH,
        setActiveBranch: () => {},
        login,
        register,
        forgotPassword,
        loginAsGuest,
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
