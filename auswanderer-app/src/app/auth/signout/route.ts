import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Sign Out Route
 * 
 * Logs out the user and redirects to the login page.
 * 
 * Security: Uses Origin header validation to prevent CSRF attacks.
 */
export async function POST(request: Request) {
  const { origin: requestOrigin } = new URL(request.url)
  
  // CSRF Protection: Validate Origin header
  const originHeader = request.headers.get('origin')
  const refererHeader = request.headers.get('referer')
  
  // Check that the request comes from our own origin
  // This prevents CSRF attacks where an attacker's site tries to sign out a user
  if (originHeader) {
    const originUrl = new URL(originHeader)
    const requestUrl = new URL(requestOrigin)
    
    if (originUrl.host !== requestUrl.host) {
      console.warn(`CSRF attempt blocked: Origin ${originHeader} does not match ${requestOrigin}`)
      return NextResponse.json(
        { error: 'Invalid origin' },
        { status: 403 }
      )
    }
  } else if (refererHeader) {
    // Fallback to Referer if Origin is not present
    try {
      const refererUrl = new URL(refererHeader)
      const requestUrl = new URL(requestOrigin)
      
      if (refererUrl.host !== requestUrl.host) {
        console.warn(`CSRF attempt blocked: Referer ${refererHeader} does not match ${requestOrigin}`)
        return NextResponse.json(
          { error: 'Invalid referer' },
          { status: 403 }
        )
      }
    } catch {
      // Invalid referer URL - allow for local development
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
          { error: 'Invalid referer' },
          { status: 403 }
        )
      }
    }
  } else if (process.env.NODE_ENV === 'production') {
    // In production, require Origin or Referer header
    console.warn('CSRF attempt blocked: Missing Origin and Referer headers')
    return NextResponse.json(
      { error: 'Missing origin header' },
      { status: 403 }
    )
  }

  const supabase = await createClient()
  
  await supabase.auth.signOut()

  return NextResponse.redirect(`${requestOrigin}/login`, {
    status: 302,
  })
}
