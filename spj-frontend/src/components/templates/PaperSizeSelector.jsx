import { useEffect, useState } from 'react'
import { PAPER_SIZES, PAPER_EVENT, getPaperSize, setPaperSize } from '../../utils/paperSize'

// Pemilih kertas A4 / F4 (Folio 8,5x13") — satu pengaturan global untuk
// SEMUA dokumen formal. Disimpan spj_kertas; perubahan disiarkan via
// event spj:kertas-change sehingga TemplateEngine + panel ikut tanpa reload.
export default function PaperSizeSelector({ ringkas = false }) {
  const [kertas, setKertas] = useState(getPaperSize())

  useEffect(() => {
    const sinkron = (e) => {
      if (e?.detail?.paper) setKertas(e.detail.paper)
    }
    window.addEventListener(PAPER_EVENT, sinkron)
    return () => window.removeEventListener(PAPER_EVENT, sinkron)
  }, [])

  const pilih = (id) => {
    if (setPaperSize(id)) setKertas(id)
  }

  return (
    <div
      className="inline-flex items-center gap-1 rounded-xl bg-slate-100 p-1"
      role="group"
      aria-label="Pilih ukuran kertas cetak"
      title="Ukuran kertas cetak — berlaku untuk semua dokumen"
    >
      <span className="material-symbols-outlined text-base text-slate-500 pl-1" aria-hidden="true">
        description
      </span>
      {Object.values(PAPER_SIZES).map((p) => {
        const aktif = kertas === p.id
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => pilih(p.id)}
            aria-pressed={aktif}
            title={`${p.label} — ${p.ukuran}`}
            className={`rounded-lg px-3 min-h-[36px] text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-primary ${
              aktif
                ? 'bg-primary text-white shadow-sm'
                : 'text-slate-600 hover:bg-white hover:text-slate-900'
            }`}
          >
            {ringkas ? p.id : p.label}
          </button>
        )
      })}
    </div>
  )
}
