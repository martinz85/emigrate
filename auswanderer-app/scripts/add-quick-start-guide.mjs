#!/usr/bin/env node
/**
 * Add Quick Start Guide E-Book to Database
 * 
 * Usage:
 *   cd auswanderer-app
 *   node scripts/add-quick-start-guide.mjs
 * 
 * Prerequisites:
 *   - Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in environment
 *   - PDF file exists at: public/Images/auswandern-quick-start-guide.pdf
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

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
// E-Book Data
// ============================================

const QUICK_START_EBOOK = {
  slug: 'quick-start-guide',
  title: 'Auswandern Quick Start Guide',
  subtitle: 'Der schnelle Einstieg',
  description: 'Alles Wichtige auf einen Blick - perfekt für den schnellen Start in dein Auswanderer-Abenteuer.',
  long_description: `Der Quick Start Guide ist dein kompakter Begleiter für den perfekten Einstieg ins Auswandern.

Hier findest du alle wichtigen Informationen komprimiert und auf den Punkt gebracht:
- Die wichtigsten Schritte im Überblick
- Checklisten für jede Phase
- Häufige Fehler und wie du sie vermeidest
- Praktische Tipps von erfahrenen Auswanderern

Ideal für alle, die schnell durchstarten wollen ohne sich in Details zu verlieren.`,
  price: 999, // 9,99 EUR
  pages: 85,
  reading_time: '2-3 Stunden',
  chapters: [
    'Auswandern - Ja oder Nein?',
    'Die 10 wichtigsten Entscheidungskriterien',
    'Länderauswahl leicht gemacht',
    'Visum & Aufenthaltsgenehmigung',
    'Finanzcheck: Was kostet Auswandern?',
    'Der Umzug: Schritt für Schritt',
    'Ankommen: Die ersten Wochen',
    'Häufige Fehler vermeiden',
  ],
  features: [
    'Kompakte 85 Seiten',
    'Praktische Checklisten',
    'Entscheidungshilfen',
    'Häufige Fehler & Lösungen',
    'Sofort umsetzbare Tipps',
  ],
  color: 'from-cyan-500 to-blue-500',
  emoji: '🚀',
  is_bundle: false,
  is_active: true,
  sort_order: 5, // Nach den anderen E-Books
}

const PDF_FILE_PATH = join(__dirname, '..', 'public', 'Images', 'auswandern-quick-start-guide.pdf')
const STORAGE_PATH = 'quick-start-guide.pdf'

// ============================================
// Main Function
// ============================================

async function addQuickStartGuide() {
  console.log('🚀 Adding Quick Start Guide E-Book...\n')

  // Step 1: Check if PDF exists locally
  if (!existsSync(PDF_FILE_PATH)) {
    console.error(`❌ PDF file not found at: ${PDF_FILE_PATH}`)
    console.log('   Please make sure the file exists.')
    process.exit(1)
  }
  console.log(`✅ PDF file found: ${PDF_FILE_PATH}`)

  // Step 2: Check if ebook already exists
  const { data: existing } = await supabase
    .from('ebooks')
    .select('slug, id')
    .eq('slug', QUICK_START_EBOOK.slug)
    .single()

  if (existing) {
    console.log(`⚠️  E-Book '${QUICK_START_EBOOK.slug}' already exists (ID: ${existing.id})`)
    console.log('   Updating existing entry...')
    
    // Update existing entry
    const { data: updated, error: updateError } = await supabase
      .from('ebooks')
      .update(QUICK_START_EBOOK)
      .eq('id', existing.id)
      .select()
      .single()

    if (updateError) {
      console.error('❌ Error updating ebook:', updateError.message)
      process.exit(1)
    }
    
    console.log(`✅ ${QUICK_START_EBOOK.emoji} ${QUICK_START_EBOOK.title} updated!`)
  } else {
    // Insert new entry
    const { data: inserted, error: insertError } = await supabase
      .from('ebooks')
      .insert(QUICK_START_EBOOK)
      .select()
      .single()

    if (insertError) {
      console.error('❌ Error inserting ebook:', insertError.message)
      process.exit(1)
    }
    
    console.log(`✅ ${QUICK_START_EBOOK.emoji} ${QUICK_START_EBOOK.title} inserted!`)
  }

  // Step 3: Upload PDF to Supabase Storage
  console.log('\n📤 Uploading PDF to Supabase Storage...')
  
  // Check if file already exists in storage
  const { data: existingFile } = await supabase.storage
    .from('ebooks')
    .list('', {
      search: STORAGE_PATH
    })

  if (existingFile && existingFile.length > 0) {
    console.log('   File already exists in storage, removing old version...')
    await supabase.storage
      .from('ebooks')
      .remove([STORAGE_PATH])
  }

  // Read PDF file
  const pdfBuffer = readFileSync(PDF_FILE_PATH)
  
  // Upload to storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('ebooks')
    .upload(STORAGE_PATH, pdfBuffer, {
      contentType: 'application/pdf',
      upsert: true,
    })

  if (uploadError) {
    console.error('❌ Error uploading PDF:', uploadError.message)
    console.log('\n⚠️  Manual upload required:')
    console.log('   1. Go to Supabase Storage: https://supabase.com/dashboard/project/hkktofxvgrxfkaixcowm/storage/buckets/ebooks')
    console.log(`   2. Upload: ${PDF_FILE_PATH}`)
    console.log(`   3. As: ${STORAGE_PATH}`)
  } else {
    console.log(`✅ PDF uploaded: ${STORAGE_PATH}`)
    
    // Step 4: Update ebook with PDF path
    const { error: pathUpdateError } = await supabase
      .from('ebooks')
      .update({ pdf_path: STORAGE_PATH })
      .eq('slug', QUICK_START_EBOOK.slug)

    if (pathUpdateError) {
      console.error('❌ Error updating PDF path:', pathUpdateError.message)
    } else {
      console.log('✅ PDF path updated in database')
    }
  }

  // Summary
  console.log('\n✨ Quick Start Guide E-Book successfully added!')
  console.log('\n📝 Next steps:')
  console.log('   1. Visit https://auswanderer-plattform.de/ebooks to see the new E-Book')
  console.log('   2. As admin, you can edit it at /admin/ebooks')
  console.log('   3. Stripe product will be created when you first save with a price')
  console.log('\n💡 The E-Book is now available for purchase!')
}

// Run
addQuickStartGuide().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})

