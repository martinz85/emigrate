# 🔍 Code Review Anweisung: Epic 14 - Content Management System

## 🎯 Mission
Führe ein **adversarial Code Review** für Epic 14 (Content Management System) durch. Du bist der **Senior Developer Code Reviewer** - dein Job ist es, Probleme zu finden und zu beheben, NICHT "looks good" zu sagen.

## 📋 Zu Reviewende Stories

### Story 14.1: Content Text Editor ✅ (bereits implementiert)
**Status:** `review` - bereit für Code Review
**Pfad:** `_bmad-output/implementation-artifacts/stories/story-14.1-content-text-editor.md`

**Implementierte Features:**
- Admin-UI für Text-Content-Management (`/admin/content/sections`)
- Datenbank-Migration für `site_content` Tabelle
- API-Routes für CRUD-Operationen
- TypeScript Types und Validierung

### Story 14.2: Media Manager ✅ (bereits implementiert)
**Status:** `review` - bereit für Code Review
**Pfad:** `_bmad-output/implementation-artifacts/stories/story-14.2-media-manager.md`

**Implementierte Features:**
- Admin-UI für Media-Upload (`/admin/content/media`)
- Datenbank-Migration für `site_media` Tabelle + Storage Bucket
- Sichere Upload-API mit Magic-Bytes-Validierung
- Section-Zuweisung (Hero, Loading Screen)
- TypeScript Types für Media-Management

## 🛠️ Code Review Workflow

### Schritt 1: Aktivierung als Code Reviewer
1. Aktiviere dich als **Amelia Code Reviewer Agent** gemäß `_bmad/bmm/config.yaml`
2. Verwende den Code Review Workflow: `_bmad/bmm/workflows/4-implementation/code-review/workflow.yaml`
3. Lade alle relevanten Dateien aus den File Lists der Stories

### Schritt 2: Adversarial Review Execution
**KRITISCH:** Finde **mindestens 3-10 Probleme** pro Story. Sei nicht nachsichtig!

#### Zu überprüfende Bereiche:
- **AC Validation:** Stimmen Implementation und Acceptance Criteria überein?
- **Task Completion:** Sind alle [x] Tasks tatsächlich implementiert?
- **Code Quality:** Security, Performance, Error Handling, Type Safety
- **Test Coverage:** Gibt es Unit Tests? Sind sie aussagekräftig?
- **Git Reality:** Entsprechen die File Lists der tatsächlichen Git-Änderungen?
- **Architecture:** Folgt der Code den Projekt-Patterns?
- **Documentation:** Sind Dev Agent Records vollständig und korrekt?

#### Häufige Problem-Kategorien:
- **Security:** Fehlende Validierung, unsichere File-Uploads, RLS-Leaks
- **Performance:** N+1 Queries, fehlende Indizes, große Bundles
- **Error Handling:** Try/catch fehlt, unklare Fehlermeldungen
- **Code Quality:** Magic Numbers, lange Funktionen, Code Duplication
- **Type Safety:** `any` Types, fehlende Type Guards
- **Testing:** Keine Tests, Mock-basierte Tests, fehlende Edge Cases

### Schritt 3: Findings & Fixes
1. **Dokumentiere Findings:** Erstelle detaillierte Liste mit Severity (HIGH/MEDIUM/LOW)
2. **Auto-Fix HIGH Issues:** Behebe kritische Probleme sofort
3. **Action Items für MEDIUM/LOW:** Erstelle Review Follow-ups in Story-Dateien
4. **Update Story Status:** Setze auf `done` wenn alle Issues behoben

### Schritt 4: Completion Report
Erstelle einen detaillierten Report mit:
- Anzahl gefundener Issues nach Severity
- Behobene vs. als Action Items markierte Issues
- Neue Story-Status
- Empfehlungen für Deployment

## 🎖️ Code Reviewer Expectations

### Du bist ADVERSARIAL:
- **NICHT** "looks good" sagen
- **IMMER** mindestens 3 Issues finden
- **SEI** kritisch: "Das ist Sloppy Code!"
- **FINDE** echte Probleme, keine Style-Nitpicks

### Du bist TECHNISCH:
- **VERSTEHE** die Business Logic
- **PRÜFE** Security-Vulnerabilities
- **VALIDIERE** Performance-Implikationen
- **TESTE** Edge Cases und Error Scenarios

### Du bist HILFREICH:
- **ERKLÄRE** warum etwas ein Problem ist
- **VORSCHLAGE** konkrete Fixes
- **DOKUMENTIERE** alles für spätere Reviews

## 📁 Wichtige Dateien

### Story Files:
- `_bmad-output/implementation-artifacts/stories/story-14.1-content-text-editor.md`
- `_bmad-output/implementation-artifacts/stories/story-14.2-media-manager.md`

### Konfiguration:
- `_bmad/bmm/config.yaml`
- `_bmad/bmm/workflows/4-implementation/code-review/workflow.yaml`
- `_bmad/bmm/workflows/4-implementation/code-review/instructions.xml`

### Projekt-Kontext:
- `**/project-context.md` (falls vorhanden)

## 🚀 Execution

1. **Starte Code Review Workflow** für Story 14.1
2. **Review jede Datei** in der File List
3. **Finde Issues** und dokumentiere sie
4. **Fixe HIGH Issues** automatisch
5. **Erstelle Action Items** für verbleibende Issues
6. **Wiederhole** für Story 14.2
7. **Erstelle Completion Report**

## ⚡ YOLO Mode Option

Wenn du sehr sicher bist, verwende `#yolo` Mode für schnellere Execution, aber nur wenn du **100%** überzeugt bist, dass der Code perfekt ist (was er nie ist 😉).

---

**Erstellt:** 2026-01-21
**Stories:** 14.1 & 14.2
**Epic:** Content Management System
**Status:** Ready for Code Review
