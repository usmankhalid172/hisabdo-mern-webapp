"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  phone?: string;
  shopName?: string;
  createdAt?: string;
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
  activeBranch: Branch;
  setActiveBranch: (branch: Branch) => void;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    confirmPassword?: string;
    phone?: string;
    shopName?: string;
  }) => Promise<{ success: boolean; message?: string; fieldErrors?: any }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; message?: string }>;
  quickDemoLogin: () => Promise<void>;
}

const DEFAULT_BRANCH: Branch = {
  id: "branch-1",
  name: "Hamza Traders & Supplier Enterprise — Main Branch",
  location: "Hafeez Centre, Lahore",
  type: "Electronics, Wholesale & Retail",
  cashBalance: 245000,
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeBranch, setActiveBranchState] = useState<Branch>(DEFAULT_BRANCH);

  // Initialize and verify session on load
  const verifySession = useCallback(async () => {
    try {
      // 1. Check local storage cache first for instant UI response
      const cachedUser = localStorage.getItem("hisabdo_user");
      const cachedToken = localStorage.getItem("hisabdo_token");
      const cachedBranch = localStorage.getItem("hisabdo_active_branch");

      if (cachedUser) {
        try {
          setUser(JSON.parse(cachedUser));
        } catch {}
      }
      if (cachedToken) {
        setToken(cachedToken);
      }
      if (cachedBranch) {
        try {
          setActiveBranchState(JSON.parse(cachedBranch));
        } catch {}
      }

      // 2. Verify with server API /api/auth/me
      const res = await fetch("/api/auth/me", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
          localStorage.setItem("hisabdo_user", JSON.stringify(data.user));
        }
      } else if (res.status === 401) {
        // Session expired on server
        if (!cachedUser) {
          setUser(null);
          setToken(null);
          localStorage.removeItem("hisabdo_user");
          localStorage.removeItem("hisabdo_token");
        }
      }
    } catch (err) {
      console.warn("Session verification warning:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    verifySession();
  }, [verifySession]);

  const setActiveBranch = (branch: Branch) => {
    setActiveBranchState(branch);
    localStorage.setItem("hisabdo_active_branch", JSON.stringify(branch));
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return {
          success: false,
          message: data.message || "Invalid credentials. Please try again.",
        };
      }

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem("hisabdo_user", JSON.stringify(data.user));
      localStorage.setItem("hisabdo_token", data.token);

      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        message: "Network connection failed. Please check your internet.",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (formData: {
    name: string;
    email: string;
    password: string;
    confirmPassword?: string;
    phone?: string;
    shopName?: string;
  }) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return {
          success: false,
          message: data.message || "Registration failed.",
          fieldErrors: data.fieldErrors,
        };
      }

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem("hisabdo_user", JSON.stringify(data.user));
      localStorage.setItem("hisabdo_token", data.token);

      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        message: "Network connection failed. Please check your internet.",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.warn("Logout API call error:", err);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem("hisabdo_user");
      localStorage.removeItem("hisabdo_token");
      window.location.href = "/login";
    }
  };

  const refreshProfile = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
          localStorage.setItem("hisabdo_user", JSON.stringify(data.user));
        }
      }
    } catch (err) {
      console.warn("Refresh profile error:", err);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, message: data.message || "Failed to update profile." };
      }

      setUser(data.user);
      localStorage.setItem("hisabdo_user", JSON.stringify(data.user));
      return { success: true, message: data.message };
    } catch (err) {
      return { success: false, message: "Network connection error." };
    }
  };

  const quickDemoLogin = async () => {
    await login("merchant@hisabdo.com", "password123");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        activeBranch,
        setActiveBranch,
        login,
        register,
        logout,
        refreshProfile,
        updateProfile,
        quickDemoLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
