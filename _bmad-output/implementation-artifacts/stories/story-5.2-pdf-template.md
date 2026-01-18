# Story 5.2: PDF Template

## Meta
- **Epic:** 5 - PDF Generation & Reveal
- **Status:** ready-for-dev
- **Priority:** High
- **Estimate:** 4 Story Points

## User Story
Als System,
möchte ich ein professionelles PDF-Layout haben,
damit User einen hochwertigen Report erhalten.

## Acceptance Criteria

### AC 1: Deckblatt
**Given** eine Analyse mit allen Daten
**When** das PDF-Template gerendert wird
**Then** enthält es ein Deckblatt mit:
- Titel: "Deine Auswanderungs-Analyse"
- Datum der Erstellung
- Logo/Branding
- Top-Land als Highlight

### AC 2: Kriterien-Bewertungen
**Given** die PDF wird generiert
**When** alle Kriterien enthalten sind
**Then** werden alle 28 Kriterien mit Bewertung angezeigt
**And** gruppiert nach Kategorien (Lebenshaltung, Klima, etc.)
**And** mit visueller Skala (Balken/Sterne)

### AC 3: Länder-Ranking
**Given** die PDF wird generiert
**When** das Ranking angezeigt wird
**Then** enthält es Top 5 Länder mit:
- Rang (1-5)
- Flagge/Emoji
- Ländername
- Match-Prozentsatz
- 2-3 Stärken pro Land
- 1-2 Überlegungen/Herausforderungen

### AC 4: Professionelles Design
**Given** das PDF wird gerendert
**When** es angesehen/gedruckt wird
**Then** ist es professionell und druckfähig
**And** Farben entsprechen dem Brand (Teal #0F766E / Amber #F59E0B)
**And** klare Typografie und Hierarchie
**And** A4-Format mit korrekten Rändern

## Technical Notes

### PDF Template Structure
```
src/lib/pdf/
├── generator.ts          # ✅ Existiert (Basis)
├── templates/
│   ├── AnalysisReport.tsx    # NEU - Haupttemplate
│   ├── CoverPage.tsx         # NEU - Deckblatt
│   ├── CriteriaSection.tsx   # NEU - Kriterien
│   ├── RankingSection.tsx    # NEU - Länder-Ranking
│   └── styles.ts             # NEU - Shared Styles
└── index.ts
```

### React-PDF Template
```typescript
// src/lib/pdf/templates/AnalysisReport.tsx
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'

// Register custom fonts (optional)
Font.register({
  family: 'Inter',
  src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff2'
})

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Inter',
    fontSize: 11,
    color: '#1e293b', // slate-800
  },
  header: {
    backgroundColor: '#0f766e', // teal-700
    padding: 20,
    marginBottom: 20,
  },
  // ... more styles
})

export function AnalysisReport({ analysis }: AnalysisReportProps) {
  return (
    <Document>
      <CoverPage analysis={analysis} />
      <CriteriaSection criteria={analysis.criteriaRatings} />
      <RankingSection rankings={analysis.rankings} />
    </Document>
  )
}
```

### Page Layout (A4)
```
┌──────────────────────────────────────┐
│  ┌────────────────────────────────┐  │
│  │         DECKBLATT              │  │
│  │                                │  │
│  │     🌍 Auswanderer-Analyse     │  │
│  │                                │  │
│  │     Dein Top-Match:            │  │
│  │        🇵🇹 Portugal            │  │
│  │         92% Match              │  │
│  │                                │  │
│  │     Erstellt am: 18.01.2026   │  │
│  └────────────────────────────────┘  │
├──────────────────────────────────────┤
│  ┌────────────────────────────────┐  │
│  │      DEINE BEWERTUNGEN         │  │
│  │                                │  │
│  │  💰 Lebenshaltung              │  │
│  │  ├─ Miete: ████░ 4/5           │  │
│  │  ├─ Lebensmittel: ███░░ 3/5    │  │
│  │  └─ Transport: ████░ 4/5       │  │
│  │                                │  │
│  │  ☀️ Klima                      │  │
│  │  ├─ Wärme: █████ 5/5           │  │
│  │  └─ ...                        │  │
│  └────────────────────────────────┘  │
├──────────────────────────────────────┤
│  ┌────────────────────────────────┐  │
│  │       TOP 5 LÄNDER             │  │
│  │                                │  │
│  │  1. 🇵🇹 Portugal (92%)         │  │
│  │     ✓ Niedrige Lebenshaltung   │  │
│  │     ✓ Angenehmes Klima         │  │
│  │     ⚠️ Sprachbarriere          │  │
│  │                                │  │
│  │  2. 🇪🇸 Spanien (87%)          │  │
│  │     ...                        │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

### Brand Colors
```typescript
export const PDF_COLORS = {
  primary: '#0f766e',      // Teal-700
  primaryLight: '#14b8a6', // Teal-500
  secondary: '#f59e0b',    // Amber-500
  text: '#1e293b',         // Slate-800
  textLight: '#64748b',    // Slate-500
  background: '#f8fafc',   // Slate-50
  border: '#e2e8f0',       // Slate-200
}
```

## Dependencies
- `@react-pdf/renderer` (bereits installiert prüfen)
- Story 5.1 (Land Reveal - für Datenstruktur)
- Criteria data (src/data/criteria.ts)

## Out of Scope
- PDF Generation API (Story 5.3)
- Download-Funktionalität (Story 5.4)
- Custom Fonts (nice-to-have)

## Definition of Done
- [ ] AnalysisReport Template erstellt
- [ ] CoverPage mit Branding
- [ ] CriteriaSection mit allen 28 Kriterien
- [ ] RankingSection mit Top 5 Ländern
- [ ] Brand-Farben korrekt (Teal/Amber)
- [ ] A4-Format mit korrekten Rändern
- [ ] Professionelles, druckfähiges Design
- [ ] TypeScript Interfaces für Daten

