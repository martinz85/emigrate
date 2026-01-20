/**
 * Questions Service
 * 
 * Lädt Analyse-Fragen aus der Datenbank für das Frontend.
 * Änderungen im Admin werden sofort wirksam.
 */

import { createClient } from '@/lib/supabase/server'
import type { AnalysisQuestionWithCategory, QuestionCategory } from '@/types/questions'

// ============================================
// Server-side: Fragen für Analyse laden
// ============================================

/**
 * Lädt alle aktiven Fragen für die Analyse (Server Component)
 * Sortiert nach sort_order
 */
export async function getActiveQuestions(): Promise<AnalysisQuestionWithCategory[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('analysis_questions')
    .select(`
      *,
      category:question_categories(*)
    `)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Error fetching questions:', error)
    return []
  }

  return data as AnalysisQuestionWithCategory[]
}

/**
 * Lädt alle Kategorien (Server Component)
 */
export async function getCategories(): Promise<QuestionCategory[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('question_categories')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }

  return data as QuestionCategory[]
}

/**
 * Lädt alle Analyse-Einstellungen (Server Component)
 */
export async function getAnalysisSettings(): Promise<Record<string, unknown>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('analysis_settings')
    .select('key, value')

  if (error) {
    console.error('Error fetching settings:', error)
    return {}
  }

  // Convert to key-value object
  const settings: Record<string, unknown> = {}
  for (const item of data || []) {
    settings[item.key] = item.value
  }

  return settings
}

// ============================================
// Client-side: API-basiertes Laden
// ============================================

/**
 * Lädt aktive Fragen via API (Client Component)
 * Für dynamisches Nachladen ohne Page Refresh
 */
export async function fetchActiveQuestions(): Promise<AnalysisQuestionWithCategory[]> {
  try {
    const response = await fetch('/api/questions', {
      next: { revalidate: 0 }, // Kein Cache - immer frisch
    })

    if (!response.ok) {
      throw new Error('Failed to fetch questions')
    }

    const { data } = await response.json()
    return data || []
  } catch (error) {
    console.error('Error fetching questions:', error)
    return []
  }
}

// ============================================
// Hilfsfunktionen
// ============================================

/**
 * Gruppiert Fragen nach Kategorie
 */
export function groupQuestionsByCategory(
  questions: AnalysisQuestionWithCategory[]
): Map<string | null, AnalysisQuestionWithCategory[]> {
  const grouped = new Map<string | null, AnalysisQuestionWithCategory[]>()

  for (const question of questions) {
    const categoryId = question.category_id
    const existing = grouped.get(categoryId) || []
    grouped.set(categoryId, [...existing, question])
  }

  return grouped
}

/**
 * Berechnet den Fortschritt basierend auf beantworteten Fragen
 */
export function calculateProgress(
  totalQuestions: number,
  answeredCount: number
): number {
  if (totalQuestions === 0) return 0
  return Math.round((answeredCount / totalQuestions) * 100)
}

/**
 * Generiert die Supabase Storage URL für ein Fragen-Bild
 */
export function getQuestionImageUrl(imagePath: string | null): string | null {
  if (!imagePath) return null
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) return null

  return `${supabaseUrl}/storage/v1/object/public/question-images/${imagePath}`
}

