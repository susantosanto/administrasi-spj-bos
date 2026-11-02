/**
 * MaminPesertaPicker — pemilih peserta Daftar Hadir dari Data Guru/Tendik
 * (Sprint 018). Dipisah dari `MaminSeksi2DaftarHadir.jsx` supaya file seksi
 * tetap ≤200 baris (konvensi repo).
 *
 * NIP peserta ikut terbawa (K-9). Peserta tanpa NIP (honorer) → NIP kosong
 * (jujur, bukan dikarang).
 */
import { bacaGTKUntukHadir } from '../../../utils/aturanPesanan'

const kunciOrang = (o) => o.nip || o.nuptk || o.nama || ''

export default function MaminPesertaPicker({ rows = [], onToggle }) {
  const gtk = bacaGTKUntukHadir()
  const terpilih = new Set(rows.map((r) => r.id).filter(Boolean))

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 max-h-56 overflow-y-auto space-y-1">
      {gtk.length === 0 && (
        <p className="text-xs text-slate-500 p-2">
          Belum ada data. Upload Data Guru / Tendik terlebih dahulu.
        </p>
      )}
      {gtk.map((o) => {
        const key = kunciOrang(o)
        const checked = terpilih.has(key)
        return (
          <label
            key={key}
            className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${checked ? 'bg-primary/10' : 'hover:bg-white'}`}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => onToggle(o)}
              className="w-4 h-4 accent-primary"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-800 truncate">{o.nama}</p>
              <p className="text-[10px] text-slate-500">
                {o.nip || o.nuptk ? `NIP ${o.nip || o.nuptk}` : 'NIP kosong'}
                {o.jabatan ? ` · ${o.jabatan}` : ''}
              </p>
            </div>
          </label>
        )
      })}
    </div>
  )
}
