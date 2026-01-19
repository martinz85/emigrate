import { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { EbookGrid } from '@/components/ebooks'
import { EBOOKS, EBOOK_BUNDLE, getBundleSavings } from '@/lib/ebooks'
import { createClient } from '@/lib/supabase/server'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://auswanderer-plattform.de'

export const metadata: Metadata = {
  title: 'E-Books für Auswanderer | Auswanderer-Plattform',
  description: 'Expertenwissen für deinen Neustart im Ausland. 4 E-Books von erfahrenen Auswanderern – von der Entscheidung bis zum erfolgreichen Ankommen.',
  openGraph: {
    title: 'E-Books für Auswanderer',
    description: 'Expertenwissen für deinen Neustart im Ausland. 4 E-Books von erfahrenen Auswanderern.',
    type: 'website',
    url: `${BASE_URL}/ebooks`,
    images: [
      {
        url: `${BASE_URL}/og-ebooks.png`,
        width: 1200,
        height: 630,
        alt: 'E-Books für Auswanderer',
      },
    ],
  },
}

// JSON-LD structured data for products
function generateJsonLd() {
  const { originalPrice } = getBundleSavings()
  
  const products = [
    ...EBOOKS.map((ebook) => ({
      '@type': 'Product',
      name: ebook.title,
      description: ebook.description,
      offers: {
        '@type': 'Offer',
        price: (ebook.price / 100).toFixed(2),
        priceCurrency: 'EUR',
        availability: 'https://schema.org/InStock',
      },
      brand: {
        '@type': 'Brand',
        name: 'Auswanderer-Plattform',
      },
    })),
    {
      '@type': 'Product',
      name: EBOOK_BUNDLE.title,
      description: EBOOK_BUNDLE.description,
      offers: {
        '@type': 'AggregateOffer',
        lowPrice: (EBOOK_BUNDLE.price / 100).toFixed(2),
        highPrice: (originalPrice / 100).toFixed(2),
        priceCurrency: 'EUR',
        offerCount: 4,
        availability: 'https://schema.org/InStock',
      },
      brand: {
        '@type': 'Brand',
        name: 'Auswanderer-Plattform',
      },
    },
  ]

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        name: 'E-Books für Auswanderer',
        description: 'Expertenwissen für deinen Neustart im Ausland',
        url: `${BASE_URL}/ebooks`,
      },
      {
        '@type': 'ItemList',
        itemListElement: products.map((product, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: product,
        })),
      },
    ],
  }
}

export default async function EbooksPage() {
  // Check if user is PRO
  let isPro = false
  let purchasedEbooks: string[] = []

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      // Check PRO status
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .single()

      isPro = profile?.subscription_tier === 'pro'

      // Get purchased ebooks (for Story 7.2/7.3)
      // TODO: Implement after user_ebooks table is created
      // const { data: userEbooks } = await supabase
      //   .from('user_ebooks')
      //   .select('ebook_id')
      //   .eq('user_id', user.id)
      // purchasedEbooks = userEbooks?.map(e => e.ebook_id) || []
    }
  } catch (error) {
    // Silently handle auth errors for public page
    console.error('Error checking user status:', error)
  }

  const jsonLd = generateJsonLd()

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="min-h-screen bg-slate-50">
        <Header />

        <div className="pt-24 pb-16">
          {/* Hero */}
          <div className="max-w-7xl mx-auto px-4 text-center mb-12">
            <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              E-Books für Auswanderer
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
              Expertenwissen von Menschen, die es selbst gemacht haben.
              <br className="hidden md:block" />
              Spar dir teure Fehler und Jahre an Recherche.
            </p>
          </div>

          {/* E-Books Grid */}
          <div className="max-w-5xl mx-auto px-4">
            <EbookGrid
              isPro={isPro}
              purchasedEbooks={purchasedEbooks}
            />
          </div>

          {/* Trust Elements */}
          <div className="max-w-4xl mx-auto px-4 mt-16">
            <div className="flex flex-wrap justify-center gap-8 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <span className="text-lg">📥</span>
                Sofortiger Download
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">🔄</span>
                Lebenslanger Zugang
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">💳</span>
                Sichere Zahlung
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">📱</span>
                PDF für alle Geräte
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </main>
    </>
  )
}
