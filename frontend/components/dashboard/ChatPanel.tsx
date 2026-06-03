'use client'
import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Loader2, Bot, User, ChevronDown } from 'lucide-react'
import { useYear } from '@/lib/yearContext'

interface Message {
  role: 'user' | 'assistant'
  content: string
  data?: any[]
  sql?: string
}

export default function ChatPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I am Sigzen BI Assistant. Ask me anything about your business data — revenue, clients, employees, projects, and more.'
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSQL, setShowSQL] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { selectedYear } = useYear()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userMessage,
          year: selectedYear,
        }),
      })

      const data = await response.json()

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.answer || 'I could not find an answer for that.',
        data: data.data,
        sql: data.sql,
      }])
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I could not connect to the AI service. Please make sure the backend is running.',
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const suggestedQuestions = [
    "What was total revenue in 2024?",
    "Which clients have highest contract value?",
    "How many projects are delayed?",
    "What is the average NPS score?",
    "Compare revenue across all years",
  ]

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110"
          title="Ask AI Assistant"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-blue-600 text-white">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <div>
                <p className="font-semibold text-sm">Sigzen BI Assistant</p>
                <p className="text-xs text-blue-200">
                  Powered by Vanna AI • Year: {selectedYear}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-blue-700 rounded-lg p-1 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>

                {/* Avatar */}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user'
                    ? 'bg-blue-600'
                    : 'bg-slate-700'
                }`}>
                  {msg.role === 'user'
                    ? <User className="w-4 h-4 text-white" />
                    : <Bot className="w-4 h-4 text-blue-400" />
                  }
                </div>

                {/* Message bubble */}
                <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  <div className={`px-3 py-2 rounded-xl text-sm ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-muted text-foreground rounded-tl-none'
                  }`}>
                    {msg.content}
                  </div>

                  {/* Data table if available */}
                  {msg.data && msg.data.length > 0 && (
                    <div className="w-full overflow-x-auto bg-muted/50 rounded-lg p-2 text-xs">
                      <table className="w-full">
                        <thead>
                          <tr>
                            {Object.keys(msg.data[0]).slice(0, 4).map(key => (
                              <th key={key} className="text-left px-2 py-1 text-muted-foreground font-medium capitalize">
                                {key.replace(/_/g, ' ')}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {msg.data.slice(0, 5).map((row, i) => (
                            <tr key={i} className="border-t border-border/50">
                              {Object.values(row).slice(0, 4).map((val: any, j) => (
                                <td key={j} className="px-2 py-1 text-foreground">
                                  {typeof val === 'number' && val > 100000
                                    ? `₹${(val/100000).toFixed(1)}L`
                                    : String(val ?? '-')
                                  }
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {msg.data.length > 5 && (
                        <p className="text-muted-foreground text-xs mt-1 px-2">
                          +{msg.data.length - 5} more rows
                        </p>
                      )}
                    </div>
                  )}

                  {/* SQL toggle */}
                  {msg.sql && (
                    <button
                      onClick={() => setShowSQL(showSQL === idx ? null : idx)}
                      className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                    >
                      <ChevronDown className={`w-3 h-3 transition-transform ${showSQL === idx ? 'rotate-180' : ''}`} />
                      {showSQL === idx ? 'Hide SQL' : 'View SQL'}
                    </button>
                  )}

                  {showSQL === idx && msg.sql && (
                    <div className="w-full bg-slate-900 rounded-lg p-2 text-xs font-mono text-green-400 overflow-x-auto">
                      {msg.sql}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {loading && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-blue-400" />
                </div>
                <div className="bg-muted px-3 py-2 rounded-xl rounded-tl-none flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2">
              <p className="text-xs text-muted-foreground mb-2">Try asking:</p>
              <div className="flex flex-wrap gap-1">
                {suggestedQuestions.slice(0, 3).map((q, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(q)}
                    className="text-xs bg-muted hover:bg-muted/80 text-foreground px-2 py-1 rounded-full transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="px-4 py-3 border-t border-border">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about your data..."
                className="flex-1 bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-blue-500 transition-colors"
                disabled={loading}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg px-3 py-2 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}