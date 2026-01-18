# Story 1.1: Projekt-Setup

Status: done

## Story

Als Entwickler,
möchte ich das Next.js Projekt mit dem definierten Starter Template initialisieren,
damit eine solide technische Basis für die Entwicklung existiert.

## Acceptance Criteria

1. **AC1:** Ein funktionierendes Next.js 14+ Projekt mit TypeScript existiert
2. **AC2:** Tailwind CSS ist konfiguriert und funktionsfähig
3. **AC3:** ESLint ist konfiguriert mit Next.js Config
4. **AC4:** shadcn/ui ist initialisiert mit Basis-Komponenten (Button, Card, Progress, Dialog, Tooltip, Badge)
5. **AC5:** Alle erforderlichen NPM-Packages sind installiert
6. **AC6:** Die Projektstruktur entspricht der Architecture-Spezifikation
7. **AC7:** Environment-Variablen Template (.env.example) ist erstellt
8. **AC8:** Das Projekt startet ohne Fehler (`npm run dev`)

## Tasks / Subtasks

- [x] **Task 1: Next.js Projekt initialisieren** (AC: 1, 2, 3)
  - [x] 1.1 `npx create-next-app@latest auswanderer-app --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"` ausführen
  - [x] 1.2 Projekt in neues Verzeichnis `auswanderer-app/` erstellen
  - [x] 1.3 Verifizieren dass TypeScript strict mode aktiv ist

- [x] **Task 2: shadcn/ui initialisieren** (AC: 4)
  - [x] 2.1 `npx shadcn@latest init` ausführen (mit Default-Einstellungen)
  - [x] 2.2 Basis-Komponenten hinzufügen: `npx shadcn@latest add button card progress dialog tooltip badge`
  - [x] 2.3 Verifizieren dass `components/ui/` Ordner erstellt wurde

- [x] **Task 3: Dependencies installieren** (AC: 5)
  - [x] 3.1 Core Dependencies installieren:
    ```bash
    npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
    npm install stripe @stripe/stripe-js
    npm install @anthropic-ai/sdk
    npm install lucide-react framer-motion
    npm install zustand
    npm install react-hook-form @hookform/resolvers zod
    ```
  - [x] 3.2 PDF Dependencies installieren:
    ```bash
    npm install @react-pdf/renderer
    ```
  - [x] 3.3 `package.json` auf korrekte Versionen prüfen

- [x] **Task 4: Projektstruktur erstellen** (AC: 6)
  - [x] 4.1 Ordnerstruktur gemäß Architecture erstellen:
    ```
    src/
    ├── app/
    │   ├── (marketing)/
    │   ├── (auth)/
    │   ├── analyse/
    │   ├── ergebnis/[id]/
    │   ├── dashboard/
    │   └── api/
    │       ├── analyze/
    │       ├── checkout/
    │       ├── webhook/
    │       └── pdf/[id]/
    ├── components/
    │   ├── ui/           (bereits von shadcn)
    │   ├── layout/
    │   ├── landing/
    │   ├── analysis/
    │   ├── results/
    │   ├── checkout/
    │   ├── dashboard/
    │   └── ebooks/
    ├── lib/
    │   ├── supabase/
    │   ├── stripe/
    │   ├── claude/
    │   ├── pdf/
    │   ├── criteria.ts
    │   └── utils.ts
    ├── hooks/
    ├── stores/
    └── types/
    ```
  - [x] 4.2 Leere `index.ts` Barrel-Export Dateien in jedem Ordner erstellen

- [x] **Task 5: Environment Setup** (AC: 7)
  - [x] 5.1 `.env.example` erstellen mit allen benötigten Variablen:
    ```env
    # Supabase
    NEXT_PUBLIC_SUPABASE_URL=
    NEXT_PUBLIC_SUPABASE_ANON_KEY=
    SUPABASE_SERVICE_ROLE_KEY=

    # Stripe
    STRIPE_SECRET_KEY=
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
    STRIPE_WEBHOOK_SECRET=

    # Claude AI
    ANTHROPIC_API_KEY=

    # App
    NEXT_PUBLIC_APP_URL=http://localhost:3000
    ```
  - [x] 5.2 `.env.local` zu `.gitignore` hinzufügen (sollte bereits sein)

- [x] **Task 6: Basis-Konfiguration anpassen** (AC: 8)
  - [x] 6.1 `tailwind.config.ts` prüfen (shadcn sollte Config bereits angepasst haben)
  - [x] 6.2 `next.config.js` prüfen (Standard ist OK für MVP)
  - [x] 6.3 `tsconfig.json` prüfen (strict mode, path aliases)
  - [x] 6.4 `npm run dev` ausführen und Startseite testen

- [x] **Task 7: Cleanup & Verification** (AC: 1-8)
  - [x] 7.1 Default Next.js Inhalte in `app/page.tsx` entfernen (Placeholder behalten)
  - [x] 7.2 Default styles in `globals.css` aufräumen (shadcn Config behalten)
  - [x] 7.3 Finale Verifikation: `npm run build` ohne Fehler

## Dev Notes

### Architecture Compliance

**Tech Stack (aus Architecture-Doc):**
- Next.js 14+ mit App Router ✅
- TypeScript Strict Mode ✅
- Tailwind CSS + shadcn/ui ✅
- Supabase für DB + Auth
- Stripe für Payments
- Claude API für AI
- Framer Motion für Animationen
- Zustand für State Management

**Naming Conventions (MUSS befolgt werden):**
- Components: PascalCase (`RatingButtons.tsx`)
- Utils: kebab-case (`pdf-generator.ts`)
- Hooks: use prefix (`useAnalysis.ts`)
- Types: PascalCase (`AnalysisResult.ts`)
- Constants: UPPER_SNAKE (`MAX_RATING`)

**Import Alias:**
- Nutze `@/` für absolute Imports (z.B. `@/components/ui/button`)

### Initialization Commands (EXAKT BEFOLGEN)

```bash
# 1. Create Next.js project
npx create-next-app@latest auswanderer-app --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# 2. Navigate to project
cd auswanderer-app

# 3. Initialize shadcn/ui
npx shadcn@latest init

# 4. Add base components
npx shadcn@latest add button card progress dialog tooltip badge

# 5. Install dependencies
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs stripe @stripe/stripe-js @anthropic-ai/sdk lucide-react framer-motion zustand react-hook-form @hookform/resolvers zod @react-pdf/renderer

# 6. Verify
npm run dev
```

### Project Structure Notes

Die Projektstruktur folgt exakt der Architecture-Spezifikation:

```
auswanderer-app/
├── src/app/                    # Next.js App Router
├── src/components/             # React Components
├── src/lib/                    # Utilities & Integrations
├── src/hooks/                  # Custom React Hooks
├── src/stores/                 # Zustand Stores
├── src/types/                  # TypeScript Types
└── public/                     # Static Assets
```

### Critical Constraints

1. **KEINE Änderungen** an der shadcn/ui Konfiguration
2. **KEINE zusätzlichen** Dependencies ohne Genehmigung
3. **EXAKT** die spezifizierten Ordnernamen verwenden
4. **TypeScript Strict Mode** muss aktiv bleiben

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Starter-Template-Evaluation]
- [Source: _bmad-output/planning-artifacts/architecture.md#Project-Structure]
- [Source: _bmad-output/planning-artifacts/architecture.md#Naming-Patterns]
- [Source: _bmad-output/planning-artifacts/epics.md#Story-1.1]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (Amelia Dev Agent)

### Debug Log References

- shadcn/ui init successful
- All dependencies installed
- Build successful (14 routes, 0 errors)

### Completion Notes List

- ✅ Bestehendes Projekt wurde erweitert (nicht neu erstellt, da bereits vorhanden)
- ✅ shadcn/ui initialisiert mit components.json
- ✅ 6 UI-Komponenten hinzugefügt (button, card, progress, dialog, tooltip, badge)
- ✅ Fehlende Dependencies installiert (framer-motion, react-hook-form, zod, lucide-react)
- ✅ Projektstruktur vervollständigt (hooks, stores, types, supabase, route groups)
- ✅ Alle API-Routes als Placeholder erstellt
- ✅ Build erfolgreich ohne Fehler

### File List

**Neue Dateien erstellt:**
- `auswanderer-app/components.json`
- `auswanderer-app/src/components/ui/button.tsx`
- `auswanderer-app/src/components/ui/card.tsx`
- `auswanderer-app/src/components/ui/progress.tsx`
- `auswanderer-app/src/components/ui/dialog.tsx`
- `auswanderer-app/src/components/ui/tooltip.tsx`
- `auswanderer-app/src/components/ui/badge.tsx`
- `auswanderer-app/src/hooks/index.ts`
- `auswanderer-app/src/stores/index.ts`
- `auswanderer-app/src/types/index.ts`
- `auswanderer-app/src/lib/supabase/client.ts`
- `auswanderer-app/src/lib/supabase/index.ts`
- `auswanderer-app/src/components/results/index.ts`
- `auswanderer-app/src/components/checkout/index.ts`
- `auswanderer-app/src/components/dashboard/index.ts`
- `auswanderer-app/src/components/ebooks/index.ts`
- `auswanderer-app/src/app/(marketing)/layout.tsx`
- `auswanderer-app/src/app/(auth)/layout.tsx`
- `auswanderer-app/src/app/(auth)/login/page.tsx`
- `auswanderer-app/src/app/ergebnis/[id]/page.tsx`
- `auswanderer-app/src/app/dashboard/page.tsx`
- `auswanderer-app/src/app/api/webhook/route.ts`
- `auswanderer-app/src/app/api/pdf/[id]/route.ts`

**Modifizierte Dateien:**
- `auswanderer-app/package.json` (neue Dependencies)
- `auswanderer-app/tailwind.config.ts` (shadcn Erweiterungen)
- `auswanderer-app/src/app/globals.css` (shadcn CSS Variables)
- `auswanderer-app/src/lib/utils.ts` (shadcn cn() Funktion)

