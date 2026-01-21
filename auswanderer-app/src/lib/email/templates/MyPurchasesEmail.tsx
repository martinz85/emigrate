/**
 * My Purchases Email Template
 * 
 * Sent when a guest user requests access to their purchased content.
 * Includes a magic link to view and download all purchases.
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

export interface MyPurchasesEmailProps {
  customerEmail: string
  accessUrl: string
  analysesCount: number
  ebooksCount: number
  expiresIn: string
}

export function MyPurchasesEmail({
  customerEmail,
  accessUrl,
  analysesCount,
  ebooksCount,
  expiresIn,
}: MyPurchasesEmailProps) {
  const totalItems = analysesCount + ebooksCount
  const previewText = `Hier ist dein Zugriff auf deine ${totalItems} gekauften Produkte`
  
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
            Deine Käufe 📦
          </Heading>
          
          {/* Greeting */}
          <Text style={styles.text}>
            Hallo,
          </Text>
          
          <Text style={styles.text}>
            du hast Zugriff auf deine Käufe bei der Auswanderer-Plattform angefordert. 
            Hier ist dein persönlicher Zugangs-Link:
          </Text>

          {/* Purchase Summary */}
          <Section style={styles.highlightBox}>
            <Text style={{ ...styles.highlightText, marginBottom: '12px' }}>
              <strong>Deine Käufe:</strong>
            </Text>
            {analysesCount > 0 && (
              <Text style={{ ...styles.highlightText, fontSize: '16px', marginBottom: '4px' }}>
                📊 {analysesCount} {analysesCount === 1 ? 'Analyse' : 'Analysen'}
              </Text>
            )}
            {ebooksCount > 0 && (
              <Text style={{ ...styles.highlightText, fontSize: '16px' }}>
                📚 {ebooksCount} {ebooksCount === 1 ? 'E-Book' : 'E-Books'}
              </Text>
            )}
          </Section>

          {/* CTA Button */}
          <Section style={{ textAlign: 'center', margin: '32px 0' }}>
            <Button
              href={accessUrl}
              style={styles.button}
            >
              Meine Käufe anzeigen
            </Button>
          </Section>

          {/* Security Info */}
          <Section style={styles.infoBox}>
            <Text style={styles.infoText}>
              🔒 <strong>Sicherheitshinweis:</strong>
            </Text>
            <Text style={{ ...styles.infoText, marginTop: '8px' }}>
              • Dieser Link ist nur für <strong>{expiresIn}</strong> gültig<br/>
              • Du kannst ihn mehrfach verwenden<br/>
              • Teile den Link nicht mit anderen
            </Text>
          </Section>

          <Hr style={styles.hr} />

          {/* Additional Help */}
          <Text style={styles.textSmall}>
            <strong>Tipp:</strong> Erstelle einen kostenlosen Account, um dauerhaft 
            auf alle deine Käufe zuzugreifen und zusätzliche Features zu nutzen!
          </Text>

          {/* Manual Link */}
          <Text style={styles.textSmall}>
            Falls der Button nicht funktioniert, kopiere diesen Link in deinen Browser:
          </Text>
          <Text style={{ ...styles.textSmall, wordBreak: 'break-all' }}>
            <Link href={accessUrl} style={styles.link}>
              {accessUrl}
            </Link>
          </Text>

          <Hr style={styles.hr} />

          {/* Footer */}
          <Text style={styles.footer}>
            Diese E-Mail wurde an {customerEmail} gesendet, weil du Zugriff 
            auf deine Käufe angefordert hast.
          </Text>
          
          <Text style={styles.footer}>
            Du hast diese E-Mail nicht angefordert? Ignoriere sie einfach.
          </Text>

          <Text style={{ ...styles.footer, marginTop: '24px' }}>
            © 2026 Auswanderer-Plattform<br />
            <Link href="https://auswanderer-plattform.de/datenschutz" style={styles.link}>
              Datenschutz
            </Link>
            {' • '}
            <Link href="https://auswanderer-plattform.de/impressum" style={styles.link}>
              Impressum
            </Link>
            {' • '}
            <Link href="https://auswanderer-plattform.de/kontakt" style={styles.link}>
              Support
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

// Default export for preview
export default MyPurchasesEmail

