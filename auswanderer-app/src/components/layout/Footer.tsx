import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🌍</span>
              <span className="font-heading font-bold text-xl text-white">
                Auswander-Profi
              </span>
            </Link>
            <p className="text-sm max-w-md">
              Finde dein perfektes Auswanderungsland mit unserem AI-gestützten 
              Analyse-Tool. Auf dich zugeschnitten für deine Entscheidung.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Produkt</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/analyse" className="hover:text-white transition-colors">Analyse starten</Link></li>
              <li><Link href="/ebooks" className="hover:text-white transition-colors">E-Books</Link></li>
              <li><Link href="#preise" className="hover:text-white transition-colors">Preise</Link></li>
              <li><Link href="/pro" className="hover:text-white transition-colors">PRO Abo</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-white mb-4">Rechtliches</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/impressum" className="hover:text-white transition-colors">Impressum</Link></li>
              <li><Link href="/datenschutz" className="hover:text-white transition-colors">Datenschutz</Link></li>
              <li><Link href="/agb" className="hover:text-white transition-colors">AGB</Link></li>
              <li><Link href="/kontakt" className="hover:text-white transition-colors">Kontakt</Link></li>
              <li><Link href="/my-purchases" className="hover:text-white transition-colors">Meine Käufe finden</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 text-sm text-center">
          <p>© {new Date().getFullYear()} Auswanderer-Plattform. Alle Rechte vorbehalten.</p>
          <p className="mt-2 text-xs">
            Hinweis: Diese Plattform bietet keine Rechts- oder Steuerberatung. 
            Konsultieren Sie für verbindliche Auskünfte einen Fachexperten.
          </p>
        </div>
      </div>
    </footer>
  )
}

