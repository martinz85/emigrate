import { createAdminClient } from '@/lib/supabase/server'
import { QuestionTable } from './QuestionTable'
import { AnalysisSettings } from './AnalysisSettings'
import Link from 'next/link'

export const metadata = {
  title: 'Fragen verwalten | Admin',
}

// Disable caching for this page - always fetch fresh data
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface PageProps {
  searchParams: Promise<{ updated?: string }>
}

export default async function QuestionsPage({ searchParams }: PageProps) {
  // Get the updated param to force re-render
  const params = await searchParams
  const updateKey = params.updated || 'initial'
  
  const supabase = createAdminClient()

  // Fetch questions with categories
  const { data: questions, error: questionsError } = await supabase
    .from('analysis_questions')
    .select(`
      *,
      category:question_categories(*)
    `)
    .order('sort_order', { ascending: true })

  // Fetch categories for filter/create
  const { data: categories } = await supabase
    .from('question_categories')
    .select('*')
    .order('sort_order', { ascending: true })

  // Fetch settings for additional notes field
  const { data: settingsData } = await supabase
    .from('analysis_settings')
    .select('key, value')
  
  const settings: Record<string, unknown> = {}
  for (const item of settingsData || []) {
    settings[item.key] = item.value
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Analyse-Fragen</h1>
          <p className="text-slate-500 mt-1">
            Verwalte die Fragen für die Auswanderer-Analyse
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/questions/categories"
            className="px-4 py-2 text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            data-testid="admin-questions-categories-button"
          >
            📁 Kategorien
          </Link>
          <Link
            href="/admin/questions/new"
            className="px-4 py-2 text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
            data-testid="admin-questions-new-button"
          >
            + Neue Frage
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="text-2xl font-bold text-slate-800">
            {questions?.length || 0}
          </div>
          <div className="text-sm text-slate-500">Fragen gesamt</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="text-2xl font-bold text-emerald-600">
            {questions?.filter(q => q.is_active).length || 0}
          </div>
          <div className="text-sm text-slate-500">Aktive Fragen</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="text-2xl font-bold text-slate-400">
            {questions?.filter(q => !q.is_active).length || 0}
          </div>
          <div className="text-sm text-slate-500">Inaktive Fragen</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="text-2xl font-bold text-slate-800">
            {categories?.length || 0}
          </div>
          <div className="text-sm text-slate-500">Kategorien</div>
        </div>
      </div>

      {/* Settings */}
      <AnalysisSettings initialSettings={settings as Record<string, unknown>} />

      {questionsError ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          Fehler beim Laden: {questionsError.message}
        </div>
      ) : (
        <QuestionTable 
          key={updateKey}
          questions={questions || []} 
          categories={categories || []}
        />
      )}
    </div>
  )
}

