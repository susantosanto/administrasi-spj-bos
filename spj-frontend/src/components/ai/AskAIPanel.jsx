/**
 * AskAIPanel.jsx — Panel Chat "Ask to AI"
 * 
 * Komponen slide-in dari kanan yang menampilkan:
 * - Riwayat chat (message bubbles)
 * - Quick chips (pertanyaan cepat sesuai halaman)
 * - Input chat
 * 
 * Data Sources: localStorage (via aiHelper.js)
 * API: Google Gemini / Groq (via aiHelper.js)
 * 
 * Cara Pakai:
 *   <AskAIPanel onClose={() => setIsOpen(false)} />
 */

import { useState, useEffect, useRef } from 'react'
import { useAI } from '../../contexts/AIContext'
import { detectContext } from '../../utils/aiHelper'
import storageHelper from '../../utils/storageHelper'

// ═══════════════════════════════════════════════════════════════════════════
// KOMPONEN: Chat Bubble
// ═══════════════════════════════════════════════════════════════════════════

function ChatBubble({ message }) {
  const isUser = message.role === 'user'
  const isError = message.isError
  const isStreaming = message.isStreaming // ← flag untuk animasi streaming

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
          isUser
            ? 'bg-gradient-to-br from-primary to-blue-600'
            : isError
              ? 'bg-red-100'
              : isStreaming
                ? 'bg-primary/10 ring-2 ring-primary/30 animate-pulse'
                : 'bg-slate-100'
        }`}
      >
        <span
          className={`material-symbols-outlined text-sm ${
            isUser ? 'text-white' : isError ? 'text-red-600' : isStreaming ? 'text-primary' : 'text-primary'
          }`}
          style={isUser ? { fontVariationSettings: "'FILL' 1" } : {}}
        >
          {isUser ? 'person' : isError ? 'error' : isStreaming ? 'more_horiz' : 'auto_awesome'}
        </span>
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed transition-all ${
          isUser
            ? 'bg-primary text-white rounded-tr-md'
            : isError
              ? 'bg-red-50 text-red-700 border border-red-200 rounded-tl-md'
              : isStreaming
                ? 'bg-white text-slate-700 border border-primary/20 rounded-tl-md shadow-sm'
                : 'bg-slate-50 text-slate-700 border border-slate-100 rounded-tl-md'
        }`}
      >
        {/* Streaming indicator: blinking cursor */}
        {isStreaming && !message.content && (
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )}

        {/* Format konten: bold, list, dan Rupiah */}
        {message.content && (
          <div className="whitespace-pre-wrap">
            {formatMessageContent(message.content)}
            {/* Blinking cursor saat streaming */}
            {isStreaming && (
              <span className="inline-block w-[2px] h-[1em] bg-primary ml-0.5 animate-pulse" />
            )}
          </div>
        )}

        {/* Timestamp */}
        {message.timestamp && !isStreaming && (
          <p className={`text-[10px] mt-2 ${isUser ? 'text-blue-200' : 'text-slate-400'}`}>
            {formatTime(message.timestamp)}
          </p>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER: Format pesan
// ═══════════════════════════════════════════════════════════════════════════

function formatMessageContent(text) {
  if (!text) return null

  // Split by newline untuk mendeteksi list
  const lines = text.split('\n')

  return lines.map((line, i) => {
    // Deteksi list item: "- item" atau "• item" atau "* item" atau "1. item"
    const listMatch = line.match(/^([\-•*]\s|\d+\.\s)(.*)/)
    if (listMatch) {
      return (
        <div key={i} className="flex items-start gap-2 ml-2">
          <span className="text-primary mt-0.5">•</span>
          <span>{highlightNumbers(listMatch[2])}</span>
        </div>
      )
    }

    // Deteksi bold: **text**
    if (line.includes('**')) {
      const parts = line.split(/(\*\*[^*]+\*\*)/g)
      return (
        <p key={i} className="mb-1">
          {parts.map((part, j) =>
            part.startsWith('**') && part.endsWith('**')
              ? <strong key={j} className="font-bold">{part.slice(2, -2)}</strong>
              : highlightNumbers(part)
          )}
        </p>
      )
    }

    return (
      <p key={i} className="mb-1">
        {highlightNumbers(line)}
      </p>
    )
  })
}

/** Highlight angka Rupiah */
function highlightNumbers(text) {
  if (!text) return text

  // Regex untuk format Rp
  const parts = text.split(/(Rp\s*[\d.,]+)/g)
  return parts.map((part, i) => {
    const rpMatch = part.match(/^(Rp\s*)([\d.,]+)$/)
    if (rpMatch) {
      return (
        <span key={i} className="font-bold text-primary">
          {rpMatch[1]}
          <span className="text-on-surface">{rpMatch[2]}</span>
        </span>
      )
    }
    return part
  })
}

/** Format timestamp ke jam:menit */
function formatTime(timestamp) {
  try {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// KOMPONEN: Quick Chips
// ═══════════════════════════════════════════════════════════════════════════

function QuickChips({ chips, onSelect, hasSentMessage }) {
  if (hasSentMessage || !chips || chips.length === 0) return null

  return (
    <div className="px-4 pb-3">
      <p className="text-[11px] text-slate-400 mb-2 font-medium">Coba tanya:</p>
      <div className="flex flex-wrap gap-1.5">
        {chips.map((chip, i) => (
          <button
            key={i}
            onClick={() => onSelect(chip.question)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 
                       rounded-xl text-[11px] font-medium text-slate-600 
                       hover:border-primary hover:text-primary hover:bg-primary/5 
                       transition-all active:scale-95 shadow-sm"
          >
            <span className="text-xs">{chip.icon}</span>
            <span>{chip.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// KOMPONEN UTAMA: AskAIPanel
// ═══════════════════════════════════════════════════════════════════════════

export default function AskAIPanel({ onClose }) {
  const { messages, sendMessage, isLoading, isStreaming, cancelStreaming, resetChat } = useAI()
  const [inputText, setInputText] = useState('')
  const [context, setContext] = useState(null)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Detect context saat panel dibuka
  useEffect(() => {
    const ctx = detectContext(window.location.pathname)
    setContext(ctx)

    // Auto-focus input
    setTimeout(() => inputRef.current?.focus(), 300)
  }, [])

  // Auto-scroll ke bawah saat ada pesan baru
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Keyboard shortcut: Escape untuk tutup
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const handleSend = () => {
    if (!inputText.trim() || isLoading) return
    sendMessage(inputText.trim())
    setInputText('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleQuickChipClick = (question) => {
    setInputText('')
    sendMessage(question)
  }

  const hasSentMessage = messages.length > 0

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[200]"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed top-0 right-0 h-full w-[400px] max-w-full z-[201] 
                   bg-white shadow-2xl shadow-slate-900/20
                   animate-slide-in-right"
      >
        {/* ── HEADER ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-white text-lg">auto_awesome</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Tanya AI</h3>
              <p className="text-[10px] text-slate-400">
                {context?.title ? `Halaman: ${context.title}` : 'Asisten Cerdas'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {/* Reset button */}
            {messages.length > 0 && (
              <button
                onClick={resetChat}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                title="Hapus riwayat chat"
              >
                <span className="material-symbols-outlined text-lg">delete_sweep</span>
              </button>
            )}
            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
              title="Tutup (Esc)"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        </div>

        {/* ── CHAT AREA ── */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" style={{ height: 'calc(100% - 140px)' }}>
          {/* Welcome message (jika belum ada chat) */}
          {!hasSentMessage && (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-blue-600/10 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-3xl text-primary">auto_awesome</span>
              </div>
              <h4 className="text-base font-bold text-slate-800 mb-1">Ada yang bisa saya bantu?</h4>
              <p className="text-xs text-slate-500 mb-4 max-w-xs mx-auto">
                Saya bisa menjawab pertanyaan tentang data BKU, dokumen LPJ, data guru, sekolah, dan lainnya.
              </p>

              {/* Status API */}
              <ApiStatusIndicator />
            </div>
          )}

          {/* Daftar pesan */}
          {messages.map((msg, i) => (
            <ChatBubble key={i} message={msg} />
          ))}

          {/* Loading indicator */}
          {isLoading && !isStreaming && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-sm text-primary">auto_awesome</span>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-md px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          {/* Quick chips (sampai user kirim pesan pertama) */}
          <QuickChips
            chips={context?.quickChips}
            onSelect={handleQuickChipClick}
            hasSentMessage={hasSentMessage}
          />

          {/* Anchor for auto-scroll */}
          <div ref={messagesEndRef} />
        </div>

        {/* ── INPUT AREA ── */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-slate-100 bg-white p-4">
          <div className="flex items-center gap-2">
            {/* Text Input */}
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ketik pertanyaan..."
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm 
                         outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                         placeholder:text-slate-400 disabled:opacity-50 transition-all"
            />

            {/* Cancel atau Send Button */}
            {isStreaming ? (
              <button
                onClick={cancelStreaming}
                className="w-11 h-11 rounded-xl flex items-center justify-center bg-red-500 text-white shadow-lg shadow-red-500/30 hover:brightness-110 active:scale-95 transition-all animate-pulse"
                title="Hentikan"
              >
                <span className="material-symbols-outlined text-lg">stop</span>
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!inputText.trim() || isLoading}
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all
                  ${
                    inputText.trim() && !isLoading
                      ? 'bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg shadow-primary/30 hover:brightness-110 active:scale-95'
                      : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                  }`}
              >
                <span className="material-symbols-outlined text-lg">
                  {isLoading ? 'more_horiz' : 'arrow_upward'}
                </span>
              </button>
            )}
          </div>

          {/* Disclaimer */}
          <p className="text-[10px] text-slate-400 mt-2 text-center">
            AI bisa saja salah. Selalu verifikasi data penting.
          </p>
        </div>
      </div>
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// KOMPONEN: Status API
// ═══════════════════════════════════════════════════════════════════════════

function ApiStatusIndicator() {
  // Cek apakah API key sudah diatur
  const hasGemini = !!import.meta.env.VITE_GEMINI_API_KEY
  const hasGroq = !!import.meta.env.VITE_GROQ_API_KEY
  const isActive = hasGemini || hasGroq

  return (
    <div
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium ${
        isActive
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          : 'bg-amber-50 text-amber-700 border border-amber-200'
      }`}
    >
      <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
      <span>
        {isActive
          ? `${hasGemini ? 'Gemini' : 'Groq'} AI aktif`
          : 'API Key belum diatur (mode offline)'}
      </span>
    </div>
  )
}
