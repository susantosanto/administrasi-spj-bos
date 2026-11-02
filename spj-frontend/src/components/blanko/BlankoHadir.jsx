/**
 * BlankoHadir — Sprint 024: isian premium Daftar Hadir (blanko).
 * Split-view: form kiri (identitas + peserta dari Guru/Tendik + manual)
 * + Panel Preview kanan. Tersimpan `spj_blanko_dh`. Cetak A4 portrait.
 */
import { useState } from 'react'
import storageHelper from '../../utils/storageHelper'
import { useToast } from '../ui/Toast'
import PanelPreviewDocument from '../templates/PanelPreviewDocument'
import { TEMPLATE_CONFIGS } from '../../data/templateConfig'
import { formatTanggalContoh } from '../../utils/dokKas'

const INPUT = 'w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none min-h-[44px]'
const LABEL = 'block text-xs font-medium text-slate-700 mb-1'
const KUNCI = 'spj_blanko_dh'

const kosong = () => ({ kegiatan: '', tanggal: '', waktu: '', tempat: '', rows: [] })

export default function BlankoHadir({ onKembali }) {
  const toast = useToast()
  const [form, setForm] = useState(() => storageHelper.get(KUNCI, kosong()))
  const [segar, setSegar] = useState(0)
  const [pilihGuru, setPilihGuru] = useState({})
  const [pilihTendik, setPilihTendik] = useState({})
  const [manual, setManual] = useState({ nama: '', nip: '', jabatan: '' })

  const simpan = (next) => {
    storageHelper.set(KUNCI, next)
    setForm(next)
    setSegar((v) => v + 1)
  }
  const ubah = (key, value) => simpan({ ...form, [key]: value })

  const guru = storageHelper.get('data_guru', []) || []
  const tendik = storageHelper.get('data_tendik', []) || []
  const toggle = (set, nama) => set((prev) => ({ ...prev, [nama]: !prev[nama] }))
  const tambahTerpilih = () => {
    const ambil = (list, pilih) => list.filter((g) => pilih[g.nama]).map((g) => ({
      id: `${Date.now()}-${g.nama}`, nama: g.nama || '', nip: g.nip || '', jabatan: g.jabatan || '',
    }))
    const baru = [...ambil(guru, pilihGuru), ...ambil(tendik, pilihTendik)]
    if (baru.length === 0) { toast.info('Centang dulu guru/tendik yang hadir'); return }
    simpan({ ...form, rows: [...(form.rows || []), ...baru] })
    setPilihGuru({})
    setPilihTendik({})
    toast.success(`${baru.length} peserta ditambahkan`)
  }
  const tambahManual = () => {
    if (!manual.nama.trim()) { toast.info('Nama wajib diisi'); return }
    simpan({ ...form, rows: [...(form.rows || []), { id: `${Date.now()}`, ...manual }] })
    setManual({ nama: '', nip: '', jabatan: '' })
  }
  const hapusBaris = (id) => simpan({ ...form, rows: (form.rows || []).filter((r) => r.id !== id) })

  const data = {
    ...TEMPLATE_CONFIGS.daftar_hadir_blanko.defaults,
    kegiatan: form.kegiatan || '', tanggal: form.tanggal ? (formatTanggalContoh(form.tanggal) || form.tanggal) : '',
    waktu: form.waktu || '', tempat: form.tempat || '',
    rows: (form.rows || []).map((r, i) => ({ ...r, no: i + 1 })),
  }
  const docs = [{ key: 'daftar-hadir', label: 'Daftar Hadir', templateConfig: TEMPLATE_CONFIGS.daftar_hadir_blanko, data }]

  const daftarPilih = (list, pilih, set) => (
    <div className="space-y-1.5 max-h-36 overflow-y-auto">
      {list.length === 0 && <p className="text-[11px] text-slate-400">Belum ada data — upload dulu di Data Guru/Tendik.</p>}
      {list.map((g) => (
        <label key={g.nama} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer transition-all ${pilih[g.nama] ? 'bg-primary/10 border border-primary/40' : 'bg-slate-50 border border-slate-200'}`}>
          <span className="text-xs font-semibold text-slate-700 flex-1">{g.nama}</span>
          <span className="text-[10px] text-slate-400">{g.jabatan || ''}</span>
          <input type="checkbox" checked={!!pilih[g.nama]} onChange={() => toggle(set, g.nama)} className="w-4 h-4 accent-[#004ac6]" />
        </label>
      ))}
    </div>
  )

  return (
    <section aria-label="Daftar Hadir blanko" className="w-full bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-5">
      <div className="flex items-center gap-2">
        <button onClick={onKembali} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 min-h-[44px]">
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Kembali ke Daftar
        </button>
        <span className="text-[11px] text-slate-400">Daftar Hadir · tersimpan otomatis di perangkat ini</span>
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,620px)] items-start">
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <label className={LABEL}>Nama Kegiatan<input value={form.kegiatan || ''} onChange={(e) => ubah('kegiatan', e.target.value)} placeholder="Rapat Komite" className={INPUT} /></label>
            <label className={LABEL}>Tanggal<input type="date" value={form.tanggal || ''} onChange={(e) => ubah('tanggal', e.target.value)} className={INPUT} /></label>
            <label className={LABEL}>Waktu<input value={form.waktu || ''} onChange={(e) => ubah('waktu', e.target.value)} placeholder="08:00 - 12:00" className={INPUT} /></label>
            <label className={LABEL}>Tempat<input value={form.tempat || ''} onChange={(e) => ubah('tempat', e.target.value)} placeholder="Ruang Guru" className={INPUT} /></label>
          </div>
          <div>
            <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">Dari Data Guru</h4>
            {daftarPilih(guru, pilihGuru, setPilihGuru)}
          </div>
          <div>
            <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">Dari Data Tendik</h4>
            {daftarPilih(tendik, pilihTendik, setPilihTendik)}
          </div>
          <button onClick={tambahTerpilih} className="w-full py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:brightness-110 active:scale-[0.98] min-h-[44px]">
            Tambah yang dicentang ({Object.values(pilihGuru).filter(Boolean).length + Object.values(pilihTendik).filter(Boolean).length})
          </button>
          <div>
            <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">Tambah manual</h4>
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <input value={manual.nama} onChange={(e) => setManual({ ...manual, nama: e.target.value })} placeholder="Nama" className={INPUT} />
              <input value={manual.nip} onChange={(e) => setManual({ ...manual, nip: e.target.value })} placeholder="NIP" className={INPUT} />
              <input value={manual.jabatan} onChange={(e) => setManual({ ...manual, jabatan: e.target.value })} placeholder="Jabatan" className={INPUT} />
              <button onClick={tambahManual} className="px-4 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 min-h-[44px]">Tambah</button>
            </div>
          </div>
          {(form.rows || []).length > 0 && (
            <div>
              <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">Peserta ({form.rows.length})</h4>
              <ul className="space-y-1.5">
                {form.rows.map((r, i) => (
                  <li key={r.id || i} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] text-slate-400 w-5">{i + 1}.</span>
                    <span className="text-xs font-semibold text-slate-700 flex-1">{r.nama}</span>
                    <button onClick={() => hapusBaris(r.id)} aria-label={`Hapus ${r.nama}`} className="p-1 rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-600">
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <aside className="print:hidden min-w-0 lg:sticky lg:top-[88px] self-start">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Panel Preview Document</h3>
          <PanelPreviewDocument title="Daftar Hadir" docs={docs}
            status={{ perlu: 0, violations: [] }} cetakAktif
            onCek={() => toast.success((form.rows || []).length > 0 ? 'LENGKAP — siap cetak' : 'Belum ada peserta')}
            onCetak={() => window.print()} />
        </aside>
      </div>
    </section>
  )
}
