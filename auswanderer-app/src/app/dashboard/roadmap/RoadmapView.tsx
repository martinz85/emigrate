'use client'

/**
 * Roadmap View Client Component
 * Story 8.6: Fahrplan mit Checkpoints (PRO Dashboard)
 * 
 * Interactive roadmap with collapsible phases and toggleable checkpoints.
 */

import { useState, useEffect } from 'react'

interface Checkpoint {
  id: string
  title: string
  description: string | null
  sort_order: number
  completed: boolean
  completedAt?: string
  notes?: string
}

interface Phase {
  id: string
  title: string
  description: string | null
  emoji: string
  sort_order: number
  checkpoints: Checkpoint[]
  progress: {
    total: number
    completed: number
    percent: number
  }
}

interface RoadmapData {
  phases: Phase[]
  progress: {
    total: number
    completed: number
    percent: number
  }
  isLoggedIn: boolean
}

interface RoadmapViewProps {
  initialData: RoadmapData | null
}

export function RoadmapView({ initialData }: RoadmapViewProps) {
  const [data, setData] = useState<RoadmapData | null>(initialData)
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(() => {
    // Start with first incomplete phase expanded
    if (initialData?.phases) {
      const firstIncomplete = initialData.phases.find(p => p.progress.percent < 100)
      return new Set(firstIncomplete ? [firstIncomplete.id] : [initialData.phases[0]?.id])
    }
    return new Set()
  })
  const [loadingCheckpoints, setLoadingCheckpoints] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(!initialData)

  // Fetch data if not provided
  useEffect(() => {
    if (!initialData) {
      fetchRoadmap()
    }
  }, [initialData])

  const fetchRoadmap = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/roadmap')
      if (response.ok) {
        const roadmapData = await response.json()
        setData(roadmapData)
        
        // Expand first incomplete phase
        const firstIncomplete = roadmapData.phases?.find((p: Phase) => p.progress.percent < 100)
        if (firstIncomplete) {
          setExpandedPhases(new Set([firstIncomplete.id]))
        }
      }
    } catch (error) {
      console.error('Failed to fetch roadmap:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const togglePhase = (phaseId: string) => {
    setExpandedPhases(prev => {
      const next = new Set(prev)
      if (next.has(phaseId)) {
        next.delete(phaseId)
      } else {
        next.add(phaseId)
      }
      return next
    })
  }

  const toggleCheckpoint = async (checkpointId: string, currentCompleted: boolean) => {
    // Optimistic update
    setLoadingCheckpoints(prev => new Set(prev).add(checkpointId))
    
    try {
      const response = await fetch('/api/roadmap/checkpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkpointId,
          completed: !currentCompleted,
        }),
      })

      if (response.ok) {
        // Update local state
        setData(prev => {
          if (!prev) return prev
          
          const newPhases = prev.phases.map(phase => {
            const newCheckpoints = phase.checkpoints.map(cp => {
              if (cp.id === checkpointId) {
                return {
                  ...cp,
                  completed: !currentCompleted,
                  completedAt: !currentCompleted ? new Date().toISOString() : undefined,
                }
              }
              return cp
            })
            
            const completedCount = newCheckpoints.filter(c => c.completed).length
            
            return {
              ...phase,
              checkpoints: newCheckpoints,
              progress: {
                total: newCheckpoints.length,
                completed: completedCount,
                percent: newCheckpoints.length > 0 
                  ? Math.round((completedCount / newCheckpoints.length) * 100)
                  : 0,
              },
            }
          })

          const totalCompleted = newPhases.reduce((sum, p) => sum + p.progress.completed, 0)
          const totalCheckpoints = newPhases.reduce((sum, p) => sum + p.progress.total, 0)

          return {
            ...prev,
            phases: newPhases,
            progress: {
              total: totalCheckpoints,
              completed: totalCompleted,
              percent: totalCheckpoints > 0 
                ? Math.round((totalCompleted / totalCheckpoints) * 100)
                : 0,
            },
          }
        })
      }
    } catch (error) {
      console.error('Failed to toggle checkpoint:', error)
    } finally {
      setLoadingCheckpoints(prev => {
        const next = new Set(prev)
        next.delete(checkpointId)
        return next
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <svg className="animate-spin h-8 w-8 text-purple-500" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span className="ml-3 text-gray-400">Lade Fahrplan...</span>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-gray-400">
        Fahrplan konnte nicht geladen werden.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Gesamtfortschritt</h2>
          <span className="text-2xl font-bold text-purple-400">{data.progress.percent}%</span>
        </div>
        <div className="h-4 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${data.progress.percent}%` }}
          />
        </div>
        <p className="text-sm text-gray-400 mt-2">
          {data.progress.completed} von {data.progress.total} Checkpoints erledigt
        </p>
      </div>

      {/* Phases */}
      <div className="space-y-4">
        {data.phases.map((phase, index) => (
          <div 
            key={phase.id}
            className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden"
          >
            {/* Phase Header */}
            <button
              onClick={() => togglePhase(phase.id)}
              className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl">{phase.emoji}</span>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Phase {index + 1}</span>
                    {phase.progress.percent === 100 && (
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                        ✓ Abgeschlossen
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-white">{phase.title}</h3>
                  {phase.description && (
                    <p className="text-sm text-gray-400">{phase.description}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Mini progress */}
                <div className="text-right">
                  <div className="text-sm font-medium text-white">
                    {phase.progress.completed}/{phase.progress.total}
                  </div>
                  <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500 rounded-full transition-all duration-300"
                      style={{ width: `${phase.progress.percent}%` }}
                    />
                  </div>
                </div>
                
                {/* Expand icon */}
                <svg 
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    expandedPhases.has(phase.id) ? 'rotate-180' : ''
                  }`}
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {/* Checkpoints */}
            {expandedPhases.has(phase.id) && (
              <div className="border-t border-white/10 p-6 space-y-3">
                {phase.checkpoints.map(checkpoint => (
                  <div 
                    key={checkpoint.id}
                    className={`flex items-start gap-4 p-4 rounded-xl transition-colors ${
                      checkpoint.completed 
                        ? 'bg-green-500/10' 
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <button
                      onClick={() => toggleCheckpoint(checkpoint.id, checkpoint.completed)}
                      disabled={loadingCheckpoints.has(checkpoint.id)}
                      className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        checkpoint.completed
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-500 hover:border-purple-500'
                      } ${loadingCheckpoints.has(checkpoint.id) ? 'opacity-50' : ''}`}
                    >
                      {loadingCheckpoints.has(checkpoint.id) ? (
                        <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : checkpoint.completed ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : null}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-medium ${
                        checkpoint.completed ? 'text-green-400 line-through' : 'text-white'
                      }`}>
                        {checkpoint.title}
                      </h4>
                      {checkpoint.description && (
                        <p className="text-sm text-gray-400 mt-1">
                          {checkpoint.description}
                        </p>
                      )}
                      {checkpoint.completed && checkpoint.completedAt && (
                        <p className="text-xs text-gray-500 mt-1">
                          ✓ Erledigt am {new Date(checkpoint.completedAt).toLocaleDateString('de-DE')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Celebration message when complete */}
      {data.progress.percent === 100 && (
        <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl p-8 border border-green-500/30 text-center">
          <span className="text-5xl mb-4 block">🎉</span>
          <h2 className="text-2xl font-bold text-white mb-2">
            Herzlichen Glückwunsch!
          </h2>
          <p className="text-gray-300">
            Du hast alle Checkpoints abgeschlossen. Willkommen in deinem neuen Zuhause!
          </p>
        </div>
      )}
    </div>
  )
}

