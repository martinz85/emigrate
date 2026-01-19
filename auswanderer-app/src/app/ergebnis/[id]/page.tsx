import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ResultTeaser } from '@/components/results/ResultTeaser'
import { ResultUnlocked } from '@/components/results/ResultUnlocked'

export const metadata = {
  title: 'Dein Ergebnis | Auswanderer-Plattform',
  description: 'Deine personalisierte Auswanderungs-Analyse ist fertig. Entdecke dein Top-Match!',
}

/**
 * Result Page - Server Component
 * 
 * Security: Payment status is verified server-side from Supabase.
 * URL parameters are NOT trusted.
 */
export default async function ResultPage({ 
  params 
}: { 
  params: { id: string }
}) {
  const analysisId = params.id
  
  // Validate ID format (UUID)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  const isDemoId = analysisId === 'demo'
  
  if (!isDemoId && !uuidRegex.test(analysisId)) {
    notFound()
  }

  const supabase = await createClient()
  const cookieStore = await cookies()
  const sessionId = cookieStore.get('session_id')?.value

  // Get current user (may be null for anonymous users)
  const { data: { user } } = await supabase.auth.getUser()

  // Handle demo mode for development
  if (isDemoId) {
    return renderDemoPage(analysisId)
  }

  // Fetch analysis from Supabase
  const { data: analysis, error } = await supabase
    .from('analyses')
    .select('*')
    .eq('id', analysisId)
    .single()

  if (error || !analysis) {
    console.error('Analysis not found:', error)
    notFound()
  }

  // Security: Check ownership
  // User can access if:
  // 1. They are logged in and own the analysis (user_id matches)
  // 2. They are anonymous and have the matching session_id
  // 3. The analysis has no owner (legacy data)
  const isOwner = 
    (user && analysis.user_id === user.id) ||
    (!user && analysis.session_id === sessionId) ||
    (analysis.user_id === null && analysis.session_id === null)

  // For now, allow viewing teaser even if not owner
  // But only show full result to owner with paid status
  const canViewFull = isOwner && analysis.paid === true

  if (canViewFull) {
    // Full result for paid users
    const result = analysis.result as {
      topCountry: string
      matchPercentage: number
      rankings: Array<{
        rank: number
        country: string
        percentage: number
        strengths?: string[]
        considerations?: string[]
      }>
    } | null

    if (!result) {
      // Analysis exists but no result yet - shouldn't happen
      console.error('Paid analysis has no result:', analysisId)
      notFound()
    }

    return (
      <>
        <Header />
        <main id="main-content" className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-20">
          <ResultUnlocked 
            analysisId={analysisId}
            result={{
              topCountry: result.topCountry,
              matchPercentage: result.matchPercentage,
              rankings: result.rankings,
            }}
          />
        </main>
        <Footer />
      </>
    )
  }

  // Teaser for unpaid users - extract safe data only
  const result = analysis.result as {
    topCountry?: string
    matchPercentage?: number
    rankings?: Array<{
      rank: number
      percentage: number
    }>
  } | null

  const teaserData = {
    matchPercentage: result?.matchPercentage || 85,
    topCountryNameLength: result?.topCountry?.length || 8,
    rankings: result?.rankings?.slice(0, 5).map(r => ({
      rank: r.rank,
      percentage: r.percentage,
    })) || [
      { rank: 1, percentage: 92 },
      { rank: 2, percentage: 87 },
      { rank: 3, percentage: 81 },
    ],
  }

  return (
    <>
      <Header />
      <main id="main-content" className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-20">
        <ResultTeaser 
          analysisId={analysisId}
          result={teaserData}
        />
      </main>
      <Footer />
    </>
  )
}

/**
 * Demo page for development/testing
 * Shows both teaser and unlocked views depending on query param
 */
function renderDemoPage(analysisId: string) {
  // For demo, show unlocked view with mock data
  const demoResult = {
    topCountry: 'Portugal',
    matchPercentage: 92,
    rankings: [
      { 
        rank: 1, 
        country: 'Portugal', 
        percentage: 92,
        strengths: ['Niedrige Lebenshaltung', 'Angenehmes Klima', 'Gute Infrastruktur'],
        considerations: ['Sprachbarriere', 'Bürokratie'],
      },
      { 
        rank: 2, 
        country: 'Spanien', 
        percentage: 87,
        strengths: ['Lebensqualität', 'Kultur & Essen', 'Gesundheitssystem'],
        considerations: ['Höhere Kosten in Großstädten'],
      },
      { 
        rank: 3, 
        country: 'Zypern', 
        percentage: 81,
        strengths: ['Steuervorteile', 'Englisch verbreitet', 'EU-Mitglied'],
        considerations: ['Kleine Insel', 'Sommer sehr heiß'],
      },
      { 
        rank: 4, 
        country: 'Costa Rica', 
        percentage: 77,
        strengths: ['Natur & Biodiversität', 'Pura Vida Lifestyle'],
        considerations: ['Entfernung zu Europa', 'Visabestimmungen'],
      },
      { 
        rank: 5, 
        country: 'Uruguay', 
        percentage: 73,
        strengths: ['Stabilität', 'Demokratie', 'Sicherheit'],
        considerations: ['Kleine Wirtschaft', 'Isolierte Lage'],
      },
    ],
  }

  return (
    <>
      <Header />
      <main id="main-content" className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-20">
        {/* Demo Banner */}
        <div className="bg-amber-100 border-b border-amber-200 py-2 text-center text-sm text-amber-800">
          🛠️ Demo-Modus: Dies sind Beispieldaten
        </div>
        <ResultUnlocked 
          analysisId={analysisId}
          result={demoResult}
        />
      </main>
      <Footer />
    </>
  )
}
