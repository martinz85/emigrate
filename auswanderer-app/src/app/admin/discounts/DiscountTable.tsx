'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface Discount {
  id: string
  code: string
  discount_percent: number
  valid_from: string | null
  valid_until: string | null
  max_uses: number | null
  current_uses: number | null
  created_at: string | null
  created_by: string | null
}

interface DiscountTableProps {
  discounts: Discount[]
}

export function DiscountTable({ discounts }: DiscountTableProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const getStatus = (discount: Discount) => {
    const now = new Date()
    if (discount.valid_until && new Date(discount.valid_until) < now) {
      return { label: 'Abgelaufen', color: 'bg-red-100 text-red-700' }
    }
    if (discount.valid_from && new Date(discount.valid_from) > now) {
      return { label: 'Geplant', color: 'bg-yellow-100 text-yellow-700' }
    }
    if (discount.max_uses && (discount.current_uses ?? 0) >= discount.max_uses) {
      return { label: 'Aufgebraucht', color: 'bg-slate-100 text-slate-600' }
    }
    return { label: 'Aktiv', color: 'bg-emerald-100 text-emerald-700' }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Rabattcode wirklich löschen?')) return
    
    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/discounts/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Löschen fehlgeschlagen')
      router.refresh()
    } catch (error) {
      alert('Fehler beim Löschen')
    } finally {
      setDeletingId(null)
    }
  }

  if (discounts.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
        <p className="text-slate-500">Keine Rabattcodes vorhanden</p>
        <p className="text-sm text-slate-400 mt-1">Erstelle deinen ersten Code rechts →</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="text-left px-6 py-4 text-sm font-medium text-slate-600">Code</th>
            <th className="text-left px-6 py-4 text-sm font-medium text-slate-600">Rabatt</th>
            <th className="text-left px-6 py-4 text-sm font-medium text-slate-600">Nutzung</th>
            <th className="text-left px-6 py-4 text-sm font-medium text-slate-600">Status</th>
            <th className="text-right px-6 py-4 text-sm font-medium text-slate-600">Aktionen</th>
          </tr>
        </thead>
        <tbody>
          {discounts.map((discount) => {
            const status = getStatus(discount)
            return (
              <tr key={discount.id} className="border-b border-slate-100 last:border-0">
                <td className="px-6 py-4">
                  <code className="text-sm bg-slate-100 px-2 py-1 rounded font-mono">
                    {discount.code}
                  </code>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-emerald-600">
                    {discount.discount_percent}%
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-600">
                    {discount.current_uses ?? 0}
                    {discount.max_uses ? ` / ${discount.max_uses}` : ' (unbegrenzt)'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${status.color}`}>
                    {status.label}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleDelete(discount.id)}
                    disabled={deletingId === discount.id}
                    className="text-xs px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                  >
                    {deletingId === discount.id ? '...' : 'Löschen'}
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

