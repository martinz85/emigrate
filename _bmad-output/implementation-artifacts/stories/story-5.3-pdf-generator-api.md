# Story 5.3: PDF Generator API

## Meta
- **Epic:** 5 - PDF Generation & Reveal
- **Status:** ready-for-dev
- **Priority:** High
- **Estimate:** 3 Story Points

## User Story
Als System,
möchte ich PDFs serverseitig generieren,
damit User sie herunterladen können.

## Acceptance Criteria

### AC 1: API Route
**Given** eine bezahlte Analyse existiert
**When** `/api/pdf/[id]` mit GET aufgerufen wird
**Then** wird ein PDF generiert und zurückgegeben

### AC 2: Performance
**Given** die PDF-Generierung startet
**When** das PDF erstellt wird
**Then** dauert die Generierung < 30 Sekunden
**And** der Response-Header enthält `Content-Type: application/pdf`

### AC 3: Download Response
**Given** das PDF erfolgreich generiert wurde
**When** es zurückgegeben wird
**Then** wird es als Download zurückgegeben
**And** der Dateiname ist `auswanderer-analyse-[datum].pdf`
**And** Content-Disposition Header ist gesetzt

### AC 4: Autorisierung
**Given** eine Analyse-ID wird aufgerufen
**When** die Analyse NICHT bezahlt wurde
**Then** wird ein 403 Forbidden Error zurückgegeben
**And** kein PDF wird generiert

### AC 5: Error Handling
**Given** eine ungültige Analyse-ID
**When** die Route aufgerufen wird
**Then** wird ein 404 Not Found Error zurückgegeben

## Technical Notes

### API Route
```typescript
// src/app/api/pdf/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { AnalysisReport } from '@/lib/pdf/templates/AnalysisReport'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const analysisId = params.id

  // 1. Verify analysis exists and is paid
  // TODO: Check Supabase when available
  // For now: Allow if ?unlocked=true or mock data

  // 2. Fetch analysis data
  const analysis = await getAnalysisById(analysisId)
  
  if (!analysis) {
    return NextResponse.json(
      { error: 'Analyse nicht gefunden' },
      { status: 404 }
    )
  }

  if (!analysis.paid) {
    return NextResponse.json(
      { error: 'Analyse nicht freigeschaltet' },
      { status: 403 }
    )
  }

  // 3. Generate PDF
  const pdfBuffer = await renderToBuffer(
    <AnalysisReport analysis={analysis} />
  )

  // 4. Format date for filename
  const date = new Date().toISOString().split('T')[0]
  const filename = `auswanderer-analyse-${date}.pdf`

  // 5. Return PDF as download
  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-cache',
    },
  })
}
```

### Mock Data (bis Supabase)
```typescript
// Temporary until Epic 6 (Auth + DB)
function getAnalysisById(id: string): Promise<Analysis | null> {
  // Check URL param or session
  // For development: Return mock data
  
  if (id === 'demo') {
    return Promise.resolve({
      id: 'demo',
      paid: true, // Demo is always "paid"
      topCountry: 'Portugal',
      matchPercentage: 92,
      rankings: [...],
      criteriaRatings: {...},
      createdAt: new Date().toISOString(),
    })
  }
  
  return Promise.resolve(null)
}
```

### Response Headers
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="auswanderer-analyse-2026-01-18.pdf"
Content-Length: <size>
Cache-Control: no-cache
```

### Edge Runtime
```typescript
// PDF generation requires Node.js runtime (not Edge)
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
```

## Dependencies
- Story 5.2 (PDF Template)
- `@react-pdf/renderer` Package
- Node.js Runtime (nicht Edge)

## Out of Scope
- Supabase Integration (Epic 6)
- Caching/Storage von generierten PDFs
- PDF-Vorschau im Browser

## Definition of Done
- [ ] API Route `/api/pdf/[id]` implementiert
- [ ] PDF wird serverseitig generiert
- [ ] Generierung < 30 Sekunden
- [ ] Korrekter Content-Type Header
- [ ] Korrekter Dateiname mit Datum
- [ ] 403 bei unbezahlten Analysen
- [ ] 404 bei ungültigen IDs
- [ ] Error Handling implementiert
- [ ] Node.js Runtime konfiguriert

