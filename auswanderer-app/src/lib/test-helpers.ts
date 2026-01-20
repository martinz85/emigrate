/**
 * Test Helpers
 * 
 * Exponiert Test-Utilities auf window.__TEST__ im Development-Modus.
 * Diese Helpers ermöglichen automatisierte UI-Tests.
 */

import { useAnalysisStore } from '@/stores'

export interface TestHelpers {
  /** Setzt den Analyse-State komplett zurück */
  resetAnalysis: () => void
  /** Springt zu einem bestimmten Step */
  goToStep: (step: 'welcome' | 'pre-analysis' | 'criteria' | 'loading') => void
  /** Springt zu einer bestimmten Frage (0-basiert) */
  setQuestionIndex: (index: number) => void
  /** Gibt den aktuellen Store-State zurück */
  getState: () => ReturnType<typeof useAnalysisStore.getState>
  /** Löscht LocalStorage und SessionStorage */
  clearStorage: () => void
  /** Setzt ein Rating für eine Frage */
  setRating: (questionKey: string, value: number) => void
  /** Simuliert Pre-Analysis Daten */
  setPreAnalysis: (data: { countriesOfInterest?: string[]; specialWishes?: string }) => void
}

declare global {
  interface Window {
    __TEST__?: TestHelpers
  }
}

/**
 * Initialisiert Test-Helpers im Development-Modus
 * Sollte einmal beim App-Start aufgerufen werden
 */
export function initTestHelpers(): void {
  if (typeof window === 'undefined') return
  if (process.env.NODE_ENV !== 'development') return

  const helpers: TestHelpers = {
    resetAnalysis: () => {
      useAnalysisStore.getState().reset()
      console.log('[TEST] Analysis state reset')
    },

    goToStep: (step) => {
      useAnalysisStore.getState().setStep(step)
      console.log(`[TEST] Navigated to step: ${step}`)
    },

    setQuestionIndex: (index) => {
      const state = useAnalysisStore.getState()
      // Reset to beginning first
      while (state.currentCriterionIndex > 0) {
        state.previousCriterion()
      }
      // Then advance to target
      for (let i = 0; i < index; i++) {
        state.nextCriterion()
      }
      console.log(`[TEST] Set question index to: ${index}`)
    },

    getState: () => {
      return useAnalysisStore.getState()
    },

    clearStorage: () => {
      localStorage.clear()
      sessionStorage.clear()
      console.log('[TEST] Storage cleared')
    },

    setRating: (questionKey, value) => {
      useAnalysisStore.getState().setRating(questionKey, value)
      console.log(`[TEST] Set rating for ${questionKey}: ${value}`)
    },

    setPreAnalysis: (data) => {
      useAnalysisStore.getState().setPreAnalysis({
        countriesOfInterest: data.countriesOfInterest || [],
        specialWishes: data.specialWishes || '',
      })
      console.log('[TEST] Pre-analysis data set')
    },
  }

  window.__TEST__ = helpers
  console.log('[TEST] Test helpers initialized. Access via window.__TEST__')
}

/**
 * Hook zum Initialisieren der Test-Helpers
 * Nutze in der Root-Layout oder App-Komponente
 */
export function useTestHelpers(): void {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    // Nur einmal initialisieren
    if (!window.__TEST__) {
      initTestHelpers()
    }
  }
}

