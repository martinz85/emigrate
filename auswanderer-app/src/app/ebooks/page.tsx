/**
 * E-Book Landing Page
 * Story 7.1 + 7.2: E-Book Integration with Checkout
 */

import { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { EbookGrid } from '@/components/ebooks'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { EBOOKS, EBOOK_BUNDLE, getBundleSavings, type Ebook } from '@/lib/ebooks'
import type { Ebook as DbEbook } from '@/types/ebooks'

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

// Disable caching - need fresh user data
export const dynamic = 'force-dynamic'

/**
 * Convert DB ebook to client format
 */
async function dbEbookToClient(dbEbook: DbEbook, supabaseAdmin: ReturnType<typeof createAdminClient>): Promise<Ebook> {
  // Generate cover URL if cover_path exists
  let coverUrl: string | undefined = undefined
  if (dbEbook.cover_path) {
    try {
      const { data: signedUrlData } = await supabaseAdmin.storage
        .from('ebooks')
        .createSignedUrl(dbEbook.cover_path, 24 * 3600) // 24 hours
      
      if (signedUrlData?.signedUrl) {
        coverUrl = signedUrlData.signedUrl
      }
    } catch (error) {
      // Silently fail - cover URL generation is not critical
      console.warn(`Failed to generate cover URL for ebook ${dbEbook.id}:`, error)
    }
  }

  return {
    id: dbEbook.id,
    slug: dbEbook.slug,
    title: dbEbook.title,
    subtitle: dbEbook.subtitle || '',
    description: dbEbook.description,
    longDescription: dbEbook.long_description || '',
    price: dbEbook.price,
    pages: dbEbook.pages ?? 0,
    readingTime: dbEbook.reading_time || '',
    chapters: dbEbook.chapters || [],
    features: dbEbook.features || [],
    color: dbEbook.color,
    emoji: dbEbook.emoji,
    isBundle: dbEbook.is_bundle,
    bundleItems: dbEbook.bundle_items || undefined,
    stripePriceId: dbEbook.stripe_price_id || undefined,
    pdfPath: dbEbook.pdf_path || undefined,
    coverPath: dbEbook.cover_path || undefined,
    coverUrl,
  }
}

export default async function EbooksPage() {
  // Fetch ebooks from database
  let ebooks: Ebook[] = EBOOKS
  let bundle: Ebook | null = EBOOK_BUNDLE
  let isPro = false
  let purchasedEbookIds: string[] = []

  try {
    const supabase = await createClient()
    const supabaseAdmin = createAdminClient()

    // Fetch ebooks from DB
    const { data: dbEbooks, error: ebooksError } = await (supabaseAdmin as any)
      .from('ebooks')
      .select('*')
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('sort_order', { ascending: true }) as { data: DbEbook[] | null; error: Error | null }

    if (!ebooksError && dbEbooks && dbEbooks.length > 0) {
      // Separate regular ebooks and bundles
      const regularEbooks = dbEbooks.filter(e => !e.is_bundle)
      const bundleEbook = dbEbooks.find(e => e.is_bundle)
      
      // Convert with cover URLs (async)
      ebooks = await Promise.all(regularEbooks.map(e => dbEbookToClient(e, supabaseAdmin)))
      bundle = bundleEbook ? await dbEbookToClient(bundleEbook, supabaseAdmin) : null
    }

    // Check user auth and status
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      // Check PRO status
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .single()

      isPro = profile?.subscription_tier === 'pro'

      // Get purchased ebooks (Story 7.2)
      const { data: userEbooks } = await (supabaseAdmin as any)
        .from('user_ebooks')
        .select('ebook_id')
        .eq('user_id', user.id)

      purchasedEbookIds = userEbooks?.map((e: { ebook_id: string }) => e.ebook_id) || []
    }
  } catch (error) {
    // Silently handle errors for public page - fallback to hardcoded data
    console.error('Error loading ebooks page data:', error)
  }

  // Generate JSON-LD
  const jsonLd = generateJsonLd(ebooks, bundle)

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
              ebooks={ebooks}
              bundle={bundle}
              isPro={isPro}
              purchasedEbooks={purchasedEbookIds}
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

/**
 * Generate JSON-LD structured data for SEO
 */
function generateJsonLd(ebooks: Ebook[], bundle: Ebook | null) {
  const { originalPrice } = bundle 
    ? { originalPrice: ebooks.reduce((sum, e) => sum + e.price, 0) }
    : getBundleSavings()
  
  const products = [
    ...ebooks.map((ebook) => ({
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
  ]

  if (bundle) {
    products.push({
      '@type': 'Product',
      name: bundle.title,
      description: bundle.description,
      offers: {
        '@type': 'Offer',
        price: (bundle.price / 100).toFixed(2),
        priceCurrency: 'EUR',
        availability: 'https://schema.org/InStock',
      },
      brand: {
        '@type': 'Brand',
        name: 'Auswanderer-Plattform',
      },
    })
  }

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
