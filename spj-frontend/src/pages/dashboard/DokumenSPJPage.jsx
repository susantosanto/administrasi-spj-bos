/**
 * Dokumen LPJ Page — Super Premium Accordion Concept 2026
 * 
 * Fitur:
 * - Klik card → smooth scroll ke detail dengan animasi premium
 * - Satu card aktif pada satu waktu
 * - Transport: Daftar Penerima + SPPD auto-fill (inline)
 * - Animasi: fade-in, slide-up, scale, glow effects
 */
import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import storageHelper from '../../utils/storageHelper'
import { snapshotSebelumTimpa, urungkanTimpa } from '../../utils/aturanUndangan'
import { bangunPrefillLpj } from '../../utils/prefillLpj'
import Topbar from '../../components/layout/Topbar'
import { useToast } from '../../components/ui/Toast'
import { readinessCheck, sorotPelanggaran } from '../../components/templates/SummaryCard'
import { buildPreviewDocs } from '../../utils/previewDocs'
import { TEMPLATE_CONFIGS } from '../../data/templateConfig'
// Sprint 017 AD-1/AD-3: definisi kartu & panel dipindah ke modul bersama agar
// halaman LPJ dan sidebar BKU memakai sumber yang sama (satu panel, dua layout).
import { CARDS } from '../../data/kategoriLpj'
import DetailDokumenLpj from '../../components/dokumen/DetailDokumenLpj'

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function DokumenSPJPage() {
  const [selectedCard, setSelectedCard] = useState(null)
  const [selectedSubKategori, setSelectedSubKategori] = useState(null)
  const [formData, setFormData] = useState({})
  const [viewMode, setViewMode] = useState('form')
  const [isAnimating, setIsAnimating] = useState(false)
  const [sppdData, setSppdData] = useState({})
  // ─── Sprint 003 ADDENDUM (revisi panduan 2026-10-01 — BLUEPRINT R1/R2/R5) ──
  // formTab/previewTab DIANGKAT dari DokumenFormPreview (dulu useState lokal)
  // supaya MenuGuide sadar tab mana yang sedang aktif.
  const [formTab, setFormTab] = useState('daftar')
  const [previewTab, setPreviewTab] = useState('daftar')
  // Riwayat tab yang pernah dikunjungi menu aktif — kunci "<menu>:<activeTab>"
  // + "<menu>:preview" (penanda "ringkasan sudah dilihat"). Ikut RESET bersih
  // seperti formData: data detail di-wipe saat tutup/ganti menu, centang ikut hilang.
  const [visitedTabs, setVisitedTabs] = useState(() => new Set())
  const detailRef = useRef(null)
  const toast = useToast()
  const location = useLocation()
  const navigate = useNavigate()

  // ─── Sprint 005: prefill OTOMATIS dari BKU (deep-link) ────────────────────
  // SELALU TIMPA khusus jalur BKU: snapshot dulu (storage spj_otomatis_snapshot),
  // terapkan template aturan (undangan + notulen), tampilkan badge + Urungkan.
  // Dijalankan ulang tiap ada navigasi BKU baru (location.state.ts berubah)
  // agar buka-ulang baris lain menimpa tapi snapshot menyelamatkan edit manual.
  const [prefillBadge, setPrefillBadge] = useState(null)
  const [prefillSnapshot, setPrefillSnapshot] = useState(null)
  const prefillTs = useRef(0)
  const bkuTs = location.state?.ts
  useEffect(() => {
    const st = location.state
    if (!st?.fromBKU || !st?.menu || !st?.ts) return
    if (prefillTs.current === st.ts) return
    // Abaikan state basi (mis. HMR remount membaca history lama) — maks 10 menit.
    if (Date.now() - st.ts > 10 * 60 * 1000) {
      navigate(location.pathname, { replace: true })
      return
    }
    prefillTs.current = st.ts
    const card = CARDS.find((c) => c.id === st.menu)
    if (!card) return
    // Sprint 017 AD-3: isi otomatis dipindah ke utils/prefillLpj.js (fungsi murni)
    // agar sidebar BKU memakai jalur yang sama. Snapshot & setState tetap di sini.
    const { tambahan, diisi, dilewati, tertimpa, subPilih, sppdTambahan } = bangunPrefillLpj({
      card,
      bku: st.bku,
      menu: st.menu,
      subId: st.subId || '',
      formData,
    })
    // Sprint 005 D.1: snapshot SELURUH form + sppd SEBELUM timpa (1 slot terakhir).
    const snap = snapshotSebelumTimpa(
      { ...formData, sppdData: { ...sppdData } },
      [...new Set([...Object.keys(formData), ...Object.keys(tambahan), ...(sppdTambahan ? ['sppdData'] : [])])],
      st.bku?.noBukti || '',
    )
    setPrefillSnapshot(snap)
    setSelectedCard(card)
    setSelectedSubKategori(subPilih)
    setFormData(tambahan)
    if (sppdTambahan) setSppdData(sppdTambahan)
    setViewMode('form')
    setFormTab('daftar')
    setPreviewTab('daftar')
    setPrefillBadge({ menu: st.menu, diisi, dilewati, tertimpa, bku: st.bku || {} })
    if (tertimpa.length > 0) toast.info(`${tertimpa.length} field ditimpa dari BKU — bisa Urungkan`)
    else toast.success(`Form terisi dari BKU (${diisi.length} field)`)
    navigate(location.pathname, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bkuTs])

  const handleUndoPrefill = () => {
    // Sprint 005 D.1: kembalikan dari storage spj_otomatis_snapshot.
    const { nilai } = urungkanTimpa()
    if (nilai) {
      const { sppdData: s, ...f } = nilai
      setFormData(f)
      if (s && typeof s === 'object') setSppdData(s)
    } else if (prefillSnapshot) setFormData(prefillSnapshot)
    setPrefillSnapshot(null)
    setPrefillBadge(null)
    toast.info('Isian dari BKU dibatalkan')
  }

  // Konteks tab aktif (untuk panduan):
  //   form    → transport: f:<tab form> · menu lain: f:form
  //   preview → mamin/pemeliharaan: p:ringkasan · honor/transport: p:<tab preview>
  const activeTab = !selectedCard
    ? null
    : viewMode === 'form'
      ? (selectedCard.id === 'perjalanan_dinas' ? `f:${formTab}` : 'f:form')
      : (selectedCard.id === 'mamin' || selectedCard.id === 'pemeliharaan')
        ? 'p:ringkasan'
        : `p:${previewTab}`

  // Reset riwayat saat konteks data berganti (deklarasi PERTAMA — urutan efek:
  // bersihkan dulu, baru catat tab aktif di efek kedua di bawah).
  useEffect(() => {
    setVisitedTabs(new Set())
  }, [selectedCard?.id, selectedSubKategori?.id])

  // Catat tab yang sudah dikunjungi + penanda "ringkasan sudah dilihat"
  useEffect(() => {
    if (!selectedCard || !activeTab) return
    setVisitedTabs((prev) => {
      const key = `${selectedCard.id}:${activeTab}`
      const wantPreview = viewMode === 'preview'
      const previewKey = `${selectedCard.id}:preview`
      if (prev.has(key) && (!wantPreview || prev.has(previewKey))) return prev
      const next = new Set(prev)
      next.add(key)
      if (wantPreview) next.add(previewKey)
      return next
    })
  }, [selectedCard?.id, activeTab, viewMode])

  // Ctx kaya MenuGuide — predikat langkah guideConfig.js dibaca dari field NYATA
  const visitedMenu = new Set()
  if (selectedCard) {
    const prefix = `${selectedCard.id}:`
    visitedTabs.forEach((k) => {
      if (k.startsWith(prefix)) visitedMenu.add(k.slice(prefix.length))
    })
  }
  const guideCtx = {
    subId: selectedSubKategori?.id,
    activeTab: activeTab || 'f:form',
    visited: visitedMenu,
    rowsCount: (formData.rows || []).length,
    nomor: formData.nomor,
    nomorSpt: formData.nomorSpt,
    nomorSppd: sppdData.nomorSurat,
    sppdTanggal: sppdData.tanggal,
    resume: formData.resume,
    nomorUndangan: formData.nomorUndangan,
    isiUndangan: formData.isiUndangan,
    acara: formData.acara,
    tanggal: formData.tanggal,
    btFilled: Object.values(formData.bukuTamu || {}).some((v) =>
      Array.isArray(v) ? v.length > 0 : v !== null && v !== undefined && v !== ''
    ),
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  const getStatus = (cardId, subId) => {
    const stored = storageHelper.get('dokumen_lpj', {})
    const key = subId ? `${cardId}_${subId}` : cardId
    return stored[key]?.status || 'Belum'
  }

  // ─── Sprint 002 FASE 5 (task 5.1): reset bersih data lama ────────────────
  // ADR 2026-09-14: tanpa fungsi migrasi — data lama dibuang.
  // HANYA dokumen_lpj; spj_data_sekolah TIDAK ikut terhapus.
  const handleResetDokumenLpj = () => {
    if (!window.confirm('Reset seluruh data dokumen LPJ (termasuk Perjalanan Dinas)?\nData Sekolah & pejabat TIDAK ikut terhapus.')) return
    storageHelper.remove('dokumen_lpj')
    setSelectedCard(null)
    setSelectedSubKategori(null)
    setFormData({})
    setPrefillBadge(null)
    setPrefillSnapshot(null)
    setSppdData({})
    setViewMode('form')
    setFormTab('daftar')
    setPreviewTab('daftar')
    toast.success('Data dokumen LPJ di-reset bersih. Data Sekolah tetap utuh.')
  }

  // ─── Premium Scroll Handler ──────────────────────────────────────────────
  const scrollToDetail = () => {
    setTimeout(() => {
      if (detailRef.current) {
        const yOffset = -80 // Offset untuk sticky header
        const y = detailRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset
        window.scrollTo({
          top: y,
          behavior: 'smooth'
        })
      }
    }, 100)
  }

  // ─── Card Click Handler dengan Animasi Premium ──────────────────────────
  const handleCardClick = (card) => {
    if (selectedCard?.id === card.id) {
      // Klik card yang sama → tutup dengan animasi
      setIsAnimating(true)
      setTimeout(() => {
        setSelectedCard(null)
        setSelectedSubKategori(null)
        setFormData({})
        setFormTab('daftar')
        setPreviewTab('daftar')
        setIsAnimating(false)
      }, 200)
    } else {
      // Klik card baru → buka dengan animasi
      setIsAnimating(true)
      setSelectedCard(card)
      
      // Auto-select first non-coming-soon sub-kategori
      const firstValidSub = card.subKategori?.find(s => !s.comingSoon)
      setSelectedSubKategori(firstValidSub || null)
      setFormData({})
      setViewMode('form')
      setFormTab('daftar')
      setPreviewTab('daftar')
      
      // Trigger animation then scroll
      setTimeout(() => {
        setIsAnimating(false)
        scrollToDetail()
      }, 50)
    }
  }

  const handleCloseDetail = () => {
    setIsAnimating(true)
    setTimeout(() => {
      setSelectedCard(null)
      setSelectedSubKategori(null)
      setFormData({})
      setPrefillBadge(null)
      setPrefillSnapshot(null)
      setViewMode('form')
      setFormTab('daftar')
      setPreviewTab('daftar')
      setIsAnimating(false)
      // Scroll back to top
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 200)
  }

  const handleSubKategoriChange = (sub) => {
    setIsAnimating(true)
    setSelectedSubKategori(sub)
    setFormData({})
    setTimeout(() => setIsAnimating(false), 300)
  }

  // Revisi panduan ronde-2 (2026-10-01): klik langkah di popover → lompat ke
  // tab/mode langkah tsb + scroll ke area detail. Popover TIDAK ditutup.
  // Revisi 2026-10-06 (task 37): tak ada lagi mode preview terpisah — panel
  // selalu terlihat di samping form. Lompatan preview = tandai sudah-periksa
  // (agar langkah panduan selesai) + scroll ke panel.
  const handleGuideJump = (jump) => {
    if (!jump) return
    if (jump.mode === 'preview') {
      if (jump.tab) setPreviewTab(jump.tab)
      if (selectedCard) {
        setVisitedTabs((prev) => {
          const next = new Set(prev)
          next.add(`${selectedCard.id}:preview`)
          if (jump.tab) next.add(`${selectedCard.id}:p:${jump.tab}`)
          return next
        })
      }
    } else {
      setViewMode('form')
      if (jump.tab) setFormTab(jump.tab)
    }
    scrollToDetail()
  }

  const getTemplateConfig = () => {
    if (!selectedSubKategori?.templateId) return null
    return TEMPLATE_CONFIGS[selectedSubKategori.templateId]
  }

  // ─── Revisi 2026-10-06 (task 37): satu alur lengkapi-cek-cetak di panel ───
  // Satu sumber: formData turun ke panel (Zona B); tiap onChange re-render
  // panel + badge otomatis. Cetak formal tak tersentuh (sk-print-area selalu
  // dirender di form DokumenFormPreview, display:none di layar).
  // Revisi 2026-10-06 (task 29): label Cermin-* diganti Panel Preview Document;
  // isi panel = render A4 penuh persis dokumen cetak (batas lama "formal hanya
  // di print-area" DICABUT user).
  const panelPelanggaran = readinessCheck(formData)
  const previewDocs = buildPreviewDocs({
    cardId: selectedCard?.id,
    templateId: selectedSubKategori?.templateId,
    subId: selectedSubKategori?.id,
    formData,
    sppdData,
  })
  const handleCekPanel = () => {
    const pertama = panelPelanggaran[0]
    if (!pertama) { toast.success('Lengkap — siap cetak'); return }
    if (!sorotPelanggaran(pertama)) toast.info(pertama.label)
  }
  const handleCetakGate = () => {
    // Tulis snapshot 1 slot terakhir (spj_otomatis_snapshot) lalu cetak.
    // Revisi task 37: area cetak selalu render di form — cetak langsung,
    // tanpa pindah mode preview dulu.
    snapshotSebelumTimpa(
      { ...formData, sppdData: { ...sppdData } },
      [...new Set(Object.keys(formData))],
      formData.bkuSumber?.noBukti || '',
    )
    const printContainer = document.querySelector('.sk-print-area .print-container')
    if (printContainer) {
      printContainer.classList.remove('portrait', 'landscape')
      printContainer.classList.add(getTemplateConfig()?.orientation || 'portrait')
    }
    window.print()
  }

  // ─── Print Handler ───────────────────────────────────────────────────────
  const handlePrint = () => {
    const config = getTemplateConfig()
    if (!config) {
      toast.info(`Cetak ${selectedCard.nama}`)
      return
    }
    
    const printContainer = document.querySelector('.sk-print-area .print-container')
    if (printContainer) {
      printContainer.classList.remove('portrait', 'landscape')
      printContainer.classList.add(config.orientation || 'portrait')
    }
    
    window.print()
  }

  // ─── Auto-Fill Handler ───────────────────────────────────────────────────
  const handleAutoFill = (autoFillData) => {
    const config = getTemplateConfig()
    const columns = config?.blocks?.find(b => b.type === 'table-dinamis')?.columns || []
    
    const computedData = autoFillData.map(row => {
      const newRow = { ...row }
      columns.forEach(col => {
        if (col.auto && col.auto.type) {
          const fields = col.auto.fields || []
          const values = fields.map(f => {
            const v = parseFloat(String(newRow[f] || '0').replace(/[^\d.-]/g, ''))
            return isNaN(v) ? 0 : v
          })
          
          switch (col.auto.type) {
            case 'sum': newRow[col.key] = values.reduce((a, b) => a + b, 0); break
            case 'mul': newRow[col.key] = values.reduce((a, b) => a * b, 1); break
            case 'sub': newRow[col.key] = values.length >= 2 ? values[0] - values[1] : 0; break
          }
        }
      })
      return newRow
    })
    
    const existingRows = formData.rows || []
    setFormData({ ...formData, rows: [...existingRows, ...computedData] })
  }

  // ─── Grouped Cards ───────────────────────────────────────────────────────
  const bkuUtama = CARDS.filter((c) => c.kategori === 'BKU Utama')
  const dokumenPendukung = CARDS.filter((c) => c.kategori === 'Dokumen Pendukung')

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER: ACCORDION CARD
  // ═══════════════════════════════════════════════════════════════════════════

  const renderCard = (card, isCompact = false) => {
    const isSelected = selectedCard?.id === card.id

    if (isCompact) {
      return (
        <button
          key={card.id}
          onClick={() => handleCardClick(card)}
          className={`group relative bg-white rounded-xl border-2 p-4 text-left transition-all duration-500 ease-out ${
            isSelected
              ? 'border-primary ring-4 ring-primary/10 shadow-lg shadow-primary/10 scale-[1.02]'
              : 'border-slate-200 hover:border-slate-300 hover:shadow-md hover:scale-[1.01]'
          }`}
        >
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-all duration-300 ${
            isSelected ? 'bg-primary text-white scale-110' : 'bg-slate-100 text-slate-600 group-hover:scale-105'
          }`}>
            <span className="material-symbols-outlined text-xl">{card.icon}</span>
          </div>
          <h4 className="text-sm font-bold text-slate-800 mb-1">{card.nama}</h4>
          <p className="text-[10px] text-slate-500 line-clamp-2">{card.deskripsi}</p>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[10px] font-medium text-slate-400">Informasi</span>
            <span className={`material-symbols-outlined text-sm transition-all duration-300 ${
              isSelected ? 'text-primary rotate-90' : 'text-slate-300 group-hover:translate-x-1'
            }`}>
              chevron_right
            </span>
          </div>
        </button>
      )
    }

    // Full card untuk BKU Utama
    return (
      <button
        key={card.id}
        onClick={() => handleCardClick(card)}
        className={`group relative bg-white rounded-2xl border-2 p-5 text-left transition-all duration-500 ease-out overflow-hidden ${
          isSelected
            ? 'border-primary ring-4 ring-primary/10 shadow-xl shadow-primary/15 scale-[1.02]'
            : 'border-slate-200 hover:border-slate-300 hover:shadow-lg hover:scale-[1.01]'
        }`}
      >
        {/* Premium Glow Effect */}
        <div className={`absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent transition-opacity duration-500 ${
          isSelected ? 'opacity-100' : 'opacity-0'
        }`} />
        
        {/* Top Row */}
        <div className="relative flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 ${
              isSelected 
                ? 'bg-gradient-to-br from-primary to-blue-600 text-white scale-110 shadow-lg shadow-primary/30' 
                : 'bg-slate-100 text-slate-600 group-hover:scale-105'
            }`}>
              <span className="material-symbols-outlined text-2xl">{card.icon}</span>
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-800">{card.nama}</h4>
              <p className="text-xs text-slate-500 mt-0.5">{card.deskripsi}</p>
            </div>
          </div>
        </div>

        {/* Sub-Kategori Pills */}
        <div className="relative flex flex-wrap gap-1.5">
          {card.subKategori?.map((sub) => {
            const subStatus = getStatus(card.id, sub.id)
            const isComplete = subStatus === 'Lengkap'
            const isDraft = subStatus === 'Draft'

            return (
              <span
                key={sub.id}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-all duration-300 ${
                  sub.comingSoon
                    ? 'bg-slate-100 text-slate-400'
                    : isComplete
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : isDraft
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-slate-50 text-slate-600 border border-slate-200'
                }`}
              >
                {isComplete && <span className="text-emerald-500">✓</span>}
                {isDraft && <span className="text-amber-500">◐</span>}
                {sub.label}
                {sub.comingSoon && <span className="text-slate-400"> Soon</span>}
              </span>
            )
          })}
        </div>

        {/* Arrow Indicator */}
        <div className={`absolute right-4 top-1/2 -translate-y-1/2 transition-all duration-500 ${
          isSelected ? 'text-primary opacity-100' : 'text-slate-300 opacity-0 group-hover:opacity-100'
        }`}>
          <span className={`material-symbols-outlined transition-transform duration-500 ${
            isSelected ? 'rotate-90' : 'group-hover:translate-x-1'
          }`}>
            chevron_right
          </span>
        </div>
      </button>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER: DETAIL PANEL (PREMIUM ACCORDION)
  // Sprint 017 AD-1: JSX panel dipindah ke components/dokumen/DetailDokumenLpj.jsx
  // agar sidebar BKU memakai komponen yang SAMA. layout='side' = perilaku lama.
  // ═══════════════════════════════════════════════════════════════════════════

  const renderDetailPanel = () => {
    if (!selectedCard) return null
    return (
      <DetailDokumenLpj
        card={selectedCard}
        selectedSub={selectedSubKategori}
        onSubChange={handleSubKategoriChange}
        getStatus={getStatus}
        formData={formData}
        setFormData={setFormData}
        sppdData={sppdData}
        setSppdData={setSppdData}
        viewMode={viewMode}
        setViewMode={setViewMode}
        formTab={formTab}
        setFormTab={setFormTab}
        previewTab={previewTab}
        setPreviewTab={setPreviewTab}
        onClose={handleCloseDetail}
        onCek={handleCekPanel}
        onCetak={handleCetakGate}
        onPrint={handlePrint}
        onAutoFill={handleAutoFill}
        previewDocs={previewDocs}
        pelanggaran={panelPelanggaran}
        prefillBadge={prefillBadge}
        onUndoPrefill={handleUndoPrefill}
        guideCtx={guideCtx}
        onGuideJump={handleGuideJump}
        getTemplateConfig={getTemplateConfig}
        isAnimating={isAnimating}
        detailRef={detailRef}
        layout="side"
      />
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER: MAIN
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <Topbar title="Dokumen LPJ" subtitle="Susun dan cetak dokumen pertanggungjawaban" />

      {/* Lebar penuh (revisi 2026-10-06 task 34): grid kategori + panel detail
          sama-sama full width selebar card detail (tanpa max-w-7xl) agar
          konsisten di semua viewport. */}
      <div className="p-lg space-y-6 flex-1 w-full max-w-none mx-auto">
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* BKU UTAMA SECTION                                                  */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className="space-y-4 w-full">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-gradient-to-b from-primary to-blue-600 rounded-full" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">BKU Utama</h3>
            <span className="text-xs text-slate-500">— Dokumen utama pertanggungjawaban</span>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleResetDokumenLpj}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-500 hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all"
              title="Buang seluruh data dokumen LPJ lama (skema baru) — Data Sekolah tidak ikut terhapus"
            >
              <span className="material-symbols-outlined text-sm">restart_alt</span>
              Reset Data Dokumen LPJ
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bkuUtama.map((card) => renderCard(card))}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* DOKUMEN PENDUKUNG SECTION                                          */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className="space-y-4 w-full">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-gradient-to-b from-slate-400 to-slate-500 rounded-full" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Dokumen Pendukung</h3>
            <span className="text-xs text-slate-500">— Informasi tambahan dan blanko</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {dokumenPendukung.map((card) => renderCard(card, true))}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* ACCORDION DETAIL PANEL                                             */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {renderDetailPanel()}      </div>

    </div>
  )
}
