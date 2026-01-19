import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { transformDbPlan, FALLBACK_PLANS } from '@/lib/plans'

// Cache for 5 minutes (plans don't change often)
export const revalidate = 300

export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Error fetching plans:', error)
      // Return fallback plans on error
      return NextResponse.json(FALLBACK_PLANS, {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      })
    }

    if (!data || data.length === 0) {
      // Return fallback plans if no data
      return NextResponse.json(FALLBACK_PLANS, {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      })
    }

    const plans = data.map(transformDbPlan)

    return NextResponse.json(plans, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    })
  } catch (error) {
    console.error('Plans API error:', error)
    return NextResponse.json(FALLBACK_PLANS, {
      status: 200, // Return 200 with fallback data
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    })
  }
}

