# Story 2.4: Question Flow State

Status: done

## Story

Als User,
möchte ich durch alle 28 Fragen geführt werden,
damit ich alle Kriterien bewerte.

## Acceptance Criteria

1. **AC1:** Nach 300ms wechselt die Ansicht zur nächsten Frage (Auto-Advance)
2. **AC2:** Mein Rating wird im Zustand Store gespeichert
3. **AC3:** Ich kann zurück zur vorherigen Frage navigieren
4. **AC4:** Meine vorherige Antwort ist erhalten

## Tasks / Subtasks

- [x] **Task 1: Question Flow Logic** (AC: 1, 3)
  - [x] 1.1 Auto-Advance nach 300ms
  - [x] 1.2 Back-Navigation
  - [x] 1.3 Flow durch alle 28 Kriterien

- [x] **Task 2: Zustand Store für Ratings** (AC: 2, 4)
  - [x] 2.1 ratings: Record<string, number> im Store
  - [x] 2.2 setRating, nextCriterion, previousCriterion Actions
  - [x] 2.3 Persist Middleware für Erhaltung

## Dev Notes

### Implementierung

**Komponenten:**
- `src/components/analysis/AnalysisFlow.tsx` - Haupt-Flow Controller
- `src/stores/analysisStore.ts` - Zustand Store mit persist

**Features:**
- Auto-Advance: setTimeout 300ms nach Rating
- Back-Button im ProgressHeader
- 28 Kriterien aus criteria.ts
- Ratings werden in localStorage persistiert

**Flow:**
1. welcome → pre-analysis → criteria → loading → complete

### File List

- `auswanderer-app/src/components/analysis/AnalysisFlow.tsx`
- `auswanderer-app/src/stores/analysisStore.ts`

