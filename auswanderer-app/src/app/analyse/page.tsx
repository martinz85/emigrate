import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { AnalysisChat } from '@/components/analysis/AnalysisChat'

export const metadata = {
  title: 'AI-Analyse starten | Auswanderer-Plattform',
  description: 'Starte deine personalisierte Auswanderungs-Analyse mit unserem AI-Assistenten.',
}

export default function AnalysePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Header />
      <div className="pt-20">
        <AnalysisChat />
      </div>
      <Footer />
    </main>
  )
}
