import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import storageHelper from '../../utils/storageHelper'
import Topbar from '../../components/layout/Topbar'
import { useToast } from '../../components/ui/Toast'
import { requireWrite } from '../../services/licenseService'
import { logActivity } from '../../utils/activityLog'
import bkuParser, { filterByMonth, redetectTypes } from '../../utils/bkuParser'
import { deteksiJenisPajak } from '../../utils/dokPajak'
import { getNamaKegiatan } from '../../data/kodeReferensi'
import { kategoriDenganKoreksi, simpanKoreksi, cocokKoreksiGrup, PILIHAN_KATEGORI_UNIK, LABEL_KATEGORI, WARNA_KATEGORI, grupDenganDominan } from '../../utils/bkuKategori'
import { Button } from '../../components/ui/button'
import UploadDropzone from '../../components/ui/UploadDropzone'
import UploadSurface from '../../components/ui/UploadSurface'
import KategoriPicker from '../../components/bku/KategoriPicker'
import ErrorBoundary from '../../components/ui/ErrorBoundary'
import BKUSidebar from '../../components/bku/BKUSidebar'
import BKUSidebarPajakMini from '../../components/bku/BKUSidebarPajakMini'
import { hitungRingkasan } from '../../utils/bkuSummary'
import BKUUploadPdf from '../../components/bku/BKUUploadPdf'

// Label badge kategori BKU (Sprint 004 A.2) — konsisten dengan LABEL_KATEGORI
const KATEGORI_BADGE_LABEL = {
  honor: 'Honorarium',
  perjalanan_dinas: 'Perjalanan Dinas',
  mamin: 'Makan & Minum',
  atk: 'ATK',
  pemeliharaan: 'Pemeliharaan',
  lomba_workshop: 'Lomba & Workshop',
  operasional: 'Operasional',
  buku: 'Buku & Bahan Ajar',
}

// ─── Helpers ───────────────────────────────────────────────────

const fmt = (n) => (n ?? 0).toLocaleString('id-ID')

const TYPE_BADGES = {
  PENERIMAAN_BOSP: { bg: 'bg-green-100 text-green-800', label: 'Dana BOSP' },
  PUNGUT_PPH: { bg: 'bg-yellow-100 text-yellow-800', label: 'Pungut PPh' },
  PERGESERAN_BANK: { bg: 'bg-blue-100 text-blue-800', label: 'Pergeseran' },
  SETOR_PAJAK: { bg: 'bg-red-100 text-red-800', label: 'Setor Pajak' },
  TARIK_TUNAI: { bg: 'bg-orange-100 text-orange-800', label: 'Tarik Tunai' },
  BUNGA_BANK: { bg: 'bg-teal-100 text-teal-800', label: 'Bunga Bank' },
  PAJAK_BUNGA: { bg: 'bg-rose-100 text-rose-800', label: 'Pajak Bunga' },
  PEMBAYARAN: { bg: 'bg-gray-100 text-gray-700', label: 'Pembayaran' },
  SALDO_AWAL: { bg: 'bg-purple-100 text-purple-800', label: 'Saldo Awal' },
  LAINNYA: { bg: 'bg-gray-100 text-gray-500', label: '-' },
}

// Month names — sync with bkuParser.js
const MONTH_NAMES = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']

// Tab Pajak: tipe transaksi pajak (satu sumber, view filter)
// Catatan parser: BPU/BNU + pengeluaran selalu jadi PEMBAYARAN (aturan user),
// jadi deteksi pajak juga lewat kata kunci uraian agar baris pungut/setor
// yang tercatat sebagai PEMBAYARAN tetap masuk tab Pajak.
const PAJAK_TYPES = ['PUNGUT_PPH', 'SETOR_PAJAK', 'PAJAK_BUNGA']
const PAJAK_KEYWORDS = ['pungut', 'setor pph', 'setor pajak', 'pajak bunga', 'pph 21', 'pph 22', 'pph 23', 'ppn', 'ntpn', 'billing', 'coretax']
const isPajak = (t) => {
  if (PAJAK_TYPES.includes(t?.tipe)) return true
  const u = String(t?.uraian || '').toLowerCase()
  return PAJAK_KEYWORDS.some((k) => u.includes(k))
}
// Badge tab Pajak: pakai badge tipe bila sudah pajak, else infer dari uraian (reuse label Pungut/Setor)
const pajakBadge = (t) => {
  if (PAJAK_TYPES.includes(t?.tipe)) return TYPE_BADGES[t.tipe] || TYPE_BADGES.LAINNYA
  const u = String(t?.uraian || '').toLowerCase()
  if (u.includes('pungut')) return TYPE_BADGES.PUNGUT_PPH
  return TYPE_BADGES.SETOR_PAJAK
}

// Coretax — billing pajak dibuat di Coretax DJP
const CORETAX_URL = 'https://coretaxdjp.pajak.go.id/'

// ─── Component ─────────────────────────────────────────────────

export default function BKUPage() {
  const [items, setItems] = useState([])
  const [filterBulan, setFilterBulan] = useState('Semua')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedInfo, setUploadedInfo] = useState(null) // { header, summary }
  const [availableMonths, setAvailableMonths] = useState([])
  const [sidebarTransaction, setSidebarTransaction] = useState(null)
  const [sidebarPajakMini, setSidebarPajakMini] = useState(null)
  // Sumber upload terakhir untuk strip progresif (nama file + waktu).
  const [sumberBku, setSumberBku] = useState({ file: null, at: null })
  const [selectedRowKey, setSelectedRowKey] = useState(null)
  // Tab Belanja (default) + Pajak — satu sumber transaksi, view filter
  const [activeTab, setActiveTab] = useState('belanja')
  const [filterBulanPajak, setFilterBulanPajak] = useState('Semua')
  const [sortPajak, setSortPajak] = useState('tanggal-asc')
  // T2 — satu NoBukti satu grup expandable (dominan dari kode rekening)
  const [grupExpand, setGrupExpand] = useState({})
  const toggleGrup = (key) => setGrupExpand((prev) => ({ ...prev, [key]: !prev[key] }))
  const toast = useToast()
  const fileInputRef = useRef(null)

  // Satu definisi ringkasan untuk KEDUA pintu masuk (Excel & PDF).
  // Definisi & bentuknya ada di utils/bkuSummary.js — ADR §T.
  const recalcSummary = hitungRingkasan

  // ─── Load from Storage (shared) ──────────────────────────────

  const loadFromStorage = (showToast = false) => {
    const stored = storageHelper.get('bku_data', null)
    if (stored && stored.transactions && stored.transactions.length > 0) {
      // Re-detect tipe untuk migrasi data lama (misal: BPU yg dulu dikenali SETOR_PAJAK)
      const migrated = redetectTypes(stored.transactions)
      // Simpan hasil migrasi ke localStorage
      storageHelper.set('bku_data', { ...stored, transactions: migrated })

      setItems(migrated)
      const realSummary = recalcSummary(migrated)
      // Pulihkan sidebar detail bila ada baris yang sedang dibuka sebelum pindah halaman.
      try {
        const buka = storageHelper.get('bku_sidebar_terbuka', null)
        const cocok = buka && Number.isInteger(buka.row)
          ? migrated.find((t) => t.row === buka.row && t.tipe === 'PEMBAYARAN')
          : null
        if (cocok) {
          setSidebarTransaction(cocok)
          setSelectedRowKey(cocok.row || 0)
        } else if (buka) {
          storageHelper.remove('bku_sidebar_terbuka')
        }
      } catch { /* abaikan — sidebar tetap tertutup */ }
      // Sprint 025: teruskan riwayat impor PDF agar penanda periode tampil.
      setUploadedInfo({ header: stored.header, summary: realSummary, riwayatImporPdf: stored.riwayatImporPdf || [] })
      setSumberBku({ file: stored.sourceFile || null, at: stored.uploadedAt || null })
      setAvailableMonths(realSummary.months)
      setFilterBulan('Semua')
      if (showToast) {
        toast.success(`Data BKU di-refresh: ${realSummary.totalTransactions} transaksi`)
      }
      return realSummary
    }
    if (showToast) {
      toast.info('Tidak ada data BKU tersimpan. Upload file Excel terlebih dahulu.')
    }
    return null
  }

  // Load stored data on mount
  useEffect(() => {
    loadFromStorage()
  }, [])

  // ─── Keyboard shortcut: Escape closes sidebar ────────────
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') closeSidebar()
    }
    if (sidebarTransaction) {
      document.addEventListener('keydown', handleKey)
      return () => document.removeEventListener('keydown', handleKey)
    }
  }, [sidebarTransaction])

  // ─── Upload Handler ───────────────────────────────────────────

  const handleFileUpload = async (e) => {
    if (!requireWrite(toast)) return
    const file = e.target.files[0]
    if (!file) return

    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      toast.error('File harus berformat Excel (.xlsx atau .xls)')
      return
    }

    setIsUploading(true)
    try {
      const result = await bkuParser.parseBKUExcel(file)

      if (result.transactions.length === 0) {
        toast.error('Tidak ada data transaksi yang ditemukan di file BKU')
        return
      }

      // Save to state and storage
      setItems(result.transactions)
      setUploadedInfo({ header: result.header, summary: result.summary })
      setAvailableMonths(result.summary.months)
      setFilterBulan('Semua')

      // Save to localStorage
      storageHelper.set('bku_data', {
        transactions: result.transactions,
        header: result.header,
        summary: result.summary,
        footer: result.footer,
        uploadedAt: result.parsedAt,
        sourceFile: file.name,
      })
      setSumberBku({ file: file.name, at: result.parsedAt })

      // Upload selesai — area upload tetap tampil (satu konsep, tanpa toggle).

      logActivity({
        type: 'bku_upload',
        title: `Upload BKU ${result.summary.totalTransactions} transaksi`,
        detail: `${monthNames} • Saldo Rp ${fmt(result.summary.saldoAkhir)}`,
      })

      // Build success message
      const monthNames = result.summary.months.map(m => MONTH_NAMES[m - 1]).join(', ')
      const warnings = result.warnings.length > 0
        ? `\n⚠️ Peringatan: ${result.warnings.join(', ')}`
        : ''

      toast.success(
        `✅ BKU berhasil diupload!\n` +
        `${result.summary.totalTransactions} transaksi (${monthNames})\n` +
        `Penerimaan: Rp ${fmt(result.summary.totalPenerimaan)}\n` +
        `Pengeluaran: Rp ${fmt(result.summary.totalPengeluaran)}\n` +
        `Saldo Akhir: Rp ${fmt(result.summary.saldoAkhir)}` +
        (result.summary.isBalanced ? '\n✅ Balance' : '\n⚠️ Tidak balance') +
        warnings
      )
    } catch (error) {
      console.error('BKU upload error:', error)
      toast.error(`❌ Gagal memproses file: ${error.message}`)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // ─── Refresh Handler ──────────────────────────────────────────

  const handleRefresh = () => {
    loadFromStorage(true)
  }

  // ─── Filter ───────────────────────────────────────────────────

  // T2 — satu NoBukti satu grup + dominan dari kode rekening + filter cerdas per grup
  // SATU sumber transaksi (items); tab hanya view filter
  const itemsBelanja = items.filter((t) => !isPajak(t))
  const itemsPajakAll = items.filter(isPajak)
  const baseItems = filterByMonth(itemsBelanja, filterBulan)
  const semuaGrup = grupDenganDominan(baseItems)
  const tampilGrup = semuaGrup
  const filteredItems = tampilGrup.flatMap((g) => g.rows)

  // ─── Tab Pajak: filter bulan + sort tanggal/nominal, nominal lengkap ──
  const nominalPajak = (t) => (t.pengeluaran || t.kredit || 0) + (t.penerimaan || t.debet || 0)
  const pajakFiltered = filterByMonth(itemsPajakAll, filterBulanPajak)
  const pajakItems = [...pajakFiltered].sort((a, b) => {
    if (sortPajak === 'nominal-desc') return nominalPajak(b) - nominalPajak(a)
    if (sortPajak === 'nominal-asc') return nominalPajak(a) - nominalPajak(b)
    if (sortPajak === 'tanggal-desc') return String(b.tanggalISO || b.tanggalStr || '').localeCompare(String(a.tanggalISO || a.tanggalStr || ''))
    return String(a.tanggalISO || a.tanggalStr || '').localeCompare(String(b.tanggalISO || b.tanggalStr || ''))
  })
  const totalPajak = pajakItems.reduce((s, t) => s + nominalPajak(t), 0)

  // Compute totals — pakai real totals dari summary (bukan termasuk transaksi internal)
  // Kartu ringkasan di atas tab tetap overall (regresi aman).
  const isOverall = filterBulan === 'Semua'
  const totalDebet = isOverall && uploadedInfo
    ? uploadedInfo.summary.totalPenerimaan  // Real: hanya Dana BOSP
    : filteredItems.reduce((s, i) => s + i.debet, 0)
  const totalKredit = isOverall && uploadedInfo
    ? uploadedInfo.summary.totalPengeluaran  // Real: BNU + BPU (PEMBAYARAN)
    : filteredItems.reduce((s, i) => s + i.kredit, 0)
  const lastSaldo = filteredItems.length > 0 ? filteredItems[filteredItems.length - 1].saldo : 0
  // Footer tabel Belanja: khusus view belanja (tanpa pajak) agar TOTAL tidak ikut pajak.
  const totalDebetBelanja = filteredItems.reduce((s, i) => s + (i.debet || 0), 0)
  const totalKreditBelanja = filteredItems.reduce((s, i) => s + (i.kredit || 0), 0)
  const lastSaldoBelanja = filteredItems.length > 0 ? filteredItems[filteredItems.length - 1].saldo : 0

  // ─── Sidebar Helper ───────────────────────────────────────────

  const openSidebar = (transaction, grup = null) => {
    if (!transaction) return
    // Non-PEMBAYARAN (saldo awal, dana BOSP, pergeseran, bunga, pajak):
    // klik MATI TOTAL — tanpa sidebar, tanpa notifikasi.
    if (transaction.tipe !== 'PEMBAYARAN') return
    // Baris/group BELUM terkategori → jangan buka detail (dulu: panel kosong).
    // Non-PEMBAYARAN (saldo/pajak/penerimaan) selalu boleh: detailnya valid.
    const grupBelum = !!grup && !grup.dominan
    const barisBelum = transaction.tipe === 'PEMBAYARAN'
      && !kategoriDenganKoreksi(transaction.kodeRekening, transaction.noBukti, transaction.tanggalISO || transaction.tanggalStr, transaction.row)
    if (grupBelum || barisBelum) {
      toast.info(grupBelum
        ? `Kelompok "${transaction.noBukti || 'tanpa No Bukti'}" belum punya kategori — klik chevron untuk buka rincian, pilih kategori di kolom Tipe, lalu klik lagi.`
        : 'Baris ini belum punya kategori — pilih kategori di kolom Tipe, lalu klik lagi untuk membuka detail.')
      return
    }
    setSidebarTransaction(transaction)
    setSelectedRowKey(transaction.row || 0)
    // Ingat baris terbuka supaya tetap terbuka saat kembali dari halaman lain.
    try { storageHelper.set('bku_sidebar_terbuka', { row: transaction.row ?? null }) } catch { /* abaikan */ }
  }

  const closeSidebar = () => {
    setSidebarTransaction(null)
    try { storageHelper.remove('bku_sidebar_terbuka') } catch { /* abaikan */ }
  }

  const sidebarToast = (msg) => {
    toast.info(msg)
  }

  const handleKategoriChange = (index, item) => {
    const entry = index === '' || index == null ? null : PILIHAN_KATEGORI_UNIK[Number(index)]
    if (!entry) return
    const kategoriSaatIni = kategoriDenganKoreksi(item.kodeRekening, item.noBukti, item.tanggalISO || item.tanggalStr, item.row)
    if (entry.kategori === kategoriSaatIni?.kategori) return
    // Langsung simpan tanpa modal: cakupan grup (No Bukti + kode lengkap +
    // tanggal sama). Baris tanpa triple lengkap jatuh ke satu baris saja.
    let scope = 'grup'
    let cocok = items.filter((row) => cocokKoreksiGrup(row, item))
    if (cocok.length === 0) {
      scope = 'baris'
      cocok = [item]
    }
    if (!simpanKoreksi(
      item.kodeRekening,
      { ...entry, row: item.row },
      item.noBukti,
      item.tanggalISO || item.tanggalStr,
      scope,
    )) {
      toast.error('Kategori gagal disimpan. Periksa ruang penyimpanan browser.')
      return
    }
    setItems((current) => [...current])
    const labelBaru = LABEL_KATEGORI[entry.kategori] || entry.label || entry.kategori
    toast.success(cocok.length > 1
      ? `Kategori ${labelBaru} diterapkan ke ${cocok.length} baris`
      : `Kategori ${labelBaru} diterapkan`)
  }

  // Update field tertentu pada transaksi (misal: jenisPajak) → sync state + localStorage
  const updateTransaction = (row, patch) => {
    setItems((prev) => {
      const next = prev.map((t) => (t.row === row ? { ...t, ...patch } : t))
      const stored = storageHelper.get('bku_data', null)
      if (stored) {
        storageHelper.set('bku_data', { ...stored, transactions: next })
      }
      return next
    })
  }

  // T2 — satu baris BKU (dipakai baris tunggal maupun anggota grup saat expand)
  // Baris non-PEMBAYARAN: klik mati total (tanpa sidebar, tanpa notifikasi).
  const renderBaris = (item, idx) => {
    const badge = TYPE_BADGES[item.tipe] || TYPE_BADGES.LAINNYA
    const rowKey = item.row || idx
    const isSelected = selectedRowKey === rowKey
    const bisaBuka = item.tipe === 'PEMBAYARAN'
    return (
      <tr
        key={`${item.row}-${idx}`}
        onClick={bisaBuka ? () => openSidebar(item) : undefined}
        title={bisaBuka ? undefined : 'Baris non-belanja — detail nonaktif'}
        className={`transition-colors duration-150 group border-l-2 ${
          bisaBuka ? 'cursor-pointer' : 'cursor-default'
        } ${
          isSelected
            ? 'bg-primary-fixed/30 border-primary shadow-sm'
            : 'border-transparent'
        }`}
      >
        <td className="px-3 py-3 text-slate-400 text-[11px] tabular-nums">{String(idx + 1).padStart(2, '0')}</td>
        <td className="px-3 py-3 whitespace-nowrap text-[11px] font-medium text-slate-600 dark:text-slate-300 truncate" title={item.tanggalStr}>{item.tanggalStr}</td>
        <td className="px-3 py-3 text-[12px] leading-snug" title={item.uraian}>
          <span className="text-slate-800 dark:text-slate-100 font-medium">{item.uraian}</span>
          {item.kodeKegiatan && (() => {
            const namaKeg = getNamaKegiatan(item.kodeKegiatan)
            return namaKeg !== (item.kodeKegiatan?.replace(/\.$/, '')) ? (
              <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[220px]" title={namaKeg}>
                {namaKeg}
              </div>
            ) : null
          })()}
        </td>
        <td className="px-3 py-3 font-mono text-[10px] text-slate-400 truncate" title={item.noBukti || '-'}>
          {item.noBukti || '-'}
        </td>
        <td className="px-3 py-3 font-mono text-[10px] text-slate-400 truncate" title={item.kodeRekening || '-'}>
          {item.kodeRekening || '-'}
        </td>
        <td className="px-3 py-3 min-w-[172px]">
          <span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-1">
            {badge.label}
          </span>
          {(() => {
            if (item.tipe !== 'PEMBAYARAN') return null;
            const kat = kategoriDenganKoreksi(item.kodeRekening, item.noBukti, item.tanggalISO || item.tanggalStr, item.row)
            return (
              <KategoriPicker
                value={kat?.kategori || ''}
                options={PILIHAN_KATEGORI_UNIK}
                ariaLabel={`Kategori transaksi ${item.uraian || item.noBukti || 'transaksi'}`}
                onChange={(entryIndex) => handleKategoriChange(entryIndex, item)}
              />
            )
          })()}
        </td>
        <td className="px-3 py-3 text-right font-medium text-[12px] tabular-nums text-slate-500 dark:text-slate-400 truncate" title={fmt(item.debet)}>
          {item.debet > 0 ? fmt(item.debet) : <span className="text-slate-300">-</span>}
        </td>
        <td className="px-3 py-3 text-right font-medium text-[12px] tabular-nums text-slate-700 dark:text-slate-200 truncate" title={fmt(item.kredit)}>
          {item.kredit > 0 ? fmt(item.kredit) : <span className="text-slate-300">-</span>}
        </td>
        <td className="px-3 py-3 text-right font-bold text-[12px] tabular-nums text-slate-900 dark:text-white truncate" title={fmt(item.saldo)}>
          {fmt(item.saldo)}
        </td>
      </tr>
    )
  }

  // ─── Render ───────────────────────────────────────────────────

  return (
    <div className="flex flex-col min-h-screen bg-slate-100/80 dark:bg-slate-950">
      <Topbar title="Kas & Dokumen" subtitle="Kelola kas BKU dan dokumen LPJ, Kelengkapan, Pajak dari baris belanja" />

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 flex-1 max-w-[1400px] mx-auto w-full">
        {/* ── UPLOAD SURFACE progresif — konsep sama seperti Data Sekolah/Guru/
            Tendik: hero saat kosong, Source Strip tipis saat terisi (klik =
            buka form PDF + Excel lagi), progress inline saat memproses. ── */}
        <div id="bku-upload-area">
          <UploadSurface
            key={items.length}
            id="bku-file-input"
            loading={isUploading}
            loadingText="Memproses..."
            filled={items.length > 0}
            filledLabel="Data BKU tersimpan"
            fileName={sumberBku.file}
            uploadedAt={sumberBku.at}
            count={items.length}
            onFiles={(files) => handleFileUpload({ target: { files } })}
            form={(
              <div className="grid gap-4 lg:grid-cols-2 items-stretch">
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-transparent p-6 shadow-sm flex flex-col">
                  <BKUUploadPdf
                    recalcSummary={recalcSummary}
                    onSelesai={() => loadFromStorage(true)}
                  />
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-transparent p-6 shadow-sm flex flex-col">
                  <div className="flex flex-wrap items-center justify-center gap-2 mb-4" aria-hidden="true">
                    <span className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400">
                      Sumber: ARKAS Excel
                    </span>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <UploadDropzone
                      id="bku-file-input"
                      icon="table_view"
                      title="Upload File BKU Excel"
                      description="File Excel dari ARKAS — transaksi akan langsung terisi otomatis"
                      formatHint="Format: .xlsx atau .xls"
                      accept=".xlsx,.xls"
                      loading={isUploading}
                      loadingText="Memproses..."
                      actionText="Pilih File Excel BKU"
                      onFiles={(files) => handleFileUpload({ target: { files } })}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            )}
          />
        </div>

        {/* ── Sekolah Info Card (setelah upload) ── */}
        {uploadedInfo && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-transparent p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-2xl">school</span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                    {uploadedInfo.header?.nama_sekolah || 'SD NEGERI ...'}
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    NPSN: {uploadedInfo.header?.npsn || '-'} | Tahun: {uploadedInfo.header?.tahunAnggaran || '-'}
                  </p>
                  <p className="text-xs text-slate-400">
                    {uploadedInfo.header?.alamat || ''}
                    {uploadedInfo.header?.kabupaten ? `, ${uploadedInfo.header.kabupaten}` : ''}
                    {uploadedInfo.header?.provinsi ? `, ${uploadedInfo.header.provinsi}` : ''}
                  </p>
                </div>
              </div>
              <div className="text-right text-[11px] leading-relaxed tabular-nums shrink-0">
                {(() => {
                  const bln = [...(availableMonths || [])].sort((a, b) => a - b)
                  const thn = uploadedInfo.header?.tahunAnggaran || ''
                  const periode = bln.length
                    ? `${MONTH_NAMES[bln[0] - 1]} – ${MONTH_NAMES[bln[bln.length - 1] - 1]}${thn ? ` ${thn}` : ''}`
                    : '-'
                  const upd = sumberBku.at
                    ? new Date(sumberBku.at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
                    : '-'
                  const baris = [
                    ['Periode data', periode],
                    ['Update terakhir', upd],
                  ]
                  return baris.map(([label, nilai]) => (
                    <p key={label} className="text-slate-500 dark:text-slate-400">
                      {label} <span className="font-semibold text-slate-800 dark:text-slate-100">{nilai}</span>
                    </p>
                  ))
                })()}
              </div>
            </div>
          </div>
        )}

        {/* ── Summary Cards — minimalis premium: putih netral + saldo navy ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-transparent p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 dark:text-slate-500">Total Penerimaan</span>
              <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-slate-500 dark:text-slate-300 text-lg" aria-hidden="true">account_balance</span>
              </span>
            </div>
            <h3 className="text-[22px] leading-none font-bold text-slate-900 dark:text-white tabular-nums">Rp {fmt(totalDebet)}</h3>
            {uploadedInfo && (
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 tabular-nums">
                {items.filter(i => i.penerimaan > 0).length} transaksi penerimaan
              </p>
            )}
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-transparent p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 dark:text-slate-500">Total Pengeluaran</span>
              <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-slate-500 dark:text-slate-300 text-lg" aria-hidden="true">payments</span>
              </span>
            </div>
            <h3 className="text-[22px] leading-none font-bold text-slate-900 dark:text-white tabular-nums">Rp {fmt(totalKredit)}</h3>
            {uploadedInfo && (
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 tabular-nums">
                {items.filter(i => i.pengeluaran > 0).length} transaksi pengeluaran
              </p>
            )}
          </div>
          <div className="saldo-hero bg-slate-900 rounded-2xl p-5 shadow-sm relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full pointer-events-none" aria-hidden="true" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/60">Saldo Akhir</span>
                <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-white/80 text-lg" aria-hidden="true">wallet</span>
                </span>
              </div>
              <h3 className="text-[22px] leading-none font-bold text-white tabular-nums">Rp {fmt(lastSaldo)}</h3>
              {uploadedInfo && filterBulan !== 'Semua' && (
                <p className="text-xs text-white/60 mt-1.5">
                  Filter: {MONTH_NAMES[parseInt(filterBulan) - 1]}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Tab Belanja / Pajak — segmented control minimalis ── */}
        <div className="flex gap-1 rounded-2xl bg-slate-100 dark:bg-white/5 p-1" role="tablist" aria-label="Tab BKU">
          <button
            role="tab"
            aria-selected={activeTab === 'belanja'}
            onClick={() => setActiveTab('belanja')}
            className={`flex-1 px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'belanja'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            Belanja <span className="tabular-nums">({itemsBelanja.length})</span>
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'pajak'}
            onClick={() => setActiveTab('pajak')}
            className={`flex-1 px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'pajak'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Pajak <span className="tabular-nums">({itemsPajakAll.length})</span>
          </button>
        </div>

        {/* ── Reference Table ── */}
        {activeTab === 'pajak' ? (
        <div className="bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant overflow-hidden">
          <div className="p-lg border-b border-outline-variant flex flex-wrap items-center justify-between gap-md bg-surface-container-low">
            <div>
              <h4 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                Pajak
                <span className="text-text-low text-label-md font-normal ml-2">
                  ({pajakItems.length} transaksi pungut/setor)
                </span>
              </h4>
              <p className="text-text-low text-sm">
                Kode billing / NTPN dibuat di Coretax — pembayaran disetor via Coretax DJP.
              </p>
            </div>
            <div className="flex items-center gap-md flex-wrap">
              {availableMonths.length > 0 && (
                <select
                  className="bg-surface border border-outline-variant rounded-lg px-md py-2 text-label-md outline-none"
                  value={filterBulanPajak}
                  onChange={(e) => setFilterBulanPajak(e.target.value)}
                  aria-label="Filter bulan pajak"
                >
                  <option value="Semua">Semua Bulan</option>
                  {availableMonths.map(m => (
                    <option key={m} value={m}>{MONTH_NAMES[m - 1]}</option>
                  ))}
                </select>
              )}
              <select
                className="bg-surface border border-outline-variant rounded-lg px-md py-2 text-label-md outline-none"
                value={sortPajak}
                onChange={(e) => setSortPajak(e.target.value)}
                aria-label="Urutkan pajak"
              >
                <option value="tanggal-asc">Tanggal ↑</option>
                <option value="tanggal-desc">Tanggal ↓</option>
                <option value="nominal-desc">Nominal terbesar</option>
                <option value="nominal-asc">Nominal terkecil</option>
              </select>
              <a
                href={CORETAX_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-lg py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all text-label-md font-medium"
              >
                Bayar via Coretax
                <span className="material-symbols-outlined text-lg">open_in_new</span>
              </a>
            </div>
          </div>

          {itemsPajakAll.length === 0 ? (
            <div className="p-xl text-center">
              <span className="material-symbols-outlined text-5xl text-outline mb-4 block">receipt_long</span>
              <p className="text-text-low">Belum ada transaksi pajak (Pungut / Setor). Upload file BKU untuk memulai.</p>
            </div>
          ) : pajakItems.length === 0 ? (
            <div className="p-xl text-center">
              <span className="material-symbols-outlined text-5xl text-outline mb-4 block">search_off</span>
              <p className="text-text-low">Tidak ada transaksi pajak pada bulan ini.</p>
            </div>
          ) : (
            <div className="min-w-0 overflow-x-auto">
              <table className="w-full text-left table-fixed">
                <thead className="bg-surface-container text-on-surface-variant uppercase tracking-wider">
                  <tr>
                    <th className="px-2 py-2 font-bold text-[10px] w-[3%]">No</th>
                    <th className="px-2 py-2 font-bold text-[10px] w-[10%]">Tanggal</th>
                    <th className="px-2 py-2 font-bold text-[10px] w-[24%]">Uraian</th>
                    <th className="px-2 py-2 font-bold text-[10px] w-[8%]">No. Bukti</th>
                    <th className="px-2 py-2 font-bold text-[10px] w-[9%]">Kategori</th>
                    <th className="px-2 py-2 font-bold text-[10px] w-[9%]">Jenis Pajak</th>
                    <th className="px-2 py-2 font-bold text-[10px] text-right w-[11%]">Pungut (Rp)</th>
                    <th className="px-2 py-2 font-bold text-[10px] text-right w-[11%]">Setor (Rp)</th>
                    <th className="px-2 py-2 font-bold text-[10px] text-right w-[11%]">Nominal (Rp)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {pajakItems.map((item, idx) => {
                    const badge = pajakBadge(item)
                    const isPungut = badge === TYPE_BADGES.PUNGUT_PPH
                    const pungut = isPungut ? (item.pengeluaran || item.kredit || item.penerimaan || item.debet || 0) : 0
                    const setor = !isPungut ? (item.pengeluaran || item.kredit || item.penerimaan || item.debet || 0) : 0
                    const nominal = nominalPajak(item)
                    const isSelected = selectedRowKey === (item.row || idx)
                    // Pungut → mini sidebar Coretax. Pembayaran lain → sidebar penuh.
                    // Non-pembayaran → mati total.
                    const miniPajak = isPungut
                    const barisBisaDibuka = item.tipe === 'PEMBAYARAN' && !isPungut
                    return (
                      <tr
                        key={`${item.row}-${idx}`}
                        onClick={miniPajak ? () => setSidebarPajakMini(item) : barisBisaDibuka ? () => openSidebar(item) : undefined}
                        title={miniPajak ? 'Buka pembayaran pajak (Coretax)' : item.tipe !== 'PEMBAYARAN' ? 'Baris non-belanja — detail nonaktif' : isPungut ? 'Pungut pajak — detail nonaktif' : undefined}
                        className={`transition-all duration-150 border-l-2 ${(miniPajak || barisBisaDibuka) ? 'cursor-pointer' : 'cursor-default'} ${isPungut ? 'border-transparent' : `${isSelected ? 'bg-primary-fixed/30 border-primary shadow-sm' : 'border-transparent'}`}`}
                      >
                        <td className="px-2 py-2 text-text-low text-[11px]">{String(idx + 1).padStart(2, '0')}</td>
                        <td className="px-2 py-2 whitespace-nowrap text-[11px] font-medium" title={item.tanggalStr}>{item.tanggalStr}</td>
                        <td className="px-2 py-2 text-[11px]" title={item.uraian}>
                          <span className="text-text-high">{item.uraian}</span>
                        </td>
                        <td className="px-2 py-2 font-mono text-[10px] text-text-low" title={item.noBukti || '-'}>{item.noBukti || '-'}</td>
                        <td className="px-2 py-2">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-medium ${badge.bg}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-2 py-2 text-[11px] font-medium text-slate-700 dark:text-slate-200">
                          {deteksiJenisPajak(item.uraian) || '-'}
                        </td>
                        <td className="px-2 py-2 text-right text-[11px] font-medium" title={fmt(pungut)}>{pungut > 0 ? fmt(pungut) : '-'}</td>
                        <td className="px-2 py-2 text-right text-[11px] font-medium" title={fmt(setor)}>{setor > 0 ? fmt(setor) : '-'}</td>
                        <td className="px-2 py-2 text-right font-bold text-[11px]" title={fmt(nominal)}>{fmt(nominal)}</td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot className="bg-surface-container-low font-bold">
                  <tr>
                    <td className="px-2 py-2" colSpan="7">
                      <span className="text-text-high text-[11px]">TOTAL PAJAK</span>
                      <span className="text-text-low text-[9px] ml-1">({pajakItems.length} transaksi)</span>
                    </td>
                    <td className="px-2 py-2 text-right text-primary font-bold text-[12px]">{fmt(totalPajak)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
        ) : (
        <div className="bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant overflow-hidden">
          <div className="p-lg border-b border-outline-variant flex flex-wrap items-center justify-between gap-md bg-surface-container-low">
            <div>
              <h4 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                Referensi BKU
                {uploadedInfo && (
                  <span className="text-text-low text-label-md font-normal ml-2">
                    ({filteredItems.length} transaksi belanja)
                  </span>
                )}
              </h4>
              <p className="text-text-low text-sm">
                {uploadedInfo
                  ? `Data dari ${uploadedInfo.header?.nama_sekolah || 'file'}` +
                    ((uploadedInfo.riwayatImporPdf || []).length
                      ? ` · ${uploadedInfo.riwayatImporPdf.map((r) => r.label).join(', ')}`
                      : '')
                  : 'Upload file Excel untuk melihat data BKU'}
              </p>
            </div>
            <div className="flex items-center gap-md">
              {/* Month filter */}
              {availableMonths.length > 0 && (
                <select
                  className="bg-surface border border-outline-variant rounded-lg px-md py-2 text-label-md outline-none"
                  value={filterBulan}
                  onChange={(e) => setFilterBulan(e.target.value)}
                >
                  <option value="Semua">Semua Bulan</option>
                  {availableMonths.map(m => (
                    <option key={m} value={m}>{MONTH_NAMES[m - 1]}</option>
                  ))}
                </select>
              )}

              {/* Action buttons */}
              {items.length > 0 && (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleRefresh}
                    title="Muat ulang data tersimpan"
                  >
                    <span className="material-symbols-outlined text-lg">refresh</span>
                    Refresh
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      if (!requireWrite(toast)) return
                      storageHelper.remove('bku_data')
                      setItems([])
                      setUploadedInfo(null)
                      setAvailableMonths([])
                      setFilterBulan('Semua')
                      setFilterBulanPajak('Semua')
                      closeSidebar()
                      toast.info('Data BKU berhasil dihapus')
                    }}
                  >
                    <span className="material-symbols-outlined text-lg">delete_forever</span>
                    Hapus Data
                  </Button>
                </>
              )}
            </div>
          </div>

          {items.length === 0 ? (
            <div className="p-xl text-center">
              <span className="material-symbols-outlined text-5xl text-outline mb-4 block">table_rows</span>
              <p className="text-text-low">Belum ada data BKU. Upload file Excel untuk memulai.</p>
            </div>
          ) : (
            <div className="min-w-0 overflow-x-auto">
              <table className="w-full text-left table-fixed">
                <thead className="sticky top-0 z-10 backdrop-blur-md" style={{ backgroundColor: 'color-mix(in srgb, var(--color-surface) 88%, transparent)' }}>
                  <tr className="border-b" style={{ borderColor: 'var(--color-border)' }}>
                    <th className="px-3 pt-4 pb-3 font-semibold text-[10px] uppercase tracking-[0.14em] text-on-surface-variant w-[3%]">No</th>
                    <th className="px-3 pt-4 pb-3 font-semibold text-[10px] uppercase tracking-[0.14em] text-on-surface-variant w-[11%]">Tanggal</th>
                    <th className="px-3 pt-4 pb-3 font-semibold text-[10px] uppercase tracking-[0.14em] text-on-surface-variant w-[23%]">Uraian</th>
                    <th className="px-3 pt-4 pb-3 font-semibold text-[10px] uppercase tracking-[0.14em] text-on-surface-variant w-[9%]">No. Bukti</th>
                    <th className="px-3 pt-4 pb-3 font-semibold text-[10px] uppercase tracking-[0.14em] text-on-surface-variant w-[10%]">Kode</th>
                    <th className="px-3 pt-4 pb-3 font-semibold text-[10px] uppercase tracking-[0.14em] text-on-surface-variant w-[14%]">Tipe</th>
                    <th className="px-3 pt-4 pb-3 font-semibold text-[10px] uppercase tracking-[0.14em] text-on-surface-variant text-right w-[10%]">Debet</th>
                    <th className="px-3 pt-4 pb-3 font-semibold text-[10px] uppercase tracking-[0.14em] text-on-surface-variant text-right w-[10%]">Kredit</th>
                    <th className="px-3 pt-4 pb-3 font-semibold text-[10px] uppercase tracking-[0.14em] text-on-surface-variant text-right w-[10%]">Saldo</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                  {(() => {
                    let nomor = 0
                    const keluar = []
                    for (const grup of tampilGrup) {
                      if (grup.rows.length < 2) {
                        keluar.push(renderBaris(grup.rows[0], nomor++, ''))
                      } else {
                        const dibuka = !!grupExpand[grup.key]
                        // Header group non-PEMBAYARAN: klik mati total.
                        const grupBisaDibuka = grup.rows[0]?.tipe === 'PEMBAYARAN'
                        keluar.push(
                          <tr
                            key={`g-${grup.key}`}
                            onClick={grupBisaDibuka ? () => openSidebar(grup.rows[0], grup) : undefined}
                            title={!grupBisaDibuka
                              ? 'Kelompok non-belanja — detail nonaktif'
                              : grup.dominan
                                ? `Buka detail transaksi kelompok${(grup.kodeList || []).length ? ` — Kode: ${(grup.kodeList || []).join(', ')}` : ''}`
                                : 'Kelompok ini belum punya kategori — pilih kategori di kolom Tipe terlebih dahulu'}
                            className={`${grupBisaDibuka ? 'cursor-pointer' : 'cursor-default'} bg-surface-container-low`}
                          >
                            <td colSpan="9" className="px-3 py-2.5">
                              <div className="flex items-center gap-2.5">
                                <button
                                  type="button"
                                  aria-label={`${dibuka ? 'Tutup' : 'Lihat'} rincian kelompok ${grup.noBukti}`}
                                  onClick={(event) => { event.stopPropagation(); toggleGrup(grup.key) }}
                                  className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-transparent shadow-sm hover:border-primary/40 hover:text-primary"
                                >
                                  <span className="material-symbols-outlined text-base text-primary">{dibuka ? 'expand_more' : 'chevron_right'}</span>
                                </button>
                                <span className="font-mono font-bold text-[12px] text-slate-900 dark:text-white tabular-nums">{grup.noBukti}</span>
                                {grup.dominan ? (
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${WARNA_KATEGORI[grup.dominan.kategori]?.pill || 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 border-transparent'}`}>
                                    <span className={`h-1 w-1 rounded-full ${WARNA_KATEGORI[grup.dominan.kategori]?.dot || 'bg-slate-300'}`} aria-hidden="true" />
                                    {KATEGORI_BADGE_LABEL[grup.dominan.kategori] || grup.dominan.kategori}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400">
                                    <span className="h-1 w-1 rounded-full bg-slate-300" aria-hidden="true" />
                                    Belum dipetakan
                                  </span>
                                )}
                                <span className="text-[11px] text-slate-400 tabular-nums">{grup.rows.length} rincian · Rp {fmt(grup.total)}</span>
                              </div>
                            </td>
                          </tr>
                        )
                        if (dibuka) {
                          for (const item of grup.rows) keluar.push(renderBaris(item, nomor++))
                        }
                      }
                    }
                    return keluar
                  })()}
                </tbody>
                <tfoot className="bg-surface-container-low font-bold">
                  <tr>
                    <td className="px-3 py-3" colSpan="6">
                      <span className="text-slate-900 dark:text-white text-[11px] font-bold tracking-wide">TOTAL</span>
                      <span className="text-slate-400 text-[10px] ml-2 tabular-nums">
                        ({tampilGrup.length} grup · {filteredItems.length} rincian)
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right text-slate-500 dark:text-slate-400 font-semibold text-[11px] tabular-nums">{fmt(totalDebetBelanja)}</td>
                    <td className="px-3 py-3 text-right text-slate-700 dark:text-slate-200 font-semibold text-[11px] tabular-nums">{fmt(totalKreditBelanja)}</td>
                    <td className="px-3 py-3 text-right text-primary font-bold text-[13px] tabular-nums">{fmt(lastSaldoBelanja)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
        )}
      </div>

      {/* ── Premium BKU Sidebar (anti-blank: crash render jadi kartu aman).
          Portal ke body (seperti mini pajak): wrapper rute memakai
          animate-fade-in fill-forwards yang menyisakan transform → tanpa
          portal, panel fixed nempel ke dokumen, bukan viewport. ── */}
      {sidebarTransaction && createPortal(
        <ErrorBoundary
          key={sidebarTransaction.row}
          onTutup={closeSidebar}
          fallbackJudul="Detail transaksi tidak dapat ditampilkan"
          fallbackPesan="Terjadi galat saat membuka baris ini. Data BKU aman — tutup panel dan coba baris lain, atau muat ulang."
        >
          <BKUSidebar
            transaction={sidebarTransaction}
            allTransactions={items}
            onClose={closeSidebar}
            onNavigate={(tx) => {
              if (!tx) return
              setSidebarTransaction(tx)
              setSelectedRowKey(tx.row || 0)
              try { storageHelper.set('bku_sidebar_terbuka', { row: tx.row ?? null }) } catch { /* abaikan */ }
            }}
            showToast={sidebarToast}
            onUpdateTransaction={updateTransaction}
            onOpenMamin={(tx) => {
              toast.info('Dokumen khusus Mamin: ' + (tx.uraian || ''))
            }}
          />
        </ErrorBoundary>,
        document.body,
      )}

      {/* ── Mini Sidebar Pajak Pungut → tombol Coretax (portal: lepas dari
          ancestor ber-transform agar fixed selalu relatif viewport) ── */}
      {sidebarPajakMini && createPortal(
        <ErrorBoundary
          key={`pajak-${sidebarPajakMini.row}`}
          onTutup={() => setSidebarPajakMini(null)}
          fallbackJudul="Panel pajak tidak dapat ditampilkan"
          fallbackPesan="Tutup panel dan coba baris lain."
        >
          <BKUSidebarPajakMini
            transaction={sidebarPajakMini}
            onClose={() => setSidebarPajakMini(null)}
          />
        </ErrorBoundary>,
        document.body,
      )}

    </div>
  )
}
