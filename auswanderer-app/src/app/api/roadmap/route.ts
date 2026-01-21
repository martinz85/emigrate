/**
 * Roadmap API
 * Story 8.6: Fahrplan mit Checkpoints (PRO Dashboard)
 * 
 * Returns roadmap phases and checkpoints with user progress.
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Note: roadmap tables may not be in generated types yet
    // Using explicit table access pattern
    
    // Get all phases
    const { data: phases, error: phasesError } = await (supabase as any)
      .from('roadmap_phases')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (phasesError) {
      console.error('Error fetching phases:', phasesError)
      return NextResponse.json(
        { error: 'Fahrplan konnte nicht geladen werden' },
        { status: 500 }
      )
    }

    // Get all checkpoints
    const { data: checkpoints, error: checkpointsError } = await (supabase as any)
      .from('roadmap_checkpoints')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (checkpointsError) {
      console.error('Error fetching checkpoints:', checkpointsError)
      return NextResponse.json(
        { error: 'Checkpoints konnten nicht geladen werden' },
        { status: 500 }
      )
    }

    // Get user progress if logged in
    let userProgress: Record<string, { completedAt: string; notes?: string }> = {}
    
    if (user) {
      const { data: progress } = await (supabase as any)
        .from('user_roadmap_progress')
        .select('checkpoint_id, completed_at, notes')
        .eq('user_id', user.id)

      if (progress) {
        userProgress = (progress as Array<{ checkpoint_id: string; completed_at: string; notes?: string }>).reduce(
          (acc: Record<string, { completedAt: string; notes?: string }>, p) => {
            acc[p.checkpoint_id] = {
              completedAt: p.completed_at,
              notes: p.notes,
            }
            return acc
          }, 
          {} as Record<string, { completedAt: string; notes?: string }>
        )
      }
    }

    // Type definitions for roadmap data
    interface RoadmapPhase {
      id: string
      title: string
      description: string | null
      emoji: string
      sort_order: number
    }
    interface RoadmapCheckpoint {
      id: string
      phase_id: string
      title: string
      description: string | null
      sort_order: number
    }

    // Build response with nested checkpoints
    const phasesTyped = phases as RoadmapPhase[] | null
    const checkpointsTyped = checkpoints as RoadmapCheckpoint[] | null

    const roadmap = phasesTyped?.map((phase: RoadmapPhase) => {
      const phaseCheckpoints = checkpointsTyped?.filter((c: RoadmapCheckpoint) => c.phase_id === phase.id) || []
      const completedCount = phaseCheckpoints.filter((c: RoadmapCheckpoint) => userProgress[c.id]).length
      
      return {
        ...phase,
        checkpoints: phaseCheckpoints.map((c: RoadmapCheckpoint) => ({
          ...c,
          completed: !!userProgress[c.id],
          completedAt: userProgress[c.id]?.completedAt,
          notes: userProgress[c.id]?.notes,
        })),
        progress: {
          total: phaseCheckpoints.length,
          completed: completedCount,
          percent: phaseCheckpoints.length > 0 
            ? Math.round((completedCount / phaseCheckpoints.length) * 100)
            : 0,
        },
      }
    }) || []

    // Calculate overall progress
    const totalCheckpoints = checkpointsTyped?.length || 0
    const completedCheckpoints = Object.keys(userProgress).length
    const overallPercent = totalCheckpoints > 0
      ? Math.round((completedCheckpoints / totalCheckpoints) * 100)
      : 0

    return NextResponse.json({
      phases: roadmap,
      progress: {
        total: totalCheckpoints,
        completed: completedCheckpoints,
        percent: overallPercent,
      },
      isLoggedIn: !!user,
    })

  } catch (error) {
    console.error('Roadmap API error:', error)
    return NextResponse.json(
      { error: 'Serverfehler' },
      { status: 500 }
    )
  }
}

