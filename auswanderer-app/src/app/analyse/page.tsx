import { Header } from '@/components/layout/Header'
import { AnalysisFlow } from '@/components/analysis/AnalysisFlow'

export const metadata = {
  title: 'AI-Analyse starten | Auswanderer-Plattform',
  description: 'Starte deine personalisierte Auswanderungs-Analyse mit unserem AI-Assistenten.',
}

export default function AnalysePage() {
  return (
    <>
      <Header />
      <main id="main-content" className="min-h-screen bg-slate-50 pt-20">
        <AnalysisFlow />
      </main>
    </>
  )
}

