import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import Link from 'next/link'

export const metadata = {
  title: 'Zahlung erfolgreich | Auswanderer-Plattform',
}

export default function SuccessPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Header />
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-xl mx-auto text-center">
          <div className="card py-12">
            <div className="text-6xl mb-6">🎉</div>
            <h1 className="font-heading text-3xl font-bold mb-4">
              Vielen Dank für deinen Kauf!
            </h1>
            <p className="text-slate-600 mb-8">
              Deine Zahlung war erfolgreich. Du erhältst in Kürze eine E-Mail 
              mit deinem Download-Link.
            </p>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
              <p className="text-green-800 font-medium">
                ✅ Deine PDF wird gerade generiert...
              </p>
            </div>

            <div className="space-y-4">
              <Link href="/download" className="btn-cta w-full block">
                PDF herunterladen
              </Link>
              <Link href="/" className="btn-secondary w-full block">
                Zur Startseite
              </Link>
            </div>

            <p className="text-sm text-slate-500 mt-6">
              Fragen? Schreib uns an support@auswanderer-plattform.de
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}

