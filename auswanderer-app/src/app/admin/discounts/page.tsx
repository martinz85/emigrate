import { createAdminClient } from '@/lib/supabase/server'
import { DiscountTable } from './DiscountTable'
import { CreateDiscountForm } from './CreateDiscountForm'

export const metadata = {
  title: 'Rabattcodes | Admin',
}

export default async function DiscountsPage() {
  const supabase = createAdminClient()

  const { data: discounts, error } = await supabase
    .from('discount_codes')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Rabattcodes</h1>
        <p className="text-slate-500 mt-1">
          Erstelle und verwalte Rabattcodes für Marketing-Kampagnen
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg">
              Fehler beim Laden: {error.message}
            </div>
          ) : (
            <DiscountTable discounts={discounts || []} />
          )}
        </div>
        
        <div>
          <CreateDiscountForm />
        </div>
      </div>
    </div>
  )
}

