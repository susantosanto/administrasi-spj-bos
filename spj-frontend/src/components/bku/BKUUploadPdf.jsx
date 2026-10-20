/**
 * BKUUploadPdf.jsx — Sprint 016: import BKU dari PDF hasil scan, SEMUA bulan.
 *
 * Alur: pilih file PDF → proses (OCR, progres per halaman) → tabel preview
 * SEMUA bulan → koreksi inline / kecualikan baris → simpan (SATU tulis atomik,
 * ganti SELURUH spj_bku_data, tanpa dialog konfirmasi).
 *
 * Aturan penting:
 *  - Jalur Excel di BKUPage TIDAK disentuh; ini pintu masuk kedua.
 *  - Tulis storage = SATU storageHelper.set (atomik). Objek diganti SELURUHNYA
 *    (tidak ada spread data lama) — keputusan Idea Brief 2026-10-20 #4/#5.
 *  - Baris tersimpan = 17 field identik jalur Excel. Field sementara
 *    (page/problems/excluded/duplikat/urutanDuplikat) DIBUANG sebelum simpan.
 *  - Tipe/kategori dihitung ulang lewat redetectTypes() — bukan disalin.
 *  - header hanya field yang benar-benar terbaca dari kop PDF; footer kosong
 *    (ADR §S2/S3). summary dihitung recalcSummary milik parent — satu definisi.
 *  - Semua komponen ini print:hidden; tidak pernah ikut cetak.
 *  - Warna: BLUE-ONLY + slate.
 */
import { useMemo, useRef, useState } from 'react'
import { useToast } from '../ui/Toast'
import storageHelper from '../../utils/storageHelper'
import { redetectTypes } from '../../utils/bkuParser'
import { bukaPdf, renderHalaman, periksaFilePdf, headerPdfValid, pesanGagalPdf } from '../../utils/bkuPdfPages'
import { ocrPage, lepasWorker, deteksiOrientasiHalaman } from '../../utils/bkuPdfOcr'
import { parseBkuFixture } from '../../utils/bkuPdfParser'
import { tandaiDuplikat, ringkasPerBulan } from '../../utils/bkuPdfDuplikat'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

const TAHUN_AWAL = 2026 // hanya fallback bila tahun tidak terbaca dari kop PDF
const INI = 'border border-slate-200 rounded-lg px-2 py-1 text-sm w-full focus:outline-none focus:border-primary'
const rp = (n) => 'Rp ' + Math.round(n || 0).toLocaleString('id-ID')
// Kunci penanda presisi: tanggal + nomor baris parser. Dua baris di tanggal sama
// tidak ikut ter-tandai semua (bug tampilan Sprint 015).
const kunciTanda = (r) => `${r.tanggalStr}|${r.page ?? r.row ?? ''}`

export default function BKUUploadPdf({ recalcSummary, onSelesai }) {
  const toast = useToast()
  const fileRef = useRef(null)
  const abortRef = useRef(null)
  const [tahap, setTahap] = useState('pilih') // pilih | proses | preview
  const [fileName, setFileName] = useState('')
  const [tahunDok, setTahunDok] = useState(TAHUN_AWAL)
  const [progres, setProgres] = useState({ hal: 0, total: 0 })
  const [baris, setBaris] = useState([])
  const [ringkas, setRingkas] = useState(null)
  const [masalah, setMasalah] = useState([])
  const [saldoTakRuntun, setSaldoTakRuntun] = useState(0)
  const [perluKoreksi, setPerluKoreksi] = useState(new Set())
  const [saring, setSaring] = useState('Semua') // penyaring TAMPILAN saja
  const [hanyaBertanda, setHanyaBertanda] = useState(false)

  const reset = () => {
    setTahap('pilih'); setBaris([]); setRingkas(null); setMasalah([])
    setSaldoTakRuntun(0); setPerluKoreksi(new Set()); setSaring('Semua')
    setHanyaBertanda(false); setProgres({ hal: 0, total: 0 })
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
      // lain / tahun lain ikut terbaca. Fallback ke tahun terbanyak baris.
      const tahunPdf = Number(hasil.kop.tahun) || hasil.meta?.tahunDokumen || TAHUN_AWAL

      if (!hasil.transactions.length) {
        setTahap('pilih')
        toast.error('Tidak ada transaksi yang terbaca dari PDF ini. Data tidak diubah.')
        return
      }

      // SEMUA bulan masuk preview — tidak ada gating bulan (Sprint 016).
      setBaris(tandaiDuplikat(hasil.transactions.map((t) => ({
        ...t, page: t.row, problems: [], excluded: false,
      }))))
      setMasalah(hasil.problems || [])
      setSaldoTakRuntun(hasil.reconcile?.mismatches?.length || 0)
      // Tanggal hasil tebakan OCR dan nominal hasil koreksi rantai saldo
      // ditandai supaya user memeriksanya — perbaikan otomatis tidak pernah
      // diam-diam dianggap benar.
      setPerluKoreksi(new Set((hasil.problems || [])
        .filter((p) => p.jenis === 'tanggal_perlu_dikoreksi' || p.jenis === 'nominal_diperbaiki')
        .map((p) => `${p.tanggal}|${p.halaman ?? ''}`)))
      setRingkas(hasil.kop)
      setTahunDok(tahunPdf)
      setSaring('Semua')
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

  // ── 2. koreksi inline / kecualikan baris ──
  const ubah = (i, kolom, nilai) => {
    setBaris((s) => s.map((r, k) => (k === i ? { ...r, [kolom]: nilai } : r)))
  }
  const buang = (i) => setBaris((s) => s.map((r, k) => (k === i ? { ...r, excluded: true } : r)))
  const pulihkan = (i) => setBaris((s) => s.map((r, k) => (k === i ? { ...r, excluded: false } : r)))

  // ── 3. turunan: yang DISIMPAN vs yang DITAMPILKAN ──
  const aktif = baris.filter((r) => !r.excluded)
  const bertanda = (r) => perluKoreksi.has(kunciTanda(r)) || r.duplikat
  const ringkasBulan = useMemo(
    () => ringkasPerBulan(baris.filter((r) => !r.excluded)),
    [baris],
  )
  const tampilSaring = (r) => (!hanyaBertanda || bertanda(r))
    && (saring === 'Semua' || `${r.bulan}-${r.tahun}` === saring)
  const jumlahTampil = baris.filter(tampilSaring).length

  const totalMasuk = ringkasBulan.reduce((s, g) => s + g.masuk, 0)
  const totalKeluar = ringkasBulan.reduce((s, g) => s + g.keluar, 0)
  const saldoAkhir = ringkasBulan.length ? ringkasBulan[ringkasBulan.length - 1].saldoAkhir : 0
  const daftarBulan = ringkasBulan.map((g) => `${g.namaBulan} ${g.tahun}`).join(', ')

  // Pesan sukses — pola sama dengan toast jalur Excel (bulan, masuk, keluar, saldo, balance).
  const toastSukses = (summary, jumlah) => {
    const bulanTeks = ringkasBulan.length <= 6 ? daftarBulan
      : `${ringkasBulan.slice(0, 6).map((g) => `${g.namaBulan} ${g.tahun}`).join(', ')} +${ringkasBulan.length - 6} bulan`
    toast.success(
      `${jumlah} baris dari ${ringkasBulan.length} bulan disimpan (${bulanTeks}).\n` +
      `Penerimaan: ${rp(summary.totalPenerimaan)}\n` +
      `Pengeluaran: ${rp(summary.totalPengeluaran)}\n` +
      `Saldo Akhir: ${rp(summary.saldoAkhir)}` +
      (summary.isBalanced ? '\nBalance' : '\nTidak Balance') +
      (masalah.length ? `\n${masalah.length} catatan OCR` : ''),
    )
  }

  // ── 4. tulis ATOMIK: ganti SELURUH spj_bku_data ──
  const simpan = () => {
    try {
      // Buang field sementara — baris tersimpan wajib 17 field seperti jalur Excel.
      const transaksi = redetectTypes(aktif.map(({ page, problems, excluded,
        duplikat, urutanDuplikat, ...r }) => r))

      // header: HANYA yang benar-benar terbaca dari kop (ADR §S3).
      const header = {
        tahunAnggaran: String(ringkas?.tahun || tahunDok || ''),
        npsn: ringkas?.npsn || '',
        nama_sekolah: ringkas?.namaSekolah || '',
        alamat: '', kabupaten: '', provinsi: '',
      }
      // footer: TIDAK dipertahankan (ADR §S2) — bentuk sama, isi kosong.
      const footer = {
        kepalaSekolah: { nama: '', nip: '' },
        bendahara: { nama: '', nip: '' },
        tanggalPenutupan: '', tempat: '',
      }
      const summary = recalcSummary(transaksi)

      // SATU tulis, objek diganti seluruhnya (tanpa spread data lama).
      storageHelper.set('bku_data', {
        transactions: transaksi,
        header,
        footer,
        summary,
        uploadedAt: new Date().toISOString(),
        sumberImpor: { jenis: 'pdf', namaFile: fileName, halaman: progres.total },
      })

      toastSukses(summary, transaksi.length)
      reset()
      onSelesai?.()
    } catch (err) {
      toast.error('Gagal menyimpan: ' + err.message)
    }
  }

  const btn = 'flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all'
  const thn = 'text-left font-semibold px-3 py-2 whitespace-nowrap'
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
            PDF hasil scan — semua bulan dibaca sekaligus, dapat dikoreksi dulu sebelum disimpan
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
            <span className="text-slate-700">{baris.length} baris · {ringkasBulan.length} bulan</span>
            {masalah.length > 0 && <span className="text-primary font-medium">{masalah.length} catatan OCR</span>}
            {saldoTakRuntun > 0 && (
              <span className="text-primary font-medium">
                {saldoTakRuntun} titik saldo tidak runtun — periksa baris di sekitarnya
              </span>
            )}
          </div>

          {/* Ringkasan per bulan — pengganti dropdown pemilih bulan Sprint 015. */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl mb-4">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="bg-slate-50 text-slate-600">
                <tr>{['Bulan', 'Baris', 'Masuk', 'Keluar', 'Saldo Akhir'].map((h) => (
                  <th key={h} className={thn}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {ringkasBulan.map((g) => (
                  <tr key={g.kunci} className="border-t border-slate-100">
                    <td className="px-3 py-1.5 text-slate-700">{g.namaBulan} {g.tahun}</td>
                    <td className="px-3 py-1.5 text-slate-700">{g.jumlah}</td>
                    <td className="px-3 py-1.5 text-slate-700">{rp(g.masuk)}</td>
                    <td className="px-3 py-1.5 text-slate-700">{rp(g.keluar)}</td>
                    <td className="px-3 py-1.5 text-slate-700 font-semibold">{rp(g.saldoAkhir)}</td>
                  </tr>
                ))}
                <tr className="border-t border-slate-200 bg-slate-50/60">
                  <td className="px-3 py-1.5 font-semibold text-slate-900">Total</td>
                  <td className="px-3 py-1.5 font-semibold text-slate-900">{aktif.length}</td>
                  <td className="px-3 py-1.5 font-semibold text-slate-900">{rp(totalMasuk)}</td>
                  <td className="px-3 py-1.5 font-semibold text-slate-900">{rp(totalKeluar)}</td>
                  <td className="px-3 py-1.5 font-semibold text-slate-900">{rp(saldoAkhir)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center gap-4 mb-3">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              Tampilkan
              <select value={saring} onChange={(e) => setSaring(e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm">
                <option value="Semua">Semua bulan</option>
                {ringkasBulan.map((g) => (
                  <option key={g.kunci} value={g.kunci}>{g.namaBulan} {g.tahun}</option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={hanyaBertanda}
                onChange={(e) => setHanyaBertanda(e.target.checked)} />
              Hanya baris perlu diperiksa
            </label>
            <span className="text-xs text-slate-400">
              Penyaring hanya mengubah tampilan — semua baris di bawah tetap disimpan
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-sm min-w-[880px]">
              <thead className="bg-slate-50 text-slate-600">
                <tr>{['Tanggal', 'No. Bukti', 'Uraian', 'Masuk', 'Keluar', 'Saldo', 'Hal.', ''].map((h) => (
                  <th key={h} className={thn}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {jumlahTampil === 0 && (
                  <tr><td colSpan={8} className="px-3 py-6 text-center text-slate-500">
                    {hanyaBertanda
                      ? 'Tidak ada baris yang perlu diperiksa.'
                      : 'Tidak ada baris pada bulan ini.'}
                  </td></tr>
                )}
                {baris.map((r, i) => {
                  if (!tampilSaring(r)) return null
                  const tanda = perluKoreksi.has(kunciTanda(r))
                  return (
                    <tr key={i} className={`border-t border-slate-100 ${r.excluded ? 'opacity-40 line-through' : ''}`}>
                      <td className="px-3 py-2"><input className={`${INI} ${tanda ? 'ring-1 ring-primary/50' : ''}`} value={r.tanggalStr}
                        onChange={(e) => ubah(i, 'tanggalStr', e.target.value)} title={tanda ? 'Baris hasil perbaikan OCR (tanggal/nominal) — mohon periksa' : ''} /></td>
                      <td className="px-3 py-2"><input className={INI} value={r.noBukti}
                        onChange={(e) => ubah(i, 'noBukti', e.target.value)} /></td>
                      <td className="px-3 py-2">
                        <input className={INI} value={r.uraian}
                          onChange={(e) => ubah(i, 'uraian', e.target.value)} />
                        {r.duplikat && (
                          <span className="text-xs text-primary"
                            title="Baris ini identik dengan baris lain — periksa apakah memang transaksi terpisah">
                            duplikat ke-{r.urutanDuplikat}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 w-32"><input className={INI} value={r.penerimaan}
                        onChange={(e) => ubah(i, 'penerimaan', Number(e.target.value) || 0)} /></td>
                      <td className="px-3 py-2 w-32"><input className={INI} value={r.pengeluaran}
                        onChange={(e) => ubah(i, 'pengeluaran', Number(e.target.value) || 0)} /></td>
                      <td className="px-3 py-2 w-32"><input className={INI} value={r.saldo}
                        onChange={(e) => ubah(i, 'saldo', Number(e.target.value) || 0)} /></td>
                      <td className="px-3 py-2 text-xs text-slate-400">{r.page ?? r.row ?? ''}</td>
                      <td className="px-3 py-2">
                        <button onClick={() => (r.excluded ? pulihkan(i) : buang(i))}
                          title={r.excluded ? 'Kembalikan baris ini ke simpanan' : 'Kecualikan baris ini dari simpanan'}
                          className="text-primary hover:text-primary/70">
                          <span className="material-symbols-outlined text-lg">
                            {r.excluded ? 'undo' : 'delete'}
                          </span>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
            <div className="text-sm text-slate-600">
              <b>{aktif.length}</b> baris akan disimpan
              {baris.length - aktif.length > 0 && ` (${baris.length - aktif.length} dikecualikan)`}
              {' · '}Masuk <b>{rp(totalMasuk)}</b> · Keluar <b>{rp(totalKeluar)}</b> · Saldo <b>{rp(saldoAkhir)}</b>
            </div>
            <button onClick={simpan}
              className={`${btn} bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20`}>
              <span className="material-symbols-outlined text-lg">save</span>Simpan ke Data BKU
            </button>
          </div>
        </>
      )}
    </div>
  )
}
