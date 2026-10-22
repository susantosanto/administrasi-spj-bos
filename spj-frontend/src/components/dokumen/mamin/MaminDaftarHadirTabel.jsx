/**
 * MaminDaftarHadirTabel — tabel input Daftar Hadir (dipisah dari
 * `MaminSeksi2DaftarHadir` agar tiap modul ≤200 baris — gate G-5).
 *
 * Struktur kolom: **No · Nama · NIP · Jabatan** (+ kolom opsional + hapus).
 * Memakai `<table table-fixed>` + `<colgroup>` supaya kolom tidak pernah
 * bertumpuk seperti versi flex sebelumnya (revisi UI 2026-10-22).
 *
 * Komponen presentational: seluruh state dipegang `MaminSeksi2DaftarHadir`.
 */
const INPUT = 'w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] focus:ring-1 focus:ring-primary outline-none'
const TH = 'px-2 py-2 text-left font-bold'
const TOMBOL_KECIL = 'inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 text-[10px] font-semibold hover:border-primary/40 hover:text-primary transition-all'

export default function MaminDaftarHadirTabel({
  rows = [],
  kolomOpsional = [],
  onChangeRow,
  onHapusBaris,
  onTambahKolom,
  onTambahBaris,
  onUbahKolom,
  onHapusKolom,
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-3 py-2.5 bg-slate-50 border-b border-slate-200">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          Daftar hadir · {rows.length} peserta
        </p>
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={onTambahKolom} className={TOMBOL_KECIL}>
            <span className="material-symbols-outlined text-xs">add</span> Tambah Kolom
          </button>
          <button type="button" onClick={onTambahBaris} className={TOMBOL_KECIL}>
            <span className="material-symbols-outlined text-xs">add</span> Tambah Baris
          </button>
        </div>
      </div>

      {kolomOpsional.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-3 py-2 border-b border-slate-100 bg-white">
          {kolomOpsional.map((c) => (
            <span key={c.key} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[10px]">
              <input
                type="text"
                value={c.label}
                onChange={(e) => onUbahKolom(c.key, e.target.value)}
                className="w-20 px-1 py-0.5 bg-white border border-slate-200 rounded text-[10px] outline-none focus:ring-1 focus:ring-primary"
              />
              <button type="button" onClick={() => onHapusKolom(c.key)} className="text-red-500 hover:text-red-700 font-bold" title="Hapus kolom">
                &times;
              </button>
            </span>
          ))}
        </div>
      )}

      {rows.length === 0 ? (
        <p className="px-3 py-4 text-[10px] text-slate-400 italic">
          Belum ada peserta — pilih dari daftar di atas atau tambahkan baris manual.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <colgroup>
              <col style={{ width: '34px' }} />
              <col />
              <col style={{ width: '148px' }} />
              <col style={{ width: '128px' }} />
              {kolomOpsional.map((c) => (
                <col key={c.key} style={{ width: '96px' }} />
              ))}
              <col style={{ width: '34px' }} />
            </colgroup>
            <thead>
              <tr className="border-b border-slate-200 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                <th className={TH}>No</th>
                <th className={TH}>Nama</th>
                <th className={TH}>NIP</th>
                <th className={TH}>Jabatan</th>
                {kolomOpsional.map((c) => (
                  <th key={c.key} className={`${TH} truncate`}>{c.label}</th>
                ))}
                <th className="px-1 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row, i) => (
                <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-2 py-1.5 text-[10px] font-semibold text-slate-400">{i + 1}</td>
                  <td className="px-2 py-1.5">
                    <input type="text" value={row.nama || ''} onChange={(e) => onChangeRow(row.id, 'nama', e.target.value)} placeholder="Nama" className={INPUT} />
                  </td>
                  <td className="px-2 py-1.5">
                    <input type="text" value={row.nip || ''} onChange={(e) => onChangeRow(row.id, 'nip', e.target.value)} placeholder="NIP" className={`${INPUT} font-mono`} />
                  </td>
                  <td className="px-2 py-1.5">
                    <input type="text" value={row.jabatan || ''} onChange={(e) => onChangeRow(row.id, 'jabatan', e.target.value)} placeholder="Jabatan" className={INPUT} />
                  </td>
                  {kolomOpsional.map((c) => (
                    <td key={c.key} className="px-2 py-1.5">
                      <input type="text" value={row[c.key] || ''} onChange={(e) => onChangeRow(row.id, c.key, e.target.value)} placeholder={c.label} className={INPUT} />
                    </td>
                  ))}
                  <td className="px-1 py-1.5 text-center">
                    <button type="button" onClick={() => onHapusBaris(row.id)} className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Hapus baris">
                      <span className="material-symbols-outlined text-xs">delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
