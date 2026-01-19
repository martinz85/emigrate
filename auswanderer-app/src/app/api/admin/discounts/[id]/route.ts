import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { logAuditEvent } from '@/lib/audit'
import Stripe from 'stripe'

// Initialize Stripe (optional)
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })
  : null

/**
 * Admin API: Delete Discount Code
 * 
 * Deletes both the Supabase record and the Stripe Coupon.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const discountId = params.id

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(discountId)) {
    return NextResponse.json(
      { error: 'Ungültige Discount-ID' },
      { status: 400 }
    )
  }

  // Verify admin access
  const supabaseAuth = await createClient()
  const { data: { user } } = await supabaseAuth.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
  }

  const { data: adminUser } = await supabaseAuth
    .from('admin_users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!adminUser) {
    return NextResponse.json({ error: 'Keine Admin-Berechtigung' }, { status: 403 })
  }

  const supabase = createAdminClient()

  // First, get the discount to find the Stripe coupon ID
  const { data: discount } = await supabase
    .from('discount_codes')
    .select('code, stripe_coupon_id')
    .eq('id', discountId)
    .single()

  // Delete from Supabase
  const { error } = await supabase
    .from('discount_codes')
    .delete()
    .eq('id', discountId)

  if (error) {
    console.error('Error deleting discount:', error)
    return NextResponse.json({ error: 'Löschen fehlgeschlagen' }, { status: 500 })
  }

  // Delete Stripe coupon if exists
  if (stripe && discount?.stripe_coupon_id) {
    try {
      await stripe.coupons.del(discount.stripe_coupon_id)
      console.log(`Stripe coupon deleted: ${discount.stripe_coupon_id}`)
    } catch (stripeError) {
      // Log but don't fail - Supabase record is already deleted
      console.error('Stripe coupon deletion failed:', stripeError)
    }
  }

  // Persist audit log
  await logAuditEvent({
    action: 'DISCOUNT_DELETED',
    targetId: discountId,
    targetType: 'discount_code',
    adminId: user.id,
  })

  return NextResponse.json({ success: true })
}

