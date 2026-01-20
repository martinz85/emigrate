/**
 * Typed E-Book Database Queries
 * Story 7.2/7.3: Replaces `as any` casts with proper typing
 * 
 * Note: These helpers provide type-safe access to ebooks/user_ebooks tables
 * until Supabase types are regenerated after migrations.
 */

import { SupabaseClient } from '@supabase/supabase-js'
import type { Ebook as DbEbook } from '@/types/ebooks'

// User Ebook purchase record
export interface UserEbook {
  id: string
  user_id: string
  ebook_id: string
  purchased_at: string
  stripe_payment_id: string | null
  stripe_session_id: string | null
  amount: number | null
}

// Ebook with minimal fields for access checks
export interface EbookSlug {
  id: string
  slug: string
}

export interface EbookBundle {
  id: string
  bundle_items: string[] | null
}

/**
 * Get ebook by ID with all fields
 */
export async function getEbookById(
  supabase: SupabaseClient,
  id: string,
  options?: { activeOnly?: boolean }
): Promise<{ data: DbEbook | null; error: Error | null }> {
  let query = supabase
    .from('ebooks')
    .select('*')
    .eq('id', id)

  if (options?.activeOnly !== false) {
    query = query.eq('is_active', true).is('deleted_at', null)
  }

  const result = await query.single()
  return result as { data: DbEbook | null; error: Error | null }
}

/**
 * Get all active ebooks
 */
export async function getActiveEbooks(
  supabase: SupabaseClient,
  options?: { includeDeleted?: boolean }
): Promise<{ data: DbEbook[] | null; error: Error | null }> {
  let query = supabase
    .from('ebooks')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (!options?.includeDeleted) {
    query = query.is('deleted_at', null)
  }

  const result = await query
  return result as { data: DbEbook[] | null; error: Error | null }
}

/**
 * Get user's purchased ebooks
 */
export async function getUserEbooks(
  supabase: SupabaseClient,
  userId: string
): Promise<{ data: UserEbook[] | null; error: Error | null }> {
  const result = await supabase
    .from('user_ebooks')
    .select('*')
    .eq('user_id', userId)
    .order('purchased_at', { ascending: false })

  return result as { data: UserEbook[] | null; error: Error | null }
}

/**
 * Check if user owns a specific ebook
 */
export async function checkUserOwnsEbook(
  supabase: SupabaseClient,
  userId: string,
  ebookId: string
): Promise<{ data: { id: string } | null; error: Error | null }> {
  const result = await supabase
    .from('user_ebooks')
    .select('id')
    .eq('user_id', userId)
    .eq('ebook_id', ebookId)
    .maybeSingle()

  return result as { data: { id: string } | null; error: Error | null }
}

/**
 * Get ebook slug by ID
 */
export async function getEbookSlug(
  supabase: SupabaseClient,
  ebookId: string
): Promise<{ data: EbookSlug | null; error: Error | null }> {
  const result = await supabase
    .from('ebooks')
    .select('id, slug')
    .eq('id', ebookId)
    .single()

  return result as { data: EbookSlug | null; error: Error | null }
}

/**
 * Find bundles containing a specific ebook slug
 */
export async function findBundlesContainingSlug(
  supabase: SupabaseClient,
  slug: string
): Promise<{ data: EbookBundle[] | null; error: Error | null }> {
  const result = await supabase
    .from('ebooks')
    .select('id, bundle_items')
    .eq('is_bundle', true)
    .contains('bundle_items', [slug])

  return result as { data: EbookBundle[] | null; error: Error | null }
}

/**
 * Check if user owns any of the given ebook IDs (bundles)
 * Returns first match - we only need to know if ANY bundle was purchased
 */
export async function checkUserOwnsBundles(
  supabase: SupabaseClient,
  userId: string,
  bundleIds: string[]
): Promise<{ data: { id: string } | null; error: Error | null }> {
  // Use limit(1) instead of maybeSingle() to avoid errors with multiple matches
  const result = await supabase
    .from('user_ebooks')
    .select('id')
    .eq('user_id', userId)
    .in('ebook_id', bundleIds)
    .limit(1)

  // Return first match or null
  const data = result.data && result.data.length > 0 ? result.data[0] : null
  return { data, error: result.error }
}

/**
 * Insert or update user ebook purchase
 */
export async function upsertUserEbook(
  supabase: SupabaseClient,
  data: {
    user_id: string
    ebook_id: string
    stripe_session_id?: string
    stripe_payment_id?: string
    amount?: number
  }
): Promise<{ error: Error | null }> {
  const result = await supabase
    .from('user_ebooks')
    .upsert(data, { onConflict: 'user_id,ebook_id' })

  return { error: result.error }
}

/**
 * Get ebooks by slugs
 */
export async function getEbooksBySlugs(
  supabase: SupabaseClient,
  slugs: string[]
): Promise<{ data: EbookSlug[] | null; error: Error | null }> {
  const result = await supabase
    .from('ebooks')
    .select('id, slug')
    .in('slug', slugs)

  return result as { data: EbookSlug[] | null; error: Error | null }
}

/**
 * Get ebook for download (with pdf_path)
 */
export async function getEbookForDownload(
  supabase: SupabaseClient,
  ebookId: string
): Promise<{
  data: {
    id: string
    slug: string
    title: string
    pdf_path: string | null
    is_bundle: boolean
    bundle_items: string[] | null
  } | null
  error: Error | null
}> {
  const result = await supabase
    .from('ebooks')
    .select('id, slug, title, pdf_path, is_bundle, bundle_items')
    .eq('id', ebookId)
    .eq('is_active', true)
    .is('deleted_at', null)
    .single()

  return result as any
}

// ============================================
// Guest Purchase Functions
// ============================================

export interface GuestPurchase {
  id: string
  email: string
  ebook_id: string
  purchased_at: string
  stripe_session_id: string | null
  stripe_payment_id: string | null
  amount: number | null
  claimed_at: string | null
  claimed_by: string | null
}

/**
 * Insert a guest purchase (for users without an account)
 */
export async function insertGuestPurchase(
  supabase: SupabaseClient,
  data: {
    email: string
    ebook_id: string
    stripe_session_id?: string
    stripe_payment_id?: string
    amount?: number
  }
): Promise<{ error: Error | null }> {
  const result = await supabase
    .from('guest_purchases')
    .upsert(data, { onConflict: 'email,ebook_id' })

  return { error: result.error }
}

/**
 * Get unclaimed guest purchases for an email
 */
export async function getUnclaimedGuestPurchases(
  supabase: SupabaseClient,
  email: string
): Promise<{ data: GuestPurchase[] | null; error: Error | null }> {
  const result = await supabase
    .from('guest_purchases')
    .select('*')
    .eq('email', email)
    .is('claimed_at', null)

  return result as { data: GuestPurchase[] | null; error: Error | null }
}

// ============================================
// Webhook Idempotency Functions
// ============================================

export interface WebhookEvent {
  id: string
  event_type: string
  processed_at: string
  status: string
  error_message: string | null
  created_at: string
}

/**
 * Check if a webhook event was already processed
 */
export async function getWebhookEvent(
  supabase: SupabaseClient,
  eventId: string
): Promise<{ data: { id: string; status: string } | null; error: Error | null }> {
  const result = await supabase
    .from('webhook_events')
    .select('id, status')
    .eq('id', eventId)
    .maybeSingle()

  return result as { data: { id: string; status: string } | null; error: Error | null }
}

/**
 * Record a webhook event (for idempotency)
 */
export async function insertWebhookEvent(
  supabase: SupabaseClient,
  data: {
    id: string
    event_type: string
    status: string
  }
): Promise<{ error: Error | null }> {
  const result = await supabase
    .from('webhook_events')
    .insert(data)

  return { error: result.error }
}

/**
 * Update webhook event status after processing
 */
export async function updateWebhookEvent(
  supabase: SupabaseClient,
  eventId: string,
  data: {
    status: string
    error_message?: string | null
    processed_at?: string
  }
): Promise<{ error: Error | null }> {
  const result = await supabase
    .from('webhook_events')
    .update(data)
    .eq('id', eventId)

  return { error: result.error }
}

