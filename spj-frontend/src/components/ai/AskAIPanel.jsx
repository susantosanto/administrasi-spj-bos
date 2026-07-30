/**
 * AskAIPanel.jsx — Panel Chat "Ask to AI" with File Upload (Premium 2026)
 * 
 * Fitur:
 * - Chat AI biasa
 * - Upload file (PDF, Excel, Image, TXT, CSV, JSON)
 * - PDF → ekstrak teks → analisis AI
 * - Excel → baca data → analisis AI
 * - Image → deskripsi via AI
 * - Konversi PDF ke Excel (ringkasan tabel)
 */

import { useState, useEffect, useRef, useCallback } from 'react'
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
// FILE PROCESSING — Baca file → teks
// ═══════════════════════════════════════════════════════════════════

async function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsText(file)
  })
}

async function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Parse CSV/TXT
function parseCSV(text) {
  const lines = text.trim().split('\n')
  if (lines.length === 0) return 'File kosong'
  const rows = lines.map(l => l.split(/[;,]/).map(c => c.trim()))
  const maxCols = Math.max(...rows.map(r => r.length))
  
  let result = `📊 Data: ${rows.length} baris, ${maxCols} kolom\n\n`
  // Header
  if (rows[0]) result += `**Kolom:** ${rows[0].join(' | ')}\n\n`
  // Sample rows (max 15)
  const sample = rows.slice(1, 16)
  sample.forEach((row, i) => {
    result += `${i + 1}. ${row.join(' | ')}\n`
  })
  if (rows.length > 16) result += `\n... dan ${rows.length - 16} baris lagi`
  return result
}

// Parse JSON
function parseJSON(text) {
  try {
    const data = JSON.parse(text)
    if (Array.isArray(data)) {
      let result = `📊 JSON Array: ${data.length} item\n\n`
      if (data.length > 0) {
        result += `**Struktur:** ${Object.keys(data[0]).join(', ')}\n\n`
        data.slice(0, 10).forEach((item, i) => {
          result += `${i + 1}. ${JSON.stringify(item).slice(0, 200)}\n`
        })
        if (data.length > 10) result += `\n... dan ${data.length - 10} item lagi`
      }
      return result
    }
    return `📊 JSON Object:\n${JSON.stringify(data, null, 2).slice(0, 3000)}`
  } catch {
    return text.slice(0, 3000)
  }
}

// Detect file type & process
async function processFile(file) {
  const ext = file.name.split('.').pop().toLowerCase()
  const mime = file.type

  // IMAGE
  if (mime.startsWith('image/')) {
    const dataUrl = await readFileAsDataURL(file)
    return { type: 'image', dataUrl, name: file.name, size: file.size }
  }

  // PDF — extract text via pdf.js if available, else fallback
  if (ext === 'pdf' || mime === 'application/pdf') {
    try {
      // Try dynamic import pdf.js
      const pdfjsLib = await import('pdfjs-dist')
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`
      
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      let allText = `📄 **PDF: ${file.name}** (${pdf.numPages} halaman)\n\n`
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        const text = content.items.map(item => item.str).join(' ')
        allText += `--- Halaman ${i} ---\n${text}\n\n`
      }
      
      return { type: 'pdf', text: allText, name: file.name, size: file.size, pages: pdf.numPages }
    } catch (err) {
      // Fallback: read as text (might not work for binary PDF)
      return { type: 'pdf', text: `📄 PDF: ${file.name}\n\n(Tidak bisa mengekstrak teks secara otomatis. Error: ${err.message})`, name: file.name, size: file.size, extractionFailed: true }
    }
  }

  // EXCEL (xlsx/xls)
  if (['xlsx', 'xls', 'csv'].includes(ext)) {
    try {
      const XLSX = await import('xlsx')
      const arrayBuffer = await file.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })
      let result = `📊 **Excel: ${file.name}** (${workbook.SheetNames.length} sheet)\n\n`
      
      workbook.SheetNames.forEach((sheetName, idx) => {
        const sheet = workbook.Sheets[sheetName]
        const data = XLSX.utils.sheet_to_csv(sheet)
        const lines = data.trim().split('\n')
        result += `**Sheet ${idx + 1}: ${sheetName}** (${lines.length} baris)\n`
        
        // Show header + max 10 rows
        const rows = lines.slice(0, 12)
        rows.forEach((row, i) => {
          result += `${i === 0 ? '📋' : '  '}. ${row}\n`
        })
        if (lines.length > 12) result += `  ... dan ${lines.length - 12} baris lagi\n`
        result += '\n'
      })
      
      return { type: 'excel', text: result, name: file.name, size: file.size, sheets: workbook.SheetNames }
    } catch (err) {
      return { type: 'excel', text: `📊 Excel: ${file.name}\n\n(Tidak bisa membaca file: ${err.message})`, name: file.name, size: file.size }
    }
  }

  // TEXT / CSV / JSON / LAINNYA
  if (['txt', 'md', 'log', 'json', 'xml', 'html'].includes(ext) || mime.startsWith('text/')) {
    const text = await readFileAsText(file)
    const processed = ext === 'csv' ? parseCSV(text) : ext === 'json' ? parseJSON(text) : text.slice(0, 5000)
    return { type: 'text', text: `📝 **${file.name}**:\n\n${processed}`, name: file.name, size: file.size }
  }

  // Unknown
  return { type: 'unknown', text: `❓ File: ${file.name} (${mime || ext})\n\nFormat belum didukung untuk analisis.`, name: file.name, size: file.size }
}

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ═══════════════════════════════════════════════════════════════════
// CHAT BUBBLE
// ═══════════════════════════════════════════════════════════════════

function ChatBubble({ message }) {
  const isUser = message.role === 'user'
  const isErr = message.isError
  const isStream = message.isStreaming

  return (
    <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className="flex-shrink-0 mt-1">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
          isUser ? 'bg-primary text-white' : isErr ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-500'
        }`}>
          <span className="material-symbols-outlined text-[14px]" style={isUser ? { fontVariationSettings: "'FILL' 1" } : {}}>
            {isUser ? 'person' : isErr ? 'error' : 'auto_awesome'}
          </span>
        </div>
      </div>
      <div className={`max-w-[82%] ${isUser
        ? 'bg-primary text-white rounded-2xl rounded-tr-md px-4 py-2.5'
        : isErr
          ? 'bg-red-50 text-red-700 border border-red-200/60 rounded-2xl rounded-tl-md px-4 py-2.5'
          : 'bg-white text-slate-700 border border-slate-200/60 rounded-2xl rounded-tl-md px-4 py-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]'
      }`}>
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
// FILE ATTACHMENT CHIP
// ═══════════════════════════════════════════════════════════════════

function FileChip({ file, onRemove }) {
  const iconMap = { pdf: 'picture_as_pdf', excel: 'table_chart', image: 'image', text: 'description', csv: 'table_chart', unknown: 'draft' }
  const colorMap = { pdf: 'text-red-500 bg-red-50', excel: 'text-emerald-600 bg-emerald-50', image: 'text-blue-500 bg-blue-50', text: 'text-slate-500 bg-slate-50', csv: 'text-emerald-600 bg-emerald-50', unknown: 'text-slate-400 bg-slate-50' }
  
  return (
    <div className="flex items-center gap-2 px-2.5 py-1.5 bg-white border border-slate-200/80 rounded-lg">
      <span className={`material-symbols-outlined text-[14px] ${colorMap[file.type] || colorMap.unknown}`}>
        {iconMap[file.type] || 'draft'}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-medium text-slate-700 truncate max-w-[120px]">{file.name}</p>
        <p className="text-[9px] text-slate-400">{formatFileSize(file.size)}</p>
      </div>
      <button onClick={onRemove} className="p-0.5 rounded text-slate-400 hover:text-red-500 transition-colors">
        <span className="material-symbols-outlined text-[12px]">close</span>
      </button>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// QUICK CHIPS
// ═══════════════════════════════════════════════════════════════════

function QuickChips({ chips, onSelect, visible }) {
  if (!visible || !chips?.length) return null
  return (
    <div className="flex flex-wrap gap-1.5 px-5 pb-2">
      {chips.map((c, i) => (
        <button key={i} onClick={() => onSelect(c.question)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200/80 
                     text-[11px] font-medium text-slate-500 
                     hover:border-primary/30 hover:text-primary hover:bg-primary/5 
                     transition-all duration-200 active:scale-95">
          <span className="text-[10px]">{c.icon}</span>{c.label}
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
  const [attachedFiles, setAttachedFiles] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const scrollRef = useRef(null)
  const inputRef = useRef(null)
  const fileInputRef = useRef(null)

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

  // Handle file upload
  const handleFileUpload = useCallback(async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    
    setIsProcessing(true)
    const processed = []
    
    for (const file of files) {
      try {
        const result = await processFile(file)
        processed.push(result)
      } catch (err) {
        processed.push({ type: 'unknown', text: `Error membaca ${file.name}: ${err.message}`, name: file.name, size: file.size })
      }
    }
    
    setAttachedFiles(prev => [...prev, ...processed])
    setIsProcessing(false)
    e.target.value = ''
  }, [])

  const removeFile = (index) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index))
  }

  // Send message with files
  const send = async () => {
    if (isLoading) return

    let finalMessage = input.trim()
    
    // If files attached, include file content in message
    if (attachedFiles.length > 0) {
      const fileContents = attachedFiles.map(f => {
        if (f.type === 'image') return `[Gambar: ${f.name}]`
        return f.text || `[File: ${f.name}]`
      }).join('\n\n---\n\n')
      
      if (finalMessage) {
        finalMessage = `${finalMessage}\n\n--- FILE YANG DIUPLOAD ---\n${fileContents}`
      } else {
        finalMessage = `Tolong analisis file berikut:\n\n${fileContents}`
      }
    }

    if (!finalMessage) return
    
    sendMessage(finalMessage)
    setInput('')
    setAttachedFiles([])
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  const hasChat = messages.length > 0

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[200] transition-opacity" onClick={onClose} />

      {/* Panel */}
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
              <p className="text-[10px] text-slate-400 font-medium">{context?.title || 'Asisten Cerdas'}</p>
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
              <p className="text-[12px] text-slate-400 leading-relaxed max-w-[260px]">
                Tanya apa saja, atau upload file untuk dianalisis.
              </p>
              
              {/* Feature hints */}
              <div className="flex flex-wrap justify-center gap-1.5 mt-4">
                {[
                  { icon: 'picture_as_pdf', label: 'PDF', color: 'text-red-500 bg-red-50' },
                  { icon: 'table_chart', label: 'Excel', color: 'text-emerald-600 bg-emerald-50' },
                  { icon: 'image', label: 'Gambar', color: 'text-blue-500 bg-blue-50' },
                  { icon: 'description', label: 'Teks/CSV', color: 'text-slate-500 bg-slate-50' },
                ].map((f) => (
                  <span key={f.label} className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium ${f.color}`}>
                    <span className="material-symbols-outlined text-[11px]">{f.icon}</span>{f.label}
                  </span>
                ))}
              </div>
              
              <div className="mt-4"><ApiStatus /></div>
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

          <QuickChips chips={context?.quickChips} onSelect={(q) => { setInput(''); sendMessage(q) }} visible={!hasChat && attachedFiles.length === 0} />
        </div>

        {/* ── INPUT AREA ── */}
        <div className="px-4 py-3 border-t border-slate-200/50 bg-white/70 backdrop-blur-xl space-y-2">
          {/* Attached files */}
          {attachedFiles.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {attachedFiles.map((f, i) => (
                <FileChip key={i} file={f} onRemove={() => removeFile(i)} />
              ))}
            </div>
          )}

          {/* Processing indicator */}
          {isProcessing && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-lg">
              <div className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              <span className="text-[10px] text-primary font-medium">Membaca file...</span>
            </div>
          )}

          {/* Input row */}
          <div className="flex items-center gap-2">
            {/* Upload button */}
            <input ref={fileInputRef} type="file" className="hidden" multiple 
                   accept=".pdf,.xlsx,.xls,.csv,.txt,.md,.json,.xml,.html,.png,.jpg,.jpeg,.gif,.webp"
                   onChange={handleFileUpload} />
            <button onClick={() => fileInputRef.current?.click()} disabled={isLoading}
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-100 text-slate-500 
                         hover:bg-slate-200 hover:text-slate-700 transition-all disabled:opacity-40"
              title="Upload file">
              <span className="material-symbols-outlined text-[18px]">attach_file</span>
            </button>

            {/* Text input */}
            <input ref={inputRef} type="text" value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={attachedFiles.length ? "Tanyakan tentang file..." : "Ketik pertanyaan..."}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 bg-white border border-slate-200/80 rounded-xl text-[13px] text-slate-700
                         outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10
                         placeholder:text-slate-400 disabled:opacity-40 transition-all" />

            {/* Send / Stop */}
            {isStreaming ? (
              <button onClick={cancelStreaming}
                className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-500 text-white shadow-md shadow-red-500/20 hover:brightness-110 active:scale-95 transition-all">
                <span className="material-symbols-outlined text-[18px]">stop</span>
              </button>
            ) : (
              <button onClick={send} disabled={(!input.trim() && !attachedFiles.length) || isLoading}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  (input.trim() || attachedFiles.length) && !isLoading
                    ? 'bg-gradient-to-r from-primary to-blue-600 text-white shadow-md shadow-primary/20 hover:brightness-110 active:scale-95'
                    : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                }`}>
                <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
              </button>
            )}
          </div>
          <p className="text-[9px] text-slate-400 text-center">AI bisa saja salah. Verifikasi data penting.</p>
        </div>
      </div>
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════
// API STATUS
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
