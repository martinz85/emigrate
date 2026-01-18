# Story 2.5: Progress Header

Status: done

## Story

Als User,
möchte ich meinen Fortschritt sehen,
damit ich weiß wie weit ich bin.

## Acceptance Criteria

1. **AC1:** Der Fortschrittsbalken zeigt meinen Fortschritt (X/28)
2. **AC2:** Die Kategorie-Anzeige zeigt welche Kategorie aktiv ist
3. **AC3:** Der Progress ist sticky am oberen Bildschirmrand
4. **AC4:** Ein Zurück-Button ist sichtbar

## Tasks / Subtasks

- [x] **Task 1: ProgressHeader Komponente** (AC: 1, 2, 3, 4)
  - [x] 1.1 shadcn/ui Progress Bar
  - [x] 1.2 Kategorie mit Icon
  - [x] 1.3 sticky top-0 z-50
  - [x] 1.4 Zurück-Button mit 48px Touch-Target

## Dev Notes

### Implementierung

**Komponenten:**
- `src/components/analysis/ProgressHeader.tsx` - Sticky Header mit Progress

**Features:**
- Progress Bar mit shadcn/ui
- Kategorie-Icon + Label (responsive)
- Counter: "X / 28"
- Sticky mit backdrop-blur
- Zurück-Button: min-w-[48px] min-h-[48px]

### File List

- `auswanderer-app/src/components/analysis/ProgressHeader.tsx`

