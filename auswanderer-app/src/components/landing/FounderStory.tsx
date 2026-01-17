export function FounderStory() {
  return (
    <section className="py-20 bg-gradient-to-br from-primary-500 to-primary-700 text-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Photo */}
          <div className="relative">
            <div className="aspect-square bg-white/10 rounded-3xl flex items-center justify-center">
              <div className="text-center">
                <span className="text-8xl mb-4 block">👨‍💼</span>
                <p className="text-white/60">Gründer-Foto</p>
              </div>
            </div>
            
            {/* Journey badges */}
            <div className="absolute -bottom-4 -right-4 bg-white text-slate-900 rounded-2xl p-4 shadow-xl">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🇵🇱</span>
                <span className="text-xl">→</span>
                <span className="text-3xl">🇩🇪</span>
                <span className="text-xl">→</span>
                <span className="text-3xl">🇸🇪</span>
              </div>
              <p className="text-xs text-slate-500 mt-2 text-center">2x ausgewandert</p>
            </div>
          </div>

          {/* Story */}
          <div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6">
              Über den Gründer
            </h2>
            
            <div className="space-y-4 text-lg text-white/90">
              <p>
                „Ich bin selbst <strong>zweimal ausgewandert</strong>: Mit 3 Jahren 
                von Polen nach Deutschland, und mit meiner Familie – zwei kleine 
                Kinder im Gepäck – nach Südschweden."
              </p>
              
              <p>
                „Ich kenne <strong>jeden Schritt</strong> des Prozesses: Die 
                Unsicherheit, die Bürokratie, die Fragen nach Finanzen, Jobs, 
                Schulen. Und wie wichtig es ist, eine Community zu finden."
              </p>
              
              <p>
                „Mit dieser Plattform möchte ich mein Wissen teilen und anderen 
                helfen, ihre <strong>Auswanderungsträume</strong> Wirklichkeit 
                werden zu lassen."
              </p>
            </div>
            
            <div className="mt-8">
              <p className="text-xl font-semibold">— Martin</p>
              <p className="text-white/60">Gründer, Auswanderer-Plattform</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

