/**
 * E-Book Purchase Confirmation Email
 * Story 7.3: E-Book Download
 * 
 * Sent after successful e-book purchase with download link.
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

interface EbookPurchaseConfirmationEmailProps {
  customerName?: string
  customerEmail: string
  ebookTitle: string
  ebookEmoji?: string
  isBundle?: boolean
  purchaseDate: string
  amount: string
  downloadUrl: string
  dashboardUrl: string
}

export function EbookPurchaseConfirmationEmail({
  customerName,
  customerEmail,
  ebookTitle,
  ebookEmoji = '📚',
  isBundle = false,
  purchaseDate,
  amount,
  downloadUrl,
  dashboardUrl,
}: EbookPurchaseConfirmationEmailProps) {
  const greeting = customerName ? `Hallo ${customerName}` : 'Hallo'
  const previewText = isBundle 
    ? 'Dein E-Book Bundle ist bereit zum Download!'
    : `Dein E-Book "${ebookTitle}" ist bereit!`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={styles.main}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={styles.logo}>
            <Text style={styles.logoText}>🌍 Auswanderer-Plattform</Text>
          </Section>

          {/* Main Content */}
          <Heading style={styles.h1}>
            {ebookEmoji} {isBundle ? 'Bundle gekauft!' : 'E-Book gekauft!'}
          </Heading>

          <Text style={styles.text}>
            {greeting},
          </Text>

          <Text style={styles.text}>
            vielen Dank für deinen Kauf! 
            {isBundle 
              ? ' Du hast jetzt Zugang zu allen E-Books im Bundle.'
              : ` Dein E-Book "${ebookTitle}" ist bereit zum Download.`
            }
          </Text>

          {/* E-Book Info Box */}
          <Section style={styles.highlightBox}>
            <Text style={styles.highlightText}>
              {ebookEmoji} {ebookTitle}
            </Text>
            <Text style={styles.smallText}>
              Gekauft am {purchaseDate} • {amount}
            </Text>
          </Section>

          {/* Download Button */}
          <Section style={{ textAlign: 'center', marginTop: '24px' }}>
            <Button style={styles.button} href={downloadUrl}>
              📥 E-Book herunterladen
            </Button>
          </Section>

          <Text style={{ ...styles.smallText, textAlign: 'center' as const }}>
            Der Download-Link ist 7 Tage gültig. Du kannst dein E-Book 
            jederzeit über dein Dashboard erneut herunterladen.
          </Text>

          <Hr style={styles.divider} />

          {/* Dashboard Link */}
          <Text style={styles.text}>
            Alle deine E-Books findest du in deinem Dashboard:
          </Text>

          <Section style={{ textAlign: 'center', marginTop: '16px' }}>
            <Button style={styles.buttonSecondary} href={dashboardUrl}>
              📚 Meine E-Books
            </Button>
          </Section>

          <Hr style={styles.divider} />

          {/* Help Section */}
          <Text style={styles.smallText}>
            Bei Fragen zum Download oder anderen Anliegen erreichst du uns unter{' '}
            <Link href="mailto:support@auswanderer-plattform.de" style={styles.link}>
              support@auswanderer-plattform.de
            </Link>
          </Text>

          <Text style={styles.text}>
            Viel Erfolg bei deinem Auswanderer-Abenteuer! 🚀
          </Text>

          <Text style={styles.text}>
            Dein Auswanderer-Plattform Team
          </Text>

          {/* Footer */}
          <Section style={styles.footer}>
            <Text>
              © 2026 Auswanderer-Plattform. Alle Rechte vorbehalten.
            </Text>
            <Text>
              Diese E-Mail wurde an {customerEmail} gesendet.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default EbookPurchaseConfirmationEmail
