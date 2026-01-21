'use client'

import { useState } from 'react'

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [
    {
      question: 'Wie funktioniert die AI-Analyse?',
      answer: 'Unser AI-Assistent stellt dir Fragen zu deinen persönlichen Prioritäten. Du gibst an, wie wichtig dir verschiedene Kriterien sind (1-5), und beantwortest Kontextfragen. Basierend auf deinen Antworten erstellen wir ein individuelles Länder-Ranking mit Empfehlungen.',
    },
    {
      question: 'Welche Länder werden analysiert?',
      answer: 'Wir analysieren über 50 beliebte Auswanderungsländer weltweit, darunter alle EU-Länder, Schweiz, UK, USA, Kanada, Australien, Neuseeland, Thailand, und viele mehr. Die Empfehlung basiert auf deinem persönlichen Profil.',
    },
    {
      question: 'Ist die Vorschau wirklich kostenlos?',
      answer: 'Ja! Du kannst die komplette AI-Analyse durchführen und erhältst eine kostenlose 2-Seiten-Vorschau mit deinem Top-3-Ranking. Für die vollständige Analyse mit Detailmatrix und Empfehlungen gibt es die Kauf-Option.',
    },
    {
      question: 'Was ist im PRO-Abo enthalten?',
      answer: 'PRO-Mitglieder erhalten unbegrenzten Zugang zu allen AI-Analysen, allen PDFs, allen 4 E-Books, dem Projekt-Dashboard mit Checklisten und Timeline, sowie Tools wie Länder-Vergleich, Visa-Navigator und Kosten-Rechner.',
    },
    {
      question: 'Kann ich das PRO-Abo kündigen?',
      answer: 'Ja, du kannst jederzeit kündigen. Es gibt keine Mindestlaufzeit. Nach der Kündigung hast du bis zum Ende der bezahlten Periode Zugang zu allen PRO-Features.',
    },
    {
      question: 'Ist das eine Rechts- oder Steuerberatung?',
      answer: 'Nein. Unsere Plattform bietet Orientierungshilfe und Informationen basierend auf öffentlich verfügbaren Daten. Für verbindliche Auskünfte zu Visa, Steuern oder rechtlichen Fragen solltest du einen Fachexperten konsultieren.',
    },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="section-title mb-4">Häufige Fragen</h2>
          <p className="text-xl text-slate-600">
            Alles was du wissen musst
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-slate-200 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <span className="font-semibold pr-4">{faq.question}</span>
                <span
                  className={`transform transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                >
                  ▼
                </span>
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4 text-slate-600">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

