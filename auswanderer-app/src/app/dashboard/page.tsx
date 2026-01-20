import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import Link from 'next/link'

export const metadata = {
  title: 'Dashboard | Auswanderer-Plattform',
  description: 'Deine gespeicherten Analysen und Account-Einstellungen.',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get user's analyses
  const { data: analyses } = await supabase
    .from('analyses')
    .select('id, created_at, result, paid, paid_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <>
      <Header />
      <main id="main-content" className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-20">
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Welcome */}
          <div className="mb-8">
            <h1 className="font-heading text-3xl font-bold text-slate-900 mb-2">
              Willkommen zurück! 👋
            </h1>
            <p className="text-slate-600">
              {user.email}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-4 mb-12">
            <Link
              href="/analyse"
              className="flex items-center gap-4 p-6 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl text-white hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg shadow-primary-500/25"
            >
              <div className="text-4xl">🎯</div>
              <div>
                <h2 className="font-bold text-lg">Neue Analyse starten</h2>
                <p className="text-primary-100 text-sm">
                  Finde dein perfektes Auswanderungsland
                </p>
              </div>
            </Link>

            {profile?.subscription_tier === 'free' && (
              <Link
                href="/pro"
                className="flex items-center gap-4 p-6 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl text-white hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-500/25"
              >
                <div className="text-4xl">⭐</div>
                <div>
                  <h2 className="font-bold text-lg">PRO werden</h2>
                  <p className="text-amber-100 text-sm">
                    Unbegrenzte Analysen & Tools
                  </p>
                </div>
              </Link>
            )}

            {profile?.subscription_tier === 'pro' && (
              <div className="flex items-center gap-4 p-6 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl text-white">
                <div className="text-4xl">⭐</div>
                <div>
                  <h2 className="font-bold text-lg">PRO Mitglied</h2>
                  <p className="text-amber-100 text-sm">
                    Du hast vollen Zugang!
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Analyses */}
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <h2 className="font-heading text-xl font-bold text-slate-900 mb-6">
              Deine Analysen
            </h2>

            {!analyses || analyses.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">📊</div>
                <p className="text-slate-600 mb-4">
                  Du hast noch keine Analysen durchgeführt.
                </p>
                <Link
                  href="/analyse"
                  className="inline-block px-6 py-3 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-colors"
                >
                  Erste Analyse starten
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {analyses.map((analysis) => {
                  const result = analysis.result as { topCountry?: string; matchPercentage?: number } | null
                  const topCountry = result?.topCountry
                  const matchPercentage = result?.matchPercentage

                  return (
                    <div
                      key={analysis.id}
                      className="flex items-center gap-4 p-4 border border-slate-200 rounded-xl hover:border-primary-300 transition-colors"
                    >
                      {/* Status Icon */}
                      <div className={`text-3xl ${analysis.paid ? '' : 'grayscale opacity-50'}`}>
                        {analysis.paid && topCountry ? '🌍' : '🔒'}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {analysis.paid && topCountry ? (
                            <span className="font-semibold text-slate-900">
                              {topCountry} ({matchPercentage}% Match)
                            </span>
                          ) : (
                            <span className="font-semibold text-slate-500">
                              Land versteckt
                            </span>
                          )}
                          {analysis.paid && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                              ✓ Freigeschaltet
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500">
                          {new Date(analysis.created_at || Date.now()).toLocaleDateString('de-DE', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        {analysis.paid ? (
                          <>
                            <Link
                              href={`/ergebnis/${analysis.id}`}
                              className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors"
                            >
                              Ansehen
                            </Link>
                            <Link
                              href={`/api/pdf/${analysis.id}`}
                              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                            >
                              PDF
                            </Link>
                          </>
                        ) : (
                          <Link
                            href={`/ergebnis/${analysis.id}`}
                            className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors"
                          >
                            Freischalten
                          </Link>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Account Actions */}
          <div className="mt-8 flex justify-end">
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="text-slate-500 hover:text-slate-700 text-sm underline"
              >
                Abmelden
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
