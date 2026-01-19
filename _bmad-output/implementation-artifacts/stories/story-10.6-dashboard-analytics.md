# Story 10.6: Dashboard Analytics

## Story
**Als** Admin
**möchte ich** wichtige KPIs auf einen Blick sehen
**damit** ich den Erfolg der Plattform monitoren kann

## Status
- [x] Story erstellt
- [ ] In Entwicklung
- [ ] Code Review
- [ ] Abgeschlossen

## Akzeptanzkriterien

### AC1: KPI-Cards
- [ ] Gesamtumsatz (Summe aller bezahlten Analysen)
- [ ] Anzahl bezahlter Analysen
- [ ] Conversion Rate (bezahlt/gesamt)
- [ ] Anzahl User
- [ ] Newsletter-Abonnenten

### AC2: Zeitraumfilter
- [ ] Heute, 7 Tage, 30 Tage, Gesamt
- [ ] KPIs aktualisieren sich

### AC3: Einfache Charts (optional)
- [ ] Umsatz pro Tag (letzte 30 Tage)
- [ ] Analysen pro Tag

## Technische Details

### Analytics API
```typescript
// src/app/api/admin/analytics/route.ts
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const period = searchParams.get('period') || '30d'
  
  const supabase = createAdminClient()
  const startDate = getStartDate(period)

  // Paid analyses
  const { count: paidAnalyses } = await supabase
    .from('analyses')
    .select('*', { count: 'exact', head: true })
    .eq('paid', true)
    .gte('paid_at', startDate)

  // Total analyses
  const { count: totalAnalyses } = await supabase
    .from('analyses')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startDate)

  // Revenue (29.99 per paid analysis)
  const revenue = (paidAnalyses || 0) * 29.99

  // Users
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  // Newsletter
  const { count: newsletterSubs } = await supabase
    .from('newsletter_subscribers')
    .select('*', { count: 'exact', head: true })

  return NextResponse.json({
    revenue,
    paidAnalyses,
    totalAnalyses,
    conversionRate: totalAnalyses ? ((paidAnalyses || 0) / totalAnalyses * 100).toFixed(1) : 0,
    totalUsers,
    newsletterSubs,
  })
}
```

### Dashboard-Seite
```typescript
// src/app/admin/page.tsx
export default async function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <PeriodSelector />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard title="Umsatz" icon="💰" />
        <KPICard title="Bezahlte Analysen" icon="✅" />
        <KPICard title="Conversion Rate" icon="📈" />
        <KPICard title="Newsletter" icon="📧" />
      </div>
    </div>
  )
}
```

## UI/UX Details
- Cards mit großen Zahlen
- Farbcodierung (Grün für positiv, Rot für negativ)
- Trend-Indikator (↑ +5% vs. letzte Periode)

## Abhängigkeiten
- Story 10.1 (Admin Auth)
- Alle anderen Admin-Stories (für vollständige Daten)

## Schätzung
- **Aufwand**: 3-4 Stunden
- **Komplexität**: Mittel

## Notes
- Für MVP: Keine echten Charts, nur Zahlen
- Stripe-Daten könnten für genauere Revenue-Zahlen genutzt werden
- Performance: Queries cachen für große Datenmengen

