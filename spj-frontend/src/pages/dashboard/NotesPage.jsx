/**
 * Notes Page — Ultra Premium Design 2026
 * Catatan penting terkait BOS dengan note-taking premium
 */
import { useState, useEffect, useRef } from 'react'
import storageHelper from '../../utils/storageHelper'
import Topbar from '../../components/layout/Topbar'
import { useToast } from '../../components/ui/Toast'

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const CATEGORIES = [
  { key: 'semua', label: 'Semua', icon: 'notes', color: 'slate' },
  { key: 'bos', label: 'BOS', icon: 'account_balance', color: 'blue' },
  { key: 'dokumen', label: 'Dokumen', icon: 'description', color: 'violet' },
  { key: 'keuangan', label: 'Keuangan', icon: 'payments', color: 'emerald' },
  { key: 'jadwal', label: 'Jadwal', icon: 'event', color: 'amber' },
  { key: 'lainnya', label: 'Lainnya', icon: 'more_horiz', color: 'slate' },
]

const COLORS = [
  { key: 'white', bg: 'bg-white', border: 'border-slate-200', text: 'text-slate-800' },
  { key: 'blue', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800' },
  { key: 'emerald', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800' },
  { key: 'amber', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800' },
  { key: 'violet', bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-800' },
  { key: 'rose', bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-800' },
]

const defaultNotes = [
  {
    id: 1,
    title: 'Jadwal Pencairan BOSP Tahap 2',
    content: 'Pencairan BOSP tahap 2 diperkirakan minggu kedua bulan Juli. Pastikan semua dokumen LPJ tahap 1 sudah lengkap dan terupload.',
    category: 'bos',
    color: 'blue',
    isPinned: true,
    createdAt: '2026-07-08T10:00:00',
    updatedAt: '2026-07-08T10:00:00',
  },
  {
    id: 2,
    title: 'Dokumen yang Perlu Dipersiapkan',
    content: '1. LPJ BOS Tahap 1\n2. BKU Realisasi\n3. Bukti Fisik (Kwitansi, Nota)\n4. Surat Pertanggungjawaban\n5. Daftar Hadir Kegiatan',
    category: 'dokumen',
    color: 'violet',
    isPinned: true,
    createdAt: '2026-07-07T14:30:00',
    updatedAt: '2026-07-07T14:30:00',
  },
  {
    id: 3,
    title: 'Anggaran Honor Guru',
    content: 'Total anggaran honor guru semester 2: Rp 45.000.000\nSudah terpakai: Rp 32.500.000\nSisa: Rp 12.500.000',
    category: 'keuangan',
    color: 'emerald',
    isPinned: false,
    createdAt: '2026-07-05T09:15:00',
    updatedAt: '2026-07-05T09:15:00',
  },
  {
    id: 4,
    title: 'Deadline Laporan',
    content: 'Batas waktu pengumpulan LPJ BOS tahap 1: 15 Juli 2026\nBatas waktu upload bukti fisik: 20 Juli 2026',
    category: 'jadwal',
    color: 'amber',
    isPinned: false,
    createdAt: '2026-07-04T11:00:00',
    updatedAt: '2026-07-04T11:00:00',
  },
]

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function NotesPage() {
  const [notes, setNotes] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('semua')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('grid')
  const [showEditor, setShowEditor] = useState(false)
  const [editingNote, setEditingNote] = useState(null)
  const [editorTitle, setEditorTitle] = useState('')
  const [editorContent, setEditorContent] = useState('')
  const [editorCategory, setEditorCategory] = useState('bos')
  const [editorColor, setEditorColor] = useState('white')
  const toast = useToast()
  const editorRef = useRef(null)

  // Load notes from storage
  useEffect(() => {
    const stored = storageHelper.get('notes', null)
    if (stored && stored.length > 0) {
      setNotes(stored)
    } else {
      setNotes(defaultNotes)
      storageHelper.set('notes', defaultNotes)
    }
  }, [])

  // Save notes to storage
  const saveNotes = (newNotes) => {
    setNotes(newNotes)
    storageHelper.set('notes', newNotes)
  }

  // ─── Filter Notes ──────────────────────────────────────────────
  const filteredNotes = notes.filter(note => {
    const matchCategory = selectedCategory === 'semua' || note.category === selectedCategory
    const matchSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        note.content.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCategory && matchSearch
  })

  // Sort: pinned first, then by date
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1
    return new Date(b.updatedAt) - new Date(a.updatedAt)
  })

  // ─── Create New Note ──────────────────────────────────────────
  const handleCreateNote = () => {
    setEditingNote(null)
    setEditorTitle('')
    setEditorContent('')
    setEditorCategory('bos')
    setEditorColor('white')
    setShowEditor(true)
  }

  // ─── Edit Note ────────────────────────────────────────────────
  const handleEditNote = (note) => {
    setEditingNote(note)
    setEditorTitle(note.title)
    setEditorContent(note.content)
    setEditorCategory(note.category)
    setEditorColor(note.color)
    setShowEditor(true)
  }

  // ─── Save Note ────────────────────────────────────────────────
  const handleSaveNote = () => {
    if (!editorTitle.trim()) {
      toast.error('Judul catatan harus diisi')
      return
    }

    const now = new Date().toISOString()

    if (editingNote) {
      // Update existing note
      const updated = notes.map(n =>
        n.id === editingNote.id
          ? { ...n, title: editorTitle, content: editorContent, category: editorCategory, color: editorColor, updatedAt: now }
          : n
      )
      saveNotes(updated)
      toast.success('Catatan berhasil diperbarui')
    } else {
      // Create new note
      const newNote = {
        id: Date.now(),
        title: editorTitle,
        content: editorContent,
        category: editorCategory,
        color: editorColor,
        isPinned: false,
        createdAt: now,
        updatedAt: now,
      }
      saveNotes([newNote, ...notes])
      toast.success('Catatan baru berhasil dibuat')
    }

    setShowEditor(false)
  }

  // ─── Delete Note ──────────────────────────────────────────────
  const handleDeleteNote = (id) => {
    if (window.confirm('Hapus catatan ini?')) {
      const updated = notes.filter(n => n.id !== id)
      saveNotes(updated)
      toast.success('Catatan berhasil dihapus')
    }
  }

  // ─── Toggle Pin ───────────────────────────────────────────────
  const handleTogglePin = (id) => {
    const updated = notes.map(n =>
      n.id === id ? { ...n, isPinned: !n.isPinned } : n
    )
    saveNotes(updated)
  }

  // ─── Format Date ──────────────────────────────────────────────
  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now - date
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return 'Hari ini'
    if (days === 1) return 'Kemarin'
    if (days < 7) return `${days} hari lalu`
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  // ═══════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════

  return (
    <div className="flex flex-col min-h-screen bg-slate-100/80">
      <Topbar title="Catatan" subtitle="Catatan penting terkait BOS" />

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 flex-1 max-w-[1400px] mx-auto w-full">

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* HEADER ACTIONS                                                  */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari catatan..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <span className="material-symbols-outlined text-lg">grid_view</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <span className="material-symbols-outlined text-lg">view_list</span>
              </button>
            </div>

            {/* Add Note Button */}
            <button
              onClick={handleCreateNote}
              className="flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-gradient-to-r from-primary to-blue-600 text-white rounded-2xl text-sm font-semibold hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              <span className="hidden sm:inline">Buat Catatan</span>
            </button>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* CATEGORY TABS                                                   */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map(cat => {
            const count = cat.key === 'semua'
              ? notes.length
              : notes.filter(n => n.category === cat.key).length
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                  selectedCategory === cat.key
                    ? 'bg-white text-primary shadow-md shadow-slate-200/50'
                    : 'bg-white/50 text-slate-500 hover:bg-white hover:text-slate-700'
                }`}
              >
                <span className="material-symbols-outlined text-lg">{cat.icon}</span>
                <span>{cat.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  selectedCategory === cat.key ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-500'
                }`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* NOTES GRID                                                      */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {sortedNotes.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-16 text-center shadow-sm">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center mx-auto mb-6 shadow-inner">
              <span className="material-symbols-outlined text-5xl text-slate-300">note_add</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Belum Ada Catatan</h3>
            <p className="text-sm text-slate-500 mb-8 max-w-sm mx-auto">
              Buat catatan baru untuk menyimpan informasi penting terkait BOS
            </p>
            <button
              onClick={handleCreateNote}
              className="inline-flex items-center gap-2.5 bg-gradient-to-r from-primary to-blue-600 text-white px-8 py-4 rounded-2xl font-semibold text-sm hover:shadow-xl hover:shadow-primary/25 hover:scale-[1.02] transition-all duration-300 active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              Buat Catatan Pertama
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {sortedNotes.map(note => {
              const colorStyle = COLORS.find(c => c.key === note.color) || COLORS[0]
              const catInfo = CATEGORIES.find(c => c.key === note.category) || CATEGORIES[5]
              return (
                <div
                  key={note.id}
                  className={`group relative ${colorStyle.bg} rounded-2xl border ${colorStyle.border} p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer`}
                  onClick={() => handleEditNote(note)}
                >
                  {/* Pin Badge */}
                  {note.isPinned && (
                    <div className="absolute top-3 right-3">
                      <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>push_pin</span>
                    </div>
                  )}

                  {/* Category Badge */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                      note.category === 'bos' ? 'bg-blue-100 text-blue-700' :
                      note.category === 'dokumen' ? 'bg-violet-100 text-violet-700' :
                      note.category === 'keuangan' ? 'bg-emerald-100 text-emerald-700' :
                      note.category === 'jadwal' ? 'bg-amber-100 text-amber-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      <span className="material-symbols-outlined text-xs">{catInfo.icon}</span>
                      {catInfo.label}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className={`text-base font-bold ${colorStyle.text} mb-2 line-clamp-2 pr-6`}>
                    {note.title}
                  </h3>

                  {/* Content Preview */}
                  <p className={`text-sm ${colorStyle.text} opacity-70 line-clamp-3 mb-4 whitespace-pre-line`}>
                    {note.content}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-200/50">
                    <span className="text-[10px] text-slate-400 font-medium">
                      {formatDate(note.updatedAt)}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleTogglePin(note.id) }}
                        className="p-1.5 hover:bg-white/80 rounded-lg transition-colors"
                        title={note.isPinned ? 'Unpin' : 'Pin'}
                      >
                        <span className="material-symbols-outlined text-sm text-slate-500">push_pin</span>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteNote(note.id) }}
                        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus"
                      >
                        <span className="material-symbols-outlined text-sm text-red-500">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* List View */
          <div className="space-y-3">
            {sortedNotes.map(note => {
              const colorStyle = COLORS.find(c => c.key === note.color) || COLORS[0]
              const catInfo = CATEGORIES.find(c => c.key === note.category) || CATEGORIES[5]
              return (
                <div
                  key={note.id}
                  className={`group relative ${colorStyle.bg} rounded-2xl border ${colorStyle.border} p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer`}
                  onClick={() => handleEditNote(note)}
                >
                  <div className="flex items-start gap-4">
                    {/* Pin */}
                    {note.isPinned && (
                      <span className="material-symbols-outlined text-primary text-lg mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>push_pin</span>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          note.category === 'bos' ? 'bg-blue-100 text-blue-700' :
                          note.category === 'dokumen' ? 'bg-violet-100 text-violet-700' :
                          note.category === 'keuangan' ? 'bg-emerald-100 text-emerald-700' :
                          note.category === 'jadwal' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {catInfo.label}
                        </span>
                        <span className="text-[10px] text-slate-400">{formatDate(note.updatedAt)}</span>
                      </div>
                      <h3 className={`text-base font-bold ${colorStyle.text} mb-1`}>{note.title}</h3>
                      <p className={`text-sm ${colorStyle.text} opacity-70 line-clamp-2`}>{note.content}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleTogglePin(note.id) }}
                        className="p-2 hover:bg-white/80 rounded-lg transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm text-slate-500">push_pin</span>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteNote(note.id) }}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm text-red-500">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Stats */}
        {notes.length > 0 && (
          <div className="text-center pt-4">
            <p className="text-xs text-slate-400 font-medium">
              {notes.length} catatan • {notes.filter(n => n.isPinned).length} dipasang
            </p>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* NOTE EDITOR MODAL                                               */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {showEditor && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setShowEditor(false)}>
          <div
            ref={editorRef}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Editor Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                {editingNote ? 'Edit Catatan' : 'Catatan Baru'}
              </h3>
              <button
                onClick={() => setShowEditor(false)}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <span className="material-symbols-outlined text-slate-500">close</span>
              </button>
            </div>

            {/* Editor Body */}
            <div className="p-6 space-y-5 overflow-y-auto max-h-[60vh]">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Judul</label>
                <input
                  type="text"
                  value={editorTitle}
                  onChange={(e) => setEditorTitle(e.target.value)}
                  placeholder="Judul catatan..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base font-semibold text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white outline-none transition-all"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Isi Catatan</label>
                <textarea
                  ref={editorRef}
                  value={editorContent}
                  onChange={(e) => setEditorContent(e.target.value)}
                  placeholder="Tulis catatan di sini..."
                  rows={8}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white outline-none transition-all resize-none"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Kategori</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.filter(c => c.key !== 'semua').map(cat => (
                    <button
                      key={cat.key}
                      onClick={() => setEditorCategory(cat.key)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        editorCategory === cat.key
                          ? 'bg-primary text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">{cat.icon}</span>
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Warna</label>
                <div className="flex items-center gap-2">
                  {COLORS.map(color => (
                    <button
                      key={color.key}
                      onClick={() => setEditorColor(color.key)}
                      className={`w-10 h-10 rounded-xl ${color.bg} border-2 transition-all ${
                        editorColor === color.key
                          ? 'border-primary scale-110 shadow-md'
                          : 'border-slate-200 hover:scale-105'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Editor Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowEditor(false)}
                className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleSaveNote}
                className="px-6 py-2.5 bg-gradient-to-r from-primary to-blue-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all active:scale-[0.98]"
              >
                {editingNote ? 'Simpan Perubahan' : 'Buat Catatan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
