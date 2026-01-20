import { createAdminClient } from '@/lib/supabase/server'
import { EbookForm } from '../EbookForm'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const metadata = {
  title: 'E-Book bearbeiten | Admin',
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditEbookPage({ params }: PageProps) {
  const { id } = await params
  const supabase = createAdminClient()

  // Fetch the ebook (using 'as any' until Supabase types are regenerated)
  const { data: ebook, error } = await (supabase as any)
    .from('ebooks')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !ebook) {
    notFound()
  }

  // Fetch all ebooks for bundle selection (excluding current one)
  const { data: allEbooks } = await (supabase as any)
    .from('ebooks')
    .select('*')
    .is('deleted_at', null)
    .neq('id', id)
    .order('title', { ascending: true })

  // FIX: Generate signed URL for cover preview (private bucket)
  let initialCoverUrl: string | undefined = undefined
  if (ebook.cover_path) {
    const { data: signedUrlData } = await supabase.storage
      .from('ebooks')
      .createSignedUrl(ebook.cover_path, 3600) // 1 hour expiry
    
    if (signedUrlData?.signedUrl) {
      initialCoverUrl = signedUrlData.signedUrl
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/ebooks"
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        >
          ←
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {ebook.emoji} {ebook.title}
          </h1>
          <p className="text-slate-500 mt-1">
            E-Book bearbeiten
          </p>
        </div>
      </div>

      {/* Quick Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="text-sm text-slate-500">Stripe Produkt</div>
          <div className="font-mono text-xs mt-1 truncate">
            {ebook.stripe_product_id || '—'}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="text-sm text-slate-500">Stripe Preis</div>
          <div className="font-mono text-xs mt-1 truncate">
            {ebook.stripe_price_id || '—'}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="text-sm text-slate-500">Erstellt</div>
          <div className="text-sm mt-1">
            {new Date(ebook.created_at).toLocaleDateString('de-DE')}
          </div>
        </div>
      </div>

      <EbookForm 
        ebook={ebook} 
        allEbooks={allEbooks || []} 
        initialCoverUrl={initialCoverUrl}
      />
    </div>
  )
}
