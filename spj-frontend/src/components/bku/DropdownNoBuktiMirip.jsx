/**
 * DropdownNoBuktiMirip — lompat ke baris BKU yang "mirip" (Sprint 018, K-1…K-4).
 *
 * Kandidat = baris dengan `kodeRekening` + `kodeKegiatan` identik dan **bulan
 * berbeda** (lihat `utils/bkuMirip.js`). Tujuannya: mencetak kegiatan rutin
 * tiap bulan tanpa mengisi form dari nol.
 *
 * Memilih kandidat → **panel detail berpindah** ke baris itu (dipanggil lewat
 * `onPilih`, yang memakai navigasi baris yang sudah ada). Bila isian form belum
 * disimpan (K-4) → dialog "Simpan dulu?" (A-3: dialog di dalam sidebar, bukan
 * `window.confirm`).
 */
import { useState } from 'react'
import { kandidatMirip, labelKandidat, alasanKosong } from '../../utils/bkuMirip'

export default function DropdownNoBuktiMirip({
  transaction = {},
  allTransactions = [],
  onPilih = null,
  onSimpanLaluPilih = null,
  kotor = false,
}) {
  const [open, setOpen] = useState(false)
  const [tunda, setTunda] = useState(null)

  const kandidat = kandidatMirip(allTransactions, transaction)
  const pesanKosong = alasanKosong(transaction)

  const pilih = (k) => {
    setOpen(false)
    if (kotor && onSimpanLaluPilih) {
      setTunda(k)
      return
    }
    if (onPilih) onPilih(k)
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={kandidat.length === 0}
        title={kandidat.length === 0 ? pesanKosong : 'Buka dokumen kegiatan yang sama pada periode lain'}
        className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
          kandidat.length === 0
            ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
            : 'bg-white text-slate-700 border-slate-200 hover:border-primary/40 hover:text-primary shadow-sm'
        }`}
      >
        <span className="material-symbols-outlined text-base">content_copy</span>
        <span className="whitespace-nowrap">Kode Rekening / Kode Kegiatan Serupa</span>
        {kandidat.length > 0 && (
          <span className="px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold">{kandidat.length}</span>
        )}
      </button>

      {open && kandidat.length > 0 && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-80 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
              <p className="text-[11px] font-bold text-slate-700">Kegiatan serupa · periode berbeda</p>
              <p className="text-[10px] text-slate-500">Kode rekening dan kode kegiatan sama. Pilih untuk melanjutkan tanpa mengisi ulang.</p>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {kandidat.map((k) => (
                <button
                  key={k.row}
                  type="button"
                  onClick={() => pilih(k)}
                  className="w-full text-left px-4 py-2.5 hover:bg-primary/5 border-b border-slate-100 last:border-0 transition-colors"
                >
                  <span className="block text-xs font-semibold text-slate-800">{labelKandidat(k)}</span>
                  {k.noBukti ? (
                    <span className="block text-[10px] text-slate-400">No Bukti {k.noBukti}</span>
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {tunda && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/30" onClick={() => setTunda(null)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 p-5 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Isian belum disimpan</h3>
              <p className="text-[11px] text-slate-500 mt-1">
                Simpan dulu isian untuk NoBukti <strong>{transaction?.noBukti || '—'}</strong> sebelum berpindah ke{' '}
                <strong>{labelKandidat(tunda)}</strong>?
              </p>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setTunda(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Batal
              </button>
              {onSimpanLaluPilih && (
                <button
                  type="button"
                  onClick={() => {
                    const k = tunda
                    setTunda(null)
                    onSimpanLaluPilih(k)
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-primary to-blue-600 text-white text-xs font-semibold rounded-lg shadow-lg shadow-primary/25 hover:brightness-110 transition-all"
                >
                  Simpan &amp; Pindah
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
