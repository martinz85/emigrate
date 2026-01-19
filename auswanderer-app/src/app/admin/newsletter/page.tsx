import { createAdminClient } from '@/lib/supabase/server'
import { SubscriberTable } from './SubscriberTable'
import { ExportButtons } from './ExportButtons'

export const metadata = {
  title: 'Newsletter | Admin',
}

export default async function NewsletterPage() {
  const supabase = createAdminClient()

  const { data: subscribers, count, error } = await supabase
    .from('newsletter_subscribers')
    .select('*', { count: 'exact' })
    .order('opted_in_at', { ascending: false })
    .limit(50)

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Newsletter-Abonnenten</h1>
          <p className="text-slate-500 mt-1">
            {count || 0} Abonnenten insgesamt
          </p>
        </div>
        
        <ExportButtons />
      </div>

      {error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          Fehler beim Laden: {error.message}
        </div>
      ) : (
        <SubscriberTable subscribers={subscribers || []} />
      )}
    </div>
  )
}

