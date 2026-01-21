import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email'
import { MyPurchasesEmail } from '@/lib/email/templates/MyPurchasesEmail'

/**
 * API Route: /api/my-purchases
 * 
 * Allows guest users to request access to their purchased content via email.
 * Searches for:
 * 1. Guest e-book purchases (guest_purchases table)
 * 2. Paid analyses (analyses table with session_id but no user_id)
 * 
 * Sends a magic link email with access to all purchases.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'E-Mail-Adresse ist erforderlich' },
        { status: 400 }
      )
    }

    const emailLower = email.trim().toLowerCase()

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailLower)) {
      return NextResponse.json(
        { error: 'Ungültige E-Mail-Adresse' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // ============================================
    // 1. Search for Guest E-Book Purchases
    // ============================================
    // Note: guest_purchases table may not be in generated types yet
    const { data: guestEbooks, error: ebooksError } = await (supabase as any)
      .from('guest_purchases')
      .select(`
        id,
        ebook_id,
        purchased_at,
        amount,
        ebooks (
          id,
          title,
          slug,
          price
        )
      `)
      .eq('email', emailLower)
      .is('claimed_at', null) // Only unclaimed purchases

    if (ebooksError) {
      console.error('Failed to fetch guest ebooks:', ebooksError)
      throw new Error('Datenbankfehler beim Abrufen der E-Books')
    }

    // ============================================
    // 2. Search for Paid Analyses
    // ============================================
    // PROBLEM: analyses table doesn't store email persistently!
    // We need to check Stripe sessions for customer_email
    // 
    // For now, we'll only find analyses if they have a stripe_session_id
    // and we can fetch the email from Stripe
    
    // This is a limitation: We can only reliably find RECENT purchases
    // For old purchases without stripe_session_id, users need to contact support
    
    const { data: paidAnalyses, error: analysesError } = await supabase
      .from('analyses')
      .select('id, created_at, paid_at, stripe_session_id')
      .eq('paid', true)
      .not('stripe_session_id', 'is', null)

    if (analysesError) {
      console.error('Failed to fetch analyses:', analysesError)
      // Don't throw - just continue without analyses
    }

    // Filter analyses by email (we need to check Stripe for each one)
    // This is expensive, so we'll limit to recent purchases (last 90 days)
    const stripe = process.env.STRIPE_SECRET_KEY
      ? await import('stripe').then(m => new m.default(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' }))
      : null

    const matchingAnalyses: Array<{
      id: string
      created_at: string
      paid_at: string | null
    }> = []

    if (stripe && paidAnalyses) {
      for (const analysis of paidAnalyses) {
        // Only check recent analyses (last 90 days)
        if (!analysis.created_at) continue
        const createdAt = new Date(analysis.created_at)
        const ninetyDaysAgo = new Date()
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
        
        if (createdAt < ninetyDaysAgo) {
          continue
        }

        try {
          if (analysis.stripe_session_id) {
            const session = await stripe.checkout.sessions.retrieve(analysis.stripe_session_id)
            
            if (session.customer_details?.email?.toLowerCase() === emailLower) {
              matchingAnalyses.push({
                id: analysis.id,
                created_at: analysis.created_at,
                paid_at: analysis.paid_at,
              })
            }
          }
        } catch (error) {
          console.error(`Failed to fetch Stripe session ${analysis.stripe_session_id}:`, error)
          // Continue - don't fail entire request
        }
      }
    }

    // ============================================
    // 3. Check if any purchases found
    // ============================================
    const totalFound = (guestEbooks?.length || 0) + matchingAnalyses.length

    if (totalFound === 0) {
      return NextResponse.json({ 
        found: 0,
        message: 'Keine Käufe gefunden für diese E-Mail-Adresse'
      })
    }

    // ============================================
    // 4. Generate secure token for magic link
    // ============================================
    const token = crypto.randomUUID()
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24) // Valid for 24 hours

    // Store token in database
    // Note: purchase_access_tokens table may not be in generated types yet
    const { error: tokenError } = await (supabase as any)
      .from('purchase_access_tokens')
      .insert({
        token,
        email: emailLower,
        expires_at: expiresAt.toISOString(),
        analysis_ids: matchingAnalyses.map(a => a.id),
        ebook_ids: guestEbooks?.map((e: { ebook_id: string }) => e.ebook_id) || [],
      })

    if (tokenError) {
      console.error('Failed to create access token:', tokenError)
      throw new Error('Fehler beim Erstellen des Zugriffs-Links')
    }

    // ============================================
    // 5. Send Magic Link Email
    // ============================================
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://auswanderer-plattform.de'
    const accessUrl = `${appUrl}/purchases/${token}`

    try {
      await sendEmail({
        to: emailLower,
        subject: 'Deine Käufe bei Auswanderer-Plattform 📦',
        react: MyPurchasesEmail({
          customerEmail: emailLower,
          accessUrl,
          analysesCount: matchingAnalyses.length,
          ebooksCount: guestEbooks?.length || 0,
          expiresIn: '24 Stunden',
        }),
      })

      console.log(`✅ Purchase access email sent to ${emailLower} (${totalFound} items)`)
    } catch (emailError) {
      console.error('Failed to send purchase access email:', emailError)
      throw new Error('E-Mail konnte nicht gesendet werden')
    }

    // ============================================
    // 6. Return Success
    // ============================================
    return NextResponse.json({
      found: totalFound,
      analyses: matchingAnalyses.length,
      ebooks: guestEbooks?.length || 0,
      message: 'E-Mail mit Zugriffs-Link wurde gesendet',
    })

  } catch (error) {
    console.error('My Purchases API Error:', error)
    
    const message = error instanceof Error 
      ? error.message 
      : 'Ein unerwarteter Fehler ist aufgetreten'

    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}

