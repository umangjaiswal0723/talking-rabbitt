import { useState, useRef, useEffect } from 'react'
import { Send, User, Sparkles, Mic, MicOff, Volume2, VolumeX, Trash2, Clock } from 'lucide-react'
import { sendChatMessage } from '../utils/api'

const SUGGESTIONS = [
  'What are the key trends in this dataset?',
  'Which column has the most anomalies?',
  'Summarize the main KPIs for a business report.',
  'What actions should I take based on this data?',
  'Which values are above average?',
]

const STORAGE_KEY = 'rabbitt_chat_history'

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      {[0,1,2].map(i => (
        <span key={i} className="typing-dot w-1.5 h-1.5 rounded-full bg-brand-400"
          style={{ animationDelay: `${i * 0.2}s` }} />
      ))}
    </div>
  )
}

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function ChatPage({ hasData, filename }) {
  const initMsg = {
    role: 'assistant',
    content: hasData
      ? `Hey there! I'm **Rabbitt** 🐇 — your AI data analyst. I've loaded **${filename}** and I'm ready to answer any questions about your dataset. What would you like to know?`
      : `Hey there! I'm **Rabbitt** 🐇 — your AI business intelligence assistant. Please upload a dataset first, then I can answer questions about your data!`,
    ts: Date.now(),
  }

  // Load history from localStorage
  const loadHistory = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch {}
    return [initMsg]
  }

  const [messages, setMessages]   = useState(loadHistory)
  const [input, setInput]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [listening, setListening] = useState(false)
  const [speaking, setSpeaking]   = useState(false)
  const [ttsEnabled, setTtsEnabled] = useState(true)
  const [showHistory, setShowHistory] = useState(false)
  const bottomRef  = useRef(null)
  const recognRef  = useRef(null)

  // Save to localStorage on every message change
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages)) } catch {}
  }, [messages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // ── Voice: Speech-to-Text ──────────────────────────────────────────────
  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { alert('Your browser does not support speech recognition. Try Chrome.'); return }
    const rec = new SR()
    rec.lang = 'en-US'
    rec.interimResults = false
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript
      setInput(transcript)
      setListening(false)
    }
    rec.onerror = () => setListening(false)
    rec.onend   = () => setListening(false)
    rec.start()
    recognRef.current = rec
    setListening(true)
  }

  const stopListening = () => {
    recognRef.current?.stop()
    setListening(false)
  }

  // ── Voice: Text-to-Speech ──────────────────────────────────────────────
  const speak = (text) => {
    if (!ttsEnabled || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const clean = text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/[#*_`]/g, '')
    const utt = new SpeechSynthesisUtterance(clean)
    utt.rate  = 1.0
    utt.pitch = 1.0
    utt.onstart = () => setSpeaking(true)
    utt.onend   = () => setSpeaking(false)
    window.speechSynthesis.speak(utt)
  }

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel()
    setSpeaking(false)
  }

  // ── Send message ──────────────────────────────────────────────────────
  const send = async (text) => {
    const q = text || input.trim()
    if (!q || loading) return
    setInput('')
    const newMessages = [...messages, { role: 'user', content: q, ts: Date.now() }]
    setMessages(newMessages)
    setLoading(true)
    try {
      const history = newMessages.slice(0, -1).map(m => ({ role: m.role, content: m.content }))
      const res = await sendChatMessage(q, history)
      const reply = res.data.reply
      setMessages(prev => [...prev, { role: 'assistant', content: reply, ts: Date.now() }])
      speak(reply)
    } catch {
      const errMsg = 'Oops — I ran into an error. Please check that the Gemini API key is set and try again.'
      setMessages(prev => [...prev, { role: 'assistant', content: errMsg, ts: Date.now() }])
    } finally {
      setLoading(false)
    }
  }

  const clearHistory = () => {
    if (confirm('Clear all chat history?')) {
      setMessages([{ ...initMsg, ts: Date.now() }])
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  const renderContent = (text) => text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')

  // Group messages by date for history display
  const grouped = messages.reduce((acc, msg) => {
    const day = new Date(msg.ts).toLocaleDateString()
    if (!acc[day]) acc[day] = []
    acc[day].push(msg)
    return acc
  }, {})

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-8rem)] animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display font-bold text-2xl text-white">Ask Rabbitt</h2>
          <p className="text-ink-400 text-sm mt-1">AI chatbot with voice · powered by Gemini</p>
        </div>
        <div className="flex items-center gap-2">
          {/* TTS toggle */}
          <button onClick={() => { setTtsEnabled(!ttsEnabled); stopSpeaking() }}
            title={ttsEnabled ? 'Mute voice replies' : 'Enable voice replies'}
            className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all
              ${ttsEnabled ? 'bg-brand-600/20 border-brand-500/30 text-brand-300' : 'bg-ink-700/40 border-ink-600/40 text-ink-500'}`}>
            {ttsEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          </button>
          {/* History toggle */}
          <button onClick={() => setShowHistory(!showHistory)}
            title="Chat history"
            className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all
              ${showHistory ? 'bg-brand-600/20 border-brand-500/30 text-brand-300' : 'bg-ink-700/40 border-ink-600/40 text-ink-400 hover:text-white'}`}>
            <Clock size={14} />
          </button>
          {/* Clear */}
          <button onClick={clearHistory} title="Clear history"
            className="w-8 h-8 rounded-lg flex items-center justify-center border bg-ink-700/40 border-ink-600/40 text-ink-400 hover:text-rose-400 transition-all">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 gap-4 min-h-0">
        {/* History panel */}
        {showHistory && (
          <div className="glass rounded-xl border border-ink-700/50 w-56 flex-shrink-0 overflow-y-auto p-3">
            <p className="text-xs text-ink-400 font-mono uppercase tracking-wide mb-3">Chat History</p>
            {Object.entries(grouped).map(([day, msgs]) => (
              <div key={day} className="mb-3">
                <p className="text-xs text-ink-500 font-mono mb-1">{day}</p>
                {msgs.filter(m => m.role === 'user').map((m, i) => (
                  <button key={i} onClick={() => setInput(m.content)}
                    className="w-full text-left text-xs text-ink-300 hover:text-white py-1 px-2 rounded hover:bg-ink-700/50 transition-colors truncate block mb-0.5">
                    {m.content}
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Chat window */}
        <div className="glass flex-1 rounded-xl border border-ink-700/50 flex flex-col overflow-hidden min-h-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 animate-slide-up ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5
                  ${msg.role === 'assistant' ? 'bg-gradient-to-br from-brand-500 to-accent-violet' : 'bg-ink-600 border border-ink-500'}`}>
                  {msg.role === 'assistant' ? <Sparkles size={14} className="text-white" /> : <User size={14} className="text-ink-300" />}
                </div>
                <div className="flex flex-col gap-1 max-w-[78%]">
                  <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed
                    ${msg.role === 'assistant'
                      ? 'bg-ink-700/60 text-ink-100 rounded-tl-sm border border-ink-600/30'
                      : 'bg-brand-600/25 text-brand-100 rounded-tr-sm border border-brand-500/30'
                    }`}>
                    <p dangerouslySetInnerHTML={{ __html: renderContent(msg.content) }} />
                  </div>
                  {msg.ts && (
                    <span className={`text-xs text-ink-600 font-mono ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                      {formatTime(msg.ts)}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 animate-fade-in">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-accent-violet flex items-center justify-center flex-shrink-0">
                  <Sparkles size={14} className="text-white" />
                </div>
                <div className="bg-ink-700/60 border border-ink-600/30 rounded-2xl rounded-tl-sm">
                  <TypingIndicator />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          {messages.length <= 1 && hasData && (
            <div className="px-4 pb-2 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s, i) => (
                <button key={i} onClick={() => send(s)}
                  className="text-xs px-3 py-1.5 rounded-full bg-ink-700/50 border border-ink-600/40
                    text-ink-300 hover:text-white hover:border-brand-500/40 hover:bg-brand-600/15
                    transition-all duration-150 font-body">
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Voice status bar */}
          {(listening || speaking) && (
            <div className={`mx-3 mb-2 px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-2
              ${listening ? 'bg-rose-500/15 border border-rose-500/30 text-rose-300' : 'bg-brand-500/15 border border-brand-500/30 text-brand-300'}`}>
              <span className={`w-2 h-2 rounded-full ${listening ? 'bg-rose-400' : 'bg-brand-400'} animate-pulse`} />
              {listening ? '🎤 Listening… speak now' : '🔊 Rabbitt is speaking…'}
              <button onClick={listening ? stopListening : stopSpeaking} className="ml-auto underline">Stop</button>
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-ink-700/50">
            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
                  placeholder={listening ? 'Listening…' : 'Ask Rabbitt about your data… or press 🎤'}
                  rows={1}
                  disabled={loading}
                  className="w-full bg-ink-700/50 border border-ink-600/50 rounded-xl px-4 py-2.5 text-sm
                    text-white placeholder:text-ink-500 focus:outline-none focus:border-brand-500/60
                    resize-none font-body disabled:opacity-50 transition-colors"
                  style={{ minHeight: '42px', maxHeight: '120px' }}
                />
              </div>

              {/* Mic button */}
              <button
                onClick={listening ? stopListening : startListening}
                title={listening ? 'Stop listening' : 'Speak your question'}
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border transition-all
                  ${listening
                    ? 'bg-rose-500/30 border-rose-500/50 text-rose-300 animate-pulse'
                    : 'bg-ink-700/40 border-ink-600/40 text-ink-400 hover:text-white hover:bg-ink-600/40'
                  }`}>
                {listening ? <MicOff size={16} /> : <Mic size={16} />}
              </button>

              {/* Send button */}
              <button onClick={() => send()}
                disabled={!input.trim() || loading}
                className="w-10 h-10 rounded-xl bg-brand-600/40 border border-brand-500/40 text-brand-300
                  flex items-center justify-center flex-shrink-0
                  hover:bg-brand-600/60 transition-all duration-150
                  disabled:opacity-40 disabled:cursor-not-allowed">
                <Send size={16} />
              </button>
            </div>
            <p className="text-ink-600 text-xs mt-1.5 pl-1 font-mono">Enter to send · Shift+Enter for newline · 🎤 for voice</p>
          </div>
        </div>
      </div>
    </div>
  )
}
