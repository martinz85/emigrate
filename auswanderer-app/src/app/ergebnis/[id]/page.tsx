import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ResultTeaser } from '@/components/results/ResultTeaser'

// Mock data for development - in production this would come from Supabase
function getMockAnalysisResult(id: string) {
  // Demo result for testing
  return {
    topCountry: 'Portugal',
    matchPercentage: 92,
    rankings: [
      { rank: 1, country: 'Portugal', percentage: 92 },
      { rank: 2, country: 'Spanien', percentage: 87 },
      { rank: 3, country: 'Zypern', percentage: 81 },
      { rank: 4, country: 'Costa Rica', percentage: 77 },
      { rank: 5, country: 'Uruguay', percentage: 73 },
    ],
  }
}

export const metadata = {
  title: 'Dein Ergebnis | Auswanderer-Plattform',
  description: 'Deine personalisierte Auswanderungs-Analyse ist fertig. Entdecke dein Top-Match!',
}

export default function ResultPage({ params }: { params: { id: string } }) {
  const analysisId = params.id
  
  // In production, fetch from Supabase based on analysisId
  // For now, use mock data
  const result = getMockAnalysisResult(analysisId)

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
