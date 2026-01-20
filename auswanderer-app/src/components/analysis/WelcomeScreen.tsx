'use client'

interface WelcomeScreenProps {
  onStart: () => void
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-12">
      {/* Welcome Icon */}
      <div className="relative mb-8">
        <span className="text-8xl">🌍</span>
        <div className="absolute -bottom-2 -right-2 bg-primary-500 text-white rounded-full p-2 text-2xl">
          🤖
        </div>
      </div>

      {/* Title */}
      <h1 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 mb-4 text-center">
        Finde dein Traumland
      </h1>

      {/* Description */}
      <p className="text-lg text-slate-600 text-center max-w-lg mb-8">
        Beantworte <strong>28 Fragen</strong> zu deinen Präferenzen und unsere AI findet
        die Länder, die perfekt zu dir passen.
      </p>

      {/* Time Estimate */}
      <div className="flex items-center gap-6 mb-10 text-slate-500">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⏱️</span>
          <span>10-15 Minuten</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl">✨</span>
          <span>100% kostenlos</span>
        </div>
      </div>

      {/* CTA Button */}
      <button 
        onClick={onStart} 
        className="btn-cta text-xl px-10 py-5"
        data-testid="analysis-welcome-start-button"
      >
        Los geht&apos;s! 🚀
      </button>

      {/* Features */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 max-w-2xl">
        <div className="text-center">
          <div className="text-3xl mb-2">🎯</div>
          <h3 className="font-medium text-slate-900">Personalisiert</h3>
          <p className="text-sm text-slate-500">Basierend auf deinen Werten</p>
        </div>
        <div className="text-center">
          <div className="text-3xl mb-2">🔒</div>
          <h3 className="font-medium text-slate-900">Anonym</h3>
          <p className="text-sm text-slate-500">Keine Registrierung nötig</p>
        </div>
        <div className="text-center">
          <div className="text-3xl mb-2">🤖</div>
          <h3 className="font-medium text-slate-900">AI-Powered</h3>
          <p className="text-sm text-slate-500">Claude AI analysiert</p>
        </div>
      </div>
    </div>
  )
}

