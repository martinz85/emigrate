import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { 
  verifyAdminWrite, 
  verifyAdminRead,
  getEbooksTable,
  validateBundleItems,
  isUniqueViolation,
} from '@/lib/admin'
import { logAuditEvent } from '@/lib/audit'
import { z } from 'zod'
import Stripe from 'stripe'
import type { Ebook } from '@/types/ebooks'

// ============================================
// Stripe Client (optional - graceful degradation)
// ============================================

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })
  : null

// ============================================
// Validation Schema
// ============================================

const createEbookSchema = z.object({
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, 'Slug darf nur Kleinbuchstaben, Zahlen und Bindestriche enthalten'),
  title: z.string().min(3, 'Titel muss mindestens 3 Zeichen haben').max(100),
  subtitle: z.string().max(100).nullable().optional(),
  description: z.string().min(10, 'Beschreibung muss mindestens 10 Zeichen haben').max(500),
  long_description: z.string().max(5000).nullable().optional(),
  price: z.number().min(0, 'Preis muss positiv sein'), // in cents
  pages: z.number().int().positive().nullable().optional(),
  reading_time: z.string().max(50).nullable().optional(),
  chapters: z.array(z.string()).default([]),
  features: z.array(z.string()).default([]),
  color: z.string().default('from-teal-500 to-emerald-500'),
  emoji: z.string().max(10).default('📚'),
  pdf_path: z.string().nullable().optional(),
  cover_path: z.string().nullable().optional(),
  is_bundle: z.boolean().default(false),
  bundle_items: z.array(z.string()).nullable().optional(),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().optional(),
})

// ============================================
// Helper: Cleanup Stripe resources on failure
// ============================================

async function cleanupStripeResources(
  productId: string | null,
  priceId: string | null
): Promise<void> {
  if (!stripe) return

  try {
    // Archive the price first (prices can't be deleted, only archived)
    if (priceId) {
      await stripe.prices.update(priceId, { active: false })
    }
    // Archive the product
    if (productId) {
      await stripe.products.update(productId, { active: false })
    }
  } catch (err) {
    console.error('Failed to cleanup Stripe resources:', err)
    // Log but don't throw - this is best-effort cleanup
  }
}

// ============================================
// GET: List all ebooks
// ============================================

export async function GET() {
  const { error, status, user } = await verifyAdminRead()
  if (error || !user) {
    return NextResponse.json({ error }, { status })
  }

  try {
    const supabase = createAdminClient()

    const { data: ebooks, error: fetchError } = await getEbooksTable(supabase)
      .select('*')
      .is('deleted_at', null)
      .order('sort_order', { ascending: true }) as { data: Ebook[] | null; error: Error | null }

    if (fetchError) {
      console.error('Error fetching ebooks:', fetchError)
      return NextResponse.json({ error: 'Fehler beim Laden' }, { status: 500 })
    }

    return NextResponse.json({ data: ebooks })
  } catch (err) {
    console.error('Ebooks GET error:', err)
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 })
  }
}

// ============================================
// POST: Create new ebook
// ============================================

export async function POST(request: NextRequest) {
  const { error, status, user } = await verifyAdminWrite()
  if (error || !user) {
    return NextResponse.json({ error }, { status })
  }

  let stripeProductId: string | null = null
  let stripePriceId: string | null = null

  try {
    const body = await request.json()
    
    // Validate input
    const parseResult = createEbookSchema.safeParse(body)
    if (!parseResult.success) {
      const errors = parseResult.error.issues.map((e: z.ZodIssue) => `${e.path.join('.')}: ${e.message}`).join(', ')
      return NextResponse.json({ error: errors }, { status: 400 })
    }

    const input = parseResult.data
    const supabase = createAdminClient()

    // SECURITY FIX: Validate bundle items (includes self-reference check)
    if (input.is_bundle && input.bundle_items) {
      const bundleValidation = await validateBundleItems(supabase, input.bundle_items, input.slug)
      if (!bundleValidation.valid) {
        return NextResponse.json({ error: bundleValidation.error }, { status: 400 })
      }
    }

    // Get max sort_order if not provided
    let sortOrder = input.sort_order
    if (sortOrder === undefined) {
      const { data: maxOrder } = await getEbooksTable(supabase)
        .select('sort_order')
        .order('sort_order', { ascending: false })
        .limit(1)
        .single() as { data: { sort_order: number } | null }
      
      sortOrder = (maxOrder?.sort_order ?? 0) + 1
    }

    // Create Stripe Product and Price FIRST (before DB insert)
    let stripeWarning: string | null = null
    if (stripe && input.price > 0) {
      try {
        const product = await stripe.products.create({
          name: input.title,
          description: input.description,
          metadata: {
            type: 'ebook',
            slug: input.slug,
          },
        })
        stripeProductId = product.id

        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: input.price,
          currency: 'eur',
        })
        stripePriceId = price.id
      } catch (stripeError) {
        console.error('Stripe product creation error:', stripeError)
        // Cleanup any partially created resources
        await cleanupStripeResources(stripeProductId, null)
        stripeProductId = null
        stripePriceId = null
        
        // FIX: Store warning for response
        stripeWarning = 'Stripe-Produkt konnte nicht erstellt werden. Bitte manuell in Stripe erstellen.'
      }
    }

    // Insert ebook
    const insertData = {
      slug: input.slug,
      title: input.title,
      subtitle: input.subtitle || null,
      description: input.description,
      long_description: input.long_description || null,
      price: input.price,
      pages: input.pages || null,
      reading_time: input.reading_time || null,
      chapters: input.chapters,
      features: input.features,
      color: input.color,
      emoji: input.emoji,
      pdf_path: input.pdf_path || null,
      cover_path: input.cover_path || null,
      stripe_product_id: stripeProductId,
      stripe_price_id: stripePriceId,
      is_bundle: input.is_bundle,
      bundle_items: input.bundle_items || null,
      is_active: input.is_active,
      sort_order: sortOrder,
    }

    const { data: ebook, error: insertError } = await getEbooksTable(supabase)
      .insert(insertData)
      .select()
      .single() as { data: Ebook | null; error: Error | null }

    if (insertError || !ebook) {
      console.error('Error creating ebook:', insertError)
      
      // FIX: Handle UNIQUE constraint violation (race condition)
      if (isUniqueViolation(insertError)) {
        return NextResponse.json({ 
          error: 'Ein E-Book mit diesem Slug existiert bereits. Bitte wähle einen anderen Slug.' 
        }, { status: 409 }) // 409 Conflict
      }
      
      // Rollback Stripe resources if DB insert fails
      await cleanupStripeResources(stripeProductId, stripePriceId)
      
      return NextResponse.json({ error: 'Fehler beim Erstellen' }, { status: 500 })
    }

    // Audit log
    await logAuditEvent({
      action: 'EBOOK_CREATED',
      targetId: ebook.id,
      targetType: 'ebook',
      adminId: user.id,
      metadata: { 
        title: input.title, 
        price: input.price,
        stripeProductId,
        stripePriceId,
        ...(stripeWarning && { warning: stripeWarning }),
      },
    })

    // FIX: Return warning if Stripe failed
    return NextResponse.json({ 
      data: ebook,
      ...(stripeWarning && { warning: stripeWarning }),
    }, { status: 201 })
  } catch (err) {
    console.error('Ebook POST error:', err)
    
    // Cleanup Stripe on unexpected error
    await cleanupStripeResources(stripeProductId, stripePriceId)
    
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 })
  }
}
