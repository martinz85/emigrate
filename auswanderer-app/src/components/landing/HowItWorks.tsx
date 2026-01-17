export function HowItWorks() {
  const steps = [
    {
      number: 1,
      title: 'Profil erstellen',
      description: 'Beantworte ein paar grundlegende Fragen zu deiner Situation.',
      icon: '📝',
    },
    {
      number: 2,
      title: 'AI-Chat starten',
      description: 'Unser AI führt dich durch 26 personalisierte Kriterien.',
      icon: '🤖',
    },
    {
      number: 3,
      title: 'Analyse erhalten',
      description: 'Erhalte dein persönliches Länder-Ranking mit Empfehlungen.',
      icon: '📊',
    },
    {
      number: 4,
      title: 'Plan starten',
      description: 'Mit konkreten nächsten Schritten deinen Traum verwirklichen.',
      icon: '🚀',
    },
  ]

  return (
    <section id="so-funktionierts" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="section-title mb-4">So funktioniert&apos;s</h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            In nur 4 einfachen Schritten zu deinem perfekten Auswanderungsland
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[60%] w-full h-0.5 bg-gradient-to-r from-primary-500 to-primary-200" />
              )}
              
              <div className="card-hover text-center relative z-10">
                {/* Step number */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {step.number}
                </div>
                
                {/* Icon */}
                <div className="text-5xl mb-4 pt-4">{step.icon}</div>
                
                {/* Content */}
                <h3 className="font-heading font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-slate-600 text-sm">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

