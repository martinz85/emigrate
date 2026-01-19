import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { logAuditEvent } from '@/lib/audit'

/**
 * Admin API: Update Product Price
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { productKey: string } }
) {
  const productKey = params.productKey

  // Validate productKey
  const validProducts = ['analysis', 'ebook', 'pro_monthly', 'pro_yearly']
  if (!validProducts.includes(productKey)) {
    return NextResponse.json(
      { error: 'Ungültiger Produkt-Key' },
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

  try {
    const body = await request.json()
    const { 
      regularPrice, 
      campaignPrice, 
      campaignActive, 
      campaignName,
      productName,
      productDescription,
      isActive,
    } = body

    // Validate prices
    if (regularPrice !== undefined) {
      if (typeof regularPrice !== 'number' || regularPrice <= 0) {
        return NextResponse.json({ error: 'Regulärer Preis muss größer als 0 sein' }, { status: 400 })
      }
    }

    const supabase = createAdminClient()

    // Fetch existing price if regularPrice not in body (needed for campaignPrice validation)
    let effectiveRegularPrice = regularPrice
    if (effectiveRegularPrice === undefined) {
      const { data: existingPrice } = await supabase
        .from('price_config')
        .select('regular_price')
        .eq('product_key', productKey)
        .single()
      effectiveRegularPrice = existingPrice?.regular_price
    }

    if (campaignPrice !== undefined && campaignPrice !== null) {
      if (typeof campaignPrice !== 'number' || campaignPrice < 0) {
        return NextResponse.json({ error: 'Ungültiger Kampagnen-Preis' }, { status: 400 })
      }
      // Check against effective regular price (existing or new)
      if (effectiveRegularPrice && campaignPrice >= effectiveRegularPrice) {
        return NextResponse.json({ error: 'Kampagnen-Preis muss kleiner als regulärer Preis sein' }, { status: 400 })
      }
    }

    // If campaign is active, campaign price is required
    if (campaignActive && !campaignPrice) {
      return NextResponse.json({ error: 'Kampagnen-Preis erforderlich wenn Kampagne aktiv' }, { status: 400 })
    }

    // Build update object (only include provided fields)
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    }

    if (regularPrice !== undefined) updateData.regular_price = regularPrice
    if (campaignPrice !== undefined) updateData.campaign_price = campaignPrice || null
    if (campaignActive !== undefined) updateData.campaign_active = campaignActive
    if (campaignName !== undefined) updateData.campaign_name = campaignName || null
    if (productName !== undefined) updateData.product_name = productName
    if (productDescription !== undefined) updateData.product_description = productDescription
    if (isActive !== undefined) updateData.is_active = isActive

    const { error: updateError } = await supabase
      .from('price_config')
      .update(updateData)
      .eq('product_key', productKey)

    if (updateError) {
      console.error('Error updating price:', updateError)
      return NextResponse.json({ error: 'Fehler beim Speichern' }, { status: 500 })
    }

    // Persist audit log
    await logAuditEvent({
      action: 'PRICE_UPDATED',
      targetId: productKey,
      targetType: 'price',
      adminId: user.id,
      metadata: { 
        regularPrice, 
        campaignPrice, 
        campaignActive, 
        campaignName,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Price update error:', error)
    return NextResponse.json({ error: 'Fehler beim Speichern' }, { status: 500 })
  }
}

