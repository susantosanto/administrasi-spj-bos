/**
 * DetailDokumenLpjInfo — cabang "bukan form" panel LPJ (infoOnly / template / coming soon).
 *
 * Sprint 017 AD-1: dipisah dari DetailDokumenLpjBody agar tiap modul ≤200 baris.
 * Hanya dipakai halaman LPJ; sidebar BKU tidak pernah memakainya (A-2).
 */
import PaperSizeSelector from '../templates/PaperSizeSelector'
import TemplateEngine from '../templates/TemplateEngine'
import AutoFillHonorButton from '../templates/blocks/AutoFillHonorButton'
import { TEMPLATE_CONFIGS } from '../../data/templateConfig'

export function DetailDokumenLpjInfo({ card, selectedSub, formData, setFormData, sppdData, setSppdData, getTemplateConfig }) {
  const isTransport = card?.isTransport
  const isTransportSub = isTransport && selectedSub?.templateId !== null && selectedSub?.templateId !== 'sppd'
  const hasSppdData = isTransportSub && sppdData && sppdData.rows && sppdData.rows.length > 0

  if (card.infoOnly && !card.subKategori) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 text-center">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-slate-300 text-4xl">{card.icon}</span>
          </div>
          <p className="text-lg font-bold text-slate-800 mb-2">{card.nama}</p>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {card.infoItems?.map((item, i) => (
              <span key={i} className="px-4 py-2 bg-slate-50 rounded-xl text-sm font-medium text-slate-700 border border-slate-200">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (card.infoOnly && card.subKategori) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {selectedSub?.templateId ? (
          <div className="p-6">
            <div className="mb-3 flex justify-end print:hidden">
              <PaperSizeSelector ringkas />
            </div>
            <TemplateEngine
              templateConfig={getTemplateConfig()}
              data={formData}
              onDataChange={setFormData}
              mode="edit"
            />
          </div>
        ) : (
          <div className="p-8 text-center">
            <span className="material-symbols-outlined text-slate-300 text-5xl mb-4">{card.icon}</span>
            <p className="text-base font-bold text-slate-800 mb-2">{selectedSub?.label}</p>
            <p className="text-sm text-slate-500 mb-4">{selectedSub?.info}</p>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 max-w-sm mx-auto">
              <p className="text-xs text-amber-700">Template belum tersedia.</p>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (selectedSub?.templateId) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 space-y-6">
          {/* Auto-Fill Button */}
          <div className="flex items-center justify-between bg-gradient-to-r from-slate-50 to-white rounded-xl p-4 border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-amber-600">auto_awesome</span>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">Auto-Fill Data</p>
                <p className="text-xs text-slate-500">Isi dari profil guru/tendik otomatis</p>
              </div>
            </div>
            <AutoFillHonorButton
              templateId={selectedSub?.templateId}
              onAutoFill={onAutoFill}
            />
          </div>

          {/* Kertas cetak A4/F4 — satu pengaturan global semua dokumen */}
          <div className="flex justify-end print:hidden">
            <PaperSizeSelector ringkas />
          </div>

          {isTransportSub && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <span className="material-symbols-outlined text-xl">receipt_long</span>
                <h4 className="font-bold">Daftar Penerima Transport</h4>
              </div>
              <TemplateEngine
                templateConfig={getTemplateConfig()}
                data={formData}
                onDataChange={setFormData}
                mode="edit"
              />
            </div>
          )}

          {isTransportSub && hasSppdData && (
            <div className="relative">
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full">
                  <span className="material-symbols-outlined text-lg">description</span>
                  <span className="text-sm font-bold">Surat Perintah Tugas (SPPD)</span>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-primary/5 rounded-xl p-4 border border-blue-200 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-blue-600">auto_awesome</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-blue-800">Surat Perintah Tugas (SPPD)</p>
                    <p className="text-xs text-blue-600 mt-1">
                      Daftar nama penerima tugas terisi otomatis dari daftar penerima transport di atas.
                      Nomor surat di-generate terpisah melalui popup di header dokumen.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50/50 to-white rounded-2xl border border-blue-200 p-6">
                <TemplateEngine
                  templateConfig={TEMPLATE_CONFIGS.sppd}
                  data={sppdData}
                  onDataChange={setSppdData}
                  mode="edit"
                />
              </div>
            </div>
          )}

          {!isTransportSub && (
            <TemplateEngine
              templateConfig={getTemplateConfig()}
              data={formData}
              onDataChange={setFormData}
              mode="edit"
            />
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-8 text-center">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-slate-300 text-4xl">construction</span>
        </div>
        <p className="text-base font-bold text-slate-800 mb-2">{selectedSub?.label || card.nama}</p>
        <p className="text-sm text-slate-500 mb-4">Template belum tersedia untuk sub-kategori ini.</p>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 max-w-sm mx-auto">
          <p className="text-xs text-amber-700">
            Upload file template ke folder <code className="bg-amber-100 px-1 rounded">/template</code>
          </p>
        </div>
      </div>
    </div>
  )
}
