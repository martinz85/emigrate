// E-Book Definitions and Types
// Story 7.1 - E-Book Landing Page
// This file is CLIENT-SAFE - no server imports!
// For database functions, use ebooks.server.ts

// Legacy interface for backward compatibility with hardcoded data
export interface Ebook {
  id: string
  slug: string
  title: string
  subtitle: string
  description: string
  longDescription: string
  price: number // in cents
  pages: number
  readingTime: string
  chapters: string[]
  features: string[]
  color: string // Tailwind gradient classes
  emoji: string
  isBundle?: boolean
  bundleItems?: string[] // slugs of included ebooks
  stripePriceId?: string // To be set after Stripe product creation
  pdfPath?: string // Supabase Storage path
  coverPath?: string // Supabase Storage path
  coverUrl?: string // Signed URL for cover image (generated server-side)
}

export const EBOOKS: Ebook[] = [
  {
    id: 'langversion',
    slug: 'langversion',
    title: 'Der komplette Auswanderer-Guide',
    subtitle: 'Ausführliche Langversion',
    description: 'Alles was du wissen musst, von der Entscheidung bis zum Ankommen.',
    longDescription: `Der ultimative Leitfaden für alle, die ernsthaft über das Auswandern nachdenken. 
    
Dieses E-Book begleitet dich durch jeden Schritt des Prozesses: Von der ersten Idee über die Länderauswahl, Visa-Beantragung, Umzugslogistik bis hin zum erfolgreichen Ankommen in deinem neuen Zuhause.

Basierend auf den Erfahrungen von über 100 erfolgreichen Auswanderern und ständig aktualisiert.`,
    price: 1999, // 19,99€
    pages: 250,
    readingTime: '6-8 Stunden',
    chapters: [
      'Die Entscheidung treffen',
      'Das richtige Land finden',
      'Visa & Aufenthalt',
      'Finanzen & Steuern',
      'Job & Karriere',
      'Wohnung finden',
      'Umzug organisieren',
      'Bürokratie meistern',
      'Ankommen & Integration',
      'Netzwerk aufbauen',
    ],
    features: [
      '25 ausführliche Kapitel',
      'Länderprofile für 20+ Länder',
      'Druckbare Checklisten',
      'Steuer- und Visa-Guide',
    ],
    color: 'from-red-500 to-orange-500',
    emoji: '📕',
  },
  {
    id: 'kurzversion',
    slug: 'kurzversion',
    title: 'Quick Start Guide',
    subtitle: 'Kurzversion',
    description: 'Die 20% der Informationen, die 80% des Erfolgs ausmachen.',
    longDescription: `Für alle, die schnell loslegen wollen. Dieses kompakte E-Book enthält nur das Wesentliche – keine langen Erklärungen, nur klare Handlungsanweisungen.

Perfekt für schnelle Entscheider, die keine Zeit für lange Lektüre haben, aber trotzdem die wichtigsten Fehler vermeiden wollen.`,
    price: 999, // 9,99€
    pages: 80,
    readingTime: '2-3 Stunden',
    chapters: [
      'Die 10 kritischen Schritte',
      'Entscheidungsbäume',
      'Quick-Reference Tabellen',
      'Die 5 größten Fehler',
      'Sofort-Checkliste',
    ],
    features: [
      '10 kritische Schritte',
      'Entscheidungsbäume',
      'Quick-Reference Tabellen',
      'Die 5 größten Fehler',
    ],
    color: 'from-green-500 to-teal-500',
    emoji: '📗',
  },
  {
    id: 'tips-tricks',
    slug: 'tips-tricks',
    title: 'Tips & Tricks',
    subtitle: 'Insider-Wissen',
    description: 'Erprobte Hacks von erfahrenen Expats. Geld sparen, Bürokratie umgehen.',
    longDescription: `50+ praktische Hacks, die wir in Jahren des Auswanderns gelernt haben. 

Von cleveren Geld-Spar-Strategien über Bürokratie-Shortcuts bis hin zu Netzwerk-Tipps – dieses E-Book enthält das Insider-Wissen, das du nirgendwo anders findest.`,
    price: 1499, // 14,99€
    pages: 120,
    readingTime: '3-4 Stunden',
    chapters: [
      '20 Geld-Spar-Hacks',
      'Bürokratie-Shortcuts',
      'Wohnungssuche-Tricks',
      'Netzwerk-Strategien',
      'Verhandlungs-Tips',
      'Steuer-Optimierung',
    ],
    features: [
      '50+ praktische Hacks',
      'Geld-Spar-Strategien',
      'Bürokratie-Shortcuts',
      'Netzwerk-Tipps',
    ],
    color: 'from-blue-500 to-indigo-500',
    emoji: '📘',
  },
  {
    id: 'dummies',
    slug: 'dummies',
    title: 'Auswandern für Dummies',
    subtitle: 'Einsteigerfreundlich',
    description: 'Kein Vorwissen nötig. Alles einfach erklärt, Schritt für Schritt.',
    longDescription: `Du weißt gar nicht, wo du anfangen sollst? Dieses E-Book ist für absolute Anfänger geschrieben.

Keine Fachbegriffe, keine komplizierten Erklärungen – nur einfache Sprache und klare Schritt-für-Schritt Anleitungen. Wir nehmen dich an die Hand und zeigen dir den Weg.`,
    price: 1299, // 12,99€
    pages: 100,
    readingTime: '2-3 Stunden',
    chapters: [
      'Was bedeutet Auswandern?',
      'Bin ich bereit?',
      'Die ersten Schritte',
      'Häufige Fragen',
      'Checklisten für Anfänger',
    ],
    features: [
      'Einfache Sprache',
      'Schritt-für-Schritt',
      'Häufige Fragen beantwortet',
      'Checklisten für Anfänger',
    ],
    color: 'from-yellow-500 to-amber-500',
    emoji: '📙',
  },
]

// Bundle Definition
export const EBOOK_BUNDLE: Ebook = {
  id: 'bundle',
  slug: 'bundle',
  title: 'Komplett-Paket',
  subtitle: 'Alle 4 E-Books',
  description: 'Alle 4 E-Books zum Sonderpreis. Spare über 30%!',
  longDescription: `Das ultimative Paket für alle, die keine Kompromisse machen wollen. 

Enthält alle 4 E-Books:
• Der komplette Auswanderer-Guide (Langversion)
• Quick Start Guide (Kurzversion)
• Tips & Tricks
• Auswandern für Dummies

Einzeln würden diese E-Books 57,96€ kosten – spare mit dem Bundle über 30%!`,
  price: 3999, // 39,99€
  pages: 550,
  readingTime: '15+ Stunden',
  chapters: [
    'Alle Kapitel aus 4 E-Books',
  ],
  features: [
    'Alle 4 E-Books',
    '550+ Seiten Wissen',
    '33% günstiger',
    'Sofortiger Download',
  ],
  color: 'from-purple-500 to-pink-500',
  emoji: '📚',
  isBundle: true,
  bundleItems: ['langversion', 'kurzversion', 'tips-tricks', 'dummies'],
}

// Helper functions (CLIENT-SAFE)
export function getEbookBySlug(slug: string): Ebook | undefined {
  if (slug === 'bundle') return EBOOK_BUNDLE
  return EBOOKS.find(ebook => ebook.slug === slug)
}

export function getEbookById(id: string): Ebook | undefined {
  if (id === 'bundle') return EBOOK_BUNDLE
  return EBOOKS.find(ebook => ebook.id === id)
}

export function getAllEbooks(): Ebook[] {
  return EBOOKS
}

export function getAllEbooksWithBundle(): Ebook[] {
  return [...EBOOKS, EBOOK_BUNDLE]
}

export function formatEbookPrice(priceInCents: number): string {
  return (priceInCents / 100).toFixed(2).replace('.', ',') + ' €'
}

// Calculate bundle savings
export function getBundleSavings(): { originalPrice: number; savings: number; savingsPercent: number } {
  const originalPrice = EBOOKS.reduce((sum, ebook) => sum + ebook.price, 0)
  const savings = originalPrice - EBOOK_BUNDLE.price
  const savingsPercent = Math.round((savings / originalPrice) * 100)
  
  return { originalPrice, savings, savingsPercent }
}
