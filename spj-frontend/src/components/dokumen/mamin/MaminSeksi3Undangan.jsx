/**
 * MaminSeksi3Undangan — Seksi 3 "Surat Undangan" (Sprint 018, K-6/K-7).
 *
 * Prinsip "satu data satu sumber": form ini HANYA berisi data yang belum ada
 * di tempat lain. Yang sudah ada (hari, tanggal acara, tempat, waktu, perihal,
 * alamat, sifat, lampiran, kepada Yth, isi undangan) dihitung otomatis di
 * `utils/maminOtomatis.js` dan tampil di Panel Preview Document — tanpa input.
 */
import MaminSeksiCard from './MaminSeksiCard'

const INPUT = 'w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-primary outline-none'
const LABEL = 'block text-[10px] font-semibold text-slate-500 uppercase mb-1'

export default function MaminSeksi3Undangan({ formData = {}, setFormData, onGenerateNomor }) {
  return (
    <MaminSeksiCard
      nomor="3"
      judul="Undangan Kedinasan"
      ikon="mail"
      catatan="Sifat, Lampiran, Perihal, Kepada Yth, dan isi surat sudah otomatis dari data kegiatan & Data Sekolah — cukup tampil di Panel Preview Document."
    >
      <div>
        <label className={LABEL}>Tanggal Surat</label>
        <input
          type="text"
          value={formData.tanggalSurat || ''}
          onChange={(e) => setFormData({ ...formData, tanggalSurat: e.target.value })}
          placeholder="Cikalongwetan, 20 Februari 2026"
          className={INPUT}
        />
      </div>

      <div>
        <label className={LABEL}>Nomor Surat Undangan</label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={formData.nomorUndangan || ''}
            onChange={(e) => setFormData({ ...formData, nomorUndangan: e.target.value })}
            placeholder="007/KKKS/…/2026"
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
    </MaminSeksiCard>
  )
}
