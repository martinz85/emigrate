import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { logAuditEvent } from '@/lib/audit'

// ============================================
// Constants
// ============================================

const BUCKET_NAME = 'question-images'
const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

// ============================================
// POST: Upload question image
// ============================================

export async function POST(request: NextRequest) {
  // Verify admin access
  const supabaseAuth = await createClient()
  const { data: { user } } = await supabaseAuth.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
  }

  const { data: adminUser } = await supabaseAuth
    .from('admin_users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!adminUser) {
    return NextResponse.json({ error: 'Keine Admin-Berechtigung' }, { status: 403 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const questionId = formData.get('questionId') as string | null

    if (!file) {
      return NextResponse.json({ error: 'Keine Datei übermittelt' }, { status: 400 })
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Nur JPG, PNG und WebP Bilder erlaubt' 
      }, { status: 400 })
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: 'Datei zu groß (max. 2MB)' 
      }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Ensure bucket exists (create if not)
    const { data: buckets } = await supabase.storage.listBuckets()
    const bucketExists = buckets?.some(b => b.name === BUCKET_NAME)
    
    if (!bucketExists) {
      console.log('Creating bucket:', BUCKET_NAME)
      const { error: bucketError } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      })
      if (bucketError && !bucketError.message.includes('already exists')) {
        console.error('Bucket creation error:', bucketError)
        return NextResponse.json({ 
          error: `Bucket konnte nicht erstellt werden: ${bucketError.message}` 
        }, { status: 500 })
      }
    }

    // Generate file path
    const ext = file.type.split('/')[1] // jpeg, png, webp
    const timestamp = Date.now()
    const fileName = questionId 
      ? `questions/${questionId}.${ext}`
      : `questions/temp_${timestamp}.${ext}`

    // Delete old file if exists (for question update)
    if (questionId) {
      // Try to delete any existing image for this question
      const { data: existingQuestion } = await supabase
        .from('analysis_questions')
        .select('image_path')
        .eq('id', questionId)
        .single()

      if (existingQuestion?.image_path) {
        await supabase.storage
          .from(BUCKET_NAME)
          .remove([existingQuestion.image_path])
      }
    }

    // Convert file to ArrayBuffer for upload
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true, // Overwrite if exists
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ 
        error: `Fehler beim Hochladen: ${uploadError.message}` 
      }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName)

    // Update question with image path if questionId provided
    if (questionId) {
      const { error: updateError } = await supabase
        .from('analysis_questions')
        .update({ image_path: fileName })
        .eq('id', questionId)

      if (updateError) {
        console.error('Error updating question with image:', updateError)
        // Don't fail - image is uploaded, just link failed
      }
    }

    // Audit log
    await logAuditEvent({
      action: 'QUESTION_IMAGE_UPLOADED',
      targetId: questionId || 'temp',
      targetType: 'analysis_question',
      adminId: user.id,
      metadata: { fileName, fileSize: file.size },
    })

    return NextResponse.json({ 
      success: true,
      path: fileName,
      url: urlData.publicUrl,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 })
  }
}

// ============================================
// DELETE: Remove question image
// ============================================

export async function DELETE(request: NextRequest) {
  // Verify admin access
  const supabaseAuth = await createClient()
  const { data: { user } } = await supabaseAuth.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
  }

  const { data: adminUser } = await supabaseAuth
    .from('admin_users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!adminUser) {
    return NextResponse.json({ error: 'Keine Admin-Berechtigung' }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const questionId = searchParams.get('questionId')

    if (!questionId) {
      return NextResponse.json({ error: 'questionId erforderlich' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Get current image path
    const { data: question } = await supabase
      .from('analysis_questions')
      .select('image_path')
      .eq('id', questionId)
      .single()

    if (!question?.image_path) {
      return NextResponse.json({ error: 'Kein Bild vorhanden' }, { status: 404 })
    }

    // Delete from storage
    const { error: deleteError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([question.image_path])

    if (deleteError) {
      console.error('Delete error:', deleteError)
      // Continue to clear DB reference anyway
    }

    // Clear image_path in database
    await supabase
      .from('analysis_questions')
      .update({ image_path: null })
      .eq('id', questionId)

    // Audit log
    await logAuditEvent({
      action: 'QUESTION_IMAGE_DELETED',
      targetId: questionId,
      targetType: 'analysis_question',
      adminId: user.id,
      metadata: { path: question.image_path },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete image error:', error)
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 })
  }
}

