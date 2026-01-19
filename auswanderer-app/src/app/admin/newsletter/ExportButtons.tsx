'use client'

import { useState } from 'react'

export function ExportButtons() {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async (format: 'csv' | 'json') => {
    setIsExporting(true)
    
    try {
      const res = await fetch(`/api/admin/newsletter/export?format=${format}`)
      
      if (!res.ok) throw new Error('Export fehlgeschlagen')
      
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `newsletter-export-${new Date().toISOString().split('T')[0]}.${format}`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      alert('Export fehlgeschlagen')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleExport('csv')}
        disabled={isExporting}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
      >
        <span>📄</span>
        <span>CSV exportieren</span>
      </button>
      
      <button
        onClick={() => handleExport('json')}
        disabled={isExporting}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
      >
        <span>📋</span>
        <span>JSON exportieren</span>
      </button>
    </div>
  )
}

