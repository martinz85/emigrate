import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import {
  validateFileType,
  validateFileSize,
  validateMagicBytes,
  MEDIA_SIZE_LIMITS,
  MAGIC_BYTES,
  type MediaType
} from '@/types/media'

// Upload schema validation
const uploadSchema = z.object({
  usage_section: z.enum(['hero', 'loading_screen']).optional(),
})

// ============================================
// Helper: Sanitize filename for security
// ============================================

function sanitizeFilename(filename: string): string {
  // Remove path separators and dangerous characters
  const sanitized = filename
    .replace(/[/\\:*?"<>|]/g, '_') // Replace dangerous chars
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .toLowerCase()

  // Limit length and ensure it has an extension
  const maxLength = 100
  if (sanitized.length > maxLength) {
    const extIndex = sanitized.lastIndexOf('.')
    if (extIndex > 0) {
      const ext = sanitized.substring(extIndex)
      const name = sanitized.substring(0, extIndex)
      return name.substring(0, maxLength - ext.length) + ext
    }
    return sanitized.substring(0, maxLength)
  }

  return sanitized
}

// ============================================
// Helper: Generate unique filename
// ============================================

function generateUniqueFilename(originalName: string): string {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
  const sanitized = sanitizeFilename(originalName)
  const extIndex = sanitized.lastIndexOf('.')
  const name = extIndex > 0 ? sanitized.substring(0, extIndex) : sanitized
  const ext = extIndex > 0 ? sanitized.substring(extIndex) : ''

  return `site-media/${name}_${timestamp}${ext}`
}

// ============================================
// POST /api/admin/content/media/upload - Upload media file
// ============================================

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify admin access using is_admin() function
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use is_admin() function for consistent admin checking
    const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin')
    if (adminError || !isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Parse multipart form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const usageSectionRaw = formData.get('usage_section') as string

    if (!file) {
      return NextResponse.json({ error: 'Keine Datei hochgeladen' }, { status: 400 })
    }

    // Validate usage_section if provided
    let usageSection = null
    if (usageSectionRaw) {
      const validation = uploadSchema.safeParse({ usage_section: usageSectionRaw })
      if (!validation.success) {
        return NextResponse.json({
          error: 'Ungültige Section',
          details: validation.error.errors
        }, { status: 400 })
      }
      usageSection = validation.data.usage_section
    }

    // Step 1: Validate file type
    const typeValidation = validateFileType(file)
    if (!typeValidation.isValid) {
      return NextResponse.json({
        error: 'Nicht unterstützter Dateityp',
        details: typeValidation.errors
      }, { status: 400 })
    }

    const fileType = typeValidation.fileType!

    // Step 2: Validate file size
    const sizeValidation = validateFileSize(file, fileType)
    if (!sizeValidation.isValid) {
      return NextResponse.json({
        error: 'Datei zu groß',
        details: sizeValidation.errors
      }, { status: 400 })
    }

    // Step 3: Validate magic bytes (security check)
    const magicValidation = await validateMagicBytes(file, file.type)
    if (!magicValidation.isValid) {
      return NextResponse.json({
        error: 'Datei-Header ungültig',
        details: magicValidation.errors
      }, { status: 400 })
    }

    // Step 4: Generate unique filename and upload path
    const uniqueFilename = generateUniqueFilename(file.name)

    // Step 5: Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('site-media')
      .upload(uniqueFilename, file, {
        contentType: file.type,
        upsert: false // Don't overwrite existing files
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json({
        error: 'Upload fehlgeschlagen',
        details: [uploadError.message]
      }, { status: 500 })
    }

    // Step 6: Create database entry
    const { data: mediaEntry, error: dbError } = await supabase
      .from('site_media')
      .insert([{
        file_path: uniqueFilename,
        file_type: fileType,
        mime_type: file.type,
        file_size: file.size,
        usage_section: usageSection,
        uploaded_by: user.id,
        metadata: {
          original_name: file.name,
          uploaded_at: new Date().toISOString()
        }
      }])
      .select()
      .single()

    if (dbError) {
      // Try to clean up uploaded file if DB insert fails
      await supabase.storage
        .from('site-media')
        .remove([uniqueFilename])

      console.error('Database insert error:', dbError)
      return NextResponse.json({
        error: 'Datenbank-Fehler beim Speichern',
        details: [dbError.message]
      }, { status: 500 })
    }

    // Step 7: Log audit event (non-blocking)
    try {
      await supabase.from('audit_logs').insert([{
        user_id: user.id,
        action: 'create',
        table_name: 'site_media',
        record_id: mediaEntry.id,
        old_values: null,
        new_values: mediaEntry,
        metadata: {
          file_type: fileType,
          file_size: file.size,
          usage_section: usageSection
        }
      }])
    } catch (auditError) {
      console.error('Audit logging failed (non-critical):', auditError)
    }

    return NextResponse.json({
      success: true,
      media: mediaEntry,
      message: 'Datei erfolgreich hochgeladen'
    })

  } catch (error) {
    console.error('Unexpected error in media upload:', error)
    return NextResponse.json({
      error: 'Unerwarteter Fehler beim Upload',
      details: ['Bitte versuchen Sie es erneut']
    }, { status: 500 })
  }
}
