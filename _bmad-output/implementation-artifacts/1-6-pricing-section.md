# Story 1.6: Pricing Section

Status: done

## Story

Als potentieller Kunde,
möchte ich die Preise verstehen,
damit ich eine Kaufentscheidung treffen kann.

## Acceptance Criteria

1. **AC1:** Ich sehe die PDF-Einmalzahlung (39€)
2. **AC2:** Ich sehe die PRO-Subscription (14,99€/Monat)
3. **AC3:** Jedes Produkt hat eine klare Feature-Liste
4. **AC4:** Es gibt CTAs für alle Optionen
5. **AC5:** Section hat id="preise" für Anchor-Links

## Tasks / Subtasks

- [x] **Task 1: PricingSection Komponente erstellen** (AC: 1-4)
  - [x] 1.1 Komponente in src/components/landing/PricingSection.tsx
  - [x] 1.2 3 Pricing-Tiers (Free, Einzel-PDF, PRO)
  - [x] 1.3 Feature-Listen für jeden Tier
  - [x] 1.4 CTA-Buttons mit Links

- [x] **Task 2: Visuelle Gestaltung** (AC: 3)
  - [x] 2.1 Card-Layout für jeden Tier
  - [x] 2.2 "Beliebt" Badge für PRO
  - [x] 2.3 Highlighted Border für PRO
  - [x] 2.4 Geld-zurück-Garantie Hinweis

- [x] **Task 3: Integration** (AC: 5)
  - [x] 3.1 id="preise" für Anchor-Navigation
  - [x] 3.2 Einbindung in Landing Page
  - [x] 3.3 Export in barrel file

## Dev Notes

### Implementierung

Die Komponente wurde bereits in Story 1.1 erstellt.

**3 Pricing Tiers:**
1. **Free** (0€): AI-Analyse, 26 Kriterien, 2-Seiten Vorschau, Top 3 Länder
2. **Einzel-PDF** (39€ einmalig): Vollständige PDF, Detailmatrix, Empfehlung
3. **PRO** (14,99€/Monat): Unbegrenzt, alle PDFs, E-Books, Dashboard, Tools

**Features:**
- Responsive 3-Column Grid
- "Beliebt" Badge für PRO
- Border + Shadow Highlight für PRO
- Geld-zurück-Garantie (14 Tage)

### File List

- `auswanderer-app/src/components/landing/PricingSection.tsx`

