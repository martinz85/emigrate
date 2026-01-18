# Story 2.6: Info Modal

Status: done

## Story

Als User,
möchte ich mehr Details zu einem Kriterium erfahren können,
damit ich informiert bewerten kann.

## Acceptance Criteria

1. **AC1:** Ich tippe auf das ℹ️ Icon
2. **AC2:** Ein Modal öffnet sich mit detaillierter Erklärung
3. **AC3:** Das Modal hat einen "Verstanden" Button
4. **AC4:** Ich kann das Modal durch Tippen außerhalb schließen
5. **AC5:** Der Fokus bleibt im Modal (Accessibility)

## Tasks / Subtasks

- [x] **Task 1: Info Modal in QuestionCard** (AC: 1, 2, 3, 4, 5)
  - [x] 1.1 ℹ️ Button unterhalb der Frage
  - [x] 1.2 shadcn/ui Dialog Component
  - [x] 1.3 criterion.description als Inhalt
  - [x] 1.4 "Verstanden" Button
  - [x] 1.5 Dialog hat eingebauten Focus-Trap

## Dev Notes

### Implementierung

**Komponenten:**
- `src/components/analysis/QuestionCard.tsx` - enthält Info Modal

**Features:**
- shadcn/ui Dialog für Modal
- DialogTitle mit Kategorie-Icon
- DialogDescription mit criterion.description
- "Verstanden" Button schließt Modal
- Accessibility: Focus-Trap durch Radix UI

### File List

- `auswanderer-app/src/components/analysis/QuestionCard.tsx`

