# Story 11.3: Dynamic Pricing Support

## Story
**Als** Plattform-Betreiber
**möchte ich** den Preis dynamisch aus der Datenbank laden
**damit** Preisänderungen und Rabattcodes unterstützt werden

## Status
- [x] Story erstellt
- [ ] In Entwicklung
- [ ] Code Review
- [ ] Abgeschlossen

## Akzeptanzkriterien

### AC1: Preis aus DB laden
- [ ] `price_config` Tabelle (oder Env-Variable als Fallback)
- [ ] Webhook validiert gegen aktuellen Preis

### AC2: Rabattcode-Validierung im Webhook
- [ ] Bei Rabattcode: Reduzierter Betrag akzeptieren
- [ ] Minimum-Betrag prüfen statt exaktem Betrag

## Technische Details

### Ansatz: Minimum-Betrag Validierung
```typescript
// src/app/api/webhook/route.ts

// Statt exaktem Betrag: Minimum prüfen
const MINIMUM_AMOUNT = 100 // 1€ Minimum (für 100% Rabatt-Edge-Case)
const STANDARD_AMOUNT = 2999

// Bei Rabattcodes kann der Betrag niedriger sein
if (amountTotal < MINIMUM_AMOUNT) {
  throw new Error(`Payment amount too low: ${amountTotal}`)
}

// Optional: Rabattcode-Validierung
if (amountTotal < STANDARD_AMOUNT) {
  // Prüfen ob ein gültiger Rabattcode verwendet wurde
  const discountApplied = session.total_details?.amount_discount
  if (!discountApplied) {
    throw new Error(`Underpayment without valid discount`)
  }
}
```

## Abhängigkeiten
- Story 11.4 (Stripe Coupon Integration) für vollständige Lösung

## Schätzung
- **Aufwand**: 30 Minuten
- **Komplexität**: Niedrig

