# Go-Live Plan - Auswanderer-Plattform

**Projekt:** Auswanderer-Plattform  
**Domain:** auswander-profi.de  
**Geplantes Go-Live:** TBD  
**Verantwortlich:** Dana (DevOps), Martin (Product Owner)

---

## 1. Aktuelle Infrastruktur

| Komponente | Status | Details |
|------------|--------|---------|
| VPS (Production) | ✅ Läuft | 64.112.127.175, PM2 online |
| Vercel (Preview) | ✅ Ready | https://auswanderer-4xjl6wntk-emigrates-projects.vercel.app |
| Domain | ⏳ Reserviert | auswander-profi.de |
| DNS | ❌ Nicht konfiguriert | A-Record fehlt |
| SSL | ❌ Nicht installiert | Wartet auf DNS |
| Stripe | ⚠️ Test-Mode | Live-Keys fehlen |

---

## 2. Pre-Launch Checklist

### 2.1 DNS Konfiguration (T-3 Tage)

- [ ] **A-Record erstellen:**
  - `auswander-profi.de` → `64.112.127.175`
  - `www.auswander-profi.de` → `64.112.127.175`
- [ ] DNS Propagation prüfen (24-48h warten)
- [ ] Verify mit: `dig auswander-profi.de +short`

### 2.2 SSL Zertifikat (nach DNS)

```bash
ssh hostup-auswanderer
sudo certbot --nginx -d auswander-profi.de -d www.auswander-profi.de
sudo certbot renew --dry-run  # Auto-Renewal testen
```

- [ ] SSL installiert
- [ ] HTTPS funktioniert
- [ ] HTTP → HTTPS Redirect aktiv

### 2.3 Environment Variables (VPS)

```bash
# /var/www/emigrate/auswanderer-app/.env.production
```

| Variable | Status | Wert |
|----------|--------|------|
| NEXT_PUBLIC_SUPABASE_URL | ⚠️ DEV | → PROD ändern |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | ⚠️ DEV | → PROD ändern |
| SUPABASE_SERVICE_ROLE_KEY | ⚠️ DEV | → PROD ändern |
| STRIPE_SECRET_KEY | ⚠️ Test | → Live ändern |
| NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY | ⚠️ Test | → Live ändern |
| NEXT_PUBLIC_BASE_URL | ❌ IP | → https://auswander-profi.de |
| AUDIT_SALT | ✅ Gesetzt | - |

### 2.4 Stripe Live-Mode

- [ ] Stripe Account verifiziert (Business Details)
- [ ] Live API Keys generiert
- [ ] Webhook Endpoint erstellen:
  - URL: `https://auswander-profi.de/api/webhook`
  - Events: `checkout.session.completed`, `customer.subscription.*`
- [ ] Webhook Secret in .env.production
- [ ] Test-Zahlung durchführen

### 2.5 Supabase PROD

- [ ] PROD Projekt aktiv (`kfcofscgtvootvsnneux`)
- [ ] Migrations auf PROD deployen
- [ ] RLS Policies verifizieren
- [ ] Edge Functions (falls verwendet)

---

## 3. Launch Day Checklist

### 3.1 Final Deployment

```bash
# Auf VPS:
ssh hostup-auswanderer
cd /var/www/emigrate
git pull
cd auswanderer-app
npm install
npm run build
pm2 restart auswanderer
```

### 3.2 Verification

| Check | Command | Erwartetes Ergebnis |
|-------|---------|---------------------|
| DNS | `dig auswander-profi.de +short` | 64.112.127.175 |
| HTTPS | `curl -I https://auswander-profi.de` | HTTP/2 200 |
| App | Browser öffnen | Landing Page lädt |
| Auth | Login testen | Supabase Auth funktioniert |
| Payment | Test-Checkout | Stripe Session erstellt |
| Webhook | Stripe Dashboard | Events kommen an |

### 3.3 Smoke Tests

- [ ] Landing Page lädt (alle Sektionen)
- [ ] Analyse starten (alle Fragen durchgehen)
- [ ] Teaser-Seite angezeigt
- [ ] Stripe Checkout funktioniert
- [ ] Nach Zahlung: PDF Download
- [ ] Login/Register funktioniert
- [ ] Dashboard zeigt Analysen
- [ ] Admin Login funktioniert

---

## 4. Rollback Plan

### Bei kritischen Fehlern:

1. **Sofort:** PM2 zur letzten Version zurück
   ```bash
   pm2 show auswanderer  # Version prüfen
   # Git revert zum letzten stabilen Commit
   git log --oneline -5
   git checkout <commit-hash>
   npm install && npm run build && pm2 restart auswanderer
   ```

2. **DNS:** Bei Bedarf auf temporäre Seite umleiten

3. **Kommunikation:** User informieren via Social/Email

---

## 5. Post-Launch (T+1 bis T+7)

### 5.1 Monitoring

- [ ] Error-Rate in PM2 Logs prüfen
- [ ] Stripe Dashboard: Erfolgreiche Zahlungen
- [ ] Supabase Dashboard: DB Performance
- [ ] UptimeRobot/Ähnlich einrichten

### 5.2 Performance

- [ ] Lighthouse Score > 90
- [ ] Core Web Vitals prüfen
- [ ] Load Time < 3s

### 5.3 Security

- [ ] SSL Labs Test: A+ Rating
- [ ] Security Headers prüfen
- [ ] Rate Limiting aktiv

### 5.4 Backup

- [ ] Supabase automatisches Backup aktiv
- [ ] VPS Snapshot erstellen

---

## 6. Kontakte & Eskalation

| Rolle | Name | Kontakt |
|-------|------|---------|
| Product Owner | Martin | - |
| DevOps | Dana (Agent) | - |
| Stripe Support | - | support@stripe.com |
| HostUp Support | - | hostup.se |
| Supabase Support | - | support@supabase.io |

---

## 7. Timeline

| Phase | Dauer | Abhängigkeiten |
|-------|-------|----------------|
| DNS Konfiguration | 5 min | Domain-Provider Zugang |
| DNS Propagation | 24-48h | - |
| SSL Setup | 10 min | DNS propagiert |
| Stripe Live-Mode | 1-3 Tage | Business Verifizierung |
| Final Deploy | 30 min | Alle Voraussetzungen |
| Smoke Tests | 1h | Deployment abgeschlossen |
| Monitoring Setup | 2h | App läuft stabil |

---

**Nächste Schritte:**
1. DNS A-Record erstellen
2. Auf DNS Propagation warten
3. SSL einrichten
4. Stripe Live-Mode aktivieren
5. PROD Environment Variables setzen
6. Final Deploy + Tests

