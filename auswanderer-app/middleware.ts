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
  // ADMIN LOGIN & RESET-PASSWORD
  // These pages are PUBLIC (no auth required)
  // ============================================
  if (pathname === '/admin-login' || pathname === '/admin-reset-password') {
    // If already logged in as admin, redirect to admin dashboard
    if (user) {
      const { data: adminUser } = await supabase
        .from('admin_users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (adminUser) {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
    }
    // Allow access to login/reset pages
    return supabaseResponse
  }

  // ============================================
  // ADMIN ROUTES (except login/reset)
  // Require authentication + admin role
  // ============================================
  if (pathname.startsWith('/admin')) {
    // Not logged in → redirect to admin login
    if (!user) {
      return NextResponse.redirect(new URL('/admin-login', request.url))
    }

    // Check admin role
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!adminUser) {
      // Not an admin - redirect to dashboard with message
      return NextResponse.redirect(new URL('/dashboard?error=no_admin_access', request.url))
    }
  }

  // ============================================
  // PROTECTED ROUTES (dashboard, etc.)
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
  // USER LOGIN PAGE - Redirect if already logged in
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

