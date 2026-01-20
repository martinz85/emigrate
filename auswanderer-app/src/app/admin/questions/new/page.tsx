import { createAdminClient } from '@/lib/supabase/server'
import { QuestionForm } from '../QuestionForm'

export const metadata = {
  title: 'Neue Frage | Admin',
}

export default async function NewQuestionPage() {
  const supabase = createAdminClient()

  // Fetch categories for dropdown
  const { data: categories } = await supabase
    .from('question_categories')
    .select('*')
    .order('sort_order', { ascending: true })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Neue Frage erstellen</h1>
        <p className="text-slate-500 mt-1">
          Erstelle eine neue Analyse-Frage für die Auswanderer-Analyse
        </p>
      </div>

      <QuestionForm categories={categories || []} />
    </div>
  )
}

