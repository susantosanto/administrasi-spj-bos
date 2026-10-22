/**
 * MaminSeksi1Dasar — Seksi 1 "Data Dasar" (Sprint 018, K-5/K-6).
 *
 * Isi form yang WAJIB diisi user (semuanya sumber tunggal):
 * - Tanggal        → dari baris BKU (otomatis, read-only)
 * - No. Surat      → generate (NomorSuratPopup)
 * - Waktu          → diketik user
 * - Tempat         → default "Ruang Rapat <nama sekolah>" (otomatis, bisa diubah)
 * - Nama Kegiatan  → satu field; teks panjang MEMBUNGKUS ke bawah (wrap)
 *
 * Field yang TIDAK ada di sini (otomatis di preview, tanpa input):
 * tanggal acara · tempat acara · waktu acara · sifat · lampiran · perihal ·
 * kepada Yth · isi undangan · hari · tanggal dana masuk.
 */
import { useRef } from 'react'
import MaminSeksiCard from './MaminSeksiCard'

const INPUT = 'w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-primary outline-none'
const LABEL = 'block text-[10px] font-semibold text-slate-500 uppercase mb-1'

export default function MaminSeksi1Dasar({ formData = {}, setFormData, bku = {}, onGenerateNomor }) {
  const refArea = useRef(null)

  // Nama kegiatan: satu baris penuh; teks panjang membungkus ke bawah.
  const onNamaKegiatan = (e) => {
    setFormData({ ...formData, acara: e.target.value })
    const el = refArea.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = `${el.scrollHeight}px`
    }
  }

  return (
    <MaminSeksiCard
      nomor="1"
      judul="Identitas Kegiatan"
      ikon="event_note"
      catatan="Tanggal & tempat otomatis dari data sekolah. Isi yang lain dipakai bersama oleh Undangan, Pesanan, dan Buku Tamu — tidak perlu diisi berulang."
    >
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL}>Tanggal</label>
          <input
            type="text"
            readOnly
            value={bku?.tanggalStr || formData.tanggal || ''}
            className={`${INPUT} bg-slate-100 text-slate-600 cursor-default`}
            title="Otomatis dari baris BKU"
          />
        </div>
        <div>
          <label className={LABEL}>Waktu</label>
          <input
            type="text"
            value={formData.waktu || ''}
            onChange={(e) => setFormData({ ...formData, waktu: e.target.value })}
            placeholder="08.00 s.d. 10.00"
            className={INPUT}
          />
        </div>
      </div>

      <div>
        <label className={LABEL}>No. Surat (Utama)</label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={formData.nomor || ''}
            onChange={(e) => setFormData({ ...formData, nomor: e.target.value })}
            placeholder="422.1/UND-001/SDN-PSR/VII/2026"
            className={`${INPUT} font-mono`}
          />
          <button
            type="button"
            onClick={onGenerateNomor}
            className="shrink-0 inline-flex items-center gap-1 px-2.5 py-2 rounded-lg bg-primary/10 text-primary text-[10px] font-semibold hover:bg-primary/20 transition-all"
            title="Generate nomor surat"
          >
            <span className="material-symbols-outlined text-[12px]">auto_fix_high</span>
            Generate
          </button>
        </div>
      </div>

      <div>
        <label className={LABEL}>Tempat</label>
        <input
          type="text"
          value={formData.tempat || ''}
          onChange={(e) => setFormData({ ...formData, tempat: e.target.value })}
          placeholder="Ruang Rapat …"
          className={INPUT}
        />
        <p className="mt-1 text-[10px] text-slate-400">Default: "Ruang Rapat &lt;nama sekolah&gt;" dari Data Sekolah.</p>
      </div>

      <div>
        <label className={LABEL}>Nama Kegiatan</label>
        <textarea
          ref={refArea}
          rows={1}
          value={formData.acara || ''}
          onChange={onNamaKegiatan}
          placeholder="Rapat Guru)… — teks panjang otomatis membungkus ke bawah"
          className={`${INPUT} resize-none overflow-hidden`}
        />
        <p className="mt-1 text-[10px] text-slate-400">
          Satu field — dipakai juga untuk Perihal Undangan, Tujuan &amp; Uraian Buku Tamu.
        </p>
      </div>
    </MaminSeksiCard>
  )
}
