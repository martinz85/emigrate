/**
 * E-Book Purchase Success Page
 * Story 7.2: E-Book Checkout
 */

import { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import Stripe from 'stripe'

export const metadata: Metadata = {
  title: 'Kauf erfolgreich | E-Books',
  robots: { index: false, follow: false },
}

// Initialize Stripe
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })
  : null

interface PageProps {
  searchParams: Promise<{ session_id?: string; free?: string }>
}

export default async function EbookSuccessPage({ searchParams }: PageProps) {
  const params = await searchParams
  const sessionId = params.session_id
  const isFree = params.free === 'true'

  // Handle free ebook case
  if (isFree) {
    return (
      <main className="min-h-screen bg-slate-50">
        <Header />
        <div className="pt-24 pb-16">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <SuccessContent
              title="E-Book freigeschaltet! 🎉"
              message="Das kostenlose E-Book wurde deinem Konto hinzugefügt."
            />
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  // Validate session_id
  if (!sessionId || !stripe) {
    redirect('/ebooks')
  }

  // Retrieve session from Stripe
  let session: Stripe.Checkout.Session | null = null
  let ebookTitle = 'Dein E-Book'
  let isBundle = false

  try {
    session = await stripe.checkout.sessions.retrieve(sessionId)
    
    if (session.payment_status !== 'paid') {
      redirect('/ebooks')
    }

    isBundle = session.metadata?.is_bundle === 'true'
    
    // Get ebook details from database
    const supabase = await createClient()
    const ebookId = session.metadata?.ebook_id

    if (ebookId) {
      const { data: ebook } = await (supabase as any)
        .from('ebooks')
        .select('title')
        .eq('id', ebookId)
        .single()

      if (ebook) {
        ebookTitle = ebook.title
      }
    }
  } catch (error) {
    console.error('Error retrieving session:', error)
    redirect('/ebooks')
  }

  const amount = session.amount_total 
    ? `${(session.amount_total / 100).toFixed(2).replace('.', ',')} €`
    : null

  return (
    <main className="min-h-screen bg-slate-50">
      <Header />
      <div className="pt-24 pb-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <SuccessContent
            title={isBundle ? 'Bundle-Kauf erfolgreich! 🎁' : 'Kauf erfolgreich! 🎉'}
            message={
              isBundle
                ? 'Du hast jetzt Zugang zu allen 4 E-Books.'
                : `"${ebookTitle}" wurde deinem Konto hinzugefügt.`
            }
            amount={amount}
            customerEmail={session.customer_details?.email || undefined}
          />
        </div>
      </div>
      <Footer />
    </main>
  )
}

interface SuccessContentProps {
  title: string
  message: string
  amount?: string | null
  customerEmail?: string
}

function SuccessContent({ title, message, amount, customerEmail }: SuccessContentProps) {
  return (
    <div className="card bg-white shadow-lg">
      {/* Success Icon */}
      <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
        <svg
          className="w-10 h-10 text-green-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <h1 className="font-heading text-2xl md:text-3xl font-bold mb-4 text-slate-800">
        {title}
      </h1>

      <p className="text-lg text-slate-600 mb-6">
        {message}
      </p>

      {amount && (
        <p className="text-slate-500 mb-6">
          Bezahlt: <strong>{amount}</strong>
        </p>
      )}

      {customerEmail && (
        <p className="text-sm text-slate-500 mb-6">
          Eine Bestätigung wurde an <strong>{customerEmail}</strong> gesendet.
        </p>
      )}

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/ebooks"
          className="btn-primary inline-flex items-center justify-center gap-2 px-6 py-3"
        >
          <span>📚</span>
          Jetzt lesen
        </Link>
        <Link
          href="/dashboard"
          className="btn-secondary inline-flex items-center justify-center gap-2 px-6 py-3"
        >
          Zum Dashboard
        </Link>
      </div>

      {/* Trust badges */}
      <div className="mt-8 pt-6 border-t border-slate-200">
        <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <span>📥</span>
            Sofortiger Zugang
          </div>
          <div className="flex items-center gap-2">
            <span>🔄</span>
            Lebenslanger Zugriff
          </div>
          <div className="flex items-center gap-2">
            <span>📱</span>
            Auf allen Geräten
          </div>
        </div>
      </div>
    </div>
  )
}

