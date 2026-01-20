# Test Plan - Auswanderer-Plattform

**Version:** 1.0  
**Erstellt:** 2026-01-20  
**Projekt:** Auswanderer-Plattform

---

## 1. Test-Umgebungen

| Umgebung | URL | Supabase | Stripe |
|----------|-----|----------|--------|
| **Lokal** | http://localhost:3000 | DEV | Test |
| **Vercel (Preview)** | https://auswanderer-app.vercel.app | DEV | Test |
| **VPS (Production)** | http://64.112.127.175 | DEV* | Test* |
| **Live** | https://auswander-profi.de | PROD | Live |

*Nach Go-Live auf PROD/Live umstellen

---

## 2. Test-Kategorien

### 2.1 Smoke Tests (Kritisch - vor jedem Deploy)

| ID | Test | Erwartetes Ergebnis | Priorität |
|----|------|---------------------|-----------|
| S1 | Landing Page laden | Alle Sektionen sichtbar | 🔴 Critical |
| S2 | Navigation funktioniert | Alle Links erreichbar | 🔴 Critical |
| S3 | Analyse starten | Fragen werden angezeigt | 🔴 Critical |
| S4 | Login möglich | Auth-Flow funktioniert | 🔴 Critical |
| S5 | Stripe Checkout | Redirect zu Stripe | 🔴 Critical |

### 2.2 Funktionale Tests

#### 2.2.1 Analyse-Flow

| ID | Test | Schritte | Erwartetes Ergebnis |
|----|------|----------|---------------------|
| A1 | Pre-Analyse starten | /analyse öffnen | Willkommens-Screen |
| A2 | Fragen beantworten | Alle 5 Pre-Fragen | Weiter zu Rating |
| A3 | Rating abgeben | Alle Kriterien bewerten | Mindestens 1-5 Sterne |
| A4 | Analyse absenden | Submit klicken | Loading Animation |
| A5 | Teaser anzeigen | Nach Analyse | Top-Land (geblockt) |
| A6 | CTA sichtbar | Teaser-Seite | "Analyse freischalten" Button |

#### 2.2.2 Payment-Flow

| ID | Test | Schritte | Erwartetes Ergebnis |
|----|------|----------|---------------------|
| P1 | Checkout starten | CTA klicken | Stripe Checkout öffnet |
| P2 | Test-Zahlung | Karte 4242... | Erfolgreiche Zahlung |
| P3 | Success-Page | Nach Zahlung | Redirect zu /checkout/success |
| P4 | PDF Download | Button klicken | PDF wird heruntergeladen |
| P5 | Webhook | Stripe Event | Analyse als "paid" markiert |

**Stripe Test-Karten:**
- Erfolg: `4242 4242 4242 4242`
- Declined: `4000 0000 0000 0002`
- 3D Secure: `4000 0025 0000 3155`

#### 2.2.3 Authentifizierung

| ID | Test | Schritte | Erwartetes Ergebnis |
|----|------|----------|---------------------|
| AU1 | Registrierung | Email + Passwort | Magic Link oder Bestätigung |
| AU2 | Login | Credentials eingeben | Redirect zu Dashboard |
| AU3 | Logout | Button klicken | Zurück zur Landing |
| AU4 | Password Reset | "Passwort vergessen" | Reset-Email erhalten |
| AU5 | Session persist | Browser schließen/öffnen | Noch eingeloggt |

#### 2.2.4 Dashboard

| ID | Test | Schritte | Erwartetes Ergebnis |
|----|------|----------|---------------------|
| D1 | Dashboard laden | /dashboard öffnen | Eigene Analysen sichtbar |
| D2 | Analyse Details | Analyse klicken | Details anzeigen |
| D3 | PDF erneut laden | Download-Button | PDF verfügbar |
| D4 | Keine Analyse | Neuer User | Leerer State |

#### 2.2.5 Admin Dashboard

| ID | Test | Schritte | Erwartetes Ergebnis |
|----|------|----------|---------------------|
| AD1 | Admin Login | /admin-login | Login-Formular |
| AD2 | Dashboard | Nach Login | Analytics sichtbar |
| AD3 | User Management | Tab öffnen | User-Liste |
| AD4 | User löschen | DSGVO-Löschung | User + Daten weg |
| AD5 | Price Management | Tab öffnen | Preise anzeigen |
| AD6 | Discount erstellen | Formular ausfüllen | Code aktiv |
| AD7 | Newsletter Export | CSV/JSON | Datei download |

### 2.3 E2E Test-Szenarien

#### Szenario 1: Neuer Besucher kauft Analyse

```
1. Landing Page besuchen
2. "Jetzt starten" klicken
3. Pre-Analyse Fragen beantworten
4. Kriterien bewerten (alle 5 Sterne)
5. Analyse absenden
6. Teaser-Seite sehen
7. "Analyse freischalten" klicken
8. Stripe Checkout abschließen (Test-Karte)
9. Success-Page sehen
10. PDF herunterladen
11. Account erstellen
12. Dashboard - Analyse ist da
```

#### Szenario 2: Wiederkehrender User

```
1. Login
2. Dashboard öffnen
3. Vorherige Analyse sehen
4. PDF erneut herunterladen
5. Neue Analyse starten
6. Durchführen + Kaufen
7. Dashboard zeigt 2 Analysen
```

#### Szenario 3: Admin DSGVO-Löschung

```
1. Admin Login
2. User Management öffnen
3. User suchen
4. "Daten exportieren" - JSON erhalten
5. "User löschen" - Bestätigung
6. User existiert nicht mehr
7. User-Analysen gelöscht
```

---

## 3. Nicht-funktionale Tests

### 3.1 Performance

| Metrik | Ziel | Tool |
|--------|------|------|
| First Contentful Paint | < 1.5s | Lighthouse |
| Largest Contentful Paint | < 2.5s | Lighthouse |
| Time to Interactive | < 3.5s | Lighthouse |
| Cumulative Layout Shift | < 0.1 | Lighthouse |
| Lighthouse Score | > 90 | Chrome DevTools |

### 3.2 Security

| Test | Erwartetes Ergebnis | Tool |
|------|---------------------|------|
| SSL Rating | A oder A+ | ssllabs.com |
| Security Headers | Alle gesetzt | securityheaders.com |
| XSS Prevention | Keine Vulnerabilities | OWASP ZAP |
| CORS | Nur erlaubte Origins | Manual |

### 3.3 Responsive Design

| Breakpoint | Auflösung | Zu testen |
|------------|-----------|-----------|
| Mobile S | 320px | Alle Pages |
| Mobile M | 375px | Alle Pages |
| Mobile L | 425px | Alle Pages |
| Tablet | 768px | Alle Pages |
| Laptop | 1024px | Alle Pages |
| Desktop | 1440px | Alle Pages |

---

## 4. Test-Daten

### Test-User

| Rolle | Email | Passwort |
|-------|-------|----------|
| Normal User | test@example.com | TestPassword123! |
| Admin | admin@auswander-profi.de | [Sicher speichern] |

### Test-Analyse

Für konsistente Tests, verwende diese Antworten:
- Pre-Fragen: Alle Option 2
- Rating: Alle 4 Sterne
- Erwartetes Ergebnis: Portugal oder Spanien Top-Match

---

## 5. Bug Reporting Template

```markdown
## Bug Report

**Titel:** [Kurze Beschreibung]

**Umgebung:** [Lokal/Vercel/VPS/Live]
**Browser:** [Chrome/Firefox/Safari + Version]
**Device:** [Desktop/Mobile + OS]

**Schritte zur Reproduktion:**
1. 
2. 
3. 

**Erwartetes Ergebnis:**

**Tatsächliches Ergebnis:**

**Screenshots/Videos:**

**Console Errors:**
```

**Priorität:**
- 🔴 Critical: Blocker, kein Workaround
- 🟠 High: Wichtige Funktion beeinträchtigt
- 🟡 Medium: Workaround vorhanden
- 🟢 Low: Kosmetisch/Minor

---

## 6. Test-Ausführung

### Pre-Deploy (Entwickler)

- [ ] Alle Smoke Tests (S1-S5)
- [ ] Betroffene funktionale Tests
- [ ] Console-Errors prüfen

### Pre-Release (QA)

- [ ] Alle Smoke Tests
- [ ] Alle funktionalen Tests
- [ ] E2E Szenarien 1-3
- [ ] Responsive auf 3 Devices
- [ ] Performance Check

### Post-Deploy (Production)

- [ ] Smoke Tests auf PROD
- [ ] Eine echte Test-Zahlung
- [ ] Webhook empfangen
- [ ] PDF generiert

---

## 7. Testprotokoll

| Datum | Tester | Umgebung | Tests | Passed | Failed | Notes |
|-------|--------|----------|-------|--------|--------|-------|
| | | | | | | |

---

**Dokument aktualisieren nach jedem Sprint!**

