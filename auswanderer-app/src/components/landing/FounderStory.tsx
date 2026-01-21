export function FounderStory() {
  return (
    <section className="py-20 bg-gradient-to-br from-primary-500 to-primary-700 text-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Story */}
          <div className="max-w-3xl mx-auto">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6">
              Über den Gründer
            </h2>
            
            <div className="space-y-4 text-lg text-white/90">
              <p>
                „Ich bin selbst <strong>zweimal ausgewandert</strong>: Mit 3 Jahren 
                von Polen nach Deutschland, und mit Anfang 30 mit meiner Familie – 
                zwei kleine Kinder im Gepäck – nach Südschweden."
              </p>
              
              <p>
                „Bei der <strong>Auswanderungsplanung</strong> kommen viele Fragen auf."
              </p>
              
              <p>
                „Mit dieser Plattform möchte ich mein Wissen teilen und anderen 
                helfen, ihre <strong>Auswanderungsträume</strong> Wirklichkeit 
                werden zu lassen."
              </p>
            </div>
            
            <div className="mt-8">
              <p className="text-xl font-semibold mb-6">— Martin</p>
              <p className="text-white/60 mb-6">Gründer, Auswanderer-Plattform</p>
              
              {/* Photo */}
              <div className="flex justify-center">
                <div className="w-32 h-32 rounded-2xl overflow-hidden shadow-xl ring-4 ring-white/20">
                  <img 
                    src="/Images/IMG_5003.jpg" 
                    alt="Martin mit Familie in Schweden" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

