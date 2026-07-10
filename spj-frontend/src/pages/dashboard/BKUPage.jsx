import { useState, useEffect, useRef } from 'react'
import storageHelper from '../../utils/storageHelper'
import Topbar from '../../components/layout/Topbar'
import { useToast } from '../../components/ui/Toast'
import bkuParser, { filterByMonth } from '../../utils/bkuParser'
import BKUSidebar from '../../components/bku/BKUSidebar'

// ─── MAMIN Docs Config ─────────────────────────────────────────

const MAMIN_DOCS = {
  'Makan dan Minum Rapat': [
    { nama: 'Surat Undangan', icon: 'mail', status: 'Belum' },
    { nama: 'Daftar Hadir', icon: 'group', status: 'Belum' },
    { nama: 'Resume Rapat', icon: 'description', status: 'Belum' },
    { nama: 'Foto Kegiatan', icon: 'photo_camera', status: 'Belum' },
  ],
  'Makan dan Minum Kegiatan': [
    { nama: 'Surat Perintah / Undangan', icon: 'mail', status: 'Belum' },
    { nama: 'Daftar Hadir', icon: 'group', status: 'Belum' },
    { nama: 'Resume Kegiatan', icon: 'description', status: 'Belum' },
    { nama: 'Foto Kegiatan', icon: 'photo_camera', status: 'Belum' },
  ],
  'Makan dan Minum Tamu': [
    { nama: 'Surat Undangan', icon: 'mail', status: 'Belum' },
    { nama: 'Daftar Hadir', icon: 'group', status: 'Belum' },
    { nama: 'Foto Kegiatan', icon: 'photo_camera', status: 'Belum' },
  ],
}

function getMaminType(uraian) {
  const lower = (uraian || '').toLowerCase()
  if (lower.includes('rapat')) return 'Makan dan Minum Rapat'
  if (lower.includes('kegiatan') || lower.includes('sosialisasi')) return 'Makan dan Minum Kegiatan'
  if (lower.includes('tamu')) return 'Makan dan Minum Tamu'
  return 'Makan dan Minum Rapat'
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

// ─── Component ─────────────────────────────────────────────────

export default function BKUPage() {
  const [items, setItems] = useState([])
  const [filterBulan, setFilterBulan] = useState('Semua')
  const [openMenuId, setOpenMenuId] = useState(null)
  const [selectedMamin, setSelectedMamin] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedInfo, setUploadedInfo] = useState(null) // { header, summary }
  const [availableMonths, setAvailableMonths] = useState([])
  const [sidebarTransaction, setSidebarTransaction] = useState(null)
  const [selectedRowKey, setSelectedRowKey] = useState(null)
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
    const bosp = transactions.filter(t => t.tipe === 'PENERIMAAN_BOSP')
      .reduce((s, t) => s + (t.penerimaan || 0), 0)
    const pembayaran = transactions.filter(t => t.tipe === 'PEMBAYARAN')
      .reduce((s, t) => s + (t.pengeluaran || 0), 0)
    const tarikTunai = transactions.filter(t => t.tipe === 'TARIK_TUNAI')
      .reduce((s, t) => s + (t.pengeluaran || 0), 0)
    
    return {
      totalPenerimaan: bosp,
      totalPengeluaran: pembayaran + tarikTunai,
      totalTransactions: transactions.length,
      isBalanced: bosp === (pembayaran + tarikTunai),
      months: [...new Set(transactions.map(t => t.bulan))].sort((a, b) => a - b),
    }
  }

  // ─── Load from Storage (shared) ──────────────────────────────

  const loadFromStorage = (showToast = false) => {
    const stored = storageHelper.get('bku_data', null)
    if (stored && stored.transactions && stored.transactions.length > 0) {
      setItems(stored.transactions)
      const realSummary = recalcSummary(stored.transactions)
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
    loadFromStorage()
  }, [])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClick = () => setOpenMenuId(null)
    if (openMenuId !== null) {
      document.addEventListener('click', handleClick)
      return () => document.removeEventListener('click', handleClick)
    }
  }, [openMenuId])

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

  const filteredItems = filterByMonth(items, filterBulan)

  // Compute totals — pakai real totals dari summary (bukan termasuk transaksi internal)
  const isOverall = filterBulan === 'Semua'
  const totalDebet = isOverall && uploadedInfo
    ? uploadedInfo.summary.totalPenerimaan  // Real: hanya Dana BOSP
    : filteredItems.reduce((s, i) => s + i.debet, 0)
  const totalKredit = isOverall && uploadedInfo
    ? uploadedInfo.summary.totalPengeluaran  // Real: BNU + TarikTunai
    : filteredItems.reduce((s, i) => s + i.kredit, 0)
  const lastSaldo = filteredItems.length > 0 ? filteredItems[filteredItems.length - 1].saldo : 0

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

  // ─── Render ───────────────────────────────────────────────────

  return (
    <div className="flex flex-col min-h-screen bg-slate-100/80">
      <Topbar title="Upload BKU" subtitle="Upload BKU Excel sebagai referensi pembuatan dokumen" />

      <div className="p-6 space-y-5 flex-1 max-w-[1400px] mx-auto w-full">
        {/* ── Upload Area ── */}
        <div className="bg-surface-container-lowest p-xl rounded-xl shadow-lg border border-outline-variant">
          <div className="border-2 border-dashed border-outline-variant rounded-xl p-xl text-center hover:border-primary transition-colors">
            <span className="material-symbols-outlined text-6xl text-outline mb-4 block">upload_file</span>
            <h3 className="font-headline-sm text-headline-sm font-bold text-text-high mb-2">Upload File BKU Excel</h3>
            <p className="text-text-low text-sm mb-4">File Excel (.xlsx) export BKU dari ARKAS</p>
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
              className={`inline-block px-lg py-2 rounded-lg font-label-md transition-all cursor-pointer ${
                isUploading
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-primary text-on-primary hover:brightness-110'
              }`}
            >
              {isUploading ? 'Memproses...' : 'Pilih File Excel'}
            </label>
          </div>

          {isUploading && (
            <div className="mt-md p-md bg-primary-fixed/30 rounded-lg flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary animate-spin">sync</span>
              <p className="text-text-low text-sm">Memproses file BKU...</p>
            </div>
          )}

          <div className="mt-md p-md bg-primary-fixed/30 rounded-lg flex items-center gap-sm">
            <span className="material-symbols-outlined text-primary text-lg">info</span>
            <p className="text-text-low text-sm">
              BKU yang diupload akan digunakan sebagai referensi data untuk pembuatan dokumen LPJ dan bukti fisik.
              Format sesuai standar ARKAS (sheet: Page1).
            </p>
          </div>
        </div>

        {/* ── Sekolah Info Card (setelah upload) ── */}
        {uploadedInfo && (
          <div className="bg-surface-container-lowest p-lg rounded-xl shadow-lg border border-outline-variant">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-md">
                <span className="material-symbols-outlined text-primary text-3xl">school</span>
                <div>
                  <h4 className="font-headline-sm text-headline-sm font-bold text-text-high">
                    {uploadedInfo.header.nama_sekolah || 'SD NEGERI ...'}
                  </h4>
                  <p className="text-text-low text-sm">
                    NPSN: {uploadedInfo.header.npsn || '-'} | Tahun: {uploadedInfo.header.tahunAnggaran || '-'}
                  </p>
                  <p className="text-text-low text-xs">
                    {uploadedInfo.header.alamat || ''}
                    {uploadedInfo.header.kabupaten ? `, ${uploadedInfo.header.kabupaten}` : ''}
                    {uploadedInfo.header.provinsi ? `, ${uploadedInfo.header.provinsi}` : ''}
                  </p>
                </div>
              </div>
              <div className="text-right text-xs text-text-low">
                <p>{uploadedInfo.summary.totalTransactions} transaksi</p>
                <p className={uploadedInfo.summary.isBalanced ? 'text-green-600' : 'text-red-600'}>
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
                {filteredItems.filter(i => i.penerimaan > 0).length} transaksi penerimaan
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
                {filteredItems.filter(i => i.pengeluaran > 0).length} transaksi pengeluaran
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

        {/* ── Reference Table ── */}
        <div className="bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant overflow-hidden">
          <div className="p-lg border-b border-outline-variant flex flex-wrap items-center justify-between gap-md bg-surface-container-low">
            <div>
              <h4 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                Referensi BKU
                {uploadedInfo && (
                  <span className="text-text-low text-label-md font-normal ml-2">
                    ({uploadedInfo.summary.totalTransactions} transaksi)
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
                  <button
                    onClick={handleRefresh}
                    className="flex items-center gap-1 px-lg py-2 bg-primary-fixed/30 text-primary border border-primary/30 rounded-lg hover:bg-primary-fixed/50 transition-all text-label-md font-medium"
                    title="Refresh data dari localStorage"
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
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface-container text-on-surface-variant uppercase tracking-wider">
                  <tr>
                    <th className="px-lg py-md font-label-md text-xs w-12">No</th>
                    <th className="px-lg py-md font-label-md text-xs whitespace-nowrap">Tanggal</th>
                    <th className="px-lg py-md font-label-md text-xs">Uraian</th>
                    <th className="px-lg py-md font-label-md text-xs">No. Bukti</th>
                    <th className="px-lg py-md font-label-md text-xs">Kode</th>
                    <th className="px-lg py-md font-label-md text-xs">Tipe</th>
                    <th className="px-lg py-md font-label-md text-xs text-right">Debet (Rp)</th>
                    <th className="px-lg py-md font-label-md text-xs text-right">Kredit (Rp)</th>
                    <th className="px-lg py-md font-label-md text-xs text-right">Saldo (Rp)</th>
                    <th className="px-lg py-md font-label-md text-xs text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="text-body-sm divide-y divide-outline-variant">
                  {filteredItems.map((item, idx) => {
                    const badge = TYPE_BADGES[item.tipe] || TYPE_BADGES.LAINNYA
                    const isMamin = (item.uraian && (item.uraian.toLowerCase().includes('makan') || item.uraian.toLowerCase().includes('minum'))) || item.kodeRekening === '5.1.02.01.01.0052'

                    const rowKey = item.row || idx
                    const isSelected = selectedRowKey === rowKey

                    return (
                      <tr
                        key={`${item.row}-${idx}`}
                        onClick={() => openSidebar(item)}
                        className={`cursor-pointer transition-all duration-150 group ${
                          isSelected
                            ? 'bg-primary-fixed/30 border-l-2 border-primary shadow-sm'
                            : 'hover:bg-surface-container-low/50 border-l-2 border-transparent'
                        }`}
                      >
                        <td className="px-lg py-md text-text-low">{String(idx + 1).padStart(2, '0')}</td>
                        <td className="px-lg py-md whitespace-nowrap font-medium">{item.tanggalStr}</td>
                        <td className="px-lg py-md max-w-xs truncate" title={item.uraian}>
                          <span className="text-text-high">{item.uraian}</span>
                          {item.kodeKegiatan && (
                            <span className="ml-1 text-xs text-text-low">({item.kodeKegiatan})</span>
                          )}
                        </td>
                        <td className="px-lg py-md font-mono text-xs text-text-low">
                          {item.noBukti || '-'}
                        </td>
                        <td className="px-lg py-md font-mono text-xs text-text-low">
                          {item.kodeRekening || '-'}
                        </td>
                        <td className="px-lg py-md">
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${badge.bg}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-lg py-md text-right text-green-700 font-medium">
                          {item.debet > 0 ? fmt(item.debet) : '-'}
                        </td>
                        <td className="px-lg py-md text-right text-red-700 font-medium">
                          {item.kredit > 0 ? fmt(item.kredit) : '-'}
                        </td>
                        <td className="px-lg py-md text-right font-bold">
                          {fmt(item.saldo)}
                        </td>
                        <td className="px-lg py-md text-center">
                          <div className="flex items-center justify-center gap-1">
                            {isMamin ? (
                              <div className="relative inline-block">
                                <button
                                  onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === idx ? null : idx); }}
                                  className="p-2 hover:bg-surface-container-high rounded-lg transition-colors"
                                >
                                  <span className="material-symbols-outlined text-lg text-primary">more_vert</span>
                                </button>
                                {openMenuId === idx && (
                                  <div className="absolute right-0 top-full mt-1 w-72 bg-surface-container-lowest rounded-xl shadow-2xl border border-outline-variant z-50 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                                    <div className="p-md bg-surface-container-low border-b border-outline-variant">
                                      <p className="font-label-md text-text-high">Dokumen LPJ Diperlukan</p>
                                      <p className="text-text-low text-xs">{item.uraian}</p>
                                    </div>
                                    <div className="p-sm">
                                      {(MAMIN_DOCS[getMaminType(item.uraian)] || []).map((doc, i) => (
                                        <button
                                          key={i}
                                          onClick={() => { setSelectedMamin({ ...doc, bkuUraian: item.uraian }); setOpenMenuId(null); }}
                                          className="w-full flex items-center gap-md p-md hover:bg-surface-container-high rounded-lg transition-colors text-left"
                                        >
                                          <span className="material-symbols-outlined text-primary text-xl">{doc.icon}</span>
                                          <div className="flex-1">
                                            <p className="font-label-md text-text-high">{doc.nama}</p>
                                          </div>
                                          <span className="material-symbols-outlined text-outline text-lg">chevron_right</span>
                                        </button>
                                      ))}
                                    </div>
                                    <div className="p-sm border-t border-outline-variant">
                                      <button
                                        onClick={() => { toast.info('Buka halaman Dokumen LPJ untuk Makan & Minum'); setOpenMenuId(null); }}
                                        className="w-full flex items-center justify-center gap-sm p-md text-primary hover:bg-primary/5 rounded-lg transition-colors font-label-md"
                                      >
                                        <span className="material-symbols-outlined text-lg">open_in_new</span>
                                        Buka Dokumen LPJ
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-text-low text-xs">-</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot className="bg-surface-container-low font-bold">
                  <tr>
                    <td className="px-lg py-lg" colSpan="6">
                      <span className="text-text-high">TOTAL</span>
                      <span className="text-text-low text-xs ml-2">
                        ({filteredItems.length} dari {items.length} transaksi)
                      </span>
                    </td>
                    <td className="px-lg py-lg text-right text-green-700">{fmt(totalDebet)}</td>
                    <td className="px-lg py-lg text-right text-red-700">{fmt(totalKredit)}</td>
                    <td className="px-lg py-lg text-right text-primary text-lg">{fmt(lastSaldo)}</td>
                    <td className="px-lg py-lg"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
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
            const docs = tx.uraian ? getMaminType(tx.uraian) : null
            if (docs && MAMIN_DOCS[docs]) {
              setSelectedMamin({ ...MAMIN_DOCS[docs][0], bkuUraian: tx.uraian })
            } else {
              toast.info('Dokumen khusus Mamin belum tersedia untuk transaksi ini')
            }
          }}
        />
      )}

      {/* ── Mamin Document Preview Modal ── */}
      {selectedMamin && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-lg" onClick={() => setSelectedMamin(null)}>
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <div className="p-lg border-b border-outline-variant flex items-center justify-between">
              <div className="flex items-center gap-md">
                <span className="material-symbols-outlined text-primary text-3xl">{selectedMamin.icon}</span>
                <div>
                  <h3 className="font-headline-sm text-headline-sm font-bold text-text-high">{selectedMamin.nama}</h3>
                  <p className="text-text-low text-xs">Untuk: {selectedMamin.bkuUraian}</p>
                </div>
              </div>
              <button onClick={() => setSelectedMamin(null)} className="p-2 hover:bg-surface-container-high rounded-lg transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-lg space-y-md">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-md flex items-start gap-sm">
                <span className="material-symbols-outlined text-amber-600 text-lg">construction</span>
                <div>
                  <p className="font-label-md text-amber-800">Prototype / Blueprint</p>
                  <p className="text-amber-700 text-xs">Format template dokumen ini masih dalam tahap pengembangan.</p>
                </div>
              </div>
              <div className="bg-surface-container-low rounded-xl p-lg text-center border-2 border-dashed border-outline-variant">
                <span className="material-symbols-outlined text-outline text-5xl mb-2 block">{selectedMamin.icon}</span>
                <p className="font-label-md text-text-high">{selectedMamin.nama}</p>
                <p className="text-text-low text-xs mt-1">Template dokumen akan ditampilkan di sini</p>
              </div>
              <button
                onClick={() => { toast.info(`Membuka form ${selectedMamin.nama}...`); setSelectedMamin(null); }}
                className="w-full bg-primary text-on-primary py-2 rounded-lg font-label-md hover:brightness-110 transition-all"
              >
                Isi Form Dokumen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
