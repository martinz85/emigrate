import { Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { PDF_COLORS, sharedStyles } from './styles'

const styles = StyleSheet.create({
  page: {
    ...sharedStyles.page,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: PDF_COLORS.primary,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 11,
    color: PDF_COLORS.textLight,
  },
  categorySection: {
    marginBottom: 15,
  },
  categoryTitle: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: PDF_COLORS.text,
    backgroundColor: PDF_COLORS.background,
    padding: 8,
    marginBottom: 8,
    borderRadius: 4,
  },
  criterionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: PDF_COLORS.border,
  },
  criterionName: {
    flex: 1,
    fontSize: 10,
    color: PDF_COLORS.text,
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: 3,
  },
  ratingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: PDF_COLORS.border,
  },
  ratingDotFilled: {
    backgroundColor: PDF_COLORS.primary,
    borderColor: PDF_COLORS.primary,
  },
  ratingText: {
    width: 30,
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: PDF_COLORS.textLight,
    textAlign: 'right',
  },
  pageNumber: sharedStyles.pageNumber,
})

interface CriteriaRating {
  id: string
  name: string
  category: string
  rating: number
}

interface CriteriaSectionProps {
  criteria: CriteriaRating[]
  pageNumber: number
}

// Category display names and icons
const CATEGORY_NAMES: Record<string, string> = {
  finances: '💰 Lebenshaltung & Finanzen',
  climate: '☀️ Klima & Umwelt',
  infrastructure: '🏗️ Infrastruktur',
  culture: '🎭 Kultur & Lifestyle',
  healthcare: '🏥 Gesundheitswesen',
  safety: '🛡️ Sicherheit & Recht',
  work: '💼 Arbeit & Wirtschaft',
  nature: '🌿 Natur & Freizeit',
  social: '👥 Soziales Umfeld',
  personal: '🧘 Persönliche Präferenzen',
  special: '⭐ Besondere Wünsche',
}

export function CriteriaSection({ criteria, pageNumber }: CriteriaSectionProps) {
  // Group criteria by category
  const groupedCriteria = criteria.reduce((acc, criterion) => {
    const category = criterion.category || 'other'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(criterion)
    return acc
  }, {} as Record<string, CriteriaRating[]>)

  // Render rating dots
  const renderRating = (rating: number) => {
    const dots = []
    for (let i = 1; i <= 5; i++) {
      dots.push(
        <View
          key={i}
          style={[
            styles.ratingDot,
            i <= rating ? styles.ratingDotFilled : {},
          ]}
        />
      )
    }
    return (
      <View style={styles.ratingContainer}>
        {dots}
        <Text style={styles.ratingText}>{rating}/5</Text>
      </View>
    )
  }

  return (
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Deine Bewertungen</Text>
        <Text style={styles.subtitle}>
          So hast du die {criteria.length} Kriterien bewertet
        </Text>
      </View>

      {/* Criteria by Category */}
      {Object.entries(groupedCriteria).map(([category, items]) => (
        <View key={category} style={styles.categorySection}>
          <Text style={styles.categoryTitle}>
            {CATEGORY_NAMES[category] || category}
          </Text>
          {items.map((criterion) => (
            <View key={criterion.id} style={styles.criterionRow}>
              <Text style={styles.criterionName}>{criterion.name}</Text>
              {renderRating(criterion.rating)}
            </View>
          ))}
        </View>
      ))}

      {/* Page Number */}
      <Text style={styles.pageNumber}>Seite {pageNumber}</Text>
    </Page>
  )
}

