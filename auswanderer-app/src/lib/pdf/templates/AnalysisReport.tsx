import { Document } from '@react-pdf/renderer'
import { CoverPage } from './CoverPage'
import { CriteriaSection } from './CriteriaSection'
import { RankingSection } from './RankingSection'

interface CriteriaRating {
  id: string
  name: string
  category: string
  rating: number
}

interface RankingItem {
  rank: number
  country: string
  percentage: number
  strengths?: string[]
  considerations?: string[]
}

export interface AnalysisReportData {
  topCountry: string
  matchPercentage: number
  createdAt: string
  criteriaRatings: CriteriaRating[]
  rankings: RankingItem[]
}

interface AnalysisReportProps {
  analysis: AnalysisReportData
}

export function AnalysisReport({ analysis }: AnalysisReportProps) {
  return (
    <Document
      title="Auswanderungs-Analyse"
      author="Auswanderer-Plattform"
      subject="Personalisierte Länderempfehlung"
      creator="Auswanderer-Plattform"
    >
      {/* Page 1: Cover */}
      <CoverPage
        topCountry={analysis.topCountry}
        matchPercentage={analysis.matchPercentage}
        createdAt={analysis.createdAt}
        totalCriteria={analysis.criteriaRatings.length}
        totalCountries={analysis.rankings.length}
      />

      {/* Page 2: Criteria Ratings */}
      <CriteriaSection
        criteria={analysis.criteriaRatings}
        pageNumber={2}
      />

      {/* Page 3: Ranking */}
      <RankingSection
        rankings={analysis.rankings}
        pageNumber={3}
      />
    </Document>
  )
}

