/**
 * MaminForm6Seksi — form Mamin 6 seksi untuk SIDEBAR BKU (Sprint 018).
 *
 * Dipakai HANYA pada varian sidebar (`varianForm='sidebar6'`). Halaman Dokumen LPJ
 * (menu kiri) tetap memakai form lama di `DokumenFormPreview` — tidak berubah.
 *
 * Seksi:
 *   1 Data Dasar · 2 Daftar Hadir · 3 Surat Undangan · 4 Surat Pesanan
 *   5 Buku Tamu Kedinasan · 6 Notulen/Resume (AI)
 *
 * Prinsip (K-6): satu data satu sumber. Field yang datanya sudah ada di seksi
 * sebelumnya / Data Sekolah / BKU TIDAK punya input di sini — nilainya dihitung
 * di `utils/maminOtomatis.js` dan tampil di Panel Preview Document.
 */
import { useState } from 'react'
import MaminSeksi1Dasar from './MaminSeksi1Dasar'
import MaminSeksi2DaftarHadir from './MaminSeksi2DaftarHadir'
import MaminSeksi3Undangan from './MaminSeksi3Undangan'
import MaminSeksi4Pesanan from './MaminSeksi4Pesanan'
import MaminSeksi5BukuTamu from './MaminSeksi5BukuTamu'
import MaminSeksi6Notulen from './MaminSeksi6Notulen'
import NomorSuratPopup from '../../templates/blocks/NomorSuratPopup'

export default function MaminForm6Seksi({ formData = {}, setFormData, bku = {} }) {
  const [popup, setPopup] = useState(null) // 'nomor' | 'undangan' | 'pesanan'

  const tutup = () => setPopup(null)
  const pilih = (key) => (nomor) => {
    setFormData({ ...formData, [key]: nomor })
    tutup()
  }

  return (
    <div className="space-y-4">
      <MaminSeksi1Dasar
        formData={formData}
        setFormData={setFormData}
        bku={bku}
        onGenerateNomor={() => setPopup('nomor')}
      />
      <MaminSeksi2DaftarHadir formData={formData} setFormData={setFormData} />
      <MaminSeksi3Undangan formData={formData} setFormData={setFormData} onGenerateNomor={() => setPopup('undangan')} />
      <MaminSeksi4Pesanan formData={formData} setFormData={setFormData} onGenerateNomor={() => setPopup('pesanan')} />
      <MaminSeksi5BukuTamu formData={formData} setFormData={setFormData} />
      <MaminSeksi6Notulen formData={formData} setFormData={setFormData} />

      {popup === 'nomor' && (
        <NomorSuratPopup onSelect={pilih('nomor')} onClose={tutup} currentNomor={formData.nomor} />
      )}
      {popup === 'undangan' && (
        <NomorSuratPopup onSelect={pilih('nomorUndangan')} onClose={tutup} currentNomor={formData.nomorUndangan} />
      )}
      {popup === 'pesanan' && (
        <NomorSuratPopup onSelect={pilih('nomorPesanan')} onClose={tutup} currentNomor={formData.nomorPesanan} />
      )}
    </div>
  )
}
