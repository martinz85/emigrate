// Supabase barrel exports
// Note: Only export types and utilities here
// Client creation functions should be imported directly from their files
// to ensure proper tree-shaking and avoid SSR issues

export type {
  Database,
  Profile,
  ProfileInsert,
  ProfileUpdate,
  Analysis,
  AnalysisInsert,
  AnalysisUpdate,
  AdminUser,
  DiscountCode,
  NewsletterSubscriber,
  Json,
} from './types'
