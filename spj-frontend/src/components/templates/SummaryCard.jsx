/**
 * SummaryCard — kartu ringkasan data (Sprint 003 US-19/US-20).
 * Layar-only: label + nilai + tabel, 0 kop surat, 0 tanda tangan.
 * Nilai kosong tampil '—' jujur (bukan data palsu). Di luar .print-container
 * sehingga tidak pernah ikut tercetak.
 *
 * Sprint 008 Zona B (opsional, backward-compatible): badge LENGKAP/N-perlu +
 * label DIPERBARUI OTOMATIS (aria-live) + tombol Cek + zoom/Reset/fullscreen.
 * Tanpa props previewStatus = kartu polos seperti sebelumnya (pemakaian lama aman;
 * alias lama `cermin` tetap dibaca sebagai fallback).
 */
import { useRef, useState } from 'react'

/**
 * readinessCheck — fungsi murni: daftar pelanggaran field wajib dari formData.
 * Satu logika, dua pemakai: tombol Cek (Zona B) + gate Cetak (Zona C).
 * fieldId = id input di Zona A (diawali 'f-'); null = tanpa target DOM
 * (mis. daftar isi kosong) — pemanggil wajib fallback jujur (toast/pesan).
 */
export function readinessCheck(formData = {}) {
  const pelanggaran = []
  if (!formData.nomor) pelanggaran.push({ fieldId: 'f-nomor', label: 'Nomor Surat' })
  if (!formData.tanggalDanaMasuk) pelanggaran.push({ fieldId: 'f-tanggalDanaMasuk', label: 'Tanggal dana masuk' })
  if ((formData.rows || []).length === 0) pelanggaran.push({ fieldId: null, label: 'Daftar isi/penerima (minimal 1 baris)' })
  return pelanggaran
}

/**
 * sorotPelanggaran — highlight dashed + scroll + fokus ke field pertama kosong.
 * Mengembalikan true bila target DOM ditemukan, false bila tidak (fallback jujur).
 */
export function sorotPelanggaran(v) {
  if (!v || !v.fieldId) return false
  const el = document.getElementById(v.fieldId)
  if (!el) return false
  el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  el.focus({ preventScroll: true })
  el.classList.add('sprint008-sorot')
  window.setTimeout(() => el.classList.remove('sprint008-sorot'), 2600)
  return true
}

export default function SummaryCard({ title, icon = 'list_alt', sections = [], previewStatus = null, cermin = null, zoomable = false, onCek = null }) {
  const show = (v) => {
    if (v === null || v === undefined || v === '') return '—'
    if (Array.isArray(v)) {
      const items = v.map((x) => (typeof x === 'object' ? x.text || x.nama || '' : x)).filter(Boolean)
      return items.length ? items.join('; ') : '—'
    }
    return String(v)
  }

  // ─── Sprint 008 Zona B: state chrome panel (hanya dipakai bila previewStatus/zoomable) ───
  const [zoom, setZoom] = useState(1)
  const [fsGagal, setFsGagal] = useState(false)
  const panelRef = useRef(null)
  const zoomIn = () => setZoom((z) => Math.min(1.5, +(z + 0.25).toFixed(2)))
  const zoomOut = () => setZoom((z) => Math.max(0.5, +(z - 0.25).toFixed(2)))
  const bukaFullscreen = () => {
    const el = panelRef.current
    if (!el || !el.requestFullscreen) { setFsGagal(true); return }
    Promise.resolve(el.requestFullscreen()).catch(() => setFsGagal(true))
  }
  // Revisi 2026-10-06 (task 29): `previewStatus` nama baru Panel Preview Document;
  // `cermin` hanya alias fallback pemakaian lama.
  const status = previewStatus ?? cermin
  const handleCek = () => {
    if (onCek) { onCek(); return }
    const pertama = (status?.violations || [])[0]
    if (pertama) sorotPelanggaran(pertama)
  }
  const lengkap = status ? status.perlu === 0 : null

  return (
    <div ref={panelRef} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden lg:sticky lg:top-4">
      <style>{`.sprint008-sorot{outline:3px dashed #004ac6 !important;outline-offset:2px;border-radius:0.75rem}
.sprint008-dot{width:8px;height:8px;border-radius:9999px;background-color:#004ac6;animation:sprint008-pulse 1.6s ease-in-out infinite}
@keyframes sprint008-pulse{0%,100%{opacity:1}50%{opacity:0.25}}
@media (prefers-reduced-motion: reduce){.sprint008-dot{animation:none}}`}</style>
      {title && (
        <div className="flex items-center gap-2 px-4 py-3 bg-primary/5 border-b border-slate-200">
          <span className="material-symbols-outlined text-primary">{icon}</span>
          <span className="text-sm font-bold text-slate-800">{title}</span>
        </div>
      )}
      {/* ─── Sprint 008 Zona B: bar status panel (screen-only, tak ikut cetak) ─── */}
      {status && (
        <div className="print:hidden px-4 py-3 border-b border-slate-100 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold min-h-[44px] sm:min-h-0 ${lengkap ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-700'}`}>
              <span className="material-symbols-outlined text-sm">{lengkap ? 'check_circle' : 'pending'}</span>
              {lengkap ? 'LENGKAP' : `${status.perlu}-PERLU-DIISI`}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500" aria-live="polite">
              <span className="sprint008-dot" aria-hidden="true" />
              DIPERBARUI OTOMATIS
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCek}
              className="inline-flex items-center gap-1.5 px-3 min-h-[44px] rounded-xl text-xs font-bold bg-primary/10 text-primary hover:bg-primary/20 transition-colors focus-visible:outline-2 focus-visible:outline-primary"
            >
              <span className="material-symbols-outlined text-base">fact_check</span>
              Cek
            </button>
            {zoomable && (
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
                <button type="button" onClick={bukaFullscreen} aria-label="Panel layar penuh" className="inline-flex items-center justify-center w-11 h-11 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors focus-visible:outline-2 focus-visible:outline-primary">
                  <span className="material-symbols-outlined">fullscreen</span>
                </button>
              </div>
            )}
          </div>
          {fsGagal && (
            <p className="text-[11px] text-slate-500">Layar penuh ditolak browser — tampilan tetap {Math.round(zoom * 100)}%.</p>
          )}
        </div>
      )}
      <div className="p-4 space-y-4" style={zoomable && zoom !== 1 ? { transform: `scale(${zoom})`, transformOrigin: 'top left' } : undefined}>
        {sections.length === 0 && (
          <p className="text-sm text-slate-500">Belum ada data. Isi form terlebih dahulu.</p>
        )}
        {sections.map((s, i) => (
          <div key={s.title || i}>
            {s.title && (
              <p className="text-[11px] font-bold text-primary uppercase tracking-wider mb-2">{s.title}</p>
            )}
            {(s.fields || []).length > 0 && (
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                {s.fields.map((f, j) => (
                  <div key={f.label || j} className="flex gap-2 text-sm">
                    <dt className="w-32 shrink-0 text-slate-500">{f.label}</dt>
                    <dd className="flex-1 font-medium text-slate-800 break-words">{show(f.value)}</dd>
                  </div>
                ))}
              </dl>
            )}
            {s.table && (s.table.rows || []).length > 0 && (
              <div className="mt-2 overflow-auto rounded-xl border border-slate-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50">
                      {(s.table.columns || []).map((c) => (
                        <th key={c.key} className="px-3 py-2 text-left text-[11px] font-bold text-slate-500 uppercase">
                          {c.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {s.table.rows.map((r, k) => (
                      <tr key={r.id || k} className="border-t border-slate-100">
                        {(s.table.columns || []).map((c) => (
                          <td key={c.key} className="px-3 py-2 text-slate-800">
                            {c.key === 'no' ? r[c.key] ?? k + 1 : show(r[c.key])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
