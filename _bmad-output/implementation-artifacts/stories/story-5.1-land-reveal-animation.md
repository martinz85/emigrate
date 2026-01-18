# Story 5.1: Land Reveal Animation

## Meta
- **Epic:** 5 - PDF Generation & Reveal
- **Status:** ready-for-dev
- **Priority:** High
- **Estimate:** 3 Story Points

## User Story
Als User,
möchte ich mein Top-Land dramatisch enthüllt sehen,
damit das Erlebnis unvergesslich ist.

## Acceptance Criteria

### AC 1: Dramatische Animation
**Given** ich habe bezahlt und bin auf der Ergebnis-Seite (`?unlocked=true`)
**When** das Land enthüllt wird
**Then** gibt es eine dramatische Animation (3-5 Sekunden)
**And** die Animation respektiert `prefers-reduced-motion`

### AC 2: Land-Emoji/Flagge
**Given** das Land wird enthüllt
**When** die Animation abgeschlossen ist
**Then** erscheint die Landesflagge/Emoji groß und prominent
**And** es gibt einen visuellen "Wow-Effekt" (Pulse, Glow, Confetti)

### AC 3: Ländername
**Given** das Land wurde enthüllt
**When** ich die Seite sehe
**Then** sehe ich den Ländernamen groß und lesbar
**And** der Name erscheint mit einer Text-Animation

### AC 4: Match-Score
**Given** das Land wurde enthüllt
**When** ich die vollständige Ansicht sehe
**Then** sehe ich "XX% Match" zusammen mit dem Land
**And** der Score-Wert zählt hoch (Count-Up Animation)

## Technical Notes

### Component Structure
```
src/components/results/
├── CountUpScore.tsx      # ✅ Existiert bereits
├── LockedCountry.tsx     # ✅ Existiert bereits (für Freemium)
├── RevealedCountry.tsx   # NEU - Für bezahlte User
├── CountryReveal.tsx     # NEU - Animation Orchestrator
└── ResultTeaser.tsx      # ✅ Existiert - erweitern für unlocked
```

### RevealedCountry Component
```typescript
// src/components/results/RevealedCountry.tsx
interface RevealedCountryProps {
  country: string
  countryCode: string // Für Flagge
  percentage: number
  rank: number
}

export function RevealedCountry({ country, countryCode, percentage, rank }: RevealedCountryProps) {
  // Zeigt: Flagge + Ländername + Prozent
  // Mit Entrance-Animation
}
```

### CountryReveal Animation
```typescript
// src/components/results/CountryReveal.tsx
// Orchestriert die Reveal-Sequenz:
// 1. 0-1s: Suspense-Build (Pulsing circles)
// 2. 1-3s: Flag reveal with zoom effect
// 3. 3-4s: Country name fade-in
// 4. 4-5s: Score count-up
```

### Flaggen-Lösung
Option A: Emoji-Flags (🇵🇹 🇪🇸 🇨🇾)
Option B: SVG Flags via `flag-icons` Package
Option C: Country code + CSS flag sprites

### Animation Library
- Framer Motion (bereits im Projekt)
- CSS Keyframes für einfache Animationen
- `prefers-reduced-motion` Check

### URL Detection
```typescript
// In ResultTeaser.tsx oder neuer ResultPage.tsx
const searchParams = useSearchParams()
const isUnlocked = searchParams.get('unlocked') === 'true'

if (isUnlocked) {
  return <CountryReveal {...fullResult} />
} else {
  return <LockedCountry {...teaserResult} />
}
```

## Dependencies
- Story 4.4 (Success Page mit `?unlocked=true` redirect)
- Framer Motion (bereits installiert)
- CountUpScore Component (bereits existiert)

## Out of Scope
- PDF-Download (Story 5.4)
- Vollständige Ranking-Liste (später)
- Kriterien-Detailansicht (später)

## Definition of Done
- [ ] RevealedCountry Component erstellt
- [ ] CountryReveal Animation implementiert
- [ ] 3-5 Sekunden dramatische Reveal-Sequenz
- [ ] Flagge/Emoji wird groß angezeigt
- [ ] Ländername mit Animation
- [ ] Match-Score mit Count-Up
- [ ] `prefers-reduced-motion` respektiert
- [ ] Responsive Design (Mobile/Desktop)
- [ ] Accessibility (aria-live für finale Werte)

