'use client'

/**
 * Cancel Modal Component
 * Story 8.3: Subscription Management
 * 
 * Confirmation dialog for subscription cancellation.
 */

import { useState } from 'react'

interface CancelModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<{ success: boolean; cancelAt?: string; error?: string }>
  periodEnd?: string | null
}

export function CancelModal({ isOpen, onClose, onConfirm, periodEnd }: CancelModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [result, setResult] = useState<{ success: boolean; cancelAt?: string; error?: string } | null>(null)

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'dem Ende deines Abrechnungszeitraums'
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      const res = await onConfirm()
      setResult(res)
    } catch (error) {
      setResult({ success: false, error: 'Ein Fehler ist aufgetreten' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setResult(null)
    setFeedback('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
        {!result ? (
          <>
            {/* Header */}
            <div className="text-center mb-6">
              <span className="text-5xl mb-4 block">😢</span>
              <h2 className="text-2xl font-bold text-white mb-2">
                Schade, dass du gehst!
              </h2>
              <p className="text-gray-400">
                Bist du sicher, dass du dein PRO-Abo kündigen möchtest?
              </p>
            </div>

            {/* Info box */}
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
              <p className="text-yellow-300 text-sm">
                ℹ️ Dein Zugang bleibt bis zum <strong>{formatDate(periodEnd)}</strong> aktiv. 
                Danach wirst du auf den kostenlosen Plan zurückgestuft.
              </p>
            </div>

            {/* What you'll lose */}
            <div className="mb-6">
              <p className="text-sm text-gray-400 mb-3">Das wirst du verlieren:</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="text-red-400">✕</span>
                  Unbegrenzte Analysen
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="text-red-400">✕</span>
                  Zugang zu allen E-Books
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="text-red-400">✕</span>
                  Region & Stadt Empfehlungen
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="text-red-400">✕</span>
                  Auswander-Roadmap
                </li>
              </ul>
            </div>

            {/* Optional feedback */}
            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-2">
                Warum kündigst du? (optional)
              </label>
              <select
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Bitte auswählen...</option>
                <option value="too_expensive">Zu teuer</option>
                <option value="not_using">Nutze es nicht genug</option>
                <option value="found_alternative">Andere Lösung gefunden</option>
                <option value="missing_features">Fehlende Features</option>
                <option value="moving_done">Ich bin bereits ausgewandert!</option>
                <option value="other">Sonstiges</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 py-3 px-4 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-all border border-white/20"
              >
                Abbrechen
              </button>
              <button
                onClick={handleConfirm}
                disabled={isLoading}
                className="flex-1 py-3 px-4 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-medium rounded-xl transition-all border border-red-500/30 disabled:opacity-50"
              >
                {isLoading ? 'Wird gekündigt...' : 'Ja, kündigen'}
              </button>
            </div>
          </>
        ) : result.success ? (
          <>
            {/* Success */}
            <div className="text-center">
              <span className="text-5xl mb-4 block">✓</span>
              <h2 className="text-2xl font-bold text-white mb-2">
                Abo gekündigt
              </h2>
              <p className="text-gray-400 mb-6">
                Dein Zugang bleibt bis zum <strong className="text-white">{result.cancelAt}</strong> aktiv.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Du kannst die Kündigung jederzeit widerrufen.
              </p>
              <button
                onClick={handleClose}
                className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-all border border-white/20"
              >
                Schließen
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Error */}
            <div className="text-center">
              <span className="text-5xl mb-4 block">❌</span>
              <h2 className="text-2xl font-bold text-white mb-2">
                Fehler
              </h2>
              <p className="text-red-400 mb-6">
                {result.error || 'Ein Fehler ist aufgetreten'}
              </p>
              <button
                onClick={handleClose}
                className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-all border border-white/20"
              >
                Schließen
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

