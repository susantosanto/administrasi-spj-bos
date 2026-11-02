/**
 * PeringatanData — Banner merah "data belum diisi" (Sprint 001 FASE 5, task 5.1)
 *
 * Dua varian pesan (US-15):
 *   1. Identitas sekolah kosong → "upload data sekolah terlebih dahulu"
 *      + tautan aksi ke tab Data Sekolah (T-05)
 *   2. Identitas terisi, ada peran pejabat kosong → menyebut HANYA peran yang
 *      kosong + tautan aksi ke tab Pejabat Sekolah (T-06, E-2)
 *
 * - Hanya tampil DI LAYAR: `print:hidden` + posisi pemasangan di luar
 *   `.print-container` memastikan banner tidak ikut tercetak (task 5.4).
 *   Pencetakan TIDAK diblokir (T-05d).
 * - Merah = pengecualian indikator status layar (CONSTITUTION; diuji T-10),
 *   tidak pernah ikut cetak.
 * - Data dibaca SAAT RENDER (sekolahData.js membaca localStorage tiap panggilan)
 *   sehingga tidak basi setelah Data Sekolah diubah tanpa reload (T-07).
 *
 * Sprint 008 Zona C (opsional, R2-dikecualikan): gate pra-cetak screen-only.
 * cetakGate = { pernyataan?: string[], siap?: boolean, pelanggaran?: string[],
 *   onCetak?: fn }. Tanpa cetakGate = perilaku banner lama (pemanggil lama aman).
 * Kontrak snapshot: onCetak dari pemanggil menulis spj_otomatis_snapshot
 * lalu window.print(); default bila tanpa onCetak = window.print() langsung.
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getPejabatStatus, isSchoolDataEmpty } from '../../../utils/sekolahData'

const bannerClass =
  'peringatan-data print:hidden flex items-start gap-3 rounded-xl border border-red-300 bg-red-50 px-4 py-3'
const linkClass =
  'mt-2 inline-flex items-center gap-1 font-semibold text-red-700 underline underline-offset-2 hover:text-red-900'

const PERNYATAAN_DEFAULT = [
  'Data sudah sesuai dokumen sumber',
  'Nomor dan tanggal dana masuk sudah benar',
  'Siap ditandatangani basah di atas materai',
]

export default function PeringatanData({ cetakGate = null }) {
  // ─── Sprint 008 Zona C: gate pra-cetak (screen-only, print:hidden) ───
  const [centang, setCentang] = useState([])
  if (cetakGate) {
    const pernyataan = cetakGate.pernyataan?.length ? cetakGate.pernyataan : PERNYATAAN_DEFAULT
    const siap = cetakGate.siap === true
    const semuaCentang = pernyataan.every((_, i) => centang[i])
    const bolehCetak = siap && semuaCentang
    const toggle = (i) => setCentang((prev) => pernyataan.map((_, k) => (k === i ? !prev[k] : !!prev[k])))
    const handleCetak = () => {
      if (!bolehCetak) return
      if (typeof cetakGate.onCetak === 'function') { cetakGate.onCetak(); return }
      window.print()
    }
    return (
      <div className="print:hidden rounded-2xl border border-slate-200 bg-white shadow-sm p-4 space-y-3" role="group" aria-label="Gate pra-cetak">
        <p className="text-sm font-bold text-slate-800">Siap cetak?</p>
        {pernyataan.map((teks, i) => (
          <label key={i} className="flex items-start gap-3 text-sm text-slate-700 cursor-pointer min-h-[44px]">
            <input
              type="checkbox"
              checked={!!centang[i]}
              onChange={() => toggle(i)}
              className="mt-1 h-5 w-5 accent-[#004ac6]"
            />
            <span>{teks}</span>
          </label>
        ))}
        {!siap && (
          <p className="text-xs text-slate-600" role="alert">
            Masih ada yang perlu diisi{cetakGate.pelanggaran?.length ? `: ${cetakGate.pelanggaran.join(', ')}` : ''} — tekan Cek di Panel Preview Document untuk melompat ke field-nya.
          </p>
        )}
        {siap && !semuaCentang && (
          <p className="text-xs text-slate-600">Centang semua pernyataan untuk membuka tombol Cetak.</p>
        )}
        <button
          type="button"
          onClick={handleCetak}
          disabled={!bolehCetak}
          title={bolehCetak ? 'Cetak dokumen' : 'Terhalang: lengkapi checklist dan data'}
          className="inline-flex items-center gap-2 px-5 min-h-[44px] rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary to-blue-600 shadow-lg shadow-primary/30 hover:brightness-110 transition-all disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-primary"
        >
          <span className="material-symbols-outlined text-lg">print</span>
          Cetak
        </button>
      </div>
    )
  }
  // ─── Varian 1: identitas sekolah kosong (T-05, E-1) ───
  if (isSchoolDataEmpty()) {
    return (
      <div className={bannerClass} role="alert">
        <span className="material-symbols-outlined text-red-600">warning</span>
        <div className="flex-1 text-sm">
          <p className="font-semibold text-red-800">Data sekolah belum diisi</p>
          <p className="mt-0.5 text-red-700">
            Upload data sekolah terlebih dahulu agar kop surat dan identitas
            dokumen terisi otomatis.
          </p>
          <Link to="/dashboard/data-sekolah" className={linkClass}>
            <span className="material-symbols-outlined text-sm">open_in_new</span>
            Buka tab Data Sekolah
          </Link>
        </div>
      </div>
    )
  }

  // ─── Varian 2: identitas terisi, sebut HANYA peran pejabat yang kosong (T-06, E-2) ───
  const kosong = getPejabatStatus()
  if (kosong.length === 0) return null

  return (
    <div className={bannerClass} role="alert">
      <span className="material-symbols-outlined text-red-600">warning</span>
      <div className="flex-1 text-sm">
        <p className="font-semibold text-red-800">Peran pejabat belum lengkap</p>
        <p className="mt-0.5 text-red-700">
          Kolom tanda tangan untuk {kosong.map((p) => p.label).join(', ')} masih
          kosong — isi di tab Pejabat Sekolah agar tercetak otomatis.
        </p>
        <Link to="/dashboard/pejabat-sekolah" className={linkClass}>
          <span className="material-symbols-outlined text-sm">open_in_new</span>
          Buka tab Pejabat Sekolah
        </Link>
      </div>
    </div>
  )
}
