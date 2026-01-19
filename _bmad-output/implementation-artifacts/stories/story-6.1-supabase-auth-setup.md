# Story 6.1: Supabase Auth Setup

## Status: ready-for-dev

## Epic
Epic 6: User Authentication (Supabase)

## User Story
Als Entwickler,
möchte ich Supabase Auth konfigurieren,
damit User sich anmelden können.

## Acceptance Criteria

### AC 1: Supabase Projekt eingerichtet
**Given** ein neues Supabase-Projekt wurde erstellt
**When** die Konfiguration abgeschlossen ist
**Then** existiert eine PostgreSQL-Datenbank
**And** Auth ist aktiviert mit Email-Provider
**And** Magic Link ist als Login-Methode konfiguriert

### AC 2: Environment Variables
**Given** das Supabase-Projekt existiert
**When** die App gestartet wird
**Then** sind folgende ENV-Vars konfiguriert:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (nur Server-seitig)

### AC 3: Supabase Client Setup
**Given** die ENV-Vars sind gesetzt
**When** die App läuft
**Then** existiert ein Client-Side Supabase Client (`lib/supabase/client.ts`)
**And** existiert ein Server-Side Supabase Client (`lib/supabase/server.ts`)
**And** beide nutzen die korrekten Environment Variables

### AC 4: Datenbank-Schema
**Given** Supabase ist eingerichtet
**When** die Migrations ausgeführt werden
**Then** existiert eine `profiles` Tabelle mit:
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro')),
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```
**And** existiert eine `analyses` Tabelle mit:
```sql
CREATE TABLE analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  session_id TEXT, -- For anonymous users
  ratings JSONB NOT NULL,
  pre_analysis JSONB,
  result JSONB,
  paid BOOLEAN DEFAULT FALSE,
  paid_at TIMESTAMPTZ,
  stripe_session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### AC 5: Row Level Security (RLS)
**Given** die Tabellen existieren
**When** RLS aktiviert ist
**Then** können User nur ihre eigenen Daten lesen/schreiben
**And** Service Role kann alle Daten lesen/schreiben (für Webhooks)

## Technical Notes

### Supabase Projekt erstellen
1. Gehe zu https://supabase.com
2. Erstelle neues Projekt "auswanderer-plattform"
3. Wähle Region: Frankfurt (eu-central-1)
4. Notiere URL und Keys

### Paket-Installation
```bash
npm install @supabase/supabase-js @supabase/ssr
```

### Client-Setup (Next.js App Router)
Nutze `@supabase/ssr` für Cookie-basierte Auth im App Router.

### RLS Policies
```sql
-- Profiles: User kann nur eigenes Profil lesen/updaten
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Analyses: User kann eigene Analysen sehen
CREATE POLICY "Users can view own analyses" ON analyses
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert analyses" ON analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
```

## Dependencies
- Supabase Account (kostenlos für Entwicklung)
- Supabase CLI (optional, für lokale Entwicklung)

## Definition of Done
- [ ] Supabase-Projekt erstellt und konfiguriert
- [ ] ENV-Vars in `.env.local` und `.env.example`
- [ ] Client-Side Supabase Client funktioniert
- [ ] Server-Side Supabase Client funktioniert
- [ ] Datenbank-Schema erstellt (profiles, analyses)
- [ ] RLS Policies aktiviert
- [ ] TypeScript-Types für Tabellen generiert

## Estimation
Story Points: 3 (Medium)

