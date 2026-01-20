// Admin Verification Helper
// Story 10.8 - E-Book Management (Admin)
// Centralized admin verification with proper role checking

import { createClient } from '@/lib/supabase/server'

export type AdminRole = 'admin' | 'super_admin' | 'editor'

export interface AdminVerifyResult {
  error: string | null
  status: number
  user: { id: string; email?: string } | null
  role: AdminRole | null
}

/**
 * Verify that the current user is an admin with proper role
 * 
 * @param allowedRoles - Array of roles that are allowed. Defaults to ['admin', 'super_admin']
 * @returns AdminVerifyResult with user info or error
 * 
 * SECURITY: This function checks BOTH that user exists in admin_users table
 * AND that they have an appropriate role (not just any entry)
 */
export async function verifyAdmin(
  allowedRoles: AdminRole[] = ['admin', 'super_admin']
): Promise<AdminVerifyResult> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { 
        error: 'Nicht autorisiert', 
        status: 401, 
        user: null,
        role: null 
      }
    }

    // Get admin user with role - CRITICAL: Check for specific valid roles
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (adminError || !adminUser) {
      console.warn(`Admin access denied for user ${user.id}: not in admin_users table`)
      return { 
        error: 'Keine Admin-Berechtigung', 
        status: 403, 
        user: null,
        role: null 
      }
    }

    // SECURITY FIX: Verify the role is one of the allowed roles
    const userRole = adminUser.role as AdminRole
    if (!allowedRoles.includes(userRole)) {
      console.warn(`Admin access denied for user ${user.id}: role '${userRole}' not in allowed roles [${allowedRoles.join(', ')}]`)
      return { 
        error: 'Unzureichende Berechtigung für diese Aktion', 
        status: 403, 
        user: null,
        role: null 
      }
    }

    return { 
      error: null, 
      status: 200, 
      user: { id: user.id, email: user.email },
      role: userRole
    }
  } catch (err) {
    console.error('Admin verification error:', err)
    return { 
      error: 'Authentifizierungsfehler', 
      status: 500, 
      user: null,
      role: null 
    }
  }
}

/**
 * Verify admin with write permissions (admin or super_admin only)
 * Use this for create, update, delete operations
 */
export async function verifyAdminWrite(): Promise<AdminVerifyResult> {
  return verifyAdmin(['admin', 'super_admin'])
}

/**
 * Verify admin with read permissions (any admin role)
 * Use this for read-only operations
 */
export async function verifyAdminRead(): Promise<AdminVerifyResult> {
  return verifyAdmin(['admin', 'super_admin', 'editor'])
}

