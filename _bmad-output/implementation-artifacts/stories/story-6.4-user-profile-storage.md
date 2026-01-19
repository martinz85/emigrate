# Story 6.4: User Profile Storage

## Status: ready-for-dev

## Epic
Epic 6: User Authentication (Supabase)

## User Story
Als System,
möchte ich User-Daten speichern,
damit Analysen zugeordnet werden können.

## Acceptance Criteria

### AC 1: Automatische Profil-Erstellung
**Given** ein User loggt sich zum ersten Mal ein
**When** der Auth-Callback verarbeitet wird
**Then** wird ein Profil in der `profiles` Tabelle erstellt
**And** `email` wird aus Auth-Daten übernommen
**And** `subscription_tier` ist "free"

### AC 2: Analyse mit User verknüpfen
**Given** ein eingeloggter User startet eine Analyse
**When** die Analyse gespeichert wird
**Then** wird sie mit der `user_id` verknüpft
**And** der User kann sie später wiederfinden

### AC 3: Anonyme Analyse upgraden
**Given** ein User hat eine Analyse ohne Login erstellt
**When** er sich danach einloggt/registriert
**Then** kann die Analyse seinem Account zugeordnet werden
**And** dies geschieht via `session_id` Matching

### AC 4: User Dashboard zeigt Analysen
**Given** ein eingeloggter User ist auf `/dashboard`
**When** die Seite geladen wird
**Then** sieht er alle seine vergangenen Analysen
**And** jede zeigt: Datum, Top-Land (falls bezahlt), Status

### AC 5: Profil-Update möglich
**Given** ein eingeloggter User
**When** er seine Daten aktualisieren will (z.B. Name)
**Then** kann er sein Profil bearbeiten
**And** Änderungen werden in Supabase gespeichert

## Technical Notes

### Profil-Erstellung (Supabase Trigger)
```sql
-- Automatisch Profil erstellen bei User-Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Analyse speichern (API Route)
```typescript
// /api/analyze/route.ts - Erweitert
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Analyse erstellen
  const analysisData = {
    user_id: user?.id || null,
    session_id: user ? null : request.cookies.get('session_id')?.value,
    ratings: body.ratings,
    pre_analysis: body.preAnalysis,
    result: analysisResult,
    paid: false,
  }
  
  const { data: analysis, error } = await supabase
    .from('analyses')
    .insert(analysisData)
    .select()
    .single()
  
  // Return analysis ID
  return NextResponse.json({ analysisId: analysis.id })
}
```

### Dashboard Query
```typescript
// Alle Analysen eines Users laden
const { data: analyses } = await supabase
  .from('analyses')
  .select('id, created_at, result, paid')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false })
```

### Session ID für anonyme User
```typescript
// Generiere Session ID für nicht-eingeloggte User
const sessionId = crypto.randomUUID()
// Speichere in Cookie für späteres Matching
```

## Dashboard Design

```
┌─────────────────────────────────────────────┐
│ [Header]                         [Logout]   │
├─────────────────────────────────────────────┤
│                                             │
│  👤 Hallo, martin@example.com               │
│  ──────────────────────────────             │
│                                             │
│  📊 Deine Analysen                          │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │ 📅 18.01.2026                       │    │
│  │ 🇵🇹 Portugal (92% Match)            │    │
│  │ ✅ Bezahlt                          │    │
│  │ [Ergebnis ansehen] [PDF Download]  │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │ 📅 15.01.2026                       │    │
│  │ 🔒 Land versteckt                   │    │
│  │ ⏳ Nicht bezahlt                    │    │
│  │ [Freischalten]                     │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ──────────────────────────────             │
│  [+ Neue Analyse starten]                   │
│                                             │
├─────────────────────────────────────────────┤
│ [Footer]                                    │
└─────────────────────────────────────────────┘
```

## Dependencies
- Story 6.1: Supabase Auth Setup
- Story 6.2: Login Page
- Story 6.3: Auth Middleware

## Definition of Done
- [ ] Profil wird automatisch bei Signup erstellt (Trigger)
- [ ] Analyse-API speichert `user_id` wenn eingeloggt
- [ ] Session ID für anonyme User generiert
- [ ] Dashboard zeigt User-Analysen
- [ ] Analyse-Status (bezahlt/nicht bezahlt) sichtbar
- [ ] Links zu Ergebnis/Freischalten funktionieren
- [ ] Logout-Funktion implementiert

## Estimation
Story Points: 5 (Large)

