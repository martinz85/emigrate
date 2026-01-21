/**
 * Question Builder Types
 * Story 10.7: Fragen-Builder für dynamische Analyse-Fragen
 */

// ============================================
// Question Types
// ============================================

export type QuestionType = 'boolean' | 'rating' | 'text' | 'select'

export interface SelectOption {
  value: string
  label: string
}

// ============================================
// Database Types (matching Supabase schema)
// ============================================

export interface QuestionCategory {
  id: string
  name: string
  name_key: string | null
  description: string | null
  icon: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface AnalysisQuestion {
  id: string
  category_id: string | null
  question_text: string
  question_key: string | null
  help_text: string | null
  question_type: QuestionType
  select_options: SelectOption[] | null
  weight: number
  sort_order: number
  image_path: string | null
  is_required: boolean
  is_active: boolean
  is_pro_only: boolean  // Story 8.4: PRO-Only Fragen
  // Optional text input field per question
  allow_text_input: boolean
  text_input_label: string | null
  text_input_placeholder: string | null
  created_at: string
  updated_at: string
}

// ============================================
// Joined Types (with category)
// ============================================

export interface AnalysisQuestionWithCategory extends AnalysisQuestion {
  category: QuestionCategory | null
}

// ============================================
// Form Types (for create/update)
// ============================================

export interface CreateQuestionInput {
  category_id?: string | null
  question_text: string
  question_key?: string | null
  help_text?: string | null
  question_type: QuestionType
  select_options?: SelectOption[] | null
  weight?: number
  sort_order?: number
  image_path?: string | null
  is_required?: boolean
  is_active?: boolean
  is_pro_only?: boolean  // Story 8.4: PRO-Only Fragen
  // Optional text input field per question
  allow_text_input?: boolean
  text_input_label?: string | null
  text_input_placeholder?: string | null
}

export interface UpdateQuestionInput extends Partial<CreateQuestionInput> {
  id: string
}

export interface CreateCategoryInput {
  name: string
  name_key?: string | null
  description?: string | null
  icon?: string | null
  sort_order?: number
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {
  id: string
}

// ============================================
// Reorder Types
// ============================================

export interface ReorderItem {
  id: string
  sort_order: number
}

// ============================================
// API Response Types
// ============================================

export interface QuestionsApiResponse {
  data?: AnalysisQuestionWithCategory[]
  error?: string
}

export interface QuestionApiResponse {
  data?: AnalysisQuestion
  error?: string
}

export interface CategoriesApiResponse {
  data?: QuestionCategory[]
  error?: string
}

export interface CategoryApiResponse {
  data?: QuestionCategory
  error?: string
}

// ============================================
// Frontend Analysis Types
// ============================================

/**
 * Question response during analysis flow
 */
export interface QuestionResponse {
  question_id: string
  question_key: string | null
  question_type: QuestionType
  value: number | string | boolean | string[]
  weight: number
}

/**
 * Analysis state with dynamic questions
 */
export interface DynamicAnalysisState {
  currentStep: number
  questions: AnalysisQuestionWithCategory[]
  responses: Record<string, QuestionResponse>
  isLoading: boolean
  error: string | null
}

