import { createAdminClient } from '@/lib/supabase/server'
import { CategoryTable } from './CategoryTable'
import Link from 'next/link'

export const metadata = {
  title: 'Kategorien verwalten | Admin',
}

export default async function CategoriesPage() {
  const supabase = createAdminClient()

  // Fetch categories with question count
  const { data: categories, error } = await supabase
    .from('question_categories')
    .select(`
      *,
      questions:analysis_questions(count)
    `)
    .order('sort_order', { ascending: true })

  // Transform to include question count
  const categoriesWithCount = categories?.map(cat => ({
    ...cat,
    question_count: cat.questions?.[0]?.count || 0,
  })) || []

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Kategorien</h1>
          <p className="text-slate-500 mt-1">
            Verwalte die Kategorien für Analyse-Fragen
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/questions"
            className="px-4 py-2 text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            ← Zurück zu Fragen
          </Link>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          Fehler beim Laden: {error.message}
        </div>
      ) : (
        <CategoryTable categories={categoriesWithCount} />
      )}
    </div>
  )
}

