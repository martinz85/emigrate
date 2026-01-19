import { Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { PDF_COLORS } from './styles'

const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontFamily: 'Helvetica',
  },
  header: {
    backgroundColor: PDF_COLORS.primary,
    padding: 40,
    paddingTop: 60,
    paddingBottom: 50,
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: 'Helvetica-Bold',
    color: PDF_COLORS.white,
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: PDF_COLORS.white,
    opacity: 0.9,
    textAlign: 'center',
  },
  content: {
    padding: 40,
    flex: 1,
  },
  topCountrySection: {
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  topCountryLabel: {
    fontSize: 14,
    color: PDF_COLORS.textLight,
    marginBottom: 10,
  },
  topCountryName: {
    fontSize: 36,
    fontFamily: 'Helvetica-Bold',
    color: PDF_COLORS.primary,
    marginBottom: 10,
  },
  topCountryScore: {
    fontSize: 48,
    fontFamily: 'Helvetica-Bold',
    color: PDF_COLORS.secondary,
  },
  topCountryScoreLabel: {
    fontSize: 16,
    color: PDF_COLORS.textLight,
    marginTop: 5,
  },
  infoSection: {
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: PDF_COLORS.border,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 11,
    color: PDF_COLORS.textLight,
  },
  infoValue: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: PDF_COLORS.text,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: 'center',
  },
  footerText: {
    fontSize: 10,
    color: PDF_COLORS.textMuted,
  },
  decorativeLine: {
    height: 4,
    backgroundColor: PDF_COLORS.secondary,
    marginTop: 20,
    width: 60,
    alignSelf: 'center',
  },
})

interface CoverPageProps {
  topCountry: string
  matchPercentage: number
  createdAt: string
  totalCriteria: number
  totalCountries: number
}

export function CoverPage({ 
  topCountry, 
  matchPercentage, 
  createdAt, 
  totalCriteria,
  totalCountries,
}: CoverPageProps) {
  // Format date
  const formattedDate = new Date(createdAt).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  return (
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Auswanderungs-Analyse</Text>
        <Text style={styles.headerSubtitle}>Dein persönliches Länder-Ranking</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Top Country */}
        <View style={styles.topCountrySection}>
          <Text style={styles.topCountryLabel}>Dein Top-Match</Text>
          <Text style={styles.topCountryName}>{topCountry}</Text>
          <Text style={styles.topCountryScore}>{matchPercentage}%</Text>
          <Text style={styles.topCountryScoreLabel}>Übereinstimmung</Text>
          <View style={styles.decorativeLine} />
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Erstellt am:</Text>
            <Text style={styles.infoValue}>{formattedDate}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Analysierte Kriterien:</Text>
            <Text style={styles.infoValue}>{totalCriteria}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Verglichene Länder:</Text>
            <Text style={styles.infoValue}>{totalCountries}</Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Auswanderer-Plattform | auswanderer-plattform.de
        </Text>
      </View>
    </Page>
  )
}

