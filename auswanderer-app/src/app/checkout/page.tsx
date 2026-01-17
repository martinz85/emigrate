'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import Link from 'next/link'

function CheckoutContent() {
  const searchParams = useSearchParams()
  const productType = searchParams.get('product') || 'pdf'
  
  const [email, setEmail] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const products: Record<string, { name: string; price: string; features: string[] }> = {
    pdf: {
      name: 'Auswanderungsanalyse PDF',
      price: '39,00 EUR',
      features: [
        'Vollständige 5-Seiten PDF',
        'Alle 26 Kriterien analysiert',
        'Top 5 Länder mit Details',
        'Persönliche Empfehlung',
        'Konkrete nächste Schritte',
      ],
    },
    pro: {
      name: 'Auswanderer PRO (Monatsabo)',
      price: '14,99 EUR/Monat',
      features: [
        'Unbegrenzte AI-Analysen',
        'Alle PDFs inklusive',
        'Alle 4 E-Books inklusive',
        'Projekt-Dashboard',
        'Checklisten & Timeline',
        'Länder-Vergleich Tool',
        'Visa-Navigator',
        'Kosten-Rechner',
        'Jederzeit kündbar',
      ],
    },
  }

  const product = products[productType] || products.pdf

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productType,
          email,
          analysisId: 'mock-analysis-id',
        }),
      })

      const data = await response.json()
      
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      }
    } catch (error) {
      console.error('Checkout error:', error)
      setIsProcessing(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <Header />
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-heading text-3xl font-bold text-center mb-8">
            Checkout
          </h1>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div className="card">
              <h2 className="font-heading text-xl font-bold mb-4">Deine Bestellung</h2>
              
              <div className="border-b border-slate-200 pb-4 mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{product.name}</p>
                    <ul className="text-sm text-slate-600 mt-2 space-y-1">
                      {product.features.slice(0, 4).map((f) => (
                        <li key={f} className="flex items-center gap-1">
                          <span className="text-green-500">✓</span> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <p className="font-bold text-lg">{product.price}</p>
                </div>
              </div>

              <div className="flex justify-between font-bold text-lg">
                <span>Gesamt</span>
                <span>{product.price}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">inkl. MwSt</p>

              {productType === 'pdf' && (
                <div className="mt-6 p-4 bg-primary-50 rounded-lg">
                  <p className="text-sm font-medium text-primary-700">
                    💡 Tipp: Mit PRO für nur 14,99€/Monat bekommst du 
                    unbegrenzte Analysen + alle E-Books!
                  </p>
                  <Link
                    href="/checkout?product=pro"
                    className="text-primary-600 text-sm font-semibold hover:underline"
                  >
                    Zu PRO wechseln →
                  </Link>
                </div>
              )}
            </div>

            {/* Payment Form */}
            <div className="card">
              <h2 className="font-heading text-xl font-bold mb-4">Zahlungsinformationen</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    E-Mail-Adresse
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="deine@email.de"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Hierhin senden wir deine PDF
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600">
                    Du wirst zu unserem sicheren Zahlungspartner Stripe weitergeleitet.
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    required
                    id="terms"
                    className="mt-1"
                  />
                  <label htmlFor="terms" className="text-sm text-slate-600">
                    Ich akzeptiere die{' '}
                    <Link href="/agb" className="text-primary-500 hover:underline">AGB</Link>
                    {' '}und{' '}
                    <Link href="/datenschutz" className="text-primary-500 hover:underline">Datenschutzbestimmungen</Link>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="btn-cta w-full flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Wird verarbeitet...
                    </>
                  ) : (
                    <>
                      🔒 Jetzt bezahlen - {product.price}
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-4 text-slate-400 text-sm">
                  <span>Powered by</span>
                  <span className="font-bold">Stripe</span>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-slate-50">
        <Header />
        <div className="pt-24 pb-12 px-4 text-center">
          Laden...
        </div>
      </main>
    }>
      <CheckoutContent />
    </Suspense>
  )
}

