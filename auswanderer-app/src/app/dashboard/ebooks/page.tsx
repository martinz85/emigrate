/**
 * My E-Books Dashboard Page
 * Story 7.3: E-Book Download
 * 
 * Shows all e-books the user has access to (purchased or PRO).
 */

import { Metadata } from 'next'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { EbookDownloadCard } from './EbookDownloadCard'
import type { Ebook as DbEbook } from '@/types/ebooks'
import { getUserEbooks, getActiveEbooks } from '@/lib/supabase/ebooks-queries'

export const metadata: Metadata = {
  title: 'Meine E-Books | Dashboard',
}

export const dynamic = 'force-dynamic'

export default async function MyEbooksPage() {
  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/dashboard/ebooks')
  }

  // Check PRO status
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('subscription_tier')
    .eq('id', user.id)
    .single()

  const isPro = profile?.subscription_tier === 'pro'

  // Get user's purchased ebooks
  const { data: userEbooks } = await getUserEbooks(supabaseAdmin, user.id)

  // Get all active ebooks
  const { data: allEbooks } = await getActiveEbooks(supabaseAdmin)

  // Build lookup maps for O(1) access
  const ebookById = new Map<string, DbEbook>()
  const ebookBySlug = new Map<string, DbEbook>()
  for (const ebook of allEbooks || []) {
    ebookById.set(ebook.id, ebook)
    ebookBySlug.set(ebook.slug, ebook)
  }

  // Build purchase date map
  const purchaseDateById = new Map<string, string>()
  for (const ue of userEbooks || []) {
    purchaseDateById.set(ue.ebook_id, ue.purchased_at)
  }

  // Collect accessible ebook IDs (use Set to avoid duplicates)
  const accessibleIds = new Set<string>()

  if (isPro) {
    // PRO users have access to all non-bundle ebooks
    for (const ebook of allEbooks || []) {
      if (!ebook.is_bundle) {
        accessibleIds.add(ebook.id)
      }
    }
  } else {
    // Regular users: collect from purchases + expand bundles
    for (const ue of userEbooks || []) {
      const ebook = ebookById.get(ue.ebook_id)
      if (!ebook) continue

      if (ebook.is_bundle && ebook.bundle_items) {
        // Expand bundle: add all included ebooks
        for (const slug of ebook.bundle_items) {
          const bundledEbook = ebookBySlug.get(slug)
          if (bundledEbook) {
            accessibleIds.add(bundledEbook.id)
            // Inherit purchase date from bundle
            if (!purchaseDateById.has(bundledEbook.id)) {
              purchaseDateById.set(bundledEbook.id, ue.purchased_at)
            }
          }
        }
      } else {
        // Single ebook purchase
        accessibleIds.add(ebook.id)
      }
    }
  }

  // Build final list (exclude bundles from display)
  const accessibleEbooks = Array.from(accessibleIds)
    .map(id => {
      const ebook = ebookById.get(id)!
      return {
        ...ebook,
        purchasedAt: isPro ? undefined : purchaseDateById.get(id),
      }
    })
    .filter(e => !e.is_bundle)
    .sort((a, b) => a.sort_order - b.sort_order)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <nav className="text-sm text-slate-500 mb-2">
          <Link href="/dashboard" className="hover:text-primary-600">Dashboard</Link>
          <span className="mx-2">›</span>
          <span>Meine E-Books</span>
        </nav>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
          📚 Meine E-Books
        </h1>
        <p className="text-slate-500 mt-1">
          {isPro 
            ? 'Als PRO-User hast du Zugang zu allen E-Books.'
            : `Du hast Zugang zu ${accessibleEbooks.length} E-Book${accessibleEbooks.length !== 1 ? 's' : ''}.`
          }
        </p>
      </div>

      {/* PRO Badge */}
      {isPro && (
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-3 rounded-lg mb-6 flex items-center gap-3">
          <span className="text-2xl">⭐</span>
          <div>
            <p className="font-semibold">PRO-Mitglied</p>
            <p className="text-sm text-white/80">Unbegrenzter Zugang zu allen E-Books</p>
          </div>
        </div>
      )}

      {/* E-Books Grid */}
      {accessibleEbooks.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-xl">
          <span className="text-6xl mb-4 block">📚</span>
          <h2 className="text-xl font-semibold text-slate-700 mb-2">
            Noch keine E-Books
          </h2>
          <p className="text-slate-500 mb-6">
            Entdecke unsere E-Books und starte deine Auswanderer-Reise!
          </p>
          <Link 
            href="/ebooks"
            className="btn-primary inline-flex items-center gap-2"
          >
            E-Books entdecken
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accessibleEbooks.map((ebook) => (
            <EbookDownloadCard
              key={ebook.id}
              ebook={ebook}
              isPro={isPro}
              purchasedAt={ebook.purchasedAt}
            />
          ))}
        </div>
      )}

      {/* Upsell for non-PRO users */}
      {!isPro && accessibleEbooks.length > 0 && (
        <div className="mt-12 bg-slate-50 rounded-xl p-6 text-center">
          <h3 className="text-lg font-semibold text-slate-700 mb-2">
            Alle E-Books mit PRO
          </h3>
          <p className="text-slate-500 mb-4">
            Upgrade zu PRO und erhalte Zugang zu allen E-Books, unbegrenzten Analysen und mehr.
          </p>
          <Link href="/#preise" className="btn-cta inline-block">
            PRO werden ⭐
          </Link>
        </div>
      )}
    </div>
  )
}
