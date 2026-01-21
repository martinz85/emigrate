# ⚡ QUICK ACTION CHECKLIST - Launch Vorbereitung

**Datum:** 2026-01-21  
**Status:** 🔴 **1 CRITICAL BUG** - Rest ready  
**ETA bis Launch-Ready:** 5-7 Stunden

---

## 🔥 PRIORITY 1 - JETZT SOFORT (BLOCKER)

### Bug #001: Text-Rendering fixen

**Owner:** Amelia (Developer)  
**Aufwand:** 1-2 Stunden  
**Severity:** 🔴 **CRITICAL - LAUNCH BLOCKER**

#### Schritt-für-Schritt:

- [ ] **Step 1:** Chrome DevTools auf https://auswanderer-app.vercel.app öffnen
- [ ] **Step 2:** Inspect Element auf beliebigen Text
- [ ] **Step 3:** Nach `letter-spacing` und `word-spacing` in Computed Styles suchen
- [ ] **Step 4:** Wenn gefunden: Wert notieren
- [ ] **Step 5:** In Code suchen:
  ```bash
  cd auswanderer-app
  grep -r "letter-spacing" src/
  grep -r "word-spacing" src/
  ```
- [ ] **Step 6:** Dateien prüfen:
  - `src/app/globals.css`
  - `tailwind.config.ts`
  - `src/app/layout.tsx`
- [ ] **Step 7:** Fix implementieren (wahrscheinlich):
  ```css
  /* REMOVE or FIX: */
  * {
    letter-spacing: 0; /* statt 0.5em */
  }
  ```
- [ ] **Step 8:** Testen auf DEV: `npm run dev`
- [ ] **Step 9:** Visuell prüfen: Texte korrekt?
- [ ] **Step 10:** Deploy: `git push` (Vercel auto-deploy)

**Nach Deploy:**
- [ ] Tina rufen für Retest: `@tina retest after bug-fix`

---

## 🔥 PRIORITY 2 - HEUTE/MORGEN (CRITICAL)

### Payment-Flow testen

**Owner:** Tina (QA) + Amelia (Dev-Support)  
**Aufwand:** 2-3 Stunden  
**Severity:** 🔴 **CRITICAL** (aber nicht Launch-BLOCKER)

- [ ] Stripe Test-Modus aktivieren
- [ ] Test-Kreditkarte: `4242 4242 4242 4242`
- [ ] E-Book kaufen (14,99€)
- [ ] PDF-Vollversion kaufen (9,99€)
- [ ] PRO Subscription (monatlich 14,99€)
- [ ] PRO Subscription (jährlich 149,90€)
- [ ] Payment-Success validieren
- [ ] Payment-Failure testen (Card Declined: `4000 0000 0000 0002`)
- [ ] Webhook-Verarbeitung prüfen (Supabase Logs)
- [ ] Receipt-Email empfangen

**Kann parallel zu Bug-Fix-Retest laufen!**

---

### Ergebnis-Seite testen

**Owner:** Tina (QA)  
**Aufwand:** 1 Stunde  
**Severity:** 🔴 **CRITICAL**

- [ ] Komplette Analyse durchführen (29/29 Fragen)
- [ ] Ergebnis-Seite lädt
- [ ] Top 3 Länder werden angezeigt
- [ ] Scores sind sichtbar und plausibel
- [ ] PDF-Vorschau (2 Seiten) funktioniert
- [ ] "Vollständiges PDF kaufen" Button funktioniert
- [ ] FREE vs PRO Unterschiede sichtbar

**Kann parallel zu Payment-Tests laufen!**

---

### PDF-Download testen

**Owner:** Tina (QA)  
**Aufwand:** 1 Stunde  
**Severity:** 🔴 **CRITICAL**

- [ ] PDF nach Payment herunterladen
- [ ] PDF öffnet ohne Fehler
- [ ] Inhalt ist vollständig (25 Seiten)
- [ ] Personalisierung korrekt (Name, Länder, Scores)
- [ ] Download mehrfach möglich
- [ ] PRO-User: PDF ohne Payment downloadbar

**Kann parallel zu Ergebnis-Tests laufen!**

---

## 🟡 PRIORITY 3 - NACH LAUNCH (EMPFOHLEN)

### Cross-Browser Testing

**Owner:** Tina (QA)  
**Aufwand:** 2-3 Stunden

- [ ] Firefox (Windows/Mac)
- [ ] Safari (Mac/iOS)
- [ ] Edge (Windows)
- [ ] Mobile Safari (iPhone)
- [ ] Mobile Chrome (Android)

---

### Responsive Testing

**Owner:** Tina (QA)  
**Aufwand:** 2 Stunden

- [ ] Mobile S (375px) - iPhone SE
- [ ] Mobile L (414px) - iPhone Pro
- [ ] Tablet (768px) - iPad
- [ ] Tablet L (1024px) - iPad Pro
- [ ] Desktop (1280px)
- [ ] Desktop L (1920px)

---

### Accessibility Audit

**Owner:** Tina (QA) + Amelia (Dev)  
**Aufwand:** 2-3 Stunden

- [ ] Keyboard Navigation (Tab, Enter, Esc)
- [ ] Screen Reader (NVDA/JAWS/VoiceOver)
- [ ] ARIA Labels validieren
- [ ] Color Contrast (WCAG AA)
- [ ] Focus States sichtbar
- [ ] Alt-Text für Images

---

### Performance Optimization

**Owner:** Amelia (Dev)  
**Aufwand:** 2-4 Stunden

- [ ] Lighthouse Score (Target: 90+)
- [ ] Core Web Vitals
  - LCP < 2.5s
  - FID < 100ms
  - CLS < 0.1
- [ ] Image Optimization (WebP, Lazy Loading)
- [ ] Code Splitting
- [ ] Bundle Size Reduction

---

## 📊 TIMELINE

### Option A: SCHNELL-LAUNCH (2 Tage)

**Tag 1 (Heute):**
- ⏰ 9:00-11:00: Bug #001 fixen (Amelia)
- ⏰ 11:00-11:30: Retest (Tina)
- ⏰ 14:00-17:00: Payment-Tests (Tina + Amelia)

**Tag 2 (Morgen):**
- ⏰ 9:00-10:00: Ergebnis-Tests (Tina)
- ⏰ 10:00-11:00: PDF-Tests (Tina)
- ⏰ 11:00-12:00: Finaler Review (Team)
- ⏰ 14:00: 🚀 **LAUNCH**

---

### Option B: GRÜNDLICH-LAUNCH (3-4 Tage)

**Tag 1 (Heute):**
- Bug #001 fixen + Retest

**Tag 2 (Morgen):**
- Payment + Ergebnis + PDF Tests

**Tag 3 (Übermorgen):**
- Cross-Browser + Responsive Tests

**Tag 4:**
- Final Polishing + Launch

---

## ✅ GO/NO-GO KRITERIEN

### Minimum für Launch (MUST-HAVE):

- ✅ Bug #001 behoben und retestet
- ✅ Payment-Flow funktioniert (Stripe)
- ✅ Ergebnis-Seite zeigt korrekte Daten
- ✅ PDF-Download funktioniert
- ✅ Keine Console-Errors
- ✅ Basic Responsive (Desktop funktioniert)

### Nice-to-Have:

- [ ] Cross-Browser getestet
- [ ] Mobile optimiert
- [ ] Accessibility WCAG AA
- [ ] Lighthouse Score 90+

---

## 📞 KONTAKTE

| Role | Name | Für | Status |
|------|------|-----|--------|
| **Developer** | Amelia | Bug-Fix, Dev-Support | Verfügbar |
| **QA Tester** | Tina | Testing, Retest | Verfügbar |
| **CEO** | Steve | Go/No-Go Decision | Informieren |
| **DevOps** | Dana | Deployment, Monitoring | Bei Bedarf |

---

## 🎯 ERFOLGS-KRITERIEN

### Launch ist erfolgreich wenn:

1. ✅ Alle CRITICAL Tests bestanden
2. ✅ Bug #001 behoben
3. ✅ Payment funktioniert ohne Errors
4. ✅ User kann komplette Journey durchlaufen:
   - Analyse starten
   - Fragen beantworten
   - Ergebnis sehen
   - PDF kaufen
   - PDF herunterladen
5. ✅ Keine Console-Errors in Production
6. ✅ Monitoring aktiv (Sentry/Vercel)

---

## 📝 NOTIZEN

### Wichtige URLs:

- **Production:** https://auswanderer-app.vercel.app
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Supabase DEV:** https://supabase.com/dashboard/project/hkktofxvgrxfkaixcowm
- **Supabase PROD:** https://supabase.com/dashboard/project/kfcofscgtvootvsnneux
- **Stripe Dashboard:** [Link einfügen]

### Test-Credentials:

**Stripe Test Cards:**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires Auth: `4000 0027 6000 3184`

**Admin-Login:** [Credentials bei Martin]

---

## 🚨 ESKALATION

### Wenn Bug-Fix > 4 Stunden dauert:

1. 📞 **Team-Call einberufen**
2. 🔍 **Root Cause gemeinsam analysieren**
3. 🤔 **Alternative Lösungen diskutieren**
4. 📅 **Launch-Timeline neu bewerten**

### Wenn Payment-Tests fehlschlagen:

1. 🔍 **Stripe Logs prüfen**
2. 🔍 **Supabase Webhook Logs prüfen**
3. 🔍 **Console Errors dokumentieren**
4. 📞 **Amelia hinzuziehen**
5. 🚨 **Steve informieren (Launch-Risk)**

---

## ✨ FINALE CHECKLISTE VOR LAUNCH

- [ ] Alle CRITICAL Tests bestanden
- [ ] Bug #001 behoben
- [ ] Production-Deploy erfolgreich
- [ ] Monitoring aktiv
- [ ] Team informiert
- [ ] Launch-Announcement vorbereitet
- [ ] Support-Prozesse definiert
- [ ] Rollback-Plan vorhanden

**Dann:** 🚀 **PRESS LAUNCH BUTTON!**

---

**Erstellt von:** Tina - QA Tester Agent  
**Datum:** 2026-01-21  
**Letzte Aktualisierung:** 2026-01-21, 18:30

**Next Action:** 👉 **@amelia fix bug #001 (text-rendering)**

