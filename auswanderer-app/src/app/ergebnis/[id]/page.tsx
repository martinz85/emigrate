import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ResultTeaser } from '@/components/results/ResultTeaser'
import { ResultUnlocked } from '@/components/results/ResultUnlocked'

/**
 * ⚠️ SECURITY WARNING (MVP):
 * 
 * The current implementation uses a URL parameter (?unlocked=true) to determine
 * whether to show the full result or teaser. This is ONLY for development/demo purposes.
 * 
 * For production (Epic 6), the unlock status MUST be verified server-side:
 * 1. Query Supabase to check if the analysis has been paid for
 * 2. Verify the current user owns the analysis (authentication)
 * 3. Only then return the full country names and data
 * 
 * Example production implementation:
 * ```
 * async function checkPaymentStatus(analysisId: string): Promise<boolean> {
 *   const session = await getServerSession()
 *   if (!session?.user) return false
 *   
 *   const { data } = await supabase
 *     .from('analyses')
 *     .select('paid, user_id')
 *     .eq('id', analysisId)
 *     .single()
 *   
 *   return data?.paid === true && data?.user_id === session.user.id
 * }
 * ```
 */

/**
 * SECURITY: This function returns TEASER data only
 * Country names are NOT included - only lengths and percentages
 * Full data is only sent after payment verification
 */
function getTeaserResult(id: string) {
  // In production: fetch from Supabase, verify payment status
  // Only return country names if user has paid
  
  // Demo teaser result - NO country names exposed
  return {
    matchPercentage: 92,
    topCountryNameLength: 8, // "Portugal".length - but name not sent!
    rankings: [
      { rank: 1, percentage: 92 },
      { rank: 2, percentage: 87 },
      { rank: 3, percentage: 81 },
      { rank: 4, percentage: 77 },
      { rank: 5, percentage: 73 },
    ],
  }
}

/**
 * Full result data - only provided after payment verification
 * In production: This would come from Supabase after verifying payment
 */
function getUnlockedResult(id: string) {
  // Demo unlocked result with full country names
  return {
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
}

export const metadata = {
  title: 'Dein Ergebnis | Auswanderer-Plattform',
  description: 'Deine personalisierte Auswanderungs-Analyse ist fertig. Entdecke dein Top-Match!',
}

interface ResultPageProps {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function ResultPage({ params, searchParams }: ResultPageProps) {
  const analysisId = params.id
  const isUnlocked = searchParams.unlocked === 'true'
  
  // In production: verify payment status via Supabase
  // For now: use URL param to determine which view to show
  
  if (isUnlocked) {
    // Full result for paid users
    const result = getUnlockedResult(analysisId)
    
    return (
      <>
        <Header />
        <main id="main-content" className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-20">
          <ResultUnlocked 
            analysisId={analysisId}
            result={result}
          />
        </main>
        <Footer />
      </>
    )
  }

  // Teaser for unpaid users
  const result = getTeaserResult(analysisId)

  return (
    <>
      <Header />
      <main id="main-content" className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-20">
        <ResultTeaser 
          analysisId={analysisId}
          result={result}
        />
      </main>
      <Footer />
    </>
  )
}
