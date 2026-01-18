# Story 4.4: Success Page

## Meta
- **Epic:** 4 - Payment & Purchase
- **Status:** ready-for-dev
- **Priority:** High
- **Estimate:** 2 Story Points

## User Story
Als User,
möchte ich eine Bestätigung meiner Zahlung sehen,
damit ich weiß dass alles geklappt hat.

## Acceptance Criteria

### AC 1: Bestätigungsmeldung
**Given** meine Zahlung war erfolgreich
**When** ich zur Success-Seite weitergeleitet werde
**Then** sehe ich "Danke für deinen Kauf!" als Überschrift
**And** sehe ich eine positive Bestätigung (Häkchen, Emoji)

### AC 2: Ergebnis-Button
**Given** ich bin auf der Success-Seite
**When** ich die Seite sehe
**Then** sehe ich einen Button "Ergebnis ansehen"
**And** der Button führt zur vollständigen Analyse

### AC 3: Auto-Redirect
**Given** ich bin auf der Success-Seite
**When** 5 Sekunden vergangen sind
**Then** werde ich automatisch zur Ergebnis-Seite weitergeleitet
**And** ich sehe einen Countdown

### AC 4: Session Validation
**Given** die Success-Seite wird aufgerufen
**When** keine gültige `session_id` vorhanden ist
**Then** werde ich zur Startseite weitergeleitet
**And** ich sehe keine Bestätigung

### AC 5: Confetti/Animation
**Given** ich sehe die Bestätigungsseite
**When** sie geladen wird
**Then** gibt es eine feierliche Animation (optional: Confetti)
**And** die Stimmung ist positiv und belohnend

## Technical Notes

### Page Route
```typescript
// src/app/checkout/success/page.tsx
'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get('session_id')
  const [countdown, setCountdown] = useState(5)
  const [analysisId, setAnalysisId] = useState<string | null>(null)

  // Validate session and get analysisId
  useEffect(() => {
    if (!sessionId) {
      router.push('/')
      return
    }

    // Optional: Fetch session details from API
    // to get analysisId and verify payment
    async function verifySession() {
      const res = await fetch(`/api/checkout/verify?session_id=${sessionId}`)
      const data = await res.json()
      if (data.analysisId) {
        setAnalysisId(data.analysisId)
      }
    }
    verifySession()
  }, [sessionId, router])

  // Auto-redirect countdown
  useEffect(() => {
    if (!analysisId) return
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          router.push(`/ergebnis/${analysisId}?unlocked=true`)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [analysisId, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-3xl font-bold mb-4">Danke für deinen Kauf!</h1>
        <p className="text-slate-600 mb-8">
          Deine Zahlung war erfolgreich. Du wirst in {countdown} Sekunden 
          weitergeleitet...
        </p>
        <a 
          href={`/ergebnis/${analysisId}?unlocked=true`}
          className="btn-primary"
        >
          Ergebnis ansehen →
        </a>
      </div>
    </div>
  )
}
```

### Optional: Verify API
```typescript
// src/app/api/checkout/verify/route.ts
// Holt Session-Details von Stripe und gibt analysisId zurück
```

### Layout
```
┌─────────────────────────────────────────┐
│                                         │
│                  🎉                     │
│                                         │
│       Danke für deinen Kauf!            │
│                                         │
│   Deine Zahlung war erfolgreich.        │
│   Weiterleitung in 5 Sekunden...        │
│                                         │
│      ┌─────────────────────────┐        │
│      │   Ergebnis ansehen →    │        │
│      └─────────────────────────┘        │
│                                         │
└─────────────────────────────────────────┘
```

## Dependencies
- Story 4.1 (session_id in URL)
- Story 4.3 (Payment verified)

## Out of Scope
- Email-Bestätigung
- PDF-Download (Epic 5)
- Rechnung/Invoice

## Definition of Done
- [ ] Success Page unter `/checkout/success` erstellt
- [ ] Session-ID Validierung implementiert
- [ ] "Danke für deinen Kauf!" Nachricht angezeigt
- [ ] "Ergebnis ansehen" Button funktioniert
- [ ] Auto-Redirect nach 5 Sekunden
- [ ] Countdown-Anzeige
- [ ] Redirect zu `/` bei ungültiger Session
- [ ] Positive, feierliche Atmosphäre
- [ ] Responsive Design
- [ ] Accessibility: Focus-States, Screen-Reader

