import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'

/**
 * Supabase Client for Client Components (Browser)
 * 
 * Use this in:
 * - Client Components ('use client')
 * - Event handlers
 * - useEffect hooks
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
