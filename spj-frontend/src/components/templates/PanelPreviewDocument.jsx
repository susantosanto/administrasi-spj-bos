/**
 * PanelPreviewDocument — Panel Preview Document A4 ala SIMENULIS.
 * Isi = render A4 penuh persis dokumen cetak via TemplateEngine mode=print
 * (docs dari buildPreviewDocs — mirror area cetak), live-sync dari formData
 * (murni props, tanpa state ganda). Skala-agar-muat + zoom 50-150% / Reset /
 * fullscreen hanya ubah tampilan layar. Opsi centralizedPrint mengalihkan daftar
 * aktif ke portal formal agar hanya pilihan pengguna yang masuk ke cetak.
 *
 * Revisi 2026-10-06 (task 37): satu alur lengkapi-cek-cetak di panel —
 * badge readiness (LENGKAP/N-PERLU-DIISI) di header, tombol Cek + Cetak
 * di bar status. Cetak terhalang (disabled) selama belum LENGKAP.
 */
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import TemplateEngine from './TemplateEngine'
import { SKHonorer } from './blocks'
import PaperSizeSelector from './PaperSizeSelector'
import { PAPER_EVENT, getPaperSize } from '../../utils/paperSize'
import { sorotPelanggaran } from './SummaryCard'
import FotoDokumenPaper from './FotoDokumenPaper'
import { createPrintSelection, flattenPrintDocs, selectedPrintDocs, syncPrintSelection, togglePrintSelection } from '../../utils/printSelection'

/** Tinggi/lebar kertas terpilih (A4 / F4) untuk satu orientasi. */
function ukuranKertas(kertas, landscape) {
  if (landscape) return { lebar: '297mm', tinggi: '210mm' }
  return kertas === 'F4' ? { lebar: '215.9mm', tinggi: '330mm' } : { lebar: '210mm', tinggi: '297mm' }
}

function ScaledPaper({ doc, zoom, kertas }) {
  const wrapRef = useRef(null)
  const paperRef = useRef(null)
  const landscape = doc.templateConfig?.orientation === 'landscape'
  const { lebar, tinggi } = ukuranKertas(kertas, landscape)

  // Skala-agar-muat via mutasi DOM langsung (tanpa React state) — anti-loop
  // by design: tak ada setState sehingga tak mungkin nested-update storm.
  // transform tak memengaruhi offsetWidth/offsetHeight, hasil ukur stabil.
  useLayoutEffect(() => {
    const wrap = wrapRef.current
    const paper = paperRef.current
    if (!wrap || !paper) return
    const measure = () => {
      // Lebar muat = content-box wrap (clientWidth termasuk padding p-2;
      // tanpa koreksi ini kertas meluber 16px lalu terpotong overflow-hidden).
      const cs = window.getComputedStyle(wrap)
      const padX = (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0)
      const padY = (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0)
      const avail = Math.max(1, wrap.clientWidth - padX - 2)
      const natural = paper.offsetWidth || 1
      const scale = +(Math.min(1, avail / natural) * zoom).toFixed(4)
      // ⚠️ TEMUAN USER 2026-10-22: "posisi dokumen di pinggir bukan di tengah".
      // `transform-origin: top left` + scale membuat kertas selalu menempel di
      // tepi kiri (terukur: jarak kiri 8px, kanan 575px). Digeser sebesar sisa
      // ruang dibagi dua supaya kertas benar-benar di tengah kiri-kanan.
      // translateX di DEPAN scale → satuan px induk (tidak ikut diperkecil).
      const sisa = avail - natural * scale
      const geser = landscape ? Math.max(0, sisa / 2) : sisa / 2
      paper.style.transform = `translateX(${geser.toFixed(2)}px) scale(${scale})`
      wrap.style.height = `${Math.round(paper.offsetHeight * scale) + Math.round(padY)}px`
    }
    measure()
    let ro = null
    if (typeof ResizeObserver !== 'undefined') {
      let lastW = 0
      ro = new ResizeObserver((entries) => {
        const w = entries[0]?.contentRect?.width || 0
        if (lastW > 0 && Math.abs(w - lastW) < 1) return
        lastW = w
        measure()
      })
      ro.observe(wrap)
    }
    window.addEventListener('resize', measure)
    return () => {
      if (ro) ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  })

  return (
    <figure className="space-y-1.5">
      <figcaption className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        <span className="material-symbols-outlined text-sm text-primary">description</span>
        {doc.label}
        {landscape && <span className="font-semibold normal-case text-slate-400">(landscape)</span>}
      </figcaption>
      <div ref={wrapRef} className={`${landscape ? 'overflow-x-auto' : 'overflow-hidden'} rounded-lg bg-slate-200/60 dark:bg-white/5 p-2`}>
        <div
          ref={paperRef}
          className="panel-a4-paper bg-white shadow-md dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.65)]"
          style={{
            width: lebar,
            minHeight: tinggi,
            padding: landscape ? '15mm 20mm' : '20mm 25mm',
            transformOrigin: 'top left',
          }}
        >
          {doc.kind === 'sk' ? (
            <SKHonorer data={doc.data} mode="preview" />
          ) : doc.kind === 'foto' ? (
            /* Sprint 019 revisi: dokumen foto (upload + generate AI) — satu
               set dengan dokumen LPJ lain di panel utama (keputusan user). */
            <FotoDokumenPaper data={doc.data} />
          ) : (
            <TemplateEngine templateConfig={doc.templateConfig} data={doc.data} mode="print" />
          )}
        </div>
      </div>
    </figure>
  )
}

export default function PanelPreviewDocument({ title, docs = [], status = null, onCek = null, onCetak = null, cetakAktif = null, centralizedPrint = false, printSnapshot = null, panelHeader = null }) {
  const [zoom, setZoom] = useState(1)
  // Sprint 030: kartu lomba memakai tab (Undangan/Surat Tugas/Daftar Hadir/
  // Proposal) → kertas preview cukup SATU, checklist tetap menampilkan
  // semua dokumen di bawah. Kartu lain = 'semua' (perilaku lama).
  const [tabDokumen, setTabDokumen] = useState(panelHeader ? 'undangan' : 'semua')
  const flatDocsAwal = flattenPrintDocs(docs)
  const docKeys = flatDocsAwal.map((doc) => doc.key)
  // Sprint 030 (PRD baris 1 & 10-12): checklist cetak = SEMUA dokumen
  // (di bawah), tetapi KERTAS preview cukup satu yang dipilih via tab —
  // Undangan / Surat Tugas / Daftar Hadir / Proposal. Tidak bertumpuk.
  const TAB_KE_KERTAS = {
    undangan: 'lomba-undangan',
    surat_tugas: 'lomba-surat_tugas',
    daftar_hadir: 'lomba-daftar_hadir',
    proposal: 'lomba-proposal',
  }
  const kunciKertas = TAB_KE_KERTAS[tabDokumen]
  const flatDocs = kunciKertas
    ? flatDocsAwal.filter((d) => d.key === kunciKertas)
    : flatDocsAwal
  const flatPrintDocs = flattenPrintDocs(printSnapshot?.length ? printSnapshot : docs)
  const docKeySignature = docKeys.join('|')
  const previousDocKeys = useRef(docKeys)
  const [dokumenAktif, setDokumenAktif] = useState(() => createPrintSelection(docs))
  const [fsGagal, setFsGagal] = useState(false)
  const [isFs, setIsFs] = useState(false)
  const panelRef = useRef(null)

  // ⚠️ TEMUAN USER 2026-10-22: "tinggi card panel preview = tinggi kertas
  // (A4/F4) sesuai pilihan". Sebelumnya tinggi kartu dipatok
  // `100vh - 104px` sehingga satu lembar A4 (297mm ≈ 1123px) TERPOTONG di
  // tengah dan harus di-scroll di dalam kartu. Sekarang area dokumen memakai
  // tinggi kertas terpilih; kartu ikut memanjang, halaman yang men-scroll.
  const [kertas, setKertas] = useState(getPaperSize())
  useEffect(() => {
    const previous = previousDocKeys.current
    setDokumenAktif((current) => syncPrintSelection(docs, current, previous))
    previousDocKeys.current = docKeys
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docKeySignature])
  useEffect(() => {
    const resetPilihan = () => setDokumenAktif(createPrintSelection(docs))
    window.addEventListener('afterprint', resetPilihan)
    return () => window.removeEventListener('afterprint', resetPilihan)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docKeySignature])
  useEffect(() => {
    const sinkron = (e) => {
      if (e?.detail?.paper) setKertas(e.detail.paper)
    }
    window.addEventListener(PAPER_EVENT, sinkron)
    return () => window.removeEventListener(PAPER_EVENT, sinkron)
  }, [])
  // Orientasi ikut dokumen pertama (kartu ini menampung satu set dokumen yang
  // orientasinya sama). +30px = baris judul dokumen (figcaption) di atas kertas.
  const lanskap = docs[0]?.templateConfig?.orientation === 'landscape'
  const tinggiKertas = ukuranKertas(kertas, lanskap).tinggi
  const tinggiArea = `calc(${tinggiKertas} + 30px)`

  const zoomIn = () => setZoom((z) => Math.min(1.5, +(z + 0.25).toFixed(2)))
  const zoomOut = () => setZoom((z) => Math.max(0.5, +(z - 0.25).toFixed(2)))
  const bukaFullscreen = () => {
    const el = panelRef.current
    if (!el || !el.requestFullscreen) { setFsGagal(true); return }
    Promise.resolve(el.requestFullscreen()).catch(() => setFsGagal(true))
  }
  const keluarFullscreen = () => {
    if (document.fullscreenElement) {
      Promise.resolve(document.exitFullscreen()).catch(() => setIsFs(false))
    } else {
      setIsFs(false)
    }
  }
  // Sinkron status fullscreen (termasuk keluar via tombol Esc bawaan browser).
  useEffect(() => {
    const sinkron = () => setIsFs(Boolean(document.fullscreenElement))
    const tombolEsc = (e) => {
      if (e.key === 'Escape' && document.fullscreenElement) keluarFullscreen()
    }
    document.addEventListener('fullscreenchange', sinkron)
    document.addEventListener('keydown', tombolEsc)
    return () => {
      document.removeEventListener('fullscreenchange', sinkron)
      document.removeEventListener('keydown', tombolEsc)
    }
  }, [])
  const handleCek = () => {
    if (onCek) { onCek(); return }
    const pertama = (status?.violations || [])[0]
    if (pertama) sorotPelanggaran(pertama)
  }
  const handleCetak = () => {
    if (!bisaCetak || (centralizedPrint && dokumenCetak.length === 0)) return
    if (centralizedPrint) {
      onCetak?.([...dokumenCetak])
      return
    }
    if (onCetak) { onCetak(); return }
    window.print()
  }
  const toggleDokumen = (key) => {
    setDokumenAktif((current) => togglePrintSelection(current, key))
  }
  const dokumenCetak = selectedPrintDocs(docs, dokumenAktif)
  const docsLayar = centralizedPrint ? flatDocs.filter((doc) => dokumenAktif.has(doc.key)) : flatDocs
  const lengkap = status ? status.perlu === 0 : null
  // cetakAktif = gate longgar opsional (mis. PBJ: boleh cetak parsial selama
  // ≥1 dokumen ada). Null = perilaku lama (gate ketat LENGKAP).
  const bisaCetak = cetakAktif ?? lengkap

  return (
    <div ref={panelRef} className="panel-preview-root print:hidden bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-transparent shadow-sm overflow-hidden">
      <style>{`.panel-preview-root .template-engine input,.panel-preview-root .template-engine textarea,.panel-preview-root .template-engine select{pointer-events:none}
.sprint008-dot{width:8px;height:8px;border-radius:9999px;background-color:#004ac6;animation:sprint008-pulse 1.6s ease-in-out infinite}
@keyframes sprint008-pulse{0%,100%{opacity:1}50%{opacity:0.25}}
@media (prefers-reduced-motion: reduce){.sprint008-dot{animation:none}}
@media print{.panel-preview-root{display:none !important}}
.sprint008-sorot{outline:3px dashed #004ac6 !important;outline-offset:2px;border-radius:0.75rem}`}</style>
      {title && (
        <div className="flex items-center gap-2 px-4 py-3 bg-primary/5 border-b border-slate-200 dark:border-transparent">
          <span className="material-symbols-outlined text-primary">preview</span>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-100 flex-1">{title}</span>
          {status && (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${lengkap ? 'bg-primary/10 text-primary' : 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200'}`} aria-live="polite">
              <span className="material-symbols-outlined text-sm">{lengkap ? 'check_circle' : 'pending'}</span>
              {lengkap ? 'LENGKAP' : `${status.perlu}-PERLU-DIISI`}
            </span>
          )}
          {isFs && (
            <button
              type="button"
              onClick={keluarFullscreen}
              aria-label="Kembali dari layar penuh (tombol Escape juga bisa)"
              className="inline-flex items-center gap-1.5 px-3 min-h-[44px] rounded-xl text-xs font-bold bg-primary text-white transition-colors focus-visible:outline-2 focus-visible:outline-primary"
            >
              <span className="material-symbols-outlined text-base">fullscreen_exit</span>
              Kembali
            </button>
          )}
        </div>
      )}
      {isFs && !title && (
        <div className="sticky top-0 z-10 flex items-center justify-end gap-2 px-4 py-2 bg-primary/5 border-b border-slate-200 dark:border-transparent">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mr-auto">Mode layar penuh — tekan Esc untuk kembali</span>
          <button
            type="button"
            onClick={keluarFullscreen}
            aria-label="Kembali dari layar penuh (tombol Escape juga bisa)"
            className="inline-flex items-center gap-1.5 px-3 min-h-[44px] rounded-xl text-xs font-bold bg-primary text-white transition-colors focus-visible:outline-2 focus-visible:outline-primary"
          >
            <span className="material-symbols-outlined text-base">fullscreen_exit</span>
            Kembali
          </button>
        </div>
      )}
      {status && (
        // ⚠️ `sticky top-0` DILEPAS 2026-10-22: sejak kartu tidak lagi menjadi
        // wadah scroll (tingginya = tinggi kertas), sticky menempel ke VIEWPORT
        // dan bertabrakan dengan header aplikasi (terlihat di screenshot).
        <div className="relative z-10 px-4 py-3 border-b border-slate-100 dark:border-transparent space-y-2 bg-white dark:bg-slate-900 shadow-[0_1px_0_0_rgba(0,0,0,0.02)]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400" aria-live="polite">
              <span className="sprint008-dot" aria-hidden="true" />
              DIPERBARUI OTOMATIS
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <PaperSizeSelector ringkas />
            <button
              type="button"
              onClick={handleCek}
              className="inline-flex items-center gap-1.5 px-3 min-h-[44px] rounded-xl text-xs font-bold bg-primary/10 text-primary hover:bg-primary/20 transition-colors focus-visible:outline-2 focus-visible:outline-primary"
            >
              <span className="material-symbols-outlined text-base">fact_check</span>
              Cek
            </button>
            <button
              type="button"
              onClick={handleCetak}
              disabled={!bisaCetak || (centralizedPrint && dokumenCetak.length === 0)}
              title={centralizedPrint && dokumenCetak.length === 0 ? 'Pilih minimal satu dokumen untuk dicetak' : bisaCetak ? 'Cetak dokumen terpilih' : 'Lengkapi dulu — tekan Cek untuk melompat ke field yang kurang'}
              className="inline-flex items-center gap-1.5 px-5 min-h-[44px] rounded-xl text-xs font-bold text-white bg-primary transition-all disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-primary"
            >
              <span className="material-symbols-outlined text-base">print</span>
              Cetak
            </button>
            <div className="inline-flex items-center gap-1" role="group" aria-label="Kontrol zoom panel">
              <button type="button" onClick={zoomOut} disabled={zoom <= 0.5} aria-label="Perkecil panel" className="inline-flex items-center justify-center w-11 h-11 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 dark:bg-white/10 disabled:opacity-40 transition-colors focus-visible:outline-2 focus-visible:outline-primary">
                <span className="material-symbols-outlined">zoom_out</span>
              </button>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 w-11 text-center" aria-live="polite">{Math.round(zoom * 100)}%</span>
              <button type="button" onClick={zoomIn} disabled={zoom >= 1.5} aria-label="Perbesar panel" className="inline-flex items-center justify-center w-11 h-11 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 dark:bg-white/10 disabled:opacity-40 transition-colors focus-visible:outline-2 focus-visible:outline-primary">
                <span className="material-symbols-outlined">zoom_in</span>
              </button>
              <button type="button" onClick={() => setZoom(1)} aria-label="Reset zoom 100 persen" className="inline-flex items-center justify-center h-11 px-3 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 dark:bg-white/10 transition-colors focus-visible:outline-2 focus-visible:outline-primary">
                Reset
              </button>
              {isFs ? (
                <button type="button" onClick={keluarFullscreen} aria-label="Kembali dari layar penuh (tombol Escape juga bisa)" className="inline-flex items-center gap-1.5 h-11 px-3 rounded-xl text-xs font-bold bg-primary text-white transition-colors focus-visible:outline-2 focus-visible:outline-primary">
                  <span className="material-symbols-outlined">fullscreen_exit</span>
                  Kembali
                </button>
              ) : (
                <button type="button" onClick={bukaFullscreen} aria-label="Panel layar penuh" className="inline-flex items-center justify-center w-11 h-11 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 dark:bg-white/10 transition-colors focus-visible:outline-2 focus-visible:outline-primary">
                  <span className="material-symbols-outlined">fullscreen</span>
                </button>
              )}
            </div>
          </div>
          {fsGagal && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Layar penuh ditolak browser — tampilan tetap {Math.round(zoom * 100)}%.</p>
          )}
        </div>
      )}
      {panelHeader && (
        <div data-panel-tab="dokumen" className="px-4 py-2 border-b border-slate-200 dark:border-transparent bg-white dark:bg-slate-900">
          {panelHeader({ tabAktif: tabDokumen, onPilih: setTabDokumen })}
        </div>
      )}
      {centralizedPrint && (
        <div className="px-4 py-3 border-b border-slate-100 dark:border-transparent bg-white dark:bg-slate-900 space-y-2">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Dokumen yang ikut dicetak</h3>
          <div className="grid gap-1.5 sm:grid-cols-2">
            {/* Sprint 030 (PRD baris 10-12): checklist pengecualian cetak
                SELALU menampilkan SEMUA dokumen dari `flatDocsAwal` — tidak
                ikut filter tab/kertas, supaya 3 dokumen gabungan tetap bisa
                dicentang/dicoret satu per satu. Kertas preview di bawah
                mengikuti tab yang aktif. */}
            {flatDocsAwal.map((doc) => (
              <label key={`pilih-${doc.key}`} className="flex items-start gap-2 rounded-lg border border-slate-200 dark:border-transparent px-2.5 py-2 text-xs text-slate-700 dark:text-slate-200 cursor-pointer hover:border-primary/40">
                <input type="checkbox" checked={dokumenAktif.has(doc.key)} onChange={() => toggleDokumen(doc.key)} className="mt-0.5 accent-primary" aria-label={`Sertakan ${doc.label} dalam cetak`} />
                <span>{doc.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}
      <div
        className="p-3 space-y-4 bg-slate-100/60 dark:bg-white/5 overflow-y-auto [scrollbar-gutter:stable]"
        style={{ maxHeight: tinggiArea }}
        data-area-dokumen=""
      >
        {docs.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-transparent p-4">Template belum tersedia untuk panel ini.</p>
        )}
        {docsLayar.map((doc) => <ScaledPaper key={doc.key} doc={doc} zoom={zoom} kertas={kertas} />)}
      </div>
      {centralizedPrint && createPortal(
        <div className="sk-print-area" aria-hidden="true">
          {flatPrintDocs.map((doc) => (
            <div className="sk-doc-print" key={`print-${doc.key}`}>
              {doc.kind === 'sk' ? (
                <div className={`print-container ${doc.templateConfig?.orientation || 'portrait'} paper-${kertas.toLowerCase()}`}>
                  <SKHonorer data={doc.data} mode="preview" />
                </div>
              ) : doc.kind === 'foto' ? (
                <div className={`print-container ${doc.templateConfig?.orientation || 'portrait'} paper-${kertas.toLowerCase()}`}>
                  <FotoDokumenPaper data={doc.data} />
                </div>
              ) : doc.templateConfig ? (
                <TemplateEngine templateConfig={doc.templateConfig} data={doc.data} mode="print" />
              ) : null}
            </div>
          ))}
        </div>,
        document.body,
      )}
    </div>
  )
}
