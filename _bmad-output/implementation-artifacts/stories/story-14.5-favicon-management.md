# Story 14.5: Favicon Management

**Epic:** 14 - Content Management System  
**Status:** ready-for-dev  
**Priorität:** Medium  
**Aufwand:** 2-3h

---

## Story

Als Admin,  
möchte ich das Favicon der Website hochladen können,  
damit ich das Branding ohne Code-Änderungen anpassen kann.

---

## Acceptance Criteria

**AC1:** Datenbank-Schema für Favicon Management existiert
- Tabelle `site_favicon` mit Feldern: original_path, sizes (JSON), is_active
- RLS Policies für Admin-Zugriff

**AC2:** Admin kann Favicon in `/admin/content/favicon` hochladen
- Upload eines PNG/ICO/SVG (min. 512x512px empfohlen)
- Automatische Generierung aller benötigten Größen:
  - `favicon.ico` (16x16, 32x32)
  - `favicon-16x16.png`
  - `favicon-32x32.png`
  - `apple-touch-icon.png` (180x180)
  - `android-chrome-192x192.png`
  - `android-chrome-512x512.png`

**AC3:** Vorschau im Admin
- Anzeige aller generierten Größen
- Vorschau wie es im Browser aussieht

**AC4:** Frontend lädt aktives Favicon
- `app/layout.tsx` lädt Favicon-URLs aus DB
- Fallback auf Default-Favicon wenn nicht gesetzt

**AC5:** Nur ein aktives Favicon
- Beim Upload eines neuen Favicons wird das alte deaktiviert
- Historie bleibt erhalten (für Rollback)

---

## Tasks / Subtasks

### Task 1: Datenbank Migration (AC1)
- [ ] 1.1 Migration `040_site_favicon.sql` erstellen
- [ ] 1.2 Tabelle `site_favicon` mit allen Feldern
- [ ] 1.3 RLS Policies (Admin: All)
- [ ] 1.4 Migration auf DEV deployen

### Task 2: Storage Bucket (AC2)
- [ ] 2.1 Bucket `site-favicon` erstellen (falls nicht `site-media` reused)
- [ ] 2.2 Storage Policies (Admin Upload/Delete, Public Read)

### Task 3: Image Processing Library (AC2)
- [ ] 3.1 Install `sharp` für Image Resizing
- [ ] 3.2 Funktion `generateFaviconSizes(originalBuffer)` erstellen
- [ ] 3.3 ICO-Generierung (16x16, 32x32)
- [ ] 3.4 PNG-Generierung (alle Größen)

### Task 4: Upload API Route (AC2, AC5)
- [ ] 4.1 POST `/api/admin/content/favicon/upload` erstellen
- [ ] 4.2 File-Upload via FormData
- [ ] 4.3 Validierung: Format (PNG/ICO/SVG), Min. Größe (512x512px)
- [ ] 4.4 Image Processing mit sharp
- [ ] 4.5 Upload aller Größen zu Supabase Storage
- [ ] 4.6 DB-Eintrag mit JSON-Mapping (sizes)
- [ ] 4.7 Alte Favicons deaktivieren (is_active = false)
- [ ] 4.8 Admin-Verifikation
- [ ] 4.9 Audit Logging

### Task 5: Admin UI (AC2, AC3)
- [ ] 5.1 Route `/admin/content/favicon` erstellen
- [ ] 5.2 Komponente `FaviconUpload.tsx`
- [ ] 5.3 Drag & Drop Upload Area
- [ ] 5.4 Upload Progress
- [ ] 5.5 Vorschau aller generierten Größen
- [ ] 5.6 Browser-Vorschau (Mockup)
- [ ] 5.7 "Löschen" Button (deaktiviert Favicon)

### Task 6: Frontend Integration (AC4)
- [ ] 6.1 API Route GET `/api/content/favicon` (public)
- [ ] 6.2 `app/layout.tsx` umbauen: Favicon aus DB
- [ ] 6.3 Fallback auf Default wenn DB leer
- [ ] 6.4 Next.js Metadata API nutzen

### Task 7: TypeScript Types
- [ ] 7.1 Interface `SiteFavicon` definieren
- [ ] 7.2 Type für FaviconSizes (JSON)

---

## Technical Notes

### Datenbank-Struktur:

```sql
CREATE TABLE site_favicon (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Original File
  original_path TEXT NOT NULL, -- z.B. 'site-media/favicon_original.png'
  
  -- Generated Sizes (JSON Mapping)
  sizes JSONB NOT NULL, -- {"16x16": "path", "32x32": "path", ...}
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Audit
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  uploaded_by UUID REFERENCES admin_users(id)
);

-- Index für aktives Favicon
CREATE INDEX idx_site_favicon_active ON site_favicon(is_active) WHERE is_active = true;
```

### Sizes JSON Beispiel:

```json
{
  "favicon_ico": "site-media/favicon.ico",
  "16x16": "site-media/favicon-16x16.png",
  "32x32": "site-media/favicon-32x32.png",
  "180x180": "site-media/apple-touch-icon.png",
  "192x192": "site-media/android-chrome-192x192.png",
  "512x512": "site-media/android-chrome-512x512.png"
}
```

### Image Processing mit sharp:

```typescript
import sharp from 'sharp'

async function generateFaviconSizes(originalBuffer: Buffer) {
  const sizes = {
    '16x16': await sharp(originalBuffer).resize(16, 16).png().toBuffer(),
    '32x32': await sharp(originalBuffer).resize(32, 32).png().toBuffer(),
    '180x180': await sharp(originalBuffer).resize(180, 180).png().toBuffer(),
    '192x192': await sharp(originalBuffer).resize(192, 192).png().toBuffer(),
    '512x512': await sharp(originalBuffer).resize(512, 512).png().toBuffer(),
  }
  
  // ICO erstellen (16x16 + 32x32)
  const ico = await sharp(originalBuffer)
    .resize(32, 32)
    .toFormat('png')
    .toBuffer()
  
  sizes['favicon_ico'] = ico
  
  return sizes
}
```

### Frontend Integration (layout.tsx):

```typescript
// app/layout.tsx
import { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const favicon = await getActiveFavicon()
  
  if (!favicon) {
    // Fallback auf Default
    return {
      icons: {
        icon: '/favicon.ico',
        apple: '/apple-touch-icon.png',
      }
    }
  }
  
  return {
    icons: {
      icon: [
        { url: favicon.sizes['16x16'], sizes: '16x16', type: 'image/png' },
        { url: favicon.sizes['32x32'], sizes: '32x32', type: 'image/png' },
      ],
      apple: favicon.sizes['180x180'],
      other: [
        { rel: 'android-chrome-192x192', url: favicon.sizes['192x192'] },
        { rel: 'android-chrome-512x512', url: favicon.sizes['512x512'] },
      ]
    }
  }
}
```

### Admin UI Struktur:

```
/admin/content/favicon
  → [Upload Area]
      Drag & Drop PNG/ICO/SVG (min. 512x512px)
  
  → [Aktuelles Favicon]
      [Vorschau aller Größen]
      16x16  32x32  180x180  192x192  512x512
      
      [Browser-Vorschau]
      Mockup: Wie es im Browser-Tab aussieht
      
      [Löschen]
```

---

## Definition of Done

- [ ] Migration auf DEV deployed und getestet
- [ ] Admin kann Favicon hochladen
- [ ] Automatische Generierung aller Größen funktioniert
- [ ] Vorschau im Admin funktioniert
- [ ] Frontend lädt Favicon aus DB
- [ ] Fallback auf Default funktioniert
- [ ] TypeScript Errors: 0
- [ ] Code Review bestanden

---

## Dependencies

**Blockers:** Keine

**Blocked by:** Keine

**Related:**
- Story 14.2 (Media Manager) ähnliche Upload-Logik

---

## Dev Notes

### Wichtige Dateien:

- Migration: `auswanderer-app/supabase/migrations/040_site_favicon.sql`
- Admin Page: `auswanderer-app/src/app/admin/content/favicon/page.tsx`
- Upload API: `auswanderer-app/src/app/api/admin/content/favicon/upload/route.ts`
- Public API: `auswanderer-app/src/app/api/content/favicon/route.ts`
- Image Processing: `auswanderer-app/src/lib/favicon.ts`
- Frontend: `auswanderer-app/src/app/layout.tsx`
- Types: `auswanderer-app/src/types/favicon.ts`

### Dependencies:

```bash
npm install sharp
npm install --save-dev @types/sharp
```

### Referenz:

- Next.js Metadata API: https://nextjs.org/docs/app/api-reference/functions/generate-metadata#icons
- sharp Dokumentation: https://sharp.pixelplumbing.com/

### Testing Checklist:

1. Admin lädt PNG (512x512) hoch → Alle Größen generiert
2. Browser-Tab zeigt neues Favicon
3. Mobile: Apple Touch Icon funktioniert
4. Kein Favicon gesetzt → Default wird angezeigt
5. Neues Favicon hochladen → Altes wird deaktiviert





