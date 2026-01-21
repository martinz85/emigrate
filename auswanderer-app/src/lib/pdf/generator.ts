/**
 * PDF Generation for Emigration Analysis Reports
 * 
 * ⚠️ SECURITY WARNING:
 * The generatePreviewHtml() function interpolates user data directly into HTML.
 * This is XSS-vulnerable if the HTML is ever rendered in a browser context.
 * 
 * Current status: This function is NOT used in production.
 * The PDF API (/api/pdf/[id]) uses generateTextReport() instead.
 * 
 * Before using generatePreviewHtml() in production:
 * 1. Implement proper HTML escaping (e.g., using a sanitizer library)
 * 2. Or use a template engine with auto-escaping (e.g., React server components)
 * 3. Or generate PDF directly without HTML intermediate (e.g., @react-pdf/renderer)
 */

import type { AnalysisResult, CountryScore } from '@/lib/ai/types'

export interface PDFData {
  user: {
    name: string
    email: string
    createdAt: Date
  }
  profile: {
    budget?: string
    profession?: string
    familyStatus?: string
    targetRegion?: string
    timeline?: string
    topPriorities: string[]
  }
  criteriaWeights: Record<string, number>
  analysis: AnalysisResult
}

export interface PDFGenerationResult {
  success: boolean
  pdfUrl?: string
  previewHtml?: string
  error?: string
}

// Generate preview HTML (first 2 pages)
export function generatePreviewHtml(data: PDFData): string {
  const { user, profile, analysis } = data
  const top3 = analysis.rankings.slice(0, 3)

  return `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; }
    .page { width: 210mm; min-height: 297mm; padding: 20mm; background: white; }
    .header { text-align: center; margin-bottom: 30px; }
    .title { font-size: 28px; font-weight: bold; color: #1F4E79; }
    .subtitle { font-size: 16px; color: #2F5496; margin-top: 10px; }
    .section { margin: 25px 0; }
    .section-title { font-size: 18px; font-weight: bold; color: #1F4E79; border-bottom: 2px solid #1F4E79; padding-bottom: 5px; margin-bottom: 15px; }
    .profile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .profile-item { padding: 10px; background: #f8f9fa; border-radius: 5px; }
    .profile-label { font-size: 12px; color: #666; }
    .profile-value { font-weight: bold; }
    .ranking-table { width: 100%; border-collapse: collapse; }
    .ranking-table th { background: #1F4E79; color: white; padding: 12px; text-align: left; }
    .ranking-table td { padding: 12px; border-bottom: 1px solid #ddd; }
    .rank-badge { display: inline-block; width: 30px; height: 30px; border-radius: 50%; text-align: center; line-height: 30px; font-weight: bold; }
    .rank-1 { background: #FFD700; }
    .rank-2 { background: #C0C0C0; }
    .rank-3 { background: #CD7F32; color: white; }
    .percentage { font-size: 20px; font-weight: bold; color: #28A745; }
    .footer { text-align: center; font-size: 12px; color: #666; margin-top: 30px; }
  </style>
</head>
<body>
  <!-- Page 1: Title & Profile -->
  <div class="page">
    <div class="header">
      <div class="title">AUSWANDERUNGSANALYSE 2026</div>
      <div class="subtitle">Personalisiert für ${user.name}</div>
    </div>

    <div class="section">
      <div class="section-title">📋 DEIN PROFIL</div>
      <div class="profile-grid">
        ${profile.budget ? `<div class="profile-item"><div class="profile-label">Budget</div><div class="profile-value">${profile.budget}</div></div>` : ''}
        ${profile.profession ? `<div class="profile-item"><div class="profile-label">Beruf</div><div class="profile-value">${profile.profession}</div></div>` : ''}
        ${profile.familyStatus ? `<div class="profile-item"><div class="profile-label">Familie</div><div class="profile-value">${profile.familyStatus}</div></div>` : ''}
        ${profile.timeline ? `<div class="profile-item"><div class="profile-label">Zeitrahmen</div><div class="profile-value">${profile.timeline}</div></div>` : ''}
      </div>
      ${profile.topPriorities.length > 0 ? `
        <div style="margin-top: 15px;">
          <strong>Deine Top-Prioritäten:</strong>
          <ul style="margin-top: 5px;">
            ${profile.topPriorities.map(p => `<li>${p}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
    </div>

    <div class="section">
      <div class="section-title">🏆 DEIN LÄNDER-RANKING</div>
      <table class="ranking-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Land</th>
            <th>Match</th>
            <th>Highlights</th>
          </tr>
        </thead>
        <tbody>
          ${top3.map((country: CountryScore, i: number) => `
            <tr>
              <td><span class="rank-badge rank-${i + 1}">${i + 1}</span></td>
              <td><strong>${country.country}</strong></td>
              <td><span class="percentage">${country.percentage}%</span></td>
              <td>${(country.strengths || []).slice(0, 2).join(', ')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="footer">
      Erstellt: ${new Date().toLocaleDateString('de-DE')} | Auswanderer-Plattform
    </div>
  </div>

  <!-- Page 2: Top Recommendation -->
  <div class="page">
    <div class="section">
      <div class="section-title">🥇 TOP-EMPFEHLUNG: ${analysis.recommendation.topCountry}</div>
      <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
        ${analysis.recommendation.summary}
      </p>
      
      <div style="background: #C6EFCE; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <strong>✅ Stärken:</strong>
        <ul style="margin-top: 10px;">
          ${(analysis.rankings[0]?.strengths || []).map((s: string) => `<li>${s}</li>`).join('')}
        </ul>
      </div>

      <div style="background: #FFEB9C; padding: 15px; border-radius: 8px;">
        <strong>⚠️ Beachte:</strong>
        <ul style="margin-top: 10px;">
          ${(analysis.rankings[0]?.considerations || []).map((c: string) => `<li>${c}</li>`).join('')}
        </ul>
      </div>
    </div>

    <div class="section" style="margin-top: 40px; padding: 20px; background: linear-gradient(135deg, #f8f9fa, #e9ecef); border-radius: 10px; text-align: center;">
      <h3 style="color: #1F4E79; margin-bottom: 15px;">📊 Vollständige Analyse freischalten</h3>
      <p style="margin-bottom: 15px;">Die komplette PDF enthält:</p>
      <ul style="text-align: left; display: inline-block; margin-bottom: 20px;">
        <li>Detailmatrix aller Kriterien</li>
        <li>Analyse aller Top 5 Länder</li>
        <li>Konkrete nächste Schritte</li>
        <li>Visa-Informationen</li>
      </ul>
      <div style="margin-top: 20px;">
        <a href="/checkout" style="display: inline-block; background: #1F4E79; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
          Jetzt freischalten - 39 EUR
        </a>
      </div>
    </div>

    <div class="footer">
      Seite 2 von 5 | Vorschau-Version
    </div>
  </div>
</body>
</html>
`
}

// Full PDF generation would use @react-pdf/renderer or similar
export async function generateFullPdf(data: PDFData): Promise<PDFGenerationResult> {
  try {
    // In production, this would use a PDF library
    // For now, return the preview HTML
    const previewHtml = generatePreviewHtml(data)
    
    return {
      success: true,
      previewHtml,
      // pdfUrl would be set after actual PDF generation
    }
  } catch (error) {
    console.error('PDF generation error:', error)
    return {
      success: false,
      error: 'PDF-Generierung fehlgeschlagen',
    }
  }
}

// Generate PDF preview endpoint response
export function getPdfPreviewData(analysisResult: AnalysisResult) {
  return {
    previewPages: 2,
    totalPages: 5,
    rankings: analysisResult.rankings.slice(0, 3),
    recommendation: analysisResult.recommendation,
    unlockPrice: 39,
    proPrice: 14.99,
  }
}

