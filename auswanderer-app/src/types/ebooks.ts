// E-Book Types
// Story 10.8 - E-Book Management (Admin)

export interface Ebook {
  id: string
  slug: string
  title: string
  subtitle: string | null
  description: string
  long_description: string | null
  price: number // in cents
  pages: number | null
  reading_time: string | null
  chapters: string[]
  features: string[]
  color: string
  emoji: string
  pdf_path: string | null
  cover_path: string | null
  stripe_product_id: string | null
  stripe_price_id: string | null
  is_bundle: boolean
  bundle_items: string[] | null // Array of ebook slugs
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface EbookFormData {
  slug: string
  title: string
  subtitle?: string
  description: string
  long_description?: string
  price: number // in euros (will be converted to cents)
  pages?: number
  reading_time?: string
  chapters: string[]
  features: string[]
  color: string
  emoji: string
  is_bundle: boolean
  bundle_items?: string[]
  is_active: boolean
}

export interface UserEbook {
  id: string
  user_id: string
  ebook_id: string
  purchased_at: string
  stripe_payment_id: string | null
  stripe_session_id: string | null
  amount: number | null
  ebook?: Ebook
}

// Gradient color options for E-Books
export const EBOOK_COLORS = [
  { value: 'from-red-500 to-orange-500', label: 'Rot → Orange' },
  { value: 'from-orange-500 to-amber-500', label: 'Orange → Amber' },
  { value: 'from-amber-500 to-yellow-500', label: 'Amber → Gelb' },
  { value: 'from-yellow-500 to-lime-500', label: 'Gelb → Lime' },
  { value: 'from-green-500 to-teal-500', label: 'Grün → Teal' },
  { value: 'from-teal-500 to-emerald-500', label: 'Teal → Emerald' },
  { value: 'from-emerald-500 to-cyan-500', label: 'Emerald → Cyan' },
  { value: 'from-cyan-500 to-blue-500', label: 'Cyan → Blau' },
  { value: 'from-blue-500 to-indigo-500', label: 'Blau → Indigo' },
  { value: 'from-indigo-500 to-violet-500', label: 'Indigo → Violett' },
  { value: 'from-violet-500 to-purple-500', label: 'Violett → Purple' },
  { value: 'from-purple-500 to-pink-500', label: 'Purple → Pink' },
  { value: 'from-pink-500 to-rose-500', label: 'Pink → Rose' },
]

// Common emojis for E-Books
export const EBOOK_EMOJIS = ['📕', '📗', '📘', '📙', '📚', '📖', '📓', '📔', '📒', '📃']

