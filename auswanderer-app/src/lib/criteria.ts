export interface Criterion {
  id: string
  category: CriterionCategory
  name: string
  question: string
  description: string
  followUpQuestions?: FollowUpQuestion[]
}

export interface FollowUpQuestion {
  id: string
  question: string
  type: 'text' | 'select' | 'multiselect'
  options?: string[]
}

export type CriterionCategory =
  | 'financial'
  | 'practical'
  | 'lifestyle'
  | 'security'
  | 'personal'
  | 'special'
  | 'social'
  | 'career'
  | 'family'
  | 'real_estate'

export const CRITERIA: Criterion[] = [
  // FINANCIAL (4)
  {
    id: 'living_costs',
    category: 'financial',
    name: 'Lebenshaltungskosten',
    question: 'Wie wichtig ist es dir, dass die Lebenshaltungskosten in deinem Zielland zu deinem Budget passen?',
    description: 'Vergleich der monatlichen Kosten für Wohnen, Essen, Transport etc.',
    followUpQuestions: [
      {
        id: 'budget',
        question: 'Wie hoch ist dein monatliches Haushaltsbudget (ohne Miete)?',
        type: 'select',
        options: ['Unter 2.000 EUR', '2.000 - 3.500 EUR', '3.500 - 5.000 EUR', 'Über 5.000 EUR'],
      },
    ],
  },
  {
    id: 'income_source',
    category: 'financial',
    name: 'Einkommensquelle',
    question: 'Wie wichtig ist es, dass du deine aktuelle Einkommensquelle im Zielland fortführen kannst?',
    description: 'Remote Work, lokaler Job, Selbständigkeit oder Rente.',
    followUpQuestions: [
      {
        id: 'income_type',
        question: 'Was ist deine primäre Einkommensquelle?',
        type: 'select',
        options: ['Remote Work', 'Vor-Ort-Job suchen', 'Selbständig', 'Rente', 'Vermögen'],
      },
    ],
  },
  {
    id: 'taxes',
    category: 'financial',
    name: 'Steuer-Situation',
    question: 'Wie wichtig ist eine günstige Steuer-Situation im Zielland?',
    description: 'Einkommenssteuer, Kapitalertragssteuer, Doppelbesteuerung.',
  },
  {
    id: 'money_transfer',
    category: 'financial',
    name: 'Vermögens-Transfer',
    question: 'Wie wichtig ist es, Geld einfach ins Zielland transferieren zu können?',
    description: 'Bankkonten, Überweisungen, Kapitalverkehrskontrollen.',
  },

  // PRACTICAL (6)
  {
    id: 'visa',
    category: 'practical',
    name: 'Visa-Machbarkeit',
    question: 'Wie wichtig ist ein einfacher Visa-Prozess für dich?',
    description: 'Aufenthaltsgenehmigung, Arbeitserlaubnis, Bürokratie.',
    followUpQuestions: [
      {
        id: 'citizenship',
        question: 'Hast du EU-Bürgerschaft?',
        type: 'select',
        options: ['Ja, EU-Bürger', 'Nein, andere Staatsangehörigkeit'],
      },
    ],
  },
  {
    id: 'language',
    category: 'practical',
    name: 'Sprachbarriere',
    question: 'Wie wichtig ist es, dass du mit Englisch (oder Deutsch) im Alltag durchkommst?',
    description: 'Verbreitung von Englisch, Notwendigkeit die Landessprache zu lernen.',
    followUpQuestions: [
      {
        id: 'languages',
        question: 'Welche Sprachen sprichst du fließend?',
        type: 'multiselect',
        options: ['Deutsch', 'Englisch', 'Spanisch', 'Französisch', 'Andere'],
      },
    ],
  },
  {
    id: 'healthcare',
    category: 'practical',
    name: 'Gesundheits- & Sozialsystem',
    question: 'Wie wichtig ist ein gutes Gesundheitssystem und soziale Absicherung?',
    description: 'Qualität der Versorgung, Zugang für Ausländer, Altersvorsorge.',
  },
  {
    id: 'bureaucracy',
    category: 'practical',
    name: 'Bürokratie-Level',
    question: 'Wie wichtig ist wenig Bürokratie im Alltag?',
    description: 'Behördengänge, digitale Verwaltung, Effizienz.',
  },
  {
    id: 'return_option',
    category: 'practical',
    name: 'Rückkehr-Option (Plan B)',
    question: 'Wie wichtig ist es, dass du einfach nach Deutschland zurückkehren könntest?',
    description: 'Nähe zur Heimat, Flugverbindungen, rechtliche Optionen.',
  },
  {
    id: 'citizenship_path',
    category: 'practical',
    name: 'Aufenthalt → Staatsbürgerschaft',
    question: 'Wie wichtig ist ein Pfad zur permanenten Aufenthaltserlaubnis oder Staatsbürgerschaft?',
    description: 'Langfristige Perspektive, Einbürgerungsmöglichkeiten.',
  },

  // LIFESTYLE (4)
  {
    id: 'climate',
    category: 'lifestyle',
    name: 'Klima-Präferenz',
    question: 'Wie wichtig ist dein bevorzugtes Klima?',
    description: 'Sonnenstunden, Temperaturen, Jahreszeiten.',
    followUpQuestions: [
      {
        id: 'climate_pref',
        question: 'Welches Klima bevorzugst du?',
        type: 'select',
        options: ['Warm ganzjährig', '4 Jahreszeiten', 'Mild', 'Egal'],
      },
    ],
  },
  {
    id: 'culture',
    category: 'lifestyle',
    name: 'Kultur-Kompatibilität',
    question: 'Wie wichtig ist kulturelle Ähnlichkeit zu deiner Heimat?',
    description: 'Westliche Werte, Lebensart, Essgewohnheiten.',
  },
  {
    id: 'expat_community',
    category: 'lifestyle',
    name: 'Expat-Community',
    question: 'Wie wichtig ist eine bestehende deutschsprachige oder internationale Expat-Community?',
    description: 'Deutsche Vereine, internationale Schulen, Netzwerke.',
  },
  {
    id: 'nature',
    category: 'lifestyle',
    name: 'Naturzugang',
    question: 'Wie wichtig ist Zugang zu Natur (Berge, Meer, Wälder)?',
    description: 'Outdoor-Aktivitäten, Landschaft, Erholungsgebiete.',
    followUpQuestions: [
      {
        id: 'nature_pref',
        question: 'Welche Naturform bevorzugst du?',
        type: 'select',
        options: ['Meer', 'Berge', 'Wald/Seen', 'Egal'],
      },
    ],
  },

  // SECURITY (2)
  {
    id: 'safety',
    category: 'security',
    name: 'Sicherheit',
    question: 'Wie wichtig ist niedrige Kriminalität im Zielland?',
    description: 'Gewaltverbrechen, Diebstahl, persönliche Sicherheit.',
  },
  {
    id: 'geopolitics',
    category: 'security',
    name: 'Geopolitik & Kriegssicherheit',
    question: 'Wie wichtig ist geopolitische Stabilität und Sicherheit vor Konflikten?',
    description: 'Neutralität, Entfernung zu Krisenherden, NATO-Mitgliedschaft.',
  },

  // PERSONAL (5)
  {
    id: 'family',
    category: 'personal',
    name: 'Familien-Situation',
    question: 'Wie wichtig ist Familienfreundlichkeit im Zielland?',
    description: 'Kinderbetreuung, Schulen, Partner-Karriere.',
  },
  {
    id: 'distance_home',
    category: 'personal',
    name: 'Entfernung zur Heimat',
    question: 'Wie wichtig ist die Nähe zu Deutschland für Besuche?',
    description: 'Flugzeit, Direktverbindungen, Kosten.',
  },
  {
    id: 'internet',
    category: 'personal',
    name: 'Internet-Qualität',
    question: 'Wie wichtig ist schnelles, stabiles Internet?',
    description: 'Für Remote Worker besonders relevant.',
  },
  {
    id: 'infrastructure',
    category: 'personal',
    name: 'Infrastruktur',
    question: 'Wie wichtig ist eine gute Infrastruktur (Straßen, ÖPNV, Flughäfen)?',
    description: 'Verkehrsanbindung, öffentlicher Nahverkehr, Flugverbindungen.',
    followUpQuestions: [
      {
        id: 'transport_mode',
        question: 'Hast du ein Auto oder bist du auf ÖPNV angewiesen?',
        type: 'select',
        options: ['Eigenes Auto', 'ÖPNV', 'Beides', 'Fahrrad/Zu Fuß'],
      },
    ],
  },
  {
    id: 'urgency',
    category: 'personal',
    name: 'Dringlichkeit (Schnell-Modus)',
    question: 'Wie schnell möchtest/musst du auswandern?',
    description: 'Zeitrahmen für die Umsetzung.',
  },
  {
    id: 'timezone',
    category: 'personal',
    name: 'Zeitzone',
    question: 'Wie wichtig ist eine kompatible Zeitzone (z.B. für Remote-Arbeit mit EU)?',
    description: 'Für Zusammenarbeit mit europäischen Teams.',
  },

  // SPECIAL (1)
  {
    id: 'pets',
    category: 'special',
    name: 'Haustier-Freundlichkeit',
    question: 'Hast du Haustiere die mit dir umziehen?',
    description: 'Einreisebestimmungen, Quarantäne, Tierfreundlichkeit.',
  },

  // SOCIAL (1)
  {
    id: 'community',
    category: 'social',
    name: 'Social Community',
    question: 'Wie wichtig ist eine bestehende Community deiner Religion oder Vereinigung?',
    description: 'Religionsgemeinschaften, Vereine, Hobby-Gruppen.',
  },

  // CAREER (1)
  {
    id: 'job_market',
    category: 'career',
    name: 'Arbeitsmarkt & Selbständigkeit',
    question: 'Wie wichtig ist ein guter Arbeitsmarkt oder Gründerfreundlichkeit?',
    description: 'Job-Chancen, Freelancer-Regelungen, Unternehmertum.',
  },

  // FAMILY+ (2)
  {
    id: 'education',
    category: 'family',
    name: 'Kinder & Bildung',
    question: 'Wie wichtig ist Qualität der Schulen und Kinderbetreuung?',
    description: 'Schulsystem, internationale Schulen, Universitäten.',
  },
  {
    id: 'quality_of_life',
    category: 'family',
    name: 'Lebensqualität & Lebenserwartung',
    question: 'Wie wichtig ist allgemein hohe Lebensqualität?',
    description: 'HDI, Lebenserwartung, allgemeines Wohlbefinden.',
  },

  // REAL ESTATE (1)
  {
    id: 'real_estate_market',
    category: 'real_estate',
    name: 'Immobilienmarkt & Grundstückskauf',
    question: 'Wie wichtig ist es, dass du Immobilien/Grundstücke im Zielland kaufen kannst?',
    description: 'Möglichkeiten für Ausländer zum Erwerb von Eigentum, Marktpreise, Beschränkungen.',
    followUpQuestions: [
      {
        id: 'purchase_intent',
        question: 'Planst du, eine Immobilie oder ein Grundstück zu kaufen?',
        type: 'select',
        options: ['Ja, definitiv', 'Vielleicht, wenn es passt', 'Nein, ich möchte mieten'],
      },
    ],
  },
]

export const CATEGORY_LABELS: Record<CriterionCategory, string> = {
  financial: 'Finanziell',
  practical: 'Praktisch',
  lifestyle: 'Lifestyle',
  security: 'Sicherheit',
  personal: 'Persönlich',
  special: 'Spezial',
  social: 'Sozial',
  career: 'Karriere',
  family: 'Familie+',
  real_estate: 'Immobilien',
}

export const CATEGORY_ICONS: Record<CriterionCategory, string> = {
  financial: '💰',
  practical: '📋',
  lifestyle: '🌴',
  security: '🛡️',
  personal: '👤',
  special: '🐾',
  social: '🤝',
  career: '💼',
  family: '👶',
  real_estate: '🏠',
}

// Pre-Analysis Questions (asked before rating criteria)
export interface PreAnalysisQuestion {
  id: string
  question: string
  type: 'text' | 'multiselect'
  placeholder?: string
  options?: string[]
  optional: boolean
}

export const PRE_ANALYSIS_QUESTIONS: PreAnalysisQuestion[] = [
  {
    id: 'countries_of_interest',
    question: 'Welche Länder interessieren dich bereits?',
    type: 'multiselect',
    options: [
      'Portugal', 'Spanien', 'Italien', 'Griechenland', 'Zypern',
      'Schweiz', 'Österreich', 'Niederlande', 'Schweden', 'Norwegen',
      'Thailand', 'Bali/Indonesien', 'Japan', 'Australien', 'Neuseeland',
      'USA', 'Kanada', 'Mexiko', 'Costa Rica', 'Uruguay',
      'UAE/Dubai', 'Andere', 'Ich bin offen für alles'
    ],
    optional: true,
  },
  {
    id: 'special_wishes',
    question: 'Gibt es noch etwas, das dir besonders wichtig ist?',
    type: 'text',
    placeholder: 'z.B. Gute Surfmöglichkeiten, vegane Restaurants, Golf-Plätze...',
    optional: true,
  },
]

