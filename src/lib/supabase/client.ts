import { createBrowserClient } from '@supabase/ssr'

function readEnv(names: string[]): string | undefined {
  for (const name of names) {
    const value = process.env[name]
    if (value && value.trim() !== '') return value
  }
  return undefined
}

export function createClient() {
  const url = readEnv([
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_SUPABASE_URL',
  ])
  const anonKey = readEnv([
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_SUPABASE_ANON_KEY',
  ])

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