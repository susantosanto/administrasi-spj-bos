/**
 * PanelPreviewDocument — Panel Preview Document A4 ala SIMENULIS.
 * Isi = render A4 penuh persis dokumen cetak via TemplateEngine mode=print
 * (docs dari buildPreviewDocs — mirror area cetak), live-sync dari formData
 * (murni props, tanpa state ganda). Skala-agar-muat + zoom 50-150% / Reset /
 * fullscreen hanya ubah tampilan layar. Root print:hidden + CSS print khusus
 * memastikan panel TAK PERNAH ikut tercetak; hasil cetak tak berubah.
 *
 * Revisi 2026-10-06 (task 37): satu alur lengkapi-cek-cetak di panel —
 * badge readiness (LENGKAP/N-PERLU-DIISI) di header, tombol Cek + Cetak
 * di bar status. Cetak terhalang (disabled) selama belum LENGKAP.
 */
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import TemplateEngine from './TemplateEngine'
import { SKHonorer } from './blocks'
import PaperSizeSelector from './PaperSizeSelector'
import { PAPER_EVENT, getPaperSize } from '../../utils/paperSize'
import { sorotPelanggaran } from './SummaryCard'

function ScaledPaper({ doc, zoom }) {
  const wrapRef = useRef(null)
  const paperRef = useRef(null)
  const landscape = doc.templateConfig?.orientation === 'landscape'
  const [kertas, setKertas] = useState(getPaperSize())

  // Ikut pilihan kertas user (A4/F4) tanpa reload.
  useEffect(() => {
    const sinkron = (e) => {
      if (e?.detail?.paper) setKertas(e.detail.paper)
    }
    window.addEventListener(PAPER_EVENT, sinkron)
    return () => window.removeEventListener(PAPER_EVENT, sinkron)
  }, [])
  const lebar = landscape ? '297mm' : (kertas === 'F4' ? '215.9mm' : '210mm')
  const tinggi = landscape ? '210mm' : (kertas === 'F4' ? '330mm' : '297mm')

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
      paper.style.transform = `scale(${scale})`
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
      <figcaption className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
        <span className="material-symbols-outlined text-sm text-primary">description</span>
        {doc.label}
        {landscape && <span className="font-semibold normal-case text-slate-400">(landscape)</span>}
      </figcaption>
      <div ref={wrapRef} className="overflow-hidden rounded-lg bg-slate-200/60 p-2">
        <div
          ref={paperRef}
          className="panel-a4-paper bg-white shadow-md"
          style={{
            width: lebar,
            minHeight: tinggi,
            padding: landscape ? '15mm 20mm' : '20mm 25mm',
            transformOrigin: 'top left',
          }}
        >
          {doc.kind === 'sk' ? (
            <SKHonorer data={doc.data} mode="preview" />
          ) : (
            <TemplateEngine templateConfig={doc.templateConfig} data={doc.data} mode="print" />
          )}
        </div>
      </div>
    </figure>
  )
}

export default function PanelPreviewDocument({ title, docs = [], status = null, onCek = null, onCetak = null }) {
  const [zoom, setZoom] = useState(1)
  const [fsGagal, setFsGagal] = useState(false)
  const [isFs, setIsFs] = useState(false)
  const panelRef = useRef(null)
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
    if (!lengkap) return
    if (onCetak) { onCetak(); return }
    window.print()
  }
  const lengkap = status ? status.perlu === 0 : null

  return (
    <div ref={panelRef} className="panel-preview-root print:hidden bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden lg:max-h-[calc(100vh-104px)] lg:overflow-y-auto lg:[scrollbar-gutter:stable]">
      <style>{`.panel-preview-root .template-engine input,.panel-preview-root .template-engine textarea,.panel-preview-root .template-engine select{pointer-events:none}
.sprint008-dot{width:8px;height:8px;border-radius:9999px;background-color:#004ac6;animation:sprint008-pulse 1.6s ease-in-out infinite}
@keyframes sprint008-pulse{0%,100%{opacity:1}50%{opacity:0.25}}
@media (prefers-reduced-motion: reduce){.sprint008-dot{animation:none}}
@media print{.panel-preview-root{display:none !important}}
.sprint008-sorot{outline:3px dashed #004ac6 !important;outline-offset:2px;border-radius:0.75rem}`}</style>
      {title && (
        <div className="flex items-center gap-2 px-4 py-3 bg-primary/5 border-b border-slate-200">
          <span className="material-symbols-outlined text-primary">preview</span>
          <span className="text-sm font-bold text-slate-800 flex-1">{title}</span>
          {status && (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${lengkap ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-700'}`} aria-live="polite">
              <span className="material-symbols-outlined text-sm">{lengkap ? 'check_circle' : 'pending'}</span>
              {lengkap ? 'LENGKAP' : `${status.perlu}-PERLU-DIISI`}
            </span>
          )}
          {isFs && (
            <button
              type="button"
              onClick={keluarFullscreen}
              aria-label="Kembali dari layar penuh (tombol Escape juga bisa)"
              className="inline-flex items-center gap-1.5 px-3 min-h-[44px] rounded-xl text-xs font-bold bg-primary text-white hover:brightness-110 transition-colors focus-visible:outline-2 focus-visible:outline-primary"
            >
              <span className="material-symbols-outlined text-base">fullscreen_exit</span>
              Kembali
            </button>
          )}
        </div>
      )}
      {isFs && !title && (
        <div className="sticky top-0 z-10 flex items-center justify-end gap-2 px-4 py-2 bg-primary/5 border-b border-slate-200">
          <span className="text-[11px] font-semibold text-slate-500 mr-auto">Mode layar penuh — tekan Esc untuk kembali</span>
          <button
            type="button"
            onClick={keluarFullscreen}
            aria-label="Kembali dari layar penuh (tombol Escape juga bisa)"
            className="inline-flex items-center gap-1.5 px-3 min-h-[44px] rounded-xl text-xs font-bold bg-primary text-white hover:brightness-110 transition-colors focus-visible:outline-2 focus-visible:outline-primary"
          >
            <span className="material-symbols-outlined text-base">fullscreen_exit</span>
            Kembali
          </button>
        </div>
      )}
      {status && (
        <div className="px-4 py-3 border-b border-slate-100 space-y-2 bg-white">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500" aria-live="polite">
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
              disabled={!lengkap}
              title={lengkap ? 'Cetak dokumen' : 'Lengkapi dulu — tekan Cek untuk melompat ke field yang kurang'}
              className="inline-flex items-center gap-1.5 px-5 min-h-[44px] rounded-xl text-xs font-bold text-white bg-gradient-to-r from-primary to-blue-600 shadow-lg shadow-primary/30 hover:brightness-110 transition-all disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-primary"
            >
              <span className="material-symbols-outlined text-base">print</span>
              Cetak
            </button>
            <div className="inline-flex items-center gap-1" role="group" aria-label="Kontrol zoom panel">
              <button type="button" onClick={zoomOut} disabled={zoom <= 0.5} aria-label="Perkecil panel" className="inline-flex items-center justify-center w-11 h-11 rounded-xl text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-colors focus-visible:outline-2 focus-visible:outline-primary">
                <span className="material-symbols-outlined">zoom_out</span>
              </button>
              <span className="text-[11px] font-bold text-slate-500 w-11 text-center" aria-live="polite">{Math.round(zoom * 100)}%</span>
              <button type="button" onClick={zoomIn} disabled={zoom >= 1.5} aria-label="Perbesar panel" className="inline-flex items-center justify-center w-11 h-11 rounded-xl text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-colors focus-visible:outline-2 focus-visible:outline-primary">
                <span className="material-symbols-outlined">zoom_in</span>
              </button>
              <button type="button" onClick={() => setZoom(1)} aria-label="Reset zoom 100 persen" className="inline-flex items-center justify-center h-11 px-3 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors focus-visible:outline-2 focus-visible:outline-primary">
                Reset
              </button>
              {isFs ? (
                <button type="button" onClick={keluarFullscreen} aria-label="Kembali dari layar penuh (tombol Escape juga bisa)" className="inline-flex items-center gap-1.5 h-11 px-3 rounded-xl text-xs font-bold bg-primary text-white hover:brightness-110 transition-colors focus-visible:outline-2 focus-visible:outline-primary">
                  <span className="material-symbols-outlined">fullscreen_exit</span>
                  Kembali
                </button>
              ) : (
                <button type="button" onClick={bukaFullscreen} aria-label="Panel layar penuh" className="inline-flex items-center justify-center w-11 h-11 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors focus-visible:outline-2 focus-visible:outline-primary">
                  <span className="material-symbols-outlined">fullscreen</span>
                </button>
              )}
            </div>
          </div>
          {fsGagal && (
            <p className="text-[11px] text-slate-500">Layar penuh ditolak browser — tampilan tetap {Math.round(zoom * 100)}%.</p>
          )}
        </div>
      )}
      <div className="p-3 space-y-4 bg-slate-100/60">
        {docs.length === 0 && (
          <p className="text-sm text-slate-500 bg-white rounded-xl border border-slate-200 p-4">Template belum tersedia untuk panel ini.</p>
        )}
        {docs.map((d) => (
          <ScaledPaper key={d.key} doc={d} zoom={zoom} />
        ))}
      </div>
    </div>
  )
}
