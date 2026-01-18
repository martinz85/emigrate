# Story 2.3: Rating UI Component

Status: done

## Story

Als User,
möchte ich Kriterien einfach bewerten können,
damit die Analyse-Erstellung Spaß macht.

## Acceptance Criteria

1. **AC1:** 5 Buttons sichtbar (1-5) mit Emojis
2. **AC2:** Ich kann einen Button antippen
3. **AC3:** Der gewählte Button ist visuell hervorgehoben (Primary Color)
4. **AC4:** Die Touch-Targets sind mindestens 48px groß

## Tasks / Subtasks

- [x] **Task 1: RatingButtons Komponente** (AC: 1, 2, 3, 4)
  - [x] 1.1 5 Buttons mit Emojis (😐 🙂 😊 😃 🤩)
  - [x] 1.2 onClick Handler
  - [x] 1.3 Selected State mit Primary Color
  - [x] 1.4 min-w-[48px] min-h-[48px] für WCAG

## Dev Notes

### Implementierung

**Komponenten:**
- `src/components/analysis/RatingButtons.tsx` - 5-Stufen Rating mit Emojis

**Features:**
- Emojis: 😐 🙂 😊 😃 🤩 für Werte 1-5
- Hover-Effekte
- Selected State: bg-primary-500 text-white scale-110
- Touch-Targets: min-w-[48px] min-h-[48px]
- Responsive: w-14 h-14 sm:w-16 sm:h-16

### File List

- `auswanderer-app/src/components/analysis/RatingButtons.tsx`

