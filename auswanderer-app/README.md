# Auswanderer-Plattform

Eine SEO-optimierte, mobile-fähige Web-Applikation, die Menschen bei ihrer Auswanderungsentscheidung mit einem AI-gestützten Assistenten unterstützt.

## 🚀 Features

- **AI-Assistent**: Analysiert 26 personalisierte Kriterien für die Länderempfehlung
- **PDF-Generierung**: Erstellt personalisierte Analyse-Reports
- **Freemium-Modell**: Kostenlose 2-Seiten-Vorschau
- **PRO-Subscription**: 14,99€/Monat für unbegrenzten Zugang
- **E-Books**: 4 digitale Bücher zum Thema Auswandern

## 🛠 Tech Stack

- **Frontend/Backend**: Next.js 14 mit App Router
- **Styling**: Tailwind CSS
- **AI**: Claude API (Anthropic)
- **Payment**: Stripe
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Vercel

## 📦 Installation

```bash
# Abhängigkeiten installieren
npm install

# Development Server starten
npm run dev

# Produktions-Build
npm run build
```

## ⚙️ Konfiguration

1. Kopiere `.env.example` zu `.env.local`
2. Füge deine API-Keys ein:
   - Anthropic API Key (Claude)
   - Stripe Secret Key
   - Supabase URL und Keys

## 📁 Projektstruktur

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── analyse/           # AI-Chat Interface
│   ├── checkout/          # Payment Flow
│   └── page.tsx           # Landing Page
├── components/
│   ├── analysis/          # Chat-Komponenten
│   ├── landing/           # Landing Page Sektionen
│   └── layout/            # Header, Footer
└── lib/
    ├── criteria.ts        # 26 Kriterien Definition
    └── utils.ts           # Hilfsfunktionen
```

## 🎯 26 Kriterien-Kategorien

1. **Finanziell** (4): Kosten, Einkommen, Steuern, Transfer
2. **Praktisch** (6): Visa, Sprache, Gesundheit, Bürokratie, Rückkehr, Staatsbürgerschaft
3. **Lifestyle** (4): Klima, Kultur, Expat-Community, Natur
4. **Sicherheit** (2): Kriminalität, Geopolitik
5. **Persönlich** (5): Familie, Entfernung, Internet, Dringlichkeit, Zeitzone
6. **Spezial** (1): Haustiere
7. **Sozial** (1): Community
8. **Karriere** (1): Arbeitsmarkt
9. **Familie+** (2): Bildung, Lebensqualität

## 💰 Monetarisierung

| Produkt | Preis |
|---------|-------|
| PDF-Analyse | 39 EUR (einmalig) |
| E-Book Komplett | 19,99 EUR |
| E-Book Kurz | 9,99 EUR |
| E-Book Tips | 14,99 EUR |
| E-Book Dummies | 12,99 EUR |
| E-Book Bundle | 39,99 EUR |
| PRO Abo | 14,99 EUR/Monat |

## 📝 Lizenz

Proprietär - Alle Rechte vorbehalten.

## 👤 Gründer

Martin - 2x ausgewandert (Polen → Deutschland → Schweden)

