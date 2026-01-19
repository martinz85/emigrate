/**
 * Resend Email Client
 * 
 * Provides a configured Resend client for sending transactional emails.
 * 
 * @see https://resend.com/docs
 */

import { Resend } from 'resend'

/**
 * Resend client instance
 * 
 * Will be null if RESEND_API_KEY is not configured.
 * In development, emails can be skipped gracefully.
 */
export const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null

/**
 * Default sender email address
 */
export const EMAIL_FROM = process.env.EMAIL_FROM || 'Auswanderer-Plattform <onboarding@resend.dev>'

/**
 * Check if email service is configured
 */
export function isEmailConfigured(): boolean {
  return resend !== null
}

