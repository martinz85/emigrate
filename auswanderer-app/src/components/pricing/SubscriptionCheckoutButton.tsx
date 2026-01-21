'use client'

/**
 * Subscription Checkout Button
 * Story 8.2: Subscription Checkout
 * 
 * Button component for initiating PRO subscription checkout.
 * Handles authentication check and redirects to Stripe.
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface SubscriptionCheckoutButtonProps {
  billing: 'monthly' | 'yearly'
  className?: string
  children?: React.ReactNode
  variant?: 'primary' | 'secondary'
  disabled?: boolean
}

export function SubscriptionCheckoutButton({
  billing,
  className,
  children,
  variant = 'primary',
  disabled = false,
}: SubscriptionCheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleClick = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Check if user is logged in
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        // Redirect to login with return URL
        const returnTo = encodeURIComponent('/pricing?checkout=pro&billing=' + billing)
        router.push(`/login?return_to=${returnTo}`)
        return
      }

      // Call checkout API
      const response = await fetch('/api/subscription/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billing }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Checkout konnte nicht gestartet werden')
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('Keine Checkout-URL erhalten')
      }
    } catch (err) {
      console.error('Checkout error:', err)
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
      setIsLoading(false)
    }
  }

  const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold py-4 px-8 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variantStyles = {
    primary: 'bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl',
    secondary: 'bg-white/10 hover:bg-white/20 text-white border border-white/20',
  }

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleClick}
        disabled={isLoading || disabled}
        className={cn(baseStyles, variantStyles[variant], className)}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Lädt...</span>
          </>
        ) : (
          children || (
            <>
              <span>👑</span>
              <span>PRO werden</span>
            </>
          )
        )}
      </button>
      
      {error && (
        <p className="mt-2 text-sm text-red-400 text-center">
          {error}
        </p>
      )}
    </div>
  )
}

