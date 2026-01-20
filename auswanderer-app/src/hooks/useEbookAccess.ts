/**
 * Hook for checking E-Book access
 * Story 7.3: E-Book Download
 * 
 * Checks if the current user has access to a specific e-book.
 * Access is granted if:
 * - User is a PRO subscriber
 * - User has purchased this specific e-book
 * - User has purchased a bundle containing this e-book
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface EbookAccessResult {
  hasAccess: boolean
  accessType: 'pro' | 'purchased' | 'bundle' | 'none'
  isLoading: boolean
  error: string | null
  refetch: () => void
}

/**
 * Check if user has access to a specific e-book
 */
export function useEbookAccess(ebookId: string): EbookAccessResult {
  const [hasAccess, setHasAccess] = useState(false)
  const [accessType, setAccessType] = useState<'pro' | 'purchased' | 'bundle' | 'none'>('none')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const checkAccess = useCallback(async () => {
    if (!ebookId) {
      setHasAccess(false)
      setAccessType('none')
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setHasAccess(false)
        setAccessType('none')
        setIsLoading(false)
        return
      }

      // Check PRO status
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .single()

      if (profile?.subscription_tier === 'pro') {
        setHasAccess(true)
        setAccessType('pro')
        setIsLoading(false)
        return
      }

      // Check direct purchase
      const { data: directPurchase } = await supabase
        .from('user_ebooks')
        .select('id')
        .eq('user_id', user.id)
        .eq('ebook_id', ebookId)
        .maybeSingle()

      if (directPurchase) {
        setHasAccess(true)
        setAccessType('purchased')
        setIsLoading(false)
        return
      }

      // Check bundle purchases
      // First get the ebook's slug
      const { data: ebook } = await supabase
        .from('ebooks')
        .select('slug')
        .eq('id', ebookId)
        .single()

      if (ebook) {
        // Find bundles containing this ebook
        const { data: bundles } = await supabase
          .from('ebooks')
          .select('id')
          .eq('is_bundle', true)
          .contains('bundle_items', [ebook.slug])

        if (bundles && bundles.length > 0) {
          const bundleIds = bundles.map(b => b.id)
          
          const { data: bundlePurchase } = await supabase
            .from('user_ebooks')
            .select('id')
            .eq('user_id', user.id)
            .in('ebook_id', bundleIds)
            .maybeSingle()

          if (bundlePurchase) {
            setHasAccess(true)
            setAccessType('bundle')
            setIsLoading(false)
            return
          }
        }
      }

      // No access
      setHasAccess(false)
      setAccessType('none')
    } catch (err) {
      console.error('Error checking ebook access:', err)
      setError('Fehler beim Prüfen des Zugangs')
      setHasAccess(false)
      setAccessType('none')
    } finally {
      setIsLoading(false)
    }
  }, [ebookId])

  useEffect(() => {
    checkAccess()
  }, [checkAccess])

  return {
    hasAccess,
    accessType,
    isLoading,
    error,
    refetch: checkAccess,
  }
}

/**
 * Check access to multiple e-books at once
 */
export function useEbooksAccess(ebookIds: string[]): {
  accessMap: Record<string, boolean>
  isLoading: boolean
  error: string | null
} {
  const [accessMap, setAccessMap] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function checkAllAccess() {
      if (!ebookIds.length) {
        setAccessMap({})
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const supabase = createClient()
        
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          setAccessMap(Object.fromEntries(ebookIds.map(id => [id, false])))
          setIsLoading(false)
          return
        }

        // Check PRO status - gives access to all
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_tier')
          .eq('id', user.id)
          .single()

        if (profile?.subscription_tier === 'pro') {
          setAccessMap(Object.fromEntries(ebookIds.map(id => [id, true])))
          setIsLoading(false)
          return
        }

        // Get all user purchases
        const { data: purchases } = await supabase
          .from('user_ebooks')
          .select('ebook_id')
          .eq('user_id', user.id)

        const purchasedIds = new Set(purchases?.map(p => p.ebook_id) || [])

        // Check bundle purchases and expand
        const { data: bundles } = await supabase
          .from('ebooks')
          .select('id, bundle_items')
          .eq('is_bundle', true)
          .in('id', Array.from(purchasedIds))

        // Get slugs for requested ebooks
        const { data: requestedEbooks } = await supabase
          .from('ebooks')
          .select('id, slug')
          .in('id', ebookIds)

        const slugToId = new Map(requestedEbooks?.map(e => [e.slug, e.id]) || [])

        // Expand bundle access
        for (const bundle of bundles || []) {
          if (bundle.bundle_items && Array.isArray(bundle.bundle_items)) {
            for (const slug of bundle.bundle_items as string[]) {
              const id = slugToId.get(slug)
              if (id) {
                purchasedIds.add(id)
              }
            }
          }
        }

        // Build access map
        const map: Record<string, boolean> = {}
        for (const id of ebookIds) {
          map[id] = purchasedIds.has(id)
        }

        setAccessMap(map)
      } catch (err) {
        console.error('Error checking ebooks access:', err)
        setError('Fehler beim Prüfen des Zugangs')
        setAccessMap(Object.fromEntries(ebookIds.map(id => [id, false])))
      } finally {
        setIsLoading(false)
      }
    }

    checkAllAccess()
  }, [ebookIds.join(',')])

  return { accessMap, isLoading, error }
}

