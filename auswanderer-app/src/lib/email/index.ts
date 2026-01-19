/**
 * Email Module Barrel Export
 */

export { resend, EMAIL_FROM, isEmailConfigured } from './client'
export { sendEmail } from './send'
export { 
  PurchaseConfirmationEmail,
  emailStyles,
} from './templates'
export type { PurchaseConfirmationProps } from './templates'

