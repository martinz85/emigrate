// Admin Utilities
// Story 10.8 - E-Book Management (Admin)

export { 
  verifyAdmin, 
  verifyAdminWrite, 
  verifyAdminRead,
  type AdminRole,
  type AdminVerifyResult 
} from './verify'

export {
  getEbooksTable,
  validateBundleItems,
  isUniqueViolation,
  getEbookById,
  getEbookBySlug,
  isSlugAvailable,
} from './ebooks-db'

