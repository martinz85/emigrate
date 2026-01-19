'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type SubscriptionTier = 'free' | 'pro'

export interface SubscriptionStatus {
  tier: SubscriptionTier
  isPro: boolean
  isLoading: boolean
  error: Error | null
  stripeSubscriptionId: string | null
  subscriptionStatus: string | null // 'active', 'canceled', 'past_due'
  subscriptionPeriodEnd: string | null
}

export function useSubscriptionStatus(): SubscriptionStatus {
  const [status, setStatus] = useState<SubscriptionStatus>({
    tier: 'free',
    isPro: false,
    isLoading: true,
    error: null,
    stripeSubscriptionId: null,
    subscriptionStatus: null,
    subscriptionPeriodEnd: null,
  })

  useEffect(() => {
    async function fetchSubscriptionStatus() {
      try {
        const supabase = createClient()
        
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          setStatus(prev => ({ 
            ...prev, 
            isLoading: false,
            tier: 'free',
            isPro: false,
          }))
          return
        }

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('subscription_tier, stripe_subscription_id, subscription_status, subscription_period_end')
          .eq('id', user.id)
          .single()

        if (error) {
          throw error
        }

        const tier = (profile?.subscription_tier as SubscriptionTier) || 'free'
        
        setStatus({
          tier,
          isPro: tier === 'pro',
          isLoading: false,
          error: null,
          stripeSubscriptionId: profile?.stripe_subscription_id || null,
          subscriptionStatus: profile?.subscription_status || null,
          subscriptionPeriodEnd: profile?.subscription_period_end || null,
        })
      } catch (error) {
        console.error('Error fetching subscription status:', error)
        setStatus(prev => ({
          ...prev,
          isLoading: false,
          error: error as Error,
          tier: 'free',
          isPro: false,
        }))
      }
    }

    fetchSubscriptionStatus()

    // Subscribe to auth changes
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchSubscriptionStatus()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return status
}

// Simple hook for components that just need to know if user is PRO
export function useIsPro(): { isPro: boolean; isLoading: boolean } {
  const { isPro, isLoading } = useSubscriptionStatus()
  return { isPro, isLoading }
}

