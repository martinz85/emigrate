# Business Agents - Auswanderer-Plattform

Diese Agents sind spezialisierte AI-Assistenten für verschiedene Business-Funktionen.

## Verfügbare Agents

| Agent | Name | Rolle | Aktivierung |
|-------|------|-------|-------------|
| 🎯 CEO | **Steve** | Business Strategy, Vision, Entscheidungen | `@steve-ceo` |
| 📣 Marketing | **Elma** | Marketing-Strategie, Kampagnen, Brand | `@elma-marketing` |
| 📈 SEO/CRO | **Julian** | SEO, Conversion-Optimierung | `@julian-seo-conversion` |
| 📊 Controller | **Linus** | Financial Tracking, KPIs, Reporting | `@linus-controller` |
| ⚖️ Legal | **Max** | DSGVO, Compliance, Risikoprüfung | `@max-lawyer` |

## Org-Chart

```
                    ┌─────────────┐
                    │   Steve     │
                    │    CEO      │
                    └──────┬──────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
   ┌─────┴─────┐    ┌─────┴─────┐    ┌─────┴─────┐
   │   Elma    │    │  Julian   │    │  Linus    │
   │ Marketing │    │ SEO/CRO   │    │Controller │
   └───────────┘    └───────────┘    └─────┬─────┘
                                           │
                                    ┌──────┴──────┐
                                    │    Max      │
                                    │   Legal     │
                                    └─────────────┘
```

## Verwendung

### In Cursor Chat

1. Öffne einen neuen Chat
2. Schreibe z.B.: "Aktiviere Steve (CEO Agent)"
3. Der Agent antwortet im entsprechenden Stil

### Beispiel-Prompts

**Steve (CEO):**
- "Erstelle mir einen Business Plan für die nächsten 12 Monate"
- "Welche strategischen Prioritäten sollten wir setzen?"
- "Bewerte diese Geschäftsentscheidung: [...]"

**Elma (Marketing):**
- "Entwickle eine Launch-Marketing-Strategie"
- "Welche Content-Ideen passen zu unserer Zielgruppe?"
- "Wie sollten wir unser Marketing-Budget verteilen?"

**Julian (SEO/CRO):**
- "Führe einen SEO-Audit durch"
- "Welche Keywords sollten wir targeten?"
- "Wie können wir die Conversion Rate verbessern?"

**Linus (Controller):**
- "Erstelle einen monatlichen Business Report"
- "Wie entwickeln sich unsere Unit Economics?"
- "Analysiere unseren Conversion Funnel"

**Max (Legal):**
- "Prüfe diese Marketing-Aussage auf rechtliche Risiken"
- "Was müssen wir für DSGVO-Compliance beachten?"
- "Welche rechtlichen Dokumente brauchen wir vor Launch?"

## Agent-Interaktion

Die Agents können zusammenarbeiten:

```
User: "Steve, bitte bitte Elma um eine Marketing-Strategie und Linus um eine Kosten-Analyse"

Steve: "Ich habe beide Agents beauftragt:

ELMA (Marketing):
[Marketing-Strategie-Zusammenfassung]

LINUS (Controller):
[Kosten-Analyse-Zusammenfassung]

Meine Empfehlung als CEO:
[Strategische Einordnung]"
```

## Wartung

Die Agent-Definitionen befinden sich in `.cursor/rules/agents/`:
- `steve-ceo.mdc`
- `elma-marketing.mdc`
- `julian-seo-conversion.mdc`
- `linus-controller.mdc`
- `max-lawyer.mdc`

Agents können angepasst werden, indem die `.mdc`-Dateien bearbeitet werden.

