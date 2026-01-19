'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string | null
  full_name: string | null
  created_at: string
  subscription_tier: string | null
  analysisCount: number
}

interface UserTableProps {
  users: User[]
}

export function UserTable({ users }: UserTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState<string | null>(null)
  const router = useRouter()

  const handleDelete = async (userId: string) => {
    setDeletingId(userId)
    
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Fehler beim Löschen')
      }

      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Fehler beim Löschen')
    } finally {
      setDeletingId(null)
      setShowConfirm(null)
    }
  }

  const handleExport = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/export`)
      if (!res.ok) throw new Error('Export fehlgeschlagen')
      
      const data = await res.json()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `user-export-${userId.substring(0, 8)}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      alert('Export fehlgeschlagen')
    }
  }

  if (users.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
        <p className="text-slate-500">Keine User gefunden</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="text-left px-6 py-4 text-sm font-medium text-slate-600">Email</th>
            <th className="text-left px-6 py-4 text-sm font-medium text-slate-600">Name</th>
            <th className="text-left px-6 py-4 text-sm font-medium text-slate-600">Analysen</th>
            <th className="text-left px-6 py-4 text-sm font-medium text-slate-600">Registriert</th>
            <th className="text-right px-6 py-4 text-sm font-medium text-slate-600">Aktionen</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b border-slate-100 last:border-0">
              <td className="px-6 py-4">
                <span className="text-sm text-slate-800">{user.email || '-'}</span>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm text-slate-600">{user.full_name || '-'}</span>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm text-slate-600">{user.analysisCount}</span>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm text-slate-500">
                  {new Date(user.created_at).toLocaleDateString('de-DE')}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleExport(user.id)}
                    className="text-xs px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    Export
                  </button>
                  
                  {showConfirm === user.id ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDelete(user.id)}
                        disabled={deletingId === user.id}
                        className="text-xs px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        {deletingId === user.id ? 'Löscht...' : 'Bestätigen'}
                      </button>
                      <button
                        onClick={() => setShowConfirm(null)}
                        className="text-xs px-3 py-1.5 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition-colors"
                      >
                        Abbrechen
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowConfirm(user.id)}
                      className="text-xs px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      Löschen
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

