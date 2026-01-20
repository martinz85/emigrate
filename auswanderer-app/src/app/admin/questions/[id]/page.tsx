import { createAdminClient } from '@/lib/supabase/server'
import { QuestionForm } from '../QuestionForm'
import { notFound } from 'next/navigation'
import type { AnalysisQuestion, QuestionCategory } from '@/types/questions'

export const metadata = {
  title: 'Frage bearbeiten | Admin',
}

// Disable caching - always fetch fresh data
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditQuestionPage({ params }: PageProps) {
  const { id } = await params
  const supabase = createAdminClient()

  // Fetch question
  const { data: questionData, error } = await supabase
    .from('analysis_questions')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !questionData) {
    notFound()
  }

  // Cast to proper type (Supabase returns question_type as string)
  const question = questionData as unknown as AnalysisQuestion

  // Fetch categories for dropdown
  const { data: categoriesData } = await supabase
    .from('question_categories')
    .select('*')
    .order('sort_order', { ascending: true })

  const categories = (categoriesData || []) as QuestionCategory[]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Frage bearbeiten</h1>
        <p className="text-slate-500 mt-1">
          Bearbeite die Analyse-Frage
        </p>
      </div>

      <QuestionForm 
        question={question} 
        categories={categories} 
      />
    </div>
  )
}

