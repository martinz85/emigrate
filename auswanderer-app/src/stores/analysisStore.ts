import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface PreAnalysisData {
  countriesOfInterest: string[]
  specialWishes: string
}

export interface AnalysisState {
  // Flow state
  currentStep: 'welcome' | 'pre-analysis' | 'criteria' | 'loading' | 'complete'
  currentCriterionIndex: number
  
  // Pre-analysis data
  preAnalysis: PreAnalysisData
  
  // Criteria ratings (criterion_id -> rating 1-5)
  ratings: Record<string, number>
  
  // Results
  isLoading: boolean
  analysisId: string | null
  results: AnalysisResult | null
  
  // Actions
  setStep: (step: AnalysisState['currentStep']) => void
  setPreAnalysis: (data: Partial<PreAnalysisData>) => void
  setRating: (criterionId: string, rating: number) => void
  nextCriterion: () => void
  previousCriterion: () => void
  setLoading: (loading: boolean) => void
  setResults: (id: string, results: AnalysisResult) => void
  reset: () => void
}

export interface CountryResult {
  rank: number
  country: string
  countryCode: string
  matchPercentage: number
  summary: string
  strengths: string[]
  considerations: string[]
}

export interface AnalysisResult {
  topCountries: CountryResult[]
  overallSummary: string
  nextSteps: string[]
  generatedAt: string
}

const initialState = {
  currentStep: 'welcome' as const,
  currentCriterionIndex: 0,
  preAnalysis: {
    countriesOfInterest: [],
    specialWishes: '',
  },
  ratings: {},
  isLoading: false,
  analysisId: null,
  results: null,
}

export const useAnalysisStore = create<AnalysisState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setStep: (step) => set({ currentStep: step }),

      setPreAnalysis: (data) =>
        set((state) => ({
          preAnalysis: { ...state.preAnalysis, ...data },
        })),

      setRating: (criterionId, rating) =>
        set((state) => ({
          ratings: { ...state.ratings, [criterionId]: rating },
        })),

      nextCriterion: () =>
        set((state) => ({
          currentCriterionIndex: state.currentCriterionIndex + 1,
        })),

      previousCriterion: () =>
        set((state) => ({
          currentCriterionIndex: Math.max(0, state.currentCriterionIndex - 1),
        })),

      setLoading: (loading) => set({ isLoading: loading }),

      setResults: (id, results) =>
        set({
          analysisId: id,
          results,
          currentStep: 'complete',
          isLoading: false,
        }),

      reset: () => set(initialState),
    }),
    {
      name: 'analysis-storage',
      partialize: (state) => ({
        preAnalysis: state.preAnalysis,
        ratings: state.ratings,
        currentCriterionIndex: state.currentCriterionIndex,
        // Don't persist 'loading' or 'complete' steps - on reload, go back to last answerable step
        currentStep: state.currentStep === 'loading' || state.currentStep === 'complete'
          ? 'criteria'
          : state.currentStep,
      }),
    }
  )
)

