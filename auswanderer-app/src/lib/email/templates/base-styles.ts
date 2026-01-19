/**
 * Base Email Styles
 * 
 * Consistent styling for all email templates.
 * Uses inline styles as required for email clients.
 */

export const styles = {
  // Main container
  main: {
    backgroundColor: '#f8fafc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  
  container: {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '40px 20px',
    maxWidth: '560px',
    borderRadius: '8px',
  },
  
  // Typography
  h1: {
    color: '#0f172a',
    fontSize: '28px',
    fontWeight: '700',
    lineHeight: '1.3',
    margin: '0 0 24px',
    textAlign: 'center' as const,
  },
  
  h2: {
    color: '#0f172a',
    fontSize: '22px',
    fontWeight: '600',
    lineHeight: '1.3',
    margin: '24px 0 16px',
  },
  
  text: {
    color: '#334155',
    fontSize: '16px',
    lineHeight: '1.6',
    margin: '0 0 16px',
  },
  
  smallText: {
    color: '#64748b',
    fontSize: '14px',
    lineHeight: '1.5',
    margin: '0 0 12px',
  },
  
  // Buttons
  button: {
    backgroundColor: '#10B981',
    borderRadius: '6px',
    color: '#ffffff',
    display: 'inline-block',
    fontSize: '16px',
    fontWeight: '600',
    padding: '14px 28px',
    textDecoration: 'none',
    textAlign: 'center' as const,
    margin: '16px 0',
  },
  
  buttonSecondary: {
    backgroundColor: '#f1f5f9',
    borderRadius: '6px',
    color: '#0f172a',
    display: 'inline-block',
    fontSize: '14px',
    fontWeight: '500',
    padding: '10px 20px',
    textDecoration: 'none',
    textAlign: 'center' as const,
    margin: '8px 0',
  },
  
  // Links
  link: {
    color: '#10B981',
    textDecoration: 'underline',
  },
  
  // Highlight box
  highlightBox: {
    backgroundColor: '#ecfdf5',
    borderRadius: '8px',
    padding: '20px',
    margin: '24px 0',
    textAlign: 'center' as const,
  },
  
  highlightText: {
    color: '#065f46',
    fontSize: '18px',
    fontWeight: '600',
    margin: '0',
  },
  
  // Details section
  details: {
    backgroundColor: '#f8fafc',
    borderRadius: '6px',
    padding: '16px',
    margin: '24px 0',
  },
  
  detailText: {
    color: '#64748b',
    fontSize: '14px',
    lineHeight: '1.6',
    margin: '0',
  },
  
  // Divider
  divider: {
    borderTop: '1px solid #e2e8f0',
    margin: '32px 0',
  },
  
  // Footer
  footer: {
    color: '#94a3b8',
    fontSize: '12px',
    lineHeight: '1.5',
    margin: '32px 0 0',
    textAlign: 'center' as const,
  },
  
  // Logo placeholder
  logo: {
    textAlign: 'center' as const,
    margin: '0 0 24px',
  },
  
  logoText: {
    color: '#10B981',
    fontSize: '24px',
    fontWeight: '700',
  },
}

