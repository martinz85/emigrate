/**
 * Email Send Utility
 * 
 * Provides a wrapper around Resend for sending emails with error handling.
 */

import { resend, EMAIL_FROM, isEmailConfigured } from './client'

interface SendEmailOptions {
  to: string
  subject: string
  react: React.ReactElement
}

interface SendEmailResult {
  success: boolean
  messageId?: string
  error?: string
}

/**
 * Send an email using Resend
 * 
 * Gracefully handles missing configuration (dev environment).
 * Logs without PII in production.
 */
export async function sendEmail({ 
  to, 
  subject, 
  react 
}: SendEmailOptions): Promise<SendEmailResult> {
  // Check if email service is configured
  if (!isEmailConfigured() || !resend) {
    console.log('[Email] Service not configured - skipping email send')
    console.log(`[Email] Would send to: ${maskEmail(to)}, Subject: ${subject}`)
    return { 
      success: true, 
      messageId: 'skipped-no-config' 
    }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject,
      react,
    })

    if (error) {
      console.error('[Email] Send error:', error.message)
      return { 
        success: false, 
        error: error.message 
      }
    }

    // Log success with masked email (DSGVO compliance)
    console.log(`[Email] Sent successfully to ${maskEmail(to)}, ID: ${data?.id}`)
    
    return { 
      success: true, 
      messageId: data?.id 
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.error('[Email] Failed to send:', errorMessage)
    return { 
      success: false, 
      error: errorMessage 
    }
  }
}

/**
 * Mask email for logging (DSGVO compliance)
 * Example: test@example.com -> te***@***.com
 */
function maskEmail(email: string): string {
  if (process.env.NODE_ENV !== 'production') {
    return email // Show full email in dev
  }
  
  const [local, domain] = email.split('@')
  if (!local || !domain) return '***@***'
  
  const maskedLocal = local.substring(0, 2) + '***'
  const domainParts = domain.split('.')
  const maskedDomain = '***.' + (domainParts[domainParts.length - 1] || 'com')
  
  return `${maskedLocal}@${maskedDomain}`
}

