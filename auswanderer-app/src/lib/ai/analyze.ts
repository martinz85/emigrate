/**
 * AI-Powered Emigration Analysis
 *
 * Uses the configured AI provider (with fallback) to analyze
 * user criteria and generate country recommendations.
 */

import { getAIAdapter } from './factory'
import type { AnalysisRequest, AnalysisResult, CountryScore, AIUsage } from './types'

// 28 Kriterien × max 2 Punkte × max 5 Gewichtung = 280 max Score
const MAX_SCORE = 280
const CRITERIA_COUNT = 28

const SYSTEM_PROMPT = `Du bist ein erfahrener Auswanderungs-Berater mit 20 Jahren Erfahrung. 
Du analysierst die Antworten eines Nutzers auf ${CRITERIA_COUNT} Kriterien und erstellst ein personalisiertes Länder-Ranking.

Für jedes Kriterium gibt der Nutzer eine Gewichtung von 1-5 an (1=egal, 5=sehr wichtig).

Du bewertest jedes Land für jedes Kriterium mit:
- ++ (2 Punkte) = Sehr gut
- o (1 Punkt) = Mittel
- -- (0 Punkte) = Schlecht

Der Gesamtscore eines Landes = Summe(Kriterium_Score × Nutzer_Gewichtung)
Maximaler Score = ${MAX_SCORE} (${CRITERIA_COUNT} Kriterien × 2 Punkte × 5 Gewichtung)

Antworte immer auf Deutsch und in einem freundlichen, hilfreichen Ton.`

/**
 * Analyze emigration preferences and return country recommendations
 */
export async function analyzeEmigration(
  request: AnalysisRequest
): Promise<AnalysisResult> {
  try {
    // Get AI adapter (with automatic fallback)
    const adapter = await getAIAdapter()

    // Build the prompt
    const userPrompt = buildAnalysisPrompt(request)

    // Call AI
    const response = await adapter.chat({
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
      maxTokens: 4096,
      temperature: 0.7,
    })

    // Parse response
    const result = parseAnalysisResponse(response.content)

    // Add usage metadata
    return {
      ...result,
      _usage: response.usage,
      _provider: response.provider,
      _model: response.model,
    }
  } catch (error) {
    console.error('[Analysis] AI error:', error)

    // Fallback to mock data if all providers fail
    return getMockAnalysis(request)
  }
}

/**
 * Build the analysis prompt from user input
 */
function buildAnalysisPrompt(request: AnalysisRequest): string {
  const { criteriaRatings, preAnalysis, userProfile } = request

  let prompt = `Analysiere folgendes Nutzerprofil für die Auswanderung:

## Nutzer-Profil:
`

  // Pre-Analysis Daten
  if (preAnalysis?.countriesOfInterest?.length) {
    prompt += `- Interessante Länder: ${preAnalysis.countriesOfInterest.join(', ')}\n`
  }
  if (preAnalysis?.specialWishes) {
    prompt += `- Besondere Wünsche: ${preAnalysis.specialWishes}\n`
  }

  // User Profile Daten (optional)
  if (userProfile?.budget) prompt += `- Budget: ${userProfile.budget}\n`
  if (userProfile?.profession) prompt += `- Beruf: ${userProfile.profession}\n`
  if (userProfile?.familyStatus) prompt += `- Familie: ${userProfile.familyStatus}\n`
  if (userProfile?.citizenship)
    prompt += `- Staatsbürgerschaft: ${userProfile.citizenship}\n`
  if (userProfile?.languages?.length)
    prompt += `- Sprachen: ${userProfile.languages.join(', ')}\n`
  if (userProfile?.climatePref) prompt += `- Klima-Präferenz: ${userProfile.climatePref}\n`
  if (userProfile?.naturePref) prompt += `- Natur-Präferenz: ${userProfile.naturePref}\n`

  prompt += `\n## Kriterien-Gewichtungen (1=egal, 5=sehr wichtig):\n`

  for (const [criterionId, rating] of Object.entries(criteriaRatings)) {
    prompt += `- ${criterionId}: ${rating}\n`
  }

  prompt += `\n## Aufgabe:
Erstelle ein Ranking der Top 5 Auswanderungsländer für diesen Nutzer.
${preAnalysis?.countriesOfInterest?.length ? `Berücksichtige besonders die genannten Länder: ${preAnalysis.countriesOfInterest.join(', ')}.` : ''}

Antworte im JSON-Format:
{
  "rankings": [
    {
      "rank": 1,
      "country": "Portugal",
      "countryCode": "PT",
      "percentage": 92,
      "strengths": ["Niedrige Kosten", "Gutes Klima"],
      "considerations": ["Portugiesisch lernen"]
    }
  ],
  "recommendation": {
    "topCountry": "Portugal",
    "summary": "Begründung...",
    "nextSteps": ["Schritt 1", "Schritt 2"]
  }
}`

  return prompt
}

/**
 * Parse the AI response into structured result
 */
function parseAnalysisResponse(text: string): AnalysisResult {
  try {
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }

    const parsed = JSON.parse(jsonMatch[0])

    return {
      success: true,
      rankings: parsed.rankings.map((r: any, index: number) => ({
        rank: index + 1,
        country: r.country,
        countryCode: r.countryCode,
        score: Math.round((r.percentage / 100) * MAX_SCORE),
        maxScore: MAX_SCORE,
        percentage: r.percentage,
        criteriaScores: {},
        strengths: r.strengths || [],
        considerations: r.considerations || [],
      })),
      recommendation: parsed.recommendation,
    }
  } catch (error) {
    console.error('[Analysis] Error parsing response:', error)
    return getMockAnalysis({} as AnalysisRequest)
  }
}

/**
 * Mock analysis for development/fallback
 */
function getMockAnalysis(request: AnalysisRequest): AnalysisResult {
  return {
    success: true,
    rankings: [
      {
        rank: 1,
        country: 'Portugal',
        countryCode: 'PT',
        score: Math.round((92 / 100) * MAX_SCORE),
        maxScore: MAX_SCORE,
        percentage: 92,
        criteriaScores: {},
        strengths: [
          'Niedrige Lebenshaltungskosten im EU-Vergleich',
          'Über 3.000 Sonnenstunden pro Jahr',
          'EU-Freizügigkeit',
          'Große internationale Expat-Community',
          'NHR-Steuervorteile für Zuzügler',
        ],
        considerations: [
          'Portugiesisch lernen empfohlen für tiefere Integration',
          'Immobilienpreise in Lissabon und Porto steigen stark',
        ],
      },
      {
        rank: 2,
        country: 'Spanien',
        countryCode: 'ES',
        score: Math.round((87 / 100) * MAX_SCORE),
        maxScore: MAX_SCORE,
        percentage: 87,
        criteriaScores: {},
        strengths: [
          'Exzellentes Klima, besonders im Süden',
          'Große deutsche Community an der Küste',
          'EU-Mitglied',
          'Gutes Gesundheitssystem',
        ],
        considerations: [
          'Arbeitsmarkt in manchen Regionen schwierig',
          'Bürokratie kann kompliziert sein',
        ],
      },
      {
        rank: 3,
        country: 'Zypern',
        countryCode: 'CY',
        score: Math.round((81 / 100) * MAX_SCORE),
        maxScore: MAX_SCORE,
        percentage: 81,
        criteriaScores: {},
        strengths: [
          'Englisch weit verbreitet',
          'Günstige Steuerregelungen',
          'EU-Mitglied',
          '3.300+ Sonnenstunden',
        ],
        considerations: [
          'Geteilte Insel (Nord-Süd)',
          'Wasserknappheit in manchen Regionen',
        ],
      },
      {
        rank: 4,
        country: 'Costa Rica',
        countryCode: 'CR',
        score: Math.round((77 / 100) * MAX_SCORE),
        maxScore: MAX_SCORE,
        percentage: 77,
        criteriaScores: {},
        strengths: [
          'Neutrales Land ohne Militär',
          'Fantastische Natur',
          'Stabile Demokratie',
          'Gutes Klima in den Bergen',
        ],
        considerations: [
          'Zeitzonendifferenz zu Europa',
          'Visa-Prozess kann dauern',
        ],
      },
      {
        rank: 5,
        country: 'Uruguay',
        countryCode: 'UY',
        score: Math.round((73 / 100) * MAX_SCORE),
        maxScore: MAX_SCORE,
        percentage: 73,
        criteriaScores: {},
        strengths: [
          'Sehr liberal und weltoffen',
          'Neutrales Land',
          'Niedrige Kriminalität',
          'Günstige Lebenshaltung',
        ],
        considerations: [
          'Spanisch erforderlich',
          'Atlantikküste kann windig sein',
        ],
      },
    ],
    recommendation: {
      topCountry: 'Portugal',
      summary:
        'Basierend auf deinen Prioritäten ist Portugal die optimale Wahl. Es bietet die perfekte Kombination aus niedrigen Kosten, exzellentem Klima und EU-Vorteilen.',
      nextSteps: [
        'D7 Visum (Passive Income) recherchieren',
        'Regionen vergleichen: Lissabon, Porto, Algarve, Madeira',
        'NHR-Steuerprogramm prüfen',
        'Portugiesisch-Grundkurs beginnen',
      ],
      alternative: {
        country: 'Spanien',
        condition: 'Wenn dir eine größere deutsche Community wichtiger ist',
        reason: 'Spanien hat eine etabliertere deutsche Infrastruktur an der Küste',
      },
    },
  }
}

export { getMockAnalysis }

