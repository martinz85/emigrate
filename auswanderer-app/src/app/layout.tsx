import type { Metadata } from 'next'
import { Inter, Outfit } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://auswanderer-plattform.de'),
  title: {
    default: 'Auswanderer-Plattform | Finde dein perfektes Auswanderungsland',
    template: '%s | Auswanderer-Plattform',
  },
  description: 'Unser AI-Assistent analysiert 26 personalisierte Kriterien und findet das Land, das perfekt zu dir passt. Kostenlose Vorschau, personalisierte PDF-Analyse.',
  keywords: ['Auswandern', 'Emigration', 'Auswanderung', 'Zielland finden', 'AI Beratung', 'Expat', 'Auswandern mit Familie', 'Bestes Auswanderungsland'],
  authors: [{ name: 'Martin' }],
  creator: 'Auswanderer-Plattform',
  publisher: 'Auswanderer-Plattform',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Auswanderer-Plattform | Finde dein perfektes Auswanderungsland',
    description: 'AI-gestutzte Analyse fur deine Auswanderungsentscheidung. 26 Kriterien, personalisierte Empfehlungen.',
    url: 'https://auswanderer-plattform.de',
    siteName: 'Auswanderer-Plattform',
    locale: 'de_DE',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Auswanderer-Plattform - Finde dein perfektes Auswanderungsland',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Auswanderer-Plattform | Finde dein perfektes Auswanderungsland',
    description: 'AI-gestutzte Analyse fur deine Auswanderungsentscheidung',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://auswanderer-plattform.de',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de" className={`${inter.variable} ${outfit.variable}`}>
      <body className="font-sans antialiased bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  )
}
