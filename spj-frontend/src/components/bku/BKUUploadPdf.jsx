/**
 * BKUUploadPdf.jsx — Sprint 015 · M4: import BKU dari PDF hasil scan.
 *
 * Alur: pilih file PDF → proses (OCR, progres per halaman) → tabel preview
 * → koreksi inline / hapus baris → dialog konfirmasi → tulis ATOMIK ke
 * spj_bku_data (replace-by-month).
 *
 * Aturan penting:
 *  - Jalur Excel di BKUPage TIDAK disentuh; ini pintu masuk kedua.
 *  - Tulis storage = SATU storageHelper.set (atomik). N set per-baris
 *    berisiko partial write yang menyisakan data lama tak konsisten.
 *  - Bentuk baris = 17 field identik jalur Excel. Tipe/kategori dihitung
 *    ulang setelah koreksi user lewat redetectTypes() — bukan disalin.
 *  - Semua komponen ini print:hidden; tidak pernah ikut cetak.
 *  - Warna: BLUE-ONLY + slate.
 */
import { useRef, useState } from 'react'
import { useToast } from '../ui/Toast'
import storageHelper from '../../utils/storageHelper'
import { redetectTypes } from '../../utils/bkuParser'
import { bukaPdf, renderHalaman, periksaFilePdf, headerPdfValid, pesanGagalPdf } from '../../utils/bkuPdfPages'
import { ocrPage, lepasWorker, deteksiOrientasiHalaman } from '../../utils/bkuPdfOcr'
import { parseBkuFixture } from '../../utils/bkuPdfParser'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
const TAHUN_AWAL = 2026 // hanya fallback bila tahun tidak terbaca dari kop PDF
const INI = 'border border-slate-200 rounded-lg px-2 py-1 text-sm w-full focus:outline-none focus:border-primary'
const rp = (n) => 'Rp ' + Math.round(n || 0).toLocaleString('id-ID')

export default function BKUUploadPdf({ recalcSummary, onSelesai, bulanAwal }) {
  const toast = useToast()
  const fileRef = useRef(null)
  const abortRef = useRef(null)
  const [tahap, setTahap] = useState('pilih') // pilih | proses | preview
  const [fileName, setFileName] = useState('')
  const [bulan, setBulan] = useState(bulanAwal || 1)
  const [tahun, setTahun] = useState(TAHUN_AWAL)
  const [progres, setProgres] = useState({ hal: 0, total: 0 })
  const [baris, setBaris] = useState([])
  const [ringkas, setRingkas] = useState(null)
  const [masalah, setMasalah] = useState([])
  const [perluKoreksi, setPerluKoreksi] = useState(new Set())
  const [konfirmasi, setKonfirmasi] = useState(false)

  const reset = () => {
    setTahap('pilih'); setBaris([]); setRingkas(null); setMasalah([]); setPerluKoreksi(new Set())
    setKonfirmasi(false); setProgres({ hal: 0, total: 0 })
  }

  // ── 1. pilih file (E-1: bukan PDF ditolak dengan pesan jujur) ──
  const pilihFile = async (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (!/\.pdf$/i.test(f.name) && f.type !== 'application/pdf') {
      toast.error('Format file harus PDF. Untuk file Excel, pakai tombol "Upload BKU" di atas.')
      e.target.value = ''
      return
    }
    // Gagal cepat untuk file rusak/0 byte — sebelum pdf.js & OCR kerja.
    const rusak = periksaFilePdf(f)
    if (rusak) { toast.error(rusak); e.target.value = ''; return }
    setFileName(f.name)
    setTahap('proses')
    const ctrl = new AbortController()
    abortRef.current = ctrl
    try {
      const buf = await f.arrayBuffer()
      if (!headerPdfValid(new Uint8Array(buf))) {
        toast.error('Berkas ini bukan PDF yang utuh (header "%PDF-" tidak terbaca). ' +
          'Unduh ulang dari sumber, lalu unggah lagi. Data tidak diubah.')
        setTahap('pilih')
        return
      }
      const { pdf, total } = await bukaPdf(buf, { workerUrl: pdfWorkerUrl })
      // Orientasi isi halaman dideteksi dulu (bisa tegak atau menyamping) —
      // rotasi hardcode bikin seluruh teks terbaca miring.
      const orient = await deteksiOrientasiHalaman(pdf, { dpi: 200, sinyal: ctrl.signal })
      const semua = [...orient.items]
      setProgres({ hal: 1, total })
      for (let n = 2; n <= total; n++) {
        if (ctrl.signal.aborted) throw new Error('dibatalkan')
        const { canvas } = await renderHalaman(pdf, n, { dpi: 200, rotasi: orient.rotasi, sinyal: ctrl.signal })
        semua.push(...(await ocrPage(canvas, { page: n })))
        setProgres({ hal: n, total })
      }
      await lepasWorker()
      const hasil = parseBkuFixture({ items: semua, meta: { total_pages: total } })
      // tahun diambil dari kop PDF — BUKAN angka tetap, supaya file sekolah
      // lain / tahun lain ikut terbaca. Fallback ke tahun baris pertama.
      const tahunPdf = Number(hasil.kop.tahun) || hasil.transactions.find((t) => t.tahun)?.tahun || TAHUN_AWAL
      setTahun(tahunPdf)
      const pil = hasil.transactions
        .filter((t) => t.bulan === bulan && t.tahun === tahunPdf)
        .map((t) => ({ ...t, page: t.row, problems: [], excluded: false }))
      if (!pil.length) {
        // Bulan 0 = tanggal tak terbaca; jangan masuk daftar bulan (BULAN[-1]).
        const adaBulan = [...new Set(hasil.transactions.map((t) => t.bulan))]
          .filter((m) => m >= 1 && m <= 12).sort((a, b) => a - b)
        setTahap('pilih')
        toast.error(
          adaBulan.length
            ? `Bulan ${BULAN[bulan - 1]} ${tahunPdf} tidak ada di PDF ini. ` +
              `Bulan yang terbaca: ${adaBulan.map((m) => BULAN[m - 1]).join(', ')}. Data tidak diubah.`
            : `Tidak ada transaksi yang terbaca dari PDF ini. Data tidak diubah.`
        )
        return
      }
      setBaris(pil)
      setMasalah(hasil.problems)
      // Tanggal hasil tebakan OCR ditandai supaya user memeriksanya di preview.
      setPerluKoreksi(new Set((hasil.problems || [])
        .filter((p) => p.jenis === 'tanggal_perlu_dikoreksi').map((p) => p.tanggal)))
      setRingkas(hasil.kop)
      setTahap('preview')
    } catch (err) {
      await lepasWorker()
      setTahap('pilih')
      if (err.message !== 'dibatalkan') toast.error(pesanGagalPdf(err.message))
      else toast.info('Proses dibatalkan. Data tidak diubah.')
    } finally {
      abortRef.current = null
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  // ── 2. koreksi inline / hapus baris ──
  const ubah = (i, kolom, nilai) => {
    setBaris((s) => s.map((r, k) => (k === i ? { ...r, [kolom]: nilai } : r)))
  }
  const buang = (i) => setBaris((s) => s.map((r, k) => (k === i ? { ...r, excluded: true } : r)))

  const aktif = baris.filter((r) => !r.excluded)
  const totalMasuk = aktif.reduce((a, r) => a + (Number(r.penerimaan) || 0), 0)
  const totalKeluar = aktif.reduce((a, r) => a + (Number(r.pengeluaran) || 0), 0)
  const saldoAkhir = aktif.length ? aktif[aktif.length - 1].saldo : 0

  // ── 3. tulis ATOMIK (Q4 DATA-MODEL) ──
  const simpan = () => {
    try {
      const tersimpan = storageHelper.get('bku_data', null) || {}
      const lama = Array.isArray(tersimpan.transactions) ? tersimpan.transactions : []
      // Ganti hanya baris bulan terpilih; sisa data & meta lain tidak tersentuh.
      const sisa = lama.filter((t) => !(t.bulan === bulan && t.tahun === tahun))
      const gabung = redetectTypes([...sisa, ...aktif])
      storageHelper.set('bku_data', {
        ...tersimpan, transactions: gabung,
        summary: recalcSummary(gabung), uploadedAt: new Date().toISOString(),
      })
      setKonfirmasi(false)
      toast.success(`${aktif.length} baris ${BULAN[bulan - 1]} ${tahun} disimpan.`)
      reset()
      onSelesai?.()
    } catch (e) {
      toast.error('Gagal menyimpan: ' + e.message)
    }
  }

  const kartu = 'bg-white rounded-2xl border border-slate-200 shadow-sm'
  const btn = 'flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all'
  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm print:hidden">
      {tahap !== 'pilih' && (
        <div className="flex items-center justify-end mb-4">
          <button onClick={reset} className={`${btn} bg-white text-slate-700 border border-slate-200 hover:bg-slate-50`}>
            <span className="material-symbols-outlined text-lg">close</span>Batal
          </button>
        </div>
      )}
      {/* Hero upload — kanon premium yang sama dengan DataSekolahPage. */}
      {tahap === 'pilih' && (
        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center
                        hover:border-primary/40 transition-all duration-300
                        bg-gradient-to-b from-slate-50/50 to-transparent">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5
                          flex items-center justify-center mx-auto mb-5 shadow-inner">
            <span className="material-symbols-outlined text-4xl text-primary">picture_as_pdf</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Upload File BKU PDF</h3>
          <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
            PDF hasil scan — dibaca otomatis di perangkat ini, dapat dikoreksi dulu sebelum disimpan
          </p>
          <input ref={fileRef} type="file" accept="application/pdf,.pdf"
            onChange={pilihFile} className="hidden" id="bku-pdf-input" />
          <label htmlFor="bku-pdf-input"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl text-sm font-semibold
                       transition-all duration-300 cursor-pointer
                       bg-gradient-to-r from-primary to-blue-600 text-white
                       hover:shadow-xl hover:shadow-primary/25 hover:scale-[1.02] active:scale-[0.98]">
            <span className="material-symbols-outlined text-lg">upload</span> Pilih File PDF BKU
          </label>
          <p className="text-xs text-slate-400 mt-4">Format: .pdf &nbsp;•&nbsp; diproses sepenuhnya di perangkat ini</p>
        </div>
      )}

      {tahap === 'proses' && (
        <div className="py-10 text-center">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin block mx-auto mb-4">sync</span>
          <p className="text-sm font-semibold text-slate-900">Membaca halaman {progres.hal} dari {progres.total}…</p>
          <p className="text-xs text-slate-500 mt-1">{fileName} — proses berjalan di perangkat ini.</p>
          <div className="w-full max-w-sm mx-auto mt-4 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all"
              style={{ width: progres.total ? (progres.hal / progres.total) * 100 + '%' : '5%' }} />
          </div>
          <button onClick={() => abortRef.current?.abort()}
            className={`${btn} mt-5 mx-auto bg-white text-slate-700 border border-slate-200 hover:bg-slate-50`}>
            <span className="material-symbols-outlined text-lg">stop_circle</span>Batalkan proses
          </button>
        </div>
      )}

      {tahap === 'preview' && ringkas && (
        <>
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 mb-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            <span className="font-semibold text-primary">{fileName}</span>
            {ringkas.namaSekolah && <span className="text-slate-700">Sekolah: <b>{ringkas.namaSekolah}</b></span>}
            {ringkas.npsn && <span className="text-slate-700">NPSN: {ringkas.npsn}</span>}
            {ringkas.tahun && <span className="text-slate-700">tahun: {ringkas.tahun}</span>}
            {masalah.length > 0 && <span className="text-primary font-medium">{masalah.length} catatan OCR</span>}
          </div>

          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-3">
            Bulan data
            <select value={bulan} onChange={(e) => setBulan(Number(e.target.value))}
              className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm">
              {BULAN.map((b, i) => <option key={b} value={i + 1}>{b} {tahun}</option>)}
            </select>
          </label>
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-sm min-w-[820px]">
              <thead className="bg-slate-50 text-slate-600">
                <tr>{['Tanggal', 'No. Bukti', 'Uraian', 'Masuk', 'Keluar', 'Saldo', ''].map((h) => (
                  <th key={h} className="text-left font-semibold px-3 py-2 whitespace-nowrap">{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {baris.map((r, i) => (
                  <tr key={i} className={`border-t border-slate-100 ${r.excluded ? 'opacity-40 line-through' : ''}`}>
                    <td className="px-3 py-2"><input className={`${INI} ${perluKoreksi.has(r.tanggalStr) ? 'ring-1 ring-primary/50' : ''}`} value={r.tanggalStr}
                      onChange={(e) => ubah(i, 'tanggalStr', e.target.value)} title={perluKoreksi.has(r.tanggalStr) ? 'Tanggal hasil tebakan OCR — mohon periksa' : ''} /></td>
                    <td className="px-3 py-2"><input className={INI} value={r.noBukti}
                      onChange={(e) => ubah(i, 'noBukti', e.target.value)} /></td>
                    <td className="px-3 py-2"><input className={INI} value={r.uraian}
                      onChange={(e) => ubah(i, 'uraian', e.target.value)} /></td>
                    <td className="px-3 py-2 w-32"><input className={INI} value={r.penerimaan}
                      onChange={(e) => ubah(i, 'penerimaan', Number(e.target.value) || 0)} /></td>
                    <td className="px-3 py-2 w-32"><input className={INI} value={r.pengeluaran}
                      onChange={(e) => ubah(i, 'pengeluaran', Number(e.target.value) || 0)} /></td>
                    <td className="px-3 py-2 w-32"><input className={INI} value={r.saldo}
                      onChange={(e) => ubah(i, 'saldo', Number(e.target.value) || 0)} /></td>
                    <td className="px-3 py-2">
                      <button onClick={() => buang(i)} title="Kecualikan baris ini dari simpanan"
                        className="text-primary hover:text-primary/70">
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
            <div className="text-sm text-slate-600">
              <b>{aktif.length}</b> baris akan disimpan
              {baris.length - aktif.length > 0 && ` (${baris.length - aktif.length} dikecualikan)`}
              {' · '}Masuk <b>{rp(totalMasuk)}</b> · Keluar <b>{rp(totalKeluar)}</b> · Saldo <b>{rp(saldoAkhir)}</b>
            </div>
            <button onClick={() => setKonfirmasi(true)}
              className={`${btn} bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20`}>
              <span className="material-symbols-outlined text-lg">save</span>Simpan ke Data BKU
            </button>
          </div>
        </>
      )}

      {konfirmasi && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 print:hidden">
          <div className={`${kartu} p-6 max-w-md w-full`}>
            <h4 className="text-base font-bold text-slate-900 mb-2">Konfirmasi simpan</h4>
            <p className="text-sm text-slate-600">
              <b>{aktif.length} baris</b> bulan <b>{BULAN[bulan - 1]} {tahun}</b> akan ditulis ke Data BKU.
              Baris bulan ini yang sudah ada (hasil Excel) akan <b> digantikan </b>.
              Bulan lain dan data lain tidak berubah.
            </p>
            <p className="text-sm text-slate-600 mt-2">Teks: masuk {rp(totalMasuk)}, keluar {rp(totalKeluar)}.</p>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setKonfirmasi(false)}
                className={`${btn} bg-white text-slate-700 border border-slate-200 hover:bg-slate-50`}>Batal</button>
              <button onClick={simpan} className={`${btn} bg-primary text-white hover:bg-primary/90`}>
                <span className="material-symbols-outlined text-lg">check</span>Ya, simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
