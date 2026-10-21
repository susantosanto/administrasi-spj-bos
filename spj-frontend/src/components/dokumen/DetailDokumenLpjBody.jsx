/**
 * DetailDokumenLpjBody — isi panel dokumen LPJ (form + preview / info / coming soon).
 *
 * Sprint 017 AD-1/AD-2: dipindahkan APA ADANYA dari `DokumenSPJPage.jsx`
 * (`renderDetailPanel`, dulu baris 618-815). Satu komponen, dua layout:
 *   layout='side'  → grid form kiri · preview kanan (perilaku halaman LPJ, tidak berubah)
 *   layout='stack' → form di atas · preview di bawah (sidebar BKU, K-7)
 * Saat `gate` diberikan (hanya sidebar), preview tetap dirender; bila field wajib
 * belum lengkap hanya muncul banner peringatan di atas panel (keputusan 2026-10-21).
 */
import DokumenFormPreview from '../templates/DokumenFormPreview'
import PanelPreviewDocument from '../templates/PanelPreviewDocument'

export default function DetailDokumenLpjBody({
  card,
  selectedSub,
  onSubChange,
  formData,
  setFormData,
  sppdData,
  setSppdData,
  viewMode,
  setViewMode,
  formTab,
  setFormTab,
  previewTab,
  setPreviewTab,
  onClose,
  onCek,
  onCetak,
  onAutoFill,
  previewDocs = [],
  pelanggaran = [],
  getTemplateConfig,
  layout = 'side',
  gate = null,
  isSpecial = false,
}) {
  const isTransport = card?.isTransport
  const isTransportSub = isTransport && selectedSub?.templateId !== null && selectedSub?.templateId !== 'sppd'
  const hasSppdData = isTransportSub && sppdData && sppdData.rows && sppdData.rows.length > 0

  const gridClass = layout === 'stack'
    ? 'grid gap-4 grid-cols-1 items-start'
    : 'grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,620px)] xl:grid-cols-[minmax(0,1fr)_minmax(0,700px)] items-start'
  const asideClass = `print:hidden min-w-0 self-start${layout === 'side' ? ' lg:sticky lg:top-[88px]' : ''}`

  return (
    <div className="space-y-4">
      <div className={gridClass}>
        <section aria-label="Zona A — Form dokumen">
          <DokumenFormPreview
            card={card}
            selectedSub={selectedSub}
            onSubChange={onSubChange}
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
            onClose={onClose}
          />
        </section>

        <aside className={asideClass}>
          <section aria-label="Zona B — Panel Preview Document">
            {/* Peringatan kelengkapan (keputusan user 2026-10-21: preview SELALU tampil,
                gate hanya memberi tahu field wajib yang belum terisi). */}
            {gate && !gate.lengkap && (
              <div className="print:hidden mb-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-600 flex items-start gap-2">
                <span className="material-symbols-outlined text-slate-400 text-base">info</span>
                <span>
                  <span className="font-semibold text-slate-700">{gate.kurang.length} field wajib belum terisi</span>
                  {gate.kurang.length > 0 ? `: ${gate.kurang.map((k) => k.label).join(', ')}` : ''}
                  {' — dokumen tetap bisa dilihat.'}
                </span>
              </div>
            )}
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Panel Preview Document</h2>
            <PanelPreviewDocument
              title={`Panel Preview Document — ${card?.nama || ''}${selectedSub?.label ? ` — ${selectedSub.label}` : ''}`}
              docs={previewDocs}
              status={{ perlu: pelanggaran.length, violations: pelanggaran }}
              onCek={onCek}
              onCetak={onCetak}
            />
          </section>
        </aside>
      </div>
      {/* Revisi 2026-10-06 (task 37): Zona C (gate pra-cetak) DIHAPUS —
          satu alur lengkapi-cek-cetak langsung di panel (Zona B),
          tanpa duplikasi tombol Cetak. */}
    </div>
  )
}

