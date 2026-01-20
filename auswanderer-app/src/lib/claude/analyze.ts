// Claude AI Integration for Emigration Analysis

export interface AnalysisRequest {
  criteriaRatings: Record<string, number>
  preAnalysis?: {
    countriesOfInterest: string[]
    specialWishes: string
  }
  userProfile?: {
    budget?: string
    profession?: string
    familyStatus?: string
    citizenship?: string
    languages?: string[]
    climatePref?: string
    naturePref?: string
  }
  /** Question weights from database (question_key -> weight) */
  questionWeights?: Record<string, number>
}

export interface CountryScore {
  rank: number
  country: string
  countryCode: string
  score: number
  maxScore: number
  percentage: number
  criteriaScores: Record<string, {
    score: number
    symbol: '++' | 'o' | '--'
    explanation: string
  }>
  strengths: string[]
  considerations: string[]
}

export interface AnalysisResult {
  success: boolean
  rankings: CountryScore[]
  recommendation: {
    topCountry: string
    summary: string
    nextSteps: string[]
    alternative?: {
      country: string
      condition: string
      reason: string
    }
  }
}

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

export async function analyzeEmigration(
  request: AnalysisRequest
): Promise<AnalysisResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY not configured')
    // Return mock data for development
    return getMockAnalysis(request)
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: buildAnalysisPrompt(request),
          },
        ],
      }),
    })

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`)
    }

    const data = await response.json()
    return parseClaudeResponse(data.content[0].text)
  } catch (error) {
    console.error('Claude API error:', error)
    return getMockAnalysis(request)
  }
}

function buildAnalysisPrompt(request: AnalysisRequest): string {
  const { criteriaRatings, preAnalysis, userProfile, questionWeights } = request
  
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
  if (userProfile?.citizenship) prompt += `- Staatsbürgerschaft: ${userProfile.citizenship}\n`
  if (userProfile?.languages?.length) prompt += `- Sprachen: ${userProfile.languages.join(', ')}\n`
  if (userProfile?.climatePref) prompt += `- Klima-Präferenz: ${userProfile.climatePref}\n`
  if (userProfile?.naturePref) prompt += `- Natur-Präferenz: ${userProfile.naturePref}\n`

  prompt += `\n## Kriterien-Gewichtungen (Nutzer-Rating 1-5, Admin-Gewicht als Multiplikator):\n`
  
  for (const [criterionId, rating] of Object.entries(criteriaRatings)) {
    // Apply admin-configured weight multiplier if available
    const adminWeight = questionWeights?.[criterionId] ?? 1.0
    const effectiveWeight = rating * adminWeight
    
    if (adminWeight !== 1.0) {
      prompt += `- ${criterionId}: Nutzer=${rating}, Admin-Gewicht=${adminWeight}x, Effektiv=${effectiveWeight.toFixed(1)}\n`
    } else {
      prompt += `- ${criterionId}: ${rating}\n`
    }
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

function parseClaudeResponse(text: string): AnalysisResult {
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
    console.error('Error parsing Claude response:', error)
    return getMockAnalysis({} as AnalysisRequest)
  }
}

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
      summary: 'Basierend auf deinen Prioritäten ist Portugal die optimale Wahl. Es bietet die perfekte Kombination aus niedrigen Kosten, exzellentem Klima und EU-Vorteilen.',
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

