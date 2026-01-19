---
story_id: "7.1"
title: "E-Book Landing Page"
epic: "Epic 7 - E-Book Integration"
status: ready-for-dev
created: 2026-01-19
created_by: Bob (SM)
priority: high
estimated_points: 5
---

# Story 7.1: E-Book Landing Page

## User Story

Als potentieller Kunde,
möchte ich eine übersichtliche E-Book Shop-Seite sehen,
damit ich verstehe welche E-Books verfügbar sind und diese kaufen kann.

## Business Context

- **PRD Reference:** Section 5.2.2 - E-Books (4 Formate)
- **Epic Goal:** FR10 - E-Book Shop (Post-MVP)
- **Revenue Impact:** Zusätzliche Umsatzquelle neben PDF-Analyse

## E-Books (aus PRD)

| E-Book | Preis | Beschreibung |
|--------|-------|--------------|
| Ausführliche Langversion | 19,99€ | Kompletter Leitfaden |
| Kurzversion | 9,99€ | Das Wichtigste kompakt |
| Tips & Tricks | 14,99€ | Praktische Hacks |
| Auswandern für Dummies | 12,99€ | Einsteigerfreundlich |
| **Bundle (alle 4)** | 39,99€ | 33% Rabatt |

## Acceptance Criteria

### AC1: E-Book Übersichtsseite
**Given** ich besuche /ebooks
**When** die Seite geladen wird
**Then** sehe ich alle 4 E-Books als Karten dargestellt
**And** jede Karte zeigt: Titel, Kurzbeschreibung, Preis, CTA-Button
**And** das Bundle wird prominent hervorgehoben (Empfohlen-Badge)

### AC2: E-Book Detail-Informationen
**Given** ich bin auf der E-Book Seite
**When** ich auf ein E-Book klicke oder Details ansehe
**Then** sehe ich eine ausführliche Beschreibung
**And** sehe ich Inhaltsverzeichnis/Kapitelübersicht
**And** sehe ich den Umfang (Seitenzahl/Lesezeit)

### AC3: Responsive Design
**Given** ich besuche /ebooks auf Mobile
**When** die Seite geladen wird
**Then** sind alle Karten vertikal gestapelt
**And** Touch-Targets sind min. 48px groß
**And** es gibt keine horizontalen Scrollbars

### AC4: SEO-Optimierung
**Given** die E-Book Seite ist deployed
**When** ein Suchmaschinen-Crawler die Seite besucht
**Then** sind Meta-Tags gesetzt (title, description)
**And** strukturierte Daten für Produkte sind vorhanden (JSON-LD)
**And** die Seite hat eine unique H1

### AC5: PRO-Integration
**Given** ich bin als PRO-User eingeloggt
**When** ich die E-Book Seite besuche
**Then** sehe ich "Im PRO-Abo enthalten" statt Kaufpreis
**And** der CTA-Button zeigt "Jetzt lesen" statt "Kaufen"

## Technical Tasks

- [ ] **Task 1: Route und Layout erstellen**
  - [ ] Erstelle `/app/(marketing)/ebooks/page.tsx`
  - [ ] Füge Meta-Tags hinzu (title, description, og:image)
  - [ ] Implementiere JSON-LD für Product Schema

- [ ] **Task 2: E-Book Datenstruktur**
  - [ ] Erstelle `/lib/ebooks.ts` mit E-Book Definitionen
  - [ ] Definiere TypeScript Interface `Ebook`
  - [ ] Exportiere alle 4 E-Books + Bundle

- [ ] **Task 3: EbookCard Component**
  - [ ] Erstelle `/components/ebooks/EbookCard.tsx`
  - [ ] Props: ebook, isPro, onBuy
  - [ ] Design: Karte mit Bild-Platzhalter, Titel, Beschreibung, Preis
  - [ ] Badge für "Empfohlen" (Bundle)

- [ ] **Task 4: EbookGrid Component**
  - [ ] Erstelle `/components/ebooks/EbookGrid.tsx`
  - [ ] Responsive Grid (1 Spalte Mobile, 2 Tablet, 4 Desktop)
  - [ ] Bundle prominent am Ende oder Anfang

- [ ] **Task 5: PRO-Status Integration**
  - [ ] Prüfe PRO-Status via Supabase Auth
  - [ ] Konditionelle Darstellung für PRO-User
  - [ ] "Im Abo enthalten" Badge

- [ ] **Task 6: Navigation Update**
  - [ ] Füge "E-Books" zur Header-Navigation hinzu
  - [ ] Link zu `/ebooks`

## Dev Notes

### Abhängigkeiten
- Supabase Auth (Epic 6) ✅ bereits implementiert
- Header/Navigation (Epic 1) ✅ bereits implementiert

### Referenzen
- Pricing Section Design als Vorlage (ähnliches Karten-Layout)
- shadcn/ui Card Component verwenden

### E-Book Datenstruktur

```typescript
interface Ebook {
  id: string
  title: string
  slug: string
  description: string
  longDescription: string
  price: number // in cents
  pages: number
  readingTime: string // "2-3 Stunden"
  chapters: string[]
  isBundle?: boolean
  bundleItems?: string[] // IDs der enthaltenen E-Books
}
```

### Stripe Produkt-IDs
- Müssen in Stripe Dashboard erstellt werden
- Referenzieren in `/lib/ebooks.ts` via `stripeProductId`

## Files to Create/Modify

| Datei | Aktion | Beschreibung |
|-------|--------|--------------|
| `src/app/(marketing)/ebooks/page.tsx` | Create | E-Book Landing Page |
| `src/lib/ebooks.ts` | Create | E-Book Daten und Typen |
| `src/components/ebooks/EbookCard.tsx` | Create | Einzelne E-Book Karte |
| `src/components/ebooks/EbookGrid.tsx` | Create | Grid Layout |
| `src/components/ebooks/index.ts` | Create | Barrel Export |
| `src/components/layout/Header.tsx` | Modify | E-Books Navigation Link |

## Out of Scope

- Stripe Checkout für E-Books (Story 7.2)
- Download-Funktionalität (Story 7.3)
- PDF-Viewer für E-Books
- E-Book Bewertungen/Reviews

## Testing Checklist

- [ ] Seite lädt auf Desktop, Tablet, Mobile
- [ ] Alle 4 E-Books + Bundle werden angezeigt
- [ ] PRO-User sieht "Im Abo enthalten"
- [ ] Free-User sieht Preise
- [ ] Navigation Link funktioniert
- [ ] Meta-Tags sind korrekt gesetzt
- [ ] Lighthouse Score > 90

