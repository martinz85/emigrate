# Launch Checklist - Auswanderer-Plattform

**Status:** Bereit für Beta-Launch
**Erstellt:** 2026-01-17

---

## 1. Technische Voraussetzungen

### 1.1 Vercel Deployment

- [ ] Vercel-Account erstellen: https://vercel.com
- [ ] GitHub-Repository verknüpfen
- [ ] Environment Variables setzen:
  - `ANTHROPIC_API_KEY`
  - `STRIPE_SECRET_KEY`
  - `STRIPE_PUBLISHABLE_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Produktions-Deploy auslösen
- [ ] Custom Domain konfigurieren

### 1.2 Stripe Setup

- [ ] Stripe-Account erstellen: https://stripe.com
- [ ] Geschäftsdaten verifizieren
- [ ] Produkte anlegen:
  - PDF Single (39 EUR)
  - E-Book Komplett (19.99 EUR)
  - E-Book Kurz (9.99 EUR)
  - E-Book Tips (14.99 EUR)
  - E-Book Dummies (12.99 EUR)
  - E-Book Bundle (39.99 EUR)
  - PRO Monthly (14.99 EUR/Monat)
  - PRO Yearly (119.88 EUR/Jahr)
- [ ] Webhook-Endpoint konfigurieren: `/api/webhooks/stripe`
- [ ] Test-Modus aktivieren
- [ ] Testzahlungen durchführen

### 1.3 Supabase Setup

- [ ] Supabase-Projekt erstellen: https://supabase.com
- [ ] Datenbank-Schema anlegen:
  - `users`
  - `analyses`
  - `purchases`
  - `subscriptions`
- [ ] Row Level Security konfigurieren
- [ ] Auth aktivieren (Email, optional: Google)

### 1.4 Claude API

- [ ] Anthropic-Account: https://console.anthropic.com
- [ ] API-Key generieren
- [ ] Rate Limits prüfen
- [ ] Kosten-Monitoring aktivieren

---

## 2. Domain & Hosting

### 2.1 Domain

- [ ] Domain registrieren (Vorschläge):
  - auswanderer-plattform.de
  - auswandern.app
  - auswanderer.io
- [ ] DNS zu Vercel zeigen
- [ ] SSL-Zertifikat (automatisch bei Vercel)

### 2.2 E-Mail

- [ ] E-Mail-Adressen einrichten:
  - info@auswanderer-plattform.de
  - support@auswanderer-plattform.de
  - martin@auswanderer-plattform.de
- [ ] Transaktions-E-Mails (Resend/Postmark):
  - Kaufbestätigung
  - PDF-Download-Link
  - PRO-Willkommen
  - Kündigung

---

## 3. Rechtliches

### 3.1 Impressum

- [ ] Vollständige Angaben:
  - Name, Adresse
  - E-Mail, Telefon
  - USt-IdNr. (falls vorhanden)
  - Inhaltlich Verantwortlicher

### 3.2 Datenschutz

- [ ] DSGVO-konforme Datenschutzerklärung
- [ ] Cookie-Banner implementiert
- [ ] Consent Management (optional: Plausible/Fathom = kein Consent nötig)

### 3.3 AGB

- [ ] Allgemeine Geschäftsbedingungen
- [ ] Widerrufsrecht (14 Tage digital)
- [ ] Haftungsausschluss

### 3.4 Disclaimer

- [ ] "Keine Rechts- oder Steuerberatung" prominent platziert

---

## 4. Content & SEO

### 4.1 Meta-Informationen

- [ ] Title Tags für alle Seiten
- [ ] Meta Descriptions
- [ ] Open Graph Tags
- [ ] Favicon & App Icons

### 4.2 Structured Data

- [ ] Product Schema für PDFs/E-Books
- [ ] FAQ Schema für FAQ-Sektion
- [ ] Organization Schema

### 4.3 Sitemap & Robots

- [ ] sitemap.xml generiert
- [ ] robots.txt konfiguriert
- [ ] Google Search Console verknüpft

---

## 5. Analytics & Monitoring

### 5.1 Analytics

- [ ] Plausible Analytics einrichten (DSGVO-konform)
- [ ] Event-Tracking für:
  - Analyse gestartet
  - Analyse abgeschlossen
  - PDF-Preview gesehen
  - Checkout gestartet
  - Kauf abgeschlossen

### 5.2 Error Tracking

- [ ] Sentry.io einrichten
- [ ] Error-Alerts per E-Mail

### 5.3 Uptime Monitoring

- [ ] UptimeRobot oder Vercel Analytics
- [ ] Alert bei Downtime

---

## 6. Marketing-Vorbereitung

### 6.1 Launch-Kanäle

**Phase 1: Soft Launch (Woche 1-2)**
- [ ] Persönliches Netzwerk
- [ ] Deutsche Expat-Gruppen auf Facebook
- [ ] Reddit: r/auswandern, r/germany

**Phase 2: Content Marketing (ab Woche 3)**
- [ ] Blog-Artikel zu SEO-Keywords
- [ ] Gastbeiträge auf Auswanderer-Blogs
- [ ] YouTube-Teaser-Video (optional)

**Phase 3: Paid Ads (ab Woche 5)**
- [ ] Google Ads für "Auswandern" Keywords
- [ ] Facebook/Instagram Ads
- [ ] Remarketing für Besucher

### 6.2 SEO-Keywords

Primäre Keywords:
- "auswandern wohin" (720 Suchen/Monat)
- "auswandern deutschland" (1.300 Suchen/Monat)
- "auswandern 2026" (880 Suchen/Monat)
- "bestes land zum auswandern" (480 Suchen/Monat)

Sekundäre Keywords:
- "auswandern portugal erfahrungen"
- "auswandern spanien kosten"
- "digital nomad visum"
- "steuern im ausland"

### 6.3 Launch-Angebote

- [ ] Early Bird: 20% auf PDFs (erste Woche)
- [ ] Gründer-Rabatt: Erster Monat PRO gratis
- [ ] Referral-Programm (optional)

---

## 7. Testen vor Launch

### 7.1 Funktionale Tests

- [ ] AI-Analyse komplett durchspielen
- [ ] PDF-Preview funktioniert
- [ ] Stripe-Checkout funktioniert (Test-Modus)
- [ ] E-Mail-Zustellung funktioniert
- [ ] Mobile-Responsive auf allen Geräten

### 7.2 Performance

- [ ] Lighthouse Score > 90
- [ ] Core Web Vitals "Good"
- [ ] Ladezeit < 3s

### 7.3 Browser-Tests

- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile Safari (iPhone)
- [ ] Chrome Mobile (Android)

---

## 8. Launch-Tag

### 8.1 Ablauf

| Zeit | Aktion |
|------|--------|
| 08:00 | Finale Tests |
| 09:00 | Stripe auf Live schalten |
| 10:00 | Domain aktivieren |
| 11:00 | Social Media Posts |
| 12:00 | E-Mail an Warteliste (falls vorhanden) |
| Laufend | Monitoring & Support |

### 8.2 Post-Launch (erste Woche)

- [ ] Täglich Analytics checken
- [ ] Support-Anfragen beantworten
- [ ] Bugs fixen
- [ ] Feedback sammeln
- [ ] Erste Testimonials einsammeln

---

## 9. Kontakte

| Rolle | Name | Kontakt |
|-------|------|---------|
| Gründer | Martin | martin@... |
| Tech | [TBD] | |
| Design | [TBD] | |

---

## 10. Notfall-Plan

### Bei technischen Problemen:

1. Vercel Status: https://www.vercel-status.com/
2. Stripe Status: https://status.stripe.com/
3. Supabase Status: https://status.supabase.com/

### Bei hoher Last:

- Vercel skaliert automatisch
- Claude API hat Rate Limits → Queue implementieren

### Bei Sicherheitsproblemen:

- Stripe-Zahlungen pausieren
- Supabase RLS prüfen
- Vercel Environment Variables rotieren

---

**Nächste Schritte:**

1. ✅ Alle technischen TODOs abarbeiten
2. ✅ Rechtliche Dokumente erstellen
3. ✅ Beta-Tester finden (5-10 Personen)
4. ✅ Feedback einarbeiten
5. 🚀 LAUNCH!

---

*Dokument-Version: 1.0*
*Erstellt mit BMAD Method*

