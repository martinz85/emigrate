/**
 * Subscription Success Page
 * Story 8.2: Subscription Checkout
 * 
 * Displays welcome message after successful PRO subscription.
 * Automatically redirects to dashboard after 5 seconds.
 */

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

// Initialize Stripe
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })
  : null

interface PageProps {
  searchParams: Promise<{ session_id?: string }>
}

export default async function SubscriptionSuccessPage({ searchParams }: PageProps) {
  const params = await searchParams
  const sessionId = params.session_id

  // Validate session
  if (!sessionId || !stripe) {
    redirect('/pricing')
  }

  // Verify session with Stripe
  let session: Stripe.Checkout.Session | null = null
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    })
  } catch (error) {
    console.error('Failed to retrieve session:', error)
    redirect('/pricing')
  }

  // Validate session is for subscription
  if (session.mode !== 'subscription' || session.payment_status !== 'paid') {
    redirect('/pricing')
  }

  // Get current user
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get subscription details
  const subscription = session.subscription as Stripe.Subscription | null
  const billing = session.metadata?.billing || 
    (subscription?.items.data[0]?.price?.recurring?.interval === 'year' ? 'jährlich' : 'monatlich')
  
  const periodEnd = subscription?.current_period_end 
    ? new Date(subscription.current_period_end * 1000).toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 max-w-2xl w-full">
        {/* Success Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/20 shadow-2xl text-center">
          {/* Animated checkmark */}
          <div className="w-24 h-24 mx-auto mb-8 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-ping opacity-25" />
            <div className="relative w-full h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
              <svg 
                className="w-12 h-12 text-white animate-[scale_0.3s_ease-out]" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                strokeWidth={3}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Welcome message */}
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Willkommen bei <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">PRO</span>! 🎉
          </h1>

          <p className="text-xl text-gray-300 mb-8">
            Deine Zahlung war erfolgreich. Du hast jetzt Zugang zu allen Premium-Features!
          </p>

          {/* Subscription details */}
          <div className="bg-white/5 rounded-2xl p-6 mb-8 text-left">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span>👑</span> Dein Abo-Details
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-gray-300">
                <span>Plan</span>
                <span className="font-medium text-white">Auswanderer PRO</span>
              </div>
              <div className="flex justify-between items-center text-gray-300">
                <span>Abrechnungszyklus</span>
                <span className="font-medium text-white capitalize">{billing}</span>
              </div>
              {periodEnd && (
                <div className="flex justify-between items-center text-gray-300">
                  <span>Nächste Verlängerung</span>
                  <span className="font-medium text-white">{periodEnd}</span>
                </div>
              )}
            </div>
          </div>

          {/* PRO Features teaser */}
          <div className="grid grid-cols-2 gap-4 mb-8 text-left">
            <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/20">
              <span className="text-2xl">📊</span>
              <h3 className="font-semibold text-white mt-2">Unbegrenzte Analysen</h3>
              <p className="text-sm text-gray-400">Keine Limits mehr</p>
            </div>
            <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
              <span className="text-2xl">📚</span>
              <h3 className="font-semibold text-white mt-2">Alle E-Books</h3>
              <p className="text-sm text-gray-400">Kostenloser Zugang</p>
            </div>
            <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/20">
              <span className="text-2xl">🎯</span>
              <h3 className="font-semibold text-white mt-2">Region & Stadt</h3>
              <p className="text-sm text-gray-400">Detaillierte Empfehlungen</p>
            </div>
            <div className="bg-orange-500/10 rounded-xl p-4 border border-orange-500/20">
              <span className="text-2xl">🗺️</span>
              <h3 className="font-semibold text-white mt-2">Auswander-Roadmap</h3>
              <p className="text-sm text-gray-400">Persönlicher Fahrplan</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="/dashboard"
              className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-semibold py-4 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl"
            >
              <span>Zum Dashboard</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link 
              href="/fragen"
              className="flex-1 inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-4 px-8 rounded-xl transition-all border border-white/20"
            >
              <span>🚀</span>
              <span>Erste PRO-Analyse starten</span>
            </Link>
          </div>

          {/* Auto-redirect notice */}
          <p className="mt-8 text-sm text-gray-400">
            Du wirst automatisch weitergeleitet...
          </p>
        </div>

        {/* Support link */}
        <p className="text-center text-gray-400 mt-6 text-sm">
          Fragen? <Link href="/kontakt" className="text-purple-400 hover:text-purple-300">Kontaktiere uns</Link>
        </p>
      </div>

      {/* Client-side redirect script */}
      <script dangerouslySetInnerHTML={{
        __html: `
          setTimeout(function() {
            window.location.href = '/dashboard';
          }, 5000);
        `
      }} />
    </div>
  )
}

export const metadata = {
  title: 'Willkommen bei PRO! | Auswanderer-Plattform',
  description: 'Dein PRO-Abo ist aktiv. Entdecke alle Premium-Features.',
}

