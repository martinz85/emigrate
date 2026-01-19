import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Public API: Get All Product Prices
 * 
 * Returns prices with campaign information for frontend display.
 * Used for dynamic price rendering with strikethrough support.
 */
export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('price_config')
    .select(`
      product_key,
      product_name,
      product_description,
      regular_price,
      campaign_price,
      campaign_active,
      campaign_name,
      currency
    `)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Error fetching prices:', error)
    return NextResponse.json({ error: 'Failed to fetch prices' }, { status: 500 })
  }

  // Transform to frontend-friendly format with computed currentPrice
  const prices = (data || []).reduce((acc, p) => {
    acc[p.product_key] = {
      name: p.product_name,
      description: p.product_description,
      regularPrice: p.regular_price,
      currentPrice: p.campaign_active && p.campaign_price 
        ? p.campaign_price 
        : p.regular_price,
      campaignActive: p.campaign_active,
      campaignName: p.campaign_name,
      currency: p.currency,
      // Computed savings
      savings: p.campaign_active && p.campaign_price 
        ? p.regular_price - p.campaign_price 
        : 0,
      savingsPercent: p.campaign_active && p.campaign_price 
        ? Math.round((1 - p.campaign_price / p.regular_price) * 100) 
        : 0,
    }
    return acc
  }, {} as Record<string, unknown>)

  return NextResponse.json(prices)
}

