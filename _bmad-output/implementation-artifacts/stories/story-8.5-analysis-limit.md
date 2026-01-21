---
story_id: "8.5"
title: "Analyse-Limit für PRO-User"
epic: "Epic 8 - PRO Subscription"
status: done
created: 2026-01-21
created_by: Bob (SM)
priority: high
estimated_points: 3
depends_on: ["8.1"]
completed: 2026-01-21
completed_by: Amelia (Dev)
---

# Story 8.5: Analyse-Limit für PRO-User

## User Story

Als Admin,
möchte ich ein tägliches Analyse-Limit für PRO-User setzen können,
damit die AI-Kosten kontrollierbar bleiben und Missbrauch verhindert wird.

## Business Context

- **PRD Reference:** Section 5.2.1 - "Unbegrenzter AI-Zugang" (realistisch: begrenzt)
- **Kostenkontrolle:** Claude API Kosten bei 100+ Analysen/Tag/User
- **Fair Use:** Verhindert Bot-Missbrauch
- **Default:** 5 Analysen pro Tag (konfigurierbar)

## Acceptance Criteria

### AC1: Admin-Setting für Limit
**Given** ich bin im Admin-Bereich unter /admin/settings
**When** ich die PRO-Einstellungen öffne
**Then** sehe ich ein Feld "Analysen pro Tag (PRO)"
**And** der Default-Wert ist 5

### AC2: Limit wird durchgesetzt
**Given** ich bin PRO-User und habe heute 5 Analysen gemacht
**When** ich eine 6. Analyse starten will
**Then** sehe ich "Dein Tageslimit ist erreicht"
**And** der Analyse-Button ist deaktiviert
**And** ich sehe wann das Limit zurückgesetzt wird

### AC3: Limit-Anzeige für User
**Given** ich bin PRO-User auf /analyse
**When** ich die Seite besuche
**Then** sehe ich "Noch X Analysen heute verfügbar"
**And** X aktualisiert sich nach jeder Analyse

### AC4: FREE-User hat kein Limit
**Given** ich bin FREE-User (nicht PRO)
**When** ich eine Analyse starte
**Then** gibt es kein tägliches Limit
**And** ich muss nach Preview für PDF bezahlen (wie gehabt)

### AC5: Limit-Reset um Mitternacht
**Given** ich habe mein Limit erreicht
**When** Mitternacht (Europe/Berlin) ist
**Then** wird mein Zähler auf 0 zurückgesetzt
**And** ich kann wieder X Analysen machen

### AC6: Admin kann Limit pro User überschreiben
**Given** ich bin Admin in /admin/users/[id]
**When** ich einen User bearbeite
**Then** kann ich sein persönliches Limit überschreiben
**And** "0" bedeutet unlimited

## Technical Tasks

- [ ] **Task 1: Datenbank-Schema**
  - [ ] `app_settings` Tabelle: `pro_daily_analysis_limit` (default 5)
  - [ ] `profiles` Tabelle: `analysis_limit_override` (nullable)
  - [ ] `user_analysis_counts` Tabelle für tägliche Zählung

- [ ] **Task 2: Admin-Settings UI**
  - [ ] Neues Feld in /admin/settings
  - [ ] Validierung (1-100)

- [ ] **Task 3: Limit-Enforcement API**
  - [ ] Vor Analyse-Start: Check aktueller Count
  - [ ] Nach Analyse: Increment Count
  - [ ] Helper: `canUserAnalyze(userId): { allowed: boolean, remaining: number }`

- [ ] **Task 4: Frontend-Integration**
  - [ ] Limit-Anzeige auf /analyse
  - [ ] Disabled-State wenn Limit erreicht
  - [ ] Countdown bis Reset

- [ ] **Task 5: Cron/Reset-Logik**
  - [ ] Midnight Reset (Supabase scheduled function oder App-Logic)

## Database Schema

```sql
-- App Settings (if not exists)
INSERT INTO app_settings (key, value, description)
VALUES ('pro_daily_analysis_limit', '5', 'Max analyses per day for PRO users')
ON CONFLICT (key) DO NOTHING;

-- User-specific override
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS analysis_limit_override INTEGER;

COMMENT ON COLUMN profiles.analysis_limit_override IS 
'Override daily limit. NULL = use default, 0 = unlimited';

-- Daily analysis counter
CREATE TABLE IF NOT EXISTS user_analysis_counts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  count INTEGER NOT NULL DEFAULT 0,
  UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_analysis_counts_user_date 
ON user_analysis_counts(user_id, date);

-- RLS
ALTER TABLE user_analysis_counts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own counts"
  ON user_analysis_counts FOR SELECT
  USING (auth.uid() = user_id);
```

## Files to Modify

| Datei | Aktion |
|-------|--------|
| `supabase/migrations/033_analysis_limit.sql` | Create |
| `src/app/admin/settings/page.tsx` | Modify |
| `src/app/api/analyze/route.ts` | Modify |
| `src/app/analyse/page.tsx` | Modify |
| `src/lib/analysis-limit.ts` | Create |

## Out of Scope

- Wöchentliches/monatliches Limit
- Rollover von ungenutzten Analysen
- Analyse-Qualitäts-Tiers

## Testing Checklist

- [ ] Setting erscheint im Admin
- [ ] FREE-User hat kein Limit
- [ ] PRO-User sieht verbleibendes Limit
- [ ] 6. Analyse wird blockiert
- [ ] Midnight Reset funktioniert
- [ ] Admin kann Override setzen

