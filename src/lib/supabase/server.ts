import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_SUPABASE_URL || 'https://ooabmcalzsgesdgrgilu.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vYWJtY2FsenNnZXNkZ3JnaWx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyNTE1MzYsImV4cCI6MjA5OTgyNzUzNn0.jWWLyBu_mHDqxry_Jak9ssb2gqgjJoSGhTXzEXjairw';

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from Server Components
          }
        },
      },
    }
  );
}

export const supabaseServer = createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);
