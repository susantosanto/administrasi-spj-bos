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
 */
import { Link } from 'react-router-dom'
import { getPejabatStatus, isSchoolDataEmpty } from '../../../utils/sekolahData'

const bannerClass =
  'peringatan-data print:hidden flex items-start gap-3 rounded-xl border border-red-300 bg-red-50 px-4 py-3'
const linkClass =
  'mt-2 inline-flex items-center gap-1 font-semibold text-red-700 underline underline-offset-2 hover:text-red-900'

export default function PeringatanData() {
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
