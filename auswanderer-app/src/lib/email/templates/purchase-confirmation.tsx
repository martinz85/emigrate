/**
 * Purchase Confirmation Email Template
 * 
 * Sent after successful Stripe payment.
 * Includes analysis result summary and download links.
 */

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import { styles } from './base-styles'

export interface PurchaseConfirmationProps {
  customerName?: string
  customerEmail: string
  analysisId: string
  topCountry: string
  matchPercentage: number
  purchaseDate: string
  amount: string
  resultUrl: string
}

export function PurchaseConfirmationEmail({
  customerName,
  customerEmail,
  analysisId,
  topCountry,
  matchPercentage,
  purchaseDate,
  amount,
  resultUrl,
}: PurchaseConfirmationProps) {
  const previewText = `Deine Auswanderer-Analyse ist bereit - ${topCountry} mit ${matchPercentage}% Match!`
  
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={styles.main}>
        <Container style={styles.container}>
          {/* Logo */}
          <Section style={styles.logo}>
            <Text style={styles.logoText}>🌍 Auswanderer-Plattform</Text>
          </Section>

          {/* Header */}
          <Heading style={styles.h1}>
            Deine Analyse ist bereit! 🎉
          </Heading>
          
          {/* Greeting */}
          <Text style={styles.text}>
            Hallo {customerName || 'Auswanderer'},
          </Text>
          
          <Text style={styles.text}>
            vielen Dank für deinen Kauf! Deine persönliche Auswanderer-Analyse 
            ist jetzt vollständig freigeschaltet.
          </Text>

          {/* Result Highlight */}
          <Section style={styles.highlightBox}>
            <Text style={styles.highlightText}>
              🏆 Dein Top-Match: <strong>{topCountry}</strong>
            </Text>
            <Text style={{ ...styles.highlightText, fontSize: '24px', marginTop: '8px' }}>
              {matchPercentage}% Übereinstimmung
            </Text>
          </Section>

          {/* CTA Button */}
          <Section style={{ textAlign: 'center' }}>
            <Button style={styles.button} href={resultUrl}>
              Vollständiges Ergebnis ansehen
            </Button>
          </Section>

          <Text style={styles.text}>
            Auf der Ergebnisseite findest du:
          </Text>
          <Text style={styles.text}>
            ✅ Detaillierte Analyse für alle 5 Top-Länder<br />
            ✅ Personalisierte Empfehlungen<br />
            ✅ PDF-Download für deine Unterlagen
          </Text>

          <Hr style={styles.divider} />

          {/* Purchase Details */}
          <Section style={styles.details}>
            <Text style={styles.detailText}>
              <strong>Kaufdetails:</strong><br />
              Datum: {purchaseDate}<br />
              Betrag: {amount}<br />
              E-Mail: {customerEmail}<br />
              Analyse-ID: {analysisId.substring(0, 8)}...
            </Text>
          </Section>

          <Hr style={styles.divider} />

          {/* Footer */}
          <Text style={styles.footer}>
            Bei Fragen erreichst du uns unter{' '}
            <Link href="mailto:support@auswanderer-plattform.de" style={styles.link}>
              support@auswanderer-plattform.de
            </Link>
          </Text>
          
          <Text style={styles.footer}>
            © {new Date().getFullYear()} Auswanderer-Plattform. Alle Rechte vorbehalten.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

// Default export for @react-email preview
export default PurchaseConfirmationEmail

