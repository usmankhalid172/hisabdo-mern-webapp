'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function TestSupabasePage() {
  const [status, setStatus] = useState('Verifying connection...')
  const [details, setDetails] = useState<string>('')

  useEffect(() => {
    async function checkIntegration() {
      const supabase = createClient()
      
      // Ping Supabase auth/health service to confirm client configuration
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        setStatus('Configuration Error')
        setDetails(error.message)
      } else {
        setStatus('Supabase Client Connected!')
        setDetails(`Connected to project instance: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`)
      }
    }

    checkIntegration()
  }, [])

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h2 style={{ color: status.includes('Connected') ? 'green' : 'red' }}>
        Status: {status}
      </h2>
      <p>{details}</p>
      <p style={{ color: '#666', fontSize: '0.9rem' }}>
        <em>Ready for web UI development. Waiting on Flutter/Backend team to finish publishing schema tables to remote Supabase.</em>
      </p>
    </div>
  )
}