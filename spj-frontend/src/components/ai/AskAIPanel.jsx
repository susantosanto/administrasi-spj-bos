/**
 * AskAIPanel.jsx — Panel Chat "Ask to AI" (Premium Redesign 2026)
 * 
 * Ultra-premium minimalis sidebar.
 * Slide-in dari kanan, glass morphism, clean typography.
 */

import { useState, useEffect, useRef } from 'react'
import { useAI } from '../../contexts/AIContext'
import { detectContext } from '../../utils/aiHelper'

// ═══════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════

function formatTime(ts) {
  try { return new Date(ts).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) } catch { return '' }
}

function formatContent(text) {
  if (!text) return null
  const lines = text.split('\n')
  return lines.map((line, i) => {
    const listMatch = line.match(/^([\-•*]\s|\d+\.\s)(.*)/)
    if (listMatch) {
      return (
        <div key={i} className="flex items-start gap-1.5 ml-1">
          <span className="text-primary/60 mt-px text-[10px]">●</span>
          <span>{highlightRp(listMatch[2])}</span>
        </div>
      )
    }
    if (line.includes('**')) {
      const parts = line.split(/(\*\*[^*]+\*\*)/g)
      return (
        <p key={i} className="mb-0.5">
          {parts.map((p, j) =>
            p.startsWith('**') && p.endsWith('**')
              ? <strong key={j} className="font-semibold">{p.slice(2, -2)}</strong>
              : highlightRp(p)
          )}
        </p>
      )
    }
    return <p key={i} className="mb-0.5">{highlightRp(line)}</p>
  })
}

function highlightRp(text) {
  if (!text) return text
  return text.split(/(Rp\s*[\d.,]+)/g).map((part, i) => {
    const m = part.match(/^(Rp\s*)([\d.,]+)$/)
    return m
      ? <span key={i} className="font-semibold text-primary">{m[1]}{m[2]}</span>
      : part
  })
}

// ═══════════════════════════════════════════════════════════════════
// CHAT BUBBLE — Ultra-clean minimalis
// ═══════════════════════════════════════════════════════════════════

function ChatBubble({ message }) {
  const isUser = message.role === 'user'
  const isErr = message.isError
  const isStream = message.isStreaming

  return (
    <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar — tiny pill */}
      <div className={`flex-shrink-0 mt-1 ${isUser ? '' : ''}`}>
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
          isUser
            ? 'bg-primary text-white'
            : isErr
              ? 'bg-red-50 text-red-500'
              : 'bg-slate-100 text-slate-500'
        }`}>
          <span className="material-symbols-outlined text-[14px]" style={isUser ? { fontVariationSettings: "'FILL' 1" } : {}}>
            {isUser ? 'person' : isErr ? 'error' : 'auto_awesome'}
          </span>
        </div>
      </div>

      {/* Bubble */}
      <div className={`max-w-[82%] ${isUser
        ? 'bg-primary text-white rounded-2xl rounded-tr-md px-4 py-2.5'
        : isErr
          ? 'bg-red-50 text-red-700 border border-red-200/60 rounded-2xl rounded-tl-md px-4 py-2.5'
          : 'bg-white text-slate-700 border border-slate-200/60 rounded-2xl rounded-tl-md px-4 py-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]'
      }`}>
        {/* Streaming dots */}
        {isStream && !message.content && (
          <div className="flex gap-1 py-1">
            {[0, 150, 300].map((d) => (
              <div key={d} className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: `${d}ms` }} />
            ))}
          </div>
        )}

        {message.content && (
          <div className="text-[13px] leading-relaxed whitespace-pre-wrap">
            {formatContent(message.content)}
            {isStream && <span className="inline-block w-[2px] h-[1em] bg-primary/60 ml-px animate-pulse" />}
          </div>
        )}

        {message.timestamp && !isStream && (
          <p className={`text-[9px] mt-1.5 ${isUser ? 'text-blue-200' : 'text-slate-400'}`}>
            {formatTime(message.timestamp)}
          </p>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// QUICK CHIPS — Pill minimalis
// ═══════════════════════════════════════════════════════════════════

function QuickChips({ chips, onSelect, visible }) {
  if (!visible || !chips?.length) return null
  return (
    <div className="flex flex-wrap gap-1.5 px-5 pb-2">
      {chips.map((c, i) => (
        <button
          key={i}
          onClick={() => onSelect(c.question)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200/80 
                     text-[11px] font-medium text-slate-500 
                     hover:border-primary/30 hover:text-primary hover:bg-primary/5 
                     transition-all duration-200 active:scale-95"
        >
          <span className="text-[10px]">{c.icon}</span>
          {c.label}
        </button>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// MAIN PANEL
// ═══════════════════════════════════════════════════════════════════

export default function AskAIPanel({ onClose }) {
  const { messages, sendMessage, isLoading, isStreaming, cancelStreaming, resetChat } = useAI()
  const [input, setInput] = useState('')
  const [context, setContext] = useState(null)
  const scrollRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    setContext(detectContext(window.location.pathname))
    setTimeout(() => inputRef.current?.focus(), 350)
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose?.() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  const send = () => {
    if (!input.trim() || isLoading) return
    sendMessage(input.trim())
    setInput('')
  }

  const hasChat = messages.length > 0

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[200] transition-opacity" onClick={onClose} />

      {/* Panel — wider, premium minimalis */}
      <div className="fixed top-0 right-0 h-full w-[480px] max-w-[calc(100vw-24px)] z-[201]
                       bg-[#f8f9fb]/95 backdrop-blur-2xl
                       border-l border-slate-200/60
                       shadow-[-8px_0_40px_rgba(0,0,0,0.08)]
                       flex flex-col
                       animate-slide-in-right">

        {/* ── HEADER ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/50 bg-white/60 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-md shadow-primary/15">
              <span className="material-symbols-outlined text-white text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 tracking-tight">AI Assistant</h3>
              <p className="text-[10px] text-slate-400 font-medium">
                {context?.title || 'Asisten Cerdas'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            {hasChat && (
              <button onClick={resetChat} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100/80 transition-all" title="Hapus riwayat">
                <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
              </button>
            )}
            <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100/80 transition-all" title="Tutup">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>

        {/* ── CHAT AREA ── */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {/* Welcome */}
          {!hasChat && (
            <div className="flex flex-col items-center text-center pt-8 pb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/8 to-blue-500/8 flex items-center justify-center mb-4 ring-1 ring-primary/10">
                <span className="material-symbols-outlined text-2xl text-primary/70">chat_bubble</span>
              </div>
              <h4 className="text-[15px] font-bold text-slate-800 mb-1">Halo! 👋</h4>
              <p className="text-[12px] text-slate-400 leading-relaxed max-w-[240px]">
                Tanya apa saja tentang BKU, LPJ, data sekolah, atau guru.
              </p>
              {/* API Status */}
              <div className="mt-4">
                <ApiStatus />
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((m, i) => <ChatBubble key={i} message={m} />)}

          {/* Loading */}
          {isLoading && !isStreaming && (
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[14px] text-primary/60">auto_awesome</span>
              </div>
              <div className="bg-white border border-slate-200/60 rounded-2xl rounded-tl-md px-4 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                <div className="flex gap-1">
                  {[0, 150, 300].map((d) => (
                    <div key={d} className="w-1.5 h-1.5 rounded-full bg-primary/30 animate-bounce" style={{ animationDelay: `${d}ms` }} />
                  ))}
                </div>
              </div>
            </div>
          )}

          <QuickChips chips={context?.quickChips} onSelect={(q) => { setInput(''); sendMessage(q) }} visible={!hasChat} />
        </div>

        {/* ── INPUT ── */}
        <div className="px-4 py-3 border-t border-slate-200/50 bg-white/70 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
                placeholder="Ketik pertanyaan..."
                disabled={isLoading}
                className="w-full px-4 py-2.5 bg-white border border-slate-200/80 rounded-xl text-[13px] text-slate-700
                           outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10
                           placeholder:text-slate-400 disabled:opacity-40 transition-all"
              />
            </div>
            {isStreaming ? (
              <button onClick={cancelStreaming}
                className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-500 text-white shadow-md shadow-red-500/20 hover:brightness-110 active:scale-95 transition-all">
                <span className="material-symbols-outlined text-[18px]">stop</span>
              </button>
            ) : (
              <button onClick={send} disabled={!input.trim() || isLoading}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  input.trim() && !isLoading
                    ? 'bg-gradient-to-r from-primary to-blue-600 text-white shadow-md shadow-primary/20 hover:brightness-110 active:scale-95'
                    : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                }`}>
                <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
              </button>
            )}
          </div>
          <p className="text-[9px] text-slate-400 mt-2 text-center">
            AI bisa saja salah. Verifikasi data penting.
          </p>
        </div>
      </div>
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════
// API STATUS — Tiny pill
// ═══════════════════════════════════════════════════════════════════

function ApiStatus() {
  const hasGemini = !!import.meta.env.VITE_GEMINI_API_KEY
  const hasGroq = !!import.meta.env.VITE_GROQ_API_KEY
  const active = hasGemini || hasGroq

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold ${
      active ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/60' : 'bg-amber-50 text-amber-600 ring-1 ring-amber-200/60'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
      {active ? `${hasGemini ? 'Gemini' : 'Groq'} aktif` : 'Offline mode'}
    </span>
  )
}
