#!/usr/bin/env node
/**
 * Seed Script: Migrate hardcoded E-Books to Database
 * Story 10.8 - E-Book Management (Admin)
 * 
 * Usage:
 *   cd auswanderer-app
 *   node scripts/seed-ebooks.mjs
 * 
 * Prerequisites:
 *   - Run migration 024_ebooks_table.sql first
 *   - Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in environment
 */

import { createClient } from '@supabase/supabase-js'

// ============================================
// Configuration
// ============================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hkktofxvgrxfkaixcowm.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is required')
  console.log('   Set it with: export SUPABASE_SERVICE_ROLE_KEY=your_key')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// ============================================
// E-Book Data (from hardcoded ebooks.ts)
// ============================================

const EBOOKS = [
  {
    slug: 'langversion',
    title: 'Der komplette Auswanderer-Guide',
    subtitle: 'Ausführliche Langversion',
    description: 'Alles was du wissen musst, von der Entscheidung bis zum Ankommen.',
    long_description: `Der ultimative Leitfaden für alle, die ernsthaft über das Auswandern nachdenken. 
    
Dieses E-Book begleitet dich durch jeden Schritt des Prozesses: Von der ersten Idee über die Länderauswahl, Visa-Beantragung, Umzugslogistik bis hin zum erfolgreichen Ankommen in deinem neuen Zuhause.

Basierend auf den Erfahrungen von über 100 erfolgreichen Auswanderern und ständig aktualisiert.`,
    price: 1999,
    pages: 250,
    reading_time: '6-8 Stunden',
    chapters: [
      'Die Entscheidung treffen',
      'Das richtige Land finden',
      'Visa & Aufenthalt',
      'Finanzen & Steuern',
      'Job & Karriere',
      'Wohnung finden',
      'Umzug organisieren',
      'Bürokratie meistern',
      'Ankommen & Integration',
      'Netzwerk aufbauen',
    ],
    features: [
      '25 ausführliche Kapitel',
      'Länderprofile für 20+ Länder',
      'Druckbare Checklisten',
      'Steuer- und Visa-Guide',
    ],
    color: 'from-red-500 to-orange-500',
    emoji: '📕',
    is_bundle: false,
    is_active: true,
    sort_order: 0,
  },
  {
    slug: 'kurzversion',
    title: 'Quick Start Guide',
    subtitle: 'Kurzversion',
    description: 'Die 20% der Informationen, die 80% des Erfolgs ausmachen.',
    long_description: `Für alle, die schnell loslegen wollen. Dieses kompakte E-Book enthält nur das Wesentliche – keine langen Erklärungen, nur klare Handlungsanweisungen.

Perfekt für schnelle Entscheider, die keine Zeit für lange Lektüre haben, aber trotzdem die wichtigsten Fehler vermeiden wollen.`,
    price: 999,
    pages: 80,
    reading_time: '2-3 Stunden',
    chapters: [
      'Die 10 kritischen Schritte',
      'Entscheidungsbäume',
      'Quick-Reference Tabellen',
      'Die 5 größten Fehler',
      'Sofort-Checkliste',
    ],
    features: [
      '10 kritische Schritte',
      'Entscheidungsbäume',
      'Quick-Reference Tabellen',
      'Die 5 größten Fehler',
    ],
    color: 'from-green-500 to-teal-500',
    emoji: '📗',
    is_bundle: false,
    is_active: true,
    sort_order: 1,
  },
  {
    slug: 'tips-tricks',
    title: 'Tips & Tricks',
    subtitle: 'Insider-Wissen',
    description: 'Erprobte Hacks von erfahrenen Expats. Geld sparen, Bürokratie umgehen.',
    long_description: `50+ praktische Hacks, die wir in Jahren des Auswanderns gelernt haben. 

Von cleveren Geld-Spar-Strategien über Bürokratie-Shortcuts bis hin zu Netzwerk-Tipps – dieses E-Book enthält das Insider-Wissen, das du nirgendwo anders findest.`,
    price: 1499,
    pages: 120,
    reading_time: '3-4 Stunden',
    chapters: [
      '20 Geld-Spar-Hacks',
      'Bürokratie-Shortcuts',
      'Wohnungssuche-Tricks',
      'Netzwerk-Strategien',
      'Verhandlungs-Tips',
      'Steuer-Optimierung',
    ],
    features: [
      '50+ praktische Hacks',
      'Geld-Spar-Strategien',
      'Bürokratie-Shortcuts',
      'Netzwerk-Tipps',
    ],
    color: 'from-blue-500 to-indigo-500',
    emoji: '📘',
    is_bundle: false,
    is_active: true,
    sort_order: 2,
  },
  {
    slug: 'dummies',
    title: 'Auswandern für Dummies',
    subtitle: 'Einsteigerfreundlich',
    description: 'Kein Vorwissen nötig. Alles einfach erklärt, Schritt für Schritt.',
    long_description: `Du weißt gar nicht, wo du anfangen sollst? Dieses E-Book ist für absolute Anfänger geschrieben.

Keine Fachbegriffe, keine komplizierten Erklärungen – nur einfache Sprache und klare Schritt-für-Schritt Anleitungen. Wir nehmen dich an die Hand und zeigen dir den Weg.`,
    price: 1299,
    pages: 100,
    reading_time: '2-3 Stunden',
    chapters: [
      'Was bedeutet Auswandern?',
      'Bin ich bereit?',
      'Die ersten Schritte',
      'Häufige Fragen',
      'Checklisten für Anfänger',
    ],
    features: [
      'Einfache Sprache',
      'Schritt-für-Schritt',
      'Häufige Fragen beantwortet',
      'Checklisten für Anfänger',
    ],
    color: 'from-yellow-500 to-amber-500',
    emoji: '📙',
    is_bundle: false,
    is_active: true,
    sort_order: 3,
  },
]

// Bundle (to be created after individual ebooks)
const BUNDLE = {
  slug: 'bundle',
  title: 'Komplett-Paket',
  subtitle: 'Alle 4 E-Books',
  description: 'Alle 4 E-Books zum Sonderpreis. Spare über 30%!',
  long_description: `Das ultimative Paket für alle, die keine Kompromisse machen wollen. 

Enthält alle 4 E-Books:
• Der komplette Auswanderer-Guide (Langversion)
• Quick Start Guide (Kurzversion)
• Tips & Tricks
• Auswandern für Dummies

Einzeln würden diese E-Books 57,96€ kosten – spare mit dem Bundle über 30%!`,
  price: 3999,
  pages: 550,
  reading_time: '15+ Stunden',
  chapters: ['Alle Kapitel aus 4 E-Books'],
  features: [
    'Alle 4 E-Books',
    '550+ Seiten Wissen',
    '33% günstiger',
    'Sofortiger Download',
  ],
  color: 'from-purple-500 to-pink-500',
  emoji: '📚',
  is_bundle: true,
  bundle_items: ['langversion', 'kurzversion', 'tips-tricks', 'dummies'],
  is_active: true,
  sort_order: 4,
}

// ============================================
// Main Seed Function
// ============================================

async function seedEbooks() {
  console.log('🌱 Starting E-Book seed...\n')

  // Check if ebooks already exist
  const { data: existing } = await supabase
    .from('ebooks')
    .select('slug')
    .limit(1)

  if (existing && existing.length > 0) {
    console.log('⚠️  E-Books already exist in database.')
    console.log('   To re-seed, first delete existing entries:')
    console.log('   DELETE FROM ebooks;')
    process.exit(0)
  }

  // Insert individual ebooks
  console.log('📚 Inserting individual E-Books...')
  
  for (const ebook of EBOOKS) {
    const { data, error } = await supabase
      .from('ebooks')
      .insert(ebook)
      .select()
      .single()

    if (error) {
      console.error(`❌ Error inserting ${ebook.slug}:`, error.message)
    } else {
      console.log(`   ✅ ${ebook.emoji} ${ebook.title} (${ebook.slug})`)
    }
  }

  // Insert bundle
  console.log('\n📦 Inserting Bundle...')
  
  const { data: bundleData, error: bundleError } = await supabase
    .from('ebooks')
    .insert(BUNDLE)
    .select()
    .single()

  if (bundleError) {
    console.error('❌ Error inserting bundle:', bundleError.message)
  } else {
    console.log(`   ✅ ${BUNDLE.emoji} ${BUNDLE.title} (${BUNDLE.slug})`)
  }

  // Summary
  console.log('\n✨ Seed complete!')
  console.log(`   ${EBOOKS.length} E-Books + 1 Bundle inserted`)
  console.log('\n📝 Next steps:')
  console.log('   1. Upload PDF files via Admin Dashboard (/admin/ebooks)')
  console.log('   2. Stripe products will be created automatically when you save with a price')
}

// Run
seedEbooks().catch(console.error)

