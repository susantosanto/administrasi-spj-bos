/**
 * BKUSidebarLpj — tab "Dokumen LPJ" di sidebar BKU (Sprint 017 + Sprint 018).
 *
 * Sprint 017: membaca baris BKU yang diklik (NoBukti) lalu menampilkan SELURUH
 * form + panel preview kategori itu — komponen yang sama dengan halaman
 * Dokumen LPJ (`DetailDokumenLpj`, layout 'stack').
 *
 * Sprint 018 (K-1…K-12):
 * - AD-1: dropdown NoBukti mirip (kode rekening + kode kegiatan sama) → panel
 *   detail berpindah ke baris itu (navigasi baris yang sudah ada).
 * - AD-2: gate "Cek" memakai `readinessSidebar` (tidak menagih "Tanggal dana
 *   masuk" yang inputnya sudah dihapus).
 * - AD-3: form Mamin di sidebar memakai 6 seksi (`varianForm='sidebar6'`).
 * - AD-4: nilai otomatis dihitung di `utils/maminOtomatis.js` dan diterapkan ke
 *   `formData` SEBELUM form/preview/cetak memakainya → layar = cetakan.
 * - AD-5/AD-6: blok Dokumen PBJ per NoBukti, di bawah form LPJ & di atas preview.
 *
 * Aturan:
 * - Isi disimpan per NoBukti (`spj_lpj_bku`); hanya saat tombol Simpan ditekan.
 * - Tidak ada NoBukti → panel tetap terbuka, tombol Simpan mati (E-1).
 * - Preview SELALU tampil; kalau field wajib belum lengkap hanya muncul peringatan.
 */
import { useState, useRef, useEffect } from 'react'
import DetailDokumenLpj from '../dokumen/DetailDokumenLpj'
import BKUSidebarLpjToolbar from './BKUSidebarLpjToolbar'
import SidebarPbj from './SidebarPbj'
import { cardBerpanel } from '../../data/kategoriLpj'
import { TEMPLATE_CONFIGS } from '../../data/templateConfig'
import { buildPreviewDocs } from '../../utils/previewDocs'
import { muatAwalSidebar } from '../../utils/lpjSidebarMuat'
import { simpanEntri, noBuktiSah } from '../../utils/lpjBkuStore'
import { bacaEntri as bacaEntriPbj, simpanEntri as simpanEntriPbj } from '../../utils/pbjBkuStore'
import { prefillPbjDariBku, sinkronPbjDariSumber } from '../../utils/pbjPrefill'
import { cekKelengkapan, peringatanDariPelanggaran } from '../../utils/fieldWajib'
import { terapkanOtomatisMamin } from '../../utils/maminOtomatis'
import { readinessSidebar } from '../../utils/readinessSidebar'
import { pbjEligible } from '../../utils/pbjEligibility'
import { readinessCheck, sorotPelanggaran } from '../templates/SummaryCard'
import { snapshotSebelumTimpa } from '../../utils/aturanUndangan'
import storageHelper from '../../utils/storageHelper'
import { useToast } from '../ui/Toast'

export default function BKUSidebarLpj({
  transaction,
  kategori,
  bkuPrefill,
  onClose,
  allTransactions = [],
  onNavigate = null,
  blokPbj = null,
  blokDokumentasi = null,
  // Sprint 019 revisi: dokumen foto (upload + generate AI) → Panel Preview utama.
  fotoDocs = [],
}) {
  const card = cardBerpanel(kategori)
  const toast = useToast()

  // Sprint 018 (AD-4): konteks nilai otomatis — baris BKU + jenis kegiatan.
  const ctxOtomatis = {
    bku: {
      tanggal: bkuPrefill?.tanggal || '',
      uraian: bkuPrefill?.uraian || '',
      noBukti: bkuPrefill?.noBukti || '',
    },
    jenis: bkuPrefill?.maminJenis || '',
  }

  const [awal] = useState(() => muatAwalSidebar({ card, transaction, bkuPrefill, ctxOtomatis }))

  const [selectedSub, setSelectedSub] = useState(awal?.sub ?? null)
  const [formData, setFormDataRaw] = useState(awal?.formData ?? {})
  const [sppdData, setSppdData] = useState(awal?.sppdData ?? {})

  // ── Sprint 030: formData DATAR seperti semua kartu lain (Perjalanan Dinas,
  // Mamin, Honor). Namespace `dok_<subId>` DIHAPUS — sumber duplikat Undangan
  // & Daftar Hadir di panel (flat fallback menyalin seluruh objek bersarang).
  // Ganti sub mengosongkan form = perilaku standar seluruh aplikasi.
  const isLomba = card?.id === 'lomba_workshop'
  const formDataEfektif = formData
  const [viewMode, setViewMode] = useState(awal?.viewMode ?? 'form')
  const [formTab, setFormTab] = useState(awal?.formTab ?? 'daftar')
  const [previewTab, setPreviewTab] = useState(awal?.previewTab ?? 'daftar')
  const [printDocs, setPrintDocs] = useState([])
  const [prefillBadge, setPrefillBadge] = useState(awal?.prefillBadge ?? null)
  const [savedAt, setSavedAt] = useState(awal?.savedAt ?? null)

  // Sprint 018 (AD-5/AD-7): form PBJ per NoBukti. State dipegang di sini
  // supaya Panel Preview Document memakai data yang sama dengan blok PBJ.
  // Sprint 023-rev: backfill celah entri LAMA (dokumen Perencanaan kini
  // membaca tab Data — Workplan sheet sumber) dari baris BKU — form-first,
  // ketikan user tak pernah ditimpa (aturan prefillPbjDariBku).
  const sumberBkuPbj = {
    tanggal: bkuPrefill?.tanggal || '',
    uraian: bkuPrefill?.uraian || '',
    kegiatanNama: bkuPrefill?.kegiatanNama || '',
    noBukti: bkuPrefill?.noBukti || '',
    pengeluaran: transaction?.pengeluaran || 0,
  }
  const [formPbj, setFormPbj] = useState(() => {
    const entri = bacaEntriPbj(kategori, transaction?.noBukti)
    if (entri) {
      const dt = entri.form?.data || {}
      const adaCelah = [dt.noBukti, dt.bulan, dt.tanggalPesanan, dt.jumlahBarang, dt.spesifikasi, dt.alokasi]
        .some((v) => String(v ?? '').trim() === '')
      if (adaCelah) return prefillPbjDariBku(entri.form, sumberBkuPbj)
      return entri.form
    }
    return prefillPbjDariBku({}, sumberBkuPbj)
  })
  const [savedAtPbj, setSavedAtPbj] = useState(() => bacaEntriPbj(kategori, transaction?.noBukti)?.savedAt || null)

  /**
   * Revisi 2026-10-22 (temuan user): Tanggal dan Kegiatan/Pekerjaan PBJ adalah
   * field TURUNAN — sumbernya Tanggal baris BKU dan "Nama Kegiatan" (seksi 1).
   * Input duplikatnya dihapus dari `SidebarPbjForm`; nilainya disinkronkan di
   * sini supaya dokumen PBJ yang tercetak tetap lengkap.
   * `sinkronPbjDariSumber` mengembalikan objek yang SAMA bila tidak berubah →
   * setState bail-out, jadi tidak ada render berulang.
   */
  useEffect(() => {
    setFormPbj((prev) => sinkronPbjDariSumber(prev, {
      tanggal: bkuPrefill?.tanggal || '',
      acara: formData?.acara || '',
    }))
  }, [bkuPrefill?.tanggal, formData?.acara])

  // Revisi 2026-10-22: mode pengadaan PBJ (SIPLAH / NON-SIPLAH) — kunci sama
  // dengan halaman Dokumen Kelengkapan (`pbj_mode`) supaya konsepnya satu.
  const [modePbj, setModePbj] = useState(() => (storageHelper.get('pbj_mode', 'non') === 'siplah' ? 'siplah' : 'non'))
  const ubahModePbj = (mode) => {
    setModePbj(mode)
    storageHelper.set('pbj_mode', mode)
  }

  // Sprint 018 (K-4): "kotor" = isian form berubah sejak dimuat (belum disimpan).
  const refAwal = useRef(awal?.formData ?? {})
  const kotor = JSON.stringify(formData) !== JSON.stringify(refAwal.current)

  if (!card) return null

  /**
   * Sprint 018 (AD-4): setiap perubahan form di-merge nilai otomatis, sehingga
   * form, preview, dan area cetak membaca data yang sama. Merge hanya mengisi
   * field KOSONG (tidak pernah menimpa milik user).
   */
  const setFormData = (next) => {
    setFormDataRaw((prev) => {
      const nilai = typeof next === 'function' ? next(prev) : next
      return terapkanOtomatisMamin(nilai || {}, ctxOtomatis)
    })
  }

  const templateId = selectedSub?.templateId || null
  const cfg = templateId ? TEMPLATE_CONFIGS[templateId] : null
  // Sprint 023 (R-5): jenis pemeliharaan — Upah (dokumen upah penuh) vs
  // Non-Upah/service (tanpa dokumen upah). Default 'upah' → data lama aman.
  // Nilai ikut formData sehingga persist via simpanEntri. BUKAN di templateConfig.
  const jenisPemeliharaan = card?.id === 'pemeliharaan'
    ? (formData?.jenisPemeliharaan || 'upah')
    : null
  const ubahJenisPemeliharaan = (v) => {
    setFormDataRaw((prev) => ({ ...(prev || {}), jenisPemeliharaan: v }))
  }
  const sembunyiUpah = jenisPemeliharaan === 'non-upah'
  const previewDocs = sembunyiUpah
    ? []
    : buildPreviewDocs({
      cardId: card.id,
      templateId,
      subId: selectedSub?.id,
      formData,
      sppdData,
      formPbj: pbjEligible(kategori) ? formPbj : null,
      pbjMode: modePbj,
    })
  // Sprint 018 (AD-2): gate sidebar TIDAK menagih "Tanggal dana masuk"
  // (inputnya dihapus di sidebar; nilainya otomatis dari BKU).
  // Sprint 030: kartu lomba memakai gate berbasis TEMPLATE (cekKelengkapan)
  // — readinessCheck generik menagih nomor/rows yang tidak dimiliki
  // dokumen lomba, sehingga chip/Cetak tidak pernah bisa terbuka.
  const kelengkapan = card?.id === 'buku'
    ? { lengkap: true, kurang: [] }
    : cfg ? cekKelengkapan(cfg, formDataEfektif) : peringatanDariPelanggaran(readinessSidebar(readinessCheck(formData)))
  const pelanggaran = card?.id === 'buku'
    ? []
    : isLomba
      ? (kelengkapan.kurang || []).map((k) => ({ fieldId: `f-${k.key}`, label: k.label }))
      : readinessSidebar(readinessCheck(formData))

  const bisaSimpan = noBuktiSah(transaction?.noBukti)

  /**
   * Sprint 018 (K-3): berpindah ke baris kandidat = navigasi baris yang sudah
   * ada (`onNavigate`). Kandidat dari `bkuMirip` adalah objek RINGKAS, jadi
   * dipetakan balik ke transaksi aslinya (sidebar butuh data lengkap).
   */
  const pindahKeBaris = (kandidat) => {
    if (!onNavigate || !kandidat) return
    const asli = (allTransactions || []).find((t) => t && t.row === kandidat.row)
    if (asli) onNavigate(asli)
  }

  const handleSimpan = () => {
    const hasil = simpanEntri(card.id, transaction?.noBukti, {
      subId: selectedSub?.id || '',
      templateId,
      // Sprint 030: formData datar (sama seperti semua kartu lain).
      formData: formDataEfektif,
      sppdData,
    })
    if (hasil.ok) {
      setSavedAt(hasil.savedAt)
      refAwal.current = formData
      toast.success(`Dokumen tersimpan untuk NoBukti ${String(transaction.noBukti).trim()}`)
    } else if (hasil.alasan === 'no-bukti') {
      toast.info('Baris ini belum punya No Bukti — dokumen tidak bisa disimpan')
    } else {
      toast.info('Gagal menyimpan — penyimpanan penuh atau diblokir')
    }
  }

  /** Simpan dokumen PBJ untuk NoBukti ini (terpisah dari PBJ global). */
  const handleSimpanPbj = () => {
    const hasil = simpanEntriPbj(kategori, transaction?.noBukti, { form: formPbj })
    if (hasil.ok) {
      setSavedAtPbj(hasil.savedAt)
      toast.success(`Dokumen PBJ tersimpan untuk NoBukti ${String(transaction?.noBukti || '').trim()}`)
    } else if (hasil.alasan === 'no-bukti') {
      toast.info('Baris ini belum punya No Bukti — dokumen PBJ tidak bisa disimpan')
    } else {
      toast.info('Gagal menyimpan — penyimpanan penuh atau diblokir')
    }
  }

  /**
   * Sprint 020: hasil "Upload Invoice SIPLah" di blok PBJ — form per NoBukti
   * diganti dengan hasil parse invoice LALU otomatis tersimpan (perilaku sama
   * dengan halaman Dokumen Kelengkapan yang menyimpan langsung setelah upload).
   * Return hasil simpan supaya SidebarPbj bisa menyesuaikan pesan toast.
   */
  const handlePrefillPbjInvoice = (formBaru) => {
    setFormPbj(formBaru)
    const hasil = simpanEntriPbj(kategori, transaction?.noBukti, { form: formBaru })
    if (hasil.ok) setSavedAtPbj(hasil.savedAt)
    return hasil
  }

  const handleCek = () => {    const pertama = pelanggaran[0]
    if (!pertama) { toast.success('Lengkap — siap cetak'); return }
    if (!sorotPelanggaran(pertama)) toast.info(pertama.label)
  }

  // Sprint 019 (D-1): chip/banner klik → sorot field pertama yang bermasalah.
  const sorot = (v) => {
    if (!v) return
    if (!sorotPelanggaran(v)) toast.info(v.label)
  }

  const handleCetak = (selectedDocs = previewDocs) => {
    if (!Array.isArray(selectedDocs) || selectedDocs.length === 0) return
    setPrintDocs(selectedDocs)
  }

  useEffect(() => {
    if (printDocs.length === 0) return undefined
    let frame
    const cetak = () => {
      snapshotSebelumTimpa(
        { ...formData, sppdData: { ...sppdData } },
        [...new Set(Object.keys(formData))],
        transaction?.noBukti || '',
      )
      window.print()
    }
    frame = window.requestAnimationFrame ? window.requestAnimationFrame(cetak) : setTimeout(cetak, 0)
    const reset = () => setPrintDocs([])
    window.addEventListener('afterprint', reset, { once: true })
    return () => {
      window.removeEventListener('afterprint', reset)
      if (window.cancelAnimationFrame) window.cancelAnimationFrame(frame)
      else clearTimeout(frame)
    }
  }, [printDocs, formData, sppdData, transaction?.noBukti])

  const getStatus = (cardId, subId) => {
    const stored = storageHelper.get('dokumen_lpj', {})
    const key = subId ? `${cardId}_${subId}` : cardId
    return stored[key]?.status || 'Belum'
  }

  return (
    <div className="space-y-4">
      <BKUSidebarLpjToolbar
        transaction={transaction || {}}
        allTransactions={allTransactions}
        kotor={kotor}
        onPilihKandidat={pindahKeBaris}
        onSimpanLaluPilih={(k) => { handleSimpan(); pindahKeBaris(k) }}
        savedAt={savedAt}
        bisaSimpan={bisaSimpan}
        onSimpan={handleSimpan}
        pelanggaran={pelanggaran}
        onSorot={sorot}
      />

      {/* Sprint 023 (R-5): pemeliharaan ada yang ber-dokumen upah, ada yang
          tidak (mis. service alat sekolah). Pilihan manual per NoBukti. */}
      {card?.id === 'pemeliharaan' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-transparent shadow-sm p-4 space-y-2">
          <label htmlFor="jenis-pemeliharaan" className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Jenis Pemeliharaan
          </label>
          <select
            id="jenis-pemeliharaan"
            value={jenisPemeliharaan}
            onChange={(e) => ubahJenisPemeliharaan(e.target.value)}
            className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-transparent rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-100 outline-none transition-all duration-150 hover:border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/25"
          >
            <option value="upah">Upah — dengan Daftar Penerima Upah</option>
            <option value="non-upah">Non-Upah — service/jasa tanpa daftar upah</option>
          </select>
          {sembunyiUpah && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Dokumen Daftar Penerima Upah disembunyikan (jenis Non-Upah). Lengkapi Kwitansi/Nota + Berita Acara di halaman Dokumen Kelengkapan.
            </p>
          )}
        </div>
      )}

      <DetailDokumenLpj
        card={card}
        selectedSub={selectedSub}
        onSubChange={(sub) => { setSelectedSub(sub); setFormData({}); setSppdData({}) }}
        getStatus={getStatus}
        formData={formDataEfektif}
        setFormData={setFormData}
        sppdData={sppdData}
        setSppdData={setSppdData}
        viewMode={viewMode}
        setViewMode={setViewMode}
        formTab={formTab}
        setFormTab={setFormTab}
        previewTab={previewTab}
        setPreviewTab={setPreviewTab}
        onClose={onClose}
        onCek={handleCek}
        onCetak={handleCetak}
        onCetakTerpilih={handleCetak}
        centralizedPrint
        printSnapshot={printDocs}
        onPrint={handleCetak}
        previewDocs={previewDocs}
        pelanggaran={pelanggaran}
        prefillBadge={prefillBadge}
        onUndoPrefill={null}
        guideCtx={null}
        getTemplateConfig={() => cfg}
        layout="stack"
        gate={kelengkapan}
        tampilkanFooter={false}
        varianForm="sidebar6"
        bkuInfo={{ ...(bkuPrefill || {}), tanggalStr: bkuPrefill?.tanggal || '' }}
        blokTambahan={pbjEligible(kategori) ? (
          <SidebarPbj
            kategori={kategori}
            transaction={transaction}
            form={formPbj}
            onChange={setFormPbj}
            savedAt={savedAtPbj}
            onSimpan={handleSimpanPbj}
            mode={kategori === 'buku' ? 'siplah' : modePbj}
            onModeChange={kategori === 'buku' ? undefined : ubahModePbj}
            onPrefillInvoice={handlePrefillPbjInvoice}
            sembunyiMode={kategori === 'buku'}
          />
        ) : null}
        blokDokumentasi={kategori === 'buku' ? null : blokDokumentasi}
        fotoDocs={fotoDocs}
        onSorot={sorot}
      />
    </div>
  )
}
