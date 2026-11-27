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
  varianForm = 'lama',
  bkuInfo = null,
  blokTambahan = null,
  // Sprint 019 (K-6): blok Dokumentasi foto (BKUSidebarDokumentasi) — render
  // setelah blok PBJ, sebelum Panel Preview. Halaman LPJ tidak mengoper.
  blokDokumentasi = null,
  // Sprint 019 revisi: dokumen foto (upload + generate AI) — digabung ke
  // Panel Preview utama (setelah dokumen LPJ). Halaman LPJ tidak mengoper.
  fotoDocs = [],
  // Sprint 019 (D-1): chip banner gate klik → sorotPelanggaran(v).
  onSorot = null,
  isSpecial = false,
  centralizedPrint = false,
  onCetakTerpilih = null,
  printSnapshot = null,
}) {
  const isTransport = card?.isTransport
  const isTransportSub = isTransport && selectedSub?.templateId !== null && selectedSub?.templateId !== 'sppd'
  const hasSppdData = isTransportSub && sppdData && sppdData.rows && sppdData.rows.length > 0

  const gridClass = layout === 'stack'
    ? 'grid gap-4 grid-cols-1 items-start'
    : 'grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,620px)] xl:grid-cols-[minmax(0,1fr)_minmax(0,700px)] items-start'
  // Revisi 2026-10-22: kartu preview kini setinggi kertas (A4 297mm / F4 330mm),
  // jadi bisa lebih tinggi dari viewport. Pada layout 'side' kolom preview
  // dibatasi setinggi layar dan digulir sendiri — kalau tidak, `sticky` akan
  // memaku kartu yang lebih tinggi dari layar sehingga bagian bawahnya tak
  // pernah bisa dilihat.
  const asideClass = `scroll-mt-24 print:hidden min-w-0 self-start${
    layout === 'side'
      ? ' lg:sticky lg:top-[88px] lg:max-h-[calc(100vh-104px)] lg:overflow-y-auto lg:[scrollbar-gutter:stable]'
      : ''
  }`

  // Sprint 030: tab dokumen premium ringkas untuk Lomba & Workshop.
  // Proposal punya TAB SENDIRI (tidak digabung dengan dokumen lain) —
  // satu klik = satu dokumen tampil, tanpa langkah kerja tambahan.
  // KUNCI 2026-11-26: Proposal masih dalam pengembangan → tombol dikunci
  // (disabled + gembok + SEGERA), tak bisa dipilih maupun tercetak.
  const TAB_LOMBA = [
    { id: 'undangan', label: 'Undangan', icon: 'mail_outline' },
    { id: 'surat_tugas', label: 'Surat Tugas', icon: 'badge' },
    { id: 'daftar_hadir', label: 'Daftar Hadir', icon: 'groups' },
    { id: 'proposal', label: 'Proposal', icon: 'lock', khusus: true, terkunci: true },
  ]
  const panelHeaderLomba = card?.id === 'lomba_workshop'
    ? ({ tabAktif, onPilih }) => (
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide" role="tablist" aria-label="Tab dokumen kegiatan">
          {TAB_LOMBA.map((t) => {
            const kunci = !!t.terkunci
            const aktif = tabAktif === t.id && !kunci
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={aktif}
                aria-disabled={kunci || undefined}
                title={kunci ? 'Proposal masih dalam pengembangan' : undefined}
                onClick={() => { if (!kunci) onPilih(t.id) }}
                disabled={kunci}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors ${
                  kunci
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-white/5 dark:text-slate-500'
                    : aktif ? 'bg-primary text-white shadow-sm' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className="material-symbols-outlined text-sm">{t.icon}</span>
                {t.label}
                {t.khusus && (
                  <span className={`ml-0.5 px-1 py-px rounded text-[8px] font-bold tracking-wide ${
                    kunci ? 'bg-slate-200 text-slate-500 dark:bg-white/10 dark:text-slate-400'
                    : aktif ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'
                  }`}>{kunci ? 'SEGERA' : 'KONSEP'}</span>
                )}
              </button>
            )
          })}
        </div>
      )
    : null

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
            varianForm={varianForm}
            bkuInfo={bkuInfo}
            centralizedPrint={centralizedPrint}
          />
        </section>

        {/* Sprint 018 (AD-6): blok tambahan (Dokumen PBJ) — DI BAWAH form LPJ
            dan DI ATAS Panel Preview Document. Halaman LPJ tidak mengoper
            `blokTambahan` → blok ini tidak muncul di sana. */}
        {blokTambahan}

        {/* Sprint 019 (K-6): blok Dokumentasi foto — pindahan tab "Dokumentasi".
            Hanya sidebar yang mengoper; halaman LPJ tidak → hash tidak berubah. */}
        {blokDokumentasi}

        <aside id="seksi-cetak" aria-label="Zona C — Panel Preview Document" className={asideClass}>
          <section aria-label="Zona B — Panel Preview Document">
            {/* Peringatan kelengkapan (keputusan user 2026-10-21: preview SELALU tampil,
                gate hanya memberi tahu field wajib yang belum terisi).
                Sprint 019 (D-1): kalau `onSorot` dioper, daftar field jadi chip
                yang bisa diklik → sorotPelanggaran (field pertama yang bermasalah).
                `pelanggaran` dipakai (bukan gate.kurang) karena punya fieldId. */}
            {gate && !gate.lengkap && (
              <div className="print:hidden mb-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-600 flex items-start gap-2">
                <span className="material-symbols-outlined text-slate-400 text-base">info</span>
                <span>
                  <span className="font-semibold text-slate-700">{gate.kurang.length} field wajib belum terisi</span>
                  {onSorot && pelanggaran.length > 0 ? (
                    <span className="flex flex-wrap gap-1.5 mt-1.5">
                      {pelanggaran.map((p, i) => (
                        <button
                          key={`${p.fieldId || 'f'}-${i}`}
                          onClick={() => onSorot(p)}
                          className="px-2 py-0.5 rounded-full bg-white border border-slate-300 text-slate-700 hover:border-blue-400 hover:text-blue-700 transition-colors"
                        >
                          {p.label}
                        </button>
                      ))}
                    </span>
                  ) : gate.kurang.length > 0 ? `: ${gate.kurang.map((k) => k.label).join(', ')}` : ''}
                  {' — dokumen tetap bisa dilihat.'}
                </span>
              </div>
            )}
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Panel Preview Document</h2>
            <PanelPreviewDocument
              title={`Panel Preview Document — ${card?.nama || ''}${selectedSub?.label ? ` — ${selectedSub.label}` : ''}`}
              docs={[...previewDocs, ...fotoDocs]}
              centralizedPrint={centralizedPrint}
              status={{ perlu: pelanggaran.length, violations: pelanggaran }}
              onCek={onCek}
              onCetak={onCetakTerpilih || onCetak}
              printSnapshot={printSnapshot}
              panelHeader={panelHeaderLomba}
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

