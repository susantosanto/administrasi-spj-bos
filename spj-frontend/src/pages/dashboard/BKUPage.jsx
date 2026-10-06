import { useState, useEffect, useRef } from 'react'
import storageHelper from '../../utils/storageHelper'
import Topbar from '../../components/layout/Topbar'
import { useToast } from '../../components/ui/Toast'
import bkuParser, { filterByMonth, redetectTypes } from '../../utils/bkuParser'
import { getNamaKegiatan } from '../../data/kodeReferensi'
import { kategoriDenganKoreksi, grupDenganDominan, saringGrupBermasalah } from '../../utils/bkuKategori'
import BKUSidebar from '../../components/bku/BKUSidebar'

// Label badge kategori BKU (Sprint 004 A.2)
const KATEGORI_BADGE_LABEL = {
  honor: 'Honor',
  perjalanan_dinas: 'Perj. Dinas',
  mamin: 'Mamin',
  atk: 'ATK',
  pemeliharaan: 'Pemeliharaan',
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
  const [showUploadForm, setShowUploadForm] = useState(true)
  const [uploadedInfo, setUploadedInfo] = useState(null) // { header, summary }
  const [availableMonths, setAvailableMonths] = useState([])
  const [sidebarTransaction, setSidebarTransaction] = useState(null)
  const [selectedRowKey, setSelectedRowKey] = useState(null)
  const [hanyaBelumDipetakan, setHanyaBelumDipetakan] = useState(false)
  // Tab Belanja (default) + Pajak — satu sumber transaksi, view filter
  const [activeTab, setActiveTab] = useState('belanja')
  const [filterBulanPajak, setFilterBulanPajak] = useState('Semua')
  const [sortPajak, setSortPajak] = useState('tanggal-asc')
  // T2 — satu NoBukti satu grup expandable (dominan dari kode rekening)
  const [grupExpand, setGrupExpand] = useState({})
  const toggleGrup = (key) => setGrupExpand((prev) => ({ ...prev, [key]: !prev[key] }))
  const toast = useToast()
  const fileInputRef = useRef(null)

  // Recalculate real summary from transactions
  // Handle BOTH old format (no tipe field) and new format (with tipe field)
  const recalcSummary = (transactions) => {
    const hasTipe = transactions.some(t => t.tipe)

    if (!hasTipe) {
      // ── OLD DATA (sebelum parser fix) — tidak punya field tipe ──
      // Deteksi penerimaan BOSP dari text: "Dana BOSP" atau noBukti "BBU01"
      const bosp = transactions.filter(t => {
        const u = (t.uraian || '').toLowerCase()
        const nb = (t.noBukti || '').toUpperCase()
        return t.penerimaan > 0 && (nb === 'BBU01' || u.includes('dana bosp') || u.includes('bosp tahap'))
      }).reduce((s, t) => s + (t.penerimaan || 0), 0)

      // Pengeluaran riil = total pengeluaran - setor pajak - internal
      const totalKredit = transactions.reduce((s, t) => s + (t.pengeluaran || t.kredit || 0), 0)
      const setorPajak = transactions.filter(t => {
        const nb = (t.noBukti || '').toUpperCase()
        const u = (t.uraian || '').toLowerCase()
        return nb.startsWith('BPU') || u.includes('setor pph') || u.includes('setor pajak') || u.includes('pajak bunga')
      }).reduce((s, t) => s + (t.pengeluaran || t.kredit || 0), 0)
      const saldoAwal = transactions.filter(t => {
        const u = (t.uraian || '').toLowerCase()
        return u.includes('saldo bank') || u.includes('saldo tunai')
      }).reduce((s, t) => s + (t.pengeluaran || t.kredit || 0), 0)
      const internalLain = transactions.filter(t => {
        const u = (t.uraian || '').toLowerCase()
        return u.includes('bunga bank')
      }).reduce((s, t) => s + (t.pengeluaran || t.kredit || 0), 0)

      const totalPengeluaranRiil = totalKredit - setorPajak - saldoAwal - internalLain

      return {
        totalPenerimaan: bosp,
        totalPengeluaran: totalPengeluaranRiil,
        totalTransactions: transactions.length,
        isBalanced: bosp === totalPengeluaranRiil,
        months: [...new Set(transactions.map(t => t.bulan))].sort((a, b) => a - b),
      }
    }

    // ── NEW DATA (dengan field tipe) — filter langsung oleh tipe ──
    // PENERIMAAN RIIL = hanya Dana BOSP (PENERIMAAN_BOSP)
    // PENGELUARAN RIIL = BNU + BPU (PEMBAYARAN) — Tarik Tunai adalah pemindahan dana, bukan pengeluaran riil
    const bosp = transactions.filter(t => t.tipe === 'PENERIMAAN_BOSP')
      .reduce((s, t) => s + (t.penerimaan || 0), 0)
    const pembayaran = transactions.filter(t => t.tipe === 'PEMBAYARAN')
      .reduce((s, t) => s + (t.pengeluaran || 0), 0)
    
    return {
      totalPenerimaan: bosp,
      totalPengeluaran: pembayaran,
      totalTransactions: transactions.length,
      isBalanced: bosp === pembayaran,
      months: [...new Set(transactions.map(t => t.bulan))].sort((a, b) => a - b),
    }
  }

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
      setUploadedInfo({ header: stored.header, summary: realSummary })
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
    const result = loadFromStorage()
    if (result) {
      setShowUploadForm(false)
    }
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
      })

      // Hide upload form after successful upload
      setShowUploadForm(false)

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
  const tampilGrup = hanyaBelumDipetakan ? saringGrupBermasalah(semuaGrup) : semuaGrup
  const filteredItems = tampilGrup.flatMap((g) => g.rows)

  // Count grup bermasalah (T2 revisi): hitung grup bukan baris, se-bulan aktif
  const belumDipetakanCount = saringGrupBermasalah(semuaGrup).length

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

  const openSidebar = (transaction) => {
    if (!transaction) return
    setSidebarTransaction(transaction)
    setSelectedRowKey(transaction.row || 0)
  }

  const closeSidebar = () => {
    setSidebarTransaction(null)
  }

  const sidebarToast = (msg) => {
    toast.info(msg)
  }

  // T2 — satu baris BKU (dipakai baris tunggal maupun anggota grup saat expand)
  const renderBaris = (item, idx, prefix = '') => {
    const badge = TYPE_BADGES[item.tipe] || TYPE_BADGES.LAINNYA
    const rowKey = item.row || idx
    const isSelected = selectedRowKey === rowKey
    return (
      <tr
        key={`${item.row}-${idx}`}
        onClick={() => openSidebar(item)}
        className={`cursor-pointer transition-all duration-150 group border-l-2 ${
          isSelected
            ? 'bg-primary-fixed/30 border-primary shadow-sm'
            : 'border-transparent hover:bg-slate-50'
        }`}
      >
        <td className="px-2 py-2 text-text-low text-[11px]">{prefix}{String(idx + 1).padStart(2, '0')}</td>
        <td className="px-2 py-2 whitespace-nowrap text-[11px] font-medium truncate" title={item.tanggalStr}>{item.tanggalStr}</td>
        <td className="px-2 py-2 text-[11px]" title={item.uraian}>
          <span className="text-text-high">{item.uraian}</span>
          {item.kodeKegiatan && (() => {
            const namaKeg = getNamaKegiatan(item.kodeKegiatan)
            return namaKeg !== (item.kodeKegiatan?.replace(/\.$/, '')) ? (
              <div className="text-[9px] text-slate-400 mt-0.5 truncate max-w-[200px]" title={namaKeg}>
                &#128203; {namaKeg}
              </div>
            ) : null
          })()}
        </td>
        <td className="px-2 py-2 font-mono text-[10px] text-text-low truncate" title={item.noBukti || '-'}>
          {item.noBukti || '-'}
        </td>
        <td className="px-2 py-2 text-[10px] text-text-low">
          <span className="font-mono">{item.kodeRekening || '-'}</span>
          {item.kodeKegiatan && (() => {
            const namaKeg = getNamaKegiatan(item.kodeKegiatan) || item.kodeKegiatan
            return (
              <>
                <br />
                <span className="font-mono text-[8px] opacity-70 truncate block max-w-[120px]" title={namaKeg}>{namaKeg}</span>
              </>
            )
          })()}
        </td>
        <td className="px-2 py-2 truncate">
          <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-medium ${badge.bg}`}>
            {badge.label}
          </span>
          {item.tipe === 'PEMBAYARAN' && (() => {
            const kat = kategoriDenganKoreksi(item.kodeRekening, item.noBukti)
            return kat ? (
              <span className="block mt-0.5 inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold bg-primary/10 text-primary">
                {KATEGORI_BADGE_LABEL[kat.kategori] || kat.kategori}
              </span>
            ) : (
              <span className="block mt-0.5 inline-block px-1.5 py-0.5 rounded text-[9px] font-medium bg-slate-100 text-slate-500">
                Belum dipetakan
              </span>
            )
          })()}
        </td>
        <td className="px-2 py-2 text-right text-green-700 font-medium text-[11px] truncate" title={fmt(item.debet)}>
          {item.debet > 0 ? fmt(item.debet) : '-'}
        </td>
        <td className="px-2 py-2 text-right text-red-700 font-medium text-[11px] truncate" title={fmt(item.kredit)}>
          {item.kredit > 0 ? fmt(item.kredit) : '-'}
        </td>
        <td className="px-2 py-2 text-right font-bold text-[11px] truncate" title={fmt(item.saldo)}>
          {fmt(item.saldo)}
        </td>
      </tr>
    )
  }

  // ─── Render ───────────────────────────────────────────────────

  return (
    <div className="flex flex-col min-h-screen bg-slate-100/80">
      <Topbar title="Data BKU" subtitle="Upload BKU Excel sebagai referensi pembuatan dokumen" />

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 flex-1 max-w-[1400px] mx-auto w-full">
        {/* ── Upload Toggle Button (always visible) ── */}
        <button
          onClick={() => setShowUploadForm(!showUploadForm)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
            showUploadForm
              ? 'bg-primary text-white shadow-lg shadow-primary/20'
              : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <span className="material-symbols-outlined text-lg">{showUploadForm ? 'close' : 'upload_file'}</span>
          {showUploadForm ? 'Tutup Form' : 'Upload BKU'}
        </button>

        {/* ── Upload Area ── */}
        {showUploadForm && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-primary/50 transition-colors">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-3xl text-slate-400">cloud_upload</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Upload File BKU Excel</h3>
              <p className="text-sm text-slate-500 mb-4">Export BKU dari ARKAS — data akan langsung terisi otomatis</p>

              <input
                type="file"
                ref={fileInputRef}
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
                id="bku-file-input"
              />
              <label
                htmlFor="bku-file-input"
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  isUploading
                    ? 'bg-slate-400 text-white cursor-not-allowed'
                    : 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 active:scale-[0.98]'
                }`}
              >
                <span className="material-symbols-outlined text-lg">{isUploading ? 'sync' : 'upload'}</span>
                {isUploading ? 'Memproses...' : 'Pilih File Excel'}
              </label>
            </div>
          </div>
        )}

        {/* ── Sekolah Info Card (setelah upload) ── */}
        {uploadedInfo && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-2xl">school</span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900">
                    {uploadedInfo.header.nama_sekolah || 'SD NEGERI ...'}
                  </h4>
                  <p className="text-sm text-slate-500">
                    NPSN: {uploadedInfo.header.npsn || '-'} | Tahun: {uploadedInfo.header.tahunAnggaran || '-'}
                  </p>
                  <p className="text-xs text-slate-400">
                    {uploadedInfo.header.alamat || ''}
                    {uploadedInfo.header.kabupaten ? `, ${uploadedInfo.header.kabupaten}` : ''}
                    {uploadedInfo.header.provinsi ? `, ${uploadedInfo.header.provinsi}` : ''}
                  </p>
                </div>
              </div>
              <div className="text-right text-xs text-slate-500">
                <p className="font-semibold">{uploadedInfo.summary.totalTransactions} transaksi</p>
                <p className={uploadedInfo.summary.isBalanced ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                  {uploadedInfo.summary.isBalanced ? '✅ Balance' : '⚠️ Tidak Balance'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Summary Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          <div className="glass-card p-lg rounded-xl shadow-lg border-l-4 border-green-600">
            <div className="flex justify-between items-start mb-sm">
              <span className="text-label-md text-on-surface-variant">Total Penerimaan</span>
              <span className="material-symbols-outlined text-green-600" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance</span>
            </div>
            <h3 className="font-headline-md text-headline-md font-bold text-green-700">Rp {fmt(totalDebet)}</h3>
            {uploadedInfo && (
              <p className="text-xs text-text-low mt-1">
                {items.filter(i => i.penerimaan > 0).length} transaksi penerimaan
              </p>
            )}
          </div>
          <div className="glass-card p-lg rounded-xl shadow-lg border-l-4 border-red-600">
            <div className="flex justify-between items-start mb-sm">
              <span className="text-label-md text-on-surface-variant">Total Pengeluaran</span>
              <span className="material-symbols-outlined text-red-600" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
            </div>
            <h3 className="font-headline-md text-headline-md font-bold text-red-700">Rp {fmt(totalKredit)}</h3>
            {uploadedInfo && (
              <p className="text-xs text-text-low mt-1">
                {items.filter(i => i.pengeluaran > 0).length} transaksi pengeluaran
              </p>
            )}
          </div>
          <div className="bg-primary text-on-primary p-lg rounded-xl shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-sm">
                <span className="text-label-md opacity-80">Saldo Akhir</span>
                <span className="material-symbols-outlined opacity-80">wallet</span>
              </div>
              <h3 className="font-headline-md text-headline-md font-bold">Rp {fmt(lastSaldo)}</h3>
              {uploadedInfo && filterBulan !== 'Semua' && (
                <p className="text-xs opacity-80 mt-1">
                  Filter: {MONTH_NAMES[parseInt(filterBulan) - 1]}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Tab Belanja / Pajak — satu sumber transaksi, view filter ── */}
        <div className="flex gap-2" role="tablist" aria-label="Tab BKU">
          <button
            role="tab"
            aria-selected={activeTab === 'belanja'}
            onClick={() => setActiveTab('belanja')}
            className={`flex-1 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all border ${
              activeTab === 'belanja'
                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            Belanja ({itemsBelanja.length})
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'pajak'}
            onClick={() => setActiveTab('pajak')}
            className={`flex-1 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all border ${
              activeTab === 'pajak'
                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            Pajak ({itemsPajakAll.length})
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
                className="inline-flex items-center gap-1 px-lg py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all text-label-md font-medium shadow-lg shadow-primary/20"
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
                    <th className="px-2 py-2 font-bold text-[10px] w-[11%]">Tanggal</th>
                    <th className="px-2 py-2 font-bold text-[10px] w-[27%]">Uraian</th>
                    <th className="px-2 py-2 font-bold text-[10px] w-[9%]">No. Bukti</th>
                    <th className="px-2 py-2 font-bold text-[10px] w-[10%]">Kategori</th>
                    <th className="px-2 py-2 font-bold text-[10px] text-right w-[13%]">Pungut (Rp)</th>
                    <th className="px-2 py-2 font-bold text-[10px] text-right w-[13%]">Setor (Rp)</th>
                    <th className="px-2 py-2 font-bold text-[10px] text-right w-[14%]">Nominal (Rp)</th>
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
                    return (
                      <tr
                        key={`${item.row}-${idx}`}
                        onClick={isPungut ? undefined : () => openSidebar(item)}
                        title={isPungut ? 'Pungut pajak — detail nonaktif' : undefined}
                        className={`transition-all duration-150 border-l-2 ${isPungut ? 'border-transparent' : `cursor-pointer ${isSelected ? 'bg-primary-fixed/30 border-primary shadow-sm' : 'border-transparent hover:bg-slate-50'}`}`}
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
                  ? `Data dari ${uploadedInfo.header.nama_sekolah || 'file'}`
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
                  {/* Filter belum dipetakan (Sprint 004 A.2) */}
                  <button
                    onClick={() => setHanyaBelumDipetakan((v) => !v)}
                    className={`flex items-center gap-1 px-lg py-2 rounded-lg transition-all text-label-md font-medium border ${
                      hanyaBelumDipetakan
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                    title="Saring grup yang belum dipetakan"
                  >
                    <span className="material-symbols-outlined text-lg">filter_alt</span>
                    Saring belum dipetakan ({belumDipetakanCount})
                  </button>
                  <button
                    onClick={handleRefresh}
                    className="flex items-center gap-1 px-lg py-2 bg-primary-fixed/30 text-primary border border-primary/30 rounded-lg hover:bg-primary-fixed/50 transition-all text-label-md font-medium"
                    title="Muat ulang data tersimpan"
                  >
                    <span className="material-symbols-outlined text-lg">refresh</span>
                    Refresh
                  </button>
                  <button
                    onClick={() => {
                      storageHelper.remove('bku_data')
                      setItems([])
                      setUploadedInfo(null)
                      setAvailableMonths([])
                      setFilterBulan('Semua')
                      setFilterBulanPajak('Semua')
                      closeSidebar()
                      toast.info('Data BKU berhasil dihapus')
                    }}
                    className="flex items-center gap-1 px-lg py-2 bg-danger/10 text-danger border border-danger/30 rounded-lg hover:bg-danger/20 transition-all text-label-md font-medium"
                  >
                    <span className="material-symbols-outlined text-lg">delete_forever</span>
                    Hapus Data
                  </button>
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
            <div className="min-w-0">
              <table className="w-full text-left table-fixed">
                <thead className="bg-surface-container text-on-surface-variant uppercase tracking-wider">
                  <tr>
                    <th className="px-2 py-2 font-bold text-[10px] w-[3%]">No</th>
                    <th className="px-2 py-2 font-bold text-[10px] w-[11%]">Tanggal</th>
                    <th className="px-2 py-2 font-bold text-[10px] w-[27%]">Uraian</th>
                    <th className="px-2 py-2 font-bold text-[10px] w-[9%]">No. Bukti</th>
                    <th className="px-2 py-2 font-bold text-[10px] w-[10%]">Kode</th>
                    <th className="px-2 py-2 font-bold text-[10px] w-[10%]">Tipe</th>
                    <th className="px-2 py-2 font-bold text-[10px] text-right w-[10%]">Debet</th>
                    <th className="px-2 py-2 font-bold text-[10px] text-right w-[10%]">Kredit</th>
                    <th className="px-2 py-2 font-bold text-[10px] text-right w-[10%]">Saldo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {(() => {
                    let nomor = 0
                    const keluar = []
                    for (const grup of tampilGrup) {
                      if (grup.rows.length < 2) {
                        keluar.push(renderBaris(grup.rows[0], nomor++, ''))
                      } else {
                        const dibuka = !!grupExpand[grup.key]
                        keluar.push(
                          <tr
                            key={`g-${grup.key}`}
                            onClick={() => toggleGrup(grup.key)}
                            title="Lihat rincian se-Bukti"
                            className="cursor-pointer bg-slate-50 hover:bg-slate-100 border-l-2 border-primary"
                          >
                            <td colSpan="9" className="px-2 py-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="material-symbols-outlined text-base text-primary">{dibuka ? 'expand_more' : 'chevron_right'}</span>
                                <span className="font-mono font-bold text-[11px] text-slate-900">{grup.noBukti}</span>
                                {grup.dominan ? (
                                  <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold bg-primary/10 text-primary">
                                    {KATEGORI_BADGE_LABEL[grup.dominan.kategori] || grup.dominan.kategori}
                                  </span>
                                ) : (
                                  <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-medium bg-slate-100 text-slate-500">
                                    Belum dipetakan
                                  </span>
                                )}
                                <span className="text-[11px] text-slate-500">{grup.rows.length} rincian se-Bukti &#183; Rp {fmt(grup.total)}</span>
                                <span className="text-[10px] font-semibold text-primary">Lihat rincian</span>
                                <span className="font-mono text-[9px] text-slate-400 truncate max-w-[280px]" title={(grup.kodeList || []).join(', ')}>
                                  Kode: {(grup.kodeList || []).join(', ') || '-'}
                                </span>
                              </div>
                            </td>
                          </tr>
                        )
                        if (dibuka) {
                          for (const item of grup.rows) keluar.push(renderBaris(item, nomor++, '\u21B3 '))
                        }
                      }
                    }
                    return keluar
                  })()}
                </tbody>
                <tfoot className="bg-surface-container-low font-bold">
                  <tr>
                    <td className="px-2 py-2" colSpan="6">
                      <span className="text-text-high text-[11px]">TOTAL</span>
                      <span className="text-text-low text-[9px] ml-1">
                        ({tampilGrup.length} grup &#183; {filteredItems.length} rincian)
                      </span>
                    </td>
                    <td className="px-2 py-2 text-right text-green-700 text-[11px]">{fmt(totalDebetBelanja)}</td>
                    <td className="px-2 py-2 text-right text-red-700 text-[11px]">{fmt(totalKreditBelanja)}</td>
                    <td className="px-2 py-2 text-right text-primary font-bold text-[12px]">{fmt(lastSaldoBelanja)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
        )}
      </div>

      {/* ── Premium BKU Sidebar ── */}
      {sidebarTransaction && (
        <BKUSidebar
          transaction={sidebarTransaction}
          allTransactions={items}
          onClose={closeSidebar}
          onNavigate={(tx) => setSidebarTransaction(tx)}
          showToast={sidebarToast}
          onOpenMamin={(tx) => {
            toast.info('Dokumen khusus Mamin: ' + (tx.uraian || ''))
          }}
        />
      )}

    </div>
  )
}
