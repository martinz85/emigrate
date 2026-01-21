# Epic 14: Content Management System - Übergabe an Amelia

**Erstellt:** 2026-01-21  
**Status:** Ready for Development  
**Gesamt-Aufwand:** 21-27 Stunden

---

## 📋 Übersicht

Dieses Epic implementiert ein vollständiges Content Management System (CMS) für die Auswanderer-Plattform. Martin kann danach ALLE Frontend-Texte, Medien (GIF/MP4/Bilder), rechtliche Seiten, Favicon und Cookie-Banner ohne Code-Änderungen im Admin-Bereich verwalten.

---

## 🎯 Stories

| Story | Titel | Aufwand | Priorität | Datei |
|-------|-------|---------|-----------|-------|
| 14.1 | Content Management - Text Editor | 4-5h | High | `story-14.1-content-text-editor.md` |
| 14.2 | Media Manager (GIF/MP4/Bild) | 3-4h | High | `story-14.2-media-manager.md` |
| 14.3 | Legal Pages Editor | 2-3h | High | `story-14.3-legal-pages-editor.md` |
| 14.4 | Frontend Integration | 3-4h | High | `story-14.4-frontend-integration.md` |
| 14.5 | Favicon Management | 2-3h | Medium | `story-14.5-favicon-management.md` |
| 14.6 | Cookie-Banner Management | 4-5h | High | `story-14.6-cookie-banner-management.md` |

---

## 🔄 Implementierungs-Reihenfolge

**Wichtig:** Stories MÜSSEN in dieser Reihenfolge implementiert werden:

1. **Story 14.1** (Text Editor) - Basis für alle Texte
2. **Story 14.2** (Media Manager) - Basis für Medien
3. **Story 14.3** (Legal Pages) - Unabhängig, aber vor Cookie-Banner
4. **Story 14.4** (Frontend Integration) - Nutzt 14.1 + 14.2
5. **Story 14.5** (Favicon) - Unabhängig
6. **Story 14.6** (Cookie-Banner) - Nutzt 14.3 (Link zu Datenschutz)

---

## 📦 Was wird editierbar?

### Texte (Story 14.1)
- ✅ Header (Logo, Navigation, CTA)
- ✅ Footer (Links, Copyright, Disclaimer)
- ✅ Hero Section (Headline, Subheadline, CTA-Buttons)
- ✅ How It Works (3 Schritte)
- ✅ Founder Story (Kompletter Text)
- ✅ FAQ (Alle Fragen + Antworten)
- ✅ Loading Screen (10 Fun Facts + Texte)

### Media (Story 14.2)
- ✅ GIF/MP4/Bilder hochladen
- ✅ Hero Section: Animation/Bild
- ✅ Loading Screen: Animation statt Emoji

### Legal Pages (Story 14.3)
- ✅ Impressum
- ✅ Datenschutzerklärung
- ✅ AGB
- ✅ Kontakt

### Favicon (Story 14.5)
- ✅ Favicon hochladen
- ✅ Automatische Generierung aller Größen

### Cookie-Banner (Story 14.6)
- ✅ Banner-Texte
- ✅ Cookie-Kategorien
- ✅ DSGVO-konformes Consent Management

---

## 🗄️ Datenbank-Migrationen

| Migration | Tabelle | Story |
|-----------|---------|-------|
| `037_site_content.sql` | `site_content` | 14.1 |
| `038_site_media.sql` | `site_media` | 14.2 |
| `039_legal_pages.sql` | `legal_pages` | 14.3 |
| `040_site_favicon.sql` | `site_favicon` | 14.5 |
| `041_cookie_management.sql` | `cookie_settings`, `cookie_categories` | 14.6 |

**Wichtig:** Alle Migrationen ZUERST auf DEV deployen!

---

## 🛠️ Admin-Bereich Struktur

Nach Implementierung:

```
/admin/content
  ├── /sections (Story 14.1)
  │   ├── Header
  │   ├── Footer
  │   ├── Hero Section
  │   ├── How It Works
  │   ├── Founder Story
  │   ├── FAQ
  │   └── Loading Screen
  │
  ├── /media (Story 14.2)
  │   ├── Upload GIF/MP4/Bild
  │   └── Zuweisen zu Sections
  │
  ├── /legal (Story 14.3)
  │   ├── Impressum
  │   ├── Datenschutz
  │   ├── AGB
  │   └── Kontakt
  │
  ├── /favicon (Story 14.5)
  │   └── Favicon hochladen + Vorschau
  │
  └── /cookies (Story 14.6)
      ├── Banner-Einstellungen
      └── Cookie-Kategorien
```

---

## ✅ Acceptance Criteria (Gesamt-Epic)

1. **Admin-Bereich:**
   - [ ] `/admin/content` existiert mit allen Sub-Routen
   - [ ] Admin kann alle Texte editieren
   - [ ] Admin kann Media hochladen und zuweisen
   - [ ] Admin kann Legal Pages editieren
   - [ ] Admin kann Favicon hochladen
   - [ ] Admin kann Cookie-Banner konfigurieren

2. **Frontend:**
   - [ ] Alle Komponenten laden Content aus DB
   - [ ] Fallback auf Defaults funktioniert
   - [ ] Media (GIF/MP4/Bild) wird korrekt angezeigt
   - [ ] Legal Pages sind erreichbar (impressum, datenschutz, agb, kontakt)
   - [ ] Favicon wird angezeigt
   - [ ] Cookie-Banner erscheint beim ersten Besuch

3. **Performance:**
   - [ ] Keine Performance-Verschlechterung (< 100ms)
   - [ ] Content wird gecacht (ISR/SWR)
   - [ ] Keine Layout Shifts

4. **Qualität:**
   - [ ] TypeScript Errors: 0
   - [ ] Audit Logging für alle Admin-Änderungen
   - [ ] DSGVO-konform (Cookie-Banner)
   - [ ] Alle Migrationen auf DEV getestet

---

## 📚 Wichtige Dateien & Ordner

### Migrationen
- `auswanderer-app/supabase/migrations/037_site_content.sql`
- `auswanderer-app/supabase/migrations/038_site_media.sql`
- `auswanderer-app/supabase/migrations/039_legal_pages.sql`
- `auswanderer-app/supabase/migrations/040_site_favicon.sql`
- `auswanderer-app/supabase/migrations/041_cookie_management.sql`

### Admin UI
- `auswanderer-app/src/app/admin/content/...` (alle Sub-Routen)

### API Routes
- `auswanderer-app/src/app/api/admin/content/...` (Admin APIs)
- `auswanderer-app/src/app/api/content/...` (Public APIs)

### Frontend Components
- `auswanderer-app/src/components/layout/Header.tsx` (Update)
- `auswanderer-app/src/components/layout/Footer.tsx` (Update)
- `auswanderer-app/src/components/landing/...` (Update)
- `auswanderer-app/src/components/analysis/LoadingScreen.tsx` (Update)
- `auswanderer-app/src/components/cookies/CookieBanner.tsx` (Neu)

### Helper Libraries
- `auswanderer-app/src/lib/content.ts` (Content Loader)
- `auswanderer-app/src/lib/media.ts` (Media Loader)
- `auswanderer-app/src/lib/favicon.ts` (Favicon Processing)

### Types
- `auswanderer-app/src/types/content.ts`
- `auswanderer-app/src/types/media.ts`
- `auswanderer-app/src/types/legal.ts`
- `auswanderer-app/src/types/favicon.ts`
- `auswanderer-app/src/types/cookies.ts`

---

## 🔧 Dependencies (npm install)

```bash
npm install swr          # Client-Side Data Fetching (Story 14.4)
npm install sharp        # Image Processing (Story 14.5)
npm install react-markdown remark-gfm  # Markdown Rendering (Story 14.3)
npm install --save-dev @types/sharp
```

---

## 🧪 Testing Checklist (Nach Implementierung)

### Story 14.1: Text Editor
- [ ] Admin ändert Hero Headline → Frontend zeigt neue Headline
- [ ] DB nicht erreichbar → Frontend zeigt Default-Text
- [ ] Validierung: Leeres Feld → Fehler

### Story 14.2: Media Manager
- [ ] Admin lädt MP4 hoch → Video spielt im LoadingScreen
- [ ] Admin lädt GIF hoch → GIF läuft im Hero
- [ ] Zu große Datei → Fehler

### Story 14.3: Legal Pages
- [ ] Admin editiert Impressum → `/impressum` zeigt neue Text
- [ ] Markdown wird korrekt gerendert
- [ ] SEO Meta-Tags sind gesetzt

### Story 14.4: Frontend Integration
- [ ] Alle Komponenten laden Content aus DB
- [ ] Performance: < 100ms
- [ ] Kein Layout Shift

### Story 14.5: Favicon
- [ ] Admin lädt Favicon hoch → Browser-Tab zeigt neues Icon
- [ ] Alle Größen werden generiert
- [ ] Apple Touch Icon funktioniert

### Story 14.6: Cookie-Banner
- [ ] Erster Besuch → Banner erscheint
- [ ] "Alle akzeptieren" → Analytics lädt
- [ ] "Nur notwendige" → Kein Analytics
- [ ] Einstellungen speichern → Banner verschwindet

---

## ⚠️ Wichtige Hinweise für Amelia

### DEV-First Policy
- **ALLE Migrationen ZUERST auf DEV deployen**
- Testen auf DEV
- Erst dann PROD

### TypeScript
- **Keine `as any` Casts** wenn möglich
- Alle Types definieren
- Runtime Validation mit Zod

### Performance
- ISR mit `revalidate: 60` für Server Components
- SWR für Client Components
- Bilder/Videos lazy loaden

### Sicherheit
- **Alle Admin-Routes:** Admin-Verifikation
- **File-Uploads:** Magic Bytes Validation
- **RLS Policies:** Admin: All, Public: Read

### Audit Logging
- Alle Admin-Änderungen loggen
- `logAuditEvent()` verwenden

---

## 📞 Übergabe

**@Amelia**, bitte implementiere Epic 14 in dieser Reihenfolge:

1. Story 14.1 (Text Editor)
2. Story 14.2 (Media Manager)
3. Story 14.3 (Legal Pages)
4. Story 14.4 (Frontend Integration)
5. Story 14.5 (Favicon)
6. Story 14.6 (Cookie-Banner)

Alle Story-Dateien befinden sich in:
- `_bmad-output/implementation-artifacts/stories/story-14.1-content-text-editor.md`
- `_bmad-output/implementation-artifacts/stories/story-14.2-media-manager.md`
- `_bmad-output/implementation-artifacts/stories/story-14.3-legal-pages-editor.md`
- `_bmad-output/implementation-artifacts/stories/story-14.4-frontend-integration.md`
- `_bmad-output/implementation-artifacts/stories/story-14.5-favicon-management.md`
- `_bmad-output/implementation-artifacts/stories/story-14.6-cookie-banner-management.md`

**Viel Erfolg!** 🚀





