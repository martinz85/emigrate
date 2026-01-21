---
story_id: "8.6"
title: "Fahrplan mit Checkpoints"
epic: "Epic 8 - PRO Subscription"
status: done
created: 2026-01-21
created_by: Bob (SM)
priority: medium
estimated_points: 5
depends_on: ["8.1"]
completed: 2026-01-21
completed_by: Amelia (Dev)
---

# Story 8.6: Fahrplan mit Checkpoints (PRO Dashboard)

## User Story

Als PRO-User,
möchte ich einen personalisierten Auswanderungs-Fahrplan mit Checkpoints sehen,
damit ich meinen Fortschritt tracken und nichts vergessen kann.

## Business Context

- **PRD Reference:** Section 5.2.1 - Feature #5 (Checklisten-System), #6 (Meilenstein-Tracker)
- **Wertversprechen:** PRO-User bekommen Struktur und Übersicht
- **Differenzierung:** FREE-User können nur Analyse machen, PRO bekommen Projekt-Management

## Acceptance Criteria

### AC1: Fahrplan-Dashboard für PRO
**Given** ich bin PRO-User
**When** ich /dashboard/roadmap besuche
**Then** sehe ich meinen Auswanderungs-Fahrplan
**And** er hat mehrere Phasen/Meilensteine
**And** jeder Meilenstein hat Checkpoints

### AC2: Checkpoints abhaken
**Given** ich bin auf meinem Fahrplan
**When** ich einen Checkpoint als erledigt markiere
**Then** wird er als ✅ angezeigt
**And** der Fortschrittsbalken aktualisiert sich
**And** der Status wird in der DB gespeichert

### AC3: Fortschrittsanzeige
**Given** ich habe 5 von 20 Checkpoints erledigt
**When** ich meinen Fahrplan ansehe
**Then** sehe ich "25% geschafft"
**And** der Fortschrittsbalken zeigt 25%

### AC4: Vordefinierte Phasen
**Given** der Fahrplan wird initialisiert
**Then** enthält er diese Phasen:
  - Phase 1: Entscheidung & Recherche
  - Phase 2: Planung & Vorbereitung
  - Phase 3: Dokumente & Bürokratie
  - Phase 4: Umzug & Ankunft
  - Phase 5: Ankommen & Einleben

### AC5: Checkpoints pro Phase
**Given** Phase 1 "Entscheidung & Recherche"
**Then** enthält sie Checkpoints wie:
  - [ ] Zielland entschieden
  - [ ] Analyse durchgeführt
  - [ ] Visa-Anforderungen recherchiert
  - [ ] Budget grob kalkuliert

### AC6: FREE-User Teaser
**Given** ich bin FREE-User
**When** ich /dashboard/roadmap besuche
**Then** sehe ich einen Teaser "Fahrplan ist PRO-Feature"
**And** CTA: "Jetzt PRO werden"

### AC7: Zielland-spezifische Checkpoints (optional)
**Given** mein Fahrplan kennt mein Zielland (z.B. Schweden)
**Then** werden länderspezifische Checkpoints angezeigt
**And** z.B. "Personnummer beantragen" für Schweden

## Technical Tasks

- [ ] **Task 1: Datenbank-Schema**
  - [ ] `roadmap_phases` Tabelle (vordefinierte Phasen)
  - [ ] `roadmap_checkpoints` Tabelle (vordefinierte Checkpoints)
  - [ ] `user_roadmap_progress` Tabelle (User-spezifischer Fortschritt)

- [ ] **Task 2: Seed-Daten**
  - [ ] 5 Phasen mit je 4-8 Checkpoints
  - [ ] Insgesamt ~25 Checkpoints

- [ ] **Task 3: Dashboard-Seite**
  - [ ] Erstelle `/dashboard/roadmap/page.tsx`
  - [ ] Phasen-Accordion oder Timeline-View
  - [ ] Checkbox für jeden Checkpoint
  - [ ] Fortschrittsbalken

- [ ] **Task 4: API-Routes**
  - [ ] GET /api/roadmap - Fahrplan laden
  - [ ] POST /api/roadmap/checkpoint - Checkpoint togglen
  - [ ] Fortschritt berechnen

- [ ] **Task 5: PRO-Gate**
  - [ ] PRO-Check auf /dashboard/roadmap
  - [ ] Teaser-Seite für FREE-User

## Database Schema

```sql
-- Roadmap Phases (Admin-definiert)
CREATE TABLE IF NOT EXISTS roadmap_phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  emoji TEXT DEFAULT '📍',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Roadmap Checkpoints (Admin-definiert)
CREATE TABLE IF NOT EXISTS roadmap_checkpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_id UUID NOT NULL REFERENCES roadmap_phases(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  country_code TEXT, -- NULL = alle Länder, 'SE' = nur Schweden
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Progress
CREATE TABLE IF NOT EXISTS user_roadmap_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  checkpoint_id UUID NOT NULL REFERENCES roadmap_checkpoints(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT, -- Optional: User kann Notizen hinzufügen
  UNIQUE(user_id, checkpoint_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_roadmap_checkpoints_phase ON roadmap_checkpoints(phase_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user ON user_roadmap_progress(user_id);

-- RLS
ALTER TABLE roadmap_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roadmap_progress ENABLE ROW LEVEL SECURITY;

-- Phases/Checkpoints: Public read
CREATE POLICY "Anyone can read phases" ON roadmap_phases FOR SELECT USING (TRUE);
CREATE POLICY "Anyone can read checkpoints" ON roadmap_checkpoints FOR SELECT USING (TRUE);

-- Progress: User can manage own
CREATE POLICY "Users manage own progress" ON user_roadmap_progress 
  FOR ALL USING (auth.uid() = user_id);
```

## Seed-Daten (Beispiel)

```sql
-- Phase 1
INSERT INTO roadmap_phases (title, description, emoji, sort_order) VALUES
('Entscheidung & Recherche', 'Die Grundlagen für deine Auswanderung legen', '🔍', 1),
('Planung & Vorbereitung', 'Konkrete Schritte einleiten', '📋', 2),
('Dokumente & Bürokratie', 'Papierkram erledigen', '📄', 3),
('Umzug & Ankunft', 'Der große Tag und die erste Zeit', '✈️', 4),
('Ankommen & Einleben', 'Dein neues Leben aufbauen', '🏠', 5);

-- Checkpoints für Phase 1
INSERT INTO roadmap_checkpoints (phase_id, title, sort_order) 
SELECT id, 'Zielland entschieden', 1 FROM roadmap_phases WHERE sort_order = 1;
-- ... weitere Checkpoints
```

## UI-Mockup (Text)

```
┌─────────────────────────────────────────┐
│  📍 Dein Auswanderungs-Fahrplan         │
│  ▓▓▓▓▓▓░░░░░░░░░░░░░░ 25% geschafft     │
├─────────────────────────────────────────┤
│  🔍 Phase 1: Entscheidung & Recherche   │
│  ┌───────────────────────────────────┐  │
│  │ ✅ Zielland entschieden           │  │
│  │ ✅ Analyse durchgeführt           │  │
│  │ ☐  Visa-Anforderungen recherchiert│  │
│  │ ☐  Budget grob kalkuliert         │  │
│  └───────────────────────────────────┘  │
│                                         │
│  📋 Phase 2: Planung & Vorbereitung     │
│  (4 Checkpoints, 0 erledigt)            │
│  [Aufklappen ▼]                         │
└─────────────────────────────────────────┘
```

## Files to Create/Modify

| Datei | Aktion |
|-------|--------|
| `supabase/migrations/034_roadmap.sql` | Create |
| `supabase/migrations/035_roadmap_seed.sql` | Create |
| `src/app/dashboard/roadmap/page.tsx` | Create |
| `src/components/roadmap/PhaseAccordion.tsx` | Create |
| `src/components/roadmap/CheckpointItem.tsx` | Create |
| `src/app/api/roadmap/route.ts` | Create |
| `src/app/api/roadmap/checkpoint/route.ts` | Create |

## Out of Scope

- AI-generierte Checkpoints
- Zeitliche Deadlines pro Checkpoint
- Reminder/Notifications
- Admin-UI für Checkpoint-Verwaltung (V2)

## Testing Checklist

- [ ] PRO-User sieht Fahrplan
- [ ] FREE-User sieht Teaser
- [ ] Checkpoints können abgehakt werden
- [ ] Fortschritt wird berechnet
- [ ] Status persistiert nach Reload
- [ ] Alle 5 Phasen sind sichtbar

