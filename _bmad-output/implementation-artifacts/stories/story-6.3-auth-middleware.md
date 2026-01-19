# Story 6.3: Auth Middleware

## Status: ready-for-dev

## Epic
Epic 6: User Authentication (Supabase)

## User Story
Als System,
möchte ich geschützte Routen absichern,
damit nur eingeloggte User zugreifen können.

## Acceptance Criteria

### AC 1: Middleware schützt Routes
**Given** ein nicht-eingeloggter User
**When** er auf eine geschützte Route zugreift (z.B. `/dashboard`)
**Then** wird er zu `/login` weitergeleitet
**And** die ursprüngliche URL wird als `next` Parameter gespeichert

### AC 2: Eingeloggte User haben Zugriff
**Given** ein eingeloggter User
**When** er auf `/dashboard` zugreift
**Then** kann er die Seite normal sehen
**And** es gibt keine Weiterleitung

### AC 3: Redirect nach Login
**Given** ein User wurde von `/dashboard` zu `/login` weitergeleitet
**When** er sich erfolgreich einloggt
**Then** wird er zurück zu `/dashboard` geleitet (nicht zur Standard-Route)

### AC 4: Session Refresh
**Given** ein User hat eine aktive Session
**When** die Session kurz vor dem Ablauf ist
**Then** wird sie automatisch refreshed
**And** der User bleibt eingeloggt

### AC 5: Öffentliche Routes bleiben offen
**Given** ein nicht-eingeloggter User
**When** er auf öffentliche Routes zugreift:
- `/` (Landing)
- `/analyse` (Fragen-Flow)
- `/ergebnis/[id]` (Teaser - ohne `?unlocked=true`)
- `/login`
- `/impressum`, `/datenschutz`, `/agb`
**Then** kann er diese ohne Login sehen

### AC 6: Admin Routes geschützt
**Given** ein User ohne Admin-Rolle
**When** er auf `/admin/*` zugreift
**Then** wird er zu `/login` weitergeleitet (oder 403)

## Technical Notes

### Next.js Middleware
```typescript
// middleware.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Protected routes
  const protectedRoutes = ['/dashboard', '/admin']
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  if (isProtectedRoute && !user) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('next', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Admin routes - check role
  if (request.nextUrl.pathname.startsWith('/admin') && user) {
    // Check admin role in profiles table
    const { data: profile } = await supabase
      .from('admin_users')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (!profile) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### Geschützte Routes
| Route | Schutz | Rolle |
|-------|--------|-------|
| `/dashboard` | Login required | any |
| `/admin/*` | Login + Admin Role | admin |
| Alle anderen | Öffentlich | - |

### Session Handling
Supabase SSR-Client refreshed Sessions automatisch via Cookies.

## Dependencies
- Story 6.1: Supabase Auth Setup
- Story 6.2: Login Page

## Definition of Done
- [ ] Middleware in `middleware.ts` erstellt
- [ ] Geschützte Routes leiten zu `/login` weiter
- [ ] `next` Parameter für Redirect-After-Login
- [ ] Öffentliche Routes bleiben offen
- [ ] Admin Routes prüfen Admin-Rolle
- [ ] Session Refresh funktioniert
- [ ] Matcher Config schließt static files aus

## Estimation
Story Points: 2 (Small-Medium)

