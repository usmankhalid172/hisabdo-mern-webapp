import { createBrowserClient } from '@supabase/ssr'

const NEXT_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const NEXT_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function createClient() {
  return createBrowserClient(NEXT_SUPABASE_URL, NEXT_SUPABASE_ANON_KEY, {
    db: { schema: "app" },
  });
}
