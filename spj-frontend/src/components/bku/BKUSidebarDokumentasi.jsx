/**
 * BKUSidebarDokumentasi — blok Dokumentasi foto di tab "Dokumen LPJ" sidebar.
 *
 * REVISI USER 2026-10-23 (Sprint 019):
 * 1. Preview dokumen foto TIDAK lagi modal terpisah — semua foto (upload +
 *    generate AI) digabung ke Panel Preview utama (Zona B) lewat state
 *    bersama `useFotoDokumen` di `BKUSidebar`. Kartu "Preview Dokumen Foto"
 *    dihapus.
 * 2. Cetak tetap bisa: print twin `.sk-print-area` di bawah — satu halaman
 *    A4 per 6 foto, ikut tercetak bersama dokumen LPJ lewat tombol Cetak
 *    panel (menggantikan `window.print()` modal lama).
 * 3. Tombol mengikuti desain aplikasi (blue-only primary + slate).
 *
 * State foto TIDAK di sini — props dari `BKUSidebar` (satu sumber kebenaran).
 */
import { useRef } from 'react'
import { detectTemplate } from '../../utils/templateDetector'
import DokumentasiAIGenerate from '../dokumentasi/DokumentasiAIGenerate'
import FotoDokumenPaper from '../templates/FotoDokumenPaper'
import { buildFotoDocs } from './useFotoDokumen'

export default function BKUSidebarDokumentasi({
  transaction,
  fotoDokumen = [],
  onTambahFotos,
  onUpdateCaption,
  onHapusFoto,
  onFotoBaru,
  onRegenerasiFoto,
}) {
  const fileInputRef = useRef(null)

  // Auto-detect template (warisan — read-only)
  const detectedTemplate = detectTemplate(transaction?.kodeRekening)
  const fotoAi = fotoDokumen.filter((p) => p.source === 'ai')

  return (
    <>
      <div className="space-y-4">
        {/* Template Terdeteksi */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-slate-600 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            </span>
            Template Dokumen Terdeteksi
          </h4>
          {detectedTemplate ? (
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className={`material-symbols-outlined ${detectedTemplate.color} text-xl`}>{detectedTemplate.icon}</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900">{detectedTemplate.label}</p>
                <p className="text-[11px] text-slate-400">Template: {detectedTemplate.templateId}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-slate-400 text-xl">help_outline</span>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">Tidak ada template spesifik</p>
                <p className="text-[11px] text-slate-400">Transaksi ini tidak perlu dokumen tambahan</p>
              </div>
            </div>
          )}
        </div>

        {/* Upload Dokumen Pendukung (Foto) — daftar gabungan upload + AI */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-slate-600 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>upload_file</span>
            </span>
            Dokumen Pendukung (Foto)
          </h4>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => { onTambahFotos?.(e.target.files); e.target.value = '' }}
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            className="rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center cursor-pointer hover:bg-slate-100 hover:border-blue-400 transition-colors p-5"
          >
            <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mx-auto mb-2">
              <span className="material-symbols-outlined text-3xl text-slate-400">cloud_upload</span>
            </div>
            <p className="text-sm font-semibold text-slate-700 mb-0.5">Upload Foto Bukti</p>
            <p className="text-[11px] text-slate-400 mb-3">JPG, PNG — bisa pilih banyak</p>
            <div className="inline-flex items-center gap-2 px-5 min-h-[44px] bg-primary text-white rounded-xl text-xs font-bold hover:brightness-110 transition-all shadow-md shadow-primary/25">
              <span className="material-symbols-outlined text-sm">add</span>
              Pilih File
            </div>
          </div>

          {fotoDokumen.length > 0 && (
            <div className="mt-3 space-y-2">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                {fotoDokumen.length} foto — tampil di Panel Preview Document
              </p>
              {fotoDokumen.map((p) => (
                <div key={p.id} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2">
                  <img src={p.dataUrl} alt={p.name} className="w-12 h-12 object-cover rounded-lg flex-shrink-0" />
                  <input
                    type="text"
                    value={p.caption}
                    onChange={(e) => onUpdateCaption?.(p.id, e.target.value)}
                    placeholder="Keterangan foto"
                    className="flex-1 px-2.5 py-1.5 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/40 text-slate-800"
                  />
                  {p.source === 'ai' && (
                    <span className="px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-[9px] font-bold flex-shrink-0">AI</span>
                  )}
                  <button
                    onClick={() => onHapusFoto?.(p.id)}
                    className="p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600 rounded-lg flex-shrink-0 transition-colors"
                    title="Hapus"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* GENERATE FOTO DOKUMENTASI AI (premium) — foto masuk Panel Preview */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <DokumentasiAIGenerate
          transaction={transaction}
          fotoAi={fotoAi}
          onFotoBaru={onFotoBaru}
          onRegenerasiFoto={onRegenerasiFoto}
          onHapusFoto={onHapusFoto}
        />
      </div>

      {/* ══ PRINT TWIN — halaman foto ikut tercetak lewat tombol Cetak panel ══
          `.sk-print-area` display:none di layar, block saat print; isi
          `.print-container` satu-satunya yang visibility:visible. Satu
          `.sk-doc-print` per halaman (page-break-after bawaan CSS cetak). */}
      {fotoDokumen.length > 0 && (
        <div className="sk-print-area" aria-hidden="true">
          {buildFotoDocs(fotoDokumen, transaction).map((doc) => (
            <div key={doc.key} className="sk-doc-print">
              <div className="print-container portrait bg-white" style={{ width: '210mm', minHeight: '297mm', padding: '15mm 20mm' }}>
                <FotoDokumenPaper data={doc.data} />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
