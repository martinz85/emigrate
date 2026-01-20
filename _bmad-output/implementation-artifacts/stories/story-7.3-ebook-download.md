---
story_id: "7.3"
title: "E-Book Download"
epic: "Epic 7 - E-Book Integration"
status: done
created: 2026-01-19
started: 2026-01-20
completed: 2026-01-20
created_by: Bob (SM)
implemented_by: Amelia (Dev)
priority: medium
estimated_points: 5
depends_on: ["7.1", "7.2"]
---

# Story 7.3: E-Book Download

## User Story

Als Kunde der ein E-Book gekauft hat,
möchte ich das E-Book herunterladen können,
damit ich es offline lesen kann.

## Business Context

- **PRD Reference:** Section 5.2.2 - E-Books
- **Abhängigkeit:** Story 7.2 (E-Book Checkout)
- **Kundenzufriedenheit:** Sofortiger Zugang nach Kauf

## Acceptance Criteria

### AC1: Download-Button nach Kauf
**Given** ich habe ein E-Book gekauft
**When** ich zur E-Book Seite oder meinem Dashboard gehe
**Then** sehe ich "Herunterladen" statt "Kaufen"
**And** der Button lädt die PDF-Datei herunter

### AC2: Meine E-Books Seite
**Given** ich bin eingeloggt und habe E-Books gekauft
**When** ich /dashboard/ebooks besuche
**Then** sehe ich alle meine gekauften E-Books
**And** jedes E-Book hat einen Download-Button
**And** ich sehe das Kaufdatum

### AC3: Sichere Download-URL
**Given** ich klicke auf Herunterladen
**When** der Download startet
**Then** ist die URL zeitlich begrenzt (signed URL)
**And** die URL ist nur für mich gültig
**And** die Datei wird als PDF heruntergeladen

### AC4: PRO-User Zugang
**Given** ich bin PRO-User
**When** ich ein E-Book herunterladen möchte
**Then** habe ich Zugang zu allen E-Books
**And** ohne separaten Kauf

### AC5: E-Mail mit Download-Link
**Given** ich habe gerade ein E-Book gekauft
**When** die Kaufbestätigungs-E-Mail gesendet wird
**Then** enthält sie einen Download-Link
**And** der Link ist 7 Tage gültig

### AC6: Re-Download möglich
**Given** ich habe ein E-Book bereits heruntergeladen
**When** ich es erneut herunterladen möchte
**Then** kann ich es beliebig oft herunterladen
**And** ohne zusätzliche Kosten

## Technical Tasks

- [ ] **Task 1: E-Book PDF Storage**
  - [ ] Supabase Storage Bucket "ebooks" erstellen
  - [ ] PDFs hochladen (4 E-Books)
  - [ ] Bucket-Policy: Private (nur signed URLs)

- [ ] **Task 2: Download API Route**
  - [ ] Erstelle `/api/ebooks/[id]/download/route.ts`
  - [ ] Prüfe Kaufberechtigung oder PRO-Status
  - [ ] Generiere signed URL (1 Stunde gültig)
  - [ ] Redirect zu signed URL

- [ ] **Task 3: Meine E-Books Dashboard**
  - [ ] Erstelle `/app/dashboard/ebooks/page.tsx`
  - [ ] Liste gekaufter E-Books
  - [ ] Download-Buttons
  - [ ] Kaufdatum anzeigen

- [ ] **Task 4: E-Book Card Update**
  - [ ] `hasPurchased` Prop hinzufügen
  - [ ] Konditioneller Button: Download vs Kaufen
  - [ ] Download-Handler

- [ ] **Task 5: Hook für E-Book Zugang**
  - [ ] Erstelle `useEbookAccess(ebookId)`
  - [ ] Prüft: gekauft ODER PRO-User ODER Bundle
  - [ ] Cached result

- [ ] **Task 6: E-Mail Integration**
  - [ ] Download-Link in Kaufbestätigungs-E-Mail
  - [ ] Signed URL mit 7 Tagen Gültigkeit

- [ ] **Task 7: Bundle-Logik**
  - [ ] Wenn Bundle gekauft → Zugang zu allen 4
  - [ ] In `useEbookAccess` berücksichtigen

## Dev Notes

### Abhängigkeiten
- Story 7.2: E-Book Checkout ✅
- Supabase Storage
- Resend E-Mail (Epic 9) ✅

### Supabase Storage Setup

```bash
# Via Supabase Dashboard oder CLI
# Bucket: ebooks (private)
# Files:
#   - langversion.pdf
#   - kurzversion.pdf
#   - tips-tricks.pdf
#   - dummies.pdf
```

### Signed URL Generation

```typescript
import { createClient } from '@/lib/supabase/server'

export async function generateEbookDownloadUrl(ebookSlug: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase.storage
    .from('ebooks')
    .createSignedUrl(`${ebookSlug}.pdf`, 3600) // 1 hour
  
  if (error) throw error
  return data.signedUrl
}
```

### Access Check Logic

```typescript
async function hasEbookAccess(userId: string, ebookId: string): Promise<boolean> {
  // 1. Check PRO status
  const profile = await getProfile(userId)
  if (profile.subscription_tier === 'pro') return true
  
  // 2. Check direct purchase
  const purchase = await getUserEbook(userId, ebookId)
  if (purchase) return true
  
  // 3. Check bundle purchase
  const bundlePurchase = await getUserEbook(userId, 'bundle')
  if (bundlePurchase) return true
  
  return false
}
```

## Files to Create/Modify

| Datei | Aktion | Beschreibung |
|-------|--------|--------------|
| `src/app/api/ebooks/[id]/download/route.ts` | Create | Download API |
| `src/app/dashboard/ebooks/page.tsx` | Create | Meine E-Books |
| `src/hooks/useEbookAccess.ts` | Create | Zugangs-Hook |
| `src/lib/ebooks.ts` | Modify | Storage Paths |
| `src/components/ebooks/EbookCard.tsx` | Modify | Download Button |
| `src/lib/email/templates/ebook-purchase.tsx` | Create | E-Mail Template |

## Out of Scope

- Online-Reader/Viewer (PDFs werden nur heruntergeladen)
- DRM/Kopierschutz
- E-Book Updates/Neue Versionen

## Testing Checklist

- [ ] Download funktioniert nach Kauf
- [ ] PRO-User kann alle E-Books laden
- [ ] Bundle-Kauf gibt Zugang zu allen 4
- [ ] Signed URL läuft nach 1 Stunde ab
- [ ] Nicht-Käufer erhalten 403 Error
- [ ] E-Mail enthält Download-Link
- [ ] Dashboard zeigt alle gekauften E-Books

