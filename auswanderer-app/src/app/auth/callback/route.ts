import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { validateRedirectPath } from '@/lib/utils/redirect'

/**
 * Auth Callback Route
 * 
 * Handles the Magic Link callback from Supabase Auth.
 * Exchanges the auth code for a session and redirects to the target page.
 * 
 * Security: The 'next' parameter is validated to prevent Open Redirect attacks.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const nextParam = searchParams.get('next')
  
  // Validate redirect path to prevent Open Redirect
  const next = validateRedirectPath(nextParam)

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Successful auth - redirect to validated destination
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      if (isLocalEnv) {
        // Local development - use origin
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        // Production with reverse proxy
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }

    console.error('Auth callback error:', error)
  }

  // Auth failed - redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth`)
}
