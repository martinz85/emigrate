import { Header } from '@/components/layout/Header'
import { AnalysisFlow } from '@/components/analysis/AnalysisFlow'
import { getActiveQuestions, getAnalysisSettings } from '@/lib/questions'

export const metadata = {
  title: 'AI-Analyse starten | Auswanderer-Plattform',
  description: 'Starte deine personalisierte Auswanderungs-Analyse mit unserem AI-Assistenten.',
}

// Revalidate every 60 seconds to pick up admin changes
export const revalidate = 60

export default async function AnalysePage() {
  // Load questions and settings from database (SSR)
  const [questions, settings] = await Promise.all([
    getActiveQuestions(),
    getAnalysisSettings(),
  ])

  return (
    <>
      <Header />
      <main id="main-content" className="min-h-screen bg-slate-50 pt-20">
        <AnalysisFlow initialQuestions={questions} initialSettings={settings} />
      </main>
    </>
  )
}

