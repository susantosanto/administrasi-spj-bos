/**
 * MaminSeksiCard — pembungkus satu bagian form Mamin (Sprint 018, revisi UI 2026-10-22).
 *
 * Semua bagian memakai tampilan yang sama: kartu putih + nomor bagian (chip) +
 * judul + catatan singkat + ikon di kanan. Revisi 2026-10-22: label "Seksi N — …"
 * diganti penomoran chip + judul ringkas (dinilai lebih premium).
 */
export default function MaminSeksiCard({ nomor, judul, ikon = 'edit_note', children, catatan }) {
  const nomorTampil = String(nomor || '').padStart(2, '0')
  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
      <div className="flex items-start gap-3">
        <span className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-xl bg-primary/10 text-primary text-[11px] font-bold tracking-wide">
          {nomorTampil}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-[13px] font-semibold text-slate-800 tracking-tight leading-5">{judul}</h3>
          {catatan ? (
            <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">{catatan}</p>
          ) : null}
        </div>
        <span className="material-symbols-outlined text-slate-300 text-lg shrink-0">{ikon}</span>
      </div>
      {children}
    </section>
  )
}
