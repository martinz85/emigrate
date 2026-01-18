# Story 1.7: FAQ Section

Status: done

## Story

Als potentieller Kunde,
möchte ich Antworten auf häufige Fragen finden,
damit meine Bedenken ausgeräumt werden.

## Acceptance Criteria

1. **AC1:** Ich sehe mindestens 6 häufig gestellte Fragen
2. **AC2:** Ich kann Fragen auf/zuklappen (Accordion)
3. **AC3:** Die Fragen adressieren typische Bedenken

## Tasks / Subtasks

- [x] **Task 1: FAQSection Komponente erstellen** (AC: 1, 3)
  - [x] 1.1 Komponente in src/components/landing/FAQSection.tsx
  - [x] 1.2 6 FAQ-Einträge mit Frage + Antwort
  - [x] 1.3 Typische Bedenken adressiert

- [x] **Task 2: Accordion-Funktionalität** (AC: 2)
  - [x] 2.1 useState für openIndex
  - [x] 2.2 Toggle bei Klick
  - [x] 2.3 Animierter Pfeil (rotate)
  - [x] 2.4 Erste Frage standardmäßig offen

- [x] **Task 3: Integration**
  - [x] 3.1 Einbindung in Landing Page
  - [x] 3.2 Export in barrel file

## Dev Notes

### Implementierung

Die Komponente wurde bereits in Story 1.1 erstellt.

**6 FAQ-Einträge:**
1. Wie funktioniert die AI-Analyse?
2. Welche Länder werden analysiert?
3. Ist die Vorschau wirklich kostenlos?
4. Was ist im PRO-Abo enthalten?
5. Kann ich das PRO-Abo kündigen?
6. Ist das eine Rechts- oder Steuerberatung?

**Features:**
- Accordion mit useState
- Erste Frage standardmäßig geöffnet
- Animierter Dropdown-Pfeil
- Border + Rounded für jeden Eintrag
- Hover-Effekt auf Fragen

### File List

- `auswanderer-app/src/components/landing/FAQSection.tsx`

