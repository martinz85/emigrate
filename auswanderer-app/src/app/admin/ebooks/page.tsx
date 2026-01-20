import { createAdminClient } from '@/lib/supabase/server'
import { EbookTable } from './EbookTable'
import Link from 'next/link'
import type { Ebook } from '@/types/ebooks'

export const metadata = {
  title: 'E-Books verwalten | Admin',
}

// Disable caching - always fetch fresh data
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface PageProps {
  searchParams: Promise<{ updated?: string }>
}

export default async function EbooksPage({ searchParams }: PageProps) {
  const params = await searchParams
  const updateKey = params.updated || 'initial'
  
  const supabase = createAdminClient()

  // Fetch ebooks (using 'as any' until Supabase types are regenerated)
  const { data: ebooks, error } = await (supabase as any)
    .from('ebooks')
    .select('*')
    .is('deleted_at', null)
    .order('sort_order', { ascending: true }) as { data: Ebook[] | null; error: Error | null }

  // Calculate stats
  const totalEbooks = ebooks?.length || 0
  const activeEbooks = ebooks?.filter((e: Ebook) => e.is_active).length || 0
  const bundles = ebooks?.filter((e: Ebook) => e.is_bundle).length || 0
  const totalRevenue = ebooks?.reduce((sum: number, e: Ebook) => sum + (e.price || 0), 0) || 0

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">E-Books</h1>
          <p className="text-slate-500 mt-1">
            Verwalte E-Books, PDFs und Stripe-Produkte
          </p>
        </div>
        <Link
          href="/admin/ebooks/new"
          className="px-4 py-2 text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
        >
          <span>📚</span>
          <span>Neues E-Book</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="text-2xl font-bold text-slate-800">
            {totalEbooks}
          </div>
          <div className="text-sm text-slate-500">E-Books gesamt</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="text-2xl font-bold text-emerald-600">
            {activeEbooks}
          </div>
          <div className="text-sm text-slate-500">Aktive E-Books</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="text-2xl font-bold text-purple-600">
            {bundles}
          </div>
          <div className="text-sm text-slate-500">Bundles</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="text-2xl font-bold text-slate-800">
            {(totalRevenue / 100).toFixed(2)} €
          </div>
          <div className="text-sm text-slate-500">Katalogwert</div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex gap-3">
          <span className="text-blue-600">ℹ️</span>
          <div className="text-sm text-blue-800">
            <p className="font-medium">Stripe-Integration</p>
            <p className="mt-1">
              Beim Erstellen eines E-Books wird automatisch ein Stripe-Produkt angelegt. 
              Preisänderungen erstellen einen neuen Stripe-Preis und archivieren den alten.
            </p>
          </div>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          Fehler beim Laden: {error.message}
        </div>
      ) : (
        <EbookTable 
          key={updateKey}
          ebooks={ebooks || []} 
        />
      )}
    </div>
  )
}

