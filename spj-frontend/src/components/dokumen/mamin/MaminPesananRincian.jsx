/**
 * MaminPesananRincian — editor "Rincian Pesanan".
 *
 * Dipakai DUA tempat supaya tampil & berperilaku persis sama:
 * - sidebar BKU (`MaminSeksi4Pesanan`)
 * - halaman Dokumen LPJ (`DokumenFormPreview`, lewat prop `baku`)
 *
 * Revisi 2026-10-22 (permintaan user: "masih acak-acakan sekali"):
 * sebelumnya tiap baris memakai `flex` sehingga di panel lebar kolom Uraian
 * memakan ±85% (1163px dari 1367px) dan kolom Satuan/Jumlah jadi serpihan
 * 64/56px di ujung kanan. Sekarang memakai `<table table-fixed>` + `<colgroup>`
 * dengan **kepala kolom** (No · Uraian · Satuan · Jumlah) sehingga terbaca
 * sebagai tabel, bukan tumpukan kotak.
 *
 * Perilaku tetap sama dengan halaman LPJ:
 * - dua toggle seksi (Nasi Box / Snack Box) yang menyalakan-mematikan barisnya;
 * - penomoran baris **global** lintas seksi (1…10);
 * - "Isi menu baku" hanya muncul saat daftar kosong;
 * - baris warisan (seksi lain) tetap bisa diedit.
 */
import { Fragment } from 'react'
import { MENU_PESANAN, bangunPesananDuaSeksi } from '../../../utils/aturanMamin'

const SEKSI = [
  { id: 'nasi', label: `Nasi Box (${(MENU_PESANAN['nasi box'] || []).length})`, nama: 'Nasi Box', kunci: 'nasi box' },
  { id: 'snack', label: `Snack Box (${(MENU_PESANAN['snack box'] || []).length})`, nama: 'Snack Box', kunci: 'snack box' },
]

const TH = 'px-2 py-1.5 text-left text-[9px] font-bold uppercase tracking-wider text-slate-400'
// Input tanpa kotak: garis tabel yang memberi struktur, bukan border tiap field.
const SEL = 'w-full bg-transparent px-2 py-1 rounded-md text-[11px] text-slate-700 border border-transparent hover:border-slate-200 focus:border-primary/50 focus:ring-1 focus:ring-primary/25 outline-none transition-colors'

export default function MaminPesananRincian({ formData = {}, setFormData, baku = null }) {
  const rows = formData.pesananRows || []
  const aktif = (id) => (formData.seksiPesanan ? (formData.seksiPesanan[id] ?? true) : true)

  const satuanBaku = () => rows[0]?.satuan || baku?.pesananRows?.[0]?.satuan || 'Box'
  const jumlahBaku = () => formData.jumlahPesanan || baku?.jumlahPesanan || rows[0]?.jumlah || ''

  const setSeksi = (id, nyala) => {
    const next = { nasi: aktif('nasi'), snack: aktif('snack'), [id]: nyala }
    const seksiNama = SEKSI.find((s) => s.id === id)?.nama || ''
    let nextRows = [...rows]
    if (!nyala) {
      nextRows = nextRows.filter((r) => (r.seksi || seksiNama) !== seksiNama)
    } else {
      const ada = new Set(nextRows.filter((r) => (r.seksi || '') === seksiNama).map((r) => (r.uraian || '').toLowerCase()))
      const kunci = SEKSI.find((s) => s.id === id)?.kunci || ''
      for (const nama of MENU_PESANAN[kunci] || []) {
        if (!ada.has(nama.toLowerCase())) {
          nextRows.push({ id: `m-${Date.now()}-${nama}`, no: 0, seksi: seksiNama, uraian: nama, satuan: satuanBaku(), jumlah: jumlahBaku() })
        }
      }
    }
    setFormData({ ...formData, seksiPesanan: next, pesananRows: nextRows.map((r, i) => ({ ...r, no: i + 1 })) })
  }

  const tambahItem = () => {
    const seksiDef = aktif('nasi') ? 'Nasi Box' : (aktif('snack') ? 'Snack Box' : '')
    setFormData({ ...formData, pesananRows: [...rows, { id: `m-${Date.now()}`, no: rows.length + 1, seksi: seksiDef, uraian: '', satuan: '', jumlah: '' }] })
  }

  const ubahRow = (id, key, value) => {
    setFormData({ ...formData, pesananRows: rows.map((r) => (r.id === id ? { ...r, [key]: value } : r)) })
  }

  const hapusRow = (id) => {
    setFormData({ ...formData, pesananRows: rows.filter((r) => r.id !== id).map((r, i) => ({ ...r, no: i + 1 })) })
  }

  const isiMenuBaku = () => {
    setFormData({
      ...formData,
      seksiPesanan: { nasi: true, snack: true },
      pesananRows: bangunPesananDuaSeksi({ jumlah: jumlahBaku(), satuan: satuanBaku() }),
    })
  }

  const barisSeksi = (seksiNama) =>
    rows.map((r, i) => ({ ...r, _idx: i })).filter((r) => (r.seksi || seksiNama) === seksiNama)

  const warisan = rows.map((r, i) => ({ ...r, _idx: i })).filter((r) => r.seksi && r.seksi !== 'Nasi Box' && r.seksi !== 'Snack Box')

  const barisItem = (row) => (
    <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50/70 transition-colors">
      <td className="px-2 py-1 text-[10px] font-semibold text-slate-400 tabular-nums">{row._idx + 1}</td>
      <td className="px-1 py-0.5">
        <input type="text" value={row.uraian || ''} onChange={(e) => ubahRow(row.id, 'uraian', e.target.value)} placeholder="Uraian" className={SEL} />
      </td>
      <td className="px-1 py-0.5">
        <input type="text" value={row.satuan || ''} onChange={(e) => ubahRow(row.id, 'satuan', e.target.value)} placeholder="Satuan" className={`${SEL} text-center`} />
      </td>
      <td className="px-1 py-0.5">
        <input type="text" value={row.jumlah || ''} onChange={(e) => ubahRow(row.id, 'jumlah', e.target.value)} placeholder="Jumlah" className={`${SEL} text-center`} />
      </td>
      <td className="px-1 py-0.5 text-center">
        <button type="button" onClick={() => hapusRow(row.id)} className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Hapus item">
          <span className="material-symbols-outlined text-xs">delete</span>
        </button>
      </td>
    </tr>
  )

  const barisGrup = (judul) => (
    <tr>
      <td colSpan={5} className="px-2 pt-3 pb-1 text-[9px] font-bold uppercase tracking-wider text-slate-500">{judul}</td>
    </tr>
  )

  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-3 py-2 bg-slate-50 border-b border-slate-200">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Rincian Pesanan</span>
        <div className="flex items-center gap-1.5">
          {rows.length === 0 && (
            <button type="button" onClick={isiMenuBaku} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 text-[10px] font-semibold hover:border-primary/40 hover:text-primary transition-all">
              <span className="material-symbols-outlined text-xs">restaurant_menu</span> Isi menu baku
            </button>
          )}
          <button type="button" onClick={tambahItem} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-semibold hover:bg-primary/20 transition-all">
            <span className="material-symbols-outlined text-xs">add</span> Tambah Item
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 px-3 py-2 border-b border-slate-100">
        {SEKSI.map((s) => (
          <label key={s.id} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-semibold cursor-pointer transition-all ${aktif(s.id) ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
            <input type="checkbox" checked={aktif(s.id)} onChange={() => setSeksi(s.id, !aktif(s.id))} className="w-3 h-3 accent-primary" />
            {s.label}
          </label>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="px-3 py-4 text-[10px] text-slate-400 italic">Belum ada item pesanan.</p>
      ) : (
        <table className="w-full table-fixed">
          <colgroup>
            {/* Lebar tetap dibuat kecil supaya kolom Uraian tetap terbaca juga di
                panel sempit (halaman LPJ ±414px) maupun lebar (sidebar ±1367px). */}
            <col style={{ width: '32px' }} />
            <col />
            <col style={{ width: '72px' }} />
            <col style={{ width: '72px' }} />
            <col style={{ width: '32px' }} />
          </colgroup>
          <thead>
            <tr className="border-b border-slate-200 bg-white">
              <th className={TH}>No</th>
              <th className={TH}>Uraian</th>
              <th className={`${TH} text-center`}>Satuan</th>
              <th className={`${TH} text-center`}>Jumlah</th>
              <th className="px-1 py-1.5" />
            </tr>
          </thead>
          <tbody>
            {['Nasi Box', 'Snack Box'].map((seksiNama) => {
              const daftar = barisSeksi(seksiNama)
              if (daftar.length === 0) return null
              return (
                <Fragment key={seksiNama}>
                  {barisGrup(`${seksiNama} (${daftar.length})`)}
                  {daftar.map(barisItem)}
                </Fragment>
              )
            })}
            {warisan.length > 0 && (
              <>
                {barisGrup(`Item lain (${warisan.length})`)}
                {warisan.map(barisItem)}
              </>
            )}
          </tbody>
        </table>
      )}
    </div>
  )
}
