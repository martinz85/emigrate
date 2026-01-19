import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './database.types'

/**
 * Supabase Client for Server Components and Route Handlers
 * 
 * Use this in:
 * - Server Components (default in App Router)
 * - Route Handlers (API routes)
 * - Server Actions
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

/**
 * Supabase Admin Client with Service Role
 * 
 * ⚠️ WARNING: Only use in secure server-side contexts!
 * This client bypasses RLS and has full database access.
 * 
 * Use this in:
 * - Webhooks (Stripe)
 * - Admin API routes
 * - Background jobs
 */
export function createAdminClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return []
        },
        setAll() {
          // No cookies for admin client
        },
      },
    }
  )
}

