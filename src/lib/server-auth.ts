import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  verifyAuthToken,
  type AuthUser,
} from "@/lib/auth-token";

const DEFAULT_SUPABASE_URL = "https://ooabmcalzsgesdgrgilu.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vYWJtY2FsenNnZXNkZ3JnaWx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyNTE1MzYsImV4cCI6MjA5OTgyNzUzNn0.jWWLyBu_mHDqxry_Jak9ssb2gqgjJoSGhTXzEXjairw";

export const DEMO_USER_UUID =
  process.env.DEMO_USER_ID || "54fed992-4a4f-4669-9c52-161ae531dfe0";
export const DEMO_USER_EMAIL =
  process.env.DEMO_USER_EMAIL || "merchant@hisabdo.com";
export const DEMO_USER_PASSWORD =
  process.env.DEMO_USER_PASSWORD || "Password123!";

function getSupabaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_SUPABASE_URL ||
    DEFAULT_SUPABASE_URL
  );
}

function getSupabaseAnonKey(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_SUPABASE_ANON_KEY ||
    DEFAULT_SUPABASE_ANON_KEY
  );
}

function getSupabaseAuthClient() {
  const url = getSupabaseUrl();
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY || getSupabaseAnonKey();

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// In-memory cache for demo token so we don't re-authenticate with Supabase on every demo request
let cachedDemoToken: string | null = null;
let cachedDemoTokenExpiry = 0;

async function getDemoSessionAccessToken(): Promise<string | null> {
  const now = Date.now();
  if (cachedDemoToken && now < cachedDemoTokenExpiry) {
    return cachedDemoToken;
  }

  try {
    const url = getSupabaseUrl();
    const key = getSupabaseAnonKey();
    const client = createClient(url, key);

    const { data, error } = await client.auth.signInWithPassword({
      email: DEMO_USER_EMAIL,
      password: DEMO_USER_PASSWORD,
    });

    if (error || !data?.session?.access_token) {
      console.warn("Could not retrieve Supabase demo session:", error?.message);
      return null;
    }

    cachedDemoToken = data.session.access_token;
    cachedDemoTokenExpiry = now + 3000 * 1000;
    return cachedDemoToken;
  } catch (err) {
    console.warn("Failed to sign in demo user on Supabase:", err);
    return null;
  }
}

export function getRequestToken(request: NextRequest): string | null {
  const authorization = request.headers.get("authorization");

  if (authorization?.startsWith("Bearer ")) {
    const token = authorization.slice(7).trim();

    if (token && token !== "null" && token !== "undefined") {
      return token;
    }
  }

  return (
    request.cookies.get("hisabdo_auth_token")?.value ||
    request.cookies.get("token")?.value ||
    request.cookies.get("accessToken")?.value ||
    null
  );
}

export async function getAuthenticatedUser(
  request: NextRequest
): Promise<AuthUser | null> {
  const token = getRequestToken(request);

  if (!token) {
    return null;
  }

  // Demo access: maps to the verified demo user UUID in Supabase
  if (
    token === "demo-token" ||
    token === "guest-token"
  ) {
    return {
      id: DEMO_USER_UUID,
      name: process.env.DEMO_USER_NAME || "Hamza Merchant (Demo)",
      email: DEMO_USER_EMAIL,
      role: "user",
      shopName: "Hamza Traders & Supplier Enterprise",
      phone: "+92 300 1234567",
    };
  }

  // First support tokens issued by this application's custom JWT system.
  const customUser = await verifyAuthToken(token);

  if (customUser) {
    return customUser;
  }

  // Then support real Supabase access tokens.
  const supabase = getSupabaseAuthClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return null;
  }

  const metadata = data.user.user_metadata || {};
  const appMetadata = data.user.app_metadata || {};

  return {
    id: data.user.id,
    name:
      metadata.name ||
      metadata.full_name ||
      metadata.fullName ||
      data.user.email ||
      "User",
    email: data.user.email || "",
    role: appMetadata.role === "admin" ? "admin" : "user",
    shopName: metadata.shopName || metadata.shop_name || undefined,
    phone: data.user.phone || metadata.phone || undefined,
  };
}

/**
 * Creates an appropriately authenticated Supabase client for server-side API routes,
 * ensuring queries target schema 'app' and pass RLS and Postgres schema checks.
 */
export async function getSupabaseClient(requestToken?: string | null) {
  const url = getSupabaseUrl();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = getSupabaseAnonKey();

  if (serviceKey) {
    return createClient(url, serviceKey, {
      db: { schema: "app" },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  const headers: Record<string, string> = {};

  if (requestToken === "demo-token" || requestToken === "guest-token") {
    const demoAccessToken = await getDemoSessionAccessToken();
    if (demoAccessToken) {
      headers["Authorization"] = `Bearer ${demoAccessToken}`;
    }
  } else if (requestToken && requestToken !== "null" && requestToken !== "undefined") {
    headers["Authorization"] = `Bearer ${requestToken}`;
  }

  return createClient(url, anonKey, {
    db: { schema: "app" },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: { headers },
  });
}

export async function requireAuth(
  request: NextRequest
): Promise<AuthUser> {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    throw new Error("UNAUTHORIZED");
  }

  return user;
}

export async function requireRole(
  request: NextRequest,
  role: "user" | "admin"
): Promise<AuthUser> {
  const user = await requireAuth(request);

  if (user.role !== role) {
    throw new Error("FORBIDDEN");
  }

  return user;
}