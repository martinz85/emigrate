# 26 Kriterien - Fragen & Bewertungslogik

**Version:** 1.0
**Erstellt:** 2026-01-17

---

## Uebersicht

Jedes Kriterium hat:
1. **Frage an den Nutzer** - Zur Gewichtungsermittlung (1-5)
2. **AI-Folgefragen** - Fuer Kontext und Praezisierung
3. **Laender-Bewertungslogik** - Wie die AI Laender bewertet (++, o, --)
4. **Datenquellen** - Woher die Laenderdaten kommen

---

## Kategorie 1: FINANZIELL (4 Kriterien)

### 1.1 Lebenshaltungskosten-Match

**Hauptfrage:**
> "Wie wichtig ist es dir, dass die Lebenshaltungskosten in deinem Zielland zu deinem Budget passen?"

**AI-Folgefragen:**
- "Wie hoch ist dein monatliches Haushaltsbudget (ohne Miete)?"
- "Planst du zur Miete zu wohnen oder Eigentum zu kaufen?"
- "Wie viele Personen leben in deinem Haushalt?"

**Gewichtungsinterpretation:**
| Gewichtung | Bedeutung |
|------------|-----------|
| 1 | Budget ist flexibel, Kosten sind nebensaechlich |
| 2 | Kosten sind ein Faktor, aber nicht entscheidend |
| 3 | Mittlere Prioritaet, sollte ungefaehr passen |
| 4 | Wichtig, Budget ist begrenzt |
| 5 | Kritisch, muss deutlich guenstiger sein als aktuell |

**Laender-Bewertungslogik:**
| Symbol | Kriterium | Beispiellaender |
|--------|-----------|-----------------|
| ++ | 50%+ guenstiger als Deutschland | Portugal, Thailand, Uruguay |
| o | Aehnlich wie Deutschland (±20%) | Spanien, Italien, Zypern |
| -- | 20%+ teurer als Deutschland | Schweiz, Norwegen, Australien |

**Datenquellen:**
- Numbeo Cost of Living Index
- Expatistan
- Eigene Datenbank mit regelmaessigen Updates

---

### 1.2 Einkommensquelle-Kompatibilitaet

**Hauptfrage:**
> "Wie wichtig ist es, dass du deine aktuelle Einkommensquelle im Zielland fortfuehren kannst?"

**AI-Folgefragen:**
- "Was ist deine primaere Einkommensquelle?" (Remote Work / Vor-Ort-Job / Selbstaendig / Rente / Vermoegen)
- "Wenn Remote: Fuer welche Region/Zeitzone arbeitest du?"
- "Wenn Job vor Ort: In welcher Branche?"
- "Wenn Rente: Aus welchem Land beziehst du Rente?"

**Gewichtungsinterpretation:**
| Gewichtung | Bedeutung |
|------------|-----------|
| 1 | Einkommensquelle ist flexibel/unabhaengig |
| 2 | Kann angepasst werden |
| 3 | Sollte funktionieren |
| 4 | Muss definitiv funktionieren |
| 5 | Absolut kritisch - nur Laender wo das geht |

**Laender-Bewertungslogik (Remote Worker):**
| Symbol | Kriterium |
|--------|-----------|
| ++ | Gute Zeitzone (±3h zu EU), stabiles Internet, Remote-Worker-freundliche Visa |
| o | Akzeptable Zeitzone (±5-6h), Internet OK |
| -- | Schlechte Zeitzone (±8h+), Internet-Probleme |

**Laender-Bewertungslogik (Job vor Ort):**
| Symbol | Kriterium |
|--------|-----------|
| ++ | Starker Arbeitsmarkt in Nutzer-Branche, einfache Arbeitserlaubnis |
| o | Jobs vorhanden, aber begrenzt |
| -- | Schwacher Markt, schwierige Arbeitserlaubnis |

---

### 1.3 Steuer-Situation

**Hauptfrage:**
> "Wie wichtig ist eine guenstige Steuer-Situation im Zielland?"

**AI-Folgefragen:**
- "Welche Einkommensart hast du hauptsaechlich?" (Gehalt / Selbstaendig / Kapitalertraege / Rente)
- "Hast du Vermoegen das du transferieren moechtest?"
- "Ist Steueroptimierung ein Hauptgrund fuer deinen Umzug?"

**Gewichtungsinterpretation:**
| Gewichtung | Bedeutung |
|------------|-----------|
| 1 | Steuern sind egal |
| 2 | Waere schoen, aber nicht wichtig |
| 3 | Mittlere Prioritaet |
| 4 | Wichtiger Faktor |
| 5 | Sehr wichtig - will deutlich weniger Steuern zahlen |

**Laender-Bewertungslogik:**
| Symbol | Kriterium | Beispiellaender |
|--------|-----------|-----------------|
| ++ | Niedrige Steuern (<20% effektiv), keine Doppelbesteuerung | Portugal (NHR), Zypern, UAE |
| o | Moderate Steuern (20-40%), DBA vorhanden | Spanien, Griechenland |
| -- | Hohe Steuern (40%+), komplexe Regeln | Deutschland, Schweden, Belgien |

---

### 1.4 Vermoegens-Transfer

**Hauptfrage:**
> "Wie wichtig ist es, Geld einfach ins Zielland transferieren zu koennen?"

**AI-Folgefragen:**
- "Planst du groessere Summen zu transferieren (Immobilienkauf etc.)?"
- "Hast du bereits Bankkonten im Ausland?"
- "Ist Krypto ein Teil deines Vermoegens?"

**Gewichtungsinterpretation:**
| Gewichtung | Bedeutung |
|------------|-----------|
| 1 | Kein grosses Vermoegen zu transferieren |
| 2 | Geringe Betraege |
| 3 | Mittlere Betraege |
| 4 | Groessere Summen (50k+) |
| 5 | Sehr grosse Summen (500k+), muss reibungslos sein |

**Laender-Bewertungslogik:**
| Symbol | Kriterium |
|--------|-----------|
| ++ | EU/SEPA-Zone, keine Kapitalverkehrskontrollen, einfache Kontoeroeffnung |
| o | Geringe Einschraenkungen, aber machbar |
| -- | Kapitalverkehrskontrollen, schwierige Kontoeroeffnung |

---

## Kategorie 2: PRAKTISCH (6 Kriterien)

### 2.1 Visa-Machbarkeit

**Hauptfrage:**
> "Wie wichtig ist ein einfacher Visa-Prozess fuer dich?"

**AI-Folgefragen:**
- "Welche Staatsbuergerschaft(en) hast du?"
- "Hast du EU-Buergerschaft?"
- "Planst du als Angestellter, Selbstaendiger, oder Investor einzuwandern?"
- "Wie viel Eigenkapital kannst du nachweisen?"

**Gewichtungsinterpretation:**
| Gewichtung | Bedeutung |
|------------|-----------|
| 1 | Komplexer Prozess ist OK |
| 2 | Etwas Aufwand ist akzeptabel |
| 3 | Sollte nicht zu kompliziert sein |
| 4 | Muss relativ einfach sein |
| 5 | Nur Laender mit sehr einfachem Prozess |

**Laender-Bewertungslogik (EU-Buerger):**
| Symbol | Kriterium |
|--------|-----------|
| ++ | EU/EWR-Land (Freizuegigkeit) |
| o | Einfaches Visum (z.B. Digital Nomad Visa) |
| -- | Komplexer Prozess, hohe Huerden |

**Laender-Bewertungslogik (Nicht-EU-Buerger):**
| Symbol | Kriterium |
|--------|-----------|
| ++ | Einfaches Investor/Rentner-Visum, keine Einkommensanforderungen |
| o | Machbar mit Nachweis von Einkommen/Vermoegen |
| -- | Sehr schwierig, hohe Huerden, Arbeitgeber-Sponsoring noetig |

---

### 2.2 Sprachbarriere

**Hauptfrage:**
> "Wie wichtig ist es, dass du mit Englisch (oder Deutsch) im Alltag durchkommst?"

**AI-Folgefragen:**
- "Welche Sprachen sprichst du fliessend?"
- "Bist du bereit, eine neue Sprache zu lernen?"
- "Wenn ja, welche Sprachen interessieren dich?"

**Gewichtungsinterpretation:**
| Gewichtung | Bedeutung |
|------------|-----------|
| 1 | Bereit jede Sprache zu lernen |
| 2 | Kann Grundlagen lernen |
| 3 | Sollte mit Englisch klarkommen |
| 4 | Englisch muss weit verbreitet sein |
| 5 | Muss Englisch oder Deutsch als Hauptsprache sein |

**Laender-Bewertungslogik:**
| Symbol | Kriterium | Beispiellaender |
|--------|-----------|-----------------|
| ++ | Englisch/Deutsch Amtssprache oder weit verbreitet | UK, Irland, Malta, Niederlande, Skandinavien |
| o | Englisch in Staedten/Touristengebieten | Spanien, Portugal, Frankreich |
| -- | Englisch kaum verbreitet, lokale Sprache zwingend | Japan, China, Suedamerika Inland |

---

### 2.3 Gesundheits- & Sozialsystem

**Hauptfrage:**
> "Wie wichtig ist ein gutes Gesundheitssystem und soziale Absicherung?"

**AI-Folgefragen:**
- "Hast du chronische Erkrankungen oder regelmaessigen Behandlungsbedarf?"
- "Wie alt bist du / deine Familienangehoerigen?"
- "Ist Altersvorsorge/Rentenanspruch ein Thema?"
- "Bist du bereit, private Krankenversicherung zu zahlen?"

**Gewichtungsinterpretation:**
| Gewichtung | Bedeutung |
|------------|-----------|
| 1 | Gesund, jung, flexibel |
| 2 | Grundversorgung reicht |
| 3 | Sollte gut sein |
| 4 | Muss gut sein |
| 5 | Kritisch - brauche Top-Versorgung |

**Laender-Bewertungslogik:**
| Symbol | Kriterium | Beispiellaender |
|--------|-----------|-----------------|
| ++ | Erstklassiges System, Zugang fuer Auslaender, Sozialversicherung | Deutschland, Schweden, Frankreich, Australien |
| o | Gutes privates System, oeffentlich begrenzt | Spanien, Portugal, Thailand |
| -- | Schlechte Versorgung, kein Zugang fuer Auslaender | Entwicklungslaender |

---

### 2.4 Buerokratie-Level

**Hauptfrage:**
> "Wie wichtig ist wenig Buerokratie im Alltag?"

**AI-Folgefragen:**
- "Hast du Erfahrung mit Auslandsbehoerden?"
- "Bist du geduldig mit Papierkram?"
- "Wuerdest du einen Anwalt/Berater beauftragen?"

**Gewichtungsinterpretation:**
| Gewichtung | Bedeutung |
|------------|-----------|
| 1 | Buerokratie ist kein Problem |
| 2 | Kann damit umgehen |
| 3 | Sollte nicht zu schlimm sein |
| 4 | Wenig Buerokratie wichtig |
| 5 | Muss minimal sein - hasse Papierkram |

**Laender-Bewertungslogik:**
| Symbol | Kriterium | Beispiellaender |
|--------|-----------|-----------------|
| ++ | Wenig Buerokratie, digital, effizient | Estland, Singapur, Niederlande |
| o | Moderate Buerokratie | UK, Frankreich, Spanien |
| -- | Viel Buerokratie, langsam, korrupt | Italien, Griechenland, viele Entwicklungslaender |

---

### 2.5 Rueckkehr-Option (Plan B)

**Hauptfrage:**
> "Wie wichtig ist es, dass du einfach nach Deutschland zurueckkehren koenntest?"

**AI-Folgefragen:**
- "Behaeltst du deine deutsche Staatsbuergerschaft?"
- "Hast du noch Immobilien/Bankkonten in Deutschland?"
- "Siehst du den Umzug als dauerhaft oder Test?"

**Gewichtungsinterpretation:**
| Gewichtung | Bedeutung |
|------------|-----------|
| 1 | Rueckkehr ist kein Thema |
| 2 | Waere schoen, aber nicht wichtig |
| 3 | Sollte moeglich sein |
| 4 | Wichtig - will Option haben |
| 5 | Kritisch - muss jederzeit zurueck koennen |

**Laender-Bewertungslogik:**
| Symbol | Kriterium |
|--------|-----------|
| ++ | EU-Land (Freizuegigkeit), kurze Flugzeit (<4h) |
| o | Nicht-EU aber gute Verbindungen, moderate Flugzeit |
| -- | Weit entfernt, komplizierte Rueckkehr, lange Fluege |

---

### 2.6 Aufenthalt → Staatsbuergerschaft

**Hauptfrage:**
> "Wie wichtig ist ein Pfad zur permanenten Aufenthaltserlaubnis oder Staatsbuergerschaft?"

**AI-Folgefragen:**
- "Planst du langfristig (10+ Jahre) im Zielland zu bleiben?"
- "Waere ein zweiter Pass interessant fuer dich?"
- "Wuerdest du deine deutsche Staatsbuergerschaft aufgeben?"

**Gewichtungsinterpretation:**
| Gewichtung | Bedeutung |
|------------|-----------|
| 1 | Nur kurzfristig geplant |
| 2 | Mittelfristig, kein Buergerwunsch |
| 3 | Langfristig, permanenter Aufenthalt waere gut |
| 4 | Wichtig, will Sicherheit |
| 5 | Kritisch - will Buerger werden koennen |

**Laender-Bewertungslogik:**
| Symbol | Kriterium |
|--------|-----------|
| ++ | Klarer Pfad zu PR (5 Jahre) und Staatsbuergerschaft | Portugal, Kanada |
| o | Permanenter Aufenthalt moeglich, Staatsbuergerschaft schwierig |
| -- | Kein Pfad zu PR, nur befristete Visa | UAE, Thailand |

---

## Kategorie 3: LIFESTYLE (4 Kriterien)

### 3.1 Klima-Praeferenz

**Hauptfrage:**
> "Wie wichtig ist dein bevorzugtes Klima?"

**AI-Folgefragen:**
- "Welches Klima bevorzugst du?" (Warm ganzjaehrig / 4 Jahreszeiten / Mild / Tropisch)
- "Wie viele Sonnenstunden brauchst du?"
- "Kannst du Hitze (35°C+) ertragen?"
- "Kannst du Kaelte (-10°C) ertragen?"

**Gewichtungsinterpretation:**
| Gewichtung | Bedeutung |
|------------|-----------|
| 1 | Klima ist egal |
| 2 | Waere schoen, aber flexibel |
| 3 | Sollte ungefaehr passen |
| 4 | Wichtig fuer mein Wohlbefinden |
| 5 | Kritisch - Hauptgrund fuer Umzug |

**Laender-Bewertungslogik (abhaengig von Nutzerpraeferenz):**
| Praeferenz | ++ Laender | -- Laender |
|------------|------------|------------|
| Warm ganzjaehrig | Spanien, Portugal, Zypern, Thailand | Skandinavien, Kanada |
| 4 Jahreszeiten | Sueddeutschland, Norditalien | Tropische Laender |
| Mild | UK, Neuseeland, Portugal | Wuestenklima |

---

### 3.2 Kultur-Kompatibilitaet

**Hauptfrage:**
> "Wie wichtig ist kulturelle Aehnlichkeit zu deiner Heimat?"

**AI-Folgefragen:**
- "Suchst du westliche Kultur oder bist du offen fuer andere?"
- "Wie wichtig sind dir europaeische Werte (Saekularismus, Gleichberechtigung)?"
- "Kannst du dich an andere Essgewohnheiten anpassen?"

**Gewichtungsinterpretation:**
| Gewichtung | Bedeutung |
|------------|-----------|
| 1 | Offen fuer alles |
| 2 | Kann mich anpassen |
| 3 | Sollte nicht zu fremd sein |
| 4 | Westliche Kultur bevorzugt |
| 5 | Muss europaeisch/westlich sein |

**Laender-Bewertungslogik:**
| Symbol | Kriterium |
|--------|-----------|
| ++ | Westlich-europaeische Kultur, aehnliche Werte |
| o | Westlich gepraegt, aber kulturelle Unterschiede |
| -- | Stark unterschiedliche Kultur, Anpassung noetig |

---

### 3.3 Expat-Community

**Hauptfrage:**
> "Wie wichtig ist eine bestehende deutschsprachige oder internationale Expat-Community?"

**AI-Folgefragen:**
- "Suchst du Anschluss an andere Deutsche?"
- "Oder bevorzugst du Integration in die lokale Bevoelkerung?"
- "Sind dir internationale Schulen fuer Kinder wichtig?"

**Gewichtungsinterpretation:**
| Gewichtung | Bedeutung |
|------------|-----------|
| 1 | Will mich integrieren, keine Expat-Bubble |
| 2 | Nett, aber nicht wichtig |
| 3 | Waere hilfreich am Anfang |
| 4 | Wichtig fuer sozialen Anschluss |
| 5 | Kritisch - brauche deutschsprachige Kontakte |

**Laender-Bewertungslogik:**
| Symbol | Kriterium |
|--------|-----------|
| ++ | Grosse deutsche Community (10.000+), viele Expat-Events |
| o | Kleinere Community, internationale Expats |
| -- | Kaum Expats, schwieriger Anschluss |

---

### 3.4 Naturzugang

**Hauptfrage:**
> "Wie wichtig ist Zugang zu Natur (Berge, Meer, Waelder)?"

**AI-Folgefragen:**
- "Welche Naturform bevorzugst du?" (Meer / Berge / Wald / Seen)
- "Wie oft moechtest du in der Natur sein?"
- "Planst du Outdoor-Aktivitaeten (Wandern, Surfen, Ski)?"

**Gewichtungsinterpretation:**
| Gewichtung | Bedeutung |
|------------|-----------|
| 1 | Stadtmensch, Natur egal |
| 2 | Ab und zu schoen |
| 3 | Regelmaessiger Zugang erwuenscht |
| 4 | Wichtig fuer Lebensqualitaet |
| 5 | Kritisch - Hauptgrund fuer Umzug |

**Laender-Bewertungslogik (abhaengig von Praeferenz):**
| Praeferenz | ++ Laender |
|------------|------------|
| Meer | Portugal, Spanien, Kroatien, Thailand |
| Berge | Schweiz, Oesterreich, Norwegen |
| Wald/Seen | Skandinavien, Kanada, Neuseeland |

---

## Kategorie 4: SICHERHEIT (2 Kriterien)

### 4.1 Sicherheit (Kriminalitaet)

**Hauptfrage:**
> "Wie wichtig ist niedrige Kriminalitaet im Zielland?"

**AI-Folgefragen:**
- "Hast du Kinder?"
- "Wuerdest du allein leben?"
- "Bist du bereit, in einem Gated Community zu leben?"

**Gewichtungsinterpretation:**
| Gewichtung | Bedeutung |
|------------|-----------|
| 1 | Flexibel, kann aufpassen |
| 2 | Sollte nicht gefaehrlich sein |
| 3 | Mittlere Prioritaet |
| 4 | Wichtig, besonders mit Familie |
| 5 | Kritisch - muss sehr sicher sein |

**Laender-Bewertungslogik:**
| Symbol | Kriterium | Beispiellaender |
|--------|-----------|-----------------|
| ++ | Sehr sicher (niedriger Crime Index) | Schweiz, Japan, Skandinavien |
| o | Durchschnittlich sicher | Spanien, Portugal, Deutschland |
| -- | Erhoehte Kriminalitaet | Suedafrika, Brasilien, Mexiko |

**Datenquellen:**
- Numbeo Crime Index
- Global Peace Index
- US State Department Travel Advisories

---

### 4.2 Geopolitik & Kriegssicherheit

**Hauptfrage:**
> "Wie wichtig ist geopolitische Stabilitaet und Sicherheit vor Konflikten?"

**AI-Folgefragen:**
- "Ist die aktuelle geopolitische Lage ein Grund fuer deinen Umzug?"
- "Suchst du ein neutrales Land?"
- "Wie weit weg von moeglichen Konfliktherden moechtest du sein?"

**Gewichtungsinterpretation:**
| Gewichtung | Bedeutung |
|------------|-----------|
| 1 | Kein Thema fuer mich |
| 2 | Leichte Bedenken |
| 3 | Mittlere Prioritaet |
| 4 | Wichtig - will weg von Krisenherden |
| 5 | Kritisch - Hauptgrund fuer Umzug, suche sicheren Hafen |

**Laender-Bewertungslogik:**
| Symbol | Kriterium | Beispiellaender |
|--------|-----------|-----------------|
| ++ | Neutral, weit von Konflikten, kein NATO | Schweiz, Neuseeland, Costa Rica, Uruguay |
| o | NATO aber stabil, weit von Front | Portugal, Spanien, Australien |
| -- | Nahe an Konfliktherden, instabil | Osteuropa, Nahost-Naehe |

---

## Kategorie 5: PERSOENLICH (5 Kriterien)

### 5.1 Familien-Situation

**Hauptfrage:**
> "Wie wichtig ist Familienfreundlichkeit im Zielland?"

**AI-Folgefragen:**
- "Hast du Kinder? Wenn ja, wie alt?"
- "Reist dein Partner mit?"
- "Hat dein Partner eigene Karriereplaene?"

**Bewertung basiert auf Familienstand...**

---

### 5.2 Entfernung zur Heimat

**Hauptfrage:**
> "Wie wichtig ist die Naehe zu Deutschland fuer Besuche?"

**Laender-Bewertungslogik:**
| Symbol | Kriterium |
|--------|-----------|
| ++ | <4h Flug | Europaeische Laender |
| o | 4-10h Flug | Nordafrika, Nahost, Ostasien |
| -- | >10h Flug | Australien, Neuseeland, Suedamerika |

---

### 5.3 Internet-Qualitaet

**Hauptfrage:**
> "Wie wichtig ist schnelles, stabiles Internet?"

**Laender-Bewertungslogik:**
| Symbol | Kriterium |
|--------|-----------|
| ++ | >100 Mbps verbreitet, stabil | Skandinavien, Suedkorea, Singapur |
| o | >50 Mbps in Staedten | Spanien, Portugal, Thailand |
| -- | Langsam, instabil | Entwicklungslaender, laendliche Gebiete |

---

### 5.4 Dringlichkeit (Schnell-Modus)

**Hauptfrage:**
> "Wie schnell moechtest/musst du auswandern?"

**Gewichtungsinterpretation:**
| Gewichtung | Bedeutung |
|------------|-----------|
| 1 | Langfristig (2+ Jahre) |
| 2 | Mittelfristig (1-2 Jahre) |
| 3 | Innerhalb eines Jahres |
| 4 | Innerhalb 6 Monaten |
| 5 | So schnell wie moeglich (<3 Monate) |

**Laender-Bewertungslogik:**
| Symbol | Kriterium |
|--------|-----------|
| ++ | Sofortige Einreise, einfaches Visum, wenig Buerokratie |
| o | 2-6 Monate Vorlauf noetig |
| -- | Langer Visa-Prozess, viel Papierkram |

---

### 5.5 Zeitzone

**Hauptfrage:**
> "Wie wichtig ist eine kompatible Zeitzone (z.B. fuer Remote-Arbeit mit EU)?"

**Laender-Bewertungslogik:**
| Symbol | Kriterium | Beispiellaender |
|--------|-----------|-----------------|
| ++ | ±1-2h von MEZ | EU, UK, Nordafrika |
| o | ±3-6h von MEZ | Nahost, Westafrika, Brasilien |
| -- | ±7h+ von MEZ | Asien, Australien, Westamerika |

---

## Kategorie 6-9: WEITERE KRITERIEN

### 6.1 Haustier-Freundlichkeit (Spezial)

**Hauptfrage:**
> "Hast du Haustiere die mit dir umziehen?"

**Wenn ja:**
- Art des Haustieres (Hund, Katze, Exotisch)
- Rasse (fuer Hunderassen-spezifische Gesetze)

**Laender-Bewertungslogik:**
| Symbol | Kriterium |
|--------|-----------|
| ++ | Keine Quarantaene, einfache Einfuhr, tierfreundliche Kultur |
| o | Kurzquarantaene oder Papierkram |
| -- | Lange Quarantaene (UK, Australien, Neuseeland 6+ Monate) |

---

### 7.1 Social Community (Religion/Vereine)

**Hauptfrage:**
> "Wie wichtig ist eine bestehende Community deiner Religion oder Vereinigung?"

**AI-Folgefragen:**
- "Zu welcher Religionsgemeinschaft gehörst du?" (keine / christlich / muslimisch / juedisch / Zeugen Jehovas / andere)
- "Welche Vereine sind dir wichtig?" (Sport / Hobby / Berufsverband)

**Laender-Bewertungslogik:**
Basierend auf Gemeindegroesse der spezifischen Gruppe im Zielland.

---

### 8.1 Arbeitsmarkt & Selbstaendigkeit (Karriere)

**Hauptfrage:**
> "Wie wichtig ist ein guter Arbeitsmarkt oder Gruenderfreundlichkeit?"

**AI-Folgefragen:**
- "Planst du einen lokalen Job zu suchen?"
- "Moechtest du ein Unternehmen gruenden?"
- "In welcher Branche?"

**Laender-Bewertungslogik:**
| Symbol | Kriterium |
|--------|-----------|
| ++ | Niedriger Arbeitslosigkeit, Gruenderfreundlich | Niederlande, UK, Schweiz |
| o | OK Arbeitsmarkt | Spanien, Portugal |
| -- | Hohe Arbeitslosigkeit, schwierige Gruendung | Suedeuropa Krisenlaender |

---

### 9.1 Kinder & Bildung (Familie+)

**Hauptfrage:**
> "Wie wichtig ist Qualitaet der Schulen und Kinderbetreuung?"

**Wenn Kinder vorhanden:**
- Alter der Kinder
- Internationale Schule gewuenscht?
- Sprachwunsch fuer Schule?

**Laender-Bewertungslogik:**
| Symbol | Kriterium |
|--------|-----------|
| ++ | Exzellentes Schulsystem, viele int. Schulen | Skandinavien, Niederlande, Singapur |
| o | Gutes System, int. Schulen in Staedten | Spanien, Portugal |
| -- | Schlechtes oeffentliches System, keine int. Schulen |

---

### 9.2 Lebensqualitaet & Lebenserwartung (Familie+)

**Hauptfrage:**
> "Wie wichtig ist allgemein hohe Lebensqualitaet?"

**Laender-Bewertungslogik:**
| Symbol | Kriterium | Datenquelle |
|--------|-----------|-------------|
| ++ | Top 20 HDI, Lebenserwartung >80 Jahre | Norwegen, Schweiz, Australien |
| o | HDI 20-50, Lebenserwartung 75-80 | Thailand, Mexiko |
| -- | Niedriger HDI, Lebenserwartung <70 | Entwicklungslaender |

---

## Scoring-Formel

### Gesamtscore pro Land:

```
Gesamtscore = Σ (Kriterium_Score × Nutzer_Gewichtung)

wobei:
- Kriterium_Score: ++ = 2, o = 1, -- = 0
- Nutzer_Gewichtung: 1-5

Maximaler Score = Σ (2 × alle_Gewichtungen)

Prozent = (Gesamtscore / Maximaler_Score) × 100
```

### Beispiel:

| Kriterium | Gewichtung | Portugal Score | Berechnung |
|-----------|------------|----------------|------------|
| Lebenskosten | 5 | ++ (2) | 5 × 2 = 10 |
| Klima | 4 | ++ (2) | 4 × 2 = 8 |
| Sprache | 3 | o (1) | 3 × 1 = 3 |
| **Summe** | 12 | | **21 / 24 = 87.5%** |

---

**Naechster Schritt:** Wireframes fuer UI/UX erstellen

