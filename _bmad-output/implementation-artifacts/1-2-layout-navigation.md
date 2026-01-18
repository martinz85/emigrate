# Story 1.2: Layout & Navigation

Status: review

## Story

Als User,
möchte ich eine konsistente Navigation auf allen Seiten sehen,
damit ich mich auf der Plattform orientieren kann.

## Acceptance Criteria

1. **AC1:** Ich sehe einen Header mit Logo und Navigation auf jeder Seite
2. **AC2:** Ich sehe einen Footer mit Links und Copyright auf jeder Seite
3. **AC3:** Auf Mobile sehe ich eine Hamburger-Navigation (Responsive)
4. **AC4:** Alle Links sind klickbar und führen zur richtigen Seite
5. **AC5:** Das Layout ist konsistent über alle Routen

## Tasks / Subtasks

- [x] **Task 1: Header-Komponente validieren** (AC: 1, 3, 4)
  - [x] 1.1 Header.tsx existiert in `src/components/layout/`
  - [x] 1.2 Logo mit Link zur Startseite vorhanden
  - [x] 1.3 Desktop-Navigation mit allen Links vorhanden
  - [x] 1.4 Mobile Hamburger-Menu funktioniert
  - [x] 1.5 "Kostenlos starten" CTA-Button vorhanden

- [x] **Task 2: Footer-Komponente validieren** (AC: 2, 4)
  - [x] 2.1 Footer.tsx existiert in `src/components/layout/`
  - [x] 2.2 Produkt-Links vorhanden (Analyse, E-Books, Preise, PRO)
  - [x] 2.3 Rechtliche Links vorhanden (Impressum, Datenschutz, AGB, Kontakt)
  - [x] 2.4 Copyright mit dynamischem Jahr

- [x] **Task 3: Layout-Integration prüfen** (AC: 5)
  - [x] 3.1 Landing Page nutzt Header + Footer
  - [x] 3.2 Analyse-Page nutzt Header
  - [x] 3.3 Alle weiteren Pages nutzen konsistentes Layout

- [x] **Task 4: Verbesserungen für UX Compliance** (AC: 1-5)
  - [x] 4.1 Farben anpassen auf Teal (#0F766E) gemäß UX-Spec
  - [x] 4.2 Header sticky-Verhalten optimieren
  - [x] 4.3 Focus-States für Accessibility hinzugefügt
  - [x] 4.4 Skip-to-content Link für Accessibility
  - [x] 4.5 Touch-Targets auf 48px vergrößert (WCAG)

## Dev Notes

### Aktueller Status

**WICHTIG:** Header und Footer wurden bereits in Story 1.1 implementiert!

Die Komponenten existieren und funktionieren:
- `src/components/layout/Header.tsx` ✅
- `src/components/layout/Footer.tsx` ✅

### Noch zu verbessern (Task 4)

Die aktuellen Komponenten verwenden `primary-500` Farben, die UX-Spec definiert aber:
- **Primary:** Teal #0F766E
- **Secondary:** Amber #F59E0B

Die Tailwind-Config muss geprüft werden ob die Farben korrekt sind.

### Architecture Compliance

**Aus Architecture-Doc:**
- Components in `src/components/layout/` ✅
- PascalCase Naming ✅
- `use client` Direktive für interaktive Komponenten ✅

**Aus UX-Design-Spec:**
- Mobile-First Approach ✅
- Touch Targets min 48px (Hamburger-Button p-2 = 40px → **muss geprüft werden**)
- Fixed Header mit blur ✅
- WCAG 2.1 AA Konformität (Fokus-States, ARIA-Labels)

### Bestehende Implementierung

**Header Features:**
- Fixed positioning mit backdrop-blur ✅
- Logo "🌍 Auswanderer" ✅
- Desktop Nav: So funktioniert's, Preise, E-Books, Login, CTA ✅
- Mobile: Hamburger-Toggle mit State ✅
- Responsive Breakpoint: `md:` ✅

**Footer Features:**
- 4-Column Grid (responsive) ✅
- Brand-Section mit Logo + Beschreibung ✅
- Produkt-Links ✅
- Rechtliche Links ✅
- Copyright mit dynamischem Jahr ✅
- Disclaimer-Text ✅

### Accessibility Check

| Element | Status | Fix |
|---------|--------|-----|
| aria-label auf Hamburger | ✅ | - |
| Focus-States | ⚠️ | Standard, nicht custom |
| Skip-to-content | ❌ | Fehlt |
| Keyboard-Navigation | ✅ | Tab funktioniert |

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Project-Structure]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Visual-Foundation]
- [Source: _bmad-output/planning-artifacts/epics.md#Story-1.2]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (SM Agent - Story Preparation)

### Pre-Implementation Analysis

Story 1.2 ist zu **85% bereits implementiert** durch Story 1.1.

**Verbleibende Arbeit (Task 4):**
- UX-Farben verifizieren/anpassen
- Accessibility-Verbesserungen
- Aktive Link-States

### Empfehlung

Diese Story kann als **Quick-Win** bearbeitet werden:
1. Farben in `tailwind.config.ts` prüfen
2. Skip-to-content Link hinzufügen
3. Focus-States verbessern
4. Touch-Target-Größen verifizieren

Geschätzte Zeit: 30-60 Minuten

### Completion Notes List

- ✅ Tailwind Farben auf Teal/Amber Palette aktualisiert (UX-Spec compliant)
- ✅ Skip-to-content Link in layout.tsx hinzugefügt
- ✅ Focus-States für alle interaktiven Elemente in globals.css
- ✅ Hamburger-Button Touch-Target auf 48px erhöht (WCAG 2.1 AA)
- ✅ aria-expanded Attribut für Mobile Menu hinzugefügt

### File List

**Modifizierte Dateien:**
- `auswanderer-app/tailwind.config.ts` - Farbpalette Teal/Amber
- `auswanderer-app/src/app/layout.tsx` - Skip-to-content Link
- `auswanderer-app/src/app/globals.css` - Focus-States
- `auswanderer-app/src/components/layout/Header.tsx` - Touch-Targets, aria-expanded
- `auswanderer-app/src/app/page.tsx` - id="main-content"

