'use client'

import { useState } from 'react'
import Link from 'next/link'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🌍</span>
            <span className="font-heading font-bold text-xl text-primary-500">
              Auswanderer
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#so-funktionierts" className="text-slate-600 hover:text-primary-500 transition-colors">
              So funktioniert&apos;s
            </Link>
            <Link href="#preise" className="text-slate-600 hover:text-primary-500 transition-colors">
              Preise
            </Link>
            <Link href="/ebooks" className="text-slate-600 hover:text-primary-500 transition-colors">
              E-Books
            </Link>
            <Link href="/login" className="text-slate-600 hover:text-primary-500 transition-colors">
              Login
            </Link>
            <Link href="/analyse" className="btn-primary">
              Kostenlos starten
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-3 min-w-[48px] min-h-[48px] flex items-center justify-center"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu öffnen"
            aria-expanded={mobileMenuOpen}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200">
            <nav className="flex flex-col gap-4">
              <Link href="#so-funktionierts" className="text-slate-600 hover:text-primary-500 py-2">
                So funktioniert&apos;s
              </Link>
              <Link href="#preise" className="text-slate-600 hover:text-primary-500 py-2">
                Preise
              </Link>
              <Link href="/ebooks" className="text-slate-600 hover:text-primary-500 py-2">
                E-Books
              </Link>
              <Link href="/login" className="text-slate-600 hover:text-primary-500 py-2">
                Login
              </Link>
              <Link href="/analyse" className="btn-primary text-center">
                Kostenlos starten
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

