import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default function ResultPage({ params }: { params: { id: string } }) {
  return (
    <>
      <Header />
      <main id="main-content" className="min-h-screen pt-20">
        <div className="container mx-auto py-8 px-4">
          <h1 className="text-2xl font-bold">Ergebnis</h1>
          <p className="text-muted-foreground">
            Analyse-ID: {params.id}
          </p>
          <p className="mt-4">
            Ergebnis-Seite wird in Epic 3 implementiert.
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}



