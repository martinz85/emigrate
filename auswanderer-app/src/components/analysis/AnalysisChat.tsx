'use client'

import { useState } from 'react'
import { ProgressBar } from './ProgressBar'
import { RatingButtons } from './RatingButtons'
import { ChatMessage } from './ChatMessage'

interface Message {
  id: string
  role: 'ai' | 'user'
  content: string
  timestamp: Date
}

interface CriterionQuestion {
  id: string
  category: string
  question: string
  followUpQuestions?: string[]
}

const CRITERIA: CriterionQuestion[] = [
  {
    id: 'living_costs',
    category: 'Finanziell',
    question: 'Wie wichtig ist es dir, dass die Lebenshaltungskosten in deinem Zielland zu deinem Budget passen?',
    followUpQuestions: ['Wie hoch ist dein monatliches Haushaltsbudget (ohne Miete)?'],
  },
  {
    id: 'income_source',
    category: 'Finanziell',
    question: 'Wie wichtig ist es, dass du deine aktuelle Einkommensquelle im Zielland fortführen kannst?',
    followUpQuestions: ['Was ist deine primäre Einkommensquelle?'],
  },
  {
    id: 'taxes',
    category: 'Finanziell',
    question: 'Wie wichtig ist eine günstige Steuer-Situation im Zielland?',
  },
  {
    id: 'visa',
    category: 'Praktisch',
    question: 'Wie wichtig ist ein einfacher Visa-Prozess für dich?',
    followUpQuestions: ['Hast du EU-Bürgerschaft?'],
  },
  {
    id: 'language',
    category: 'Praktisch',
    question: 'Wie wichtig ist es, dass du mit Englisch (oder Deutsch) im Alltag durchkommst?',
  },
  {
    id: 'healthcare',
    category: 'Praktisch',
    question: 'Wie wichtig ist ein gutes Gesundheitssystem und soziale Absicherung?',
  },
  {
    id: 'climate',
    category: 'Lifestyle',
    question: 'Wie wichtig ist dein bevorzugtes Klima?',
    followUpQuestions: ['Welches Klima bevorzugst du?'],
  },
  {
    id: 'safety',
    category: 'Sicherheit',
    question: 'Wie wichtig ist niedrige Kriminalität im Zielland?',
  },
  {
    id: 'geopolitics',
    category: 'Sicherheit',
    question: 'Wie wichtig ist geopolitische Stabilität und Sicherheit vor Konflikten?',
  },
  // Add more criteria as needed...
]

export function AnalysisChat() {
  const [currentCriterionIndex, setCurrentCriterionIndex] = useState(0)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'ai',
      content: `Hallo! 👋 Ich bin dein Auswanderungs-Berater.

Lass uns gemeinsam herausfinden, welches Land perfekt zu dir passt. Ich werde dir Fragen zu 26 verschiedenen Kriterien stellen – das dauert etwa 10-15 Minuten.

**Erste Frage:**
${CRITERIA[0].question}`,
      timestamp: new Date(),
    },
  ])
  const [ratings, setRatings] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(false)

  const currentCriterion = CRITERIA[currentCriterionIndex]
  const progress = (currentCriterionIndex / CRITERIA.length) * 100
  const isComplete = currentCriterionIndex >= CRITERIA.length

  const handleRating = (rating: number) => {
    const criterion = currentCriterion
    
    // Save rating
    setRatings(prev => ({ ...prev, [criterion.id]: rating }))
    
    // Add user message
    const ratingLabels: Record<number, string> = {
      1: 'egal',
      2: 'weniger wichtig',
      3: 'mittel wichtig',
      4: 'wichtig',
      5: 'sehr wichtig',
    }
    
    setMessages(prev => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        role: 'user',
        content: `${rating} - ${ratingLabels[rating]}`,
        timestamp: new Date(),
      },
    ])

    setIsLoading(true)

    // Simulate AI response delay
    setTimeout(() => {
      const nextIndex = currentCriterionIndex + 1
      
      if (nextIndex < CRITERIA.length) {
        const nextCriterion = CRITERIA[nextIndex]
        setMessages(prev => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            role: 'ai',
            content: `Verstanden! ${criterion.question.includes('Lebenshaltungskosten') ? 'Niedrige Lebenshaltungskosten' : 'Das'} ist dir ${ratingLabels[rating]}.

**Nächste Frage (${nextIndex + 1}/${CRITERIA.length}):**
*Kategorie: ${nextCriterion.category}*

${nextCriterion.question}`,
            timestamp: new Date(),
          },
        ])
        setCurrentCriterionIndex(nextIndex)
      } else {
        // Analysis complete
        setMessages(prev => [
          ...prev,
          {
            id: `ai-complete-${Date.now()}`,
            role: 'ai',
            content: `🎉 **Fantastisch! Deine Analyse ist fertig!**

Ich habe alle deine Kriterien analysiert und basierend auf deinen Präferenzen dein persönliches Länder-Ranking erstellt.

**Dein Top-3:**
🥇 **Portugal** - 92% Match
🥈 **Spanien** - 87% Match  
🥉 **Zypern** - 81% Match

[Vollständige Analyse anzeigen →]`,
            timestamp: new Date(),
          },
        ])
        setCurrentCriterionIndex(nextIndex)
      }
      
      setIsLoading(false)
    }, 800)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="card mb-6">
        <h1 className="font-heading text-2xl font-bold mb-4">
          Deine Auswanderungs-Analyse
        </h1>
        <ProgressBar 
          current={currentCriterionIndex} 
          total={CRITERIA.length} 
          percentage={progress}
        />
      </div>

      {/* Chat Container */}
      <div className="card min-h-[500px] flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-6">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          
          {isLoading && (
            <div className="chat-bubble-ai">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
        </div>

        {/* Rating Input */}
        {!isComplete && !isLoading && (
          <div className="border-t border-slate-200 pt-6">
            <p className="text-sm text-slate-600 mb-4 text-center">
              Wie wichtig? (1 = egal, 5 = sehr wichtig)
            </p>
            <RatingButtons onSelect={handleRating} />
          </div>
        )}

        {/* Complete State */}
        {isComplete && (
          <div className="border-t border-slate-200 pt-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/preview"
                className="btn-cta text-center"
              >
                Kostenlose Vorschau ansehen
              </a>
              <a
                href="/checkout"
                className="btn-secondary text-center"
              >
                Vollständige Analyse kaufen
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Hint */}
      <p className="text-center text-sm text-slate-500 mt-4">
        💡 Du kannst jederzeit Fragen stellen oder Details hinzufügen.
      </p>
    </div>
  )
}

