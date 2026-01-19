import { NextRequest, NextResponse } from 'next/server'
import { CRITERIA } from '@/lib/criteria'

// Force Node.js runtime (required for PDF generation)
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Note: @react-pdf/renderer has compatibility issues with Next.js App Router.
 * For MVP, we use a text-based placeholder. For production, consider:
 * 1. Using a separate Node.js worker for PDF generation
 * 2. Using an external PDF generation service (e.g., Puppeteer on a serverless function)
 * 3. Using a client-side PDF generation library like jspdf
 */

interface AnalysisReportData {
  topCountry: string
  matchPercentage: number
  createdAt: string
  criteriaRatings: Array<{ id: string; name: string; category: string; rating: number }>
  rankings: Array<{ rank: number; country: string; percentage: number; strengths?: string[]; considerations?: string[] }>
}

// Allowed IDs for MVP demo mode
// In production: All IDs will be validated against Supabase
const ALLOWED_DEMO_IDS = ['demo']

// UUID regex for production IDs
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Validate analysis ID
 * For MVP: Only 'demo' and valid UUIDs are allowed
 */
function isValidAnalysisId(id: string): boolean {
  return ALLOWED_DEMO_IDS.includes(id) || UUID_REGEX.test(id)
}

/**
 * Mock analysis data for development
 * In production: Fetch from Supabase and verify payment status
 * 
 * ⚠️ SECURITY WARNING: This function returns mock data for ANY valid ID.
 * In production, this MUST be replaced with actual Supabase queries
 * that verify the user owns the analysis AND has paid for it.
 */
function getMockAnalysisData(id: string): AnalysisReportData {
  // Fixed demo data for consistent testing (no random values)
  const criteriaRatings = CRITERIA.map((criterion, index) => ({
    id: criterion.id,
    name: criterion.name,
    category: criterion.category,
    // Fixed ratings based on index for deterministic output
    rating: ((index % 3) + 3) as 3 | 4 | 5,
  }))

  return {
    topCountry: 'Portugal',
    matchPercentage: 92,
    createdAt: new Date().toISOString(),
    criteriaRatings,
      rankings: [
        { 
          rank: 1, 
          country: 'Portugal', 
          percentage: 92,
          strengths: ['Niedrige Lebenshaltungskosten', 'Angenehmes Klima', 'Gute Infrastruktur'],
          considerations: ['Sprachbarriere', 'Bürokratie'],
        },
        { 
          rank: 2, 
          country: 'Spanien', 
          percentage: 87,
          strengths: ['Hohe Lebensqualität', 'Kultur & Essen', 'Gesundheitssystem'],
          considerations: ['Höhere Kosten in Großstädten'],
        },
        { 
          rank: 3, 
          country: 'Zypern', 
          percentage: 81,
          strengths: ['Steuervorteile', 'Englisch verbreitet', 'EU-Mitglied'],
          considerations: ['Kleine Insel', 'Sommer sehr heiß'],
        },
        { 
          rank: 4, 
          country: 'Costa Rica', 
          percentage: 77,
          strengths: ['Natur & Biodiversität', 'Pura Vida Lifestyle'],
          considerations: ['Entfernung zu Europa', 'Visabestimmungen'],
        },
        { 
          rank: 5, 
          country: 'Uruguay', 
          percentage: 73,
          strengths: ['Stabilität', 'Demokratie', 'Sicherheit'],
          considerations: ['Kleine Wirtschaft', 'Isolierte Lage'],
        },
      ],
    }
}

/**
 * Generate a text-based report (MVP workaround for PDF)
 */
function generateTextReport(data: AnalysisReportData): string {
  const lines: string[] = []
  const divider = '═'.repeat(60)
  const thinDivider = '─'.repeat(60)
  
  // Header
  lines.push(divider)
  lines.push('')
  lines.push('        AUSWANDERUNGS-ANALYSE')
  lines.push('        Dein persönliches Länder-Ranking')
  lines.push('')
  lines.push(divider)
  lines.push('')
  
  // Top Country
  lines.push('DEIN TOP-MATCH:')
  lines.push('')
  lines.push(`   🏆 ${data.topCountry}`)
  lines.push(`   ${data.matchPercentage}% Übereinstimmung`)
  lines.push('')
  lines.push(thinDivider)
  lines.push('')
  
  // Rankings
  lines.push('VOLLSTÄNDIGES RANKING:')
  lines.push('')
  
  for (const ranking of data.rankings) {
    const medal = ranking.rank === 1 ? '🥇' : ranking.rank === 2 ? '🥈' : ranking.rank === 3 ? '🥉' : '  '
    lines.push(`${medal} Platz ${ranking.rank}: ${ranking.country} - ${ranking.percentage}%`)
    
    if (ranking.strengths && ranking.strengths.length > 0) {
      lines.push(`   ✅ Stärken: ${ranking.strengths.join(', ')}`)
    }
    
    if (ranking.considerations && ranking.considerations.length > 0) {
      lines.push(`   ⚠️ Beachte: ${ranking.considerations.join(', ')}`)
    }
    
    lines.push('')
  }
  
  lines.push(thinDivider)
  lines.push('')
  
  // Criteria Summary (grouped by category)
  lines.push('DEINE KRITERIEN-BEWERTUNG:')
  lines.push('')
  
  const byCategory = data.criteriaRatings.reduce((acc, c) => {
    if (!acc[c.category]) acc[c.category] = []
    acc[c.category].push(c)
    return acc
  }, {} as Record<string, typeof data.criteriaRatings>)
  
  for (const [category, criteria] of Object.entries(byCategory)) {
    lines.push(`📂 ${category}:`)
    for (const c of criteria) {
      const stars = '★'.repeat(c.rating) + '☆'.repeat(5 - c.rating)
      lines.push(`   ${c.name}: ${stars} (${c.rating}/5)`)
    }
    lines.push('')
  }
  
  // Footer
  lines.push(divider)
  lines.push('')
  lines.push(`Erstellt am: ${new Date(data.createdAt).toLocaleDateString('de-DE', { 
    day: '2-digit', month: 'long', year: 'numeric' 
  })}`)
  lines.push('')
  lines.push('Auswanderer-Plattform | auswanderer-plattform.de')
  lines.push('')
  lines.push(divider)
  
  return lines.join('\n')
}

/**
 * Check if analysis is paid
 * In production: Query Supabase for payment status
 * 
 * ⚠️ SECURITY WARNING (MVP):
 * This function currently returns TRUE for all valid IDs.
 * This is ONLY acceptable for internal testing/demo purposes.
 * 
 * Before deploying to production, this MUST be replaced with:
 * 1. Supabase query to verify payment status
 * 2. User authentication to verify ownership
 * 
 * See Epic 6 for implementation.
 */
async function isAnalysisPaid(id: string): Promise<boolean> {
  // For demo ID: Always allow (for internal testing)
  if (id === 'demo') return true
  
  // TODO: Implement Supabase check in Epic 6
  // const { data } = await supabase
  //   .from('analyses')
  //   .select('paid, user_id')
  //   .eq('id', id)
  //   .single()
  // 
  // if (!data) return false
  // 
  // // Verify ownership
  // const session = await getServerSession()
  // if (data.user_id !== session?.user?.id) return false
  // 
  // return data.paid === true
  
  // ⚠️ MVP ONLY: Allow all valid UUIDs for development
  // Remove this line in production!
  return true
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const analysisId = params.id

  // Validate ID format (basic check)
  if (!analysisId || typeof analysisId !== 'string') {
    return NextResponse.json(
      { error: 'Ungültige Analyse-ID' },
      { status: 400 }
    )
  }

  // Validate ID against allowlist/format
  if (!isValidAnalysisId(analysisId)) {
    return NextResponse.json(
      { error: 'Analyse nicht gefunden' },
      { status: 404 }
    )
  }

  try {
    // Check payment status
    const isPaid = await isAnalysisPaid(analysisId)
    
    if (!isPaid) {
      return NextResponse.json(
        { error: 'Analyse nicht freigeschaltet. Bitte zuerst bezahlen.' },
        { status: 403 }
      )
    }

    // Get analysis data
    const analysisData = getMockAnalysisData(analysisId)

    // Generate PDF content
    console.log(`Generating PDF for analysis: ${analysisId}`)
    const startTime = Date.now()

    // MVP: Generate a text-based report instead of PDF due to @react-pdf/renderer compatibility issues
    // TODO: Implement proper PDF generation in production using a worker or external service
    const textContent = generateTextReport(analysisData)

    const duration = Date.now() - startTime
    console.log(`Report generated in ${duration}ms`)

    // Format date for filename
    const date = new Date().toISOString().split('T')[0]
    const filename = `auswanderer-analyse-${date}.txt`

    // Return as text file download (MVP workaround)
    return new NextResponse(textContent, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    
    return NextResponse.json(
      { error: 'PDF konnte nicht erstellt werden. Bitte versuche es später erneut.' },
      { status: 500 }
    )
  }
}
