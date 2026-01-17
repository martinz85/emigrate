interface ChatMessageProps {
  message: {
    id: string
    role: 'ai' | 'user'
    content: string
    timestamp: Date
  }
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isAI = message.role === 'ai'
  
  // Simple markdown-like parsing
  const formatContent = (content: string) => {
    return content
      .split('\n')
      .map((line, i) => {
        // Bold
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Italic
        line = line.replace(/\*(.*?)\*/g, '<em>$1</em>')
        
        return (
          <span 
            key={i} 
            dangerouslySetInnerHTML={{ __html: line }}
            className="block"
          />
        )
      })
  }

  return (
    <div className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}>
      <div className={isAI ? 'chat-bubble-ai' : 'chat-bubble-user'}>
        {isAI && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🤖</span>
            <span className="font-semibold text-sm text-slate-700">AI Assistent</span>
            <span className="text-xs text-slate-400">
              {message.timestamp.toLocaleTimeString('de-DE', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </div>
        )}
        <div className={`${isAI ? 'text-slate-700' : 'text-white'} leading-relaxed`}>
          {formatContent(message.content)}
        </div>
      </div>
    </div>
  )
}

