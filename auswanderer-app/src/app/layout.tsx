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
  description: 'Unser AI-Assistent analysiert 26 personalisierte Kriterien und findet das Land, das perfekt zu dir passt. Kostenlose Vorschau, personalisierte PDF-Analyse.',
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
        {children}
      </body>
    </html>
  )
}

