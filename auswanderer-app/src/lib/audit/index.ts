/**
 * Audit Logging Utility
 * 
 * DSGVO-Compliance: Protokolliert alle Admin-Aktionen für Nachweisbarkeit.
 * Logs werden in der audit_logs Tabelle persistiert.
 */

import { createAdminClient } from '@/lib/supabase/server'

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

/**
 * Target types for audit logs
 */
export type AuditTargetType = 
  | 'user'
  | 'discount_code'
  | 'newsletter'
  | 'price'

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
        metadata: entry.metadata || null,
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

