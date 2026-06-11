'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { MessageCircle, X, Send, Loader2, Bot, User, ChevronDown, Database, Zap, PlugZap, BookOpen, ExternalLink } from 'lucide-react'
import { useYear } from '@/lib/yearContext'
import { useERPSession } from '@/lib/session-context'

interface Source {
  title: string
  url: string
  module?: string
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  data?: Record<string, unknown>[]
  sql?: string
  sources?: Source[]
}

interface ChatPanelProps {
  viewMode: 'supabase' | 'erp'
}

// Per-mode styling + copy so the assistant clearly reflects which world it
// answers from (historical Supabase vs live ERP).
const MODE = {
  supabase: {
    name: 'Sigzen BI Assistant',
    tag: 'Historical data · Vanna AI',
    accent: 'bg-sky-600 hover:bg-sky-700',
    headerBg: 'bg-sky-600',
    headerSub: 'text-sky-200',
    ring: 'focus:border-sky-500',
    icon: Database,
    greeting:
      'Hi! Ask me anything about your historical business data — revenue, clients, employees, projects, NPS and more. I turn your question into SQL and answer from the database.',
    suggestions: [
      'What was total revenue in 2024?',
      'Which clients have the highest contract value?',
      'How many projects are delayed?',
      'Average NPS score this year?',
      'Compare revenue across all years',
    ],
  },
  erp: {
    name: 'ERP Assistant',
    tag: 'Live ERP · context-grounded',
    accent: 'bg-emerald-600 hover:bg-emerald-700',
    headerBg: 'bg-emerald-600',
    headerSub: 'text-emerald-100',
    ring: 'focus:border-emerald-500',
    icon: Zap,
    greeting:
      "Hi! I answer from your live ERP snapshot — invoices, receivables, suppliers, tasks, projects and more. Ask me what's true right now.",
    suggestions: [
      "What's my total outstanding receivables?",
      'How many invoices are unpaid?',
      'How do I create a Sales Invoice?',
      'How many active suppliers do I have?',
      'Summarize my ERP health',
    ],
  },
} as const

function newGreeting(mode: 'supabase' | 'erp'): Message {
  return { role: 'assistant', content: MODE[mode].greeting }
}

export default function ChatPanel({ viewMode }: ChatPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  // Separate threads per mode so switching the toggle preserves each chat.
  const [supabaseMsgs, setSupabaseMsgs] = useState<Message[]>([newGreeting('supabase')])
  const [erpMsgs, setErpMsgs] = useState<Message[]>([newGreeting('erp')])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSQL, setShowSQL] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { selectedYear } = useYear()
  const { sessionId, isConnected, erpType } = useERPSession()

  const cfg = MODE[viewMode]
  const Icon = cfg.icon
  const messages = viewMode === 'erp' ? erpMsgs : supabaseMsgs
  const setMessages = viewMode === 'erp' ? setErpMsgs : setSupabaseMsgs
  const erpBlocked = viewMode === 'erp' && !isConnected

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = async () => {
    if (!input.trim() || loading || erpBlocked) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

      const response = viewMode === 'erp'
        ? await fetch(`${apiUrl}/api/erp/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              session_id: sessionId,
              question: userMessage,
              year: selectedYear,
            }),
          })
        : await fetch(`${apiUrl}/api/chat`, {
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
        sources: data.sources,
      }])
    } catch {
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

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`fixed bottom-6 right-6 z-50 w-14 h-14 ${cfg.accent} text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110`}
          title="Ask AI Assistant"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">

          {/* Header */}
          <div className={`flex items-center justify-between px-4 py-3 ${cfg.headerBg} text-white`}>
            <div className="flex items-center gap-2">
              <Icon className="w-5 h-5" />
              <div>
                <p className="font-semibold text-sm">{cfg.name}</p>
                <p className={`text-xs ${cfg.headerSub}`}>
                  {viewMode === 'erp' && isConnected
                    ? `Live ${erpType ?? 'ERP'} · Year ${selectedYear}`
                    : `${cfg.tag} · Year ${selectedYear}`}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-black/15 rounded-lg p-1 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* ERP mode but not connected → prompt to connect, no chat */}
          {erpBlocked ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 mb-4">
                  <Zap className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-foreground mb-1.5">Connect your ERP to chat</h3>
                <p className="text-sm text-muted-foreground mb-5">
                  The ERP assistant answers from your live ERP data. Connect an ERP
                  system to start asking questions.
                </p>
                <Link
                  href="/connect"
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  <PlugZap className="w-4 h-4" />
                  Connect your ERP
                </Link>
                <p className="text-xs text-muted-foreground mt-4">
                  Or switch to <span className="text-sky-400 font-medium">Supabase</span> mode for historical data.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>

                    {/* Avatar */}
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.role === 'user' ? cfg.headerBg : 'bg-slate-700'
                    }`}>
                      {msg.role === 'user'
                        ? <User className="w-4 h-4 text-white" />
                        : <Bot className={`w-4 h-4 ${viewMode === 'erp' ? 'text-emerald-400' : 'text-sky-400'}`} />
                      }
                    </div>

                    {/* Message bubble */}
                    <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                      <div className={`px-3 py-2 rounded-xl text-sm whitespace-pre-wrap ${
                        msg.role === 'user'
                          ? `${cfg.headerBg} text-white rounded-tr-none`
                          : 'bg-muted text-foreground rounded-tl-none'
                      }`}>
                        {msg.content}
                      </div>

                      {/* Data table (Supabase SQL results) */}
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
                                  {Object.values(row).slice(0, 4).map((val, j) => (
                                    <td key={j} className="px-2 py-1 text-foreground">
                                      {typeof val === 'number' && val > 100000
                                        ? `₹${(val / 100000).toFixed(1)}L`
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

                      {/* SQL toggle (Supabase only) */}
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

                      {/* Help-answer sources (ERPNext docs RAG) */}
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="w-full mt-1 border-t border-border/50 pt-1.5">
                          <p className="text-[11px] font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                            <BookOpen className="w-3 h-3" /> Sources
                          </p>
                          <div className="flex flex-col gap-0.5">
                            {msg.sources.slice(0, 4).map((src, i) => (
                              <a
                                key={i}
                                href={src.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] text-emerald-400 hover:text-emerald-300 hover:underline truncate flex items-center gap-1"
                                title={src.url}
                              >
                                <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
                                {src.title || src.url}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Loading indicator */}
                {loading && (
                  <div className="flex gap-2">
                    <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center">
                      <Bot className={`w-4 h-4 ${viewMode === 'erp' ? 'text-emerald-400' : 'text-sky-400'}`} />
                    </div>
                    <div className="bg-muted px-3 py-2 rounded-xl rounded-tl-none flex items-center gap-2">
                      <Loader2 className={`w-4 h-4 animate-spin ${viewMode === 'erp' ? 'text-emerald-400' : 'text-sky-400'}`} />
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
                    {cfg.suggestions.slice(0, 3).map((q, i) => (
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
                    placeholder={viewMode === 'erp' ? 'Ask about your live ERP data...' : 'Ask anything about your data...'}
                    className={`flex-1 bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none ${cfg.ring} transition-colors`}
                    disabled={loading}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={loading || !input.trim()}
                    className={`${cfg.accent} disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg px-3 py-2 transition-colors`}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}
