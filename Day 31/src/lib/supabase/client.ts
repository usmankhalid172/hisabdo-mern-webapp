import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.NEXT_SUPABASE_URL ||
      "https://ooabmcalzsgesdgrgilu.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_SUPABASE_ANON_KEY ||
      "sb_publishable_vJZGxQmZyukZnDuXASKekA_1q7ODVJq"
  )
}
