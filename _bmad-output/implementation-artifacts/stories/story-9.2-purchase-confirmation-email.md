# Story 9.2: Purchase Confirmation Email

## Story
**Als** Käufer
**möchte ich** nach dem Kauf eine Bestätigungs-E-Mail erhalten
**damit** ich einen Nachweis habe und den PDF-Download-Link nicht verliere

## Status
- [x] Story erstellt
- [ ] In Entwicklung
- [ ] Code Review
- [ ] Abgeschlossen

## Akzeptanzkriterien

### AC1: E-Mail Template
- [ ] Professionelles "Kaufbestätigung" Template
- [ ] Enthält: Datum, Betrag, Analyse-ID
- [ ] PDF-Download-Link im E-Mail
- [ ] "Dein Ergebnis ansehen" Button

### AC2: Webhook Integration
- [ ] E-Mail wird nach erfolgreichem Stripe Webhook gesendet
- [ ] Integration in `handleCheckoutCompleted()` Funktion
- [ ] Fehler beim E-Mail-Versand stoppt nicht den Webhook (graceful degradation)

### AC3: E-Mail Inhalt
- [ ] Betreff: "Deine Auswanderer-Analyse ist bereit! 🎉"
- [ ] Persönliche Anrede (wenn Name verfügbar)
- [ ] Top-Land als Teaser erwähnt
- [ ] Link zur Ergebnisseite
- [ ] Link zum PDF-Download
- [ ] Support-Kontakt im Footer

## Technische Details

### E-Mail Template
```typescript
// src/lib/email/templates/purchase-confirmation.tsx
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface PurchaseConfirmationProps {
  customerName?: string
  analysisId: string
  topCountry: string
  matchPercentage: number
  purchaseDate: string
  amount: string
  resultUrl: string
  pdfUrl: string
}

export function PurchaseConfirmationEmail({
  customerName,
  analysisId,
  topCountry,
  matchPercentage,
  purchaseDate,
  amount,
  resultUrl,
  pdfUrl,
}: PurchaseConfirmationProps) {
  return (
    <Html>
      <Head />
      <Preview>Deine Auswanderer-Analyse ist bereit - {topCountry} mit {matchPercentage}% Match!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>
            Deine Analyse ist bereit! 🎉
          </Heading>
          
          <Text style={text}>
            Hallo {customerName || 'Auswanderer'},
          </Text>
          
          <Text style={text}>
            vielen Dank für deinen Kauf! Deine persönliche Auswanderer-Analyse 
            ist jetzt vollständig freigeschaltet.
          </Text>

          <Section style={highlightBox}>
            <Text style={highlightText}>
              Dein Top-Match: <strong>{topCountry}</strong> ({matchPercentage}%)
            </Text>
          </Section>

          <Button style={button} href={resultUrl}>
            Ergebnis ansehen
          </Button>

          <Text style={text}>
            Du kannst deine Analyse auch als PDF herunterladen:
          </Text>

          <Link href={pdfUrl} style={link}>
            PDF herunterladen
          </Link>

          <Section style={details}>
            <Text style={detailText}>
              <strong>Kaufdetails:</strong><br />
              Datum: {purchaseDate}<br />
              Betrag: {amount}<br />
              Analyse-ID: {analysisId}
            </Text>
          </Section>

          <Text style={footer}>
            Bei Fragen erreichst du uns unter support@auswanderer-plattform.de
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
```

### Webhook Integration
```typescript
// In api/webhook/route.ts - handleCheckoutCompleted()

// Nach erfolgreichem DB-Update:
try {
  await sendEmail({
    to: customerEmail,
    subject: 'Deine Auswanderer-Analyse ist bereit! 🎉',
    react: PurchaseConfirmationEmail({
      customerName: customerName,
      analysisId: analysisId,
      topCountry: result.topCountry,
      matchPercentage: result.matchPercentage,
      purchaseDate: new Date().toLocaleDateString('de-DE'),
      amount: '29,99 €',
      resultUrl: `${process.env.NEXT_PUBLIC_APP_URL}/ergebnis/${analysisId}`,
      pdfUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/pdf/${analysisId}`,
    }),
  })
} catch (emailError) {
  // Log but don't fail the webhook
  console.error('Failed to send confirmation email:', emailError)
}
```

## UI/UX Details

### E-Mail Design
- Farben: Primary Green (#10B981), Slate Text
- Logo oben (optional für MVP)
- Responsive für Mobile
- Klare CTA-Buttons

### E-Mail Betreff-Varianten
- Standard: "Deine Auswanderer-Analyse ist bereit! 🎉"
- Alternative: "Willkommen in deiner Auswanderer-Zukunft"

## Abhängigkeiten
- Story 9.1 (Email Service Setup)
- Stripe Webhook funktioniert

## Schätzung
- **Aufwand**: 2-3 Stunden
- **Komplexität**: Mittel

## Notes
- E-Mail-Versand darf Webhook nicht blockieren
- Logging ohne PII in Production
- PDF-Link sollte authentifiziert sein (oder zeitlich begrenzt)

