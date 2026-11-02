/**
 * DetailDokumenLpjHeader — bagian kepala panel dokumen LPJ.
 *
 * Sprint 017 AD-1: dipindahkan APA ADANYA dari `DokumenSPJPage.jsx`
 * (`renderDetailPanel`, dulu baris 517-616) supaya halaman LPJ dan sidebar BKU
 * memakai tampilan yang sama. Jangan ubah kelas/tata letak di sini tanpa pack —
 * hash panel 4 kategori dipakai sebagai pembanding regresi.
 */
import MenuGuide from '../guide/MenuGuide'

export default function DetailDokumenLpjHeader({
  card,
  selectedSub,
  onSubChange,
  getStatus,
  prefillBadge = null,
  onUndoPrefill = null,
  guideCtx = null,
  onGuideJump = null,
  onClose,
  isSpecial = false,
}) {
  return (
    <>
      {/* Header Panel */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/30">
              <span className="material-symbols-outlined text-3xl text-white">{card.icon}</span>
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-wider">
              Detail Dokumen
            </span>
            <h3 className="text-lg font-bold text-slate-800 mt-2">{card.nama}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{card.deskripsi}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Sprint 003 FASE 4 (US-26): pill Panduan sadar-state di 4 menu LPJ.
              key={menuId} → remount per menu: popover TIDAK kebawa antar menu. */}
          {isSpecial && guideCtx && (
            <MenuGuide
              key={card.id}
              menuId={card.id}
              ctx={guideCtx}
              onJump={onGuideJump}
            />
          )}
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl hover:bg-slate-100 transition-all duration-300 hover:scale-110 active:scale-95"
          >
            <span className="material-symbols-outlined text-slate-400 hover:text-slate-600">close</span>
          </button>
        </div>
      </div>

      {/* Revisi UI 2026-10-22: chip "dari BKU …" dihapus (dinilai tidak premium).
          Fungsi Urungkan prefill tetap ada — hanya muncul bila ada field yang tertimpa. */}
      {prefillBadge && onUndoPrefill && (prefillBadge.tertimpa?.length || 0) > 0 && (
        <div className="flex justify-end">
          <button
            onClick={onUndoPrefill}
            className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-sm">undo</span>
            Urungkan isian otomatis ({prefillBadge.tertimpa.length} field)
          </button>
        </div>
      )}

      {/* Sub-Kategori Tabs (non-special cards) */}
      {!isSpecial && card.subKategori && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {card.subKategori.map((sub, index) => {
            const subStatus = getStatus(card.id, sub.id)
            const isActive = selectedSub?.id === sub.id

            return (
              <button
                key={sub.id}
                onClick={() => !sub.comingSoon && onSubChange(sub)}
                disabled={sub.comingSoon}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg shadow-primary/30 scale-105'
                    : sub.comingSoon
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:scale-105'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {subStatus === 'Lengkap' && <span className="text-emerald-400 text-[10px]">✓</span>}
                {subStatus === 'Draft' && <span className="text-amber-400 text-[10px]">◐</span>}
                {sub.label}
                {sub.comingSoon && <span className="text-slate-400 text-[10px]">(Soon)</span>}
              </button>
            )
          })}
        </div>
      )}
    </>
  )
}
