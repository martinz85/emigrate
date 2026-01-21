import { z } from 'zod'

// Base Site Content Interface
export interface SiteContent {
  id: string
  section: string
  key: string
  content_type: 'text' | 'html' | 'json'
  content: string
  label?: string
  description?: string
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
  created_by?: string
  updated_by?: string
}

// Section-specific content types
export interface HeaderContent {
  logo_text: string
  nav_link_1_text: string
  nav_link_2_text: string
  nav_link_3_text: string
  nav_link_4_text: string
  cta_button_text: string
}

export interface FooterContent {
  logo_text: string
  description: string
  product_title: string
  product_link_1: string
  product_link_2: string
  product_link_3: string
  product_link_4: string
  legal_title: string
  legal_link_1: string
  legal_link_2: string
  legal_link_3: string
  legal_link_4: string
  legal_link_5: string
  copyright: string
  disclaimer: string
}

export interface HeroContent {
  headline: string
  subheadline: string
  cta_primary_text: string
  cta_secondary_text: string
  trust_badge_1: string
  trust_badge_2: string
  trust_badge_3: string
  trust_badge_4: string
}

export interface HowItWorksContent {
  title: string
  subtitle: string
  step_1_title: string
  step_1_description: string
  step_2_title: string
  step_2_description: string
  step_3_title: string
  step_3_description: string
  step_4_title: string
  step_4_description: string
}

export interface FounderStoryContent {
  title: string
  paragraph_1: string
  paragraph_2: string
  paragraph_3: string
  signature: string
  role: string
}

export interface FAQItem {
  question: string
  answer: string
}

export interface FAQContent {
  title: string
  subtitle: string
  items: FAQItem[]
}

export interface LoadingScreenContent {
  title: string
  subtitle: string
  fun_facts: string[]
}

// Union type for all section content
export type SectionContent =
  | HeaderContent
  | FooterContent
  | HeroContent
  | HowItWorksContent
  | FounderStoryContent
  | FAQContent
  | LoadingScreenContent

// Zod validation schemas
export const siteContentSchema = z.object({
  id: z.string().uuid(),
  section: z.string(),
  key: z.string(),
  content_type: z.enum(['text', 'html', 'json']),
  content: z.string().min(1, 'Content darf nicht leer sein').max(500, 'Maximal 500 Zeichen'),
  label: z.string().optional(),
  description: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  created_at: z.string(),
  updated_at: z.string(),
  created_by: z.string().optional(),
  updated_by: z.string().optional(),
})

export const createContentSchema = z.object({
  section: z.string(),
  key: z.string(),
  content: z.string().min(1, 'Content darf nicht leer sein').max(500, 'Maximal 500 Zeichen'),
  content_type: z.enum(['text', 'html', 'json']).optional().default('text'),
  label: z.string().optional(),
  description: z.string().optional(),
})

export const updateContentSchema = z.object({
  key: z.string(),
  content: z.string().min(1, 'Content darf nicht leer sein').max(500, 'Maximal 500 Zeichen'),
  content_type: z.enum(['text', 'html', 'json']).optional(),
  label: z.string().optional(),
  description: z.string().optional(),
})

export const updateSectionSchema = z.array(updateContentSchema)

// Type guards
export const isHeaderContent = (content: SectionContent): content is HeaderContent => {
  return 'logo_text' in content && 'cta_button_text' in content
}

export const isFooterContent = (content: SectionContent): content is FooterContent => {
  return 'copyright' in content && 'disclaimer' in content
}

export const isHeroContent = (content: SectionContent): content is HeroContent => {
  return 'headline' in content && 'subheadline' in content
}

export const isHowItWorksContent = (content: SectionContent): content is HowItWorksContent => {
  return 'step_1_title' in content && 'step_4_title' in content
}

export const isFounderStoryContent = (content: SectionContent): content is FounderStoryContent => {
  return 'signature' in content && 'role' in content
}

export const isFAQContent = (content: SectionContent): content is FAQContent => {
  return 'items' in content && Array.isArray((content as FAQContent).items)
}

export const isLoadingScreenContent = (content: SectionContent): content is LoadingScreenContent => {
  return 'fun_facts' in content && Array.isArray((content as LoadingScreenContent).fun_facts)
}
