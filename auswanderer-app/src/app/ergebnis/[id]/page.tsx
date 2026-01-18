import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ResultTeaser } from '@/components/results/ResultTeaser'

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

export const metadata = {
  title: 'Dein Ergebnis | Auswanderer-Plattform',
  description: 'Deine personalisierte Auswanderungs-Analyse ist fertig. Entdecke dein Top-Match!',
}

export default function ResultPage({ params }: { params: { id: string } }) {
  const analysisId = params.id
  
  // Get teaser data (secure - no country names)
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
