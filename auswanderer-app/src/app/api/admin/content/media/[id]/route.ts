import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Assignment schema validation
const assignmentSchema = z.object({
  usage_section: z.enum(['hero', 'loading_screen']).nullable(),
})

// ============================================
// PATCH /api/admin/content/media/[id] - Update media (section assignment)
// ============================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const mediaId = params.id

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

    const body = await request.json()
    const validation = assignmentSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({
        error: 'Validation error',
        details: validation.error.errors
      }, { status: 400 })
    }

    const { usage_section } = validation.data

    // Get current media record for audit logging
    const { data: currentMedia, error: fetchError } = await supabase
      .from('site_media')
      .select('*')
      .eq('id', mediaId)
      .single()

    if (fetchError || !currentMedia) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 })
    }

    // Update the media record
    const { data: updatedMedia, error: updateError } = await supabase
      .from('site_media')
      .update({
        usage_section: usage_section,
        // Trigger will handle deactivating other media in same section
      })
      .eq('id', mediaId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating media:', updateError)
      return NextResponse.json({ error: 'Failed to update media' }, { status: 500 })
    }

    // Log audit event (non-blocking)
    try {
      await supabase.from('audit_logs').insert([{
        user_id: user.id,
        action: 'update',
        table_name: 'site_media',
        record_id: mediaId,
        old_values: {
          usage_section: currentMedia.usage_section
        },
        new_values: {
          usage_section: updatedMedia.usage_section
        },
        metadata: {
          section_change: `${currentMedia.usage_section || 'unassigned'} → ${updatedMedia.usage_section || 'unassigned'}`
        }
      }])
    } catch (auditError) {
      console.error('Audit logging failed (non-critical):', auditError)
    }

    return NextResponse.json({
      success: true,
      media: updatedMedia,
      message: 'Media erfolgreich aktualisiert'
    })

  } catch (error) {
    console.error('Error in PATCH /api/admin/content/media/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ============================================
// DELETE /api/admin/content/media/[id] - Delete media file
// ============================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const mediaId = params.id

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

    // Get media record before deletion
    const { data: media, error: fetchError } = await supabase
      .from('site_media')
      .select('*')
      .eq('id', mediaId)
      .single()

    if (fetchError || !media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 })
    }

    // Delete from storage first
    const { error: storageError } = await supabase.storage
      .from('site-media')
      .remove([media.file_path])

    if (storageError) {
      console.error('Error deleting from storage:', storageError)
      // Continue with DB deletion even if storage deletion fails
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('site_media')
      .delete()
      .eq('id', mediaId)

    if (dbError) {
      console.error('Error deleting from database:', dbError)
      return NextResponse.json({ error: 'Failed to delete media' }, { status: 500 })
    }

    // Log audit event (non-blocking)
    try {
      await supabase.from('audit_logs').insert([{
        user_id: user.id,
        action: 'delete',
        table_name: 'site_media',
        record_id: mediaId,
        old_values: media,
        new_values: null,
        metadata: {
          file_path: media.file_path,
          file_type: media.file_type,
          file_size: media.file_size
        }
      }])
    } catch (auditError) {
      console.error('Audit logging failed (non-critical):', auditError)
    }

    return NextResponse.json({
      success: true,
      message: 'Media erfolgreich gelöscht'
    })

  } catch (error) {
    console.error('Error in DELETE /api/admin/content/media/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
