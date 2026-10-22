/**
 * SidebarPbj — blok "Dokumen PBJ" di sidebar BKU (Sprint 018, K-11/K-12).
 *
 * Letak: DI BAWAH form LPJ dan DI ATAS Panel Preview Document (AD-6, lewat
 * prop `blokTambahan` pada `DetailDokumenLpjBody`).
 *
 * Data:
 * - disimpan PER NoBukti (kunci `spj_pbj_bku`, AD-5) — tidak bercampur dengan
 *   form PBJ global di halaman Dokumen Kelengkapan;
 * - isian awal otomatis dari baris BKU (Tanggal · Kegiatan · Nominal · No Bukti);
 * - entri tersimpan menang atas prefill.
 *
 * Revisi 2026-10-22 (permintaan user): **mode pengadaan SIPLAH / NON-SIPLAH**
 * ditambahkan di sini, mengikuti konsep halaman Dokumen Kelengkapan —
 * SIPLAH = hanya tab Perencanaan (1 dokumen), NON-SIPLAH = keenam dokumen.
 * Mode disimpan di kunci `pbj_mode` (kunci yang sama dengan halaman itu).
 *
 * Komponen ini **controlled**: state form PBJ dipegang `BKUSidebarLpj` (supaya
 * preview panel bisa memakai data yang sama — AD-7), termasuk `mode`.
 */
import { useState } from 'react'
import SidebarPbjForm from './SidebarPbjForm'
import { tabsUntukMode } from '../../utils/pbjTabs'
import { simpanEntri } from '../../utils/pbjBkuStore'
import { useToast } from '../ui/Toast'

export default function SidebarPbj({
  kategori,
  transaction,
  form = {},
  onChange = null,
  savedAt = null,
  onSimpan = null,
  mode = 'non',
  onModeChange = null,
}) {
  const toast = useToast()
  const [tab, setTab] = useState('perencanaan')

  const tabs = tabsUntukMode(mode)
  const tabAktif = tabs.some((t) => t.id === tab) ? tab : tabs[0].id

  const gantiMode = (next) => {
    if (next === mode) return
    if (onModeChange) onModeChange(next)
    setTab('perencanaan')
  }

  const handleSimpan = () => {
    if (onSimpan) {
      onSimpan()
      return
    }
    const hasil = simpanEntri(kategori, transaction?.noBukti, { form })
    if (hasil.ok) toast.success('Dokumen PBJ tersimpan')
    else if (hasil.alasan === 'no-bukti') toast.info('Baris ini belum punya No Bukti — dokumen PBJ tidak bisa disimpan')
    else toast.info('Gagal menyimpan — penyimpanan penuh atau diblokir')
  }

  return (
    <section data-blok="pbj" className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-primary/10 text-primary">
            <span className="material-symbols-outlined text-base">receipt_long</span>
          </span>
          <div>
            <h3 className="text-[13px] font-semibold text-slate-800 tracking-tight leading-5">Dokumen PBJ</h3>
            <p className="text-[10px] text-slate-500">No. Bukti {transaction?.noBukti || '—'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {savedAt && (
            <span className="text-[11px] text-slate-500">
              Tersimpan {new Date(savedAt).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button
            type="button"
            onClick={handleSimpan}
            disabled={!transaction?.noBukti}
            title={transaction?.noBukti ? 'Simpan dokumen PBJ untuk NoBukti ini' : 'Baris tanpa No Bukti tidak bisa disimpan'}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              transaction?.noBukti
                ? 'bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg shadow-primary/30 hover:brightness-110 active:scale-95'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span className="material-symbols-outlined text-base">save</span>
            Simpan PBJ
          </button>
        </div>
      </div>

      {/* Mode pengadaan — konsep sama dengan halaman Dokumen Kelengkapan (revisi 2026-10-22) */}
      <div className="flex flex-wrap items-center gap-3" role="group" aria-label="Mode pengadaan PBJ">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mode pengadaan</span>
        <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1" role="switch" aria-checked={mode === 'siplah'} aria-label="Toggle SIPLAH NON-SIPLAH">
          <button
            type="button"
            onClick={() => gantiMode('non')}
            aria-pressed={mode === 'non'}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${mode === 'non' ? 'bg-primary text-white shadow' : 'text-slate-600 hover:text-slate-800'}`}
          >
            NON-SIPLAH
          </button>
          <button
            type="button"
            onClick={() => gantiMode('siplah')}
            aria-pressed={mode === 'siplah'}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${mode === 'siplah' ? 'bg-primary text-white shadow' : 'text-slate-600 hover:text-slate-800'}`}
          >
            SIPLAH
          </button>
        </div>
        <span className="text-[10px] text-slate-500" aria-live="polite">
          {mode === 'siplah' ? 'SIPLAH — hanya Perencanaan (1 dokumen)' : 'NON-SIPLAH — enam dokumen'}
        </span>
      </div>

      <p className="text-[11px] text-slate-500">
        Isian dasar terisi otomatis dari baris BKU (Tanggal · Kegiatan · Nominal · No. Bukti). Tersimpan
        terpisah untuk No. Bukti ini — dokumen PBJ di halaman Dokumen Kelengkapan tidak tersentuh.
      </p>

      <div className="flex flex-wrap gap-1 border-b border-slate-200">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-3 py-2 text-xs font-semibold border-b-2 -mb-px transition-colors ${
              tabAktif === t.id
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <SidebarPbjForm tab={tabAktif} form={form} onChange={onChange} />
    </section>
  )
}
