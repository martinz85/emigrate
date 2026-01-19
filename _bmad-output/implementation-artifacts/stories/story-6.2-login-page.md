# Story 6.2: Login Page

## Status: ready-for-dev

## Epic
Epic 6: User Authentication (Supabase)

## User Story
Als User,
möchte ich mich mit Email anmelden können,
damit ich meine Analysen wiederfinde.

## Acceptance Criteria

### AC 1: Login-Seite existiert
**Given** ich navigiere zu `/login`
**When** die Seite geladen wird
**Then** sehe ich ein Email-Eingabefeld
**And** sehe ich einen "Magic Link senden" Button
**And** die Seite hat das Plattform-Branding (Header, Footer)

### AC 2: Magic Link senden
**Given** ich bin auf der Login-Seite
**When** ich meine Email eingebe und absende
**Then** wird ein Magic Link an meine Email gesendet
**And** ich sehe eine Bestätigungsnachricht "Check deine Emails!"
**And** der Button zeigt einen Loading-State während des Sendens

### AC 3: Email-Validierung
**Given** ich bin auf der Login-Seite
**When** ich eine ungültige Email eingebe
**Then** sehe ich eine Fehlermeldung
**And** das Formular wird nicht abgesendet

### AC 4: Magic Link Callback
**Given** ich habe auf den Magic Link geklickt
**When** ich zur App zurückkehre
**Then** bin ich automatisch eingeloggt
**And** werde zur `/dashboard` Seite weitergeleitet
**And** mein Profil wird erstellt (falls noch nicht vorhanden)

### AC 5: Bereits eingeloggt
**Given** ich bin bereits eingeloggt
**When** ich `/login` aufrufe
**Then** werde ich zu `/dashboard` weitergeleitet

### AC 6: Error Handling
**Given** ein Fehler tritt auf (z.B. Rate Limit)
**When** der Login fehlschlägt
**Then** sehe ich eine benutzerfreundliche Fehlermeldung
**And** kann es erneut versuchen

## Technical Notes

### Route
`/app/(auth)/login/page.tsx`

### Supabase Auth Flow
```typescript
// Magic Link senden
const { error } = await supabase.auth.signInWithOtp({
  email,
  options: {
    emailRedirectTo: `${window.location.origin}/auth/callback`,
  },
})

// Callback Route: /auth/callback/route.ts
// Tauscht Code gegen Session
```

### Callback Route
```typescript
// /app/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
```

### UI-Komponenten
- Email Input (shadcn/ui)
- Submit Button mit Loading State
- Success/Error Alerts

## Design

```
┌─────────────────────────────────────┐
│           [Header]                  │
├─────────────────────────────────────┤
│                                     │
│     ┌───────────────────────┐       │
│     │    🌍 Willkommen      │       │
│     │                       │       │
│     │  Melde dich an, um    │       │
│     │  deine Analysen zu    │       │
│     │  speichern.           │       │
│     │                       │       │
│     │  ┌─────────────────┐  │       │
│     │  │ Email           │  │       │
│     │  └─────────────────┘  │       │
│     │                       │       │
│     │  [Magic Link senden]  │       │
│     │                       │       │
│     │  ─────────────────    │       │
│     │  Noch keinen Account? │       │
│     │  Wird automatisch     │       │
│     │  erstellt.            │       │
│     └───────────────────────┘       │
│                                     │
├─────────────────────────────────────┤
│           [Footer]                  │
└─────────────────────────────────────┘
```

## Dependencies
- Story 6.1: Supabase Auth Setup

## Definition of Done
- [ ] Login-Seite unter `/login` erreichbar
- [ ] Email-Eingabe mit Validierung
- [ ] Magic Link wird gesendet
- [ ] Bestätigungsnachricht nach Absenden
- [ ] Callback-Route verarbeitet Magic Link
- [ ] Redirect zu Dashboard nach Login
- [ ] Error Handling implementiert
- [ ] Redirect wenn bereits eingeloggt
- [ ] Mobile-responsive Design

## Estimation
Story Points: 3 (Medium)

