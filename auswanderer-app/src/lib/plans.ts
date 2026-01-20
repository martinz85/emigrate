// Subscription Plans Types and Utilities
// Story 8.1 - Subscription Plans

export interface Plan {
  id: string
  name: string
  slug: 'free' | 'pro'
  description: string | null
  priceMonthly: number | null // in cents
  priceYearly: number | null  // in cents
  stripePriceIdMonthly: string | null
  stripePriceIdYearly: string | null
  features: string[]
  isActive: boolean
  displayOrder: number
  createdAt: string
  updatedAt: string
}

export interface PlanFeature {
  name: string
  includedInFree: boolean
  includedInPro: boolean
}

// All features for comparison table
export const PLAN_FEATURES: PlanFeature[] = [
  { name: '1 Analyse', includedInFree: true, includedInPro: true },
  { name: 'PDF-Vorschau', includedInFree: true, includedInPro: true },
  { name: 'Top 3 Länder sehen', includedInFree: true, includedInPro: true },
  { name: 'E-Mail Support', includedInFree: true, includedInPro: true },
  { name: 'Unbegrenzte AI-Analysen', includedInFree: false, includedInPro: true },
  { name: 'Vollständige PDFs', includedInFree: false, includedInPro: true },
  { name: 'Alle E-Books inklusive', includedInFree: false, includedInPro: true },
  { name: 'Projekt-Dashboard', includedInFree: false, includedInPro: true },
  { name: 'Checklisten-System', includedInFree: false, includedInPro: true },
  { name: 'Meilenstein-Tracker', includedInFree: false, includedInPro: true },
  { name: 'Personalisierte Timeline', includedInFree: false, includedInPro: true },
  { name: 'Kosten-Tracker', includedInFree: false, includedInPro: true },
  { name: 'Länder-Vergleich (bis zu 5)', includedInFree: false, includedInPro: true },
  { name: 'Visa-Navigator', includedInFree: false, includedInPro: true },
  { name: 'Kosten-Rechner Live', includedInFree: false, includedInPro: true },
]

// Format price for display
export function formatPlanPrice(priceInCents: number | null): string {
  if (priceInCents === null) return '0 €'
  return (priceInCents / 100).toFixed(2).replace('.', ',') + ' €'
}

// Calculate yearly savings
export function getYearlySavings(monthlyPrice: number, yearlyPrice: number): {
  monthlySavings: number
  monthsFree: number
  savingsPercent: number
} {
  const yearlyIfMonthly = monthlyPrice * 12
  const savings = yearlyIfMonthly - yearlyPrice
  const monthlySavings = savings / 12
  const monthsFree = Math.round(savings / monthlyPrice)
  const savingsPercent = Math.round((savings / yearlyIfMonthly) * 100)

  return { monthlySavings, monthsFree, savingsPercent }
}

// Default fallback plans (if API fails)
export const FALLBACK_PLANS: Plan[] = [
  {
    id: 'fallback-free',
    name: 'Free',
    slug: 'free',
    description: 'Perfekt zum Ausprobieren',
    priceMonthly: null,
    priceYearly: null,
    stripePriceIdMonthly: null,
    stripePriceIdYearly: null,
    features: ['1 Analyse', 'PDF-Vorschau (2 Seiten)', 'Top 3 Länder sehen', 'E-Mail Support'],
    isActive: true,
    displayOrder: 0,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'fallback-pro',
    name: 'PRO',
    slug: 'pro',
    description: 'Für ernsthafte Auswanderer',
    priceMonthly: 1499,
    priceYearly: 14990,
    stripePriceIdMonthly: null,
    stripePriceIdYearly: null,
    features: [
      'Unbegrenzte AI-Analysen',
      'Alle PDFs inklusive',
      'Alle E-Books inklusive',
      'Projekt-Dashboard',
      'Checklisten-System',
      'Meilenstein-Tracker',
      'Personalisierte Timeline',
      'Kosten-Tracker',
      'Länder-Vergleich (bis zu 5)',
      'Visa-Navigator',
      'Kosten-Rechner Live',
      'Basis-Support',
    ],
    isActive: true,
    displayOrder: 1,
    createdAt: '',
    updatedAt: '',
  },
]

// Transform database row to Plan type
export function transformDbPlan(row: {
  id: string
  name: string
  slug: string
  description: string | null
  price_monthly: number | null
  price_yearly: number | null
  stripe_price_id_monthly: string | null
  stripe_price_id_yearly: string | null
  features: unknown // Json type from database
  is_active: boolean | null
  display_order: number | null
  created_at: string | null
  updated_at: string | null
}): Plan {
  // Safely convert features from Json to string[]
  const features = Array.isArray(row.features) 
    ? row.features.filter((f): f is string => typeof f === 'string')
    : []
  
  return {
    id: row.id,
    name: row.name,
    slug: row.slug as 'free' | 'pro',
    description: row.description,
    priceMonthly: row.price_monthly,
    priceYearly: row.price_yearly,
    stripePriceIdMonthly: row.stripe_price_id_monthly,
    stripePriceIdYearly: row.stripe_price_id_yearly,
    features,
    isActive: row.is_active ?? true,
    displayOrder: row.display_order ?? 0,
    createdAt: row.created_at ?? new Date().toISOString(),
    updatedAt: row.updated_at ?? new Date().toISOString(),
  }
}

