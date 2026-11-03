/**
 * BKUUploadPdf.jsx — Sprint 025: import BKU PDF 3 mode (Bulanan / Semester / Tahunan).
 *
 * Alur: pilih mode (dropdown) → pilih periode → pilih file PDF → proses
 * (native/OCR, progres per halaman) → ringkasan BACA-SAJA → simpan.
 *
 * Aturan penting (Sprint 025, keputusan user 2026-11-02):
 *  - TIDAK ADA form koreksi manual: tanpa koreksi inline, tanpa kecualikan
 *    baris. Parse → ringkasan → simpan langsung.
 *  - Bulanan/Semester = AKUMULATIF per periode (upload ulang = ganti periode
 *    itu saja, periode lain utuh). Tahunan = GANTI SELURUH dataset
 *    (dengan dialog konfirmasi karena destruktif).
 *  - Tulis storage = SATU storageHelper.set atomik per aksi.
 *  - Baris tersimpan membawa { periodeMode, periode } (lihat bkuPeriode.js).
 *  - Semester ikut Tahap BOS: S1 = Jan-Jun, S2 = Jul-Des (Q-1 opsi B).
 *  - Jalur Excel di BKUPage TIDAK disentuh; ini pintu masuk kedua.
 *  - Semua komponen ini print:hidden; tidak pernah ikut cetak.
 *  - Warna: BLUE-ONLY + slate.
 */
import { useMemo, useRef, useState } from 'react'
import { useToast } from '../ui/Toast'
import storageHelper from '../../utils/storageHelper'
import { redetectTypes } from '../../utils/bkuParser'
import { bukaPdf, renderHalaman, periksaFilePdf, headerPdfValid, pesanGagalPdf, ukurTextLayer, bacaTeksNative } from '../../utils/bkuPdfPages'
import { ocrPage, lepasWorker, deteksiOrientasiHalaman } from '../../utils/bkuPdfOcr'
import { parseBkuFixture } from '../../utils/bkuPdfParser'
import { ringkasPerBulan } from '../../utils/bkuPdfDuplikat'
import {
  kunciPeriode, labelPeriode, mergePeriode, hashBytes, modusBulan,
  namaBulan, deteksiPeriodeDariPdf,
} from '../../utils/bkuPeriode'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

const TAHUN_AWAL = new Date().getFullYear()
const rp = (n) => 'Rp ' + Math.round(n || 0).toLocaleString('id-ID')

const MODE_LABEL = { bulanan: 'BKU Per Bulan', semester: 'BKU Per Semester', tahunan: 'BKU Tahunan' }

export default function BKUUploadPdf({ recalcSummary, onSelesai }) {
  const toast = useToast()
  const fileRef = useRef(null)
  const abortRef = useRef(null)
  const [mode, setMode] = useState('bulanan')
  const [menuMode, setMenuMode] = useState(false)
  const [tahap, setTahap] = useState('pilih') // pilih | proses | ringkas
  const [fileName, setFileName] = useState('')
  const [progres, setProgres] = useState({ hal: 0, total: 0 })
  const [hasil, setHasil] = useState(null) // { baris, kop, masalah, saldoTakRuntun, tahunPdf, kunci, label, peringatanKop }
  const [konfirmTahunan, setKonfirmTahunan] = useState(false)

  const reset = () => {
    setTahap('pilih'); setHasil(null); setKonfirmTahunan(false)
    setProgres({ hal: 0, total: 0 }); setMenuMode(false)
  }

  // Rev3: TANPA pemilih periode — periode murni dari PDF (deteksiPeriodeDariPdf).

  // ── 1. pilih file ──
  const pilihFile = async (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (!/\.pdf$/i.test(f.name) && f.type !== 'application/pdf') {
      toast.error('Format file harus PDF. Untuk file Excel, pakai tombol "Upload BKU" di atas.')
      e.target.value = ''
      return
    }
    const rusak = periksaFilePdf(f)
    if (rusak) { toast.error(rusak); e.target.value = ''; return }
    const buf = await f.arrayBuffer()
    const u8 = new Uint8Array(buf)
    if (!headerPdfValid(u8)) {
      toast.error('Berkas ini bukan PDF yang utuh (header "%PDF-" tidak terbaca). ' +
        'Unduh ulang dari sumber, lalu unggah lagi. Data tidak diubah.')
      e.target.value = ''
      return
    }
    // Hash dihitung di sini; gate duplikat dicek SETELAH periode terdeteksi.
    const hash = hashBytes(u8)
    setFileName(f.name)
    setTahap('proses')
    const ctrl = new AbortController()
    abortRef.current = ctrl
    try {
      const { pdf, total } = await bukaPdf(buf, { workerUrl: pdfWorkerUrl })
      const halaman1 = await pdf.getPage(1)
      const teksHalaman1 = await ukurTextLayer(halaman1)
      let semua
      if (teksHalaman1.hasText) {
        semua = await bacaTeksNative(pdf, {
          dpi: 200, sinyal: ctrl.signal,
          onProgress: (hal) => setProgres({ hal, total }),
        })
      } else {
        const orient = await deteksiOrientasiHalaman(pdf, { dpi: 200, sinyal: ctrl.signal })
        semua = [...orient.items]
        setProgres({ hal: 1, total })
        for (let n = 2; n <= total; n++) {
          if (ctrl.signal.aborted) throw new Error('dibatalkan')
          const { canvas } = await renderHalaman(pdf, n, { dpi: 200, rotasi: orient.rotasi, sinyal: ctrl.signal })
          semua.push(...(await ocrPage(canvas, { page: n })))
          setProgres({ hal: n, total })
        }
        await lepasWorker()
      }
      const parsed = parseBkuFixture({ items: semua, meta: { total_pages: total } })
      const tahunPdf = Number(parsed.kop.tahun) || parsed.meta?.tahunDokumen || TAHUN_AWAL
      if (!parsed.transactions.length) {
        setTahap('pilih')
        toast.error('Tidak ada transaksi yang terbaca dari PDF ini. Data tidak diubah.')
        return
      }
      const baris = redetectTypes(parsed.transactions.map(({ page, problems, excluded,
        duplikat, urutanDuplikat, ...r }) => r))
      // Rev3: periode dari PDF — kop dulu, fallback bulan mayoritas baris.
      const deteksi = deteksiPeriodeDariPdf(baris, parsed.kop)
      if (!deteksi) {
        setTahap('pilih')
        toast.error('Periode tidak terbaca dari PDF ini (kop bulan/tahun kosong dan tidak ada tanggal baris). Data tidak diubah.')
        return
      }
      const kunciDeteksi = kunciPeriode(mode, deteksi)
      const labelDeteksi = labelPeriode(mode, deteksi)
      // File identik untuk periode yang sama → lewati (AC-7).
      try {
        const lamaCek = storageHelper.get('bku_data', null)
        const riw = lamaCek?.riwayatImporPdf || []
        if (riw.some((r) => r.hash === hash && r.kunci === kunciDeteksi)) {
          setTahap('pilih')
          toast.info(`File ini sudah pernah diupload untuk ${labelDeteksi} — dilewati, tidak ada duplikat.`)
          return
        }
      } catch { /* riwayat rusak = abaikan, lanjut */ }
      // Info bila kop dan isi mayoritas beda bulan (mis. file 2 bulan → pakai mayoritas).
      let peringatanKop = ''
      const modus = modusBulan(baris)
      if (modus && parsed.kop?.bulan && Number(parsed.kop.bulan) !== modus.bulan) {
        peringatanKop = `Kop menyebut ${namaBulan(parsed.kop.bulan)} tetapi isi mayoritas ` +
          `${namaBulan(modus.bulan)} ${modus.tahun} — dipakai yang mayoritas (${labelDeteksi}).`
      }
      setHasil({
        baris, kop: parsed.kop, masalah: parsed.problems || [],
        saldoTakRuntun: parsed.reconcile?.mismatches?.length || 0,
        tahunPdf, kunci: kunciDeteksi, label: labelDeteksi, hash,
        peringatanKop, halaman: total,
      })
      setKonfirmTahunan(false)
      setTahap('ringkas')
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

  const ringkasBulan = useMemo(
    () => (hasil ? ringkasPerBulan(hasil.baris) : []),
    [hasil],
  )
  const totalMasuk = ringkasBulan.reduce((s, g) => s + g.masuk, 0)
  const totalKeluar = ringkasBulan.reduce((s, g) => s + g.keluar, 0)
  const saldoAkhir = ringkasBulan.length ? ringkasBulan[ringkasBulan.length - 1].saldoAkhir : 0

  // ── 2. simpan via mergePeriode (SATU tulis atomik, kunci dari hasil deteksi) ──
  const simpan = () => {
    if (!hasil) return
    if (mode === 'tahunan' && !konfirmTahunan) {
      toast.error('Centang konfirmasi dulu: upload tahunan akan MENGGANTI SELURUH data.')
      return
    }
    const kunciSimpan = hasil.kunci
    const labelSimpan = hasil.label
    if (!kunciSimpan) {
      toast.error('Periode tidak terbaca — ulangi upload.')
      return
    }
    try {
      const lama = storageHelper.get('bku_data', null)
      const lamaRows = lama?.transactions || []
      const { rows, aksi, barisDiganti } = mergePeriode(lamaRows, hasil.baris, { mode, kunci: kunciSimpan })
      const summary = recalcSummary(rows)
      const riwayat = [...(lama?.riwayatImporPdf || [])].filter((r) => r.kunci !== kunciSimpan || mode === 'tahunan')
      riwayat.push({
        kunci: kunciSimpan, label: labelSimpan, mode, hash: hasil.hash,
        namaFile: fileName, halaman: hasil.halaman, jumlahBaris: hasil.baris.length,
        diuploadPada: new Date().toISOString(),
      })
      const header = {
        tahunAnggaran: String(hasil.kop?.tahun || hasil.tahunPdf || ''),
        npsn: hasil.kop?.npsn || lama?.header?.npsn || '',
        nama_sekolah: hasil.kop?.namaSekolah || lama?.header?.nama_sekolah || '',
        alamat: '', kabupaten: '', provinsi: '',
      }
      const footer = {
        kepalaSekolah: { nama: '', nip: '' },
        bendahara: { nama: '', nip: '' },
        tanggalPenutupan: '', tempat: '',
      }
      storageHelper.set('bku_data', {
        transactions: rows, header, footer, summary,
        uploadedAt: new Date().toISOString(),
        riwayatImporPdf: riwayat,
        sumberImpor: { jenis: 'pdf', mode, kunci: kunciSimpan, namaFile: fileName, halaman: hasil.halaman },
      })
      const aksiTeks = aksi === 'tambah' ? 'ditambah' : aksi === 'ganti' ? `diganti (${barisDiganti} baris lama)` : 'menggantikan SELURUH data'
      toast.success(
        `${hasil.baris.length} baris ${labelSimpan} ${aksiTeks}.\n` +
        `Total kini: ${rows.length} baris.\n` +
        `Penerimaan: ${rp(summary.totalPenerimaan)}\n` +
        `Pengeluaran: ${rp(summary.totalPengeluaran)}\n` +
        `Saldo Akhir: ${rp(summary.saldoAkhir)}` +
        (summary.isBalanced ? '\nBalance' : '\nTidak Balance') +
        (hasil.masalah.length ? `\n${hasil.masalah.length} catatan baca` : ''),
      )
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
            Pilih mode lalu pilih file — bulan/tahun dibaca otomatis dari PDF,
            data langsung tersimpan tanpa koreksi manual
          </p>
          {/* Pemilih mode SAJA (Rev3: tanpa pemilih periode). Visual final = ranah tim UI. */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
            <div className="relative">
              <button onClick={() => setMenuMode((v) => !v)} aria-haspopup="listbox" aria-expanded={menuMode}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                           bg-white text-slate-700 border border-slate-200 hover:bg-slate-50">
                <span className="material-symbols-outlined text-lg">filter_list</span>
                {MODE_LABEL[mode]}
                <span className="material-symbols-outlined text-lg">expand_more</span>
              </button>
              {menuMode && (
                <div role="listbox" className="absolute z-10 mt-2 w-56 rounded-xl border border-slate-200 bg-white shadow-xl text-left">
                  {Object.entries(MODE_LABEL).map(([m, label]) => (
                    <button key={m} role="option" aria-selected={mode === m}
                      onClick={() => { setMode(m); setMenuMode(false) }}
                      className={`block w-full px-4 py-2.5 text-sm hover:bg-slate-50 ${mode === m ? 'font-bold text-primary' : 'text-slate-700'}`}>
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
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

      {/* Ringkasan BACA-SAJA — tanpa form koreksi (keputusan user Sprint 025). */}
      {tahap === 'ringkas' && hasil && (
        <>
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 mb-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            <span className="font-semibold text-primary">{fileName}</span>
            <span className="text-slate-700">Mode: <b>{MODE_LABEL[mode]}</b> · Periode terbaca: <b>{hasil.label}</b></span>
            {hasil.kop?.namaSekolah && <span className="text-slate-700">Sekolah: <b>{hasil.kop.namaSekolah}</b></span>}
            {hasil.kop?.npsn && <span className="text-slate-700">NPSN: {hasil.kop.npsn}</span>}
            <span className="text-slate-700">{hasil.baris.length} baris terbaca</span>
            {hasil.masalah.length > 0 && <span className="text-primary font-medium">{hasil.masalah.length} catatan baca</span>}
            {hasil.saldoTakRuntun > 0 && (
              <span className="text-primary font-medium">
                {hasil.saldoTakRuntun} titik saldo tidak runtun — periksa hasil setelah simpan
              </span>
            )}
          </div>
          {hasil.peringatanKop && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-sm text-amber-800">
              ⚠️ {hasil.peringatanKop}
            </div>
          )}
          {mode === 'tahunan' && (
            <label className="flex items-start gap-2 mb-4 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-3">
              <input type="checkbox" checked={konfirmTahunan}
                onChange={(e) => setKonfirmTahunan(e.target.checked)} className="mt-1" />
              Saya paham: upload tahunan akan MENGGANTI SELURUH data BKU (termasuk akumulasi bulanan/semester).
            </label>
          )}

          <div className="overflow-x-auto border border-slate-200 rounded-xl mb-4">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="bg-slate-50 text-slate-600">
                <tr>{['Bulan', 'Masuk', 'Keluar', 'Saldo Akhir'].map((h) => (
                  <th key={h} className={thn}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {ringkasBulan.map((g) => (
                  <tr key={g.kunci} className="border-t border-slate-100">
                    <td className="px-3 py-1.5 text-slate-700">{g.namaBulan} {g.tahun}</td>
                    <td className="px-3 py-1.5 text-slate-700">{rp(g.masuk)}</td>
                    <td className="px-3 py-1.5 text-slate-700">{rp(g.keluar)}</td>
                    <td className="px-3 py-1.5 text-slate-700 font-semibold">{rp(g.saldoAkhir)}</td>
                  </tr>
                ))}
                <tr className="border-t border-slate-200 bg-slate-50/60">
                  <td className="px-3 py-1.5 font-semibold text-slate-900">Total file ini</td>
                  <td className="px-3 py-1.5 font-semibold text-slate-900">{rp(totalMasuk)}</td>
                  <td className="px-3 py-1.5 font-semibold text-slate-900">{rp(totalKeluar)}</td>
                  <td className="px-3 py-1.5 font-semibold text-slate-900">{rp(saldoAkhir)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
            <div className="text-sm text-slate-600">
              <b>{hasil.baris.length}</b> baris akan disimpan ke periode <b>{hasil.label}</b>
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
