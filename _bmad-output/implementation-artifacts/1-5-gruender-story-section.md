# Story 1.5: Gründer-Story Section

Status: done

## Story

Als potentieller Kunde,
möchte ich die Geschichte des Gründers lesen,
damit ich Vertrauen in die Plattform aufbaue.

## Acceptance Criteria

1. **AC1:** Ich sehe Martins persönliche Auswanderungs-Geschichte
2. **AC2:** Ich sehe ein Foto oder Illustration
3. **AC3:** Die Story vermittelt Authentizität und Expertise

## Tasks / Subtasks

- [x] **Task 1: FounderStory Komponente erstellen** (AC: 1, 2, 3)
  - [x] 1.1 Komponente in src/components/landing/FounderStory.tsx
  - [x] 1.2 Persönliche Geschichte in Zitaten
  - [x] 1.3 Platzhalter für Foto mit Emoji
  - [x] 1.4 Journey-Badge (PL → DE → SE)

- [x] **Task 2: Visuelle Gestaltung** (AC: 3)
  - [x] 2.1 Gradient Background (Teal)
  - [x] 2.2 Dekorative Blur-Elemente
  - [x] 2.3 2-Column Layout (Bild + Text)

- [x] **Task 3: Integration**
  - [x] 3.1 Einbindung in Landing Page
  - [x] 3.2 Export in barrel file

## Dev Notes

### Implementierung

Die Komponente wurde bereits in Story 1.1 erstellt.

**Inhalte:**
- Zitat 1: Zweimal ausgewandert (Polen → Deutschland → Schweden)
- Zitat 2: Kenntnis aller Schritte (Bürokratie, Finanzen, Community)
- Zitat 3: Mission: Wissen teilen, anderen helfen
- Signatur: "— Martin, Gründer"

**Features:**
- Teal Gradient Background
- Placeholder für Foto (Emoji)
- Journey-Badge mit Flaggen (🇵🇱 → 🇩🇪 → 🇸🇪)
- Responsive 2-Column Layout

### File List

- `auswanderer-app/src/components/landing/FounderStory.tsx`

