/**
 * PDF Template exports
 * 
 * ⚠️ NOTE: These templates are implemented but NOT currently used.
 * 
 * The @react-pdf/renderer library has compatibility issues with Next.js App Router
 * ("ba.Component is not a constructor" error). 
 * 
 * For the MVP, we use a text-based report instead (see /api/pdf/[id]/route.tsx).
 * 
 * These templates are preserved for future use when:
 * 1. @react-pdf/renderer fixes the Next.js 14+ compatibility
 * 2. We implement a separate Node.js worker for PDF generation
 * 3. We use an external PDF generation service (e.g., Puppeteer on serverless)
 * 
 * Alternative approaches to consider:
 * - jspdf (client-side PDF generation)
 * - pdfmake (browser & Node.js)
 * - html-pdf or puppeteer (server-side rendering)
 */
export { AnalysisReport, type AnalysisReportData } from './AnalysisReport'
export { CoverPage } from './CoverPage'
export { CriteriaSection } from './CriteriaSection'
export { RankingSection } from './RankingSection'
export { PDF_COLORS, sharedStyles } from './styles'

