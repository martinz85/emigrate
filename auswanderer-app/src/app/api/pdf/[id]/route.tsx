import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { CRITERIA } from '@/lib/criteria'

// Force Node.js runtime
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// UUID regex for validation
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * PDF/Report Download API
 * 
 * Security: Verifies payment status in Supabase before generating report.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const analysisId = params.id

  // Validate ID format
  if (!analysisId || typeof analysisId !== 'string') {
    return NextResponse.json(
      { error: 'Ungültige Analyse-ID' },
      { status: 400 }
    )
  }

  // Handle demo mode
  if (analysisId === 'demo') {
    const demoData = getDemoAnalysisData()
    const textContent = generateTextReport(demoData)
    return createReportResponse(textContent)
  }

  // Validate UUID format
  if (!UUID_REGEX.test(analysisId)) {
    return NextResponse.json(
      { error: 'Analyse nicht gefunden' },
      { status: 404 }
    )
  }

  try {
    const supabase = await createClient()
    const cookieStore = await cookies()
    const sessionId = cookieStore.get('session_id')?.value

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch analysis from Supabase
    const { data: analysis, error } = await supabase
      .from('analyses')
      .select('*')
      .eq('id', analysisId)
      .single()

    if (error || !analysis) {
      console.error('Analysis not found:', error)
      return NextResponse.json(
        { error: 'Analyse nicht gefunden' },
        { status: 404 }
      )
    }

    // Security: Check ownership
    const isOwner = 
      (user && analysis.user_id === user.id) ||
      (!user && analysis.session_id === sessionId) ||
      (analysis.user_id === null && analysis.session_id === null)

    if (!isOwner) {
      return NextResponse.json(
        { error: 'Zugriff verweigert' },
        { status: 403 }
      )
    }

    // Security: Check payment status
    if (!analysis.paid) {
      return NextResponse.json(
        { error: 'Analyse nicht freigeschaltet. Bitte zuerst bezahlen.' },
        { status: 403 }
      )
    }

    // Get result data
    const result = analysis.result as AnalysisResult | null
    if (!result) {
      return NextResponse.json(
        { error: 'Analyse-Ergebnis nicht gefunden' },
        { status: 404 }
      )
    }

    // Generate report
    console.log(`Generating report for analysis: ${analysisId}`)
    const startTime = Date.now()

    const reportData = {
      topCountry: result.topCountry,
      matchPercentage: result.matchPercentage,
      createdAt: analysis.created_at,
      criteriaRatings: extractCriteriaRatings(analysis.ratings),
      rankings: result.rankings,
    }

    const textContent = generateTextReport(reportData)
    const duration = Date.now() - startTime
    console.log(`Report generated in ${duration}ms`)

    return createReportResponse(textContent)
  } catch (error) {
    console.error('Report generation error:', error)
    
    return NextResponse.json(
      { error: 'Report konnte nicht erstellt werden. Bitte versuche es später erneut.' },
      { status: 500 }
    )
  }
}

// ============================================
// TYPES
// ============================================

interface AnalysisResult {
  topCountry: string
  matchPercentage: number
  rankings: Array<{
    rank: number
    country: string
    percentage: number
    strengths?: string[]
    considerations?: string[]
  }>
}

interface ReportData {
  topCountry: string
  matchPercentage: number
  createdAt: string
  criteriaRatings: Array<{ id: string; name: string; category: string; rating: number }>
  rankings: Array<{ rank: number; country: string; percentage: number; strengths?: string[]; considerations?: string[] }>
}

// ============================================
// HELPERS
// ============================================

function createReportResponse(textContent: string): NextResponse {
  const date = new Date().toISOString().split('T')[0]
  const filename = `auswanderer-analyse-${date}.txt`

  return new NextResponse(textContent, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  })
}

function extractCriteriaRatings(ratings: unknown): Array<{ id: string; name: string; category: string; rating: number }> {
  const ratingsObj = ratings as Record<string, number> | null
  if (!ratingsObj) return []

  return CRITERIA.map(criterion => ({
    id: criterion.id,
    name: criterion.name,
    category: criterion.category,
    rating: ratingsObj[criterion.id] || 3,
  }))
}

function getDemoAnalysisData(): ReportData {
  return {
    topCountry: 'Portugal',
    matchPercentage: 92,
    createdAt: new Date().toISOString(),
    criteriaRatings: CRITERIA.map((criterion, index) => ({
      id: criterion.id,
      name: criterion.name,
      category: criterion.category,
      rating: ((index % 3) + 3) as 3 | 4 | 5,
    })),
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

// ============================================
// REPORT GENERATION
// ============================================

function generateTextReport(data: ReportData): string {
  const lines: string[] = []
  const divider = '═'.repeat(60)
  const thinDivider = '─'.repeat(60)
  
  // Header
  lines.push(divider)
  lines.push('')
  lines.push('       AUSWANDERUNGS-ANALYSE')
  lines.push('       Dein persönliches Länder-Ranking')
  lines.push('')
  lines.push(divider)
  lines.push('')
  
  // Top Result
  lines.push(`🏆 DEIN TOP-MATCH: ${data.topCountry}`)
  lines.push(`   Übereinstimmung: ${data.matchPercentage}%`)
  lines.push('')
  lines.push(thinDivider)
  lines.push('')
  
  // Full Ranking
  lines.push('📊 DEIN VOLLSTÄNDIGES RANKING')
  lines.push('')
  
  for (const ranking of data.rankings) {
    const medal = ranking.rank === 1 ? '🥇' : ranking.rank === 2 ? '🥈' : ranking.rank === 3 ? '🥉' : '  '
    lines.push(`${medal} ${ranking.rank}. ${ranking.country} - ${ranking.percentage}%`)
    
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
  
  // Criteria Summary
  lines.push('📋 DEINE KRITERIEN-BEWERTUNGEN')
  lines.push('')
  
  // Group by category
  const categories = [...new Set(data.criteriaRatings.map(c => c.category))]
  for (const category of categories) {
    lines.push(`▸ ${category}`)
    const categoryRatings = data.criteriaRatings.filter(c => c.category === category)
    for (const rating of categoryRatings) {
      const stars = '★'.repeat(rating.rating) + '☆'.repeat(5 - rating.rating)
      lines.push(`  ${rating.name}: ${stars} (${rating.rating}/5)`)
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
