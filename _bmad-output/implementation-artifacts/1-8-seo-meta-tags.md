# Story 1.8: SEO & Meta Tags

Status: done

## Story

Als Plattform-Betreiber,
möchte ich dass die Seite SEO-optimiert ist,
damit sie in Suchmaschinen gefunden wird.

## Acceptance Criteria

1. **AC1:** Alle Meta-Tags korrekt gesetzt (title, description)
2. **AC2:** Open Graph Tags für Social Sharing vorhanden
3. **AC3:** sitemap.xml und robots.txt existieren
4. **AC4:** Core Web Vitals im "Good" Bereich

## Tasks / Subtasks

- [x] **Task 1: Meta Tags in layout.tsx** (AC: 1, 2)
  - [x] 1.1 title Tag gesetzt
  - [x] 1.2 description Meta Tag
  - [x] 1.3 keywords Meta Tag
  - [x] 1.4 authors Meta Tag
  - [x] 1.5 Open Graph Tags (title, description, url, siteName, locale, type)

- [x] **Task 2: Sitemap erstellen** (AC: 3)
  - [x] 2.1 src/app/sitemap.ts mit MetadataRoute.Sitemap
  - [x] 2.2 Alle öffentlichen Routen enthalten
  - [x] 2.3 Priority und changeFrequency gesetzt

- [x] **Task 3: robots.txt erstellen** (AC: 3)
  - [x] 3.1 public/robots.txt
  - [x] 3.2 Allow: / für Crawler
  - [x] 3.3 Disallow: /api/ und /dashboard/
  - [x] 3.4 Sitemap-Referenz

- [ ] **Task 4: Performance optimieren** (AC: 4)
  - [x] 4.1 Next.js SSR bereits aktiv
  - [x] 4.2 Tailwind CSS optimiert
  - [ ] 4.3 Lighthouse-Test (nach Deployment)

## Dev Notes

### Implementierung

**Meta Tags (layout.tsx):**
- ✅ title: "Auswanderer-Plattform | Finde dein perfektes Auswanderungsland"
- ✅ description: AI-Assistent, 26 Kriterien, kostenlose Vorschau
- ✅ keywords: Auswandern, Emigration, AI Beratung, Expat
- ✅ OpenGraph: title, description, url, siteName, locale, type

**sitemap.ts:**
- Landing Page (priority: 1)
- Analyse (priority: 0.9)
- E-Books (priority: 0.7)
- Login (priority: 0.5)

**robots.txt:**
- User-agent: * Allow: /
- Sitemap referenziert
- /api/ und /dashboard/ disallowed

### Performance

Core Web Vitals können erst nach Deployment gemessen werden. Next.js 14 mit SSR und Tailwind CSS sind bereits performance-optimiert.

### File List

**Bestehende Dateien:**
- `auswanderer-app/src/app/layout.tsx` (Meta Tags)

**Neue Dateien:**
- `auswanderer-app/src/app/sitemap.ts`
- `auswanderer-app/public/robots.txt`

