---
story_id: "8.1"
title: "Subscription Plans"
epic: "Epic 8 - PRO Subscription"
status: done
created: 2026-01-19
created_by: Bob (SM)
priority: high
estimated_points: 8
---

# Story 8.1: Subscription Plans

## User Story

Als potentieller PRO-Kunde,
möchte ich die PRO-Subscription Vorteile verstehen und vergleichen können,
damit ich eine informierte Kaufentscheidung treffen kann.

## Business Context

- **PRD Reference:** Section 5.2.1 - Auswanderer PRO Subscription (14,99€/Monat)
- **Epic Goal:** FR9 - PRO Dashboard (Post-MVP)
- **Revenue Impact:** Recurring Revenue Stream (MRR)

## PRO Features (12 Features aus PRD)

| # | Feature | Beschreibung |
|---|---------|--------------|
| 1 | Unbegrenzter AI-Zugang | Beliebig viele Länder-Analysen |
| 2 | Alle PDFs inklusive | Keine Extra-Kosten |
| 3 | Alle E-Books inklusive | Voller Bibliotheks-Zugang |
| 4 | Projekt-Dashboard | Persönliches Cockpit |
| 5 | Checklisten-System | Schritt-für-Schritt Aufgaben |
| 6 | Meilenstein-Tracker | Fortschrittsanzeige |
| 7 | Personalisierte Timeline | AI-generierter Zeitplan |
| 8 | Kosten-Tracker | Budget planen |
| 9 | Länder-Vergleich | Bis zu 5 Länder Side-by-Side |
| 10 | Visa-Navigator | Personalisierte Visa-Optionen |
| 11 | Kosten-Rechner Live | Budget → Lebensstandard |
| 12 | Basis-Support | Email/FAQ |

## Acceptance Criteria

### AC1: Pricing Page mit Plan-Vergleich
**Given** ich besuche /pricing oder scrolle zur Pricing Section
**When** die Seite geladen wird
**Then** sehe ich einen Vergleich: Free vs PRO
**And** PRO zeigt alle 12 Features
**And** der Preis 14,99€/Monat ist klar ersichtlich
**And** es gibt einen "PRO werden" CTA-Button

### AC2: Feature-Vergleichstabelle
**Given** ich bin auf der Pricing Seite
**When** ich die Vergleichstabelle sehe
**Then** sind Free-Features mit ✓ markiert
**And** sind PRO-only Features mit ✓ nur bei PRO
**And** PRO wird als "Empfohlen" hervorgehoben

### AC3: Jährliche Option (optional)
**Given** ich bin auf der Pricing Seite
**When** ich die Abrechnungsoptionen sehe
**Then** kann ich zwischen Monatlich und Jährlich wählen
**And** Jährlich zeigt Rabatt (z.B. 2 Monate gratis = 149,90€/Jahr)

### AC4: PRO Status Anzeige
**Given** ich bin bereits PRO-User
**When** ich die Pricing Seite besuche
**Then** sehe ich "Du bist bereits PRO" Badge
**And** der CTA-Button zeigt "Abo verwalten" statt "PRO werden"

### AC5: Mobile Responsive
**Given** ich besuche /pricing auf Mobile
**When** die Seite geladen wird
**Then** ist die Vergleichstabelle scrollbar oder gestapelt
**And** Touch-Targets sind min. 48px groß

### AC6: Stripe Price Integration
**Given** die Pricing Seite ist deployed
**When** die Preise angezeigt werden
**Then** kommen sie aus der Datenbank (nicht hardcoded)
**And** Änderungen im Admin-Dashboard werden reflektiert

## Technical Tasks

- [x] **Task 1: PRO Plan Datenstruktur**
  - [x] Erstelle `/lib/plans.ts` mit Plan-Definitionen
  - [x] Definiere TypeScript Interface `Plan` und `PlanFeature`
  - [x] FREE und PRO Plan exportieren

- [x] **Task 2: Pricing Comparison Component**
  - [x] Erstelle `/components/pricing/PlanComparison.tsx`
  - [x] Zwei-Spalten Layout (Free | PRO)
  - [x] Feature-Liste mit Checkmarks
  - [x] CTA-Buttons

- [x] **Task 3: Feature List Component**
  - [x] Erstelle `/components/pricing/FeatureList.tsx`
  - [x] Props: features, included (boolean array)
  - [x] Icons: ✓ für included, - für nicht included

- [x] **Task 4: Billing Toggle Component**
  - [x] Erstelle `/components/pricing/BillingToggle.tsx`
  - [x] Toggle: Monthly / Yearly
  - [x] Preis-Update bei Toggle
  - [x] "2 Monate gratis" Badge bei Yearly

- [x] **Task 5: Datenbank-Schema für Subscription Plans**
  - [x] Migration erstellen: `subscription_plans` Tabelle
  - [x] Felder: id, name, price_monthly, price_yearly, stripe_price_id_monthly, stripe_price_id_yearly, features (JSONB)
  - [x] Seed-Daten für FREE und PRO

- [x] **Task 6: API Route für Plans**
  - [x] Erstelle `/api/plans/route.ts`
  - [x] GET: Alle aktiven Plans abrufen
  - [x] Caching Header setzen

- [ ] **Task 7: Pricing Section Update** (DEFERRED)
  - [ ] Bestehende PricingSection erweitern (Landing Page nutzt weiterhin /api/prices)
  - [ ] Note: /pricing Page nutzt die neuen Components, Landing Page zeigt 3 Optionen
  - [ ] Design-Entscheidung: Landing = 3 Pläne, /pricing = Free vs PRO

- [x] **Task 8: PRO Status Check**
  - [x] Hook: `useSubscriptionStatus()`
  - [x] Prüft `subscription_tier` aus profiles
  - [x] Cached in Zustand Store

## Dev Notes

### Abhängigkeiten
- Supabase Auth (Epic 6) ✅
- Stripe Integration (Epic 4) ✅
- Pricing Section (Epic 1) ✅

### Stripe Setup erforderlich
1. Produkt "Auswanderer PRO" in Stripe erstellen
2. Zwei Preise: Monthly (14,99€) und Yearly (149,90€)
3. Price IDs in Datenbank speichern

### Datenbank-Migration

```sql
-- Subscription Plans
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- 'free', 'pro'
  description TEXT,
  price_monthly INTEGER, -- in cents, NULL for free
  price_yearly INTEGER,  -- in cents, NULL for free
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly TEXT,
  features JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Data
INSERT INTO subscription_plans (name, slug, price_monthly, price_yearly, features, display_order)
VALUES 
  ('Free', 'free', NULL, NULL, '["1 Analyse", "PDF-Preview", "E-Mail Support"]', 0),
  ('PRO', 'pro', 1499, 14990, '["Unbegrenzte Analysen", "Alle PDFs", "Alle E-Books", "Dashboard", "Checklisten", "Meilenstein-Tracker", "Timeline", "Kosten-Tracker", "Länder-Vergleich", "Visa-Navigator", "Kosten-Rechner", "Basis-Support"]', 1);
```

### TypeScript Interfaces

```typescript
interface Plan {
  id: string
  name: string
  slug: 'free' | 'pro'
  description: string | null
  priceMonthly: number | null
  priceYearly: number | null
  stripePriceIdMonthly: string | null
  stripePriceIdYearly: string | null
  features: string[]
  isActive: boolean
  displayOrder: number
}

interface PlanFeature {
  name: string
  includedInFree: boolean
  includedInPro: boolean
}
```

## Files to Create/Modify

| Datei | Aktion | Beschreibung |
|-------|--------|--------------|
| `supabase/migrations/XXX_subscription_plans.sql` | Create | DB Schema |
| `src/lib/plans.ts` | Create | Plan Typen und Utils |
| `src/app/api/plans/route.ts` | Create | Plans API |
| `src/components/pricing/PlanComparison.tsx` | Create | Vergleichs-UI |
| `src/components/pricing/FeatureList.tsx` | Create | Feature Liste |
| `src/components/pricing/BillingToggle.tsx` | Create | Monatlich/Jährlich |
| `src/components/pricing/index.ts` | Create | Barrel Export |
| `src/hooks/useSubscriptionStatus.ts` | Create | PRO Status Hook |
| `src/components/landing/PricingSection.tsx` | Modify | DB Integration |

## Out of Scope

- Stripe Checkout für Subscription (Story 8.2)
- Subscription Management / Kündigung (Story 8.3)
- Upgrade/Downgrade Flow
- Testphase / Trial

## Testing Checklist

- [x] Free vs PRO Vergleich wird angezeigt
- [x] Alle 12 PRO-Features sind gelistet
- [x] Preise kommen aus der Datenbank (/pricing Page)
- [x] Monthly/Yearly Toggle funktioniert
- [x] PRO-User sieht "Du bist PRO" Badge
- [x] Mobile Layout ist nutzbar
- [x] API Route gibt korrekte Daten zurück
- [x] Migration läuft auf DEV erfolgreich

