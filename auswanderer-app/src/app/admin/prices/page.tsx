import { AdminCard } from '../components/AdminCard'

export const metadata = {
  title: 'Preise | Admin',
}

export default async function PricesPage() {
  // Current fixed price
  const currentPrice = 29.99

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Preis-Verwaltung</h1>
        <p className="text-slate-500 mt-1">
          Verwalte den Preis für die Auswanderer-Analyse
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <AdminCard
          title="Aktueller Preis"
          value={`${currentPrice.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €`}
          subtitle="Einmalzahlung pro Analyse"
          icon="💰"
        />
        <AdminCard
          title="Währung"
          value="EUR"
          subtitle="Euro (€)"
          icon="💱"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Preis ändern</h2>
        
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-amber-800">
            <strong>Hinweis:</strong> Preisänderungen erfordern eine Anpassung in Stripe. 
            Neue Preise gelten nur für zukünftige Käufe.
          </p>
        </div>

        <form className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Neuer Preis (€)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.50"
              defaultValue={currentPrice}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              disabled
            />
          </div>

          <button
            type="button"
            disabled
            className="px-6 py-3 bg-slate-300 text-slate-500 rounded-lg font-medium cursor-not-allowed"
          >
            Preis aktualisieren (Stripe Integration erforderlich)
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-200">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Manuelle Anpassung</h3>
          <p className="text-sm text-slate-600 mb-4">
            Um den Preis zu ändern, folge diesen Schritten:
          </p>
          <ol className="text-sm text-slate-600 list-decimal list-inside space-y-2">
            <li>Öffne das <a href="https://dashboard.stripe.com/products" target="_blank" rel="noopener" className="text-emerald-600 hover:underline">Stripe Dashboard</a></li>
            <li>Erstelle einen neuen Preis für das Produkt</li>
            <li>Aktualisiere die <code className="bg-slate-100 px-1 rounded">STRIPE_PRICE_ID</code> Environment Variable</li>
            <li>Deploye die Änderung</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

