# Code Review Anweisung: Epic 8 - PRO Subscription

**Für:** Review Agent  
**Erstellt:** 2026-01-21  
**Entwickler:** Amelia (Dev Agent)

---

## Aufgabe

Führe ein Code Review für Epic 8 (PRO Subscription) durch. Prüfe die unten aufgeführten Dateien auf die genannten Kriterien und erstelle ein Feedback mit folgenden Prioritäten:

| Priorität | Bedeutung |
|-----------|-----------|
| 🔴 CRITICAL | Muss vor PROD gefixt werden - Sicherheit, Datenverlust |
| 🟡 HIGH | Sollte gefixt werden - Funktionalität, Performance |
| 🟢 MEDIUM | Verbesserung empfohlen - Code-Qualität, Wartbarkeit |
| 🔵 LOW | Nice-to-have - Style, Optimierungen |

---

## Zu prüfende Dateien

### 1. Datenbank-Migrationen

| Datei | Prüfkriterien |
|-------|---------------|
| `auswanderer-app/supabase/migrations/032_subscription_billing.sql` | RLS-Policies, Column-Definition |
| `auswanderer-app/supabase/migrations/033_pro_only_questions.sql` | Index-Performance, Default-Werte |
| `auswanderer-app/supabase/migrations/034_analysis_limit.sql` | RLS-Policies, Unique Constraints, Service-Role-Policy |
| `auswanderer-app/supabase/migrations/035_roadmap.sql` | RLS-Policies, Foreign Keys, Cascade-Verhalten |
| `auswanderer-app/supabase/migrations/036_roadmap_seed.sql` | Seed-Daten-Qualität, Vollständigkeit |

**Prüfe besonders:**
- [ ] Sind alle Tabellen mit RLS geschützt?
- [ ] Sind die Policies sicher (kein Open INSERT ohne Check)?
- [ ] Sind Foreign Keys korrekt mit ON DELETE CASCADE?

---

### 2. Subscription API Routes (Story 8.2, 8.3)

| Datei | Prüfkriterien |
|-------|---------------|
| `auswanderer-app/src/app/api/subscription/checkout/route.ts` | Auth-Check, Stripe-Config-Validierung, Error-Handling |
| `auswanderer-app/src/app/api/subscription/cancel/route.ts` | Auth-Check, `cancel_at_period_end` statt Sofort-Kündigung |
| `auswanderer-app/src/app/api/subscription/resume/route.ts` | Auth-Check, Status-Validierung |
| `auswanderer-app/src/app/api/subscription/portal/route.ts` | Auth-Check, return_url-Sicherheit |

**Prüfe besonders:**
- [ ] Wird der User korrekt authentifiziert?
- [ ] Wird geprüft, ob User bereits PRO ist (Checkout)?
- [ ] Werden Stripe-Fehler korrekt gehandhabt?
- [ ] Wird `cancel_at_period_end: true` verwendet (nicht sofortige Kündigung)?

---

### 3. Webhook Handler (Story 8.2)

| Datei | Prüfkriterien |
|-------|---------------|
| `auswanderer-app/src/app/api/webhook/route.ts` | Idempotenz, Subscription-Events, Profile-Updates |

**Prüfe besonders:**
- [ ] Wird Webhook-Idempotenz korrekt implementiert (Zeilen 74-108)?
- [ ] Werden alle Subscription-Events gehandhabt (`created`, `updated`, `deleted`, `payment_failed`)?
- [ ] Wird `subscription_tier` korrekt auf 'pro' oder 'free' gesetzt?
- [ ] Wird bei Canceled-Event korrekt downgraded?
- [ ] Gibt es Race-Conditions bei gleichzeitigen Webhooks?

---

### 4. Analyse-Limit (Story 8.5)

| Datei | Prüfkriterien |
|-------|---------------|
| `auswanderer-app/src/lib/analysis-limit.ts` | Limit-Logik, Midnight-Berechnung, Edge-Cases |
| `auswanderer-app/src/app/api/analysis-limit/route.ts` | Auth-Check, Response-Format |
| `auswanderer-app/src/app/api/analyze/route.ts` | Limit-Integration, Increment-Logik |
| `auswanderer-app/src/hooks/useAnalysisLimit.ts` | Hook-Logik, Error-Handling |

**Prüfe besonders:**
- [ ] Haben FREE-User wirklich KEIN Limit (nur PRO)?
- [ ] Funktioniert `limit = 0` als "unlimited"?
- [ ] Ist die Midnight-Berechnung für Europe/Berlin korrekt (Zeilen 147-164 in `analysis-limit.ts`)?
- [ ] Wird der Counter nur für PRO-User inkrementiert?

---

### 5. Roadmap (Story 8.6)

| Datei | Prüfkriterien |
|-------|---------------|
| `auswanderer-app/src/app/api/roadmap/route.ts` | PRO-Check, Progress-Berechnung |
| `auswanderer-app/src/app/api/roadmap/checkpoint/route.ts` | PRO-Check, Upsert-Logik |
| `auswanderer-app/src/app/dashboard/roadmap/page.tsx` | PRO-Gate, Teaser für FREE |
| `auswanderer-app/src/app/dashboard/roadmap/RoadmapView.tsx` | Optimistic Updates, UI-Logik |

**Prüfe besonders:**
- [ ] Können nur PRO-User Checkpoints abhaken?
- [ ] Wird der Fortschritt korrekt berechnet (Zeilen 104-119 in `roadmap/route.ts`)?
- [ ] Sehen FREE-User einen Teaser (nicht die volle Roadmap)?
- [ ] Werden `as any` Casts verwendet und warum?

---

### 6. PRO-Only Fragen (Story 8.4)

| Datei | Prüfkriterien |
|-------|---------------|
| `auswanderer-app/src/app/api/questions/route.ts` | PRO-Filter-Logik |
| `auswanderer-app/src/app/admin/questions/QuestionForm.tsx` | PRO-Toggle-UI |
| `auswanderer-app/src/app/admin/questions/QuestionTable.tsx` | PRO-Badge, Filter |
| `auswanderer-app/src/types/questions.ts` | Type-Definition für `is_pro_only` |

**Prüfe besonders:**
- [ ] Filtert die API korrekt PRO-Only Fragen für FREE-User (Zeile 48-49)?
- [ ] Ist die Query-Logik `or('is_pro_only.is.null,is_pro_only.eq.false')` korrekt?
- [ ] Zeigt das Admin-UI den PRO-Badge korrekt an?

---

### 7. Frontend Components

| Datei | Prüfkriterien |
|-------|---------------|
| `auswanderer-app/src/components/pricing/SubscriptionCheckoutButton.tsx` | Loading-States, Error-Handling |
| `auswanderer-app/src/components/pricing/PlanComparison.tsx` | PRO-Status-Check |
| `auswanderer-app/src/components/subscription/SubscriptionStatus.tsx` | Status-Anzeige |
| `auswanderer-app/src/components/subscription/CancelModal.tsx` | Confirm-Dialog, API-Call |
| `auswanderer-app/src/app/dashboard/subscription/SubscriptionManager.tsx` | Action-Buttons, Portal-Link |
| `auswanderer-app/src/app/subscription/success/page.tsx` | Success-Redirect |

**Prüfe besonders:**
- [ ] Haben alle Buttons Loading-States?
- [ ] Werden Errors user-friendly angezeigt (Deutsch)?
- [ ] Sind Redirects sicher (kein Open Redirect)?

---

## Bekannte Limitierungen (KEIN Bug)

Diese Punkte sind bekannt und akzeptiert:

1. **TypeScript `as any` Casts**: Neue Tabellen (`roadmap_*`, `user_analysis_counts`, `app_settings`) sind nicht in generierten Supabase-Types → wird nach Type-Regeneration gefixt
2. **Timezone vereinfacht**: Midnight-Berechnung ohne `date-fns-tz` - funktioniert für Europe/Berlin, aber nicht 100% DST-sicher
3. **Keine E-Mails bei Kündigung**: TODO im Code - für MVP nicht kritisch
4. **Kein Roadmap Admin-UI**: Checkpoints nur via DB verwaltbar

---

## Acceptance Criteria Check

Prüfe ob folgende ACs erfüllt sind:

### Story 8.2: Subscription Checkout
- [ ] PRO Button auf Pricing Seite funktioniert
- [ ] Stripe Session hat `mode='subscription'`
- [ ] Auth-Gate leitet zu Login weiter
- [ ] Webhook setzt `subscription_tier='pro'`
- [ ] Monthly/Yearly Auswahl funktioniert

### Story 8.3: Subscription Management
- [ ] Abo-Übersicht zeigt Status, Preis, Datum
- [ ] Kündigung zum Periodenende möglich
- [ ] Kündigung widerrufen funktioniert
- [ ] Stripe Portal öffnet sich

### Story 8.4: PRO-Only Fragen
- [ ] Admin-Toggle "PRO-Only" im Fragen-Builder
- [ ] FREE-User überspringt PRO-Only Fragen
- [ ] PRO-User sieht alle Fragen

### Story 8.5: Analyse-Limit
- [ ] Admin-Setting "Analysen pro Tag (PRO)" sichtbar
- [ ] Limit wird durchgesetzt (429 bei Überschreitung)
- [ ] FREE-User hat KEIN Limit
- [ ] Reset um Mitternacht

### Story 8.6: Fahrplan mit Checkpoints
- [ ] PRO-User sieht Fahrplan-Dashboard
- [ ] Checkpoints abhaken funktioniert
- [ ] Fortschrittsanzeige korrekt (%)
- [ ] FREE-User sieht Teaser

---

## Output-Format

Erstelle dein Review im folgenden Format:

```markdown
# Code Review: Epic 8 - PRO Subscription

## 🔴 CRITICAL (X Issues)

### Issue 1: [Titel]
**Datei:** `pfad/zur/datei.ts` (Zeile X-Y)
**Problem:** [Beschreibung]
**Fix:** [Vorschlag]

## 🟡 HIGH (X Issues)
...

## 🟢 MEDIUM (X Issues)
...

## 🔵 LOW (X Issues)
...

## ✅ Stärken
- [Was gut gemacht wurde]

## 📋 Zusammenfassung
**Status:** [ ] Approved / [ ] Changes Requested
**Gesamtbewertung:** [A-F]
```

---

## Story-Referenzen

- `_bmad-output/implementation-artifacts/stories/story-8.2-subscription-checkout.md`
- `_bmad-output/implementation-artifacts/stories/story-8.3-subscription-management.md`
- `_bmad-output/implementation-artifacts/stories/story-8.4-pro-only-questions.md`
- `_bmad-output/implementation-artifacts/stories/story-8.5-analysis-limit.md`
- `_bmad-output/implementation-artifacts/stories/story-8.6-roadmap-checkpoints.md`
