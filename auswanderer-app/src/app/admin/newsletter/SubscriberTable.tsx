'use client'

interface Subscriber {
  id: string
  email: string
  source: string | null
  opted_in_at: string
  language: string | null
}

interface SubscriberTableProps {
  subscribers: Subscriber[]
}

export function SubscriberTable({ subscribers }: SubscriberTableProps) {
  if (subscribers.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
        <p className="text-slate-500">Keine Abonnenten vorhanden</p>
      </div>
    )
  }

  const getSourceBadge = (source: string | null) => {
    switch (source) {
      case 'purchase':
        return { label: 'Kauf', color: 'bg-emerald-100 text-emerald-700' }
      case 'website':
        return { label: 'Website', color: 'bg-blue-100 text-blue-700' }
      case 'import':
        return { label: 'Import', color: 'bg-slate-100 text-slate-600' }
      default:
        return { label: 'Unbekannt', color: 'bg-slate-100 text-slate-600' }
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="text-left px-6 py-4 text-sm font-medium text-slate-600">Email</th>
            <th className="text-left px-6 py-4 text-sm font-medium text-slate-600">Quelle</th>
            <th className="text-left px-6 py-4 text-sm font-medium text-slate-600">Sprache</th>
            <th className="text-left px-6 py-4 text-sm font-medium text-slate-600">Opt-in Datum</th>
          </tr>
        </thead>
        <tbody>
          {subscribers.map((subscriber) => {
            const source = getSourceBadge(subscriber.source)
            return (
              <tr key={subscriber.id} className="border-b border-slate-100 last:border-0">
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-800">{subscriber.email}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${source.color}`}>
                    {source.label}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-600">{subscriber.language || 'de'}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-500">
                    {new Date(subscriber.opted_in_at).toLocaleDateString('de-DE')}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

