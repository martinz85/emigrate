'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle2, Mail, FileText, BookOpen, Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'

export default function MyPurchasesPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'not-found'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      setStatus('error')
      setErrorMessage('Bitte gib deine E-Mail-Adresse ein.')
      return
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setStatus('error')
      setErrorMessage('Bitte gib eine gültige E-Mail-Adresse ein.')
      return
    }

    setIsLoading(true)
    setStatus('idle')
    setErrorMessage('')

    try {
      const response = await fetch('/api/my-purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Etwas ist schiefgelaufen')
      }

      if (data.found === 0) {
        setStatus('not-found')
      } else {
        setStatus('success')
      }
    } catch (error) {
      console.error('Failed to request purchases:', error)
      setStatus('error')
      setErrorMessage(
        error instanceof Error 
          ? error.message 
          : 'Entschuldigung, etwas ist schiefgelaufen. Bitte versuche es später erneut.'
      )
    } finally {
      setIsLoading(false)
    }
  }

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
              ← Zurück zur Startseite
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <Card className="shadow-xl">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-primary-600" />
            </div>
            <CardTitle className="text-3xl font-bold">Meine Käufe finden</CardTitle>
            <CardDescription className="text-base">
              Gib deine E-Mail-Adresse ein und wir senden dir einen Link mit allen deinen gekauften Analysen und E-Books.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Success State */}
            {status === 'success' && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong className="font-semibold">E-Mail gesendet! 📧</strong>
                  <p className="mt-1">
                    Wir haben dir einen Link an <strong>{email}</strong> geschickt. 
                    Klicke auf den Link in der E-Mail, um auf deine Käufe zuzugreifen.
                  </p>
                  <p className="mt-2 text-sm text-green-700">
                    💡 Tipp: Schau auch im Spam-Ordner nach, falls die E-Mail nicht ankommt.
                  </p>
                </AlertDescription>
              </Alert>
            )}

            {/* Not Found State */}
            {status === 'not-found' && (
              <Alert className="border-amber-200 bg-amber-50">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  <strong className="font-semibold">Keine Käufe gefunden</strong>
                  <p className="mt-1">
                    Für <strong>{email}</strong> wurden keine Käufe gefunden.
                  </p>
                  <ul className="mt-2 text-sm space-y-1 list-disc list-inside text-amber-700">
                    <li>Hast du die richtige E-Mail-Adresse verwendet?</li>
                    <li>Hast du bereits einen Account? → <Link href="/login" className="underline font-medium">Hier einloggen</Link></li>
                    <li>Probleme? → <Link href="/kontakt" className="underline font-medium">Kontaktiere unseren Support</Link></li>
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Error State */}
            {status === 'error' && (
              <Alert variant="destructive">
                <AlertCircle className="h-5 w-5" />
                <AlertDescription>
                  <strong className="font-semibold">Fehler</strong>
                  <p className="mt-1">{errorMessage}</p>
                </AlertDescription>
              </Alert>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-slate-700">
                  E-Mail-Adresse
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="deine@email.de"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 text-base"
                    disabled={isLoading}
                    autoFocus
                  />
                </div>
                <p className="text-xs text-slate-500">
                  Verwende die E-Mail-Adresse, die du beim Kauf angegeben hast.
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Wird gesucht...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-5 w-5" />
                    Link per E-Mail senden
                  </>
                )}
              </Button>
            </form>

            {/* Info Section */}
            <div className="border-t pt-6 space-y-4">
              <h3 className="font-semibold text-slate-900">Was passiert als Nächstes?</h3>
              
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">E-Mail erhalten</p>
                    <p className="text-sm text-slate-600">
                      Du erhältst eine E-Mail mit einem sicheren Link zu deinen Käufen.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Link öffnen</p>
                    <p className="text-sm text-slate-600">
                      Klicke auf den Link in der E-Mail (gültig für 24 Stunden).
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Zugriff auf deine Käufe</p>
                    <p className="text-sm text-slate-600">
                      Lade deine PDF-Analysen herunter oder greife auf deine E-Books zu.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Help Section */}
            <div className="border-t pt-6">
              <h3 className="font-semibold text-slate-900 mb-3">Du hast bereits einen Account?</h3>
              <p className="text-sm text-slate-600 mb-3">
                Wenn du bereits einen Account erstellt hast, logge dich ein, um auf alle deine Käufe zuzugreifen.
              </p>
              <Link href="/login">
                <Button variant="outline" className="w-full">
                  Zum Login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info Cards */}
        <div className="mt-8 grid md:grid-cols-2 gap-4">
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <FileText className="w-8 h-8 text-primary-600 mb-2" />
              <CardTitle className="text-lg">PDF-Analysen</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Greife auf alle gekauften Auswanderer-Analysen zu und lade sie jederzeit herunter.
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <BookOpen className="w-8 h-8 text-primary-600 mb-2" />
              <CardTitle className="text-lg">E-Books</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Alle deine gekauften E-Books sind verfügbar und können erneut heruntergeladen werden.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

