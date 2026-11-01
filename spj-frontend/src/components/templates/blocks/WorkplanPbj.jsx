/**
 * WorkplanPbj — isi DOKUMEN PERENCANAAN identik sheet "Workplan"
 * (template/Dokumen PBJ_2026_Lbs.xlsx).
 *
 * Struktur sumber: meta (No. | bulan+tahun | hari tanggal; Nama Satuan
 * pendidikan; Alamat; Kategori Barang/Jasa) + tabel 6 baris
 * (No | Jenis | Keterangan) dengan baris 6 bersarang (a/b/c penyedia).
 * Sprint 023-rev (perintah user 2026-10-31): ganti struktur lama
 * (kegiatan/spesifikasi/syaratA-B-C) yang tidak ada di file sumber.
 *
 * Props: { blockConfig, data, onChange, mode } — pola blok lain.
 * data = rakitan pbjDocs (previewDocs.js): noBukti, bulanTahun, hari,
 * namaSekolah, alamatSekolah, kategori, jumlahBarang, spesifikasi,
 * waktuSerah, alokasiRp, jenisPenyedia, direktur, namaPenyedia, npwp,
 * alamat, telp.
 */
import { PlaceholderText } from '../../../utils/templateHelpers'

const KECIL = 'text-[11px]'

function Nilai({ value, label }) {
  const v = String(value ?? '').trim()
  if (v) return <span>{v}</span>
  return <PlaceholderText label={label} />
}

function BarisMeta({ kiri, nilaiKiri, labelKiri, kanan }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1">
      <div className="flex items-start gap-2 min-w-0">
        <span className={`${KECIL} text-slate-700 shrink-0 w-40`}>{kiri}</span>
        <span className={`${KECIL} text-slate-700`}>:</span>
        <span className={`${KECIL} text-slate-900 break-words`}>
          <Nilai value={nilaiKiri} label={labelKiri} />
        </span>
      </div>
      {kanan && <div className={`${KECIL} text-slate-900 text-right shrink-0`}>{kanan}</div>}
    </div>
  )
}

export default function WorkplanPbj({ data = {}, onChange, mode }) {
  const d = data || {}
  const edit = mode === 'edit'

  const ubah = (key) => (e) => {
    if (onChange) onChange(key, e.target.value)
  }

  // Baris 6: persyaratan penyedia bersarang a/b/c persis file sumber.
  const syarat = (
    <div className="space-y-1">
      <div>
        Penyedia : <Nilai value={d.jenisPenyedia} label="Jenis penyedia" />
      </div>
      <div>Memenuhi syarat sebagai berikut:</div>
      <div className="pl-4">
        <div>a. Identitas Penyedia:</div>
        <div className="pl-4">
          <div>Pemilik/Direktur : <Nilai value={d.direktur} label="Pemilik/Direktur" /></div>
          <div><Nilai value={d.namaPenyedia} label="Nama penyedia" /></div>
        </div>
        <div>b. NPWP : <Nilai value={d.npwp} label="NPWP" /></div>
        <div>c. Alamat penyedia:</div>
        <div className="pl-4">
          <div><Nilai value={d.alamat} label="Alamat penyedia" /></div>
          <div>Telp. : <Nilai value={d.telp} label="No. Telp" /></div>
        </div>
      </div>
    </div>
  )

  const baris = [
    { no: 1, jenis: 'Jumlah Barang/Jasa', isi: <Nilai value={d.jumlahBarang} label="Jumlah Barang/Jasa" /> },
    { no: 2, jenis: 'Spesifikasi/ruang lingkup barang/jasa', isi: <Nilai value={d.spesifikasi} label="Spesifikasi" /> },
    { no: 3, jenis: 'Waktu serah terima', isi: <Nilai value={d.waktuSerah} label="Waktu serah terima" /> },
    { no: 4, jenis: 'Lokasi serah terima', isi: <Nilai value={d.namaSekolah} label="Nama sekolah" /> },
    { no: 5, jenis: 'Alokasi Anggaran', isi: <Nilai value={d.alokasiRp} label="Alokasi Anggaran" /> },
    { no: 6, jenis: 'Persyaratan Penyedia', isi: syarat },
  ]

  // Mode edit: input ringkas untuk field yang bisa diketik (pola EditableField
  // blok lain). Meta sekolah/kategori ikut tampilan (sumber Data Sekolah).
  if (edit) {
    const Input = ({ k, label, textarea, select }) => (
      <label className="block">
        <span className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">{label}</span>
        {textarea ? (
          <textarea rows={2} value={d[k] || ''} onChange={ubah(k)} className="w-full border border-slate-300 rounded px-2 py-1 text-xs outline-none" />
        ) : select ? (
          <select value={d[k] || ''} onChange={ubah(k)} className="w-full border border-slate-300 rounded px-2 py-1 text-xs outline-none">
            <option value="">Pilih…</option>
            {select.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        ) : (
          <input type="text" value={d[k] || ''} onChange={ubah(k)} className="w-full border-b border-dashed border-primary/30 outline-none px-1 bg-transparent text-xs" />
        )}
      </label>
    )
    return (
      <div className="space-y-2 mb-4">
        <div className="grid grid-cols-3 gap-2">
          <Input k="noBukti" label="No." />
          <Input k="bulanTahun" label="Bulan + Tahun" />
          <Input k="hari" label="Tanggal (hari)" />
        </div>
        <Input k="jumlahBarang" label="Jumlah Barang/Jasa" />
        <Input k="spesifikasi" label="Spesifikasi/ruang lingkup" textarea />
        <Input k="waktuSerah" label="Waktu serah terima" />
        <Input k="alokasiRp" label="Alokasi Anggaran" />
        <Input k="jenisPenyedia" label="Penyedia" select={['Perorangan', 'Badan Usaha']} />
        <Input k="direktur" label="Pemilik/Direktur" />
        <Input k="namaPenyedia" label="Nama penyedia" />
        <Input k="npwp" label="NPWP" />
        <Input k="alamat" label="Alamat penyedia" />
        <Input k="telp" label="No. Telp" />
      </div>
    )
  }

  return (
    <div className="mb-4">
      {/* ── Meta persis Workplan: No. | bulan+tahun | hari ── */}
      <div className="mb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2 min-w-0">
            <span className={`${KECIL} text-slate-700 shrink-0`}>No.</span>
            <span className={`${KECIL} text-slate-700`}>:</span>
            <span className={`${KECIL} text-slate-900 break-words`}>
              <Nilai value={d.noBukti} label="No. Bukti" />
            </span>
          </div>
          <div className="flex items-start gap-6 shrink-0">
            <span className={`${KECIL} text-slate-900`}><Nilai value={d.bulanTahun} label="Bulan" /></span>
            <span className={`${KECIL} text-slate-900`}><Nilai value={d.hari} label="Hari" /></span>
          </div>
        </div>
        <BarisMeta kiri="Nama Satuan pendidikan" nilaiKiri={d.namaSekolah} labelKiri="Nama sekolah" />
        <BarisMeta kiri="Alamat" nilaiKiri={d.alamatSekolah} labelKiri="Alamat sekolah" />
        <BarisMeta kiri="Kategori Barang/Jasa" nilaiKiri={d.kategori} labelKiri="Kategori" />
      </div>

      {/* ── Tabel 6 baris: No | Jenis | Keterangan ── */}
      <table className="w-full text-xs border-collapse border border-gray-300 table-fixed">
        <colgroup>
          <col style={{ width: '6%' }} />
          <col style={{ width: '34%' }} />
          <col style={{ width: '60%' }} />
        </colgroup>
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-2 py-1 text-center font-semibold text-[10px]">No</th>
            <th className="border border-gray-300 px-2 py-1 text-left font-semibold text-[10px]">Jenis</th>
            <th className="border border-gray-300 px-2 py-1 text-left font-semibold text-[10px]">Keterangan</th>
          </tr>
        </thead>
        <tbody>
          {baris.map((r) => (
            <tr key={r.no} className={r.no % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
              <td className="border border-gray-300 px-2 py-1.5 text-center text-[11px] align-top">{r.no}</td>
              <td className="border border-gray-300 px-2 py-1.5 text-[11px] align-top">{r.jenis}</td>
              <td className="border border-gray-300 px-2 py-1.5 text-[11px] align-top break-words whitespace-normal">{r.isi}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
