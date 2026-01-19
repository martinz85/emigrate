/**
 * Redirect Path Validation Utility
 * 
 * Prevents Open Redirect attacks by validating redirect paths.
 */

/**
 * Allowed redirect paths after authentication.
 * Only internal paths are allowed to prevent Open Redirect attacks.
 */
export const ALLOWED_REDIRECT_PATHS = [
  '/dashboard',
  '/analyse',
  '/ergebnis',
  '/admin',
  '/checkout',
]

/**
 * Validates the redirect path to prevent Open Redirect attacks.
 * 
 * Security checks:
 * 1. Must be a relative path (starts with /)
 * 2. Must not contain protocol (://)
 * 3. Must not start with // (protocol-relative URL)
 * 4. Must not contain backslashes (browser quirks)
 * 5. Must match allowlist of known paths
 * 
 * @param path - The path to validate
 * @param fallback - The fallback path if validation fails (default: '/dashboard')
 * @returns The validated path or fallback
 */
export function validateRedirectPath(path: string | null, fallback = '/dashboard'): string {
  // Default fallback
  if (!path) return fallback
  
  // Must start with / (relative path)
  if (!path.startsWith('/')) return fallback
  
  // Must not contain protocol or double slashes (prevents //evil.com)
  if (path.includes('://') || path.startsWith('//')) return fallback
  
  // Must not contain backslashes (prevents \/evil.com on some browsers)
  if (path.includes('\\')) return fallback
  
  // Must not contain encoded characters that could bypass checks
  try {
    const decoded = decodeURIComponent(path)
    if (decoded.includes('://') || decoded.startsWith('//') || decoded.includes('\\')) {
      return fallback
    }
  } catch {
    // Invalid encoding - reject
    return fallback
  }
  
  // Check against allowlist of path prefixes
  const isAllowed = ALLOWED_REDIRECT_PATHS.some(allowed => 
    path === allowed || path.startsWith(`${allowed}/`) || path.startsWith(`${allowed}?`)
  )
  
  if (!isAllowed) {
    console.warn(`Blocked redirect to non-allowed path: ${path}`)
    return fallback
  }
  
  return path
}

/**
 * Checks if a path is safe for redirect (without modifying it).
 * 
 * @param path - The path to check
 * @returns true if the path is safe
 */
export function isValidRedirectPath(path: string | null): boolean {
  if (!path) return false
  return validateRedirectPath(path) === path
}

