import { NextRequest, NextResponse } from 'next/server'
import { analyzeEmigration, type AnalysisRequest } from '@/lib/claude/analyze'
import { randomUUID } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { preAnalysis, ratings } = body

    // Transform the request to match the Claude API format
    const analysisRequest: AnalysisRequest = {
      criteriaRatings: ratings,
      userProfile: {
        // Map preAnalysis to userProfile fields
        // countriesOfInterest will be passed in the prompt
      },
    }

    // Call Claude AI for analysis
    const analysisResult = await analyzeEmigration(analysisRequest)

    // Generate a unique ID for this analysis
    // In production, this would be stored in Supabase
    const analysisId = randomUUID()

    // TODO: Store in Supabase
    // const { data, error } = await supabase
    //   .from('analyses')
    //   .insert({
    //     id: analysisId,
    //     preAnalysis,
    //     ratings,
    //     results: analysisResult,
    //     created_at: new Date().toISOString(),
    //   })

    return NextResponse.json({
      success: true,
      analysisId,
      ...analysisResult,
    })
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { error: 'Analyse fehlgeschlagen' },
      { status: 500 }
    )
  }
}
