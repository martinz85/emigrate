import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Sign Out Route
 * 
 * Logs out the user and redirects to the login page.
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  
  await supabase.auth.signOut()

  const { origin } = new URL(request.url)
  return NextResponse.redirect(`${origin}/login`, {
    status: 302,
  })
}

