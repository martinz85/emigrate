---
story_id: "10.8"
title: "E-Book Management (Admin)"
epic: "Epic 10 - Admin Dashboard"
status: in-progress
created: 2026-01-20
created_by: Bob (SM)
priority: critical
estimated_points: 8
depends_on: ["10.1"]
blocks: ["7.2"]
---

# Story 10.8: E-Book Management (Admin)

## User Story

Als Admin,
möchte ich E-Books im Admin-Bereich hochladen, bearbeiten und entfernen können,
damit ich das E-Book-Angebot ohne Code-Änderungen verwalten kann.

## Business Context

- **PRD Reference:** Section 5.2.2 - E-Books
- **Abhängigkeit:** Story 10.1 (Admin Auth)
- **Blockiert:** Story 7.2 (E-Book Checkout) - braucht dynamische E-Book-Daten
- **Impact:** Ermöglicht flexibles E-Book-Management ohne Developer-Eingriff

## Aktueller Zustand

E-Books sind aktuell **hardcoded** in `src/lib/ebooks.ts`:
- 4 E-Books + 1 Bundle
- Keine PDF-Dateien (nur Metadaten)
- Keine Stripe-Integration

## Zielzustand

E-Books werden **dynamisch** aus der Datenbank geladen:
- CRUD im Admin-Dashboard
- PDF-Upload zu Supabase Storage
- Stripe-Produkt wird automatisch erstellt
- Kunden können E-Books kaufen und herunterladen

## Acceptance Criteria

### AC1: E-Book Liste im Admin
**Given** ich bin als Admin eingeloggt
**When** ich zu `/admin/ebooks` navigiere
**Then** sehe ich eine Liste aller E-Books
**And** jedes E-Book zeigt: Titel, Preis, Status, Cover-Vorschau
**And** es gibt Buttons für Bearbeiten und Löschen

---

### AC2: Neues E-Book erstellen
**Given** ich bin auf der E-Book Übersicht
**When** ich auf "Neues E-Book" klicke
**Then** öffnet sich ein Formular mit folgenden Feldern:

| Feld | Typ | Pflicht | Beschreibung |
|------|-----|---------|--------------|
| Titel | Text | ✅ | z.B. "Der komplette Auswanderer-Guide" |
| Untertitel | Text | ❌ | z.B. "Ausführliche Langversion" |
| Beschreibung (kurz) | Textarea | ✅ | Für Karten-Anzeige |
| Beschreibung (lang) | Rich Text | ❌ | Für Detail-Seite |
| Preis | Number | ✅ | In Euro (z.B. 19.99) |
| Seiten | Number | ❌ | z.B. 250 |
| Lesezeit | Text | ❌ | z.B. "6-8 Stunden" |
| Kapitel | Array | ❌ | Liste der Kapitelüberschriften |
| Features | Array | ❌ | Bullet-Points für Karte |
| Farbe | Color | ✅ | Gradient-Farbe (Tailwind) |
| Emoji | Text | ✅ | z.B. 📕 |
| PDF-Datei | File | ✅ | Die eigentliche E-Book Datei |
| Cover-Bild | File | ❌ | Optional, für bessere Präsentation |
| Aktiv | Toggle | ✅ | Sichtbar für Kunden? |

---

### AC3: PDF-Upload
**Given** ich erstelle oder bearbeite ein E-Book
**When** ich eine PDF-Datei hochlade
**Then** wird die Datei in Supabase Storage (`ebooks`) gespeichert
**And** der Pfad wird in der Datenbank gespeichert
**And** die Datei ist nur für Käufer zugänglich (RLS)

**Limits:**
- Max. 50 MB pro Datei
- Nur PDF-Format erlaubt
- Automatische Umbenennung: `{ebook_id}/{version}.pdf`

---

### AC4: E-Book bearbeiten
**Given** ich klicke auf "Bearbeiten" bei einem E-Book
**When** das Formular erscheint
**Then** sind alle Felder vorausgefüllt
**And** ich kann Änderungen vornehmen
**And** bei Speichern wird das E-Book aktualisiert
**And** eine neue PDF kann die alte ersetzen

---

### AC5: E-Book löschen
**Given** ich klicke auf "Löschen" bei einem E-Book
**When** ich die Bestätigung gebe
**Then** wird das E-Book als "gelöscht" markiert (soft delete)
**And** die PDF-Datei bleibt für bestehende Käufer erhalten
**And** das E-Book ist nicht mehr für Neukäufe verfügbar

---

### AC6: Stripe-Produkt Synchronisation
**Given** ich speichere ein neues E-Book
**When** kein Stripe-Produkt existiert
**Then** wird automatisch ein Stripe-Produkt erstellt
**And** ein Preis (price_id) wird erstellt
**And** die IDs werden in der DB gespeichert

**Given** ich ändere den Preis eines E-Books
**When** ich speichere
**Then** wird ein neuer Stripe-Preis erstellt
**And** der alte Preis wird archiviert
**And** Kunden mit aktivem Kauf sind nicht betroffen

---

### AC7: Bundle-Verwaltung
**Given** ich erstelle ein E-Book
**When** ich "Ist Bundle" aktiviere
**Then** kann ich andere E-Books als Bundle-Inhalt auswählen
**And** der Bundle-Preis wird separat festgelegt
**And** Käufer erhalten Zugang zu allen enthaltenen E-Books

---

### AC8: Vorschau
**Given** ich bearbeite ein E-Book
**When** ich auf "Vorschau" klicke
**Then** sehe ich wie das E-Book auf der Landing Page aussieht
**And** die Vorschau öffnet in einem Modal oder neuen Tab

---

### AC9: Sortierung
**Given** ich bin auf der E-Book Liste
**When** ich E-Books per Drag & Drop verschiebe
**Then** wird die Reihenfolge gespeichert
**And** die Reihenfolge wird auf der Landing Page übernommen

---

## Technical Tasks

- [ ] **Task 1: Datenbank-Schema**
  - [ ] Tabelle `ebooks` erstellen
  - [ ] RLS Policies (Admin: CRUD, User: SELECT active)
  - [ ] Index für Performance

- [ ] **Task 2: Supabase Storage Bucket**
  - [ ] Bucket `ebooks` erstellen
  - [ ] RLS: Nur Käufer können Dateien lesen
  - [ ] Admin kann hochladen

- [ ] **Task 3: Admin E-Book Liste**
  - [ ] Erstelle `/app/admin/ebooks/page.tsx`
  - [ ] DataTable mit Sortierung, Filter
  - [ ] Aktionen: Edit, Delete, Preview

- [ ] **Task 4: E-Book Formular**
  - [ ] Erstelle `/app/admin/ebooks/[id]/page.tsx`
  - [ ] React Hook Form + Zod Validation
  - [ ] PDF-Upload mit react-dropzone
  - [ ] Cover-Upload optional

- [ ] **Task 5: Server Actions**
  - [ ] `createEbook()` - mit Stripe-Sync
  - [ ] `updateEbook()` - mit Preis-Update
  - [ ] `deleteEbook()` - Soft Delete
  - [ ] `reorderEbooks()` - Sortierung

- [ ] **Task 6: Stripe Integration**
  - [ ] Produkt erstellen bei neuem E-Book
  - [ ] Preis erstellen/archivieren
  - [ ] Price ID speichern

- [ ] **Task 7: Frontend umstellen**
  - [ ] `getEbooks()` aus DB statt hardcoded
  - [ ] E-Book Landing Page anpassen
  - [ ] Caching mit React Query oder SWR

- [ ] **Task 8: Migration der bestehenden E-Books**
  - [ ] Seed-Script für die 4 E-Books + Bundle
  - [ ] Stripe-Produkte manuell oder per Script erstellen

## Datenbank-Schema

```sql
-- E-Books Tabelle
CREATE TABLE ebooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT NOT NULL,
  long_description TEXT,
  price INTEGER NOT NULL, -- in cents
  pages INTEGER,
  reading_time TEXT,
  chapters JSONB DEFAULT '[]'::jsonb,
  features JSONB DEFAULT '[]'::jsonb,
  color TEXT NOT NULL DEFAULT 'from-teal-500 to-emerald-500',
  emoji TEXT NOT NULL DEFAULT '📚',
  
  -- Files
  pdf_path TEXT, -- Supabase Storage path
  cover_path TEXT, -- Optional cover image
  
  -- Stripe
  stripe_product_id TEXT,
  stripe_price_id TEXT,
  
  -- Bundle
  is_bundle BOOLEAN DEFAULT FALSE,
  bundle_items JSONB, -- Array of ebook IDs
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ -- Soft delete
);

-- RLS
ALTER TABLE ebooks ENABLE ROW LEVEL SECURITY;

-- Admins können alles
CREATE POLICY "Admins can manage ebooks"
  ON ebooks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid()
    )
  );

-- Alle können aktive E-Books sehen
CREATE POLICY "Anyone can view active ebooks"
  ON ebooks FOR SELECT
  USING (is_active = TRUE AND deleted_at IS NULL);

-- Indexes
CREATE INDEX idx_ebooks_slug ON ebooks(slug);
CREATE INDEX idx_ebooks_active ON ebooks(is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_ebooks_sort ON ebooks(sort_order);

-- Trigger für updated_at
CREATE TRIGGER update_ebooks_updated_at
  BEFORE UPDATE ON ebooks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## Supabase Storage Setup

```sql
-- Bucket für E-Book PDFs (manuell im Dashboard erstellen)
-- Name: ebooks
-- Public: false
-- Max file size: 50MB
-- Allowed MIME types: application/pdf

-- RLS für Storage
-- Pfad-Format: {ebook_id}/{filename}.pdf

-- Policy: Admins können hochladen
CREATE POLICY "Admins can upload ebooks"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'ebooks' AND
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

-- Policy: Käufer können ihre E-Books herunterladen
CREATE POLICY "Buyers can download purchased ebooks"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'ebooks' AND
    EXISTS (
      SELECT 1 FROM user_ebooks ue
      JOIN ebooks e ON e.id::text = ue.ebook_id
      WHERE ue.user_id = auth.uid()
      AND storage.filename(name) LIKE e.id::text || '%'
    )
  );
```

## Files to Create/Modify

| Datei | Aktion | Beschreibung |
|-------|--------|--------------|
| `supabase/migrations/XXX_ebooks_table.sql` | Create | DB Schema |
| `src/app/admin/ebooks/page.tsx` | Create | E-Book Liste |
| `src/app/admin/ebooks/new/page.tsx` | Create | Neues E-Book |
| `src/app/admin/ebooks/[id]/page.tsx` | Create | E-Book bearbeiten |
| `src/components/admin/EbookForm.tsx` | Create | Formular-Komponente |
| `src/components/admin/EbookTable.tsx` | Create | Tabellen-Komponente |
| `src/lib/actions/ebooks.ts` | Create | Server Actions |
| `src/lib/ebooks.ts` | Modify | DB-Laden statt hardcoded |
| `src/app/(marketing)/ebooks/page.tsx` | Modify | Dynamische E-Books |

## Dev Notes

### Stripe Produkt-Erstellung

```typescript
// Bei neuem E-Book
const product = await stripe.products.create({
  name: ebook.title,
  description: ebook.description,
  metadata: {
    ebook_id: ebook.id,
  },
})

const price = await stripe.prices.create({
  product: product.id,
  unit_amount: ebook.price,
  currency: 'eur',
})

// IDs in DB speichern
await supabase.from('ebooks').update({
  stripe_product_id: product.id,
  stripe_price_id: price.id,
}).eq('id', ebook.id)
```

### Migration der bestehenden E-Books

```typescript
// Seed-Script: scripts/seed-ebooks.ts
import { EBOOKS, EBOOK_BUNDLE } from '@/lib/ebooks'

async function seedEbooks() {
  for (const ebook of [...EBOOKS, EBOOK_BUNDLE]) {
    // 1. Insert in DB
    // 2. Create Stripe Product
    // 3. Update with Stripe IDs
  }
}
```

## Out of Scope

- E-Book Download (Story 7.3)
- E-Book Reader im Browser
- Automatische PDF-Vorschau
- Mehrsprachige E-Books
- Versioning (verschiedene Versionen eines E-Books)

## Testing Checklist

- [ ] Neues E-Book erstellen funktioniert
- [ ] PDF-Upload funktioniert (< 50MB)
- [ ] Stripe-Produkt wird erstellt
- [ ] E-Book bearbeiten funktioniert
- [ ] Preis-Änderung erstellt neuen Stripe-Preis
- [ ] E-Book löschen (Soft Delete) funktioniert
- [ ] Bundle erstellen funktioniert
- [ ] Sortierung per Drag & Drop funktioniert
- [ ] Frontend lädt E-Books aus DB
- [ ] Bestehende E-Books werden migriert

## Priorität

⚠️ **KRITISCH** - Diese Story muss vor Story 7.2 (E-Book Checkout) fertig sein!

Die aktuelle hardcoded Lösung funktioniert nicht für:
- Dynamische Preisänderungen
- PDF-Downloads
- Stripe-Integration


