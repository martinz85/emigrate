# Story 2.8: Claude AI Integration

Status: done

## Story

Als System,
möchte ich die User-Antworten an Claude AI senden,
damit eine personalisierte Analyse erstellt wird.

## Acceptance Criteria

1. **AC1:** Alle 28 Ratings und Pre-Analysis werden gesammelt
2. **AC2:** Die /api/analyze Route wird aufgerufen
3. **AC3:** Die Daten werden an Claude API gesendet
4. **AC4:** Der Prompt enthält alle Kriterien mit Bewertungen
5. **AC5:** Claude antwortet mit Top 3-5 Ländern und Begründungen
6. **AC6:** Die Antwort wird in Supabase gespeichert (TODO)
7. **AC7:** Eine Analysis-ID wird zurückgegeben

## Tasks / Subtasks

- [x] **Task 1: API Route Integration** (AC: 1, 2, 7)
  - [x] 1.1 Request-Format für preAnalysis + ratings
  - [x] 1.2 UUID-Generierung für analysisId
  - [x] 1.3 Response mit analysisId

- [x] **Task 2: Claude API Integration** (AC: 3, 4, 5)
  - [x] 2.1 analyzeEmigration Funktion aufrufen
  - [x] 2.2 SYSTEM_PROMPT für Auswanderungs-Berater
  - [x] 2.3 buildAnalysisPrompt mit allen Kriterien
  - [x] 2.4 JSON-Response Parsing

- [ ] **Task 3: Supabase Storage** (AC: 6) - DEFERRED
  - [ ] 3.1 analyses Tabelle erstellen
  - [ ] 3.2 Insert mit preAnalysis, ratings, results

## Dev Notes

### Implementierung

**API Route:**
- `src/app/api/analyze/route.ts` - POST Handler
- Akzeptiert `{ preAnalysis, ratings }` Format
- Generiert UUID als analysisId
- Ruft `analyzeEmigration()` auf
- Gibt analysisId + Ergebnis zurück

**Claude Integration:**
- `src/lib/claude/analyze.ts` - Claude API Wrapper
- SYSTEM_PROMPT als Auswanderungs-Berater
- buildAnalysisPrompt für User-Profil + Kriterien
- Mock-Daten falls ANTHROPIC_API_KEY fehlt

**Mock-Daten:**
- Top 5: Portugal (92%), Spanien (87%), Zypern (81%), Costa Rica (77%), Uruguay (73%)
- Strengths + Considerations für jedes Land
- Recommendation mit nextSteps

### File List

- `auswanderer-app/src/app/api/analyze/route.ts`
- `auswanderer-app/src/lib/claude/analyze.ts`

