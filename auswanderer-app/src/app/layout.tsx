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
  title: 'Auswanderer-Plattform | Finde dein perfektes Auswanderungsland',
  description: 'Unser AI analysiert, was DIR wichtig ist und findet das Land, das perfekt zu dir passt. Kostenlose Vorschau, personalisierte PDF-Analyse.',
  keywords: ['Auswandern', 'Emigration', 'Auswanderung', 'Zielland finden', 'AI Beratung', 'Expat'],
  authors: [{ name: 'Martin' }],
  openGraph: {
    title: 'Auswanderer-Plattform | Finde dein perfektes Auswanderungsland',
    description: 'AI-gestützte Analyse für deine Auswanderungsentscheidung',
    url: 'https://auswanderer-plattform.de',
    siteName: 'Auswanderer-Plattform',
    locale: 'de_DE',
    type: 'website',
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
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary-500 focus:text-white focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-700 focus:ring-offset-2"
        >
          Zum Hauptinhalt springen
        </a>
        {children}
      </body>
    </html>
  )
}

