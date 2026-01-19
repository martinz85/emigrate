---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
workflowComplete: true
status: 'complete'
completedAt: '2026-01-18'
inputDocuments: [prd.md, ux-design-specification.md, criteria-specification.md, wireframes.md]
workflowType: 'architecture'
project_name: 'Auswanderer-Plattform'
user_name: 'Martin'
date: '2026-01-18'
---

# Architecture Decision Document

_Dieses Dokument wird kollaborativ durch schrittweise Entdeckung aufgebaut. Sektionen werden hinzugefügt, während wir gemeinsam durch jede architektonische Entscheidung arbeiten._

---

## Eingangsdokumente

| Dokument | Status | Beschreibung |
|----------|--------|--------------|
| PRD | ✅ Geladen | Product Requirements Document |
| UX Design Specification | ✅ Geladen | Vollständige UX Spec (Step 1-14) |
| Criteria Specification | ✅ Geladen | 28 Kriterien + 2 Pre-Analysis |
| Wireframes | ✅ Geladen | ASCII-basierte Layouts |

---

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
- 23 identifizierte Features in 6 Kategorien
- Core: AI-gestützte 28-Kriterien-Analyse mit PDF-Output
- Monetization: Freemium-Modell mit Einmalzahlung und Subscription
- PRO Features: Dashboard, Tools, unbegrenzter Zugang

**Non-Functional Requirements:**

| NFR | Anforderung | Architektonische Implikation |
|-----|-------------|------------------------------|
| Performance | Lighthouse > 90, < 3s Load | SSR, Edge Caching, Code-Splitting |
| SEO | Core Web Vitals "Good" | Next.js SSR, Meta-Tags, Structured Data |
| Mobile | Mobile-First, Touch-optimiert | Responsive Design, Touch Targets 48px |
| Accessibility | WCAG 2.1 AA | Semantic HTML, ARIA, Kontrast 4.5:1 |
| Security | DSGVO, PCI DSS | Stripe, Cookie-Consent, Data Encryption |
| Availability | 99.5% Uptime | Vercel Edge, Error Handling |

**Scale & Complexity:**
- Primary domain: Full-Stack Web Application
- Complexity level: Medium
- Estimated architectural components: 12-15

### Technical Constraints & Dependencies

| Constraint | Technology | Rationale |
|------------|------------|-----------|
| Frontend Framework | Next.js 14+ | SSR für SEO, App Router |
| Hosting | Vercel | Zero-Config, Edge Functions |
| AI | Claude API | Qualität, Kosten |
| Payment | Stripe | Standard, Abo-Support |
| Database | Supabase | Auth inklusive, PostgreSQL |
| Styling | Tailwind CSS + shadcn/ui | Schnelle Entwicklung |

### Cross-Cutting Concerns Identified

1. **Authentication Flow** - Supabase Auth über alle geschützten Routes
2. **Error Handling** - Konsistente Error Boundaries und User Feedback
3. **Loading States** - Unified Loading Patterns (Skeleton, Spinner)
4. **State Management** - Client-Side für 28-Fragen-Flow
5. **Analytics** - Event Tracking für Conversion-Optimierung

---

## Starter Template Evaluation

### Primary Technology Domain

Full-Stack Web Application mit Next.js 14+ App Router

### Starter Options Considered

| Option | Evaluation |
|--------|------------|
| create-next-app + shadcn | ✅ Gewählt - Passt zu PRD, flexibel |
| T3 Stack | ❌ Prisma statt Supabase |
| Taxonomy | ❌ Zu viel für MVP |
| Custom | ❌ Zeitaufwändig |

### Selected Starter: create-next-app + shadcn/ui

**Rationale:**
- Offizielle, immer aktuelle Next.js Basis
- shadcn/ui passt perfekt zu UX-Anforderungen
- Keine Konflikte mit gewähltem Tech Stack (Supabase, Stripe, Claude)
- Minimale Dependencies, maximale Flexibilität

**Initialization Command:**

```bash
npx create-next-app@latest auswanderer-app --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
npx shadcn@latest init
npx shadcn@latest add button card progress dialog tooltip badge
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs stripe @stripe/stripe-js @anthropic-ai/sdk react-pdf @react-pdf/renderer lucide-react framer-motion
```

### Architectural Decisions Provided by Starter

| Bereich | Entscheidung |
|---------|--------------|
| TypeScript | Strict mode enabled |
| Styling | Tailwind CSS + CSS Variables |
| Build | Next.js mit Turbopack |
| Components | shadcn/ui (Radix primitives) |
| Routing | App Router mit Server Components |
| Linting | ESLint mit Next.js Config |
| Import Alias | `@/*` für absolute Imports |

### Project Structure

```
auswanderer-app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (marketing)/        # Landing, Pricing, etc.
│   │   ├── (auth)/             # Login, Register
│   │   ├── analyse/            # AI Analysis Flow
│   │   ├── preview/            # PDF Preview (Freemium)
│   │   ├── dashboard/          # PRO Dashboard
│   │   ├── api/                # API Routes
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── analysis/           # Rating, Progress, Questions
│   │   ├── landing/            # Hero, Features, Pricing
│   │   ├── preview/            # PDF Preview
│   │   └── layout/             # Header, Footer
│   ├── lib/
│   │   ├── supabase/           # Supabase client
│   │   ├── stripe/             # Stripe utils
│   │   ├── claude/             # Claude AI integration
│   │   ├── pdf/                # PDF generation
│   │   └── criteria.ts         # 28 Kriterien Definition
│   ├── hooks/                  # Custom React hooks
│   └── types/                  # TypeScript types
├── public/
└── .env.local                  # Environment variables
```

---

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Database: Supabase PostgreSQL ✅
- Auth: Supabase Auth mit Email + Magic Link ✅
- Payment: Stripe ✅
- AI: Claude API ✅

**Important Decisions (Shape Architecture):**
- State Management: React native + Zustand für Analysis Flow
- API Style: REST via Next.js API Routes
- Animations: Framer Motion

**Deferred Decisions (Post-MVP):**
- Caching (Redis/Upstash) - bei Bedarf
- Social Login (Google, etc.) - nach Launch
- Advanced Monitoring (Sentry) - nach Launch

### Data Architecture

| Entscheidung | Wahl | Rationale |
|--------------|------|-----------|
| **Database** | Supabase (PostgreSQL) | Auth inklusive, Realtime, RLS |
| **Caching** | Keins (MVP) | Premature Optimization vermeiden |
| **Session** | Supabase Auth Session | Standard, sicher |
| **Analyse-Daten** | JSONB Column | Flexibel für 28 Kriterien |

**Datenmodell:**

```sql
-- Users (Supabase Auth handles this)
-- Extended profile in public schema

CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  full_name TEXT,
  subscription_tier TEXT DEFAULT 'free', -- 'free' | 'pro'
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles,
  pre_analysis JSONB, -- Länder-Interesse, Wünsche
  criteria_responses JSONB, -- 28 Ratings
  results JSONB, -- AI-generierte Ergebnisse
  pdf_url TEXT,
  is_paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles,
  product_type TEXT, -- 'pdf' | 'ebook' | 'pro'
  stripe_payment_id TEXT,
  amount INTEGER, -- in cents
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Authentication & Security

| Entscheidung | Wahl | Rationale |
|--------------|------|-----------|
| **Auth Provider** | Supabase Auth | Integriert, kostenlos |
| **Auth Method** | Email + Magic Link | Kein Passwort-Handling |
| **Row Level Security** | Aktiviert | Daten-Isolation |
| **API Security** | Next.js Middleware | Standard, einfach |

**RLS Policies:**

```sql
-- Users can only see their own data
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can view own analyses"
  ON public.analyses FOR SELECT
  USING (auth.uid() = user_id);
```

### API & Communication Patterns

| Entscheidung | Wahl | Rationale |
|--------------|------|-----------|
| **API Style** | REST (Next.js API Routes) | Einfach, Standard |
| **Error Format** | HTTP Codes + JSON | Konsistent |
| **Rate Limiting** | Vercel Built-in | Zero-Config |

**API Routes:**

| Route | Method | Beschreibung |
|-------|--------|--------------|
| `/api/analyze` | POST | Claude AI Analyse starten |
| `/api/analyze/[id]` | GET | Analyse-Ergebnis abrufen |
| `/api/checkout` | POST | Stripe Checkout Session |
| `/api/webhook` | POST | Stripe Webhook Handler |
| `/api/pdf/[id]` | GET | PDF generieren/abrufen |

### Frontend Architecture

| Entscheidung | Wahl | Rationale |
|--------------|------|-----------|
| **State Management** | useState + Zustand | Leichtgewichtig |
| **Form Handling** | React Hook Form | Validation, Performance |
| **Animations** | Framer Motion | Reveal, Transitions |
| **Icons** | Lucide React | Konsistent mit shadcn |

**State Flow (28-Fragen-Analysis):**

```typescript
// Zustand Store für Analysis
interface AnalysisState {
  currentStep: number; // 0 = Pre-Analysis, 1-28 = Kriterien
  preAnalysis: {
    countriesOfInterest: string[];
    specialWishes: string;
  };
  ratings: Record<string, number>; // criterion_id -> rating (1-5)
  isLoading: boolean;
  results: AnalysisResult | null;
}
```

### Infrastructure & Deployment

| Entscheidung | Wahl | Rationale |
|--------------|------|-----------|
| **Hosting** | Vercel | Zero-Config, Edge |
| **Environment** | .env.local + Vercel | Standard |
| **Monitoring** | Vercel Analytics | Kostenlos, integriert |
| **CI/CD** | Vercel Auto-Deploy | Push = Deploy |

**Environment Variables:**

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
NEXT_PUBLIC_APP_URL=
```

### Decision Impact Analysis

**Implementation Sequence:**
1. Supabase Setup (DB Schema, RLS, Auth)
2. Next.js Projekt mit shadcn/ui
3. Landing Page + Basic Layout
4. Analysis Flow (28 Fragen UI)
5. Claude AI Integration
6. PDF Generation
7. Stripe Integration
8. PRO Dashboard

**Cross-Component Dependencies:**

```
Auth (Supabase) ─────┬──→ API Routes
                     │
Analysis Flow ───────┼──→ Claude API ──→ Results
                     │
Results ─────────────┼──→ PDF Generator
                     │
Payment (Stripe) ────┴──→ Access Control
```

---

## Implementation Patterns & Consistency Rules

### Naming Patterns

**Database (Supabase/PostgreSQL):**

| Element | Konvention | Beispiel |
|---------|------------|----------|
| Tables | snake_case, Plural | `users`, `analyses`, `purchases` |
| Columns | snake_case | `user_id`, `created_at`, `is_paid` |
| Foreign Keys | `{table}_id` | `user_id`, `analysis_id` |
| Boolean | `is_` / `has_` prefix | `is_paid`, `has_subscription` |

**API Routes (Next.js):**

| Element | Konvention | Beispiel |
|---------|------------|----------|
| Endpoints | kebab-case, Plural | `/api/analyses`, `/api/ebooks` |
| Dynamic | `[id]` Syntax | `/api/analyses/[id]` |
| Query Params | camelCase | `?userId=123&isPaid=true` |

**Code (TypeScript/React):**

| Element | Konvention | Beispiel |
|---------|------------|----------|
| Components | PascalCase | `RatingButtons`, `QuestionCard` |
| Files (Components) | PascalCase.tsx | `RatingButtons.tsx` |
| Files (Utils) | kebab-case.ts | `pdf-generator.ts` |
| Functions | camelCase | `getUserAnalysis()` |
| Variables | camelCase | `currentStep`, `isLoading` |
| Constants | UPPER_SNAKE | `MAX_RATING`, `API_TIMEOUT` |
| Types/Interfaces | PascalCase | `AnalysisResult`, `CriterionRating` |
| Hooks | use prefix | `useAnalysis()`, `useAuth()` |

### Format Patterns

**API Response - Erfolg (200):**

```json
{
  "data": {
    "id": "uuid",
    "results": {...}
  }
}
```

**API Response - Fehler (4xx/5xx):**

```json
{
  "error": {
    "code": "ANALYSIS_NOT_FOUND",
    "message": "Die Analyse wurde nicht gefunden."
  }
}
```

**JSON Naming:**
- API Response: camelCase
- Database: snake_case
- Conversion via Supabase automatisch

**Datum Format:**
- API/JSON: ISO 8601 (`"2026-01-18T14:30:00Z"`)
- UI Display: Lokalisiert (`"18. Januar 2026"`)

### Process Patterns

**Loading States:**

```typescript
type LoadingState = 'idle' | 'loading' | 'success' | 'error'
```

**Error Handling:**
- Alle API-Errors via `handleApiError()` Utility
- Console.error für Logging
- User-friendly Messages in Response

**Validation:**
- Zod Schemas für alle API-Inputs
- Client-side + Server-side Validation

### Enforcement Guidelines

**Alle AI-Agents MÜSSEN:**
1. Naming Conventions exakt befolgen
2. Barrel Exports in jedem Component-Ordner erstellen
3. API Response Format konsistent verwenden
4. Error Handling via `handleApiError` implementieren
5. TypeScript Strict Mode einhalten
6. Zod Validation für alle API-Inputs verwenden

**Anti-Patterns (NICHT erlaubt):**
- Gemischte Naming Conventions
- Inline Error Messages ohne Standard-Format
- Any-Types in TypeScript
- Unvalidierte API-Inputs

---

## Project Structure & Boundaries

### Complete Project Directory Structure

```
auswanderer-app/
├── README.md
├── package.json
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── components.json                 # shadcn/ui config
├── .env.local
├── .env.example
├── .gitignore
│
├── public/
│   ├── favicon.ico
│   ├── og-image.png
│   └── images/
│
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx                # Landing (/)
│   │   ├── (marketing)/            # /pricing, /ebooks, /ueber-mich
│   │   ├── (auth)/                 # /login, /callback, /logout
│   │   ├── analyse/                # /analyse
│   │   ├── ergebnis/[id]/          # /ergebnis/[id]
│   │   ├── dashboard/              # /dashboard (PRO)
│   │   └── api/
│   │       ├── analyze/route.ts
│   │       ├── analyses/[id]/route.ts
│   │       ├── checkout/route.ts
│   │       ├── webhook/route.ts
│   │       └── pdf/[id]/route.ts
│   │
│   ├── components/
│   │   ├── ui/                     # shadcn/ui
│   │   ├── layout/                 # Header, Footer
│   │   ├── landing/                # Hero, HowItWorks, Pricing
│   │   ├── analysis/               # RatingButtons, QuestionCard
│   │   ├── results/                # ResultTeaser, ResultReveal
│   │   ├── checkout/               # CheckoutButton
│   │   ├── dashboard/              # AnalysisList
│   │   └── ebooks/                 # EbookCard
│   │
│   ├── lib/
│   │   ├── supabase/               # client.ts, server.ts
│   │   ├── stripe/                 # checkout.ts, webhooks.ts
│   │   ├── claude/                 # analyze.ts, prompts.ts
│   │   ├── pdf/                    # generator.ts
│   │   ├── criteria.ts             # 28 Kriterien
│   │   └── utils.ts
│   │
│   ├── hooks/                      # useAnalysis, useAuth
│   ├── stores/                     # analysisStore.ts
│   ├── types/                      # analysis.ts, database.ts
│   └── middleware.ts
│
└── supabase/
    └── migrations/
```

### Architectural Boundaries

**API Layer:**

| Route | Method | Service | Beschreibung |
|-------|--------|---------|--------------|
| `/api/analyze` | POST | Claude | AI-Analyse starten |
| `/api/analyses/[id]` | GET | Supabase | Analyse abrufen |
| `/api/checkout` | POST | Stripe | Checkout Session |
| `/api/webhook` | POST | Stripe | Payment Webhook |
| `/api/pdf/[id]` | GET | PDF Gen | PDF generieren |

**Component Layer:**

```
Frontend (React)
    ↓
Zustand Store (State)
    ↓
Hooks Layer (useAnalysis, useAuth)
    ↓
API Routes
    ↓
Services (Supabase, Claude, Stripe, PDF)
```

**Data Flow:**

```
User Input → Store → API → Service → External
                ↓
          Components ← Response ←────────┘
```

### Feature → Structure Mapping

| Feature | Locations |
|---------|-----------|
| Landing | `app/page.tsx`, `components/landing/*` |
| Analysis | `app/analyse/*`, `components/analysis/*`, `stores/*` |
| Results | `app/ergebnis/*`, `components/results/*` |
| Payment | `app/api/checkout/*`, `lib/stripe/*` |
| PDF | `app/api/pdf/*`, `lib/pdf/*` |
| Auth | `app/(auth)/*`, `lib/supabase/*` |
| Dashboard | `app/dashboard/*`, `components/dashboard/*` |

### Integration Points

**External Services:**

| Service | Integration Point | Purpose | Status |
|---------|-------------------|---------|--------|
| Supabase | `lib/supabase/*` | DB, Auth, Storage | Epic 6 |
| Claude API | `lib/claude/*` | AI Analysis | ✅ MVP |
| Stripe | `lib/stripe/*` | Payments | ✅ MVP |
| Vercel | Deployment | Hosting, Edge | ✅ MVP |
| Resend/Postmark | `lib/email/*` | Transaktions-E-Mails | Epic 9 (Pre-Launch) |

**TODO (Epic 9 - Transaktions-E-Mails):**
- E-Mail-Service Setup (empfohlen: Resend - einfache API, gute DX)
- Kaufbestätigung nach erfolgreicher Zahlung
- PDF-Download-Link in E-Mail
- Integration im Stripe Webhook (`handleCheckoutCompleted`)

**TODO (Epic 10 - Admin Dashboard):**

Admin-Bereich für Plattform-Management (DSGVO-Pflicht + Business Operations)

*Datenbank-Schema (Supabase):*
```
admin_users         - Admin-Rollen (admin, super_admin)
discount_codes      - Rabattcodes und Kampagnen
newsletter_subscribers - Opt-in Newsletter-Liste
users.newsletter_opt_in - Boolean für Export-Filter
users.deleted_at    - Soft-Delete für DSGVO
```

*API-Routen:*
```
/admin              - Dashboard (geschützt)
/api/admin/users    - CRUD für User-Verwaltung
/api/admin/prices   - Preis-Management (Stripe-Sync)
/api/admin/discounts - Rabattcode-Verwaltung
/api/admin/export   - CSV/JSON Export für Newsletter-Tools
/api/admin/stats    - Analytics-Daten
```

*Integrationen:*
| Integration | Zweck | Methode |
|-------------|-------|---------|
| Stripe | Preis-Sync | API |
| Odoo/Mailchimp | Newsletter | CSV-Export oder Webhook |
| Resend | Manueller Newsletter | API |

*Technologie:*
- Middleware-basierter Auth-Check für `/admin/*`
- Supabase RLS Policies für Admin-Rolle
- Recharts oder Tremor für Dashboard-Charts

---

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
- Next.js + Supabase + Stripe + Claude = Vollständig kompatibel
- Alle Versionen sind aktuell und stabil
- Keine widersprüchlichen Entscheidungen

**Pattern Consistency:**
- Naming Conventions konsistent über alle Bereiche
- API Response Format einheitlich
- Error Handling standardisiert

**Structure Alignment:**
- Projekt-Struktur passt zu Next.js App Router
- Boundaries klar definiert
- Integration Points dokumentiert

### Requirements Coverage ✅

**Feature Coverage:** 10/10 MVP Features architektonisch unterstützt
**NFR Coverage:** 6/6 Non-Functional Requirements adressiert

### Implementation Readiness ✅

**Decision Completeness:** Alle kritischen Entscheidungen dokumentiert
**Structure Completeness:** Vollständiger Projekt-Tree definiert
**Pattern Completeness:** Naming, Structure, Process Patterns komplett

### Gap Analysis

**Kritische Gaps:** Keine
**Wichtige Gaps (Später):** Tests, Monitoring, i18n, Social Login
**Nice-to-Have:** Storybook, OpenAPI Docs

### Architecture Completeness Checklist

- [x] Project context analyzed
- [x] Scale/complexity assessed (Medium)
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped
- [x] Critical decisions documented
- [x] Technology stack specified
- [x] Integration patterns defined
- [x] Implementation patterns complete
- [x] Project structure defined
- [x] Component boundaries established

### Readiness Assessment

**Status:** ✅ READY FOR IMPLEMENTATION
**Confidence:** HIGH

### Implementation Handoff

**First Step:**
```bash
npx create-next-app@latest auswanderer-app --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

**AI Agent Guidelines:**
1. Folge Architektur-Entscheidungen exakt
2. Nutze Implementation Patterns konsistent
3. Respektiere Projekt-Struktur und Boundaries
4. Referenziere dieses Dokument bei Fragen

---

*Architecture Document erstellt mit BMAD Method*
*Datum: 2026-01-18*

