# Story 14.4: Frontend Integration - CMS Content

**Epic:** 14 - Content Management System  
**Status:** ready-for-dev  
**Priorität:** High  
**Aufwand:** 3-4h

---

## Story

Als User,  
möchte ich die aktuellsten Inhalte aus dem CMS sehen,  
damit ich immer die neuesten Informationen erhalte, ohne dass die App neu deployed werden muss.

---

## Acceptance Criteria

**AC1:** Alle Frontend-Komponenten laden Content aus der Datenbank
- Header lädt Texte aus `site_content`
- Footer lädt Texte aus `site_content`
- Landing Page Sections laden Texte aus `site_content`
- LoadingScreen lädt Fun Facts und Texte aus `site_content`

**AC2:** Frontend lädt Media aus der Datenbank
- LoadingScreen zeigt zugewiesenes Medium (GIF/MP4/Bild) statt Emoji
- Hero Section zeigt zugewiesenes Medium
- Fallback auf Default-Werte wenn DB leer oder Fehler

**AC3:** Performance-Optimierung
- Content wird gecacht (ISR oder SWR)
- Keine langsamen Ladezeiten für User
- Kein Layout Shift während Content lädt

**AC4:** Fallback-Mechanismus
- Wenn DB nicht erreichbar: Zeige hardcoded Defaults
- Wenn Content leer: Zeige Placeholder
- Loading States während Content lädt

**AC5:** TypeScript Type-Safety
- Alle Content-Typen sind typisiert
- Keine `any` Types

---

## Tasks / Subtasks

### Task 1: Server-Side Content Loader (AC1, AC4)
- [ ] 1.1 Funktion `getContentBySection(section)` in `lib/content.ts`
- [ ] 1.2 Fehlerbehandlung mit Fallback auf Defaults
- [ ] 1.3 Caching-Strategie (ISR mit revalidate)
- [ ] 1.4 TypeScript Interfaces für alle Sections

### Task 2: Media Loader (AC2, AC4)
- [ ] 2.1 Funktion `getMediaBySection(section)` in `lib/media.ts`
- [ ] 2.2 URL-Generierung für Supabase Storage
- [ ] 2.3 Fehlerbehandlung mit Fallback
- [ ] 2.4 Type Guards für Media Types

### Task 3: Header Integration (AC1, AC4)
- [ ] 3.1 `Header.tsx` umbauen: Content aus DB laden
- [ ] 3.2 Server Component oder Client mit SWR
- [ ] 3.3 Fallback auf hardcoded Values
- [ ] 3.4 Loading State

### Task 4: Footer Integration (AC1, AC4)
- [ ] 4.1 `Footer.tsx` umbauen: Content aus DB laden
- [ ] 4.2 Fallback auf hardcoded Values
- [ ] 4.3 Loading State

### Task 5: Landing Page Sections Integration (AC1, AC4)
- [ ] 5.1 `HeroSection.tsx` umbauen + Media
- [ ] 5.2 `HowItWorks.tsx` umbauen
- [ ] 5.3 `FounderStory.tsx` umbauen
- [ ] 5.4 `FAQSection.tsx` umbauen (JSON parsing)
- [ ] 5.5 Fallback auf hardcoded Values
- [ ] 5.6 Loading States

### Task 6: LoadingScreen Integration (AC1, AC2, AC4)
- [ ] 6.1 `LoadingScreen.tsx` umbauen: Fun Facts aus DB
- [ ] 6.2 Media (GIF/MP4/Bild) aus DB laden
- [ ] 6.3 Video-Rendering mit autoPlay, loop, muted
- [ ] 6.4 GIF-Rendering
- [ ] 6.5 Fallback auf Emoji wenn kein Medium
- [ ] 6.6 Loading State

### Task 7: Performance Optimierung (AC3)
- [ ] 7.1 ISR mit revalidate: 60 Sekunden
- [ ] 7.2 SWR für Client-Side Content
- [ ] 7.3 Prefetching von Media
- [ ] 7.4 Lazy Loading für Videos
- [ ] 7.5 Performance Monitoring

### Task 8: TypeScript & Validation (AC5)
- [ ] 8.1 Alle Content Types definiert
- [ ] 8.2 Runtime Validation mit Zod
- [ ] 8.3 Keine `any` Types
- [ ] 8.4 Type Guards für Content

---

## Technical Notes

### Content Loader Funktion:

```typescript
// lib/content.ts
import { createClient } from '@/lib/supabase/server'

interface SiteContent {
  section: string
  key: string
  content: string
  content_type: 'text' | 'rich_text' | 'media' | 'json'
}

interface ContentSection {
  [key: string]: string | any
}

// Default Fallbacks
const DEFAULT_CONTENT = {
  hero: {
    headline: 'Finde dein perfektes Auswanderungsland',
    subheadline: 'Unser AI analysiert...',
    cta_primary: 'Kostenlos starten',
    cta_secondary: 'So funktioniert\'s',
  },
  // ... weitere Defaults
}

export async function getContentBySection(
  section: string
): Promise<ContentSection> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('site_content')
      .select('key, content, content_type')
      .eq('section', section)
    
    if (error || !data) {
      console.error('Content load error:', error)
      return DEFAULT_CONTENT[section] || {}
    }
    
    // Transform array to object
    const content: ContentSection = {}
    data.forEach((item) => {
      if (item.content_type === 'json') {
        content[item.key] = JSON.parse(item.content)
      } else {
        content[item.key] = item.content
      }
    })
    
    return content
  } catch (err) {
    console.error('Unexpected error:', err)
    return DEFAULT_CONTENT[section] || {}
  }
}
```

### Media Loader Funktion:

```typescript
// lib/media.ts
interface SiteMedia {
  file_path: string
  file_type: 'image' | 'gif' | 'video'
  mime_type: string
  metadata?: any
}

export async function getMediaBySection(
  section: string
): Promise<SiteMedia | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('site_media')
      .select('*')
      .eq('usage_section', section)
      .eq('is_active', true)
      .single()
    
    if (error || !data) {
      return null
    }
    
    return data as SiteMedia
  } catch {
    return null
  }
}

export function getMediaUrl(filePath: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  return `${supabaseUrl}/storage/v1/object/public/site-media/${filePath}`
}
```

### HeroSection Integration:

```tsx
// components/landing/HeroSection.tsx
import { getContentBySection } from '@/lib/content'
import { getMediaBySection, getMediaUrl } from '@/lib/media'
import Image from 'next/image'

export async function HeroSection() {
  const content = await getContentBySection('hero')
  const media = await getMediaBySection('hero')
  
  return (
    <section>
      <h1>{content.headline}</h1>
      <p>{content.subheadline}</p>
      
      {media && (
        <div>
          {media.file_type === 'video' ? (
            <video 
              src={getMediaUrl(media.file_path)} 
              autoPlay 
              loop 
              muted 
              playsInline
            />
          ) : (
            <Image 
              src={getMediaUrl(media.file_path)} 
              alt="Hero"
              width={800}
              height={450}
            />
          )}
        </div>
      )}
    </section>
  )
}
```

### LoadingScreen Integration:

```tsx
// components/analysis/LoadingScreen.tsx
'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'

export function LoadingScreen() {
  const { data: content } = useSWR('/api/content/loading_screen', fetcher)
  const { data: media } = useSWR('/api/content/media/loading_screen', fetcher)
  
  const funFacts = content?.fun_facts || DEFAULT_FUN_FACTS
  const title = content?.title || 'Analysiere deine Antworten...'
  
  return (
    <div>
      {/* Animation */}
      {media?.file_type === 'video' ? (
        <video src={media.url} autoPlay loop muted />
      ) : media?.file_type === 'gif' ? (
        <img src={media.url} alt="Loading" />
      ) : (
        <span>🌍</span>
      )}
      
      <h2>{title}</h2>
      <p>{funFacts[currentFact]}</p>
    </div>
  )
}
```

### ISR Configuration:

```tsx
// app/page.tsx
export const revalidate = 60 // Revalidate every 60 seconds
```

---

## Definition of Done

- [ ] Alle Komponenten laden Content aus DB
- [ ] Fallback auf Defaults funktioniert
- [ ] Media (GIF/MP4/Bild) wird korrekt angezeigt
- [ ] Keine Performance-Verschlechterung (< 100ms)
- [ ] Loading States vorhanden
- [ ] TypeScript Errors: 0
- [ ] Keine Layout Shifts
- [ ] Testing: Content-Änderung im Admin → Frontend aktualisiert
- [ ] Code Review bestanden

---

## Dependencies

**Blockers:** Keine

**Blocked by:**
- Story 14.1 (Text Editor) muss fertig sein
- Story 14.2 (Media Manager) muss fertig sein

**Related:**
- Story 14.3 (Legal Pages) verwendet ähnliche Loader-Funktionen

---

## Dev Notes

### Wichtige Dateien:

- Content Loader: `auswanderer-app/src/lib/content.ts`
- Media Loader: `auswanderer-app/src/lib/media.ts`
- Components to update:
  - `src/components/layout/Header.tsx`
  - `src/components/layout/Footer.tsx`
  - `src/components/landing/HeroSection.tsx`
  - `src/components/landing/HowItWorks.tsx`
  - `src/components/landing/FounderStory.tsx`
  - `src/components/landing/FAQSection.tsx`
  - `src/components/analysis/LoadingScreen.tsx`
- Types: `auswanderer-app/src/types/content.ts`

### Testing Checklist:

1. Admin ändert Header-Text → Frontend zeigt neue Text nach Reload
2. Admin lädt neues Hero-Video hoch → Frontend zeigt Video
3. DB nicht erreichbar → Frontend zeigt Defaults
4. Content leer → Frontend zeigt Placeholder
5. Performance: < 100ms für Content Load

### Dependencies:

```bash
npm install swr  # für Client-Side Data Fetching
```

### Caching Strategy:

- Server Components: ISR mit `revalidate: 60`
- Client Components: SWR mit `refreshInterval: 60000`
- Media: Browser-Caching via Cache-Control Headers





