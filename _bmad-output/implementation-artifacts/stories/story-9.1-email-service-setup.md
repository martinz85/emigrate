# Story 9.1: Email Service Setup

## Story
**Als** Plattform-Betreiber
**möchte ich** einen zuverlässigen E-Mail-Service integrieren
**damit** Transaktions-E-Mails (Kaufbestätigungen, etc.) automatisch versendet werden

## Status
- [x] Story erstellt
- [ ] In Entwicklung
- [ ] Code Review
- [ ] Abgeschlossen

## Akzeptanzkriterien

### AC1: Resend Integration
- [ ] Resend SDK installiert (`resend`)
- [ ] API-Key in Environment Variables konfiguriert
- [ ] E-Mail-Utility in `src/lib/email/` erstellt

### AC2: E-Mail Template System
- [ ] React-basierte E-Mail-Templates mit `@react-email/components`
- [ ] Base-Template mit Branding (Logo, Footer, Farben)
- [ ] TypeScript-Types für E-Mail-Daten

### AC3: Utility Functions
- [ ] `sendEmail()` Funktion mit Error Handling
- [ ] Logging für gesendete E-Mails (ohne PII in Production)
- [ ] Retry-Logic bei Fehlern (optional für MVP)

## Technische Details

### Pakete installieren
```bash
npm install resend @react-email/components
```

### Environment Variables
```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=noreply@auswanderer-plattform.de
```

### Dateistruktur
```
src/lib/email/
├── index.ts          # Barrel export
├── client.ts         # Resend client
├── send.ts           # sendEmail utility
└── templates/
    ├── base.tsx      # Base layout
    └── index.ts      # Template exports
```

### Beispiel: E-Mail Client
```typescript
// src/lib/email/client.ts
import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)
```

### Beispiel: Send Utility
```typescript
// src/lib/email/send.ts
import { resend } from './client'

interface SendEmailOptions {
  to: string
  subject: string
  react: React.ReactElement
}

export async function sendEmail({ to, subject, react }: SendEmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'noreply@example.com',
      to,
      subject,
      react,
    })

    if (error) {
      console.error('Email send error:', error)
      throw error
    }

    console.log(`Email sent to ${to.substring(0, 3)}***`)
    return data
  } catch (err) {
    console.error('Failed to send email:', err)
    throw err
  }
}
```

## Abhängigkeiten
- Resend Account (kostenlos bis 100 E-Mails/Tag)
- Verifizierte Domain (oder Resend Test-Domain für Dev)

## Schätzung
- **Aufwand**: 1-2 Stunden
- **Komplexität**: Niedrig

## Notes
- Resend empfohlen wegen einfacher API und React-E-Mail-Support
- Für DEV: Resend Test-Domain nutzen (keine Domain-Verifizierung nötig)
- API-Key nur für PROD-Umgebung setzen, in DEV optional

