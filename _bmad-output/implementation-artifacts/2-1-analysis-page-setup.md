# Story 2.1: Analysis Page Setup

Status: done

## Story

Als User,
möchte ich die Analyse-Seite besuchen können,
damit ich den Fragebogen starten kann.

## Acceptance Criteria

1. **AC1:** Ich sehe eine einladende Willkommens-Nachricht
2. **AC2:** Ich sehe einen "Los geht's" Button
3. **AC3:** Die Seite ist Mobile-optimiert

## Tasks / Subtasks

- [x] **Task 1: Analyse-Page erstellen** (AC: 1, 2, 3)
  - [x] 1.1 Route /analyse existiert
  - [x] 1.2 Header ist vorhanden
  - [x] 1.3 AnalysisChat Komponente eingebunden

- [x] **Task 2: Willkommens-Nachricht** (AC: 1)
  - [x] 2.1 AI-Begrüßung mit Emoji
  - [x] 2.2 Erklärung des Prozesses (26 Kriterien, 10-15 Min)

- [x] **Task 3: Mobile-Optimierung** (AC: 3)
  - [x] 3.1 Responsive Layout
  - [x] 3.2 Touch-freundliche Buttons

## Dev Notes

### Implementierung

Die Analyse-Seite wurde bereits in Story 1.1 erstellt.

**Komponenten:**
- `src/app/analyse/page.tsx` - Route mit Header + AnalysisChat
- `src/components/analysis/AnalysisChat.tsx` - Chat-Interface

**Features:**
- Willkommens-Nachricht: "Hallo! 👋 Ich bin dein Auswanderungs-Berater..."
- Erklärung: 26 Kriterien, 10-15 Minuten
- Erste Frage direkt in der Begrüßung
- Responsive Layout mit max-w-4xl

### File List

- `auswanderer-app/src/app/analyse/page.tsx`
- `auswanderer-app/src/components/analysis/AnalysisChat.tsx`

