'use client'

import { useState, useCallback, useRef } from 'react'
import { Upload, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { MEDIA_SIZE_LIMITS, SUPPORTED_MIME_TYPES, formatFileSize } from '@/types/media'

interface MediaUploadProps {
  onSuccess?: () => void
}

export function MediaUpload({ onSuccess }: MediaUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [usageSection, setUsageSection] = useState<'hero' | 'loading_screen' | ''>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle drag events
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [])

  // Handle file selection
  const handleFileSelect = (file: File) => {
    // Validate file type
    if (!SUPPORTED_MIME_TYPES.includes(file.type as any)) {
      setUploadStatus('error')
      setErrorMessage(`Nicht unterstützter Dateityp: ${file.type}`)
      return
    }

    // Basic size check (detailed validation happens on server)
    const maxSize = file.type === 'video/mp4' ? MEDIA_SIZE_LIMITS.video :
                   file.type === 'image/gif' ? MEDIA_SIZE_LIMITS.gif :
                   MEDIA_SIZE_LIMITS.image

    if (file.size > maxSize) {
      setUploadStatus('error')
      setErrorMessage(`Datei zu groß: ${formatFileSize(file.size)} (Maximum: ${formatFileSize(maxSize)})`)
      return
    }

    setSelectedFile(file)
    setUploadStatus('idle')
    setErrorMessage('')
  }

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  // Upload file
  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    setUploadProgress(0)
    setUploadStatus('idle')

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      if (usageSection) {
        formData.append('usage_section', usageSection)
      }

      // Simulate progress (in a real app, you'd use XMLHttpRequest for actual progress)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const response = await fetch('/api/admin/content/media/upload', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (response.ok) {
        const result = await response.json()
        setUploadStatus('success')
        setSelectedFile(null)
        setUsageSection('')

        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }

        // Call success callback
        onSuccess?.()
      } else {
        const error = await response.json()
        setUploadStatus('error')
        setErrorMessage(error.error || 'Upload fehlgeschlagen')
      }
    } catch (error) {
      console.error('Upload error:', error)
      setUploadStatus('error')
      setErrorMessage('Netzwerkfehler beim Upload')
    } finally {
      setUploading(false)
    }
  }

  // Clear selection
  const handleClear = () => {
    setSelectedFile(null)
    setUploadStatus('idle')
    setErrorMessage('')
    setUsageSection('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragOver
            ? 'border-primary-500 bg-primary-50'
            : selectedFile
              ? 'border-green-500 bg-green-50'
              : 'border-slate-300 hover:border-slate-400'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/mp4"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {selectedFile ? (
          <div className="space-y-2">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
            <div>
              <p className="font-medium text-slate-900">{selectedFile.name}</p>
              <p className="text-sm text-slate-600">{formatFileSize(selectedFile.size)}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className={`w-12 h-12 mx-auto ${isDragOver ? 'text-primary-500' : 'text-slate-400'}`} />
            <div>
              <p className="font-medium text-slate-900">
                {isDragOver ? 'Datei hier ablegen' : 'Datei auswählen oder hier ablegen'}
              </p>
              <p className="text-sm text-slate-600">
                GIF, MP4 oder Bilder (max. 20MB)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Section Assignment */}
      {selectedFile && (
        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Optional: Section zuweisen
            </label>
            <select
              value={usageSection}
              onChange={(e) => setUsageSection(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Nicht zuweisen</option>
              <option value="hero">Hero Section</option>
              <option value="loading_screen">Loading Screen</option>
            </select>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-primary-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Status Messages */}
      {uploadStatus === 'success' && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <span className="text-sm text-green-800">Datei erfolgreich hochgeladen!</span>
        </div>
      )}

      {uploadStatus === 'error' && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-sm text-red-800">{errorMessage}</span>
        </div>
      )}

      {/* Action Buttons */}
      {selectedFile && !uploading && (
        <div className="flex gap-3">
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="btn-primary flex items-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Hochladen
              </>
            )}
          </button>
          <button
            onClick={handleClear}
            disabled={uploading}
            className="btn-secondary flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Abbrechen
          </button>
        </div>
      )}
    </div>
  )
}
