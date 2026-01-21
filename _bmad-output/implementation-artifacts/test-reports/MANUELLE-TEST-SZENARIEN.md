# 📋 MANUELLE TEST-SZENARIEN - Auswanderer-Plattform

**Erstellt:** 2026-01-21  
**Tester:** Tina (QA Agent)  
**Status:** Bereit für manuelle Ausführung  
**Ziel:** Komplette Test-Coverage für alle 105 Test Cases

---

## 🎯 ZWECK DIESES DOKUMENTS

Dieses Dokument enthält **detaillierte Schritt-für-Schritt Anleitungen** für alle verbleibenden Tests, die noch nicht automatisiert durchgeführt wurden.

**Verwendung:**
1. Test-Szenario auswählen
2. Schritt-für-Schritt Anleitung folgen
3. Ergebnis dokumentieren (✅ Pass / ❌ Fail)
4. Screenshots machen
5. Bugs in Bug-Tracker eintragen

---

## 📊 TEST-ÜBERSICHT

| Epic | Feature | Geplant | Bereits getestet | Verbleibend | Priorität |
|------|---------|---------|------------------|-------------|-----------|
| 1 | Landing Page | 5 | 5 | 0 | ✅ Done |
| 2 | AI Analyse Flow | 12 | 15 | 0* | ✅ Done |
| 3 | Ergebnis Preview | 6 | 0 | 6 | 🔴 Critical |
| 4 | Payment/Stripe | 8 | 0 | 8 | 🔴 Critical |
| 5 | PDF Download | 4 | 0 | 4 | 🔴 Critical |
| 6 | Auth/Login | 10 | 2 | 8 | 🟡 Medium |
| 7 | E-Books | 15 | 3 | 12 | 🟡 Medium |
| 8 | PRO Subscription | 25 | 2 | 23 | 🟡 Medium |
| 10 | Admin Dashboard | 20 | 2 | 18 | 🟢 Low |
| **TOTAL** | | **105** | **29** | **76** | |

*Analyse-Flow hat mehr Tests als geplant (15 statt 12) ✨

---

## 🔴 EPIC 3: ERGEBNIS PREVIEW (6 Tests) - CRITICAL

### Voraussetzung
- [ ] Komplette Analyse durchgeführt (29/29 Fragen beantwortet)
- [ ] URL: `/ergebnis/[analysis-id]`

---

### TC 3.1.1: Ergebnis-Seite lädt ohne Fehler

**Priorität:** 🔴 CRITICAL  
**Aufwand:** 5 Minuten

#### Schritte:
1. Öffne https://auswanderer-app.vercel.app/analyse
2. Beantworte alle 29 Fragen
3. Klicke auf "Analyse abschließen" (letzte Frage)
4. Warte auf Redirect zu `/ergebnis/[id]`

#### Erwartetes Ergebnis:
- ✅ Seite lädt innerhalb von 5 Sekunden
- ✅ Keine Console-Errors
- ✅ URL ändert sich zu `/ergebnis/[uuid]`
- ✅ Kein 404 oder 500 Error

#### Bei Fehler dokumentieren:
- [ ] Screenshot der Error-Page
- [ ] Console-Log kopieren
- [ ] Network-Tab prüfen (welcher Request failed?)

---

### TC 3.1.2: Top 3 Länder werden angezeigt

**Priorität:** 🔴 CRITICAL  
**Aufwand:** 3 Minuten

#### Schritte:
1. Auf Ergebnis-Seite (nach TC 3.1.1)
2. Scrolle zum "Deine Top 3 Länder" Bereich

#### Erwartetes Ergebnis:
- ✅ Genau 3 Länder werden angezeigt
- ✅ Jedes Land hat:
  - Land-Name
  - Land-Flagge
  - Match-Score (0-100%)
  - Kurzbeschreibung
- ✅ Länder sind sortiert (Rank 1, 2, 3)
- ✅ Scores sind plausibel (nicht alle 100% oder 0%)

#### Zu prüfen:
- [ ] Sind die Länder basierend auf meinen Antworten sinnvoll?
- [ ] Ist der Text lesbar? (Bug #001 check)
- [ ] Sind die Scores konsistent?

---

### TC 3.1.3: Detaillierte Scores werden angezeigt

**Priorität:** 🔴 CRITICAL  
**Aufwand:** 5 Minuten

#### Schritte:
1. Auf Ergebnis-Seite
2. Scrolle zu "Detaillierte Bewertung" oder ähnlichem Bereich

#### Erwartetes Ergebnis:
- ✅ Für jedes der Top 3 Länder werden Scores angezeigt für:
  - Lebenshaltungskosten
  - Visa-Prozess
  - Gesundheitssystem
  - Klima
  - Sicherheit
  - Steuer-Situation
  - Etc. (alle Kriterien aus Analyse)
- ✅ Scores sind visuell dargestellt (Progress Bar, Chart, etc.)
- ✅ Scores sind numerisch (0-100 oder 1-5)

#### Zu dokumentieren:
- [ ] Screenshot der Score-Darstellung
- [ ] Sind alle Kriterien vorhanden?
- [ ] Ist die Darstellung verständlich?

---

### TC 3.2.1: PDF-Vorschau (2 Seiten) wird angezeigt - FREE User

**Priorität:** 🔴 CRITICAL  
**Aufwand:** 5 Minuten

#### Voraussetzung:
- NICHT eingeloggt ODER FREE-User

#### Schritte:
1. Auf Ergebnis-Seite
2. Scrolle zu PDF-Vorschau Bereich

#### Erwartetes Ergebnis:
- ✅ PDF-Vorschau ist sichtbar
- ✅ Zeigt genau **2 Seiten** des PDFs
- ✅ Preview ist lesbar (nicht verpixelt)
- ✅ Badge "Vorschau - 2 von 25 Seiten" oder ähnlich

#### Zu prüfen:
- [ ] Sind die 2 Seiten sinnvoll gewählt? (z.B. Seite 1 + Inhaltsverzeichnis)
- [ ] Ist die Qualität gut?
- [ ] Ist es eine echte PDF-Preview oder Screenshot?

---

### TC 3.2.2: "Vollständiges PDF kaufen" Button funktioniert

**Priorität:** 🔴 CRITICAL  
**Aufwand:** 3 Minuten

#### Schritte:
1. Auf Ergebnis-Seite (als FREE-User)
2. Finde "Vollständiges PDF kaufen" Button (ca. 9,99€)
3. Klicke auf Button

#### Erwartetes Ergebnis:
- ✅ Redirect zu Stripe Checkout
- ✅ Preis wird korrekt angezeigt: 9,99€
- ✅ Produkt-Name: "Auswander-Analyse PDF - [Länder]"
- ✅ Stripe-Formular lädt ohne Fehler

#### NICHT kaufen (nur bis Checkout prüfen)

#### Bei Fehler:
- [ ] Bleibt auf derselben Seite?
- [ ] Console-Error?
- [ ] Button disabled?

---

### TC 3.2.3: FREE vs PRO Unterschiede sind sichtbar

**Priorität:** 🟡 MEDIUM  
**Aufwand:** 5 Minuten

#### Schritte:
1. Auf Ergebnis-Seite als FREE-User
2. Scrolle durch gesamte Seite

#### Erwartetes Ergebnis (FREE-User):
- ✅ PDF-Vorschau nur 2 Seiten
- ✅ "Vollständiges PDF kaufen" CTA sichtbar
- ✅ Evtl. "Mit PRO kostenlos" Badge

#### Dann:
3. Als PRO-User einloggen (oder PRO werden)
4. Ergebnis-Seite erneut aufrufen

#### Erwartetes Ergebnis (PRO-User):
- ✅ KEIN "PDF kaufen" Button
- ✅ "PDF herunterladen" Button stattdessen
- ✅ Evtl. zusätzliche PRO-Features sichtbar

---

## 🔴 EPIC 4: PAYMENT/STRIPE (8 Tests) - CRITICAL

### Voraussetzung
- [ ] Stripe Test-Modus aktiv
- [ ] Test-Kreditkarte: `4242 4242 4242 4242`
- [ ] Account erstellt (für Order-History)

---

### TC 4.1.1: Checkout-Seite lädt korrekt

**Priorität:** 🔴 CRITICAL  
**Aufwand:** 5 Minuten

#### Test A: PDF-Kauf (9,99€)
1. Auf Ergebnis-Seite
2. Klicke "Vollständiges PDF kaufen"
3. Warte auf Stripe Checkout

#### Erwartetes Ergebnis:
- ✅ Stripe Checkout öffnet (entweder embedded oder redirect)
- ✅ Produkt: "Auswander-Analyse PDF"
- ✅ Preis: 9,99€
- ✅ Kreditkarten-Formular lädt
- ✅ Stripe Logo sichtbar
- ✅ "Bezahlen" Button vorhanden

#### Test B: E-Book-Kauf (14,99€)
4. Navigiere zu /ebooks
5. Klicke "Kaufen" bei einem E-Book
6. Prüfe Checkout

#### Erwartetes Ergebnis:
- ✅ Korrekte E-Book-Details
- ✅ Korrekter Preis (14,99€, 19,99€, etc.)

#### Test C: PRO Subscription (14,99€/Monat)
7. Navigiere zu /pricing
8. Klicke "PRO werden"
9. Prüfe Checkout

#### Erwartetes Ergebnis:
- ✅ Produkt: "PRO Subscription"
- ✅ Preis: 14,99€/Monat oder 149,90€/Jahr
- ✅ Recurring-Badge: "Monatlich" oder "Jährlich"

---

### TC 4.1.2: Stripe Elements rendern korrekt

**Priorität:** 🔴 CRITICAL  
**Aufwand:** 3 Minuten

#### Schritte:
1. Im Stripe Checkout (von TC 4.1.1)
2. Inspiziere Formular-Felder

#### Erwartetes Ergebnis:
- ✅ Kreditkarten-Nummer Feld
- ✅ Ablaufdatum Feld (MM/YY)
- ✅ CVC Feld
- ✅ PLZ Feld (optional)
- ✅ Name auf Karte Feld
- ✅ Email-Feld (falls nicht eingeloggt)

#### Interaktions-Test:
- [ ] Klicke in Karten-Nummer Feld → Fokus funktioniert?
- [ ] Tippe "4242" → Zahlen erscheinen?
- [ ] Felder haben Placeholder-Text?

---

### TC 4.2.1: Erfolgreicher Kauf (Test-Karte)

**Priorität:** 🔴 CRITICAL  
**Aufwand:** 10 Minuten

#### Schritte:
1. Im Stripe Checkout (PDF-Kauf 9,99€)
2. Fülle Formular aus:
   - **Karten-Nr:** `4242 4242 4242 4242`
   - **Ablauf:** `12/34` (beliebig in Zukunft)
   - **CVC:** `123`
   - **Name:** `Test User`
   - **Email:** `test@example.com`
3. Klicke "Bezahlen" / "Pay"
4. Warte auf Bestätigung

#### Erwartetes Ergebnis:
- ✅ Payment wird verarbeitet (Loading-Spinner)
- ✅ Erfolgs-Meldung erscheint (Stripe oder eigene)
- ✅ Redirect zu Success-Page (z.B. `/success` oder `/dashboard`)
- ✅ URL-Parameter: `?session_id=...` (optional)

#### Dann:
5. Prüfe Success-Page

#### Erwartetes Ergebnis Success-Page:
- ✅ "Zahlung erfolgreich!" Nachricht
- ✅ Order-Details sichtbar (Produkt, Preis)
- ✅ "PDF herunterladen" Button (bei PDF-Kauf)
- ✅ "Zu meinem Dashboard" Link

#### Zu dokumentieren:
- [ ] Screenshot Success-Page
- [ ] Wie lange dauerte Payment? (in Sekunden)
- [ ] Gab es Verzögerungen?

---

### TC 4.2.2: Fehlgeschlagener Kauf (Declined Card)

**Priorität:** 🔴 CRITICAL  
**Aufwand:** 5 Minuten

#### Schritte:
1. Im Stripe Checkout
2. Fülle Formular aus mit:
   - **Karten-Nr:** `4000 0000 0000 0002` (Stripe Test-Karte: Declined)
   - **Ablauf:** `12/34`
   - **CVC:** `123`
3. Klicke "Bezahlen"

#### Erwartetes Ergebnis:
- ✅ Error-Nachricht erscheint: "Your card was declined"
- ✅ User bleibt auf Checkout-Page
- ✅ Kann es erneut versuchen
- ✅ KEIN Redirect zu Success-Page

#### Dann:
4. Wechsle zu korrekter Karte `4242 4242 4242 4242`
5. Versuche erneut

#### Erwartetes Ergebnis:
- ✅ Zweiter Versuch funktioniert
- ✅ Payment geht durch

---

### TC 4.2.3: Payment Requires Authentication (3D Secure)

**Priorität:** 🟡 MEDIUM  
**Aufwand:** 5 Minuten

#### Schritte:
1. Im Stripe Checkout
2. Verwende Test-Karte: `4000 0027 6000 3184` (Requires 3D Secure)
3. Klicke "Bezahlen"

#### Erwartetes Ergebnis:
- ✅ 3D Secure Modal öffnet
- ✅ "Complete" Button erscheint (Stripe Test-Mode)
- ✅ Nach "Complete": Payment erfolgreich
- ✅ Redirect zu Success-Page

#### Falls 3D Secure nicht implementiert:
- ⚠️ Payment schlägt fehl mit Error
- → Dokumentieren als Enhancement für später

---

### TC 4.3.1: Webhook-Verarbeitung

**Priorität:** 🔴 CRITICAL  
**Aufwand:** 10 Minuten

#### Voraussetzung:
- Zugriff auf Supabase Dashboard
- Zugriff auf Vercel Logs (optional)

#### Schritte:
1. Führe erfolgreichen Test-Kauf durch (TC 4.2.1)
2. Öffne Supabase Dashboard → DEV-Projekt
3. Navigiere zu:
   - Table Editor → `purchases` (oder ähnlich)
   - Table Editor → `users` → Prüfe user balance/credits

#### Erwartetes Ergebnis in DB:
- ✅ Neuer Eintrag in `purchases` Tabelle:
  - `user_id`: Korrekt
  - `product_id`: Korrekt (PDF / E-Book / PRO)
  - `amount`: 9.99 (oder entsprechend)
  - `status`: "completed" oder "success"
  - `stripe_payment_id`: Vorhanden
  - `created_at`: Aktuell
- ✅ Bei PRO-Subscription:
  - User `subscription_status`: "active"
  - User `subscription_tier`: "pro"
  - User `subscription_end_date`: +1 Monat oder +1 Jahr

#### Bei PDF-Kauf prüfen:
- ✅ `analysis_purchases` Tabelle:
  - `analysis_id`: Korrekt
  - `user_id`: Korrekt
  - `purchased_at`: Aktuell

#### Optional (Vercel Logs):
4. Öffne Vercel Dashboard → Project → Logs
5. Filtere nach "webhook" oder "stripe"
6. Prüfe Webhook-Calls der letzten 5 Minuten

#### Erwartetes Ergebnis:
- ✅ Webhook-Event erhalten: `checkout.session.completed`
- ✅ Status: 200 OK
- ✅ Keine Errors in Logs

---

### TC 4.3.2: Receipt-Email wird gesendet

**Priorität:** 🟡 MEDIUM  
**Aufwand:** 5 Minuten

#### Schritte:
1. Führe Test-Kauf durch mit echter Email (z.B. deiner eigenen)
2. Warte 1-2 Minuten
3. Prüfe Email-Inbox

#### Erwartetes Ergebnis:
- ✅ Email erhalten von Stripe (stripe@stripe.com)
- ✅ Betreff: "Receipt from [Auswanderer-App]" oder ähnlich
- ✅ Email enthält:
  - Order-Details
  - Preis
  - Produkt-Name
  - Datum
  - Receipt-PDF als Anhang (optional)

#### Falls KEINE Email:
- ⚠️ Prüfe Spam-Ordner
- ⚠️ Prüfe Stripe Dashboard → Settings → Emails → "Send receipt emails" aktiviert?

---

### TC 4.4.1: Cancel-Flow (bei Subscription)

**Priorität:** 🟡 MEDIUM  
**Aufwand:** 10 Minuten

#### Voraussetzung:
- PRO Subscription aktiv (aus TC 4.2.1)

#### Schritte:
1. Einloggen als PRO-User
2. Navigiere zu /dashboard oder /einstellungen
3. Finde "Subscription verwalten" oder ähnlichen Link
4. Klicke "Kündigen" oder "Cancel Subscription"

#### Erwartetes Ergebnis:
- ✅ Bestätigungs-Modal: "Möchtest du wirklich kündigen?"
- ✅ Info: "Du hast noch Zugriff bis [Datum]"
- ✅ Button: "Ja, kündigen" und "Abbrechen"

#### Dann:
5. Klicke "Ja, kündigen"

#### Erwartetes Ergebnis:
- ✅ Erfolgs-Nachricht: "Subscription gekündigt"
- ✅ Badge: "Läuft ab am [Datum]"
- ✅ KEIN sofortiger Zugriff-Verlust
- ✅ Nach Ablauf-Datum: Downgrade zu FREE

#### DB-Prüfung:
6. Supabase → `users` Tabelle
- ✅ `subscription_status`: "canceled" oder "active" (mit cancel_at_period_end)
- ✅ `subscription_end_date`: Bleibt bestehen

---

## 🔴 EPIC 5: PDF DOWNLOAD (4 Tests) - CRITICAL

### TC 5.1.1: PDF-Download nach Kauf (FREE User)

**Priorität:** 🔴 CRITICAL  
**Aufwand:** 10 Minuten

#### Schritte:
1. Als FREE-User: Führe komplette Analyse durch
2. Auf Ergebnis-Seite: Kaufe PDF (9,99€) via TC 4.2.1
3. Nach erfolgreichem Payment:
4. Klicke "PDF herunterladen" auf Success-Page

#### Erwartetes Ergebnis:
- ✅ Download startet sofort
- ✅ Dateiname: `auswander-analyse-[land]-[datum].pdf` oder ähnlich
- ✅ Dateigröße: ~1-5 MB (plausibel)
- ✅ Download abgeschlossen ohne Fehler

#### Dann:
5. Öffne PDF in PDF-Reader (Adobe, Browser, etc.)

#### Erwartetes Ergebnis PDF-Inhalt:
- ✅ PDF öffnet ohne Fehler (nicht korrupt)
- ✅ Genau **25 Seiten** (nicht 2!)
- ✅ Alle Seiten rendern korrekt
- ✅ Keine Platzhalter oder "[Missing Data]"

---

### TC 5.1.2: PDF-Inhalt ist korrekt und personalisiert

**Priorität:** 🔴 CRITICAL  
**Aufwand:** 15 Minuten

#### Schritte:
1. PDF geöffnet (aus TC 5.1.1)
2. Durchblättere alle 25 Seiten

#### Erwartetes Ergebnis - Seite 1 (Cover):
- ✅ Titel: "Deine persönliche Auswander-Analyse"
- ✅ Dein Name (falls angegeben)
- ✅ Datum der Analyse
- ✅ Logo/Branding

#### Erwartetes Ergebnis - Inhaltsverzeichnis:
- ✅ Alle Kapitel aufgelistet:
  1. Deine Top 3 Länder
  2. Detaillierte Bewertung
  3. Länder-Vergleich
  4. Visa-Informationen
  5. Lebenshaltungskosten
  6. Nächste Schritte
  7. Ressourcen

#### Erwartetes Ergebnis - Personalisierung:
- ✅ **Top 3 Länder:** Korrekte Länder aus Analyse
- ✅ **Scores:** Korrekte Zahlen aus Ergebnis-Seite
- ✅ **Antworten:** Deine Präferenzen integriert
- ✅ **Empfehlungen:** Basierend auf deinen Kriterien

#### Zu prüfen (Detail):
- [ ] Sind alle Tabellen korrekt formatiert?
- [ ] Sind alle Charts/Grafiken sichtbar?
- [ ] Sind Flaggen/Icons vorhanden?
- [ ] Ist die Typografie lesbar?
- [ ] Gibt es Text-Rendering-Probleme? (Bug #001 auch im PDF?)

#### Bei Fehlern dokumentieren:
- [ ] Screenshot der problematischen Seite
- [ ] Welche Daten fehlen?
- [ ] Welche Daten sind falsch?

---

### TC 5.2.1: PDF-Download mehrfach möglich

**Priorität:** 🟡 MEDIUM  
**Aufwand:** 3 Minuten

#### Schritte:
1. Nach TC 5.1.1 (PDF bereits heruntergeladen)
2. Navigiere zu /dashboard oder /meine-analysen
3. Finde die gekaufte Analyse
4. Klicke erneut "PDF herunterladen"

#### Erwartetes Ergebnis:
- ✅ Download startet erneut
- ✅ KEINE erneute Payment-Aufforderung
- ✅ Identisches PDF wie beim ersten Download

#### Dann:
5. Logout
6. Login erneut
7. Navigiere zu Dashboard
8. Klicke erneut "PDF herunterladen"

#### Erwartetes Ergebnis:
- ✅ Download funktioniert auch nach Re-Login
- ✅ Purchase-Status bleibt persistent

---

### TC 5.2.2: PRO-User: PDF ohne Kauf downloadbar

**Priorität:** 🔴 CRITICAL  
**Aufwand:** 10 Minuten

#### Voraussetzung:
- PRO Subscription aktiv

#### Schritte:
1. Als PRO-User einloggen
2. Führe neue Analyse durch (29 Fragen)
3. Auf Ergebnis-Seite angekommen

#### Erwartetes Ergebnis:
- ✅ KEIN "PDF kaufen" Button (9,99€)
- ✅ Stattdessen: "PDF herunterladen" Button (kostenlos für PRO)
- ✅ Badge: "Kostenlos mit PRO" oder ähnlich

#### Dann:
4. Klicke "PDF herunterladen"

#### Erwartetes Ergebnis:
- ✅ Download startet SOFORT (kein Checkout)
- ✅ PDF ist vollständig (25 Seiten)
- ✅ Identischer Inhalt wie gekauftes PDF

#### DB-Prüfung:
5. Supabase → `analysis_purchases` Tabelle

#### Erwartetes Ergebnis:
- ⚠️ KEIN Eintrag für diesen Download (da kostenlos)
- ODER
- ✅ Eintrag mit `amount: 0` und `source: "pro_subscription"`

---

## 🟡 EPIC 6: AUTH/LOGIN (8 verbleibende Tests) - MEDIUM

### TC 6.1.2: E-Mail Feld Validierung

**Priorität:** 🟡 MEDIUM  
**Aufwand:** 5 Minuten

#### Schritte:
1. Navigiere zu /login
2. Fülle Email-Feld mit UNGÜLTIGER Email:
   - `invalid` (kein @)
   - `test@` (kein Domain)
   - `@test.com` (kein Local-Part)

#### Erwartetes Ergebnis:
- ✅ Error-Nachricht: "Ungültige E-Mail-Adresse"
- ✅ "Magic Link senden" Button disabled ODER Error beim Klick
- ✅ Feld wird rot umrandet (Validation-Style)

#### Dann:
3. Fülle mit GÜLTIGER Email: `test@example.com`

#### Erwartetes Ergebnis:
- ✅ Keine Error-Nachricht
- ✅ Button wird enabled
- ✅ Feld normal/grün umrandet

---

### TC 6.1.4: Registrierung erstellt Account

**Priorität:** 🔴 CRITICAL  
**Aufwand:** 10 Minuten

#### Schritte:
1. Auf /login oder /register
2. Klicke "Du hast noch keinen Account? Registrieren"
3. Fülle Formular aus:
   - **Email:** `neuer-user-$(date).@example.com` (eindeutig)
   - **Name:** `Test User` (optional)
4. Klicke "Registrieren" oder "Magic Link senden"

#### Erwartetes Ergebnis:
- ✅ Erfolgs-Nachricht: "Magic Link gesendet an [email]"
- ✅ Info: "Prüfe dein Postfach"

#### Dann:
5. Prüfe Email-Inbox (echte Email verwenden!)
6. Öffne Email von Auswanderer-App / Supabase

#### Erwartetes Ergebnis Email:
- ✅ Betreff: "Bestätige deine Email-Adresse" oder ähnlich
- ✅ Magic Link vorhanden
- ✅ Link-Format: `https://auswanderer-app.vercel.app/auth/confirm?token=...`

#### Dann:
7. Klicke Magic Link

#### Erwartetes Ergebnis:
- ✅ Redirect zu App
- ✅ User ist eingeloggt
- ✅ Redirect zu /dashboard oder /analyse

#### DB-Prüfung:
8. Supabase → Auth → Users

#### Erwartetes Ergebnis:
- ✅ Neuer User in Liste
- ✅ Email korrekt
- ✅ `email_confirmed_at`: Timestamp gesetzt
- ✅ `last_sign_in_at`: Aktuell

---

### TC 6.2.1: Login mit gültigen Credentials (Magic Link)

**Priorität:** 🔴 CRITICAL  
**Aufwand:** 10 Minuten

#### Voraussetzung:
- Account existiert (aus TC 6.1.4)

#### Schritte:
1. Logout (falls eingeloggt)
2. Navigiere zu /login
3. Fülle Email ein (existierender Account)
4. Klicke "Magic Link senden"

#### Erwartetes Ergebnis:
- ✅ Erfolgs-Nachricht: "Magic Link gesendet"

#### Dann:
5. Prüfe Email
6. Klicke Magic Link

#### Erwartetes Ergebnis:
- ✅ User ist eingeloggt
- ✅ Redirect zu /dashboard
- ✅ User-Name wird angezeigt (in Header/Nav)

---

### TC 6.2.2: Login mit falscher Email (nicht existent)

**Priorität:** 🟡 MEDIUM  
**Aufwand:** 3 Minuten

#### Schritte:
1. Auf /login
2. Fülle Email: `does-not-exist@example.com`
3. Klicke "Magic Link senden"

#### Erwartetes Ergebnis (2 Optionen):

**Option A (Secure):**
- ✅ Erfolgs-Nachricht: "Magic Link gesendet" (fake, aus Security-Gründen)
- ✅ Aber: Keine Email kommt an
- ✅ User kann nicht unterscheiden ob Account existiert

**Option B (User-Friendly):**
- ✅ Error: "Kein Account mit dieser Email gefunden"
- ✅ Link: "Jetzt registrieren"

#### Beide Optionen sind OK - dokumentiere welche implementiert ist.

---

### TC 6.2.4: Session-Persistenz nach Page-Reload

**Priorität:** 🟡 MEDIUM  
**Aufwand:** 3 Minuten

#### Schritte:
1. Login (aus TC 6.2.1)
2. Auf /dashboard
3. Reload Page (F5 oder Strg+R)

#### Erwartetes Ergebnis:
- ✅ User bleibt eingeloggt
- ✅ Dashboard lädt korrekt
- ✅ KEIN Redirect zu /login

#### Dann:
4. Navigiere zu /analyse
5. Reload Page

#### Erwartetes Ergebnis:
- ✅ User bleibt eingeloggt
- ✅ Keine Session-Loss

---

### TC 6.2.5: Logout funktioniert

**Priorität:** 🟡 MEDIUM  
**Aufwand:** 3 Minuten

#### Schritte:
1. Eingeloggt als User
2. Finde "Logout" oder "Abmelden" Link (Header/User-Menu)
3. Klicke "Logout"

#### Erwartetes Ergebnis:
- ✅ Redirect zu / (Landing Page) oder /login
- ✅ User-Name verschwindet aus Header
- ✅ "Login" Link ist wieder sichtbar

#### Dann:
4. Versuche /dashboard zu öffnen

#### Erwartetes Ergebnis:
- ✅ Redirect zu /login (Auth-Gate funktioniert)

---

### TC 6.3.1: Session-Timeout nach 24h (optional)

**Priorität:** 🟢 LOW  
**Aufwand:** N/A (nicht praktisch testbar)

#### Konzept-Prüfung:
- [ ] Prüfe Code: Ist Session-Timeout konfiguriert?
- [ ] Supabase Dashboard → Auth → Settings → JWT Expiry
- [ ] Erwarteter Wert: 24 Stunden oder weniger

**Manueller Test würde 24h dauern - überspringen für jetzt.**

---

## 🟡 EPIC 7: E-BOOKS (12 verbleibende Tests) - MEDIUM

### TC 7.2.1: E-Book Checkout lädt (Stripe)

**Priorität:** 🔴 CRITICAL  
**Aufwand:** 5 Minuten pro E-Book

#### Schritte:
1. Navigiere zu /ebooks
2. Wähle "Der komplette Auswanderer-Guide" (29,99€)
3. Klicke "Kaufen"

#### Erwartetes Ergebnis:
- ✅ Stripe Checkout öffnet
- ✅ Produkt: "Der komplette Auswanderer-Guide"
- ✅ Preis: 29,99€
- ✅ Beschreibung sichtbar

#### Wiederhole für alle E-Books:
- [ ] Quick Start Guide (14,99€)
- [ ] Tipps & Tricks (19,99€)
- [ ] Auswandern für Dummies (24,99€)
- [ ] Bundle (62,49€)

---

### TC 7.2.2: E-Book Kauf erfolgreich

**Priorität:** 🔴 CRITICAL  
**Aufwand:** 10 Minuten

#### Schritte:
1. Im E-Book Checkout (aus TC 7.2.1)
2. Fülle Stripe-Formular (Karte: `4242 4242 4242 4242`)
3. Bezahle

#### Erwartetes Ergebnis:
- ✅ Payment erfolgreich
- ✅ Redirect zu Success-Page
- ✅ "E-Book herunterladen" Button

---

### TC 7.2.3: E-Book Download nach Kauf

**Priorität:** 🔴 CRITICAL  
**Aufwand:** 10 Minuten

#### Schritte:
1. Nach erfolgreichem Kauf (TC 7.2.2)
2. Klicke "E-Book herunterladen"

#### Erwartetes Ergebnis:
- ✅ Download startet
- ✅ Dateiname: `auswanderer-guide.pdf` oder ähnlich
- ✅ Dateigröße: ~5-20 MB (plausibel)
- ✅ PDF öffnet korrekt
- ✅ Seitenzahl stimmt (z.B. 250 Seiten für Guide)

---

### TC 7.3.1: PRO-User: Alle E-Books kostenlos

**Priorität:** 🔴 CRITICAL  
**Aufwand:** 10 Minuten

#### Voraussetzung:
- PRO Subscription aktiv

#### Schritte:
1. Als PRO-User einloggen
2. Navigiere zu /ebooks

#### Erwartetes Ergebnis:
- ✅ KEINE "Kaufen" Buttons (14,99€, etc.)
- ✅ Stattdessen: "Herunterladen" Buttons (kostenlos)
- ✅ Badge: "Kostenlos mit PRO" oder "✓ In PRO enthalten"

#### Dann:
3. Klicke "Herunterladen" bei beliebigem E-Book

#### Erwartetes Ergebnis:
- ✅ Download startet SOFORT (kein Checkout)
- ✅ PDF ist vollständig

#### Wiederhole für alle 4 E-Books:
- [ ] Kompletter Guide
- [ ] Quick Start
- [ ] Tipps & Tricks
- [ ] Für Dummies

---

### TC 7.3.2: Bundle-Kauf

**Priorität:** 🟡 MEDIUM  
**Aufwand:** 10 Minuten

#### Schritte:
1. Als FREE-User auf /ebooks
2. Scrolle zu "Bundle-Angebot"
3. Klicke "Bundle kaufen" (62,49€)

#### Erwartetes Ergebnis Checkout:
- ✅ Produkt: "E-Books Bundle - Alle 4 E-Books"
- ✅ Preis: 62,49€
- ✅ Info: "Spare 31% (statt 89,96€)"

#### Nach Kauf:
4. Prüfe Dashboard oder "Meine E-Books"

#### Erwartetes Ergebnis:
- ✅ ALLE 4 E-Books sind verfügbar zum Download
- ✅ Jedes einzeln downloadbar

---

## 🟡 EPIC 8: PRO SUBSCRIPTION (23 verbleibende Tests) - MEDIUM

### TC 8.1.6: PRO Features werden korrekt angezeigt

**Priorität:** 🟡 MEDIUM  
**Aufwand:** 10 Minuten

#### Schritte:
1. Auf /pricing
2. Scrolle durch FREE vs PRO Vergleich

#### Erwartetes Ergebnis - FREE Tier zeigt:
- ✅ 1 Analyse pro Account
- ✅ PDF-Vorschau (2 Seiten)
- ✅ Top 3 Länder-Empfehlungen
- ✅ Basis-Kriterien

#### Erwartetes Ergebnis - PRO Tier zeigt:
- ✅ **Unbegrenzte Analysen**
- ✅ **Alle PDFs vollständig** (25 Seiten)
- ✅ **Alle E-Books kostenlos**
- ✅ **Projekt-Dashboard:**
  - Checklisten-System
  - Meilenstein-Tracker
  - Personalisierte Timeline
  - Kosten-Tracker
  - Länder-Vergleich (bis zu 5)
  - Visa-Navigator
  - Kosten-Rechner Live
  - Basis-Support
- ✅ **NEU-Badge** bei kommenden Features

#### Prüfe visuell:
- [ ] Ist der Unterschied klar?
- [ ] Ist PRO attraktiv dargestellt?
- [ ] Sind alle Features verständlich beschrieben?

---

### TC 8.2.1: PRO Subscription Checkout (Monthly)

**Priorität:** 🔴 CRITICAL  
**Aufwand:** 10 Minuten

#### Schritte:
1. Auf /pricing
2. Toggle auf "Monatlich"
3. Klicke "PRO werden ⭐" bei PRO Tier

#### Erwartetes Ergebnis Checkout:
- ✅ Produkt: "PRO Subscription - Monatlich"
- ✅ Preis: 14,99€/Monat
- ✅ Recurring: "Monatlich" Badge
- ✅ Info: "Jederzeit kündbar"

#### Kauf durchführen:
4. Fülle Stripe-Formular (Karte: `4242 4242 4242 4242`)
5. Bezahle

#### Erwartetes Ergebnis:
- ✅ Payment erfolgreich
- ✅ Redirect zu Dashboard mit PRO-Badge
- ✅ Erfolgs-Nachricht: "Willkommen bei PRO!"

---

### TC 8.2.2: PRO Subscription Checkout (Yearly)

**Priorität:** 🔴 CRITICAL  
**Aufwand:** 10 Minuten

#### Schritte:
1. Auf /pricing
2. Toggle auf "Jährlich"
3. Klicke "PRO werden ⭐"

#### Erwartetes Ergebnis Checkout:
- ✅ Produkt: "PRO Subscription - Jährlich"
- ✅ Preis: 149,90€/Jahr
- ✅ Info: "12,49€/Monat - 2 Monate gratis!"
- ✅ Recurring: "Jährlich" Badge

#### Nach Kauf:
4. Prüfe User-Profile im Dashboard

#### Erwartetes Ergebnis:
- ✅ Badge: "PRO (Jährlich)"
- ✅ Nächste Zahlung: In 1 Jahr (Datum anzeigen)

---

### TC 8.3.1: PRO-Only Fragen im Analyse-Flow

**Priorität:** 🟡 MEDIUM  
**Aufwand:** 15 Minuten

#### Test A: Als FREE-User
1. Starte Analyse als FREE-User
2. Beantworte alle 29 Fragen

#### Erwartetes Ergebnis:
- ✅ Nur "Basic" Fragen werden gezeigt
- ✅ KEINE PRO-Only Fragen (falls implementiert)

#### Test B: Als PRO-User
3. Starte Analyse als PRO-User
4. Beantworte alle Fragen

#### Erwartetes Ergebnis (falls PRO-Fragen existieren):
- ✅ Zusätzliche PRO-Only Fragen erscheinen
- ✅ Badge: "PRO" bei diesen Fragen
- ✅ Insgesamt mehr als 29 Fragen

#### Falls KEINE PRO-Only Fragen:
- ⚠️ Dokumentieren: Feature nicht implementiert (ok)

---

### TC 8.3.2: Analyse-Limit für FREE-User

**Priorität:** 🔴 CRITICAL  
**Aufwand:** 20 Minuten

#### Schritte:
1. Als FREE-User einloggen
2. Führe komplette Analyse durch (29 Fragen)
3. Komme zur Ergebnis-Seite
4. Navigiere zurück zu /analyse
5. Versuche ZWEITE Analyse zu starten

#### Erwartetes Ergebnis:
- ❌ Modal oder Blocker erscheint:
  - "Du hast dein Analyse-Limit erreicht (1/1)"
  - "Upgrade zu PRO für unbegrenzte Analysen"
  - Button: "Jetzt upgraden"

#### Alternative (weniger restriktiv):
- ✅ Analyse startet, aber am Ende:
  - "Als FREE-User kannst du nur 1 Analyse sehen"
  - "Upgrade für mehr Analysen"

#### Dann:
6. Upgrade zu PRO (oder einloggen als PRO-User)
7. Versuche erneut neue Analyse

#### Erwartetes Ergebnis:
- ✅ Analyse startet ohne Blocker
- ✅ Unbegrenzte Analysen möglich

---

### TC 8.4.1: PRO Dashboard - Roadmap-Features

**Priorität:** 🟡 MEDIUM  
**Aufwand:** 15 Minuten

#### Voraussetzung:
- PRO Subscription aktiv

#### Schritte:
1. Als PRO-User einloggen
2. Navigiere zu /dashboard oder /roadmap

#### Erwartetes Ergebnis - Dashboard zeigt:
- ✅ **Checklisten-System:**
  - Visa-Checkliste
  - Umzugs-Checkliste
  - Finanz-Checkliste
- ✅ **Meilenstein-Tracker:**
  - Fortschrittsbalken
  - Completed/Total Milestones
- ✅ **Personalisierte Timeline:**
  - Nächste Schritte
  - Deadlines
- ✅ **Kosten-Tracker:**
  - Geschätzte Kosten
  - Tatsächliche Kosten
  - Budget-Übersicht
- ✅ **Länder-Vergleich:**
  - Bis zu 5 Länder vergleichen
  - Side-by-Side Darstellung
- ✅ **Visa-Navigator:**
  - Visa-Typen für Zielland
  - Requirements
  - Prozess-Schritte
- ✅ **Kosten-Rechner Live:**
  - Interaktiver Rechner
  - Lebenshaltungskosten
  - Umzugskosten

#### Falls Features fehlen:
- ⚠️ Dokumentieren: "Coming Soon" Badge?
- ⚠️ Oder: Feature noch nicht implementiert

---

### TC 8.4.2: Subscription-Management

**Priorität:** 🟡 MEDIUM  
**Aufwand:** 10 Minuten

#### Schritte:
1. Als PRO-User einloggen
2. Navigiere zu /einstellungen oder /subscription

#### Erwartetes Ergebnis - Seite zeigt:
- ✅ Aktueller Plan: "PRO - Monatlich" oder "PRO - Jährlich"
- ✅ Preis: 14,99€/Monat oder 149,90€/Jahr
- ✅ Nächste Zahlung: [Datum]
- ✅ Status: "Aktiv" (grüner Badge)
- ✅ Buttons:
  - "Plan wechseln" (Monthly ↔ Yearly)
  - "Kündigen"
  - "Zahlungsmethode ändern"

#### Funktions-Test:
3. Klicke "Zahlungsmethode ändern"

#### Erwartetes Ergebnis:
- ✅ Redirect zu Stripe Customer Portal
- ✅ Kann Karte updaten

---

## 🟢 EPIC 10: ADMIN DASHBOARD (18 verbleibende Tests) - LOW

### TC 10.2.1: Admin Dashboard lädt nach Login

**Priorität:** 🟡 MEDIUM  
**Aufwand:** 10 Minuten

#### Voraussetzung:
- Admin-Credentials vorhanden

#### Schritte:
1. Navigiere zu /admin-login
2. Login mit Admin-Credentials:
   - Email: [von Martin erfragen]
   - Passwort: [von Martin erfragen]
3. Klicke "Login"

#### Erwartetes Ergebnis:
- ✅ Redirect zu /admin (Admin Dashboard)
- ✅ Dashboard lädt ohne Fehler

#### Erwartetes Ergebnis - Dashboard zeigt:
- ✅ **Statistiken-Overview:**
  - Total Users
  - PRO Users
  - FREE Users
  - Total Analysen
  - Total Revenue
  - Total E-Book Sales
- ✅ **Navigation:**
  - Users
  - Analysen
  - Payments
  - E-Books
  - Content Management
  - Settings
  - Logout

---

### TC 10.3.1: Analytics werden angezeigt

**Priorität:** 🟡 MEDIUM  
**Aufwand:** 10 Minuten

#### Schritte:
1. Im Admin Dashboard (nach TC 10.2.1)
2. Prüfe Analytics-Bereich

#### Erwartetes Ergebnis - Charts/Grafiken:
- ✅ **User Growth Chart:**
  - X-Achse: Datum
  - Y-Achse: User-Anzahl
  - Linie zeigt Wachstum
- ✅ **Revenue Chart:**
  - Monatlicher Revenue
  - Aufschlüsselung: PRO Subscriptions vs E-Books vs PDFs
- ✅ **Conversion Funnel:**
  - Landing Page Views
  - Analyse Started
  - Analyse Completed
  - PDF Purchased
  - PRO Subscribed
- ✅ **Top Countries:**
  - Welche Länder werden am häufigsten empfohlen?
  - Ranking mit Anzahl

---

### TC 10.4.1: User-Management

**Priorität:** 🟡 MEDIUM  
**Aufwand:** 10 Minuten

#### Schritte:
1. Im Admin Dashboard
2. Navigiere zu "Users" oder "Benutzer-Verwaltung"

#### Erwartetes Ergebnis - User-Liste zeigt:
- ✅ Tabelle mit allen Usern:
  - User ID
  - Email
  - Name (optional)
  - Subscription: FREE/PRO
  - Registered: Datum
  - Last Login: Datum
  - Status: Active/Inactive
- ✅ Pagination (falls > 50 Users)
- ✅ Suche/Filter:
  - Nach Email
  - Nach Subscription-Tier
  - Nach Datum

#### Funktions-Test:
3. Klicke auf einen User

#### Erwartetes Ergebnis - User-Detail-Seite:
- ✅ User-Infos:
  - Email, Name, ID
  - Subscription Details
  - Analysen-Historie
  - Purchases-Historie
- ✅ Admin-Actions:
  - "Upgrade zu PRO" (manuell)
  - "Downgrade zu FREE"
  - "User deaktivieren"
  - "User löschen" (DSGVO)

---

### TC 10.5.1: Payment-Übersicht

**Priorität:** 🟡 MEDIUM  
**Aufwand:** 10 Minuten

#### Schritte:
1. Im Admin Dashboard
2. Navigiere zu "Payments" oder "Zahlungen"

#### Erwartetes Ergebnis - Payment-Liste zeigt:
- ✅ Tabelle mit allen Payments:
  - Payment ID
  - User Email
  - Produkt: PDF / E-Book / PRO Subscription
  - Amount: 9,99€ / 14,99€ / etc.
  - Status: Success / Failed / Pending
  - Date: Timestamp
  - Stripe Payment ID
- ✅ Filter:
  - Nach Produkt-Typ
  - Nach Status
  - Nach Datum-Range
- ✅ Total Revenue (Summe)

---

### TC 10.6.1: Content-Management (optional)

**Priorität:** 🟢 LOW  
**Aufwand:** 15 Minuten

#### Schritte:
1. Im Admin Dashboard
2. Navigiere zu "Content" oder "Inhalte verwalten"

#### Erwartetes Ergebnis (falls implementiert):
- ✅ **E-Books verwalten:**
  - Titel bearbeiten
  - Preis ändern
  - PDF austauschen
  - E-Book aktivieren/deaktivieren
- ✅ **FAQ bearbeiten:**
  - Fragen hinzufügen/löschen
  - Antworten bearbeiten
- ✅ **Fragen-Katalog bearbeiten:**
  - Analyse-Fragen anpassen
  - Neue Fragen hinzufügen
  - Gewichtungen ändern

#### Falls nicht implementiert:
- ⚠️ Dokumentieren: Feature fehlt (ok für MVP)

---

## 📊 TEST-TRACKING

### Verwende diese Checkliste beim Testen:

Für jeden Test:
- [ ] Test-ID notieren (z.B. TC 3.1.1)
- [ ] Schritte befolgen
- [ ] Ergebnis dokumentieren:
  - ✅ PASS: Alles funktioniert wie erwartet
  - ❌ FAIL: Fehler gefunden → Bug-Report erstellen
  - ~️ PARTIAL: Funktioniert teilweise
  - ⚪ SKIP: Nicht getestet (Grund notieren)
- [ ] Screenshot machen (bei PASS und FAIL)
- [ ] Notizen machen (Besonderheiten, Edge Cases)

### Nach jedem Test-Block:
- [ ] Ergebnisse in `testplan-komplett.md` eintragen
- [ ] Bugs in `bug-tracker` eintragen (mit Bug-ID)
- [ ] Screenshots speichern in `test-reports/screenshots/`

---

## 🐛 BUG-REPORT TEMPLATE

Wenn du einen Bug findest:

```markdown
## Bug #[ID]: [Kurztitel]

**Severity:** 🔴 Critical / 🟡 Medium / 🟢 Low
**Epic:** [Epic-Nummer]
**Test Case:** TC X.X.X

### Beschreibung
[Was ist das Problem?]

### Schritte zum Reproduzieren
1. [Schritt 1]
2. [Schritt 2]
3. [Schritt 3]

### Erwartetes Verhalten
[Was sollte passieren?]

### Tatsächliches Verhalten
[Was passiert stattdessen?]

### Screenshots
- `bug-[id]-[beschreibung].png`

### Umgebung
- Browser: [Chrome/Firefox/Safari]
- OS: [Windows/Mac/Linux]
- URL: [betroffene URL]

### Console-Errors
```
[Console-Log hier einfügen]
```

### Vorgeschlagener Fix
[Optional: Idee wie es behoben werden könnte]
```

---

## 📁 ORDNERSTRUKTUR FÜR TEST-ERGEBNISSE

```
_bmad-output/implementation-artifacts/test-reports/
├── screenshots/
│   ├── TC-3.1.1-ergebnis-seite.png
│   ├── TC-4.2.1-payment-success.png
│   ├── TC-5.1.2-pdf-content.png
│   └── bug-002-payment-error.png
├── videos/ (optional)
│   └── TC-8.2.1-pro-checkout-full-flow.mp4
├── test-results/
│   ├── epic-3-ergebnis-preview.md
│   ├── epic-4-payment.md
│   ├── epic-5-pdf-download.md
│   ├── epic-6-auth-extended.md
│   ├── epic-7-ebooks-extended.md
│   ├── epic-8-pro-extended.md
│   └── epic-10-admin-extended.md
└── bug-reports/
    ├── bug-002-[titel].md
    ├── bug-003-[titel].md
    └── ...
```

---

## 🎯 PRIORITÄTEN FÜR TESTING

### 🔴 MUST TEST BEFORE LAUNCH (Critical)

1. **Epic 3: Ergebnis Preview** (6 Tests)
   - ⏱️ Aufwand: 30 Minuten
   - 💥 Impact: HOCH - Core User Journey

2. **Epic 4: Payment/Stripe** (8 Tests)
   - ⏱️ Aufwand: 60 Minuten
   - 💥 Impact: SEHR HOCH - Revenue-kritisch

3. **Epic 5: PDF Download** (4 Tests)
   - ⏱️ Aufwand: 45 Minuten
   - 💥 Impact: HOCH - Produkt-Delivery

4. **Epic 6: Auth erweitert** (3-4 Tests)
   - ⏱️ Aufwand: 30 Minuten
   - 💥 Impact: HOCH - User-Registrierung

**Total MUST-TEST: ~3 Stunden**

---

### 🟡 SHOULD TEST BEFORE LAUNCH (Medium)

5. **Epic 7: E-Books erweitert** (4-5 Tests)
   - ⏱️ Aufwand: 45 Minuten
   - 💥 Impact: MITTEL - Zusatz-Revenue

6. **Epic 8: PRO Subscription erweitert** (5-6 Tests)
   - ⏱️ Aufwand: 60 Minuten
   - 💥 Impact: HOCH - Hauptprodukt

**Total SHOULD-TEST: ~2 Stunden**

---

### 🟢 NICE TO TEST AFTER LAUNCH (Low)

7. **Epic 10: Admin Dashboard** (10+ Tests)
   - ⏱️ Aufwand: 90 Minuten
   - 💥 Impact: NIEDRIG - Intern

8. **Epic 6/7/8: Edge Cases** (5-10 Tests)
   - ⏱️ Aufwand: 60 Minuten
   - 💥 Impact: NIEDRIG - Polishing

**Total NICE-TO-TEST: ~2,5 Stunden**

---

## ⏱️ GESAMT-ZEITSCHÄTZUNG

| Priorität | Tests | Aufwand | Kumulativ |
|-----------|-------|---------|-----------|
| 🔴 MUST | 21 | 3h | 3h |
| 🟡 SHOULD | 10 | 2h | 5h |
| 🟢 NICE | 20+ | 2,5h | 7,5h |
| **TOTAL** | **76** | **7,5h** | |

**Realistische Timeline:**
- **Tag 1:** MUST-Tests (3h) + Bug-Fixes
- **Tag 2:** SHOULD-Tests (2h) + Retests
- **Tag 3:** NICE-Tests (2,5h) + Polishing
- **Tag 4:** Final-Review + Launch 🚀

---

## ✅ ERFOLGS-KRITERIEN

### Minimum für Launch:
- ✅ Alle 🔴 MUST-Tests bestanden (21 Tests)
- ✅ Bug #001 (Text-Rendering) behoben
- ✅ Payment-Flow funktioniert Ende-zu-Ende
- ✅ PDF-Download funktioniert für FREE + PRO
- ✅ Keine Console-Errors in Production

### Ideal für Launch:
- ✅ Alle 🔴 + 🟡 Tests bestanden (31 Tests)
- ✅ Cross-Browser getestet (Chrome, Firefox, Safari)
- ✅ Mobile-View validiert
- ✅ Performance optimiert (Lighthouse 90+)

---

## 📞 SUPPORT & FRAGEN

Bei Fragen oder Unklarheiten während des Testens:

1. **Technische Fragen:** @amelia (Developer)
2. **Test-Strategie:** @tina (QA)
3. **Business-Entscheidungen:** @steve (CEO)
4. **Admin-Credentials:** @martin (Product Owner)

---

**Erstellt von:** Tina - QA Tester Agent 🧪  
**Datum:** 2026-01-21  
**Version:** 1.0  
**Status:** Ready for Manual Testing

**Nächster Schritt:** 👉 Wähle ein Test-Szenario und leg los! Viel Erfolg! 🚀

