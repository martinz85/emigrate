import { z } from 'zod'

// Supported media types
export type MediaType = 'image' | 'gif' | 'video'
export type MediaSection = 'hero' | 'loading_screen' | null

// Site Media Interface
export interface SiteMedia {
  id: string
  file_path: string
  file_type: MediaType
  mime_type: string
  file_size: number
  usage_section: MediaSection
  is_active: boolean
  metadata?: Record<string, any>
  uploaded_at: string
  uploaded_by?: string
}

// Media upload request
export interface MediaUploadRequest {
  file: File
  usage_section?: MediaSection
}

// Media assignment update
export interface MediaAssignmentUpdate {
  usage_section: MediaSection
}

// Media file validation info
export interface MediaFileInfo {
  file: File
  file_type: MediaType
  mime_type: string
  file_size: number
  is_valid: boolean
  validation_errors: string[]
}

// File size limits in bytes
export const MEDIA_SIZE_LIMITS = {
  image: 5 * 1024 * 1024, // 5MB
  gif: 10 * 1024 * 1024,  // 10MB
  video: 20 * 1024 * 1024 // 20MB
} as const

// Supported MIME types
export const SUPPORTED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4'
] as const

// Magic bytes for file type validation
export const MAGIC_BYTES = {
  'image/gif': [0x47, 0x49, 0x46], // GIF
  'video/mp4': [0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70], // MP4
  'image/jpeg': [0xFF, 0xD8, 0xFF], // JPEG
  'image/png': [0x89, 0x50, 0x4E, 0x47], // PNG
  'image/webp': [0x52, 0x49, 0x46, 0x46] // WebP (partial)
} as const

// Zod validation schemas
export const siteMediaSchema = z.object({
  id: z.string().uuid(),
  file_path: z.string(),
  file_type: z.enum(['image', 'gif', 'video']),
  mime_type: z.string(),
  file_size: z.number().int().positive(),
  usage_section: z.enum(['hero', 'loading_screen']).nullable(),
  is_active: z.boolean(),
  metadata: z.record(z.any()).optional(),
  uploaded_at: z.string(),
  uploaded_by: z.string().optional(),
})

export const mediaUploadSchema = z.object({
  file: z.instanceof(File),
  usage_section: z.enum(['hero', 'loading_screen']).optional(),
})

export const mediaAssignmentSchema = z.object({
  usage_section: z.enum(['hero', 'loading_screen']).nullable(),
})

// Type guards
export const isImageMedia = (media: SiteMedia): boolean => {
  return media.file_type === 'image'
}

export const isGifMedia = (media: SiteMedia): boolean => {
  return media.file_type === 'gif'
}

export const isVideoMedia = (media: SiteMedia): boolean => {
  return media.file_type === 'video'
}

export const isActiveMedia = (media: SiteMedia): boolean => {
  return media.is_active === true
}

export const isAssignedMedia = (media: SiteMedia): boolean => {
  return media.usage_section !== null
}

// Utility functions
export const getMediaSizeLimit = (fileType: MediaType): number => {
  return MEDIA_SIZE_LIMITS[fileType]
}

export const getMediaTypeFromMime = (mimeType: string): MediaType | null => {
  switch (mimeType) {
    case 'image/gif':
      return 'gif'
    case 'video/mp4':
      return 'video'
    case 'image/jpeg':
    case 'image/png':
    case 'image/webp':
      return 'image'
    default:
      return null
  }
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const getMediaUrl = (filePath: string): string => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL environment variable is not set')
  }
  return `${supabaseUrl}/storage/v1/object/public/site-media/${filePath}`
}

// Validation helpers
export const validateFileType = (file: File): { isValid: boolean; fileType: MediaType | null; errors: string[] } => {
  const errors: string[] = []

  if (!SUPPORTED_MIME_TYPES.includes(file.type as any)) {
    errors.push(`Nicht unterstützter Dateityp: ${file.type}`)
    return { isValid: false, fileType: null, errors }
  }

  const fileType = getMediaTypeFromMime(file.type)
  if (!fileType) {
    errors.push(`Unbekannter Dateityp: ${file.type}`)
    return { isValid: false, fileType: null, errors }
  }

  return { isValid: true, fileType, errors: [] }
}

export const validateFileSize = (file: File, fileType: MediaType): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  const sizeLimit = getMediaSizeLimit(fileType)

  if (file.size > sizeLimit) {
    const limitFormatted = formatFileSize(sizeLimit)
    const fileFormatted = formatFileSize(file.size)
    errors.push(`Datei zu groß: ${fileFormatted} (Maximum: ${limitFormatted})`)
    return { isValid: false, errors }
  }

  return { isValid: true, errors: [] }
}

export const validateMagicBytes = async (file: File, expectedMimeType: string): Promise<{ isValid: boolean; errors: string[] }> => {
  const errors: string[] = []

  try {
    const buffer = await file.slice(0, 12).arrayBuffer()
    const bytes = new Uint8Array(buffer)
    const expectedBytes = MAGIC_BYTES[expectedMimeType as keyof typeof MAGIC_BYTES]

    if (!expectedBytes) {
      errors.push('Magic bytes validation nicht verfügbar für diesen Typ')
      return { isValid: false, errors }
    }

    // Check if file starts with expected magic bytes
    const matches = expectedBytes.every((byte, index) => bytes[index] === byte)

    if (!matches) {
      errors.push('Datei-Header stimmt nicht mit erwartetem Format überein')
      return { isValid: false, errors }
    }

    return { isValid: true, errors: [] }
  } catch (error) {
    errors.push('Fehler bei der Dateivalidierung')
    return { isValid: false, errors }
  }
}
