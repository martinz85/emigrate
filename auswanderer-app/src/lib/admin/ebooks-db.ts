// E-Book Database Utilities
// Story 10.8 - E-Book Management (Admin)
// Centralized database access to reduce code duplication

import { createAdminClient } from '@/lib/supabase/server'
import type { Ebook } from '@/types/ebooks'

// Type alias for better readability
type SupabaseAdminClient = ReturnType<typeof createAdminClient>

/**
 * Get typed access to ebooks table
 * Using 'as any' until Supabase types are regenerated after migration
 */
export function getEbooksTable(supabase: SupabaseAdminClient) {
  return (supabase as any).from('ebooks')
}

/**
 * Check if an error is a UNIQUE constraint violation
 * Used for race condition handling on slug
 */
export function isUniqueViolation(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  
  const err = error as { code?: string; message?: string }
  
  // PostgreSQL unique violation code
  if (err.code === '23505') return true
  
  // Check message for common patterns
  if (err.message?.includes('duplicate key value violates unique constraint')) return true
  if (err.message?.includes('unique constraint')) return true
  
  return false
}

/**
 * Validate bundle items exist and are valid
 * - Items must exist in database
 * - Items must not be deleted
 * - Items must not be bundles themselves
 * - Bundle cannot reference itself
 */
export async function validateBundleItems(
  supabase: SupabaseAdminClient,
  bundleItems: string[] | null | undefined,
  currentSlug?: string // Slug of the bundle being created/edited
): Promise<{ valid: boolean; error?: string }> {
  if (!bundleItems || bundleItems.length === 0) {
    return { valid: true }
  }

  // FIX: Check for self-reference
  if (currentSlug && bundleItems.includes(currentSlug)) {
    return { 
      valid: false, 
      error: 'Ein Bundle kann sich nicht selbst enthalten' 
    }
  }

  // Check for duplicates in the array
  const uniqueItems = new Set(bundleItems)
  if (uniqueItems.size !== bundleItems.length) {
    return {
      valid: false,
      error: 'Bundle enthält doppelte E-Books'
    }
  }

  const { data: existingEbooks, error } = await getEbooksTable(supabase)
    .select('slug, is_bundle')
    .in('slug', bundleItems)
    .is('deleted_at', null)
  
  if (error) {
    console.error('Error validating bundle items:', error)
    return { valid: false, error: 'Fehler bei der Validierung der Bundle-Items' }
  }

  // Check all items exist
  const existingSlugs = new Set((existingEbooks || []).map((e: { slug: string }) => e.slug))
  const missingSlugs = bundleItems.filter(slug => !existingSlugs.has(slug))

  if (missingSlugs.length > 0) {
    return { 
      valid: false, 
      error: `Diese E-Books existieren nicht: ${missingSlugs.join(', ')}` 
    }
  }

  // Check none of the items are bundles themselves (no nested bundles)
  const bundleInItems = (existingEbooks || []).find((e: { slug: string; is_bundle: boolean }) => e.is_bundle)
  if (bundleInItems) {
    return {
      valid: false,
      error: `"${bundleInItems.slug}" ist selbst ein Bundle. Verschachtelte Bundles sind nicht erlaubt.`
    }
  }

  return { valid: true }
}

/**
 * Fetch ebook by ID with proper typing
 */
export async function getEbookById(
  supabase: SupabaseAdminClient,
  id: string
): Promise<{ data: Ebook | null; error: Error | null }> {
  return await getEbooksTable(supabase)
    .select('*')
    .eq('id', id)
    .single() as { data: Ebook | null; error: Error | null }
}

/**
 * Fetch ebook by slug with proper typing
 */
export async function getEbookBySlug(
  supabase: SupabaseAdminClient,
  slug: string
): Promise<{ data: Ebook | null; error: Error | null }> {
  return await getEbooksTable(supabase)
    .select('*')
    .eq('slug', slug)
    .is('deleted_at', null)
    .single() as { data: Ebook | null; error: Error | null }
}

/**
 * Check if slug is available (for create/update)
 */
export async function isSlugAvailable(
  supabase: SupabaseAdminClient,
  slug: string,
  excludeId?: string
): Promise<boolean> {
  let query = getEbooksTable(supabase)
    .select('id')
    .eq('slug', slug)
    .is('deleted_at', null)
  
  if (excludeId) {
    query = query.neq('id', excludeId)
  }

  const { data } = await query.single()
  return !data // Available if no data returned
}

