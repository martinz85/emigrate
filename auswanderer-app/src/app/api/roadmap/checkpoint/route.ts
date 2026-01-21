/**
 * Roadmap Checkpoint Toggle API
 * Story 8.6: Fahrplan mit Checkpoints (PRO Dashboard)
 * 
 * Toggle checkpoint completion status.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { z } from 'zod'

const toggleSchema = z.object({
  checkpointId: z.string().uuid(),
  completed: z.boolean(),
  notes: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 401 }
      )
    }

    // Check if user is PRO
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier, subscription_status')
      .eq('id', user.id)
      .single()

    const isPro = profile?.subscription_tier === 'pro' && 
      (profile?.subscription_status === 'active' || profile?.subscription_status === 'trialing')

    if (!isPro) {
      return NextResponse.json(
        { error: 'Fahrplan ist nur für PRO-User verfügbar' },
        { status: 403 }
      )
    }

    // Parse request
    const body = await request.json()
    const parseResult = toggleSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Ungültige Anfrage' },
        { status: 400 }
      )
    }

    const { checkpointId, completed, notes } = parseResult.data
    const supabaseAdmin = createAdminClient()

    // Note: user_roadmap_progress table may not be in generated types yet
    // Using explicit table access pattern
    if (completed) {
      // Insert or update progress
      const { error } = await (supabaseAdmin as any)
        .from('user_roadmap_progress')
        .upsert({
          user_id: user.id,
          checkpoint_id: checkpointId,
          completed_at: new Date().toISOString(),
          notes: notes || null,
        }, {
          onConflict: 'user_id,checkpoint_id',
        })

      if (error) {
        console.error('Error saving progress:', error)
        return NextResponse.json(
          { error: 'Fortschritt konnte nicht gespeichert werden' },
          { status: 500 }
        )
      }
    } else {
      // Delete progress (uncomplete)
      const { error } = await (supabaseAdmin as any)
        .from('user_roadmap_progress')
        .delete()
        .eq('user_id', user.id)
        .eq('checkpoint_id', checkpointId)

      if (error) {
        console.error('Error deleting progress:', error)
        return NextResponse.json(
          { error: 'Fortschritt konnte nicht entfernt werden' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      checkpointId,
      completed,
    })

  } catch (error) {
    console.error('Checkpoint toggle error:', error)
    return NextResponse.json(
      { error: 'Serverfehler' },
      { status: 500 }
    )
  }
}

