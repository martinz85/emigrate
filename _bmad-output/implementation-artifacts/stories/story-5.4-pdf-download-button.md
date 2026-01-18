# Story 5.4: PDF Download Button

## Meta
- **Epic:** 5 - PDF Generation & Reveal
- **Status:** ready-for-dev
- **Priority:** High
- **Estimate:** 2 Story Points

## User Story
Als User,
möchte ich mein PDF herunterladen können,
damit ich es offline lesen kann.

## Acceptance Criteria

### AC 1: Download Button
**Given** ich bin auf der Ergebnis-Seite nach Zahlung (`?unlocked=true`)
**When** ich die Seite sehe
**Then** sehe ich einen "PDF herunterladen" Button
**And** der Button ist prominent platziert

### AC 2: Download Start
**Given** ich klicke auf "PDF herunterladen"
**When** der Download startet
**Then** startet der Download automatisch
**And** ich muss nicht auf einer neuen Seite bestätigen

### AC 3: Dateiname
**Given** das PDF wurde heruntergeladen
**When** ich die Datei sehe
**Then** heißt sie "auswanderer-analyse-[datum].pdf"
**And** das Datum ist das aktuelle Datum

### AC 4: Loading State
**Given** ich klicke auf "PDF herunterladen"
**When** die PDF generiert wird
**Then** sehe ich einen Spinner/Loading-Indicator
**And** der Button ist deaktiviert
**And** nach Fertigstellung wird der normale Zustand wiederhergestellt

### AC 5: Error Handling
**Given** die PDF-Generierung fehlschlägt
**When** ein Fehler auftritt
**Then** sehe ich eine Fehlermeldung
**And** ich kann es erneut versuchen

## Technical Notes

### Component
```typescript
// src/components/results/PdfDownloadButton.tsx
'use client'

import { useState } from 'react'

interface PdfDownloadButtonProps {
  analysisId: string
}

export function PdfDownloadButton({ analysisId }: PdfDownloadButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDownload = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/pdf/${analysisId}`)
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Download fehlgeschlagen')
      }

      // Get blob and create download link
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      
      // Extract filename from Content-Disposition or use default
      const disposition = response.headers.get('Content-Disposition')
      const filename = disposition?.match(/filename="(.+)"/)?.[1] 
        || `auswanderer-analyse-${new Date().toISOString().split('T')[0]}.pdf`

      // Trigger download
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Cleanup
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('PDF download error:', err)
      setError(err instanceof Error ? err.message : 'Download fehlgeschlagen')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleDownload}
        disabled={isLoading}
        className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        aria-busy={isLoading}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            PDF wird erstellt...
          </>
        ) : (
          <>
            <span aria-hidden="true">📄</span>
            PDF herunterladen
          </>
        )}
      </button>
      
      {error && (
        <p className="mt-2 text-red-600 text-sm" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
```

### Integration in ResultPage
```typescript
// src/app/ergebnis/[id]/page.tsx
import { PdfDownloadButton } from '@/components/results/PdfDownloadButton'

// ... in JSX, nur wenn unlocked:
{isUnlocked && (
  <div className="mt-8">
    <PdfDownloadButton analysisId={analysisId} />
  </div>
)}
```

### Button Design
```
┌──────────────────────────────────┐
│  📄  PDF herunterladen           │  ← Normal State
└──────────────────────────────────┘

┌──────────────────────────────────┐
│  🔄  PDF wird erstellt...        │  ← Loading State
└──────────────────────────────────┘
```

### Download Flow
```
User klickt "PDF herunterladen"
    ↓
Loading State aktiviert
    ↓
fetch('/api/pdf/{id}')
    ↓
PDF als Blob empfangen
    ↓
Virtueller Download-Link erstellt
    ↓
Download startet automatisch
    ↓
Loading State beendet
```

## Dependencies
- Story 5.3 (PDF Generator API)
- Story 5.1 (Reveal Page - für Integration)

## Out of Scope
- PDF-Vorschau
- Email-Versand des PDFs
- PDF-Speicherung auf Server

## Definition of Done
- [ ] PdfDownloadButton Component erstellt
- [ ] Button prominent auf Ergebnis-Seite
- [ ] Download startet automatisch
- [ ] Korrekter Dateiname mit Datum
- [ ] Loading State mit Spinner
- [ ] Error Handling mit Retry-Möglichkeit
- [ ] Accessibility (aria-busy, role="alert")
- [ ] Integration in Ergebnis-Seite

