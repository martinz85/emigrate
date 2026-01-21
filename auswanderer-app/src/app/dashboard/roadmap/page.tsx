/**
 * Roadmap Dashboard Page
 * Story 8.6: Fahrplan mit Checkpoints (PRO Dashboard)
 * 
 * Displays the emigration roadmap with phases and checkpoints.
 */

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { RoadmapView } from './RoadmapView'

export default async function RoadmapPage() {
  const supabase = await createClient()
  
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login?return_to=/dashboard/roadmap')
  }

  // Check if user is PRO
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier, subscription_status')
    .eq('id', user.id)
    .single()

  const isPro = profile?.subscription_tier === 'pro' && 
    (profile?.subscription_status === 'active' || profile?.subscription_status === 'trialing')

  // Show teaser for non-PRO users
  if (!isPro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-12 border border-white/10">
            <span className="text-6xl mb-6 block">🗺️</span>
            <h1 className="text-3xl font-bold text-white mb-4">
              Dein Auswanderungs-Fahrplan
            </h1>
            <p className="text-gray-400 mb-8 text-lg">
              Der Fahrplan hilft dir, alle wichtigen Schritte deiner Auswanderung
              zu planen und im Blick zu behalten. Dieses Feature ist nur für PRO-Mitglieder verfügbar.
            </p>

            {/* Preview */}
            <div className="bg-white/5 rounded-xl p-6 mb-8 text-left">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🔍</span>
                <h3 className="font-semibold text-white">Entscheidung & Recherche</h3>
              </div>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center gap-2 opacity-50">
                  <span>☐</span> Zielland entschieden
                </div>
                <div className="flex items-center gap-2 opacity-50">
                  <span>☐</span> Analyse durchgeführt
                </div>
                <div className="flex items-center gap-2 opacity-50">
                  <span>☐</span> ...und 25+ weitere Checkpoints
                </div>
              </div>
            </div>

            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-semibold py-4 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl"
            >
              <span>👑</span>
              <span>Jetzt PRO werden</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Fetch roadmap data
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/roadmap`, {
    cache: 'no-store',
    headers: {
      Cookie: `sb-access-token=${(await supabase.auth.getSession()).data.session?.access_token}`,
    },
  })

  let roadmapData = null
  try {
    if (response.ok) {
      roadmapData = await response.json()
    }
  } catch (e) {
    console.error('Failed to fetch roadmap:', e)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🗺️</span>
            <h1 className="text-3xl font-bold text-white">
              Dein Auswanderungs-Fahrplan
            </h1>
          </div>
          <p className="text-gray-400">
            Behalte alle wichtigen Schritte im Blick und feiere jeden Fortschritt.
          </p>
        </div>

        {/* Roadmap View (Client Component) */}
        <RoadmapView initialData={roadmapData} />
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Fahrplan | Dashboard',
  description: 'Dein persönlicher Auswanderungs-Fahrplan mit Checkpoints',
}

