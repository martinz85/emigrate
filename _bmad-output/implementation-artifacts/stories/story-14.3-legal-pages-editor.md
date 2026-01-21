# Story 14.3: Legal Pages Editor

**Epic:** 14 - Content Management System  
**Status:** ready-for-dev  
**Priorität:** High  
**Aufwand:** 2-3h

---

## Story

Als Admin,  
möchte ich rechtliche Seiten (Impressum, Datenschutz, AGB, Kontakt) bearbeiten können,  
damit ich diese Inhalte ohne Code-Änderungen aktualisieren kann.

---

## Acceptance Criteria

**AC1:** Datenbank-Schema für Legal Pages existiert
- Tabelle `legal_pages` mit Feldern: slug, title, content, meta_description
- RLS Policies für Admin-Zugriff

**AC2:** Admin kann Legal Pages in `/admin/content/legal` bearbeiten
- Liste aller Legal Pages (Impressum, Datenschutz, AGB, Kontakt)
- Editor für jede Page
- Markdown-Support oder Rich-Text
- Meta Description für SEO

**AC3:** Folgende Pages sind editierbar:
- **Impressum** (`/impressum`)
- **Datenschutz** (`/datenschutz`)
- **AGB** (`/agb`)
- **Kontakt** (`/kontakt`)

**AC4:** Frontend-Routes für Legal Pages
- `/impressum` zeigt Impressum aus DB
- `/datenschutz` zeigt Datenschutz aus DB
- `/agb` zeigt AGB aus DB
- `/kontakt` zeigt Kontakt aus DB

**AC5:** SEO-Optimierung
- Meta Title und Description aus DB
- Proper HTML Structure (H1, H2, etc.)
- Breadcrumbs

**AC6:** Audit Logging für Page-Änderungen
- Wer hat welche Page wann geändert

---

## Tasks / Subtasks

### Task 1: Datenbank Migration (AC1)
- [ ] 1.1 Migration `039_legal_pages.sql` erstellen
- [ ] 1.2 Tabelle `legal_pages` mit allen Feldern
- [ ] 1.3 RLS Policies (Admin: All, Public: Read)
- [ ] 1.4 Seed Default Content (Impressum, Datenschutz, AGB, Kontakt)
- [ ] 1.5 Migration auf DEV deployen

### Task 2: Admin UI - Übersicht (AC2)
- [ ] 2.1 Route `/admin/content/legal` erstellen
- [ ] 2.2 Komponente `LegalPagesOverview.tsx`
- [ ] 2.3 Liste aller Legal Pages mit "Bearbeiten" Button
- [ ] 2.4 Card-Layout mit Vorschau der ersten 100 Zeichen

### Task 3: Admin UI - Editor (AC2)
- [ ] 3.1 Route `/admin/content/legal/[slug]` erstellen
- [ ] 3.2 Komponente `LegalPageEditor.tsx`
- [ ] 3.3 Markdown Editor (oder Textarea)
- [ ] 3.4 Live-Vorschau (optional)
- [ ] 3.5 Felder: Title, Meta Description, Content
- [ ] 3.6 Speichern-Button mit Loading State
- [ ] 3.7 Zurück zur Übersicht nach Speichern

### Task 4: API Routes (AC2, AC6)
- [ ] 4.1 GET `/api/admin/content/legal` - Liste aller Pages
- [ ] 4.2 GET `/api/admin/content/legal/[slug]` - Eine Page
- [ ] 4.3 PATCH `/api/admin/content/legal/[slug]` - Page aktualisieren
- [ ] 4.4 GET `/api/content/legal/[slug]` - Public Route für Frontend
- [ ] 4.5 Admin-Verifikation in Admin Routes
- [ ] 4.6 Audit Logging bei Änderungen

### Task 5: Frontend Pages (AC3, AC4, AC5)
- [ ] 5.1 Route `/impressum/page.tsx` erstellen
- [ ] 5.2 Route `/datenschutz/page.tsx` erstellen
- [ ] 5.3 Route `/agb/page.tsx` erstellen
- [ ] 5.4 Route `/kontakt/page.tsx` erstellen
- [ ] 5.5 Shared Layout-Komponente `LegalPageLayout.tsx`
- [ ] 5.6 Markdown Rendering (react-markdown)
- [ ] 5.7 SEO Meta-Tags aus DB
- [ ] 5.8 Breadcrumbs (Home > Impressum)

### Task 6: TypeScript Types
- [ ] 6.1 Interface `LegalPage` definieren
- [ ] 6.2 Validation Schemas mit Zod

---

## Technical Notes

### Datenbank-Struktur:

```sql
CREATE TABLE legal_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Page Info
  slug TEXT UNIQUE NOT NULL CHECK (slug IN ('impressum', 'datenschutz', 'agb', 'kontakt')),
  title TEXT NOT NULL,
  content TEXT NOT NULL, -- Markdown oder HTML
  
  -- SEO
  meta_description TEXT,
  
  -- Audit
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES admin_users(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index für schnelle Slug-Abfrage
CREATE INDEX idx_legal_pages_slug ON legal_pages(slug);
```

### Seed Default Content:

```sql
INSERT INTO legal_pages (slug, title, content, meta_description) VALUES
('impressum', 'Impressum', '# Impressum\n\nAngaben gemäß § 5 TMG...', 'Impressum der Auswanderer-Plattform'),
('datenschutz', 'Datenschutzerklärung', '# Datenschutzerklärung\n\n...', 'Datenschutzerklärung'),
('agb', 'Allgemeine Geschäftsbedingungen', '# AGB\n\n...', 'AGB'),
('kontakt', 'Kontakt', '# Kontakt\n\nE-Mail: ...', 'Kontaktinformationen');
```

### Admin UI Structure:

```
/admin/content/legal
  → [Card] Impressum
      "Angaben gemäß § 5 TMG..."
      [Bearbeiten]
  → [Card] Datenschutz
      "1. Datenschutz auf einen Blick..."
      [Bearbeiten]
  
  Click → /admin/content/legal/impressum
    → Editor mit Titel, Meta Description, Content (Markdown)
    → [Vorschau] Tab (optional)
    → [Speichern]
```

### Frontend Page Structure:

```tsx
// app/impressum/page.tsx
import { LegalPageLayout } from '@/components/legal/LegalPageLayout'

export default async function ImpressumPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/content/legal/impressum`)
  const page = await res.json()
  
  return <LegalPageLayout page={page} />
}

export async function generateMetadata() {
  // Load meta from DB
}
```

### Markdown Rendering:

```tsx
import ReactMarkdown from 'react-markdown'

<ReactMarkdown 
  className="prose prose-slate max-w-none"
  components={{
    h1: ({node, ...props}) => <h1 className="text-3xl font-bold mb-4" {...props} />,
    h2: ({node, ...props}) => <h2 className="text-2xl font-bold mb-3 mt-6" {...props} />,
    p: ({node, ...props}) => <p className="mb-4" {...props} />,
  }}
>
  {page.content}
</ReactMarkdown>
```

---

## Definition of Done

- [ ] Migration auf DEV deployed und getestet
- [ ] Admin kann alle 4 Legal Pages bearbeiten
- [ ] Frontend-Routes funktionieren (impressum, datenschutz, agb, kontakt)
- [ ] Markdown wird korrekt gerendert
- [ ] SEO Meta-Tags werden gesetzt
- [ ] Audit Logging funktioniert
- [ ] TypeScript Errors: 0
- [ ] Code Review bestanden

---

## Dependencies

**Blockers:** Keine

**Blocked by:** Keine

**Related:**
- Story 14.1 (Text Editor) ähnliches Konzept
- Story 14.6 (Cookie-Banner) verlinkt zu Datenschutz

---

## Dev Notes

### Wichtige Dateien:

- Migration: `auswanderer-app/supabase/migrations/039_legal_pages.sql`
- Admin Übersicht: `auswanderer-app/src/app/admin/content/legal/page.tsx`
- Admin Editor: `auswanderer-app/src/app/admin/content/legal/[slug]/page.tsx`
- API Routes: `auswanderer-app/src/app/api/admin/content/legal/route.ts`
- Frontend Pages:
  - `auswanderer-app/src/app/impressum/page.tsx`
  - `auswanderer-app/src/app/datenschutz/page.tsx`
  - `auswanderer-app/src/app/agb/page.tsx`
  - `auswanderer-app/src/app/kontakt/page.tsx`
- Shared Layout: `auswanderer-app/src/components/legal/LegalPageLayout.tsx`
- Types: `auswanderer-app/src/types/legal.ts`

### Dependencies:

```bash
npm install react-markdown remark-gfm
```

### Footer Links Update:

Nach Implementierung müssen Footer-Links zu den neuen Routes zeigen:
- `/impressum` (statt hardcoded)
- `/datenschutz` (statt hardcoded)
- `/agb` (statt hardcoded)
- `/kontakt` (statt hardcoded)

Diese sind bereits im Footer vorhanden, müssen aber mit Content gefüllt werden.





