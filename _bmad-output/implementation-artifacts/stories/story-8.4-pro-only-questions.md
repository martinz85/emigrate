---
story_id: "8.4"
title: "PRO-Only Fragen"
epic: "Epic 8 - PRO Subscription"
status: done
created: 2026-01-21
created_by: Bob (SM)
priority: high
estimated_points: 3
depends_on: ["8.1", "10.7"]
completed: 2026-01-21
completed_by: Amelia (Dev)
---

# Story 8.4: PRO-Only Fragen

## User Story

Als Admin,
möchte ich Fragen als "PRO-Only" markieren können,
damit PRO-User tiefergehende Analysen mit detaillierteren Fragen erhalten.

## Business Context

- **PRD Reference:** Section 5.2.1 - PRO Subscription Differenzierung
- **Wertversprechen:** PRO-User bekommen mehr/bessere Fragen → bessere Analyse
- **Beispiel-Fragen:**
  - "In welche Region/Stadt möchtest du ziehen?"
  - "Welche Branche ist für dich relevant?"
  - "Planst du mit Familie auszuwandern?"

## Acceptance Criteria

### AC1: Admin-Toggle im Fragen-Builder
**Given** ich bin im Admin-Bereich unter /admin/questions
**When** ich eine Frage erstelle oder bearbeite
**Then** sehe ich einen Toggle "PRO-Only"
**And** der Toggle ist standardmäßig deaktiviert

### AC2: Datenbank-Feld
**Given** die Frage hat is_pro_only = true
**When** ein FREE-User die Analyse startet
**Then** wird diese Frage übersprungen
**And** sie erscheint nicht im Fragebogen

### AC3: PRO-User sieht alle Fragen
**Given** ich bin eingeloggt als PRO-User
**When** ich die Analyse starte
**Then** sehe ich alle Fragen inkl. PRO-Only Fragen
**And** PRO-Only Fragen haben ein kleines "PRO" Badge

### AC4: API-Filter
**Given** die Questions-API wird aufgerufen
**When** der User kein PRO ist
**Then** werden PRO-Only Fragen aus der Response gefiltert

### AC5: Analyse berücksichtigt PRO-Fragen
**Given** ein PRO-User hat alle Fragen (inkl. PRO-Only) beantwortet
**When** die AI-Analyse läuft
**Then** werden die zusätzlichen PRO-Antworten berücksichtigt
**And** die Analyse ist dadurch detaillierter

## Technical Tasks

- [ ] **Task 1: Datenbank-Migration**
  - [ ] `ALTER TABLE analysis_questions ADD COLUMN is_pro_only BOOLEAN DEFAULT FALSE`
  - [ ] Index für Performance

- [ ] **Task 2: Admin-UI erweitern**
  - [ ] Toggle in QuestionForm.tsx hinzufügen
  - [ ] Badge in QuestionsList für PRO-Only Fragen
  - [ ] API-Routes anpassen

- [ ] **Task 3: Questions-API Filter**
  - [ ] GET /api/questions: Filter basierend auf User-Status
  - [ ] Supabase-Helper für PRO-Check

- [ ] **Task 4: Frontend-Anzeige**
  - [ ] PRO-Badge bei PRO-Only Fragen
  - [ ] Optional: Hinweis "Diese Frage ist nur für PRO-User"

- [ ] **Task 5: Analyse-Integration**
  - [ ] PRO-Fragen in AI-Prompt aufnehmen
  - [ ] Testen dass Analyse mit mehr Fragen funktioniert

## Database Schema

```sql
-- Migration: Add is_pro_only to analysis_questions
ALTER TABLE analysis_questions 
ADD COLUMN IF NOT EXISTS is_pro_only BOOLEAN DEFAULT FALSE;

-- Index for filtering
CREATE INDEX IF NOT EXISTS idx_questions_pro_only 
ON analysis_questions(is_pro_only) 
WHERE is_pro_only = TRUE;

COMMENT ON COLUMN analysis_questions.is_pro_only IS 
'If true, question is only shown to PRO subscribers';
```

## Files to Modify

| Datei | Aktion |
|-------|--------|
| `supabase/migrations/032_pro_only_questions.sql` | Create |
| `src/app/admin/questions/QuestionForm.tsx` | Modify |
| `src/app/api/questions/route.ts` | Modify |
| `src/app/analyse/page.tsx` | Modify |
| `src/types/questions.ts` | Modify |

## Out of Scope

- Fragen-Kategorien als PRO-Only (nur einzelne Fragen)
- Unterschiedliche Gewichtung für PRO-Fragen

## Testing Checklist

- [ ] Toggle erscheint im Admin
- [ ] FREE-User sieht PRO-Only Fragen NICHT
- [ ] PRO-User sieht alle Fragen
- [ ] API filtert korrekt
- [ ] Analyse funktioniert mit PRO-Fragen

