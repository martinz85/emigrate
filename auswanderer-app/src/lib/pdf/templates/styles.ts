import { StyleSheet } from '@react-pdf/renderer'

// Brand colors
export const PDF_COLORS = {
  primary: '#0f766e',      // Teal-700
  primaryLight: '#14b8a6', // Teal-500
  secondary: '#f59e0b',    // Amber-500
  secondaryLight: '#fbbf24', // Amber-400
  text: '#1e293b',         // Slate-800
  textLight: '#64748b',    // Slate-500
  textMuted: '#94a3b8',    // Slate-400
  background: '#f8fafc',   // Slate-50
  white: '#ffffff',
  border: '#e2e8f0',       // Slate-200
  success: '#22c55e',      // Green-500
  warning: '#f59e0b',      // Amber-500
  gold: '#fbbf24',         // Amber-400
  silver: '#9ca3af',       // Gray-400
  bronze: '#d97706',       // Amber-600
}

// Shared styles
export const sharedStyles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
    color: PDF_COLORS.text,
    backgroundColor: PDF_COLORS.white,
  },
  pageNumber: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 10,
    color: PDF_COLORS.textMuted,
  },
  heading1: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold',
    color: PDF_COLORS.primary,
    marginBottom: 10,
  },
  heading2: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold',
    color: PDF_COLORS.text,
    marginBottom: 8,
  },
  heading3: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold',
    color: PDF_COLORS.text,
    marginBottom: 6,
  },
  text: {
    fontSize: 11,
    lineHeight: 1.5,
    color: PDF_COLORS.text,
  },
  textSmall: {
    fontSize: 9,
    color: PDF_COLORS.textLight,
  },
  textMuted: {
    fontSize: 10,
    color: PDF_COLORS.textMuted,
  },
  section: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: PDF_COLORS.background,
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    fontSize: 10,
  },
  divider: {
    height: 1,
    backgroundColor: PDF_COLORS.border,
    marginVertical: 15,
  },
})

