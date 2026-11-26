import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_SUPABASE_URL ||
    "https://ooabmcalzsgesdgrgilu.supabase.co";
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_SUPABASE_ANON_KEY ||
    "sb_publishable_vJZGxQmZyukZnDuXASKekA_1q7ODVJq";

  if (!url) {
    throw new Error(
      'Missing Supabase URL. Set NEXT_PUBLIC_SUPABASE_URL in .env.local (see .env.example) and restart the dev server.'
    )
  }
  if (!anonKey) {
    throw new Error(
      'Missing Supabase anon key. Set NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local (see .env.example) and restart the dev server.'
    )
  }

  return createBrowserClient(url, anonKey, {
    db: { schema: 'app' },
  })
}