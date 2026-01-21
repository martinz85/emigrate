/**
 * Subscription Dashboard Page
 * Story 8.3: Subscription Management
 * 
 * Displays subscription details and management options.
 */

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SubscriptionManager } from './SubscriptionManager'

export default async function SubscriptionDashboardPage() {
  const supabase = await createClient()
  
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login?return_to=/dashboard/subscription')
  }

  // Get profile with subscription data
  // Note: subscription_billing may not exist in older schemas, handle gracefully
  const { data: profile, error } = await supabase
    .from('profiles')
    .select(`
      subscription_tier,
      subscription_status,
      subscription_period_end,
      stripe_customer_id,
      stripe_subscription_id
    `)
    .eq('id', user.id)
    .single()

  // Type-safe access to profile data
  type ProfileData = typeof profile
  const profileData = profile as ProfileData & { subscription_billing?: string }

  // Handle missing profile
  const subscriptionData = {
    tier: (profileData?.subscription_tier as 'free' | 'pro') || 'free',
    status: (profileData?.subscription_status as 'active' | 'canceled' | 'past_due' | 'expired') || null,
    periodEnd: profileData?.subscription_period_end || null,
    billing: (profileData?.subscription_billing as 'monthly' | 'yearly') || null,
    hasStripeCustomer: !!profileData?.stripe_customer_id,
    hasActiveSubscription: !!profileData?.stripe_subscription_id,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Mein Abonnement
          </h1>
          <p className="text-gray-400">
            Verwalte dein PRO-Abo, Zahlungsmethoden und Rechnungen.
          </p>
        </div>

        {/* Subscription Manager (Client Component) */}
        <SubscriptionManager initialData={subscriptionData} />

        {/* Help section */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Fragen zu deinem Abo?{' '}
            <a href="/kontakt" className="text-purple-400 hover:text-purple-300 underline">
              Kontaktiere uns
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Mein Abonnement | Dashboard',
  description: 'Verwalte dein PRO-Abonnement',
}

