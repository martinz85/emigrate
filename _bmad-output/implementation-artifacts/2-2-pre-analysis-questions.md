# Story 2.2: Pre-Analysis Questions

Status: done

## Story

Als User,
möchte ich optional Länder angeben die mich interessieren,
damit die Analyse personalisierter wird.

## Acceptance Criteria

1. **AC1:** Ich kann Länder aus einer Liste auswählen (Multiselect)
2. **AC2:** Ich kann optional einen Freitext-Wunsch eingeben
3. **AC3:** Ich kann die Fragen überspringen
4. **AC4:** Meine Auswahl wird im State gespeichert

## Tasks / Subtasks

- [x] **Task 1: PreAnalysisForm Komponente** (AC: 1, 2, 3)
  - [x] 1.1 Länder-Multiselect mit 22 Optionen
  - [x] 1.2 Freitext-Feld für besondere Wünsche
  - [x] 1.3 "Weiter" und "Überspringen" Buttons

- [x] **Task 2: Zustand Store Integration** (AC: 4)
  - [x] 2.1 analysisStore mit preAnalysis State
  - [x] 2.2 setPreAnalysis Action

## Dev Notes

### Implementierung

**Komponenten:**
- `src/components/analysis/PreAnalysisForm.tsx` - Form für Pre-Analysis Fragen
- `src/stores/analysisStore.ts` - Zustand Store für Analysis State

**Features:**
- 22 Länder zur Auswahl (Portugal, Spanien, Thailand, etc.)
- Freitext-Feld mit Placeholder
- "Überspringen" Option
- Daten werden im Zustand Store persistiert

### File List

- `auswanderer-app/src/components/analysis/PreAnalysisForm.tsx`
- `auswanderer-app/src/stores/analysisStore.ts`
- `auswanderer-app/src/lib/criteria.ts` (PRE_ANALYSIS_QUESTIONS)

