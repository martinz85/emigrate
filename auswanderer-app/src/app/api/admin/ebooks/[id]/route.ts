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
// Stripe Client
// ============================================

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })
  : null

// ============================================
// Validation Schema for Update
// ============================================

const updateEbookSchema = z.object({
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/).optional(),
  title: z.string().min(3).max(100).optional(),
  subtitle: z.string().max(100).nullable().optional(),
  description: z.string().min(10).max(500).optional(),
  long_description: z.string().max(5000).nullable().optional(),
  price: z.number().min(0).optional(),
  pages: z.number().int().positive().nullable().optional(),
  reading_time: z.string().max(50).nullable().optional(),
  chapters: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  color: z.string().optional(),
  emoji: z.string().max(10).optional(),
  pdf_path: z.string().nullable().optional(),
  cover_path: z.string().nullable().optional(),
  is_bundle: z.boolean().optional(),
  bundle_items: z.array(z.string()).nullable().optional(),
  is_active: z.boolean().optional(),
  sort_order: z.number().int().optional(),
})

// ============================================
// GET: Single ebook
// ============================================

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, status, user } = await verifyAdminRead()
  if (error || !user) {
    return NextResponse.json({ error }, { status })
  }

  const { id } = await params

  try {
    const supabase = createAdminClient()

    const { data: ebook, error: fetchError } = await getEbooksTable(supabase)
      .select('*')
      .eq('id', id)
      .single() as { data: Ebook | null; error: Error | null }

    if (fetchError || !ebook) {
      return NextResponse.json({ error: 'E-Book nicht gefunden' }, { status: 404 })
    }

    return NextResponse.json({ data: ebook })
  } catch (err) {
    console.error('Ebook GET error:', err)
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 })
  }
}

// ============================================
// PATCH: Update ebook
// ============================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, status, user } = await verifyAdminWrite()
  if (error || !user) {
    return NextResponse.json({ error }, { status })
  }

  const { id } = await params
  let newStripePriceId: string | null = null
  let stripeWarning: string | null = null

  try {
    const body = await request.json()
    
    // Validate input
    const parseResult = updateEbookSchema.safeParse(body)
    if (!parseResult.success) {
      const errors = parseResult.error.issues.map((e: z.ZodIssue) => `${e.path.join('.')}: ${e.message}`).join(', ')
      return NextResponse.json({ error: errors }, { status: 400 })
    }

    const input = parseResult.data
    const supabase = createAdminClient()

    // Get current ebook
    const { data: currentEbook, error: fetchError } = await getEbooksTable(supabase)
      .select('*')
      .eq('id', id)
      .single() as { data: Ebook | null; error: Error | null }

    if (fetchError || !currentEbook) {
      return NextResponse.json({ error: 'E-Book nicht gefunden' }, { status: 404 })
    }

    // Validate bundle items if provided (includes self-reference check)
    const isBundle = input.is_bundle ?? currentEbook.is_bundle
    const bundleItems = input.bundle_items !== undefined ? input.bundle_items : currentEbook.bundle_items
    const newSlug = input.slug || currentEbook.slug
    
    if (isBundle && bundleItems) {
      const bundleValidation = await validateBundleItems(supabase, bundleItems, newSlug)
      if (!bundleValidation.valid) {
        return NextResponse.json({ error: bundleValidation.error }, { status: 400 })
      }
    }

    // Handle price change - create new Stripe price or archive if free
    let newStripeProductId = currentEbook.stripe_product_id
    
    if (stripe && input.price !== undefined && input.price !== currentEbook.price) {
      try {
        if (input.price === 0) {
          // Handle price → 0 case (making ebook free)
          if (currentEbook.stripe_price_id) {
            await stripe.prices.update(currentEbook.stripe_price_id, {
              active: false,
            })
            newStripePriceId = null
            
            if (currentEbook.stripe_product_id) {
              await stripe.products.update(currentEbook.stripe_product_id, {
                active: false,
              })
              newStripeProductId = null
            }
          }
        } else if (input.price > 0) {
          let productId = currentEbook.stripe_product_id
          if (!productId) {
            const product = await stripe.products.create({
              name: input.title || currentEbook.title,
              description: input.description || currentEbook.description,
              metadata: {
                type: 'ebook',
                slug: newSlug,
              },
            })
            productId = product.id
            newStripeProductId = product.id
          }

          const price = await stripe.prices.create({
            product: productId,
            unit_amount: input.price,
            currency: 'eur',
          })
          newStripePriceId = price.id

          if (currentEbook.stripe_price_id) {
            await stripe.prices.update(currentEbook.stripe_price_id, {
              active: false,
            })
          }
        }
      } catch (stripeError) {
        console.error('Stripe price update error:', stripeError)
        
        if (newStripePriceId && newStripePriceId !== currentEbook.stripe_price_id) {
          try {
            await stripe.prices.update(newStripePriceId, { active: false })
          } catch (cleanupErr) {
            console.error('Failed to cleanup Stripe price:', cleanupErr)
          }
        }
        
        // FIX: Store warning for response instead of silent failure
        stripeWarning = 'Stripe-Preis konnte nicht aktualisiert werden. Bitte manuell in Stripe prüfen.'
        
        newStripePriceId = currentEbook.stripe_price_id
        newStripeProductId = currentEbook.stripe_product_id
      }
    }

    // Build update object - only include defined fields
    const updateData: Record<string, unknown> = {}
    
    if (input.slug !== undefined) updateData.slug = input.slug
    if (input.title !== undefined) updateData.title = input.title
    if (input.subtitle !== undefined) updateData.subtitle = input.subtitle
    if (input.description !== undefined) updateData.description = input.description
    if (input.long_description !== undefined) updateData.long_description = input.long_description
    if (input.price !== undefined) updateData.price = input.price
    if (input.pages !== undefined) updateData.pages = input.pages
    if (input.reading_time !== undefined) updateData.reading_time = input.reading_time
    if (input.chapters !== undefined) updateData.chapters = input.chapters
    if (input.features !== undefined) updateData.features = input.features
    if (input.color !== undefined) updateData.color = input.color
    if (input.emoji !== undefined) updateData.emoji = input.emoji
    if (input.pdf_path !== undefined) updateData.pdf_path = input.pdf_path
    if (input.cover_path !== undefined) updateData.cover_path = input.cover_path
    if (input.is_bundle !== undefined) updateData.is_bundle = input.is_bundle
    if (input.bundle_items !== undefined) updateData.bundle_items = input.bundle_items
    if (input.is_active !== undefined) updateData.is_active = input.is_active
    if (input.sort_order !== undefined) updateData.sort_order = input.sort_order
    
    if (newStripePriceId !== currentEbook.stripe_price_id) {
      updateData.stripe_price_id = newStripePriceId
    }
    if (newStripeProductId !== currentEbook.stripe_product_id) {
      updateData.stripe_product_id = newStripeProductId
    }

    // Update ebook
    const { data: ebook, error: updateError } = await getEbooksTable(supabase)
      .update(updateData)
      .eq('id', id)
      .select()
      .single() as { data: Ebook | null; error: Error | null }

    if (updateError || !ebook) {
      console.error('Error updating ebook:', updateError)
      
      // FIX: Handle UNIQUE constraint violation (race condition on slug)
      if (isUniqueViolation(updateError)) {
        return NextResponse.json({ 
          error: 'Ein E-Book mit diesem Slug existiert bereits. Bitte wähle einen anderen Slug.' 
        }, { status: 409 })
      }
      
      if (newStripePriceId && newStripePriceId !== currentEbook.stripe_price_id && stripe) {
        try {
          await stripe.prices.update(newStripePriceId, { active: false })
        } catch (cleanupErr) {
          console.error('Failed to cleanup Stripe price after DB failure:', cleanupErr)
        }
      }
      
      return NextResponse.json({ error: 'Fehler beim Aktualisieren' }, { status: 500 })
    }

    // Audit log
    await logAuditEvent({
      action: 'EBOOK_UPDATED',
      targetId: ebook.id,
      targetType: 'ebook',
      adminId: user.id,
      metadata: { 
        title: ebook.title,
        changes: Object.keys(updateData),
        ...(stripeWarning && { warning: stripeWarning }),
      },
    })

    // FIX: Return warning if Stripe failed
    return NextResponse.json({ 
      data: ebook,
      ...(stripeWarning && { warning: stripeWarning }),
    })
  } catch (err) {
    console.error('Ebook PATCH error:', err)
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 })
  }
}

// ============================================
// DELETE: Soft delete ebook
// ============================================

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, status, user } = await verifyAdminWrite()
  if (error || !user) {
    return NextResponse.json({ error }, { status })
  }

  const { id } = await params

  try {
    const supabase = createAdminClient()

    const { data: ebook, error: fetchError } = await getEbooksTable(supabase)
      .select('id, title, stripe_product_id, slug')
      .eq('id', id)
      .single() as { data: { id: string; title: string; stripe_product_id: string | null; slug: string } | null; error: Error | null }

    if (fetchError || !ebook) {
      return NextResponse.json({ error: 'E-Book nicht gefunden' }, { status: 404 })
    }

    // Check if ebook is referenced in any bundle
    const { data: bundlesUsingThis } = await getEbooksTable(supabase)
      .select('title')
      .eq('is_bundle', true)
      .is('deleted_at', null)
      .contains('bundle_items', [ebook.slug])

    if (bundlesUsingThis && bundlesUsingThis.length > 0) {
      const bundleNames = bundlesUsingThis.map((b: { title: string }) => b.title).join(', ')
      return NextResponse.json({ 
        error: `Dieses E-Book kann nicht gelöscht werden, da es in folgenden Bundles enthalten ist: ${bundleNames}. Entferne es zuerst aus den Bundles.` 
      }, { status: 400 })
    }

    const { error: deleteError } = await getEbooksTable(supabase)
      .update({ 
        deleted_at: new Date().toISOString(),
        is_active: false,
      })
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting ebook:', deleteError)
      return NextResponse.json({ error: 'Fehler beim Löschen' }, { status: 500 })
    }

    // Archive Stripe product (optional - best effort)
    let stripeWarning: string | null = null
    if (stripe && ebook.stripe_product_id) {
      try {
        await stripe.products.update(ebook.stripe_product_id, {
          active: false,
        })
      } catch (stripeError) {
        console.error('Stripe product archive error:', stripeError)
        stripeWarning = 'Stripe-Produkt konnte nicht archiviert werden. Bitte manuell in Stripe archivieren.'
      }
    }

    // Audit log
    await logAuditEvent({
      action: 'EBOOK_DELETED',
      targetId: ebook.id,
      targetType: 'ebook',
      adminId: user.id,
      metadata: { 
        title: ebook.title,
        ...(stripeWarning && { warning: stripeWarning }),
      },
    })

    return NextResponse.json({ 
      success: true,
      ...(stripeWarning && { warning: stripeWarning }),
    })
  } catch (err) {
    console.error('Ebook DELETE error:', err)
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 })
  }
}
