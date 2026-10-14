
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
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
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; message?: string }>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    shopName?: string;
  }) => Promise<{
    success: boolean;
    message?: string;
    requiresConfirmation?: boolean;
  }>;
  forgotPassword: (
    email: string
  ) => Promise<{ success: boolean; message?: string }>;
  loginAsGuest: () => void;
  logout: () => Promise<void>;
  updateProfile: (
    updates: Partial<UserProfile>
  ) => Promise<{ success: boolean; message?: string }>;
  quickDemoLogin: () => Promise<void>;
}

const DEFAULT_BRANCH: Branch = {
  id: "branch-1",
  name: "Main Branch",
  location: "Main Market",
  type: "General Store",
  cashBalance: 0,
};

const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType
);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
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
          "hisabdo_guest_customers",
          "hisabdo_guest_incomes",
          "hisabdo_guest_expenses",
          "hisabdo_guest_ledger_txs",
          "hisabdo_demo-user-1_customers",
          "hisabdo_demo-user-1_incomes",
          "hisabdo_demo-user-1_expenses",
          "hisabdo_demo-user-1_ledger_txs",
          "hisabdo_customers",
          "hisabdo_expenses",
          "hisabdo_transactions",
        ];

        keysToClean.forEach((key) => {
          try {
            const value = localStorage.getItem(key);

            if (
              value &&
              (value.includes("cust-1") ||
                value.includes("inc-1") ||
                value.includes("tx-1") ||
                value.includes("Ali Traders"))
            ) {
              localStorage.removeItem(key);
            }
          } catch {}
        });
      }

      // 1. Check local storage cache
      const cachedUser = localStorage.getItem("hisabdo_user");
      const cachedToken = localStorage.getItem("hisabdo_token");

      if (cachedUser && cachedToken) {
        try {
          const parsed: UserProfile = JSON.parse(cachedUser);

          // Migrate the legacy demo user ID
          if (
            parsed &&
            (parsed.id === "demo-user-1" ||
              parsed.email === "merchant@hisabdo.com")
          ) {
            parsed.id = "54fed992-4a4f-4669-9c52-161ae531dfe0";
            localStorage.setItem(
              "hisabdo_user",
              JSON.stringify(parsed)
            );
          }

          setUser(parsed);
          setToken(cachedToken);
        } catch (error) {
          console.warn("Failed to restore cached user:", error);
        }
      }

      // 2. Check the Supabase session
      const supabase = createClient();
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.warn("Failed to retrieve Supabase session:", error.message);
      }

      if (data?.session?.user) {
        const session = data.session;
        const supabaseUser = session.user;

        const profile: UserProfile = {
          id: supabaseUser.id,
          name:
            supabaseUser.user_metadata?.full_name ||
            supabaseUser.email?.split("@")[0] ||
            "Merchant",
          email: supabaseUser.email || "",
          phone: supabaseUser.user_metadata?.phone || "",
          shopName:
            supabaseUser.user_metadata?.business_name ||
            "HisabDo Store",
          isGuest: false,
        };

        setUser(profile);
        setToken(session.access_token);

        localStorage.setItem("hisabdo_user", JSON.stringify(profile));
        localStorage.setItem("hisabdo_token", session.access_token);
      } else if (
        !cachedToken ||
        (cachedToken !== "demo-token" &&
          cachedToken !== "guest-token")
      ) {
        // Clear stale unauthenticated state
        setUser(null);
        setToken(null);
        localStorage.removeItem("hisabdo_user");
        localStorage.removeItem("hisabdo_token");
      }
    } catch (error) {
      console.warn("Session verification warning:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    verifySession();

    // Listen for Supabase auth state changes
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const profile: UserProfile = {
          id: session.user.id,
          name:
            session.user.user_metadata?.full_name ||
            session.user.email?.split("@")[0] ||
            "Merchant",
          email: session.user.email || "",
          phone: session.user.user_metadata?.phone || "",
          shopName:
            session.user.user_metadata?.business_name ||
            "HisabDo Store",
          isGuest: false,
        };

        setUser(profile);
        setToken(session.access_token);
        localStorage.setItem("hisabdo_user", JSON.stringify(profile));
        localStorage.setItem("hisabdo_token", session.access_token);
      } else {
        // Do not clear cached demo or guest sessions here.
        // Supabase may emit an initial event without a session.
      }
    });

    return () => {
      subscription.unsubscribe();
    };
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
        // Fallback for demo credentials
        if (
          email.toLowerCase().includes("demo") ||
          email.toLowerCase().includes("merchant")
        ) {
          const demoUser: UserProfile = {
            id: "54fed992-4a4f-4669-9c52-161ae531dfe0",
            name: "Hamza Merchant (Demo)",
            email,
            phone: "+92 300 1234567",
            shopName: "Hamza Traders & Supplier Enterprise",
            isGuest: false,
          };

          setUser(demoUser);
          setToken("demo-token");

          localStorage.setItem(
            "hisabdo_user",
            JSON.stringify(demoUser)
          );
          localStorage.setItem("hisabdo_token", "demo-token");
          document.cookie =
            "hisabdo_auth_token=demo-token; path=/; max-age=86400";

          return { success: true };
        }

        return { success: false, message: error.message };
      }

      if (data.user) {
        const profile: UserProfile = {
          id: data.user.id,
          name:
            data.user.user_metadata?.full_name ||
            data.user.email?.split("@")[0] ||
            "Merchant",
          email: data.user.email || "",
          phone: data.user.user_metadata?.phone || "",
          shopName:
            data.user.user_metadata?.business_name ||
            "HisabDo Store",
          isGuest: false,
        };

        setUser(profile);
        setToken(data.session?.access_token || "");

        localStorage.setItem("hisabdo_user", JSON.stringify(profile));

        if (data.session?.access_token) {
          localStorage.setItem(
            "hisabdo_token",
            data.session.access_token
          );

          document.cookie = `hisabdo_auth_token=${data.session.access_token}; path=/; max-age=86400`;
        }

        return { success: true };
      }

      return {
        success: false,
        message: "Login failed. Please try again.",
      };
    } catch (error: unknown) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Authentication error.",
      };
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
  }): Promise<{
    success: boolean;
    message?: string;
    requiresConfirmation?: boolean;
  }> => {
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
        const message = error.message.toLowerCase();

        if (
          message.includes("already registered") ||
          message.includes("already exists") ||
          message.includes("user already") ||
          error.status === 400
        ) {
          return {
            success: false,
            message:
              "An account with this email address already exists. Please log in.",
          };
        }

        return { success: false, message: error.message };
      }

      if (data?.user) {
        // Detect duplicate registrations where identities are empty
        const hasEmptyIdentities =
          Array.isArray(data.user.identities) &&
          data.user.identities.length === 0;

        const userCreatedAt = data.user.created_at
          ? new Date(data.user.created_at).getTime()
          : 0;

        const identityCreatedAt = data.user.identities?.[0]?.created_at
          ? new Date(
              data.user.identities[0].created_at
            ).getTime()
          : 0;

        const isPastUser =
          (userCreatedAt > 0 &&
            Date.now() - userCreatedAt > 15000) ||
          (identityCreatedAt > 0 &&
            Date.now() - identityCreatedAt > 15000);

        if (hasEmptyIdentities || (isPastUser && !data.session)) {
          return {
            success: false,
            message:
              "An account with this email address already exists. Please log in.",
          };
        }

        // Registration awaiting email confirmation
        if (!data.session?.access_token) {
          return {
            success: true,
            requiresConfirmation: true,
            message:
              "Registration successful! Please check your email to confirm your account before logging in.",
          };
        }

        // Active authenticated session
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
        localStorage.setItem(
          "hisabdo_token",
          data.session.access_token
        );

        document.cookie = `hisabdo_auth_token=${data.session.access_token}; path=/; max-age=86400`;

        return { success: true, requiresConfirmation: false };
      }

      return {
        success: true,
        requiresConfirmation: true,
        message: "Please check your email to confirm registration.",
      };
    } catch (error: unknown) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Registration failed.",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      const supabase = createClient();
      const { error } =
        await supabase.auth.resetPasswordForEmail(email);

      if (error) {
        return { success: false, message: error.message };
      }

      return {
        success: true,
        message: "Password reset instructions sent to your email.",
      };
    } catch {
      return {
        success: false,
        message: "Failed to send reset link.",
      };
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
    document.cookie =
      "hisabdo_auth_token=guest-token; path=/; max-age=86400";

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

  const updateProfile = async (
    updates: Partial<UserProfile>
  ) => {
    if (!user) {
      return { success: false, message: "Not logged in" };
    }

    const updated = { ...user, ...updates };

    setUser(updated);
    localStorage.setItem("hisabdo_user", JSON.stringify(updated));

    return {
      success: true,
      message: "Profile updated successfully.",
    };
  };

  const quickDemoLogin = async () => {
    await login("merchant@hisabdo.com", "Password123!");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && (!!token || !!user.isGuest),
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
