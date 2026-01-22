// Server-Only E-Book Database Functions
// Story 10.8 - E-Book Management (Admin)
// These functions require server-side context (cookies, DB access)

import { createClient } from '@/lib/supabase/server'
import type { Ebook as DbEbook } from '@/types/ebooks'
import { 
  type Ebook, 
  EBOOKS, 
  EBOOK_BUNDLE, 
  getEbookBySlug, 
  getBundleSavings 
} from './ebooks'

// Re-export types for convenience
export type { Ebook } from './ebooks'

/**
 * Convert DB ebook to legacy Ebook format for backward compatibility
 * Note: coverUrl is not generated here - should be done at page level for efficiency
 */
function dbEbookToLegacy(dbEbook: DbEbook): Ebook {
  return {
    id: dbEbook.id,
    slug: dbEbook.slug,
    title: dbEbook.title,
    subtitle: dbEbook.subtitle || '',
    description: dbEbook.description,
    longDescription: dbEbook.long_description || '',
    price: dbEbook.price,
    // FIX: Preserve null values for optional fields instead of defaulting to 0/''
    // This allows UI to conditionally render these fields
    pages: dbEbook.pages ?? 0, // Use 0 as fallback for display, but UI should handle null
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
    // coverUrl will be generated at page level for efficiency
  }
}

/**
 * Fetch all active ebooks from database
 * Falls back to hardcoded data if DB is empty or fails
 */
export async function getEbooksFromDb(): Promise<Ebook[]> {
  try {
    const supabase = await createClient()
    
    // Using 'as any' until Supabase types are regenerated after migration
    const { data: dbEbooks, error } = await (supabase as any)
      .from('ebooks')
      .select('*')
      .eq('is_active', true)
      .is('deleted_at', null)
      .eq('is_bundle', false)
      .order('sort_order', { ascending: true }) as { data: DbEbook[] | null; error: Error | null }

    if (error) {
      console.error('Error fetching ebooks from DB:', error)
      return EBOOKS // Fallback to hardcoded
    }

    if (!dbEbooks || dbEbooks.length === 0) {
      return EBOOKS // Fallback to hardcoded
    }

    return dbEbooks.map(dbEbookToLegacy)
  } catch (error) {
    console.error('Error in getEbooksFromDb:', error)
    return EBOOKS // Fallback to hardcoded
  }
}

/**
 * Fetch all ebooks including bundles from database
 */
export async function getEbooksWithBundleFromDb(): Promise<Ebook[]> {
  try {
    const supabase = await createClient()
    
    const { data: dbEbooks, error } = await (supabase as any)
      .from('ebooks')
      .select('*')
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('sort_order', { ascending: true }) as { data: DbEbook[] | null; error: Error | null }

    if (error) {
      console.error('Error fetching ebooks from DB:', error)
      return [...EBOOKS, EBOOK_BUNDLE] // Fallback
    }

    if (!dbEbooks || dbEbooks.length === 0) {
      return [...EBOOKS, EBOOK_BUNDLE] // Fallback
    }

    return dbEbooks.map(dbEbookToLegacy)
  } catch (error) {
    console.error('Error in getEbooksWithBundleFromDb:', error)
    return [...EBOOKS, EBOOK_BUNDLE] // Fallback
  }
}

/**
 * Fetch single ebook by slug from database
 */
export async function getEbookBySlugFromDb(slug: string): Promise<Ebook | null> {
  try {
    const supabase = await createClient()
    
    const { data: dbEbook, error } = await (supabase as any)
      .from('ebooks')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .is('deleted_at', null)
      .single() as { data: DbEbook | null; error: Error | null }

    if (error || !dbEbook) {
      // Fallback to hardcoded
      return getEbookBySlug(slug) || null
    }

    return dbEbookToLegacy(dbEbook)
  } catch (error) {
    console.error('Error in getEbookBySlugFromDb:', error)
    return getEbookBySlug(slug) || null
  }
}

/**
 * Fetch single ebook by ID from database
 */
export async function getEbookByIdFromDb(id: string): Promise<Ebook | null> {
  try {
    const supabase = await createClient()
    
    const { data: dbEbook, error } = await (supabase as any)
      .from('ebooks')
      .select('*')
      .eq('id', id)
      .single() as { data: DbEbook | null; error: Error | null }

    if (error || !dbEbook) {
      return null
    }

    return dbEbookToLegacy(dbEbook)
  } catch (error) {
    console.error('Error in getEbookByIdFromDb:', error)
    return null
  }
}

/**
 * Calculate bundle savings from database
 */
export async function getBundleSavingsFromDb(): Promise<{ originalPrice: number; savings: number; savingsPercent: number } | null> {
  try {
    const supabase = await createClient()
    
    // Get bundle (using 'as any' until Supabase types are regenerated)
    const { data: bundle } = await (supabase as any)
      .from('ebooks')
      .select('price, bundle_items')
      .eq('is_bundle', true)
      .eq('is_active', true)
      .is('deleted_at', null)
      .single() as { data: { price: number; bundle_items: string[] } | null }

    if (!bundle || !bundle.bundle_items) {
      return getBundleSavings() // Fallback
    }

    // Get individual ebook prices
    const { data: ebooks } = await (supabase as any)
      .from('ebooks')
      .select('price')
      .in('slug', bundle.bundle_items)
      .eq('is_active', true)
      .is('deleted_at', null) as { data: { price: number }[] | null }

    if (!ebooks || ebooks.length === 0) {
      return getBundleSavings() // Fallback
    }

    const originalPrice = ebooks.reduce((sum: number, e: { price: number }) => sum + e.price, 0)
    const savings = originalPrice - bundle.price
    const savingsPercent = Math.round((savings / originalPrice) * 100)

    return { originalPrice, savings, savingsPercent }
  } catch (error) {
    console.error('Error in getBundleSavingsFromDb:', error)
    return getBundleSavings() // Fallback
  }
}

