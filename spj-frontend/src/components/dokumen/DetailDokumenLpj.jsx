/**
 * DetailDokumenLpj — panel dokumen LPJ (satu komponen, dua pemakai).
 *
 * Sprint 017 AD-1/AD-2: hasil ekstraksi `renderDetailPanel()` dari
 * `pages/dashboard/DokumenSPJPage.jsx`. Halaman LPJ memakai `layout='side'`
 * (perilaku lama, tidak berubah); sidebar BKU memakai `layout='stack'` + `gate`.
 *
 * Aturan: jangan menyalin JSX panel ini ke tempat lain. Kalau perlu variasi,
 * tambah prop — bukan salinan.
 */
import DetailDokumenLpjHeader from './DetailDokumenLpjHeader'
import DetailDokumenLpjBody from './DetailDokumenLpjBody'
import { DetailDokumenLpjInfo } from './DetailDokumenLpjInfo'

const SPECIAL = ['honor', 'perjalanan_dinas', 'mamin', 'pemeliharaan', 'lomba_workshop', 'cetak_banner', 'buku']

export default function DetailDokumenLpj({
  card,
  selectedSub,
  onSubChange,
  getStatus = () => 'Belum',
  formData = {},
  setFormData,
  sppdData = {},
  setSppdData,
  viewMode = 'form',
  setViewMode,
  formTab = 'daftar',
  setFormTab,
  previewTab = 'daftar',
  setPreviewTab,
  onClose,
  onCek,
  onCetak,
  onPrint,
  onAutoFill,
  previewDocs = [],
  pelanggaran = [],
  prefillBadge = null,
  onUndoPrefill = null,
  guideCtx = null,
  onGuideJump = null,
  getTemplateConfig = () => null,
  layout = 'side',
  gate = null,
  // Sprint 018: varian form + info baris BKU (form Mamin 6 seksi di sidebar).
  varianForm = 'lama',
  bkuInfo = null,
  blokTambahan = null,
  // Sprint 019 (K-6): blok Dokumentasi foto — hanya sidebar yang mengoper
  // (BKUSidebarDokumentasi). Halaman LPJ tidak mengoper → hash tidak berubah.
  blokDokumentasi = null,
  // Sprint 019 revisi: dokumen foto digabung ke Panel Preview utama.
  fotoDocs = [],
  // Sprint 019 (D-1): chip/banner gate klik → sorot field (sorotPelanggaran).
  onSorot = null,
  isAnimating = false,
  detailRef = null,
  tampilkanFooter = true,
  centralizedPrint = false,
  onCetakTerpilih = null,
  printSnapshot = null,
}) {
  if (!card) return null

  // Sprint 020 revisi (keputusan user 2026-10-24): penggandaan jadi panel-card
  // HANYA di sidebar BKU (layout='stack') agar baris ATK bisa mengakses kartu
  // AI Dokumentasi (blokDokumentasi hanya dirender oleh DetailDokumenLpjBody).
  // Halaman LPJ (layout='side') tetap memakai DetailDokumenLpjInfo (kartu info).
  const isSpecial = SPECIAL.includes(card.id) ||
    (card.id === 'penggandaan' && layout === 'stack')

  return (
    <div
      ref={detailRef}
      className={`transition-all duration-700 ease-out ${
        isAnimating
          ? 'opacity-0 translate-y-8 scale-[0.98]'
          : 'opacity-100 translate-y-0 scale-100'
      }`}
    >
      <div className="relative rounded-3xl bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/40 dark:shadow-black/40 overflow-x-clip">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" aria-hidden="true" />

        <div className="relative p-6 space-y-5">
          <DetailDokumenLpjHeader
            card={card}
            selectedSub={selectedSub}
            onSubChange={onSubChange}
            getStatus={getStatus}
            prefillBadge={prefillBadge}
            onUndoPrefill={onUndoPrefill}
            guideCtx={guideCtx}
            onGuideJump={onGuideJump}
            onClose={onClose}
            isSpecial={isSpecial}
          />

          {/* Content Area */}
          {isSpecial ? (
            <DetailDokumenLpjBody
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
              onCek={onCek}
              onCetak={onCetak}
              onAutoFill={onAutoFill}
              previewDocs={previewDocs}
              pelanggaran={pelanggaran}
              getTemplateConfig={getTemplateConfig}
              layout={layout}
              gate={gate}
              varianForm={varianForm}
              bkuInfo={bkuInfo}
              blokTambahan={blokTambahan}
              blokDokumentasi={blokDokumentasi}
              fotoDocs={fotoDocs}
              onSorot={onSorot}
              isSpecial={isSpecial}
              centralizedPrint={centralizedPrint}
              onCetakTerpilih={onCetakTerpilih}
              printSnapshot={printSnapshot}
            />
          ) : (
            <DetailDokumenLpjInfo
              card={card}
              selectedSub={selectedSub}
              formData={formData}
              setFormData={setFormData}
              sppdData={sppdData}
              setSppdData={setSppdData}
              getTemplateConfig={getTemplateConfig}
              onAutoFill={onAutoFill}
            />
          )}

          {/* Footer Actions */}
          {tampilkanFooter && (
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={onClose}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-all duration-300 active:scale-95"
              >
                <span className="material-symbols-outlined text-lg">arrow_back</span>
                Kembali ke Daftar
              </button>

              {!isSpecial && !centralizedPrint && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={centralizedPrint ? () => onCetakTerpilih?.(previewDocs) : onPrint}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium bg-primary text-white transition-all duration-300 active:scale-95"
                  >
                    <span className="material-symbols-outlined text-lg">print</span>
                    Cetak Dokumen
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
