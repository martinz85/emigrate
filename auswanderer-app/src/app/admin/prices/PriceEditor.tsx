'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PriceDisplay } from '@/components/ui/PriceDisplay'

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
  is_active: boolean
  updated_at: string
  updated_by: string | null
}

interface PriceEditorProps {
  price: PriceConfig
}

export function PriceEditor({ price }: PriceEditorProps) {
  const router = useRouter()
  
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form state
  const [regularPrice, setRegularPrice] = useState(price.regular_price / 100)
  const [campaignPrice, setCampaignPrice] = useState(
    price.campaign_price ? price.campaign_price / 100 : ''
  )
  const [campaignActive, setCampaignActive] = useState(price.campaign_active)
  const [campaignName, setCampaignName] = useState(price.campaign_name || '')

  const handleSave = async () => {
    setError(null)
    setIsSaving(true)

    try {
      const response = await fetch(`/api/admin/prices/${price.product_key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          regularPrice: Math.round(regularPrice * 100),
          campaignPrice: campaignPrice ? Math.round(Number(campaignPrice) * 100) : null,
          campaignActive,
          campaignName: campaignName || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Speichern')
      }

      setIsEditing(false)
      router.refresh() // Refresh server component data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    // Reset to original values
    setRegularPrice(price.regular_price / 100)
    setCampaignPrice(price.campaign_price ? price.campaign_price / 100 : '')
    setCampaignActive(price.campaign_active)
    setCampaignName(price.campaign_name || '')
    setError(null)
    setIsEditing(false)
  }

  // Calculate current display price
  const currentDisplayPrice = campaignActive && campaignPrice 
    ? Math.round(Number(campaignPrice) * 100) 
    : Math.round(regularPrice * 100)

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            {price.product_name}
          </h2>
          {price.product_description && (
            <p className="text-sm text-slate-500 mt-1">{price.product_description}</p>
          )}
        </div>
        
        {/* Status Badge */}
        <div className="flex items-center gap-2">
          {price.campaign_active && (
            <span className="bg-orange-100 text-orange-700 text-xs font-medium px-2 py-1 rounded-full">
              Kampagne aktiv
            </span>
          )}
          {!price.is_active && (
            <span className="bg-slate-100 text-slate-500 text-xs font-medium px-2 py-1 rounded-full">
              Inaktiv
            </span>
          )}
        </div>
      </div>

      {/* Current Price Display */}
      <div className="bg-slate-50 rounded-lg p-4 mb-4">
        <p className="text-sm text-slate-600 mb-2">Aktuelle Anzeige:</p>
        <PriceDisplay
          regularPrice={Math.round(regularPrice * 100)}
          currentPrice={currentDisplayPrice}
          campaignActive={campaignActive}
          campaignName={campaignName || null}
          size="lg"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Edit Form */}
      {isEditing ? (
        <div className="space-y-4">
          {/* Regular Price */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Regulärer Preis (€)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={regularPrice}
              onChange={(e) => setRegularPrice(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Campaign Toggle */}
          <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <input
              type="checkbox"
              id={`campaign-${price.product_key}`}
              checked={campaignActive}
              onChange={(e) => setCampaignActive(e.target.checked)}
              className="w-5 h-5 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
            />
            <label 
              htmlFor={`campaign-${price.product_key}`}
              className="text-sm font-medium text-amber-800 cursor-pointer"
            >
              🏷️ Kampagne aktivieren (durchgestrichener Preis)
            </label>
          </div>

          {/* Campaign Fields (only visible when campaign active) */}
          {campaignActive && (
            <div className="space-y-4 pl-4 border-l-2 border-amber-300">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Kampagnen-Preis (€) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={regularPrice - 0.01}
                  value={campaignPrice}
                  onChange={(e) => setCampaignPrice(e.target.value)}
                  placeholder="z.B. 19.99"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">
                  Muss kleiner als der reguläre Preis sein
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Kampagnen-Name (optional)
                </label>
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="z.B. Neujahrs-Sale, Launch-Angebot"
                  maxLength={50}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Wird als Badge neben dem Preis angezeigt
                </p>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || (campaignActive && !campaignPrice)}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? 'Speichern...' : 'Speichern'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSaving}
              className="px-6 py-2 text-slate-600 hover:text-slate-800 font-medium transition-colors"
            >
              Abbrechen
            </button>
          </div>
        </div>
      ) : (
        /* View Mode */
        <div className="flex items-center justify-between pt-2">
          <div className="text-sm text-slate-500">
            {price.updated_at && (
              <>Zuletzt geändert: {new Date(price.updated_at).toLocaleDateString('de-DE')}</>
            )}
          </div>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 text-emerald-600 hover:bg-emerald-50 rounded-lg font-medium transition-colors"
          >
            ✏️ Bearbeiten
          </button>
        </div>
      )}
    </div>
  )
}

