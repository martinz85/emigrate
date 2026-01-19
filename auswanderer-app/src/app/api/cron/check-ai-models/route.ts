/**
 * Cron Endpoint: Check AI Models
 *
 * Runs weekly (Sunday 03:00 UTC) via Vercel Cron
 * Checks AI provider pricing pages for model updates
 */

import { NextRequest, NextResponse } from 'next/server'
import { runCatalogCheck } from '@/lib/ai'
import { sendEmail } from '@/lib/email'

// Force dynamic to prevent caching
export const dynamic = 'force-dynamic'

// Vercel cron authentication
const CRON_SECRET = process.env.CRON_SECRET

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  
  // In development, allow without auth
  if (process.env.NODE_ENV === 'production') {
    if (!CRON_SECRET) {
      console.error('[Cron] CRON_SECRET not configured')
      return NextResponse.json({ error: 'Cron not configured' }, { status: 500 })
    }

    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      console.warn('[Cron] Unauthorized access attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  console.log('[Cron] Starting AI model catalog check...')

  try {
    const result = await runCatalogCheck(undefined, 'cron')

    // Send notification if updates found
    if (result.updatesFound > 0) {
      await sendAdminNotification(result.updatesFound)
    }

    console.log(`[Cron] Check completed: ${result.updatesFound} updates found`)

    return NextResponse.json({
      success: true,
      checkId: result.checkId,
      updatesFound: result.updatesFound,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[Cron] Catalog check failed:', error)

    return NextResponse.json(
      {
        error: 'Catalog check failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * Send notification email to admin about model updates
 */
async function sendAdminNotification(updatesFound: number): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL || 'martin@infravivo.se'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://auswanderer-plattform.de'

  try {
    await sendEmail({
      to: adminEmail,
      subject: `🤖 ${updatesFound} AI-Modell-Update${updatesFound > 1 ? 's' : ''} gefunden`,
      text: `
Hallo,

Der wöchentliche AI-Modell-Check hat ${updatesFound} Update${updatesFound > 1 ? 's' : ''} gefunden.

Bitte prüfe die vorgeschlagenen Änderungen im Admin-Dashboard:
${appUrl}/admin/ai-settings

---
Automatische Benachrichtigung von der Auswanderer-Plattform
Wöchentlicher Check: Sonntag 03:00 UTC
      `.trim(),
    })

    console.log('[Cron] Admin notification sent')
  } catch (error) {
    console.error('[Cron] Failed to send notification:', error)
  }
}

