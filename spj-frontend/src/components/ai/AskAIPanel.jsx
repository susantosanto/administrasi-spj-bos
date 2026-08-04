/**
 * AskAIPanel.jsx — Panel Chat "Ask to AI" with File Upload (Premium 2026)
 * 
 * Fitur:
 * - Chat AI biasa
 * - Upload file (PDF, Excel, TXT, CSV, JSON)
 * - PDF → extract tabel otomatis + teks → analisis AI
 * - Excel → baca data → analisis AI
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

  // PDF — extract text via pdf.js
  if (ext === 'pdf' || mime === 'application/pdf') {
    try {
      const pdfjsLib = await import('pdfjs-dist/build/pdf')
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`
      
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      
      // ── COBA DETEKSI TABEL DULU ──
      let allText = `📄 **PDF: ${file.name}** (${pdf.numPages} halaman)\n\n`
      
      try {
        const { extractTables, extractAllText } = await import('../../utils/pdfTableExtractor')
        const result = await extractTables(pdf, { maxPages: pdf.numPages })
        
        if (result.tableCount > 0) {
          allText += `🔍 **${result.tableCount} tabel terdeteksi!**\n\n`
          allText += result.tableText
        } else {
          allText += await extractAllText(pdf)
        }
      } catch (tableErr) {
        // Fallback: extract text biasa
        console.warn('Table extraction fallback:', tableErr.message)
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i)
          const content = await page.getTextContent()
          const text = content.items
            .map(item => item.str)
            .filter(s => s.trim())
            .join(' ')
          if (text.trim()) {
            allText += `--- HALAMAN ${i} ---\n${text.trim()}\n\n`
          }
        }
      }
      
      return { type: 'pdf', text: allText, name: file.name, size: file.size, pages: pdf.numPages }
    } catch (err) {
      return { type: 'pdf', text: `📄 PDF: ${file.name}\n\n(Gagal mengekstrak teks: ${err.message}. Coba upload file Excel atau CSV sebagai gantinya.)`, name: file.name, size: file.size, extractionFailed: true }
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

  // Accent color: warm amber/gold untuk user, primary untuk AI, red untuk error
  const accentColor = isUser ? 'amber' : isErr ? 'red' : 'primary'
  const accentClasses = {
    amber: 'bg-amber-400/50',
    red: 'bg-red-400/50',
    primary: 'bg-primary/40',
  }
  const labelClasses = {
    amber: 'text-amber-500/70',
    red: 'text-red-500/70',
    primary: 'text-primary/60',
  }

  return (
    <div className={`flex items-start gap-4 ${isUser ? 'flex-row-reverse' : ''} group animate-fade-in`}>
      {/* Accent bar — thin vertical line sebagai pengganti bubble */}
      <div className={`flex-shrink-0 w-0.5 rounded-full transition-all duration-300 ${
        isStream && !message.content ? 'h-8' : 'min-h-[24px]'
      } ${accentClasses[accentColor]} ${
        isUser ? 'opacity-40 group-hover:opacity-80' : 'opacity-30 group-hover:opacity-60'
      }`} />

      {/* Content — NO BUBBLE, just clean text with label */}
      <div className={`${isUser ? 'text-right' : 'text-left'} max-w-[82%] min-w-0`}>
        {/* Label: premium minimal — hanya untuk AI, user cukup accent bar */}
        <div className={`flex items-center gap-2 mb-1 ${isUser ? 'flex-row-reverse' : ''}`}>
          {isUser ? (
            <span className="text-[8px] text-amber-400/30 font-medium">✓✓</span>
          ) : (
            <span className={`text-[9px] font-semibold uppercase tracking-[0.15em] ${labelClasses[accentColor]}`}>
              {isErr ? 'Error' : 'Respon'}
            </span>
          )}
        </div>

        {/* Streaming dots */}
        {isStream && !message.content && (
          <div className="flex items-center gap-1.5 py-1.5">
            {[0, 200, 400].map((d) => (
              <div key={d}
                className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce"
                style={{ animationDelay: `${d}ms`, animationDuration: '1s' }}
              />
            ))}
          </div>
        )}

        {/* Content text — clean, no bubble bg */}
        {message.content && (
          <div className={`text-[13.5px] leading-[1.7] whitespace-pre-wrap ${
            isUser ? 'text-slate-800' : isErr ? 'text-red-700' : 'text-slate-700'
          } [&_strong]:font-semibold`}>
            {formatContent(message.content)}
            {isStream && (
              <span className="inline-flex ml-0.5">
                <span className="w-[2px] h-[1.1em] bg-primary/60 rounded-full animate-pulse" />
              </span>
            )}
          </div>
        )}

        {/* Timestamp */}
        {message.timestamp && !isStream && (
          <div className={`flex items-center gap-1.5 mt-1.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <span className="text-[9px] text-slate-400/50 font-medium">
              {formatTime(message.timestamp)}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// FILE ATTACHMENT CHIP
// ═══════════════════════════════════════════════════════════════════

function FileChip({ file, onRemove }) {
  const iconMap = { pdf: 'picture_as_pdf', excel: 'table_chart', text: 'description', csv: 'table_chart', unknown: 'draft' }
  const gradients = {
    pdf: 'from-red-50 to-orange-50 border-red-200/50',
    excel: 'from-emerald-50 to-teal-50 border-emerald-200/50',
    text: 'from-slate-50 to-gray-50 border-slate-200/50',
    csv: 'from-emerald-50 to-teal-50 border-emerald-200/50',
    unknown: 'from-slate-50 to-gray-50 border-slate-200/50',
  }
  const iconColors = { pdf: 'text-red-500', excel: 'text-emerald-600', text: 'text-slate-500', csv: 'text-emerald-600', unknown: 'text-slate-400' }
  const g = gradients[file.type] || gradients.unknown
  
  return (
    <div className={`flex items-center gap-2.5 px-3 py-2 bg-gradient-to-br ${g} border rounded-xl shadow-sm group/file`}>
      <span className={`material-symbols-outlined text-[16px] ${iconColors[file.type] || iconColors.unknown}`} style={{ fontVariationSettings: "'FILL' 1" }}>
        {iconMap[file.type] || 'draft'}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold text-slate-700 truncate max-w-[140px]">{file.name}</p>
        <p className="text-[8px] text-slate-400 font-medium">{formatFileSize(file.size)}</p>
      </div>
      <button onClick={onRemove} 
        className="p-0.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50/80 
                   transition-all duration-200 opacity-60 hover:opacity-100 active:scale-90">
        <span className="material-symbols-outlined text-[14px]">close</span>
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
  const prevLoadingRef = useRef(isLoading)

  useEffect(() => {
    setContext(detectContext(window.location.pathname))
    setTimeout(() => inputRef.current?.focus(), 350)
  }, [])

  // Focus input ketika response AI selesai
  useEffect(() => {
    if (prevLoadingRef.current && !isLoading) {
      // Transisi loading → selesai, focus input
      inputRef.current?.focus()
    }
    prevLoadingRef.current = isLoading
  }, [isLoading])

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
    let displayMessage = finalMessage || 'Analisis file'
    
    // If files attached, build structured prompt
    if (attachedFiles.length > 0) {
      const fileParts = []
      // ── Build display text (CHAT UI) — hanya pertanyaan + nama file ──
      const fileNames = attachedFiles.map(f => f.name).join(', ')
      const questionText = finalMessage || 'Analisis file ini'
      displayMessage = `${questionText} 📎 ${fileNames}`
      
      for (const f of attachedFiles) {
        // Limit content: max 12000 chars per file
        const rawText = f.text || ''
        const limitedText = rawText.length > 12000 ? rawText.slice(0, 12000) + '\n... (dipotong, terlalu panjang)' : rawText
        fileParts.push(`=== FILE: ${f.name} (${f.type.toUpperCase()}, ${formatFileSize(f.size)}) ===\n${limitedText}\n=== AKHIR FILE ===`)
      }
      
      const fileContent = fileParts.join('\n\n')
      const userQuestion = finalMessage || 'Analisis semua file yang saya upload secara detail. '
        + 'Jika ada tabel, jelaskan struktur dan data pentingnya. '
        + 'Beri ringkasan, data utama, analisis, dan rekomendasi.'
      
      finalMessage = `[FILE_ANALYSIS]\n${userQuestion}\n\n${fileContent}`
    }

    if (!finalMessage) return
    
    // Kirim: (text untuk AI, displayText untuk chat UI)
    sendMessage(finalMessage, displayMessage)
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
      <div className="fixed top-0 right-0 h-full w-[580px] max-w-[calc(100vw-32px)] z-[201]
                       bg-gradient-to-b from-white via-[#fafbfd] to-[#f5f6fa]
                       backdrop-blur-2xl
                       border-l border-white/30
                       shadow-[-12px_0_80px_rgba(0,0,0,0.12),-4px_0_20px_rgba(0,0,0,0.04)]
                       flex flex-col
                       animate-slide-in-right">

        {/* ── Subtle top glow ── */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

        {/* ── HEADER ── */}
        <div className="relative flex items-center justify-between px-6 py-5 border-b border-slate-200/40 bg-white/50 backdrop-blur-xl">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20 ring-1 ring-white/20">
              <span className="material-symbols-outlined text-white text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-2">
                AI Assistant
                <span className="px-1.5 py-0.5 rounded-md bg-gradient-to-r from-primary/10 to-blue-500/10 text-[9px] font-semibold text-primary tracking-wider uppercase">
                  Premium
                </span>
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">{context?.title || 'Asisten Cerdas'}</p>
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            {hasChat && (
              <button onClick={resetChat} 
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100/80 
                           transition-all duration-200 active:scale-90 group relative"
                title="Hapus riwayat">
                <span className="material-symbols-outlined text-[18px] group-hover:scale-110 transition-transform">delete_sweep</span>
              </button>
            )}
            <button onClick={onClose} 
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100/80 
                         transition-all duration-200 active:scale-90 group relative"
              title="Tutup">
              <span className="material-symbols-outlined text-[18px] group-hover:rotate-90 transition-transform duration-300">close</span>
            </button>
          </div>
        </div>

        {/* ── CHAT AREA ── */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-5 space-y-4 scroll-smooth
                                       [&::-webkit-scrollbar]:w-1.5
                                       [&::-webkit-scrollbar-thumb]:rounded-full
                                       [&::-webkit-scrollbar-thumb]:bg-slate-200
                                       [&::-webkit-scrollbar-thumb]:hover:bg-slate-300
                                       [&::-webkit-scrollbar-track]:bg-transparent">
          {/* Welcome */}
          {!hasChat && (
            <div className="flex flex-col items-center text-center pt-12 pb-6 px-4">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-blue-500/10 
                              flex items-center justify-center mb-5 
                              ring-1 ring-primary/15 shadow-inner shadow-primary/5">
                <span className="material-symbols-outlined text-3xl text-primary/60" style={{ fontVariationSettings: "'FILL' 1" }}>chat_bubble</span>
              </div>
              <h4 className="text-[17px] font-bold text-slate-800 mb-1.5 tracking-tight">Selamat datang! 👋</h4>
              <p className="text-[13px] text-slate-400 leading-relaxed max-w-[300px]">
                Tanya apa saja seputar administrasi sekolah, atau upload file untuk dianalisis AI.
              </p>
              

              
              {/* Supported file types — premium minimal */}
              <div className="flex items-center gap-3 mt-6 px-4 py-2.5 rounded-2xl bg-white/60 border border-slate-200/40 shadow-sm">
                <span className="text-[10px] font-medium text-slate-400 tracking-wide uppercase">Analisis:</span>
                <div className="flex items-center gap-2.5">
                  {[
                    { icon: 'description', label: 'DOCX', color: 'text-blue-500' },
                    { icon: 'picture_as_pdf', label: 'PDF', color: 'text-red-500' },
                    { icon: 'table_chart', label: 'Excel', color: 'text-emerald-600' },
                    { icon: 'article', label: 'Teks', color: 'text-slate-500' },
                  ].map((f) => (
                    <div key={f.label} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-50/80">
                      <span className={`material-symbols-outlined text-[13px] ${f.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{f.icon}</span>
                      <span className="text-[9px] font-semibold text-slate-500">{f.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-5"><ApiStatus /></div>
            </div>
          )}

          {/* Messages */}
          {messages.map((m, i) => <ChatBubble key={i} message={m} />)}

          {/* Loading */}
          {isLoading && !isStreaming && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center flex-shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-[15px] text-primary/50" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              </div>
              <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl rounded-tl-md px-5 py-3.5 shadow-sm">
                <div className="flex gap-1.5">
                  {[0, 150, 300].map((d) => (
                    <div key={d} className="w-2 h-2 rounded-full bg-gradient-to-b from-primary/40 to-primary/20 animate-bounce" style={{ animationDelay: `${d}ms` }} />
                  ))}
                </div>
              </div>
            </div>
          )}

          <QuickChips chips={context?.quickChips} onSelect={(q) => { setInput(''); sendMessage(q) }} visible={!hasChat && attachedFiles.length === 0} />
        </div>

        {/* ── INPUT AREA ── */}
        <div className="px-5 py-4 border-t border-slate-200/40 bg-white/60 backdrop-blur-xl space-y-2.5">
          {/* Attached files */}
          {attachedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {attachedFiles.map((f, i) => (
                <FileChip key={i} file={f} onRemove={() => removeFile(i)} />
              ))}
            </div>
          )}

          {/* Processing indicator */}
          {isProcessing && (
            <div className="flex items-center gap-2.5 px-3.5 py-2 bg-gradient-to-r from-primary/[0.04] to-blue-500/[0.04] rounded-xl border border-primary/10">
              <div className="w-3.5 h-3.5 border-[2.5px] border-primary/25 border-t-primary rounded-full animate-spin" />
              <span className="text-[11px] font-semibold text-primary/70">Memproses file...</span>
            </div>
          )}

          {/* Input row */}
          <div className="flex items-center gap-2.5">
            {/* Upload button */}
            <input ref={fileInputRef} type="file" className="hidden" multiple 
                   accept=".pdf,.xlsx,.xls,.csv,.txt,.md,.json,.xml,.html"
                   onChange={handleFileUpload} />
            <button onClick={() => fileInputRef.current?.click()} disabled={isLoading}
              className="w-11 h-11 rounded-2xl flex items-center justify-center 
                         bg-white border border-slate-200/70 text-slate-400 
                         hover:border-primary/30 hover:text-primary hover:shadow-sm hover:shadow-primary/5
                         active:scale-90 transition-all duration-200 disabled:opacity-40 group relative"
              title="Upload file">
              <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">attach_file</span>
              {/* Upload dot indicator */}
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary/30" />
            </button>

            {/* Text input */}
            <div className="flex-1 relative">
              <input ref={inputRef} type="text" value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={attachedFiles.length ? "Tanyakan tentang file..." : "Ketik pertanyaan..."}
                disabled={isLoading}
                className="w-full px-4 py-3 bg-white border border-slate-200/70 rounded-2xl text-[13.5px] text-slate-700
                           outline-none focus:border-primary/40 focus:ring-[3px] focus:ring-primary/[0.08]
                           placeholder:text-slate-400/70 disabled:opacity-40 transition-all duration-200" />
              {/* Input glow */}
              <div className="absolute inset-0 rounded-2xl opacity-0 focus-within:opacity-100 pointer-events-none transition-opacity
                              bg-gradient-to-r from-primary/[0.03] to-blue-500/[0.03]" />
            </div>

            {/* Send / Stop */}
            {isStreaming ? (
              <button onClick={cancelStreaming}
                className="w-11 h-11 rounded-2xl flex items-center justify-center 
                           bg-gradient-to-br from-red-500 to-red-600 text-white 
                           shadow-lg shadow-red-500/25 
                           hover:shadow-xl hover:shadow-red-500/30 hover:scale-105 
                           active:scale-90 transition-all duration-200">
                <span className="material-symbols-outlined text-[20px]">stop</span>
              </button>
            ) : (
              <button onClick={send} disabled={(!input.trim() && !attachedFiles.length) || isLoading}
                className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                  (input.trim() || attachedFiles.length) && !isLoading
                    ? 'bg-gradient-to-br from-primary to-blue-600 text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-105 active:scale-90'
                    : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                }`}>
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>arrow_upward</span>
              </button>
            )}
          </div>
          <p className="text-[9px] text-slate-400/70 text-center tracking-wide">AI bisa saja salah. Verifikasi data penting.</p>
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
