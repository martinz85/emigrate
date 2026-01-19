'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'

export default function AdminResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Check if we have a valid session from the reset link
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setError('Ungültiger oder abgelaufener Reset-Link. Bitte fordere einen neuen an.')
      }
    }
    checkSession()
  }, [supabase])

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate passwords
    if (password.length < 8) {
      setError('Passwort muss mindestens 8 Zeichen lang sein')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwörter stimmen nicht überein')
      return
    }

    setIsLoading(true)

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      })

      if (updateError) {
        setError(updateError.message)
        return
      }

      setSuccess(true)
      
      // Redirect to admin after 2 seconds
      setTimeout(() => {
        router.push('/admin')
      }, 2000)
    } catch (err) {
      console.error('Reset error:', err)
      setError('Ein Fehler ist aufgetreten')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✅</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Passwort geändert!</h1>
          <p className="text-slate-600">Du wirst zum Admin-Bereich weitergeleitet...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold text-white">
            <span className="text-3xl">🌍</span>
            <span>Auswanderer</span>
          </Link>
          <p className="text-slate-400 mt-2">Admin-Bereich</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🔑</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Neues Passwort</h1>
            <p className="text-slate-600 mt-1">Wähle ein sicheres Passwort</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                Neues Passwort
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Mindestens 8 Zeichen"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1">
                Passwort bestätigen
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Passwort wiederholen"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !password || !confirmPassword}
              className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                  Speichern...
                </span>
              ) : (
                'Passwort speichern'
              )}
            </button>
          </form>
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <Link href="/admin-login" className="text-slate-400 hover:text-white text-sm">
            ← Zurück zum Login
          </Link>
        </div>
      </div>
    </div>
  )
}

