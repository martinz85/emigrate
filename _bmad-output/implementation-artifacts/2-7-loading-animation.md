# Story 2.7: Loading Animation

Status: done

## Story

Als User,
möchte ich sehen dass meine Analyse erstellt wird,
damit ich weiß dass etwas passiert.

## Acceptance Criteria

1. **AC1:** Ich sehe einen animierten Loading-Screen
2. **AC2:** Ich sehe einen pulsierenden Globus 🌍
3. **AC3:** Ich sehe wechselnde Fun Facts über Länder
4. **AC4:** Ich sehe einen Fortschrittsbalken
5. **AC5:** Die Animation läuft 3-5 Sekunden

## Tasks / Subtasks

- [x] **Task 1: LoadingScreen Komponente** (AC: 1, 2, 3, 4, 5)
  - [x] 1.1 🌍 Globus mit animate-pulse
  - [x] 1.2 10 Fun Facts, rotierend alle 2.5s
  - [x] 1.3 Progress Bar 0-100%
  - [x] 1.4 5 Sekunden Duration

## Dev Notes

### Implementierung

**Komponenten:**
- `src/components/analysis/LoadingScreen.tsx` - Loading Animation

**Features:**
- 🌍 Emoji mit animate-pulse
- Ping-Effekt hinter Globus
- 10 Fun Facts über verschiedene Länder
- Progress Bar mit shadcn/ui
- 5 Sekunden Duration (konfigurierbar)
- onComplete Callback

### File List

- `auswanderer-app/src/components/analysis/LoadingScreen.tsx`

