/**
 * Audit Logging Utility
 * 
 * DSGVO-Compliance: Protokolliert alle Admin-Aktionen für Nachweisbarkeit.
 * Logs werden in der audit_logs Tabelle persistiert.
 * 
 * PII-Handling: Emails werden pseudonymisiert gespeichert.
 */

import { createAdminClient } from '@/lib/supabase/server'
import { createHash } from 'crypto'
import type { Json } from '@/lib/supabase/database.types'

/**
 * Pseudonymize email for audit logging (DSGVO-compliant)
 * Uses SHA-256 hash with salt for consistent but irreversible mapping
 */
export function pseudonymizeEmail(email: string): string {
  if (!email) return 'unknown'
  
  const salt = process.env.AUDIT_SALT || 'default-audit-salt-change-me'
  const hash = createHash('sha256')
    .update(email.toLowerCase() + salt)
    .digest('hex')
    .substring(0, 16)
  
  return `user_${hash}`
}

/**
 * Supported audit actions
 */
export type AuditAction = 
  | 'USER_DELETED'
  | 'USER_EXPORTED'
  | 'DISCOUNT_CREATED'
  | 'DISCOUNT_DELETED'
  | 'NEWSLETTER_EXPORTED'
  | 'PRICE_UPDATED'
  | 'QUESTION_CREATED'
  | 'QUESTION_UPDATED'
  | 'QUESTION_DELETED'
  | 'QUESTIONS_REORDERED'
  | 'QUESTION_IMAGE_UPLOADED'
  | 'QUESTION_IMAGE_DELETED'
  | 'CATEGORY_CREATED'
  | 'CATEGORY_UPDATED'
  | 'CATEGORY_DELETED'
  | 'CATEGORIES_REORDERED'
  | 'EBOOK_CREATED'
  | 'EBOOK_UPDATED'
  | 'EBOOK_DELETED'
  | 'EBOOK_PDF_UPLOADED'
  | 'EBOOK_COVER_UPLOADED'
  | 'EBOOKS_REORDERED'

/**
 * Target types for audit logs
 */
export type AuditTargetType = 
  | 'user'
  | 'discount_code'
  | 'newsletter'
  | 'price'
  | 'analysis_question'
  | 'question_category'
  | 'ebook'

/**
 * Audit log entry
 */
export interface AuditLogEntry {
  action: AuditAction
  targetId?: string
  targetType?: AuditTargetType
  adminId: string
  metadata?: Record<string, unknown>
}

/**
 * Log an audit event to the database
 * 
 * Non-blocking: Errors are logged but don't throw.
 * This ensures audit logging doesn't break the main operation.
 */
export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  try {
    const supabase = createAdminClient()
    
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        action: entry.action,
        target_id: entry.targetId || null,
        target_type: entry.targetType || null,
        admin_id: entry.adminId,
        metadata: (entry.metadata as Json) || null,
      })

    if (error) {
      console.error('[Audit] Failed to persist log:', error.message)
      // Fallback: Log to console
      console.log(`[Audit] ${entry.action} | Target: ${entry.targetId} | Admin: ${entry.adminId}`)
    }
  } catch (err) {
    // Non-blocking: Don't throw, just log
    console.error('[Audit] Unexpected error:', err)
    console.log(`[Audit] ${entry.action} | Target: ${entry.targetId} | Admin: ${entry.adminId}`)
  }
}

/**
 * Helper to create audit metadata with common fields
 */
export function createAuditMetadata(
  reason?: string,
  additionalData?: Record<string, unknown>
): Record<string, unknown> {
  return {
    timestamp: new Date().toISOString(),
    reason: reason || undefined,
    ...additionalData,
  }
}

