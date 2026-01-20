import { createAdminClient } from '@/lib/supabase/server'
import { EbookForm } from '../EbookForm'
import Link from 'next/link'

export const metadata = {
  title: 'Neues E-Book | Admin',
}

export default async function NewEbookPage() {
  const supabase = createAdminClient()

  // Fetch existing ebooks for bundle selection (using 'as any' until Supabase types are regenerated)
  const { data: ebooks } = await (supabase as any)
    .from('ebooks')
    .select('*')
    .is('deleted_at', null)
    .eq('is_bundle', false)
    .order('title', { ascending: true })

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
          <h1 className="text-2xl font-bold text-slate-800">Neues E-Book</h1>
          <p className="text-slate-500 mt-1">
            Erstelle ein neues E-Book mit PDF-Upload
          </p>
        </div>
      </div>

      <EbookForm allEbooks={ebooks || []} />
    </div>
  )
}

