import { createClient } from '@/lib/supabase/server'
import { PriceEditor } from './PriceEditor'

interface PriceConfig {
  id: string
  product_key: string
  product_name: string
  product_description: string | null
  regular_price: number
  campaign_price: number | null
  campaign_active: boolean
  campaign_name: string | null
  currency: string
  stripe_price_id: string | null
  stripe_campaign_price_id: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
  updated_by: string | null
}

export const metadata = {
  title: 'Preise | Admin',
}

export default async function PricesPage() {
  const supabase = await createClient()

  // Fetch all prices (admin can see all, including inactive)
  const { data: prices, error } = await supabase
    .from('price_config')
    .select('*')
    .order('sort_order', { ascending: true }) as { data: PriceConfig[] | null, error: unknown }

  if (error) {
    console.error('Error fetching prices:', error)
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">💰 Preis-Verwaltung</h1>
        <p className="text-slate-500 mt-1">
          Verwalte Produktpreise und Kampagnen-Aktionen
        </p>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          <strong>💡 Kampagnen-Modus:</strong> Aktiviere eine Kampagne um den regulären Preis durchgestrichen anzuzeigen 
          und den Kampagnen-Preis hervorzuheben. Ideal für Sales und Aktionen!
        </p>
      </div>

      {/* Products Grid */}
      <div className="space-y-6">
        {prices?.map((price) => (
          <PriceEditor key={price.id} price={price} />
        )) || (
          <p className="text-slate-500">Keine Produkte gefunden.</p>
        )}
      </div>
    </div>
  )
}
