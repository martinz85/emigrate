'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle2, FileText, BookOpen, Loader2, Download, ExternalLink } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'

interface PurchaseData {
  analyses: Array<{
    id: string
    created_at: string
    paid_at: string | null
  }>
  ebooks: Array<{
    id: string
    title: string
    slug: string
    purchased_at: string
  }>
  email: string
}

export default function PurchasesAccessPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [isLoading, setIsLoading] = useState(true)
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [purchases, setPurchases] = useState<PurchaseData | null>(null)

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setErrorMessage('Ungültiger Zugriffs-Link')
      setIsLoading(false)
      return
    }

    fetchPurchases()
  }, [token])

  const fetchPurchases = async () => {
    try {
      const response = await fetch(`/api/purchases/${token}`)
      const data = await response.json()

      if (!response.ok) {
        if (response.status === 404 || response.status === 410) {
          setStatus('expired')
        } else {
          throw new Error(data.error || 'Fehler beim Laden der Käufe')
        }
        setIsLoading(false)
        return
      }

      setPurchases(data)
      setStatus('success')
    } catch (error) {
      console.error('Failed to fetch purchases:', error)
      setStatus('error')
      setErrorMessage(
        error instanceof Error ? error.message : 'Etwas ist schiefgelaufen'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-xl">
          <CardContent className="pt-6 text-center space-y-4">
            <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto" />
            <p className="text-slate-600">Lade deine Käufe...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Expired State
  if (status === 'expired') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
        <header className="border-b bg-white/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <Link 
              href="/" 
              className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent"
            >
              Auswanderer
            </Link>
          </div>
        </header>

        <main className="container mx-auto px-4 py-12 max-w-2xl">
          <Card className="shadow-xl">
            <CardContent className="pt-6 space-y-4">
              <Alert className="border-amber-200 bg-amber-50">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  <strong className="font-semibold">Link abgelaufen</strong>
                  <p className="mt-1">
                    Dieser Zugriffs-Link ist nicht mehr gültig. Links sind 24 Stunden nach 
                    der Erstellung gültig.
                  </p>
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <p className="text-slate-600">
                  Du kannst einen neuen Link anfordern:
                </p>
                <Link href="/my-purchases">
                  <Button className="w-full">
                    Neuen Link anfordern
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  // Error State
  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
        <header className="border-b bg-white/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <Link 
              href="/" 
              className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent"
            >
              Auswanderer
            </Link>
          </div>
        </header>

        <main className="container mx-auto px-4 py-12 max-w-2xl">
          <Card className="shadow-xl">
            <CardContent className="pt-6 space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-5 w-5" />
                <AlertDescription>
                  <strong className="font-semibold">Fehler</strong>
                  <p className="mt-1">{errorMessage}</p>
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <p className="text-slate-600">
                  Versuche es erneut oder kontaktiere unseren Support.
                </p>
                <div className="flex gap-3">
                  <Button onClick={fetchPurchases} variant="outline" className="flex-1">
                    Erneut versuchen
                  </Button>
                  <Link href="/my-purchases" className="flex-1">
                    <Button className="w-full">
                      Zurück
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  // Success State - Show Purchases
  const totalPurchases = (purchases?.analyses.length || 0) + (purchases?.ebooks.length || 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href="/" 
              className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent"
            >
              Auswanderer
            </Link>
            <Link href="/" className="text-sm text-slate-600 hover:text-primary-600">
              ← Zur Startseite
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Success Alert */}
        <Alert className="border-green-200 bg-green-50 mb-6">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong className="font-semibold">Zugriff gewährt! ✅</strong>
            <p className="mt-1">
              Du siehst alle Käufe für <strong>{purchases?.email}</strong>
            </p>
          </AlertDescription>
        </Alert>

        {/* Analyses Section */}
        {purchases && purchases.analyses.length > 0 && (
          <Card className="shadow-xl mb-6">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl">PDF-Analysen</CardTitle>
                  <CardDescription>
                    {purchases.analyses.length} {purchases.analyses.length === 1 ? 'Analyse' : 'Analysen'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {purchases.analyses.map((analysis) => (
                  <div 
                    key={analysis.id}
                    className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-primary-300 hover:bg-primary-50/30 transition-all"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        Auswanderer-Analyse
                      </p>
                      <p className="text-sm text-slate-600">
                        Gekauft am {formatDate(analysis.paid_at || analysis.created_at)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/ergebnis/${analysis.id}`} target="_blank">
                        <Button variant="outline" size="sm">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Anzeigen
                        </Button>
                      </Link>
                      <Link href={`/api/pdf/${analysis.id}`} target="_blank">
                        <Button size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          PDF
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* E-Books Section */}
        {purchases && purchases.ebooks.length > 0 && (
          <Card className="shadow-xl mb-6">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-secondary-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl">E-Books</CardTitle>
                  <CardDescription>
                    {purchases.ebooks.length} {purchases.ebooks.length === 1 ? 'E-Book' : 'E-Books'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {purchases.ebooks.map((ebook) => (
                  <div 
                    key={ebook.id}
                    className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-secondary-300 hover:bg-secondary-50/30 transition-all"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        {ebook.title}
                      </p>
                      <p className="text-sm text-slate-600">
                        Gekauft am {formatDate(ebook.purchased_at)}
                      </p>
                    </div>
                    <Link href={`/ebooks/${ebook.slug}`} target="_blank">
                      <Button size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Herunterladen
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Create Account CTA */}
        <Card className="shadow-xl border-primary-200 bg-primary-50/30">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-bold text-slate-900">
                💡 Tipp: Erstelle einen kostenlosen Account
              </h3>
              <p className="text-slate-600">
                Mit einem Account hast du <strong>jederzeit</strong> Zugriff auf deine Käufe, 
                ohne einen neuen Link anfordern zu müssen. Außerdem erhältst du:
              </p>
              <ul className="text-left max-w-md mx-auto space-y-2 text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Permanenter Zugriff auf alle Käufe</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Persönliches Dashboard</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Zugriff auf exklusive Features</span>
                </li>
              </ul>
              <Link href={`/login?email=${encodeURIComponent(purchases?.email || '')}`}>
                <Button size="lg" className="mt-4">
                  Jetzt kostenlosen Account erstellen
                </Button>
              </Link>
              <p className="text-xs text-slate-500">
                Deine Käufe werden automatisch mit deinem Account verknüpft.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

