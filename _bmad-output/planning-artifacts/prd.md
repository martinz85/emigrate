---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-03-problem', 'step-04-goals', 'step-05-users', 'step-06-features', 'step-07-ux', 'step-08-technical', 'step-09-success', 'step-10-risks', 'step-11-complete']
inputDocuments: ['brainstorming-session-2026-01-17']
workflowType: 'prd'
projectType: 'greenfield'
---

# Product Requirements Document - Auswanderer-Plattform

**Author:** Martin
**Date:** 2026-01-17
**Version:** 1.0

---

## 1. Executive Summary

### 1.1 Produktvision

Die **Auswanderer-Plattform** ist eine SEO-optimierte, mobile-faehige Web-Applikation, die Menschen bei ihrer Auswanderungsentscheidung mit einem AI-gestuetzten Assistenten unterstuetzt. Der AI analysiert 26 personalisierte Kriterien und generiert eine massgeschneiderte PDF-Analyse fuer das optimale Zielland.

### 1.2 Gruender-Story

Martin - der Gruender - ist selbst zweimal ausgewandert: Als 3-Jaehriger von Polen nach Deutschland, und spaeter mit seiner Familie (2 Kinder, 3 und 5 Jahre alt) von Deutschland nach Suedschweden. Er kennt alle Prozesse aus eigener Erfahrung: Administration, Finanzen, Jobsuche, und die Wichtigkeit einer Social Community. Seine Mission: Dieses Wissen skalieren und anderen helfen, ihre Auswanderungsziele zu erreichen.

### 1.3 Markt-Timing

- Steigende Auswanderungszahlen aus Deutschland (~270.000/Jahr)
- Geopolitische Unsicherheit (Ukraine-Krieg, EU-Spannungen)
- Remote Work Boom ermoeglicht ortsunabhaengiges Arbeiten
- Wachsender Digital Nomad Trend

---

## 2. Problem Statement

### 2.1 Kernprobleme der Zielgruppe

| Problem | Beschreibung | Auswirkung |
|---------|--------------|------------|
| **Ueberforderung** | Zu viele Faktoren zu beruecksichtigen | Entscheidungsparalyse |
| **Fragmentierte Informationen** | Daten verstreut ueber viele Quellen | Zeitverschwendung, Fehlinformationen |
| **Keine Personalisierung** | Generische "Top 10 Laender" Listen | Falsche Entscheidungen |
| **Komplexe Buerokratie** | Visa, Steuern, Sozialversicherung | Angst und Unsicherheit |
| **Emotionale Isolation** | "Keiner versteht meinen Wunsch" | Zoegern und Aufschieben |

### 2.2 Bestehende Loesungen und deren Maengel

| Loesung | Maengel |
|---------|---------|
| Google-Suche | Ueberwaeltigend, nicht personalisiert |
| Auswanderer-Foren | Anekdotisch, veraltet, nicht strukturiert |
| Persoenliche Berater | Teuer (100-300 EUR/Stunde), begrenzte Verfuegbarkeit |
| Nomad List | Fokussiert auf Digital Nomads, keine tiefe Analyse |
| InterNations | Community-fokussiert, keine Entscheidungshilfe |

---

## 3. Goals & Success Metrics

### 3.1 Geschaeftsziele

| Ziel | Metrik | Zeitrahmen |
|------|--------|------------|
| **Launch MVP** | Funktionierendes Produkt live | 12 Wochen |
| **Erste zahlende Kunden** | 100 PDF-Verkaeufe ODER 50 PRO-Abos | 3 Monate nach Launch |
| **Revenue-Ziel Jahr 1** | 50.000 EUR ARR | 12 Monate |
| **PRO-Abonnenten** | 1.000 aktive Abos | 12 Monate |

### 3.2 Produkt-Ziele

| Ziel | Metrik | Target |
|------|--------|--------|
| **Engagement** | Durchschnittliche Session-Dauer | > 5 Minuten |
| **Conversion Free-to-Paid** | % der Free-User die kaufen | > 5% |
| **Retention PRO** | Monatliche Churn-Rate | < 10% |
| **NPS Score** | Net Promoter Score | > 40 |

### 3.3 Technische Ziele

| Ziel | Metrik | Target |
|------|--------|--------|
| **Performance** | Lighthouse Score | > 90 |
| **SEO** | Core Web Vitals | Alle "Good" |
| **Uptime** | Verfuegbarkeit | > 99.5% |
| **Mobile** | Mobile-Friendly Test | Pass |

---

## 4. User Personas

### 4.1 Primaere Persona: "Der Ueberlegte Planer"

| Attribut | Beschreibung |
|----------|--------------|
| **Name** | Thomas, 42 |
| **Situation** | IT-Projektleiter, verheiratet, 2 Kinder |
| **Motivation** | Bessere Lebensqualitaet, mehr Natur, weniger Stress |
| **Schmerzpunkte** | Angst vor falscher Entscheidung, Sorge um Kinder-Bildung |
| **Verhalten** | Recherchiert gruendlich, braucht Daten und Fakten |
| **Zahlungsbereitschaft** | Hoch - investiert in Sicherheit |

### 4.2 Sekundaere Persona: "Der Schnell-Entscheider"

| Attribut | Beschreibung |
|----------|--------------|
| **Name** | Lisa, 28 |
| **Situation** | Freelance Designerin, single, ortsunabhaengig |
| **Motivation** | Abenteuer, niedrigere Lebenskosten, besseres Klima |
| **Schmerzpunkte** | Informations-Overload, will schnelle Antworten |
| **Verhalten** | Impulsiver, will sofort Ergebnisse |
| **Zahlungsbereitschaft** | Mittel - preissensitiv |

### 4.3 Tertiaere Persona: "Der Krisen-Fluechter"

| Attribut | Beschreibung |
|----------|--------------|
| **Name** | Michael, 55 |
| **Situation** | Unternehmer, besorgt ueber Geopolitik |
| **Motivation** | Sicherheit, Plan B, Vermoegensschutz |
| **Schmerzpunkte** | Dringlichkeit, braucht schnelle Loesung |
| **Verhalten** | Bereit viel zu zahlen fuer Sicherheit |
| **Zahlungsbereitschaft** | Sehr hoch |

---

## 5. Features & Requirements

### 5.1 MVP Features (Launch)

#### 5.1.1 AI-Assistent mit 26-Kriterien-Analyse

**Beschreibung:** Kernstueck der Plattform. Interaktiver AI-Chat der den Nutzer durch 26 personalisierte Kriterien fuehrt und eine massgeschneiderte Laender-Empfehlung generiert.

**Die 26 Kriterien in 9 Kategorien:**

| Kategorie | # | Kriterien |
|-----------|---|-----------|
| **Finanziell** | 4 | Lebenshaltungskosten, Einkommensquelle-Kompatibilitaet, Steuer-Situation, Vermoegens-Transfer |
| **Praktisch** | 6 | Visa-Machbarkeit, Sprachbarriere, Gesundheits-/Sozialsystem, Buerokratie-Level, Rueckkehr-Option, Aufenthalt→Staatsbuergerschaft |
| **Lifestyle** | 4 | Klima-Praeferenz, Kultur-Kompatibilitaet, Expat-Community, Naturzugang |
| **Sicherheit** | 2 | Kriminalitaet, Geopolitik/Kriegssicherheit |
| **Persoenlich** | 5 | Familien-Situation, Entfernung zur Heimat, Internet-Qualitaet, Dringlichkeit, Zeitzone |
| **Spezial** | 1 | Haustier-Freundlichkeit |
| **Sozial** | 1 | Social Community (Religion/Vereine) |
| **Karriere** | 1 | Arbeitsmarkt/Selbstaendigkeit |
| **Familie+** | 2 | Kinder/Bildung, Lebensqualitaet/Lebenserwartung |

**Akzeptanzkriterien:**
- [ ] Nutzer kann alle 26 Kriterien gewichten (1-5 Skala)
- [ ] AI stellt kontextbezogene Folgefragen
- [ ] Analyse dauert max. 10-15 Minuten
- [ ] Ergebnis zeigt Top 3-5 Laender mit Begruendung

#### 5.1.2 PDF-Generierung

**Beschreibung:** Automatische Erstellung eines personalisierten PDF-Reports basierend auf der AI-Analyse.

**Akzeptanzkriterien:**
- [ ] PDF enthaelt alle 26 Kriterien-Bewertungen
- [ ] Personalisierte Laender-Empfehlungen mit Begruendung
- [ ] Professionelles, druckfaehiges Design
- [ ] Generierung in < 30 Sekunden

#### 5.1.3 Freemium-Preview (2 Seiten)

**Beschreibung:** Kostenlose Vorschau der ersten 2 Seiten der PDF, um den Wert zu demonstrieren.

**Akzeptanzkriterien:**
- [ ] Erste 2 Seiten vollstaendig sichtbar
- [ ] Restliche Seiten mit Blur/Wasserzeichen
- [ ] Klarer CTA zum Kauf
- [ ] Kein Account notwendig fuer Preview

#### 5.1.4 Payment-Integration (Stripe)

**Beschreibung:** Sichere Zahlungsabwicklung fuer PDF-Kaeufe und PRO-Abonnements.

**Akzeptanzkriterien:**
- [ ] Einmalzahlung fuer PDF (29-49 EUR)
- [ ] Subscription fuer PRO (14,99 EUR/Monat)
- [ ] Unterstuetzte Methoden: Kreditkarte, SEPA, PayPal
- [ ] Automatische Rechnungsstellung
- [ ] Stornierung/Kuendigung Self-Service

#### 5.1.5 Transaktions-E-Mails (Pre-Launch Required)

**Beschreibung:** Automatische E-Mail-Benachrichtigungen nach Kauf.

**Akzeptanzkriterien:**
- [ ] Kaufbestaetigung per E-Mail nach erfolgreicher Zahlung
- [ ] E-Mail enthaelt: Analyse-Link, PDF-Download-Link, Kaufnachweis
- [ ] DSGVO-konform (Transaktions-Mails benoetigen kein Opt-in)
- [ ] Service: Resend oder Postmark

**Technische Notizen:**
- Integration im Stripe Webhook (`handleCheckoutCompleted`)
- Abhaengigkeit: Epic 6 (Supabase) fuer User-Daten
- Siehe: Epic 9 in epics.md, launch-checklist.md

#### 5.1.6 Mobile-Responsive Design

**Beschreibung:** Vollstaendig nutzbar auf allen Geraeten.

**Akzeptanzkriterien:**
- [ ] Responsive Breakpoints: Mobile, Tablet, Desktop
- [ ] Touch-optimierte Interaktionen
- [ ] Google Mobile-Friendly Test bestanden
- [ ] Keine horizontalen Scrollbars

#### 5.1.7 SEO-Grundoptimierung

**Beschreibung:** Technische SEO-Basis fuer organisches Wachstum.

**Akzeptanzkriterien:**
- [ ] Server-Side Rendering (SSR) fuer alle Seiten
- [ ] Meta-Tags, Open Graph, strukturierte Daten
- [ ] Sitemap.xml und robots.txt
- [ ] Core Web Vitals im "Good" Bereich
- [ ] Semantisches HTML

#### 5.1.8 Landing Page mit Gruender-Story

**Beschreibung:** Ueberzeugende Landing Page die Vertrauen aufbaut.

**Akzeptanzkriterien:**
- [ ] Hero-Section mit klarem Value Proposition
- [ ] Gruender-Story (Martins Reise)
- [ ] Feature-Uebersicht
- [ ] Pricing-Sektion
- [ ] FAQ
- [ ] CTA zur AI-Analyse

### 5.2 Post-MVP Features (Monat 2-3)

#### 5.2.1 Auswanderer PRO Subscription (14,99 EUR/Monat)

**12 enthaltene Features:**

| # | Feature | Beschreibung |
|---|---------|--------------|
| 1 | Unbegrenzter AI-Zugang | Beliebig viele Laender-Analysen |
| 2 | Alle PDFs inklusive | Keine Extra-Kosten |
| 3 | Alle E-Books inklusive | Voller Bibliotheks-Zugang |
| 4 | Projekt-Dashboard | Persoenliches Cockpit |
| 5 | Checklisten-System | Schritt-fuer-Schritt Aufgaben |
| 6 | Meilenstein-Tracker | Fortschrittsanzeige |
| 7 | Personalisierte Timeline | AI-generierter Zeitplan |
| 8 | Kosten-Tracker | Budget planen |
| 9 | Laender-Vergleich | Bis zu 5 Laender Side-by-Side |
| 10 | Visa-Navigator | Personalisierte Visa-Optionen |
| 11 | Kosten-Rechner Live | Budget → Lebensstandard |
| 12 | Basis-Support | Email/FAQ |

#### 5.2.2 E-Books (4 Formate)

| E-Book | Preis | Beschreibung |
|--------|-------|--------------|
| Ausfuehrliche Langversion | 19,99 EUR | Kompletter Leitfaden |
| Kurzversion | 9,99 EUR | Das Wichtigste kompakt |
| Tips & Tricks | 14,99 EUR | Praktische Hacks |
| Auswandern fuer Dummies | 12,99 EUR | Einsteigerfreundlich |
| **Bundle (alle 4)** | 39,99 EUR | 33% Rabatt |

### 5.3 Spaetere Features (V2+)

| Feature | Status | Grund |
|---------|--------|-------|
| Laender-Swipe (Tinder-Style) | Geplant | Gamification |
| Forum/Community | Geplant | Braucht User-Basis |
| Dokumenten-Speicher | Geplant | Nice-to-have |
| Reminder/Notifications | Geplant | Komplexitaet |
| Persoenlicher Berater | Geplant | Skaliert nicht |
| Rueckkehrer-Storys | Geplant | Content-Strategie |

---

## 6. User Experience

### 6.1 User Journey - Free User

```
Landing Page → Start AI-Analyse → 26 Kriterien durchgehen →
→ Ergebnis-Preview (2 Seiten) → Kauf-Aufforderung →
→ [Zahlung] → Vollstaendige PDF → E-Book Upsell
```

### 6.2 User Journey - PRO User

```
Landing Page → PRO Subscription → Dashboard →
→ Unbegrenzte Analysen → Projekt-Tracking →
→ Tools nutzen (Visa-Nav, Rechner, Vergleich) → Ziel erreicht
```

### 6.3 Hauptscreens

| Screen | Zweck |
|--------|-------|
| **Landing Page** | Konversion, Vertrauensaufbau |
| **AI-Chat Interface** | Kriterien-Erfassung |
| **PDF-Preview** | Wert zeigen, zum Kauf motivieren |
| **Checkout** | Zahlung abwickeln |
| **PRO Dashboard** | Projekt-Management |
| **E-Book Shop** | Content verkaufen |

### 6.4 Design-Prinzipien

- **Einfachheit:** Keine Ueberladung, klare Hierarchie
- **Vertrauen:** Gruender-Story, Social Proof, Sicherheits-Badges
- **Mobile-First:** Primaer fuer Smartphone optimiert
- **Accessibility:** WCAG 2.1 AA konform
- **Performance:** Schnelle Ladezeiten (< 3s)

---

## 7. Technical Requirements

### 7.1 Tech-Stack

| Bereich | Technologie | Begruendung |
|---------|-------------|-------------|
| **Framework** | Next.js 14+ | SSR fuer SEO, React-Oekosystem |
| **Hosting** | Vercel | Zero-Config, Edge Functions |
| **AI Integration** | Claude API (Anthropic) | Beste Qualitaet, kosteneffizient |
| **Payment** | Stripe | Standard, Abo-Support, SEPA |
| **PDF-Generierung** | react-pdf / Puppeteer | Flexibilitaet, Styling |
| **Database** | Supabase (PostgreSQL) | Auth inklusive, Realtime |
| **Styling** | Tailwind CSS | Schnelle Entwicklung, Responsive |
| **Analytics** | Plausible / Fathom | DSGVO-konform |

### 7.2 Architektur-Uebersicht

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                            │
│                    Next.js + Tailwind                       │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐  │
│  │   Landing   │  AI-Chat    │  Dashboard  │   E-Books   │  │
│  └─────────────┴─────────────┴─────────────┴─────────────┘  │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                      API ROUTES                             │
│                   Next.js API Routes                        │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐  │
│  │ /api/analyze│ /api/pdf    │ /api/stripe │ /api/user   │  │
│  └─────────────┴─────────────┴─────────────┴─────────────┘  │
└────────────────────────────┬────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│   Claude API  │   │    Stripe     │   │   Supabase    │
│   (Anthropic) │   │   (Payment)   │   │  (Database)   │
└───────────────┘   └───────────────┘   └───────────────┘
```

### 7.3 Datenmodell (Vereinfacht)

```
Users
├── id (UUID)
├── email
├── subscription_tier (free|pro)
├── stripe_customer_id
└── created_at

Analyses
├── id (UUID)
├── user_id (FK)
├── criteria_responses (JSONB)
├── results (JSONB)
├── pdf_url
└── created_at

Purchases
├── id (UUID)
├── user_id (FK)
├── product_type (pdf|ebook|pro)
├── stripe_payment_id
├── amount
└── created_at
```

### 7.4 Security Requirements

| Anforderung | Umsetzung |
|-------------|-----------|
| DSGVO-Konformitaet | Cookie-Banner, Datenschutz-Seite, Datenloeschung |
| Sichere Zahlungen | Stripe (PCI DSS Level 1) |
| Auth | Supabase Auth (Email, Social) |
| API-Sicherheit | Rate Limiting, Input Validation |
| SSL/TLS | HTTPS everywhere (Vercel Standard) |

---

## 8. Risks & Mitigations

### 8.1 Technische Risiken

| Risiko | Schwere | Mitigation |
|--------|---------|------------|
| AI-Halluzinationen | Hoch | Fakten-Check, Disclaimers, Source-Referenzen |
| API-Kosten explodieren | Mittel | Token-Limits, Caching, Usage Monitoring |
| PDF-Generierung langsam | Mittel | Background Jobs, Progress-Indicator |
| Skalierungs-Probleme | Niedrig | Vercel Edge, DB Connection Pooling |

### 8.2 Business Risiken

| Risiko | Schwere | Mitigation |
|--------|---------|------------|
| Niedrige Conversion | Hoch | A/B Testing, Pricing-Tests, Feedback-Loop |
| Rechtliche Haftung | Hoch | "Keine Rechtsberatung" Disclaimer |
| Daten veralten | Mittel | Regelmaessige Updates, AI-Sources pruefen |
| Konkurrenz kopiert | Mittel | Schnell launchen, Brand aufbauen, SEO |

### 8.3 Marktrisiken

| Risiko | Schwere | Mitigation |
|--------|---------|------------|
| Kein Product-Market-Fit | Hoch | MVP schnell, User-Feedback, iterieren |
| Auswanderung sinkt | Niedrig | Diversifizierung (Rueckkehrer, B2B) |
| Wirtschaftskrise | Mittel | Flexible Preismodelle |

---

## 9. Timeline & Milestones

### 9.1 12-Wochen Roadmap

| Woche | Phase | Deliverables |
|-------|-------|--------------|
| 1-2 | **Discovery & Design** | PRD final, Wireframes, Tech-Setup |
| 3-4 | **Foundation** | Next.js Projekt, DB-Schema, Auth |
| 5-6 | **Core AI** | Claude Integration, 26-Kriterien Chat |
| 7-8 | **PDF & Payment** | PDF-Generator, Stripe Integration |
| 9-10 | **Polish & Beta** | UI Polish, Beta-Tester, Bug Fixes |
| 11-12 | **Launch** | Go-Live, Marketing, Monitoring |

### 9.2 Post-Launch Roadmap

| Monat | Fokus |
|-------|-------|
| 1-2 | Feedback sammeln, Quick Wins, PRO Abo launch |
| 3-4 | Alle E-Books, Dashboard-Features |
| 5-6 | Visa-Navigator, Kosten-Rechner |
| 7-12 | Community, Schwedischer Markt, B2B |

---

## 10. Out of Scope (Explizit NICHT im MVP)

| Feature | Grund | Wann moeglicherweise |
|---------|-------|----------------------|
| Native Mobile App | Web-First Strategie | V2+ |
| Forum/Community | Braucht User-Basis | 6+ Monate |
| Persoenlicher Berater | Skaliert nicht | V2+ (Premium) |
| Auswanderer-Matching | Zu komplex | V3+ |
| Virtuelle Touren | Partner-Netzwerk noetig | V3+ |
| Multi-Language | Fokus DE erst | Nach DE-Erfolg |

---

## 11. Appendix

### 11.1 Wettbewerber-Analyse

| Wettbewerber | Staerken | Schwaechen | Unsere Differenzierung |
|--------------|----------|------------|------------------------|
| Nomad List | Daten, Community | Nur Digital Nomads | Breitere Zielgruppe, AI |
| Expatistan | Kostenlos, Bekannt | Nur Kosten-Vergleich | 26 Kriterien, personalisiert |
| InterNations | Community | Keine Entscheidungshilfe | AI-gestuetzte Analyse |
| Auswanderer-Berater | Persoenlich | Teuer, nicht skalierbar | AI-Qualitaet zu Bruchteil Kosten |

### 11.2 Referenz-Dokumente

- Brainstorming Session (2026-01-17) mit Carson (Brainstorming Coach)
- Word-Dokument Vorlage fuer PDF (noch zu analysieren)

### 11.3 Glossar

| Begriff | Definition |
|---------|------------|
| PRO | Premium-Subscription (14,99 EUR/Monat) |
| Freemium | Kostenlose Nutzung + kostenpflichtige Erweiterungen |
| MVP | Minimum Viable Product - erste launchbare Version |
| Kriterien | Die 26 Bewertungspunkte der AI-Analyse |

---

**Dokument-Status:** FINAL DRAFT
**Naechster Schritt:** Technical Architecture erstellen

