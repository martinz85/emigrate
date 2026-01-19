# Story 10.5: Newsletter Export

## Story
**Als** Admin
**möchte ich** Newsletter-Abonnenten exportieren können
**damit** E-Mail-Marketing-Tools (Odoo, Mailchimp) befüllt werden können

## Status
- [x] Story erstellt
- [ ] In Entwicklung
- [ ] Code Review
- [ ] Abgeschlossen

## Akzeptanzkriterien

### AC1: Abonnenten-Liste
- [ ] Tabelle mit allen Newsletter-Abonnenten
- [ ] Email, Registrierungsdatum, Quelle (Kauf/Website)
- [ ] Pagination

### AC2: Export-Funktion
- [ ] "CSV exportieren" Button
- [ ] "JSON exportieren" Button
- [ ] Filterung nach Datum (von/bis)

### AC3: Export-Inhalt
- [ ] Email
- [ ] Opt-in Datum
- [ ] Sprache (de)
- [ ] Quelle

## Technische Details

### Newsletter Tabelle (bereits vorhanden)
```sql
-- Aus Migration 001
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  source TEXT, -- 'website', 'purchase', 'import'
  opted_in_at TIMESTAMPTZ DEFAULT NOW(),
  language TEXT DEFAULT 'de',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Export API
```typescript
// src/app/api/admin/newsletter/export/route.ts
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const format = searchParams.get('format') || 'csv'
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  const supabase = createAdminClient()
  
  let query = supabase
    .from('newsletter_subscribers')
    .select('email, opted_in_at, source, language')
    .order('opted_in_at', { ascending: false })

  if (from) query = query.gte('opted_in_at', from)
  if (to) query = query.lte('opted_in_at', to)

  const { data } = await query

  if (format === 'json') {
    return NextResponse.json(data)
  }

  // CSV format
  const csv = [
    'email,opted_in_at,source,language',
    ...data.map(row => 
      `${row.email},${row.opted_in_at},${row.source || ''},${row.language}`
    )
  ].join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="newsletter-export-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  })
}
```

### Newsletter-Seite
```typescript
// src/app/admin/newsletter/page.tsx
export default async function NewsletterPage() {
  const supabase = createAdminClient()
  
  const { data: subscribers, count } = await supabase
    .from('newsletter_subscribers')
    .select('*', { count: 'exact' })
    .order('opted_in_at', { ascending: false })
    .limit(50)

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1>Newsletter-Abonnenten ({count})</h1>
        <div className="flex gap-2">
          <ExportButton format="csv" />
          <ExportButton format="json" />
        </div>
      </div>
      <SubscriberTable subscribers={subscribers} />
    </div>
  )
}
```

## UI/UX Details
- Download-Buttons prominent platziert
- Datumsfilter für Export
- Anzeige der Gesamtzahl

## Abhängigkeiten
- Story 10.1 (Admin Auth)

## Schätzung
- **Aufwand**: 2 Stunden
- **Komplexität**: Niedrig

## Notes
- CSV-Format für Odoo/Mailchimp kompatibel
- DSGVO: Nur Opt-in Abonnenten exportieren
- Für MVP: Kein Import (manuell in Supabase)

