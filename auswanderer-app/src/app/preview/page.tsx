import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { PDFPreview } from '@/components/preview/PDFPreview'

export const metadata = {
  title: 'Deine Analyse-Vorschau | Auswanderer-Plattform',
  description: 'Vorschau deiner personalisierten Auswanderungsanalyse',
}

export default function PreviewPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Header />
      <div className="pt-20 pb-12">
        <PDFPreview />
      </div>
      <Footer />
    </main>
  )
}

