import { updateSession } from '@/lib/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Next.js Middleware
 * 
 * Handles:
 * 1. Session refresh for Supabase Auth
 * 2. Protected route access control
 * 3. Admin route authorization
 */
export async function middleware(request: NextRequest) {
  // Update session and get user
  const { user, supabaseResponse, supabase } = await updateSession(request)

  const { pathname } = request.nextUrl

  // ============================================
  // PROTECTED ROUTES
  // Require authentication
  // ============================================
  const protectedRoutes = ['/dashboard']
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )

  if (isProtectedRoute && !user) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // ============================================
  // ADMIN ROUTES
  // Require authentication + admin role
  // ============================================
  if (pathname.startsWith('/admin')) {
    if (!user) {
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Check admin role
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!adminUser) {
      // Not an admin - redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // ============================================
  // LOGIN PAGE - Redirect if already logged in
  // ============================================
  if (pathname === '/login' && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Public files (svg, png, jpg, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

