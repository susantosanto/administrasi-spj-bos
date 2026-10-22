/**
 * MaminSeksi4Pesanan — bagian "Pesanan Konsumsi" (Sprint 018, K-6/K-7).
 *
 * Field TANPA input (otomatis di preview): Sifat, Perihal, Isi Surat Pesanan.
 * Field yang TETAP ada (belum ada sumbernya): Tanggal Surat, Nomor, Kepada Yth
 * (toko), Alamat Toko, Rincian Pesanan, Hari/Tanggal, Jenis Pesanan, Jumlah.
 *
 * Revisi UI 2026-10-22 (permintaan user): urutan field dan **blok Rincian
 * Pesanan disamakan dengan halaman Dokumen LPJ** — blok rincian dipindah ke
 * `MaminPesananRincian` (perilaku identik, berkas dipisah agar ≤200 baris).
 *
 * Catatan A-8: "Hari/Tanggal" tetap ada di form; nilainya default = hari+tanggal
 * dari Tanggal Surat (dipakai `maminOtomatis`), dan boleh dikoreksi user.
 */
import MaminSeksiCard from './MaminSeksiCard'
import MaminPesananRincian from './MaminPesananRincian'

const INPUT = 'w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-primary outline-none'
const LABEL = 'block text-[10px] font-semibold text-slate-500 uppercase mb-1'

export default function MaminSeksi4Pesanan({ formData = {}, setFormData, onGenerateNomor }) {
  return (
    <MaminSeksiCard
      nomor="4"
      judul="Pesanan Konsumsi"
      ikon="shopping_cart"
      catatan="Sifat, perihal, dan isi surat tersusun otomatis di Panel Preview Document. Tanggal pesanan mengikuti Tanggal Surat di bagian 03."
    >
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL}>Tanggal Surat</label>
          <input
            type="text"
            value={formData.tanggalSurat || ''}
            onChange={(e) => setFormData({ ...formData, tanggalSurat: e.target.value })}
            placeholder="Cikalongwetan, 18 Februari 2026"
            className={INPUT}
          />
          <p className="mt-1 text-[10px] text-slate-400">Sama dengan Tanggal Surat Undangan (satu sumber data).</p>
        </div>
        <div>
          <label className={LABEL}>Nomor Surat Pesanan</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={formData.nomorPesanan || ''}
              onChange={(e) => setFormData({ ...formData, nomorPesanan: e.target.value })}
              placeholder="008/KKKS/…/2026"
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
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL}>Kepada Yth (Nama Toko/RM)</label>
          <input type="text" value={formData.kepadaPesanan || ''} onChange={(e) => setFormData({ ...formData, kepadaPesanan: e.target.value })} placeholder="Toko/RM. Family" className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>Alamat Toko</label>
          <input type="text" value={formData.alamatToko || ''} onChange={(e) => setFormData({ ...formData, alamatToko: e.target.value })} placeholder="Di tempat" className={INPUT} />
        </div>
      </div>

      <MaminPesananRincian formData={formData} setFormData={setFormData} />

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={LABEL}>Hari/Tanggal</label>
          <input
            type="text"
            value={formData.hariPesanan || ''}
            onChange={(e) => setFormData({ ...formData, hariPesanan: e.target.value, hariPesananManual: true })}
            placeholder="Senin 20 Februari 2026"
            className={INPUT}
          />
          <p className="mt-1 text-[10px] text-slate-400">Default: mengikuti Tanggal Surat.</p>
        </div>
        <div>
          <label className={LABEL}>Jenis Pesanan</label>
          <input type="text" value={formData.jenisPesanan || ''} onChange={(e) => setFormData({ ...formData, jenisPesanan: e.target.value })} placeholder="Nasi Box / Snack" className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>Jumlah</label>
          <input type="text" value={formData.jumlahPesanan || ''} onChange={(e) => setFormData({ ...formData, jumlahPesanan: e.target.value })} placeholder="105 Box" className={INPUT} />
        </div>
      </div>
    </MaminSeksiCard>
  )
}
