import { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { PricingPageContent } from './PricingPageContent'

export const metadata: Metadata = {
  title: 'Preise | Auswanderer-Plattform',
  description: 'Transparente Preise für deine Auswanderungs-Analyse. Starte kostenlos oder werde PRO für unbegrenzte Analysen und alle Tools.',
}

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Header />
      
      <div className="pt-24 pb-16">
        {/* Hero */}
        <div className="max-w-7xl mx-auto px-4 text-center mb-12">
          <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Transparente Preise
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
            Starte kostenlos und upgrade wenn du bereit bist.
            <br className="hidden md:block" />
            Keine versteckten Kosten, jederzeit kündbar.
          </p>
        </div>

        {/* Pricing Content */}
        <div className="max-w-5xl mx-auto px-4">
          <PricingPageContent />
        </div>
      </div>

      <Footer />
    </main>
  )
}

