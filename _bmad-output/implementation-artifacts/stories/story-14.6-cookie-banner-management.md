# Story 14.6: Cookie-Banner & Consent Management

**Epic:** 14 - Content Management System  
**Status:** ready-for-dev  
**Priorität:** High (DSGVO-Compliance)  
**Aufwand:** 4-5h

---

## Story

Als Admin,  
möchte ich den Cookie-Banner und die Cookie-Kategorien verwalten können,  
damit ich DSGVO-konform Cookie-Consent einholen kann und Texte anpassen kann.

---

## Acceptance Criteria

**AC1:** Datenbank-Schema für Cookie Management existiert
- Tabelle `cookie_settings` (Banner-Konfiguration)
- Tabelle `cookie_categories` (Kategorien: Notwendig, Funktional, Analytics, Marketing)
- RLS Policies für Admin-Zugriff

**AC2:** Admin kann Cookie-Banner in `/admin/content/cookies` konfigurieren
- **Banner-Texte editierbar:**
  - Haupt-Text ("Wir verwenden Cookies...")
  - "Akzeptieren" Button Text
  - "Ablehnen" Button Text
  - "Einstellungen" Button Text
  - Datenschutz-Link Text
- **Design-Optionen:**
  - Position (oben/unten)
  - Stil (Bar/Modal/Corner)
  - Farben (Primary, Text)

**AC3:** Admin kann Cookie-Kategorien verwalten
- 4 Standard-Kategorien:
  - **Notwendig** (immer aktiv, nicht deaktivierbar)
  - **Funktional** (optional)
  - **Analytics** (optional, z.B. Google Analytics)
  - **Marketing** (optional, z.B. Facebook Pixel)
- Für jede Kategorie editierbar:
  - Name
  - Beschreibung
  - Zugeordnete Cookies (Array von Cookie-Namen)
  - Standard-Status (an/aus)

**AC4:** Frontend zeigt Cookie-Banner beim ersten Besuch
- Banner lädt Texte aus DB
- User kann akzeptieren/ablehnen/Einstellungen öffnen
- Consent wird in LocalStorage gespeichert
- Banner wird nicht mehr angezeigt nach Consent

**AC5:** Consent-Management im Frontend
- Nur erlaubte Cookies werden gesetzt
- Analytics-Scripts nur laden wenn akzeptiert
- Marketing-Scripts nur laden wenn akzeptiert
- Funktion `getCookieConsent()` für andere Komponenten

**AC6:** Einstellungs-Modal
- User kann Kategorien einzeln an/aus schalten
- Notwendige Cookies immer an (disabled)
- "Speichern" Button
- Link zu Datenschutzerklärung

---

## Tasks / Subtasks

### Task 1: Datenbank Migration (AC1)
- [ ] 1.1 Migration `041_cookie_management.sql` erstellen
- [ ] 1.2 Tabelle `cookie_settings` mit Feldern
- [ ] 1.3 Tabelle `cookie_categories` mit Feldern
- [ ] 1.4 RLS Policies (Admin: All, Public: Read)
- [ ] 1.5 Seed Default Content (4 Kategorien)
- [ ] 1.6 Migration auf DEV deployen

### Task 2: API Routes (AC2, AC3)
- [ ] 2.1 GET `/api/admin/content/cookies/settings` - Banner-Settings
- [ ] 2.2 PATCH `/api/admin/content/cookies/settings` - Update Settings
- [ ] 2.3 GET `/api/admin/content/cookies/categories` - Alle Kategorien
- [ ] 2.4 PATCH `/api/admin/content/cookies/categories/[id]` - Update Kategorie
- [ ] 2.5 GET `/api/content/cookies` - Public Route für Frontend
- [ ] 2.6 Admin-Verifikation
- [ ] 2.7 Audit Logging

### Task 3: Admin UI - Banner Settings (AC2)
- [ ] 3.1 Route `/admin/content/cookies` erstellen
- [ ] 3.2 Komponente `CookieBannerSettings.tsx`
- [ ] 3.3 Form: Texte editieren (5 Felder)
- [ ] 3.4 Form: Position (Radio Buttons: oben/unten)
- [ ] 3.5 Form: Stil (Radio Buttons: Bar/Modal/Corner)
- [ ] 3.6 Form: Farben (Color Picker)
- [ ] 3.7 Vorschau des Banners
- [ ] 3.8 Speichern-Button

### Task 4: Admin UI - Categories (AC3)
- [ ] 4.1 Komponente `CookieCategoryManager.tsx`
- [ ] 4.2 Liste aller Kategorien (4 Stück)
- [ ] 4.3 Edit-Form für jede Kategorie
- [ ] 4.4 Felder: Name, Beschreibung, Cookies (Tag Input)
- [ ] 4.5 Toggle: Standard aktiviert (nur für optional)
- [ ] 4.6 "Notwendig"-Kategorie nicht editierbar (nur Cookies)
- [ ] 4.7 Speichern-Button pro Kategorie

### Task 5: Frontend - Cookie Banner Component (AC4)
- [ ] 5.1 Komponente `CookieBanner.tsx` (Client)
- [ ] 5.2 Laden der Settings aus DB
- [ ] 5.3 Check: Bereits Consent gegeben?
- [ ] 5.4 Anzeige: Position, Stil aus DB
- [ ] 5.5 Buttons: Akzeptieren, Ablehnen, Einstellungen
- [ ] 5.6 LocalStorage: Consent speichern
- [ ] 5.7 Banner verstecken nach Consent

### Task 6: Frontend - Settings Modal (AC6)
- [ ] 6.1 Komponente `CookieSettingsModal.tsx`
- [ ] 6.2 Liste aller Kategorien mit Toggle
- [ ] 6.3 "Notwendig" disabled
- [ ] 6.4 Speichern-Button
- [ ] 6.5 Link zu Datenschutz
- [ ] 6.6 LocalStorage: Update Consent

### Task 7: Consent Management (AC5)
- [ ] 7.1 Hook `useCookieConsent()` erstellen
- [ ] 7.2 Funktion `getCookieConsent()` (sync)
- [ ] 7.3 Funktion `hasConsent(category)` (check)
- [ ] 7.4 Analytics: Nur laden wenn consent
- [ ] 7.5 Marketing: Nur laden wenn consent

### Task 8: Integration in Layout (AC4)
- [ ] 8.1 `app/layout.tsx` erweitern: CookieBanner einbinden
- [ ] 8.2 Analytics Script conditional laden
- [ ] 8.3 Marketing Scripts conditional laden

### Task 9: TypeScript Types
- [ ] 9.1 Interface `CookieSettings` definieren
- [ ] 9.2 Interface `CookieCategory` definieren
- [ ] 9.3 Type `ConsentStatus` definieren

---

## Technical Notes

### Datenbank-Struktur:

```sql
-- Cookie Banner Settings
CREATE TABLE cookie_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Banner Config
  banner_position TEXT DEFAULT 'bottom' CHECK (banner_position IN ('top', 'bottom')),
  banner_style TEXT DEFAULT 'bar' CHECK (banner_style IN ('bar', 'modal', 'corner')),
  
  -- Colors
  primary_color TEXT DEFAULT '#0F766E',
  text_color TEXT DEFAULT '#1E293B',
  
  -- Texts (JSONB für mehrsprachig später)
  texts JSONB NOT NULL DEFAULT '{
    "main_text": "Wir verwenden Cookies, um Ihre Erfahrung zu verbessern.",
    "accept_button": "Alle akzeptieren",
    "reject_button": "Nur notwendige",
    "settings_button": "Einstellungen",
    "privacy_link_text": "Datenschutzerklärung"
  }'::jsonb,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Audit
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES admin_users(id)
);

-- Cookie Categories
CREATE TABLE cookie_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Category Info
  key TEXT UNIQUE NOT NULL CHECK (key IN ('necessary', 'functional', 'analytics', 'marketing')),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  
  -- Behavior
  is_required BOOLEAN DEFAULT false, -- Notwendige Cookies können nicht abgelehnt werden
  is_enabled_by_default BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  
  -- Cookies in dieser Kategorie
  cookies JSONB DEFAULT '[]'::jsonb, -- ["_ga", "_gid", "_fbp", ...]
  
  -- Audit
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES admin_users(id)
);

-- Seed Categories
INSERT INTO cookie_settings (id) VALUES (gen_random_uuid()) ON CONFLICT DO NOTHING;

INSERT INTO cookie_categories (key, name, description, is_required, is_enabled_by_default, sort_order, cookies) VALUES
('necessary', 'Notwendige Cookies', 'Diese Cookies sind für die Funktion der Website erforderlich und können nicht deaktiviert werden.', true, true, 1, '["NEXT_LOCALE", "auth_token"]'::jsonb),
('functional', 'Funktionale Cookies', 'Diese Cookies ermöglichen erweiterte Funktionen und Personalisierung.', false, false, 2, '[]'::jsonb),
('analytics', 'Analyse Cookies', 'Diese Cookies helfen uns zu verstehen, wie Besucher mit der Website interagieren.', false, false, 3, '["_ga", "_gid", "_gat"]'::jsonb),
('marketing', 'Marketing Cookies', 'Diese Cookies werden verwendet, um Werbung relevanter zu machen.', false, false, 4, '["_fbp", "_gcl_au"]'::jsonb);
```

### LocalStorage Schema:

```typescript
interface CookieConsent {
  necessary: boolean // always true
  functional: boolean
  analytics: boolean
  marketing: boolean
  timestamp: string // ISO Date
  version: string // z.B. "1.0"
}

// Stored as JSON in localStorage
localStorage.setItem('cookie_consent', JSON.stringify(consent))
```

### Cookie Banner Component:

```tsx
// components/cookies/CookieBanner.tsx
'use client'

import { useState, useEffect } from 'react'

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [settings, setSettings] = useState(null)
  const [showModal, setShowModal] = useState(false)
  
  useEffect(() => {
    // Check consent
    const consent = localStorage.getItem('cookie_consent')
    if (!consent) {
      // Load settings from DB
      fetch('/api/content/cookies')
        .then(res => res.json())
        .then(data => {
          setSettings(data)
          setIsVisible(true)
        })
    }
  }, [])
  
  const handleAcceptAll = () => {
    const consent = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
      version: '1.0'
    }
    localStorage.setItem('cookie_consent', JSON.stringify(consent))
    setIsVisible(false)
    // Initialize all scripts
    initializeAnalytics()
    initializeMarketing()
  }
  
  const handleRejectAll = () => {
    const consent = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
      version: '1.0'
    }
    localStorage.setItem('cookie_consent', JSON.stringify(consent))
    setIsVisible(false)
  }
  
  const handleOpenSettings = () => {
    setShowModal(true)
  }
  
  if (!isVisible || !settings) return null
  
  const position = settings.banner_position === 'top' ? 'top-0' : 'bottom-0'
  
  return (
    <>
      <div className={`fixed ${position} left-0 right-0 z-50 bg-white shadow-lg border-t border-slate-200 p-4`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-700">
            {settings.texts.main_text}
            {' '}
            <a href="/datenschutz" className="underline">
              {settings.texts.privacy_link_text}
            </a>
          </p>
          
          <div className="flex gap-2">
            <button
              onClick={handleRejectAll}
              className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              {settings.texts.reject_button}
            </button>
            <button
              onClick={handleOpenSettings}
              className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              {settings.texts.settings_button}
            </button>
            <button
              onClick={handleAcceptAll}
              className="px-4 py-2 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600"
            >
              {settings.texts.accept_button}
            </button>
          </div>
        </div>
      </div>
      
      {showModal && (
        <CookieSettingsModal 
          settings={settings} 
          onClose={() => setShowModal(false)} 
        />
      )}
    </>
  )
}
```

### Cookie Consent Hook:

```typescript
// hooks/useCookieConsent.ts
export function useCookieConsent() {
  const [consent, setConsent] = useState<CookieConsent | null>(null)
  
  useEffect(() => {
    const stored = localStorage.getItem('cookie_consent')
    if (stored) {
      setConsent(JSON.parse(stored))
    }
  }, [])
  
  return consent
}

export function getCookieConsent(): CookieConsent | null {
  if (typeof window === 'undefined') return null
  const stored = localStorage.getItem('cookie_consent')
  return stored ? JSON.parse(stored) : null
}

export function hasConsent(category: 'necessary' | 'functional' | 'analytics' | 'marketing'): boolean {
  const consent = getCookieConsent()
  return consent?.[category] ?? false
}
```

### Analytics Integration:

```tsx
// app/layout.tsx
'use client'

import { useEffect } from 'react'
import { hasConsent } from '@/hooks/useCookieConsent'

export default function RootLayout({ children }) {
  useEffect(() => {
    // Load analytics only if consent given
    if (hasConsent('analytics')) {
      initGoogleAnalytics()
    }
    
    if (hasConsent('marketing')) {
      initFacebookPixel()
    }
  }, [])
  
  return (
    <html>
      <body>
        {children}
        <CookieBanner />
      </body>
    </html>
  )
}
```

---

## Definition of Done

- [ ] Migration auf DEV deployed und getestet
- [ ] Admin kann Banner-Texte bearbeiten
- [ ] Admin kann Kategorien verwalten
- [ ] Frontend zeigt Cookie-Banner beim ersten Besuch
- [ ] User kann akzeptieren/ablehnen/Einstellungen öffnen
- [ ] Consent wird in LocalStorage gespeichert
- [ ] Analytics/Marketing nur laden wenn Consent
- [ ] TypeScript Errors: 0
- [ ] DSGVO-konform
- [ ] Code Review bestanden

---

## Dependencies

**Blockers:** Keine

**Blocked by:**
- Story 14.3 (Legal Pages) - Datenschutz-Link muss existieren

**Related:**
- Story 14.3 (Legal Pages) - Link zu Datenschutz

---

## Dev Notes

### Wichtige Dateien:

- Migration: `auswanderer-app/supabase/migrations/041_cookie_management.sql`
- Admin Page: `auswanderer-app/src/app/admin/content/cookies/page.tsx`
- API Routes: `auswanderer-app/src/app/api/admin/content/cookies/route.ts`
- Public API: `auswanderer-app/src/app/api/content/cookies/route.ts`
- Banner Component: `auswanderer-app/src/components/cookies/CookieBanner.tsx`
- Settings Modal: `auswanderer-app/src/components/cookies/CookieSettingsModal.tsx`
- Hook: `auswanderer-app/src/hooks/useCookieConsent.ts`
- Types: `auswanderer-app/src/types/cookies.ts`

### DSGVO-Anforderungen:

1. ✅ Opt-In für nicht-notwendige Cookies
2. ✅ Klare Kategorisierung
3. ✅ Einstellungen änderbar
4. ✅ Link zu Datenschutzerklärung
5. ✅ Consent-Nachweis (LocalStorage + Timestamp)

### Testing Checklist:

1. Erster Besuch → Banner erscheint
2. "Alle akzeptieren" → Analytics lädt
3. "Nur notwendige" → Kein Analytics
4. "Einstellungen" → Modal öffnet sich
5. Einstellungen speichern → Banner verschwindet
6. Page Reload → Banner erscheint nicht mehr
7. LocalStorage löschen → Banner erscheint wieder





