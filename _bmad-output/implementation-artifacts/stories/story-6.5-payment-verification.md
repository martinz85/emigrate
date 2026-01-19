# Story 6.5: Payment Verification (Security Fix)

## Status: ready-for-dev

## Epic
Epic 6: User Authentication (Supabase)

## User Story
Als System,
möchte ich den Zahlungsstatus serverseitig verifizieren,
damit nur zahlende User die vollständigen Ergebnisse sehen.

## 🔴 CRITICAL SECURITY FIX

Diese Story behebt die kritische Sicherheitslücke:
- **Problem**: Aktuell wird der Unlock-Status nur über `?unlocked=true` in der URL gesteuert
- **Risiko**: Jeder kann durch URL-Manipulation die vollständigen Ergebnisse sehen
- **Fix**: Serverseitige Verifizierung gegen Supabase-Datenbank

## Acceptance Criteria

### AC 1: Ergebnis-Seite prüft Zahlungsstatus
**Given** ein User ruft `/ergebnis/[id]` auf
**When** die Seite geladen wird
**Then** wird der Zahlungsstatus aus Supabase geladen
**And** der URL-Parameter `?unlocked=true` wird ignoriert
**And** nur bei `paid=true` in der Datenbank wird das vollständige Ergebnis gezeigt

### AC 2: PDF-API prüft Zahlungsstatus
**Given** ein User ruft `/api/pdf/[id]` auf
**When** die API-Route verarbeitet wird
**Then** wird geprüft ob `paid=true` in Supabase
**And** bei `paid=false` wird 403 Forbidden zurückgegeben
**And** nur bei bezahlten Analysen wird der Report generiert

### AC 3: Webhook aktualisiert Zahlungsstatus
**Given** Stripe sendet `checkout.session.completed` Event
**When** der Webhook verarbeitet wird
**Then** wird die Analyse in Supabase auf `paid=true` gesetzt
**And** `paid_at` Timestamp wird gesetzt
**And** `stripe_session_id` wird gespeichert

### AC 4: Ownership-Check (optional für MVP)
**Given** ein eingeloggter User ruft eine Analyse auf
**When** die Analyse einem anderen User gehört
**Then** wird 403 Forbidden zurückgegeben
**And** nur eigene Analysen sind zugänglich

### AC 5: Anonyme Analysen (Session-basiert)
**Given** ein nicht-eingeloggter User hat eine Analyse erstellt
**When** er diese Analyse aufruft
**Then** wird via `session_id` Cookie verifiziert
**And** nur bei Übereinstimmung ist Zugriff erlaubt

## Technical Notes

### Ergebnis-Seite (Server Component)
```typescript
// /app/ergebnis/[id]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export default async function ResultPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const sessionId = cookies().get('session_id')?.value

  // Analyse laden
  const { data: analysis, error } = await supabase
    .from('analyses')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!analysis) {
    notFound()
  }

  // Ownership-Check
  const isOwner = 
    (user && analysis.user_id === user.id) ||
    (!user && analysis.session_id === sessionId)

  if (!isOwner) {
    // Für MVP: Zeige Teaser ohne Ownership-Error
    // In Produktion: 403 oder Redirect
  }

  // Zahlungsstatus aus DB - NICHT aus URL!
  const isPaid = analysis.paid === true

  if (isPaid) {
    return <ResultUnlocked analysisId={params.id} result={analysis.result} />
  }

  return <ResultTeaser analysisId={params.id} result={getTeaserData(analysis)} />
}
```

### PDF-API mit Verifizierung
```typescript
// /api/pdf/[id]/route.tsx
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()
  
  // Analyse laden und Zahlungsstatus prüfen
  const { data: analysis } = await supabase
    .from('analyses')
    .select('paid, result, user_id, session_id')
    .eq('id', params.id)
    .single()

  if (!analysis) {
    return NextResponse.json({ error: 'Analyse nicht gefunden' }, { status: 404 })
  }

  if (!analysis.paid) {
    return NextResponse.json(
      { error: 'Analyse nicht freigeschaltet. Bitte zuerst bezahlen.' },
      { status: 403 }
    )
  }

  // Generate PDF with real data from analysis.result
  const report = generateTextReport(analysis.result)
  return new NextResponse(report, { ... })
}
```

### Webhook Update
```typescript
// /api/webhook/route.ts - handleCheckoutCompleted
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const analysisId = session.metadata?.analysisId
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Service Role für Write-Access
  )

  // Update Analyse als bezahlt
  const { error } = await supabase
    .from('analyses')
    .update({
      paid: true,
      paid_at: new Date().toISOString(),
      stripe_session_id: session.id,
    })
    .eq('id', analysisId)

  if (error) {
    console.error('Failed to update analysis:', error)
    throw error // Webhook wird retried
  }

  console.log(`✅ Analysis ${analysisId} marked as paid`)
}
```

### Success-Page Redirect
```typescript
// /checkout/success/page.tsx
// Nach Verifizierung: Redirect OHNE ?unlocked=true
router.push(`/ergebnis/${analysisId}`)
// Die Seite lädt den Status aus der DB
```

## Migration Steps

1. **Analyse-Erstellung anpassen**: Speichere Analyse in Supabase statt nur in Session
2. **Webhook anpassen**: Update `paid` Status in Supabase
3. **Ergebnis-Seite anpassen**: Lade Status aus DB statt URL
4. **PDF-API anpassen**: Prüfe gegen DB statt `isAnalysisPaid()` Mock
5. **Success-Page anpassen**: Entferne `?unlocked=true` aus Redirect

## Dependencies
- Story 6.1: Supabase Auth Setup (Datenbank-Schema)
- Story 6.4: User Profile Storage (Analyse-Speicherung)

## Definition of Done
- [ ] Ergebnis-Seite lädt Zahlungsstatus aus Supabase
- [ ] URL-Parameter `?unlocked=true` wird ignoriert
- [ ] PDF-API prüft Zahlungsstatus in Supabase
- [ ] Webhook aktualisiert `paid` Status in Supabase
- [ ] Success-Page Redirect ohne `?unlocked=true`
- [ ] Manuelle Tests: Kann nicht mehr bypassed werden
- [ ] Mock-Funktionen entfernt

## Estimation
Story Points: 5 (Large) - Kritischer Security Fix

## Notes
⚠️ **Diese Story ist kritisch für Production-Deployment!**
Ohne diesen Fix kann jeder durch URL-Manipulation die vollständigen Ergebnisse sehen.

