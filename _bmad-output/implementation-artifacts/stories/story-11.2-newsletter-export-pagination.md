# Story 11.2: Newsletter Export Pagination

## Story
**Als** Admin
**möchte ich** große Newsletter-Listen exportieren können
**damit** auch bei 100k+ Abonnenten keine Speicherprobleme auftreten

## Status
- [x] Story erstellt
- [ ] In Entwicklung
- [ ] Code Review
- [ ] Abgeschlossen

## Akzeptanzkriterien

### AC1: Pagination
- [ ] Export mit konfigurierbarem Limit (default: 10.000)
- [ ] Bei Überschreitung: Warnung an Admin

### AC2: Streaming (optional)
- [ ] Für sehr große Exports: Cursor-basiertes Streaming
- [ ] Oder: Background-Job mit Download-Link per Email

## Technische Details

### Einfache Lösung: Limit mit Warnung
```typescript
// src/app/api/admin/newsletter/export/route.ts

const MAX_EXPORT_SIZE = 10000

// Query mit Limit
const { data, count } = await supabase
  .from('newsletter_subscribers')
  .select('email, opted_in_at, source, language', { count: 'exact' })
  .order('opted_in_at', { ascending: false })
  .limit(MAX_EXPORT_SIZE)

// Warnung wenn mehr vorhanden
const warning = count && count > MAX_EXPORT_SIZE 
  ? `Export limitiert auf ${MAX_EXPORT_SIZE} von ${count} Abonnenten`
  : null
```

## Abhängigkeiten
- Keine

## Schätzung
- **Aufwand**: 30 Minuten
- **Komplexität**: Niedrig

