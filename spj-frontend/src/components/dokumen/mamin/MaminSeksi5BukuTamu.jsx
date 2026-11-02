/**
 * MaminSeksi5BukuTamu — Seksi 5 "Buku Tamu Kedinasan" (Sprint 018, K-6).
 *
 * Field TANPA input (otomatis di preview, sumber di REQUIREMENTS §3.2):
 * Hari/Tanggal (Seksi 1) · Ingin Bertemu (Kepala Sekolah) · Diterima Oleh
 * ("Kepala Sekolah") · Tujuan & Uraian (Nama Kegiatan).
 *
 * Yang TETAP ada di form: No. Urut, Tiba Pukul, Kembali Pukul, Identitas Tamu.
 */
import MaminSeksiCard from './MaminSeksiCard'

const INPUT = 'w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-primary outline-none'
// Tanpa `w-full` untuk input `flex-1` — `width:100%` mengalahkan `flex-basis`
// sehingga kolom menyusut dan teksnya hilang (revisi 2026-10-22).
const INPUT_SM = 'px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] focus:ring-1 focus:ring-primary outline-none'
const LABEL = 'block text-[10px] font-semibold text-slate-500 uppercase mb-1'

export default function MaminSeksi5BukuTamu({ formData = {}, setFormData }) {
  const bt = formData.bukuTamu || {}
  const rows = bt.rows || []

  const setBt = (key, value) => {
    setFormData({ ...formData, bukuTamu: { ...bt, [key]: value } })
  }

  const tambahTamu = () => {
    const next = [...rows, { id: `bt-${Date.now()}`, no: rows.length + 1, nama: '', jabatan: '', alamat: '' }]
    setFormData({ ...formData, bukuTamu: { ...bt, rows: next } })
  }

  const ubahTamu = (id, key, value) => {
    setFormData({ ...formData, bukuTamu: { ...bt, rows: rows.map((r) => (r.id === id ? { ...r, [key]: value } : r)) } })
  }

  const hapusTamu = (id) => {
    setFormData({ ...formData, bukuTamu: { ...bt, rows: rows.filter((r) => r.id !== id).map((r, i) => ({ ...r, no: i + 1 })) } })
  }

  return (
    <MaminSeksiCard
      nomor="5"
      judul="Buku Tamu"
      ikon="import_contacts"
      catatan="Opsional — diisi bila ada tamu luar. Tanggal, Ingin Bertemu, Tujuan, Uraian, dan Diterima Oleh sudah otomatis dari data kegiatan & kepala sekolah."
    >
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL}>No. Urut</label>
          <input type="text" value={bt.noUrut || ''} onChange={(e) => setBt('noUrut', e.target.value)} placeholder="1" className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>Tiba Pukul</label>
          <input type="text" value={bt.tiba || ''} onChange={(e) => setBt('tiba', e.target.value)} placeholder="09.00" className={INPUT} />
        </div>
      </div>

      <div>
        <label className={LABEL}>Kembali Pukul</label>
        <input type="text" value={bt.kembali || ''} onChange={(e) => setBt('kembali', e.target.value)} placeholder="11.00" className={INPUT} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className={LABEL.replace('mb-1', '')}>Identitas Tamu</span>
          <button type="button" onClick={tambahTamu} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-semibold hover:bg-primary/20 transition-all">
            <span className="material-symbols-outlined text-xs">add</span> Tambah Tamu
          </button>
        </div>
        {rows.length === 0 && <p className="text-[10px] text-slate-400 italic">Belum ada tamu.</p>}
        <div className="space-y-1.5">
          {rows.map((row) => (
            <div key={row.id} className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 w-4">{row.no}</span>
              <input type="text" value={row.nama || ''} onChange={(e) => ubahTamu(row.id, 'nama', e.target.value)} placeholder="Nama" className={`${INPUT_SM} flex-1 min-w-0`} />
              <input type="text" value={row.jabatan || ''} onChange={(e) => ubahTamu(row.id, 'jabatan', e.target.value)} placeholder="Jabatan" className={`${INPUT_SM} w-28 shrink-0`} />
              <input type="text" value={row.alamat || ''} onChange={(e) => ubahTamu(row.id, 'alamat', e.target.value)} placeholder="Alamat Kantor" className={`${INPUT_SM} w-36 shrink-0`} />
              <button type="button" onClick={() => hapusTamu(row.id)} className="p-1 text-red-500 hover:bg-red-50 rounded-lg" title="Hapus tamu">
                <span className="material-symbols-outlined text-xs">delete</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </MaminSeksiCard>
  )
}
