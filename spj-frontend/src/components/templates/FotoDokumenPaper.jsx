/**
 * FotoDokumenPaper — isi A4 "Dokumentasi Foto Kegiatan" (Sprint 019 revisi).
 *
 * Satu komponen, dua pemakai (aturan: variasi via prop/pembungkus, bukan salinan):
 *   1. Panel Preview Document — dibungkus `ScaledPaper` (kertas A4 + padding
 *      sudah disediakan pembungkusnya, komponen ini isi saja).
 *   2. Print twin `.sk-print-area` di `BKUSidebarDokumentasi` — dibungkus
 *      `.sk-doc-print > .print-container` supaya ikut tercetak bersama
 *      dokumen LPJ lain lewat tombol Cetak panel.
 *
 * Isi: kop surat → judul + uraian/tanggal → grid 2 kolom foto (maks 6/halaman,
 * pagination dihitung pemanggil) → tanda tangan Kepala Sekolah & Bendahara.
 */
import { getSchoolData } from '../../utils/sekolahData'

export default function FotoDokumenPaper({ data = {} }) {
  const sekolah = getSchoolData()
  const photos = data.photos || []

  return (
    <div className="flex flex-col h-full text-slate-900">
      {/* Kop surat — gaya dokumen formal (border double, hitam saat cetak) */}
      <div className="border-b-2 border-double border-slate-800 pb-2 mb-3 text-center flex-shrink-0">
        <h2 className="text-[13px] font-bold uppercase tracking-wide">{sekolah?.namaSekolah || 'SD NEGERI ...'}</h2>
        <p className="text-[9px] text-slate-700 leading-tight">{sekolah?.alamat || 'Alamat Sekolah'}</p>
        <p className="text-[9px] text-slate-700 leading-tight">
          Telp: {sekolah?.telepon || '-'} | Email: {sekolah?.email || '-'}
        </p>
      </div>

      {/* Judul + identitas kegiatan */}
      <p className="text-[11px] font-bold text-center uppercase tracking-wider mb-0.5">Dokumentasi Foto Kegiatan</p>
      <p className="text-[9px] text-slate-600 text-center mb-3">
        {data.uraian || '-'}{data.tanggalStr ? ` — ${data.tanggalStr}` : ''}
        {(data.totalHalaman || 1) > 1 ? ` (Halaman ${data.halaman || 1}/${data.totalHalaman})` : ''}
      </p>

      {/* Grid foto 2 kolom — slot kosong tetap digambar (bingkai putus-putus) */}
      <div className="grid grid-cols-2 gap-3 flex-1 content-start">
        {Array.from({ length: 6 }).map((_, i) => {
          const p = photos[i]
          if (!p) {
            return (
              <div key={`kosong-${i}`} className="border border-dashed border-slate-300 rounded-lg flex items-center justify-center" style={{ aspectRatio: '4 / 3' }}>
                <span className="text-[8px] text-slate-300 font-medium">Foto ke-{i + 1}</span>
              </div>
            )
          }
          return (
            <div key={p.id || i} className="border border-slate-300 rounded-lg p-1 flex flex-col">
              <img src={p.dataUrl} alt={p.caption || p.name || `Foto ${i + 1}`} className="w-full rounded object-cover" style={{ aspectRatio: '4 / 3' }} />
              <p className="text-[8px] text-slate-700 mt-1 px-0.5 leading-tight">{p.caption || p.name || 'Tanpa keterangan'}</p>
            </div>
          )
        })}
      </div>

      {/* Tanda tangan */}
      <div className="mt-4 flex justify-between text-[10px] font-semibold text-slate-800 flex-shrink-0">
        <div className="text-center">
          <div className="border-t border-slate-500 pt-1 w-40">Kepala Sekolah</div>
        </div>
        <div className="text-center">
          <div className="border-t border-slate-500 pt-1 w-40">Bendahara</div>
        </div>
      </div>
    </div>
  )
}
