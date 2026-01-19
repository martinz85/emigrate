'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

function LoginContent() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/dashboard'
  const error = searchParams.get('error')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    // Basic email validation
    if (!email || !email.includes('@')) {
      setMessage({ type: 'error', text: 'Bitte gib eine gültige Email-Adresse ein.' })
      setIsLoading(false)
      return
    }

    try {
      const supabase = createClient()
      
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      })

      if (error) {
        throw error
      }

      setMessage({
        type: 'success',
        text: 'Check deine Emails! Wir haben dir einen Login-Link gesendet.',
      })
      setEmail('')
    } catch (err) {
      console.error('Login error:', err)
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Header />
      <main id="main-content" className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-20">
        <div className="max-w-md mx-auto px-4 py-12">
          {/* Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {/* Icon */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 text-4xl mb-4">
                🌍
              </div>
              <h1 className="font-heading text-2xl font-bold text-slate-900">
                Willkommen
              </h1>
              <p className="text-slate-600 mt-2">
                Melde dich an, um deine Analysen zu speichern und wiederzufinden.
              </p>
            </div>

            {/* Error from URL (e.g., auth callback failed) */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm" role="alert">
                <p>Anmeldung fehlgeschlagen. Bitte versuche es erneut.</p>
              </div>
            )}

            {/* Message */}
            {message && (
              <div
                className={`mb-6 p-4 rounded-lg text-sm ${
                  message.type === 'success'
                    ? 'bg-green-50 border border-green-200 text-green-700'
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}
                role={message.type === 'error' ? 'alert' : 'status'}
              >
                {message.type === 'success' && (
                  <div className="flex items-center gap-2">
                    <span className="text-xl" aria-hidden="true">📧</span>
                    <span>{message.text}</span>
                  </div>
                )}
                {message.type === 'error' && message.text}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                  Email-Adresse
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="deine@email.de"
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  autoComplete="email"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Wird gesendet...
                  </span>
                ) : (
                  'Magic Link senden'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 text-slate-500">
                  oder
                </span>
              </div>
            </div>

            {/* Guest CTA */}
            <div className="text-center">
              <p className="text-sm text-slate-600 mb-3">
                Noch keinen Account? Kein Problem!
              </p>
              <Link
                href="/analyse"
                className="inline-block w-full py-3 px-4 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Analyse als Gast starten
              </Link>
              <p className="text-xs text-slate-500 mt-2">
                Du kannst dich auch später anmelden, um deine Analyse zu speichern.
              </p>
            </div>
          </div>

          {/* Privacy note */}
          <p className="text-center text-xs text-slate-500 mt-6">
            Mit der Anmeldung stimmst du unseren{' '}
            <Link href="/agb" className="underline hover:text-primary-500">
              AGB
            </Link>{' '}
            und der{' '}
            <Link href="/datenschutz" className="underline hover:text-primary-500">
              Datenschutzerklärung
            </Link>{' '}
            zu.
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
