// ============================================
// Loading State für Admin Questions
// Zeigt Skeleton während Daten geladen werden
// ============================================

export default function QuestionsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-48 bg-slate-200 rounded-lg mb-2"></div>
          <div className="h-4 w-64 bg-slate-100 rounded"></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-32 bg-slate-200 rounded-lg"></div>
          <div className="h-10 w-36 bg-emerald-200 rounded-lg"></div>
        </div>
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-slate-200 p-6"
          >
            <div className="h-4 w-20 bg-slate-100 rounded mb-2"></div>
            <div className="h-8 w-12 bg-slate-200 rounded"></div>
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {/* Filter Bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <div className="h-8 w-40 bg-slate-200 rounded"></div>
        </div>

        {/* Table Header */}
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
          <div className="flex items-center gap-4">
            <div className="h-4 w-8 bg-slate-200 rounded"></div>
            <div className="h-4 w-16 bg-slate-200 rounded"></div>
            <div className="h-4 w-48 bg-slate-200 rounded flex-1"></div>
            <div className="h-4 w-24 bg-slate-200 rounded"></div>
            <div className="h-4 w-16 bg-slate-200 rounded"></div>
            <div className="h-4 w-16 bg-slate-200 rounded"></div>
          </div>
        </div>

        {/* Table Rows */}
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="border-b border-slate-100 px-4 py-4 flex items-center gap-4"
          >
            <div className="h-4 w-4 bg-slate-100 rounded"></div>
            <div className="h-4 w-8 bg-slate-100 rounded"></div>
            <div className="h-4 bg-slate-100 rounded flex-1"></div>
            <div className="h-6 w-20 bg-slate-100 rounded-full"></div>
            <div className="h-4 w-16 bg-slate-100 rounded"></div>
            <div className="h-6 w-12 bg-slate-100 rounded-full"></div>
          </div>
        ))}

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <div className="h-4 w-32 bg-slate-200 rounded"></div>
        </div>
      </div>
    </div>
  )
}

