# PDF-Template Struktur - Auswanderer-Analyse

**Basierend auf:** Word-Vorlage `Samples/Auswanderungsanalyse_2025_*.docx`
**Erstellt:** 2026-01-17

---

## 1. Dokument-Uebersicht

Die generierte PDF folgt einer klaren 5-Seiten-Struktur:

| Seite | Inhalt | Beschreibung |
|-------|--------|--------------|
| 1 | Titelseite + Profil | Personalisierte Zusammenfassung |
| 2 | Gesamtranking | Top 5-10 Laender mit Punkten |
| 3-4 | Detailmatrix | Alle 26 Kriterien vs. Laender |
| 5 | Empfehlung | Personalisierte Handlungsempfehlung |

---

## 2. Seiten-Struktur

### 2.1 Seite 1: Titelseite & Profil

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│            AUSWANDERUNGSANALYSE 2026                         │
│            ━━━━━━━━━━━━━━━━━━━━━━━━━                          │
│                                                              │
│         PERSONALISIERT FÜR {user_name}                       │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  DEIN PROFIL - ZUSAMMENFASSUNG                         │  │
│  ├────────────────────────────────────────────────────────┤  │
│  │                                                        │  │
│  │  💰 Budget: {budget_range}                             │  │
│  │  💼 Beruf: {profession}                                │  │
│  │  👨‍👩‍👧‍👦 Familie: {family_status}                           │  │
│  │  🌍 Zielregion: {target_region}                        │  │
│  │  ⏰ Zeitrahmen: {timeline}                             │  │
│  │  🎯 Top-Prioritaeten: {top_3_criteria}                 │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  Erstellt: {date} | Powered by Auswanderer-Plattform AI      │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Dynamische Felder:**
- `{user_name}` - Name des Nutzers
- `{budget_range}` - z.B. "100k-250k EUR"
- `{profession}` - z.B. "IT Remote Worker"
- `{family_status}` - z.B. "Verheiratet, 2 Kinder"
- `{target_region}` - z.B. "EU oder Suedamerika"
- `{timeline}` - z.B. "In 12-24 Monaten"
- `{top_3_criteria}` - Die 3 hoechstgewichteten Kriterien

---

### 2.2 Seite 2: Gesamtranking

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  DEIN PERSOENLICHES LAENDER-RANKING                          │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                           │
│                                                              │
│  ┌────┬─────────────────┬────────┬─────┬──────────────────┐  │
│  │ #  │ Land            │ Punkte │  %  │ Kommentar        │  │
│  ├────┼─────────────────┼────────┼─────┼──────────────────┤  │
│  │ 🥇 │ Portugal        │ 48/52  │ 92% │ Optimal fuer... │  │
│  │ 🥈 │ Spanien         │ 45/52  │ 87% │ Starke Expat... │  │
│  │ 🥉 │ Zypern          │ 42/52  │ 81% │ EU + Englisch   │  │
│  │ 4  │ Costa Rica      │ 40/52  │ 77% │ Neutral + Natur │  │
│  │ 5  │ Uruguay         │ 38/52  │ 73% │ Liberal + sicher│  │
│  └────┴─────────────────┴────────┴─────┴──────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  💡 WARUM DIESE LAENDER?                               │  │
│  │                                                        │  │
│  │  Basierend auf deinen 26 Kriterien-Gewichtungen:      │  │
│  │  • Hohe Prioritaet: {high_priority_criteria}           │  │
│  │  • Mittlere Prioritaet: {medium_priority_criteria}     │  │
│  │  • Deine Ausschlusskriterien beruecksichtigt          │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Ranking-Logik:**
- Punkte = Summe aller (Kriterium-Score × Nutzer-Gewichtung)
- Maximal moeglich = Summe aller Gewichtungen × 2
- Prozent = Erreichte Punkte / Maximum × 100

---

### 2.3 Seite 3-4: Detailmatrix

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  DETAILMATRIX - ALLE 26 KRITERIEN                            │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                            │
│                                                              │
│  Legende: ++ Sehr gut (2) | o Mittel (1) | -- Schlecht (0)  │
│                                                              │
│  ┌────────────────────┬────────┬────────┬────────┬────────┐  │
│  │ Kriterium (Gew.)   │ Land 1 │ Land 2 │ Land 3 │ Land 4 │  │
│  ├────────────────────┼────────┼────────┼────────┼────────┤  │
│  │ Lebenskosten (×5)  │   ++   │   o    │   ++   │   o    │  │
│  │                    │ Guenst.│ Mittel │ Guenst.│ Teuer  │  │
│  ├────────────────────┼────────┼────────┼────────┼────────┤  │
│  │ Visa (×4)          │   ++   │   ++   │   o    │   --   │  │
│  │                    │ EU     │ EU     │ Antrag │ Schwer │  │
│  ├────────────────────┼────────┼────────┼────────┼────────┤  │
│  │ ... weitere ...    │        │        │        │        │  │
│  └────────────────────┴────────┴────────┴────────┴────────┘  │
│                                                              │
│  Farbcodierung:                                              │
│  🟢 ++ = Gruene Zelle  │  🟡 o = Gelbe Zelle  │  🔴 -- = Rot │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Kriterien-Kategorien in der Matrix:**

| Kategorie | Kriterien | Gewichtungs-Range |
|-----------|-----------|-------------------|
| 💰 Finanziell | 4 Kriterien | 1-5 |
| 📋 Praktisch | 6 Kriterien | 1-5 |
| 🌴 Lifestyle | 4 Kriterien | 1-5 |
| 🛡️ Sicherheit | 2 Kriterien | 1-5 |
| 👤 Persoenlich | 5 Kriterien | 1-5 |
| 🐾 Spezial | 1 Kriterium | 1-5 |
| 🤝 Sozial | 1 Kriterium | 1-5 |
| 💼 Karriere | 1 Kriterium | 1-5 |
| 👶 Familie+ | 2 Kriterien | 1-5 |

---

### 2.4 Seite 5: Personalisierte Empfehlung

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  DEINE PERSOENLICHE EMPFEHLUNG                               │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                              │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  🏆 UNSERE TOP-EMPFEHLUNG: {top_country}               │  │
│  │                                                        │  │
│  │  Warum {top_country} optimal fuer dich ist:           │  │
│  │                                                        │  │
│  │  ✅ {strength_1}                                       │  │
│  │  ✅ {strength_2}                                       │  │
│  │  ✅ {strength_3}                                       │  │
│  │                                                        │  │
│  │  ⚠️ Beachte:                                           │  │
│  │  • {consideration_1}                                   │  │
│  │  • {consideration_2}                                   │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  🥈 ALTERNATIVE: {second_country}                      │  │
│  │                                                        │  │
│  │  Wenn {condition}, dann waere {second_country}         │  │
│  │  die bessere Wahl weil {reason}.                       │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  📋 NAECHSTE SCHRITTE                                  │  │
│  │                                                        │  │
│  │  1. {next_step_1}                                      │  │
│  │  2. {next_step_2}                                      │  │
│  │  3. {next_step_3}                                      │  │
│  │                                                        │  │
│  │  💡 Upgrade zu PRO fuer detaillierte Checklisten!      │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. Freemium-Preview (2 Seiten)

### Was in der kostenlosen Preview sichtbar ist:

| Seite | Inhalt | Sichtbarkeit |
|-------|--------|--------------|
| 1 | Titelseite & Profil | ✅ Vollstaendig sichtbar |
| 2 | Gesamtranking (Top 3) | ✅ Vollstaendig sichtbar |
| 3-4 | Detailmatrix | 🔒 Verschwommen/Blurred |
| 5 | Empfehlung | 🔒 Verschwommen/Blurred |

### Preview-Overlay:

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│           [VERSCHWOMMENER INHALT]                            │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                                                        │  │
│  │      🔐 Vollstaendige Analyse freischalten            │  │
│  │                                                        │  │
│  │      Enthaelt:                                         │  │
│  │      • Detailmatrix aller 26 Kriterien                │  │
│  │      • Personalisierte Laender-Empfehlungen           │  │
│  │      • Konkrete naechste Schritte                     │  │
│  │                                                        │  │
│  │      [  JETZT FREISCHALTEN - 39 EUR  ]                │  │
│  │                                                        │  │
│  │      oder: PRO-Abo fuer 14,99 EUR/Monat               │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 4. Design-Spezifikationen

### 4.1 Farben

| Verwendung | Farbe | Hex-Code |
|------------|-------|----------|
| Header-Hintergrund | Dunkelblau | #1F4E79 |
| Akzent/Links | Mittelblau | #2F5496 |
| Positiv (++) | Hellgruen | #C6EFCE |
| Neutral (o) | Hellgelb | #FFEB9C |
| Negativ (--) | Hellrot | #FFC7CE |
| Text | Dunkelgrau | #333333 |

### 4.2 Typografie

| Element | Font | Groesse | Gewicht |
|---------|------|---------|---------|
| Haupttitel | Calibri/Sans | 24pt | Bold |
| Sektions-Titel | Calibri/Sans | 14pt | Bold |
| Body Text | Calibri/Sans | 10pt | Normal |
| Tabellen-Header | Calibri/Sans | 9pt | Bold |
| Tabellen-Body | Calibri/Sans | 9pt | Normal |
| Footer | Calibri/Sans | 8pt | Normal |

### 4.3 Seiten-Layout

- **Format:** A4 (210 × 297 mm)
- **Margins:** 1.5 cm allseitig
- **Zeilenabstand:** 1.15
- **Tabellenabstand:** 6pt nach

---

## 5. Technische Implementierung

### 5.1 Generierungs-Optionen

| Option | Technologie | Pro | Contra |
|--------|-------------|-----|--------|
| **react-pdf** | React-basiert | Integration | Lernkurve |
| **Puppeteer** | HTML→PDF | Flexibel | Server-Last |
| **PDFKit** | Node.js nativ | Schnell | Weniger Features |
| **WeasyPrint** | Python | CSS Support | Python Dependency |

**Empfehlung:** `react-pdf` fuer React/Next.js Integration

### 5.2 Datenstruktur fuer PDF-Generierung

```typescript
interface PDFData {
  user: {
    name: string;
    email: string;
    created_at: Date;
  };
  
  profile: {
    budget_range: string;
    profession: string;
    family_status: string;
    target_region: string;
    timeline: string;
    top_priorities: string[];
  };
  
  criteria_weights: {
    [criterionId: string]: number; // 1-5
  };
  
  country_scores: Array<{
    country_name: string;
    country_code: string;
    total_score: number;
    max_score: number;
    percentage: number;
    rank: number;
    criteria_details: Array<{
      criterion_id: string;
      score: number; // 0, 1, or 2
      symbol: '++' | 'o' | '--';
      explanation: string;
    }>;
    recommendation_text: string;
  }>;
  
  recommendation: {
    top_country: string;
    strengths: string[];
    considerations: string[];
    next_steps: string[];
    alternative: {
      country: string;
      condition: string;
      reason: string;
    };
  };
}
```

---

## 6. Validierung

### Checkliste vor Generierung:

- [ ] Alle 26 Kriterien haben Gewichtungen (1-5)
- [ ] Mindestens 5 Laender in der Analyse
- [ ] User-Profil vollstaendig
- [ ] Keine Null-Werte in Pflichtfeldern

### Qualitaetssicherung:

- [ ] PDF oeffnet korrekt
- [ ] Alle Tabellen vollstaendig sichtbar
- [ ] Farbcodierung konsistent
- [ ] Keine abgeschnittenen Texte
- [ ] Druckformat korrekt (A4)

---

**Naechster Schritt:** Kriterien mit konkreten Fragen und Bewertungslogik ausarbeiten

