import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { verifyAdminWrite, getEbooksTable } from '@/lib/admin'
import { logAuditEvent } from '@/lib/audit'
import type { Ebook } from '@/types/ebooks'

// ============================================
// File Validation Constants
// SECURITY: Server-side validation (don't trust client)
// ============================================

const MAX_PDF_SIZE = 50 * 1024 * 1024 // 50 MB
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5 MB

// Allowed MIME types - strict whitelist
const ALLOWED_PDF_TYPES = ['application/pdf']
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

// PDF magic bytes: %PDF-
const PDF_MAGIC_BYTES = [0x25, 0x50, 0x44, 0x46, 0x2D]

// Image magic bytes
const IMAGE_MAGIC_BYTES: Record<string, number[]> = {
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/png': [0x89, 0x50, 0x4E, 0x47],
  'image/webp': [0x52, 0x49, 0x46, 0x46], // RIFF header (WebP)
}

// ============================================
// Helper: Validate file magic bytes
// SECURITY: Don't trust file extension or MIME type from client
// ============================================

function validateMagicBytes(buffer: Uint8Array, expectedType: string): boolean {
  if (expectedType === 'application/pdf') {
    // Check PDF magic bytes: %PDF-
    if (buffer.length < PDF_MAGIC_BYTES.length) return false
    return PDF_MAGIC_BYTES.every((byte, i) => buffer[i] === byte)
  }

  // Check image magic bytes
  const magicBytes = IMAGE_MAGIC_BYTES[expectedType]
  if (!magicBytes) return false
  
  if (buffer.length < magicBytes.length) return false
  return magicBytes.every((byte, i) => buffer[i] === byte)
}

// ============================================
// Helper: Sanitize filename
// SECURITY: Prevent path traversal and injection
// ============================================

function sanitizeFilename(filename: string): string {
  // Remove any path components
  const base = filename.split(/[/\\]/).pop() || 'file'
  // Only allow alphanumeric, dash, underscore, dot
  return base.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 100)
}

// ============================================
// POST: Upload file (PDF or cover image)
// ============================================

export async function POST(request: NextRequest) {
  const { error, status, user } = await verifyAdminWrite()
  if (error || !user) {
    return NextResponse.json({ error }, { status })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const type = formData.get('type') as 'pdf' | 'cover' | null
    const ebookId = formData.get('ebookId') as string | null

    // ============================================
    // Input Validation
    // ============================================

    if (!file) {
      return NextResponse.json({ error: 'Keine Datei hochgeladen' }, { status: 400 })
    }

    if (!type || !['pdf', 'cover'].includes(type)) {
      return NextResponse.json({ error: 'Ungültiger Dateityp. Erlaubt: pdf, cover' }, { status: 400 })
    }

    if (!ebookId) {
      return NextResponse.json({ error: 'E-Book ID fehlt' }, { status: 400 })
    }

    // Validate UUID format to prevent injection
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(ebookId)) {
      return NextResponse.json({ error: 'Ungültige E-Book ID' }, { status: 400 })
    }

    // ============================================
    // SECURITY: Server-side MIME type validation
    // ============================================

    const allowedTypes = type === 'pdf' ? ALLOWED_PDF_TYPES : ALLOWED_IMAGE_TYPES
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: type === 'pdf' 
          ? 'Nur PDF-Dateien erlaubt' 
          : 'Nur JPG, PNG oder WebP erlaubt'
      }, { status: 400 })
    }

    // ============================================
    // SECURITY: Server-side size validation
    // ============================================

    const maxSize = type === 'pdf' ? MAX_PDF_SIZE : MAX_IMAGE_SIZE
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: `Datei zu groß. Max. ${maxSize / 1024 / 1024} MB erlaubt`
      }, { status: 400 })
    }

    if (file.size === 0) {
      return NextResponse.json({ error: 'Datei ist leer' }, { status: 400 })
    }

    // ============================================
    // SECURITY: Magic bytes validation
    // ============================================

    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    if (!validateMagicBytes(buffer, file.type)) {
      console.warn(`Magic bytes validation failed for file ${file.name} with claimed type ${file.type}`)
      return NextResponse.json({ 
        error: 'Dateiformat entspricht nicht dem angegebenen Typ. Bitte lade eine gültige Datei hoch.'
      }, { status: 400 })
    }

    // ============================================
    // Database Validation
    // ============================================

    const supabase = createAdminClient()

    // Verify ebook exists
    const { data: ebook, error: ebookError } = await getEbooksTable(supabase)
      .select('id, pdf_path, cover_path, title')
      .eq('id', ebookId)
      .single() as { data: Pick<Ebook, 'id' | 'pdf_path' | 'cover_path'> & { title: string } | null; error: Error | null }

    if (ebookError || !ebook) {
      return NextResponse.json({ error: 'E-Book nicht gefunden' }, { status: 404 })
    }

    // ============================================
    // File Upload
    // ============================================

    // Generate secure file path
    const extension = type === 'pdf' ? 'pdf' : file.type.split('/')[1]
    const timestamp = Date.now()
    const fileName = type === 'pdf' ? `ebook_${timestamp}.pdf` : `cover_${timestamp}.${extension}`
    const filePath = `${ebookId}/${fileName}`

    // Delete old file if exists
    const oldPath = type === 'pdf' ? ebook.pdf_path : ebook.cover_path
    if (oldPath) {
      const { error: deleteError } = await supabase.storage.from('ebooks').remove([oldPath])
      if (deleteError) {
        console.warn('Failed to delete old file:', deleteError)
        // Continue - old file cleanup is not critical
      }
    }

    // Upload new file
    const { error: uploadError } = await supabase.storage
      .from('ebooks')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false, // Don't overwrite - we're using unique timestamps
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: 'Fehler beim Hochladen' }, { status: 500 })
    }

    // Update ebook with new path
    const updateField = type === 'pdf' ? 'pdf_path' : 'cover_path'
    const { error: updateError } = await getEbooksTable(supabase)
      .update({ [updateField]: filePath })
      .eq('id', ebookId)

    if (updateError) {
      console.error('Update error:', updateError)
      // Try to cleanup uploaded file
      await supabase.storage.from('ebooks').remove([filePath])
      return NextResponse.json({ error: 'Fehler beim Aktualisieren' }, { status: 500 })
    }

    // Get signed URL (private bucket)
    const { data: signedUrlData } = await supabase.storage
      .from('ebooks')
      .createSignedUrl(filePath, 3600) // 1 hour

    // Audit log
    await logAuditEvent({
      action: type === 'pdf' ? 'EBOOK_PDF_UPLOADED' : 'EBOOK_COVER_UPLOADED',
      targetId: ebookId,
      targetType: 'ebook',
      adminId: user.id,
      metadata: { 
        fileName: sanitizeFilename(file.name),
        fileSize: file.size,
        filePath,
        ebookTitle: ebook.title,
      },
    })

    return NextResponse.json({ 
      success: true,
      path: filePath,
      url: signedUrlData?.signedUrl || null,
    })
  } catch (err) {
    console.error('Ebook upload error:', err)
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 })
  }
}
