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

const SPECIAL = ['honor', 'perjalanan_dinas', 'mamin', 'pemeliharaan']

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
  isAnimating = false,
  detailRef = null,
  tampilkanFooter = true,
}) {
  if (!card) return null

  const isSpecial = SPECIAL.includes(card.id)

  return (
    <div
      ref={detailRef}
      className={`transition-all duration-700 ease-out ${
        isAnimating
          ? 'opacity-0 translate-y-8 scale-[0.98]'
          : 'opacity-100 translate-y-0 scale-100'
      }`}
    >
      <div className="relative bg-gradient-to-br from-white via-primary/5 to-blue-50/30 rounded-3xl border border-primary/20 shadow-xl shadow-primary/10 overflow-x-clip">
        {/* Premium Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-blue-500 to-primary" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full" />

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
              isSpecial={isSpecial}
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
            />
          )}

          {/* Footer Actions */}
          {tampilkanFooter && (
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={onClose}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <span className="material-symbols-outlined text-lg">arrow_back</span>
                Kembali ke Daftar
              </button>

              {!isSpecial && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={onPrint}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-primary to-blue-600 text-white hover:brightness-110 shadow-lg shadow-primary/30 transition-all duration-300 hover:scale-105 active:scale-95"
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
