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
  countryCard: {
    marginBottom: 15,
    borderRadius: 8,
    overflow: 'hidden',
  },
  countryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: PDF_COLORS.background,
  },
  countryHeaderTop: {
    backgroundColor: PDF_COLORS.primary,
  },
  rankBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankBadgeGold: {
    backgroundColor: PDF_COLORS.gold,
  },
  rankBadgeSilver: {
    backgroundColor: PDF_COLORS.silver,
  },
  rankBadgeBronze: {
    backgroundColor: PDF_COLORS.bronze,
  },
  rankBadgeDefault: {
    backgroundColor: PDF_COLORS.textMuted,
  },
  rankNumber: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: PDF_COLORS.white,
  },
  countryName: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: PDF_COLORS.text,
  },
  countryNameTop: {
    color: PDF_COLORS.white,
  },
  percentageBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: PDF_COLORS.white,
  },
  percentageBadgeTop: {
    backgroundColor: PDF_COLORS.secondary,
  },
  percentageText: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: PDF_COLORS.primary,
  },
  percentageTextTop: {
    color: PDF_COLORS.white,
  },
  countryDetails: {
    padding: 12,
    paddingTop: 8,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: PDF_COLORS.border,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  detailSection: {
    marginBottom: 8,
  },
  detailTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: PDF_COLORS.textLight,
    marginBottom: 4,
  },
  detailList: {
    paddingLeft: 10,
  },
  detailItem: {
    fontSize: 10,
    color: PDF_COLORS.text,
    marginBottom: 2,
    lineHeight: 1.4,
  },
  strengthItem: {
    color: '#16a34a', // Green-600
  },
  considerationItem: {
    color: PDF_COLORS.bronze,
  },
  pageNumber: sharedStyles.pageNumber,
})

interface RankingItem {
  rank: number
  country: string
  percentage: number
  strengths?: string[]
  considerations?: string[]
}

interface RankingSectionProps {
  rankings: RankingItem[]
  pageNumber: number
}

export function RankingSection({ rankings, pageNumber }: RankingSectionProps) {
  const getRankBadgeStyle = (rank: number) => {
    switch (rank) {
      case 1: return styles.rankBadgeGold
      case 2: return styles.rankBadgeSilver
      case 3: return styles.rankBadgeBronze
      default: return styles.rankBadgeDefault
    }
  }

  return (
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Dein Länder-Ranking</Text>
        <Text style={styles.subtitle}>
          Die Top {rankings.length} Länder basierend auf deinen Präferenzen
        </Text>
      </View>

      {/* Rankings */}
      {rankings.map((item, index) => {
        const isTop = index === 0
        
        return (
          <View key={item.rank} style={styles.countryCard}>
            {/* Country Header */}
            <View style={[
              styles.countryHeader,
              isTop && styles.countryHeaderTop,
            ]}>
              <View style={[styles.rankBadge, getRankBadgeStyle(item.rank)]}>
                <Text style={styles.rankNumber}>{item.rank}</Text>
              </View>
              <Text style={[
                styles.countryName,
                isTop && styles.countryNameTop,
              ]}>
                {item.country}
              </Text>
              <View style={[
                styles.percentageBadge,
                isTop && styles.percentageBadgeTop,
              ]}>
                <Text style={[
                  styles.percentageText,
                  isTop && styles.percentageTextTop,
                ]}>
                  {item.percentage}%
                </Text>
              </View>
            </View>

            {/* Details for top 3 */}
            {index < 3 && (item.strengths?.length || item.considerations?.length) && (
              <View style={styles.countryDetails}>
                {/* Strengths */}
                {item.strengths && item.strengths.length > 0 && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailTitle}>✓ Stärken</Text>
                    <View style={styles.detailList}>
                      {item.strengths.map((strength, i) => (
                        <Text key={i} style={[styles.detailItem, styles.strengthItem]}>
                          • {strength}
                        </Text>
                      ))}
                    </View>
                  </View>
                )}

                {/* Considerations */}
                {item.considerations && item.considerations.length > 0 && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailTitle}>⚠ Zu beachten</Text>
                    <View style={styles.detailList}>
                      {item.considerations.map((consideration, i) => (
                        <Text key={i} style={[styles.detailItem, styles.considerationItem]}>
                          • {consideration}
                        </Text>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>
        )
      })}

      {/* Page Number */}
      <Text style={styles.pageNumber}>Seite {pageNumber}</Text>
    </Page>
  )
}

