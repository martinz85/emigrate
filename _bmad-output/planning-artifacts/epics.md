---
stepsCompleted: [1, 2, 3, 4]
workflowComplete: true
inputDocuments: [prd.md, architecture.md, ux-design-specification.md]
---

# Auswanderer-Plattform - Epic Breakdown

## Overview

Dieses Dokument enthält die vollständige Epic- und Story-Aufschlüsselung für die Auswanderer-Plattform, basierend auf PRD, Architecture und UX Design Specification.

## Requirements Inventory

### Functional Requirements

**FR1: AI-Assistent mit 28-Kriterien-Analyse**
- Nutzer kann alle 28 Kriterien gewichten (1-5 Skala)
- 2 Pre-Analysis Fragen (Länder-Interesse, Sonstige Wünsche)
- AI stellt kontextbezogene Folgefragen
- Analyse dauert max. 10-15 Minuten
- Ergebnis zeigt Top 3-5 Länder mit Begründung

**FR2: PDF-Generierung**
- PDF enthält alle 28 Kriterien-Bewertungen
- Personalisierte Länder-Empfehlungen mit Begründung
- Professionelles, druckfähiges Design
- Generierung in < 30 Sekunden

**FR3: Freemium-Preview**
- 94% Match sichtbar, Land versteckt
- Klarer CTA zum Kauf (29,99€)
- Kein Account notwendig für Preview

**FR4: Payment-Integration (Stripe)**
- Einmalzahlung für PDF (29,99€)
- Subscription für PRO (14,99€/Monat)
- Unterstützte Methoden: Kreditkarte, SEPA
- Automatische Rechnungsstellung
- Stornierung/Kündigung Self-Service

**FR5: Mobile-Responsive Design**
- Responsive Breakpoints: Mobile, Tablet, Desktop
- Touch-optimierte Interaktionen
- Google Mobile-Friendly Test bestanden

**FR6: SEO-Grundoptimierung**
- Server-Side Rendering (SSR) für alle Seiten
- Meta-Tags, Open Graph, strukturierte Daten
- Sitemap.xml und robots.txt
- Core Web Vitals im "Good" Bereich

**FR7: Landing Page mit Gründer-Story**
- Hero-Section mit klarem Value Proposition
- Gründer-Story (Martins Reise)
- Feature-Übersicht
- Pricing-Sektion
- FAQ
- CTA zur AI-Analyse

**FR8: User Authentication**
- Email + Magic Link Auth
- Session Management
- PRO Status Tracking

**FR9: PRO Dashboard (Post-MVP)**
- Analyse-Historie
- Subscription-Verwaltung

**FR10: E-Book Shop (Post-MVP)**
- 4 E-Books zum Kauf
- Bundle-Option

### Non-Functional Requirements

**NFR1: Performance**
- Lighthouse Score > 90
- Load Time < 3 Sekunden

**NFR2: SEO**
- Core Web Vitals alle "Good"
- SSR für alle öffentlichen Seiten

**NFR3: Availability**
- Uptime > 99.5%
- Error Recovery

**NFR4: Mobile**
- Mobile-Friendly Test Pass
- Touch Targets min 48px

**NFR5: Accessibility**
- WCAG 2.1 AA Konformität
- Keyboard Navigation
- Screen Reader Support

**NFR6: Security**
- DSGVO-Konformität
- PCI DSS (via Stripe)
- Row Level Security

**NFR7: Scalability**
- Vercel Edge Functions
- DB Connection Pooling

### Additional Requirements

**From Architecture:**
- Starter Template: `npx create-next-app@latest` mit TypeScript, Tailwind, ESLint
- Supabase für Auth und Database
- Stripe für Payment
- Claude API für AI-Analyse
- Zustand für State Management
- Framer Motion für Animationen
- React Hook Form für Forms

**From UX Design:**
- Mobile-First Approach
- Ein-Frage-pro-Screen Pattern
- Auto-Advance nach Rating (300ms)
- 94% Reveal Strategy
- Teal (#0F766E) + Amber (#F59E0B) Color Scheme
- Inter Font
- shadcn/ui Components

### FR Coverage Map

| FR | Epic | Beschreibung |
|----|------|--------------|
| FR1 | Epic 2 | AI-Analyse mit 28 Kriterien |
| FR2 | Epic 5 | PDF-Generierung |
| FR3 | Epic 3 | Freemium-Preview |
| FR4 | Epic 4 | Stripe Payment |
| FR5 | Epic 1 | Mobile-Responsive |
| FR6 | Epic 1 | SEO-Optimierung |
| FR7 | Epic 1 | Landing Page |
| FR8 | Epic 6 | Authentication |
| FR9 | Epic 7 | PRO Dashboard |
| FR10 | Epic 8 | E-Book Shop |

## Epic List

### Epic 1: Foundation & Landing
User können die Plattform besuchen und verstehen, was sie erwartet.
**FRs covered:** FR5, FR6, FR7
**NFRs:** NFR1-7 (Performance, SEO, Mobile, Accessibility, Security)

### Epic 2: AI Analysis Flow
User können 28 Kriterien bewerten und eine KI-Analyse starten.
**FRs covered:** FR1

### Epic 3: Results & Freemium Preview
User sehen ihr Ergebnis (94% Match, Land versteckt) und werden zum Kauf motiviert.
**FRs covered:** FR3

### Epic 4: Payment & Purchase
User können für die vollständige Analyse bezahlen.
**FRs covered:** FR4

### Epic 5: PDF Generation & Reveal
User erhalten nach Zahlung die vollständige PDF-Analyse mit Land-Reveal.
**FRs covered:** FR2

### Epic 6: User Authentication
User können sich anmelden um Analysen zu speichern und wiederzufinden.
**FRs covered:** FR8

### Epic 7: PRO Dashboard (Post-MVP)
PRO User haben ein Dashboard mit Analyse-Historie und Abo-Verwaltung.
**FRs covered:** FR9

### Epic 8: E-Book Shop (Post-MVP)
User können E-Books kaufen und herunterladen.
**FRs covered:** FR10

---

## Epic 1: Foundation & Landing

User können die Plattform besuchen und verstehen, was sie erwartet.

### Story 1.1: Projekt-Setup

Als Entwickler,
möchte ich das Next.js Projekt mit dem definierten Starter Template initialisieren,
damit eine solide technische Basis für die Entwicklung existiert.

**Acceptance Criteria:**

**Given** ein leeres Projektverzeichnis
**When** das Starter Template ausgeführt wird
**Then** existiert ein funktionierendes Next.js 14+ Projekt mit TypeScript, Tailwind, ESLint
**And** shadcn/ui ist initialisiert mit den Basis-Komponenten
**And** die Projektstruktur entspricht der Architecture-Spezifikation

---

### Story 1.2: Layout & Navigation

Als User,
möchte ich eine konsistente Navigation auf allen Seiten sehen,
damit ich mich auf der Plattform orientieren kann.

**Acceptance Criteria:**

**Given** ich bin auf einer beliebigen Seite
**When** die Seite geladen wird
**Then** sehe ich einen Header mit Logo und Navigation
**And** sehe ich einen Footer mit Links und Copyright
**And** auf Mobile sehe ich eine Hamburger-Navigation
**And** alle Links sind klickbar und führen zur richtigen Seite

---

### Story 1.3: Landing Page Hero

Als potentieller Kunde,
möchte ich sofort verstehen was die Plattform bietet,
damit ich entscheiden kann ob sie für mich relevant ist.

**Acceptance Criteria:**

**Given** ich besuche die Startseite
**When** die Seite geladen wird
**Then** sehe ich eine Hero-Section mit klarem Value Proposition
**And** sehe ich einen prominenten CTA-Button "Analyse starten"
**And** die Hero-Section ist auf Mobile vollständig sichtbar
**And** die Ladezeit ist unter 3 Sekunden

---

### Story 1.4: How It Works Section

Als potentieller Kunde,
möchte ich verstehen wie der Analyse-Prozess funktioniert,
damit ich weiß was mich erwartet.

**Acceptance Criteria:**

**Given** ich bin auf der Landing Page
**When** ich zur "So funktioniert's" Section scrolle
**Then** sehe ich 3-4 Schritte erklärt (Fragen beantworten → Analyse → PDF)
**And** jeder Schritt hat ein Icon und eine kurze Beschreibung
**And** die Section ist visuell ansprechend und übersichtlich

---

### Story 1.5: Gründer-Story Section

Als potentieller Kunde,
möchte ich die Geschichte des Gründers lesen,
damit ich Vertrauen in die Plattform aufbaue.

**Acceptance Criteria:**

**Given** ich bin auf der Landing Page
**When** ich zur Gründer-Story Section scrolle
**Then** sehe ich Martins persönliche Auswanderungs-Geschichte
**And** sehe ich ein Foto oder Illustration
**And** die Story vermittelt Authentizität und Expertise

---

### Story 1.6: Pricing Section

Als potentieller Kunde,
möchte ich die Preise verstehen,
damit ich eine Kaufentscheidung treffen kann.

**Acceptance Criteria:**

**Given** ich bin auf der Landing Page
**When** ich zur Pricing Section scrolle
**Then** sehe ich die PDF-Einmalzahlung (29,99€)
**And** sehe ich die PRO-Subscription (14,99€/Monat)
**And** jedes Produkt hat eine klare Feature-Liste
**And** es gibt CTAs für beide Optionen

---

### Story 1.7: FAQ Section

Als potentieller Kunde,
möchte ich Antworten auf häufige Fragen finden,
damit meine Bedenken ausgeräumt werden.

**Acceptance Criteria:**

**Given** ich bin auf der Landing Page
**When** ich zur FAQ Section scrolle
**Then** sehe ich mindestens 6 häufig gestellte Fragen
**And** kann ich Fragen auf/zuklappen (Accordion)
**And** die Fragen adressieren typische Bedenken (Datenschutz, Genauigkeit, etc.)

---

### Story 1.8: SEO & Meta Tags

Als Plattform-Betreiber,
möchte ich dass die Seite SEO-optimiert ist,
damit sie in Suchmaschinen gefunden wird.

**Acceptance Criteria:**

**Given** die Landing Page ist deployed
**When** ein Suchmaschinen-Crawler die Seite besucht
**Then** sind alle Meta-Tags korrekt gesetzt (title, description)
**And** Open Graph Tags für Social Sharing sind vorhanden
**And** eine sitemap.xml und robots.txt existieren
**And** Core Web Vitals sind im "Good" Bereich

---

## Epic 2: AI Analysis Flow

User können 28 Kriterien bewerten und eine KI-Analyse starten.

### Story 2.1: Analysis Page Setup

Als User,
möchte ich die Analyse-Seite besuchen können,
damit ich den Fragebogen starten kann.

**Acceptance Criteria:**

**Given** ich klicke auf "Analyse starten"
**When** die Seite /analyse geladen wird
**Then** sehe ich eine einladende Willkommens-Nachricht
**And** sehe ich einen "Los geht's" Button
**And** die Seite ist Mobile-optimiert

---

### Story 2.2: Pre-Analysis Questions

Als User,
möchte ich optional Länder angeben die mich interessieren,
damit die Analyse personalisierter wird.

**Acceptance Criteria:**

**Given** ich starte die Analyse
**When** die Pre-Analysis Fragen erscheinen
**Then** kann ich Länder aus einer Liste auswählen (Multiselect)
**And** kann ich optional einen Freitext-Wunsch eingeben
**And** kann ich die Fragen überspringen
**And** meine Auswahl wird im State gespeichert

---

### Story 2.3: Rating UI Component

Als User,
möchte ich Kriterien einfach bewerten können,
damit die Analyse-Erstellung Spaß macht.

**Acceptance Criteria:**

**Given** ich bin bei einer Kriterium-Frage
**When** ich die Rating-Buttons sehe
**Then** sind 5 Buttons sichtbar (1-5) mit Emojis
**And** kann ich einen Button antippen
**And** der gewählte Button ist visuell hervorgehoben (Emerald)
**And** die Touch-Targets sind mindestens 48px groß

---

### Story 2.4: Question Flow State

Als User,
möchte ich durch alle 28 Fragen geführt werden,
damit ich alle Kriterien bewerte.

**Acceptance Criteria:**

**Given** ich habe ein Rating gewählt
**When** 300ms vergangen sind
**Then** wechselt die Ansicht zur nächsten Frage (Auto-Advance)
**And** mein Rating wird im Zustand Store gespeichert
**And** ich kann zurück zur vorherigen Frage navigieren
**And** meine vorherige Antwort ist erhalten

---

### Story 2.5: Progress Header

Als User,
möchte ich meinen Fortschritt sehen,
damit ich weiß wie weit ich bin.

**Acceptance Criteria:**

**Given** ich bin in der Analyse
**When** ich eine Frage beantworte
**Then** zeigt der Fortschrittsbalken meinen Fortschritt (X/28)
**And** die Kategorie-Anzeige zeigt welche Kategorie aktiv ist
**And** der Progress ist sticky am oberen Bildschirmrand
**And** ein Zurück-Button ist sichtbar

---

### Story 2.6: Info Modal

Als User,
möchte ich mehr Details zu einem Kriterium erfahren können,
damit ich informiert bewerten kann.

**Acceptance Criteria:**

**Given** ich bin bei einer Frage
**When** ich auf das ℹ️ Icon tippe
**Then** öffnet sich ein Modal mit detaillierter Erklärung
**And** das Modal hat einen "Verstanden" Button
**And** ich kann das Modal durch Tippen außerhalb schließen
**And** der Fokus bleibt im Modal (Accessibility)

---

### Story 2.7: Loading Animation

Als User,
möchte ich sehen dass meine Analyse erstellt wird,
damit ich weiß dass etwas passiert.

**Acceptance Criteria:**

**Given** ich habe alle 28 Fragen beantwortet
**When** die Analyse gestartet wird
**Then** sehe ich einen animierten Loading-Screen
**And** sehe ich einen pulsierenden Globus 🌍
**And** sehe ich wechselnde Fun Facts über Länder
**And** sehe ich einen Fortschrittsbalken
**And** die Animation läuft 3-5 Sekunden

---

### Story 2.8: Claude AI Integration

Als System,
möchte ich die User-Antworten an Claude AI senden,
damit eine personalisierte Analyse erstellt wird.

**Acceptance Criteria:**

**Given** alle 28 Ratings und Pre-Analysis sind gesammelt
**When** die /api/analyze Route aufgerufen wird
**Then** werden die Daten an Claude API gesendet
**And** der Prompt enthält alle Kriterien mit Bewertungen
**And** Claude antwortet mit Top 3-5 Ländern und Begründungen
**And** die Antwort wird in Supabase gespeichert
**And** eine Analysis-ID wird zurückgegeben

---

## Epic 3: Results & Freemium Preview

User sehen ihr Ergebnis (94% Match, Land versteckt).

### Story 3.1: Result Teaser Page

Als User,
möchte ich mein Analyse-Ergebnis sehen,
damit ich erfahre wie gut mein Match ist.

**Acceptance Criteria:**

**Given** meine Analyse ist fertig
**When** ich zur /ergebnis/[id] Seite weitergeleitet werde
**Then** sehe ich meine Match-Prozentzahl (z.B. 94%)
**And** sehe ich "Dein Top-Match" als Überschrift
**And** das Land ist mit 🔒 versteckt
**And** die Seite ist ohne Login zugänglich

---

### Story 3.2: Match Score Animation

Als User,
möchte ich eine spannende Enthüllung meines Scores sehen,
damit das Erlebnis aufregend ist.

**Acceptance Criteria:**

**Given** die Teaser-Seite wird geladen
**When** der Score angezeigt wird
**Then** zählt die Prozentzahl von 0 auf den finalen Wert hoch
**And** die Animation dauert 2-3 Sekunden
**And** die Zahl ist groß und prominent (min 64px)
**And** es gibt eine Farbänderung basierend auf Score-Höhe

---

### Story 3.3: Locked Country Display

Als User,
möchte ich wissen dass das Land versteckt ist,
damit ich motiviert bin zu kaufen.

**Acceptance Criteria:**

**Given** ich bin auf der Teaser-Seite
**When** ich das versteckte Land sehe
**Then** ist es als "🔒🔒🔒🔒🔒" oder ähnlich dargestellt
**And** es gibt einen Hinweis "Jetzt freischalten"
**And** die Darstellung weckt Neugier

---

### Story 3.4: Purchase CTA

Als User,
möchte ich einfach kaufen können,
damit ich mein Ergebnis sehe.

**Acceptance Criteria:**

**Given** ich bin auf der Teaser-Seite
**When** ich den CTA-Button sehe
**Then** steht "Jetzt freischalten – 29,99€" auf dem Button
**And** der Button ist im Amber-Farbton (auffällig)
**And** beim Klick werde ich zum Checkout weitergeleitet

---

## Epic 4: Payment & Purchase

User können für die vollständige Analyse bezahlen.

### Story 4.1: Stripe Checkout Session

Als System,
möchte ich eine Stripe Checkout Session erstellen,
damit User sicher bezahlen können.

**Acceptance Criteria:**

**Given** ein User klickt auf "Jetzt freischalten"
**When** die /api/checkout Route aufgerufen wird
**Then** wird eine Stripe Checkout Session erstellt
**And** die Analysis-ID ist in den Metadata enthalten
**And** der Preis ist 29,99€
**And** eine Checkout-URL wird zurückgegeben

---

### Story 4.2: Checkout Redirect

Als User,
möchte ich zu Stripe weitergeleitet werden,
damit ich sicher bezahlen kann.

**Acceptance Criteria:**

**Given** die Checkout Session wurde erstellt
**When** ich den CTA-Button geklickt habe
**Then** werde ich zur Stripe Checkout Seite weitergeleitet
**And** ich sehe den korrekten Betrag (29,99€)
**And** ich kann mit Kreditkarte oder SEPA bezahlen
**And** nach erfolgreicher Zahlung werde ich zurückgeleitet

---

### Story 4.3: Stripe Webhook Handler

Als System,
möchte ich Zahlungsbestätigungen von Stripe erhalten,
damit ich Käufe verifizieren kann.

**Acceptance Criteria:**

**Given** ein User hat bei Stripe bezahlt
**When** Stripe den Webhook an /api/webhook sendet
**Then** wird die Signatur verifiziert
**And** der Kauf wird in Supabase gespeichert
**And** die Analyse wird als "bezahlt" markiert

---

### Story 4.4: Success Page

Als User,
möchte ich eine Bestätigung meiner Zahlung sehen,
damit ich weiß dass alles geklappt hat.

**Acceptance Criteria:**

**Given** meine Zahlung war erfolgreich
**When** ich zur Success-Seite weitergeleitet werde
**Then** sehe ich "Danke für deinen Kauf!"
**And** sehe ich einen Button "Ergebnis ansehen"
**And** werde nach 3 Sekunden automatisch weitergeleitet

---

## Epic 5: PDF Generation & Reveal

User erhalten nach Zahlung die vollständige PDF-Analyse.

### Story 5.1: Land Reveal Animation

Als User,
möchte ich mein Top-Land dramatisch enthüllt sehen,
damit das Erlebnis unvergesslich ist.

**Acceptance Criteria:**

**Given** ich habe bezahlt und bin auf der Ergebnis-Seite
**When** das Land enthüllt wird
**Then** gibt es eine dramatische Animation (3-5 Sekunden)
**And** das Land-Emoji/Flagge erscheint groß
**And** der Ländername wird angezeigt
**And** ich sehe "94% Match" zusammen mit dem Land

---

### Story 5.2: PDF Template

Als System,
möchte ich ein professionelles PDF-Layout haben,
damit User einen hochwertigen Report erhalten.

**Acceptance Criteria:**

**Given** eine Analyse mit allen Daten
**When** das PDF-Template gerendert wird
**Then** enthält es ein Deckblatt mit Titel und Datum
**And** enthält es alle 28 Kriterien-Bewertungen
**And** enthält es Top 3-5 Länder mit Begründungen
**And** das Design ist professionell und druckfähig
**And** Farben entsprechen dem Brand (Teal/Amber)

---

### Story 5.3: PDF Generator API

Als System,
möchte ich PDFs serverseitig generieren,
damit User sie herunterladen können.

**Acceptance Criteria:**

**Given** eine bezahlte Analyse
**When** /api/pdf/[id] aufgerufen wird
**Then** wird ein PDF generiert mit react-pdf
**And** die Generierung dauert < 30 Sekunden
**And** das PDF wird als Download zurückgegeben
**And** unbezahlte Analysen erhalten einen 403 Error

---

### Story 5.4: PDF Download Button

Als User,
möchte ich mein PDF herunterladen können,
damit ich es offline lesen kann.

**Acceptance Criteria:**

**Given** ich bin auf der Ergebnis-Seite nach Zahlung
**When** ich auf "PDF herunterladen" klicke
**Then** startet der Download automatisch
**And** die Datei heißt "auswanderer-analyse-[datum].pdf"
**And** ich sehe einen Spinner während der Generierung

---

## Epic 6: User Authentication

User können sich anmelden um Analysen zu speichern.

### Story 6.1: Supabase Auth Setup

Als Entwickler,
möchte ich Supabase Auth konfigurieren,
damit User sich anmelden können.

**Acceptance Criteria:**

**Given** Supabase ist eingerichtet
**When** die Auth-Konfiguration deployt wird
**Then** funktioniert Email + Magic Link Auth
**And** Supabase Client ist auf Client und Server konfiguriert
**And** Environment Variables sind gesetzt

---

### Story 6.2: Login Page

Als User,
möchte ich mich mit Email anmelden können,
damit ich meine Analysen wiederfinde.

**Acceptance Criteria:**

**Given** ich bin auf der /login Seite
**When** ich meine Email eingebe und absende
**Then** erhalte ich einen Magic Link per Email
**And** ich sehe eine Bestätigungsnachricht
**And** nach Klick auf den Link bin ich eingeloggt

---

### Story 6.3: Auth Middleware

Als System,
möchte ich geschützte Routen absichern,
damit nur eingeloggte User zugreifen können.

**Acceptance Criteria:**

**Given** ein nicht-eingeloggter User
**When** er auf /dashboard zugreifen will
**Then** wird er zu /login weitergeleitet
**And** nach Login wird er zurück zu /dashboard geleitet

---

### Story 6.4: User Profile Storage

Als System,
möchte ich User-Daten speichern,
damit Analysen zugeordnet werden können.

**Acceptance Criteria:**

**Given** ein User loggt sich ein
**When** sein Profil noch nicht existiert
**Then** wird ein Profil in der profiles Tabelle erstellt
**And** subscription_tier ist initial "free"
**And** Analysen werden mit user_id verknüpft

