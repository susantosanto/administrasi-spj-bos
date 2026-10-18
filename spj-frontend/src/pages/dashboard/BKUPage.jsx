import { useState, useEffect, useRef } from 'react'
import storageHelper from '../../utils/storageHelper'
import { useToast } from '../../components/ui/Toast'
import { Upload } from 'lucide-react'
import bkuParser, { filterByMonth, redetectTypes } from '../../utils/bkuParser'
import { getNamaKegiatan } from '../../data/kodeReferensi'
import BKUSidebar from '../../components/bku/BKUSidebar'
import PageContainer from "../../ui/organisms/PageContainer";
import PageHeader from "../../ui/organisms/PageHeader";
import Badge from "../../ui/atoms/Badge";
import Button from "../../ui/atoms/Button";
import Card from "../../ui/molecules/Card";
import Input from "../../ui/atoms/Input";

// ─── CHECKLIST LPJ ─────────────────────────────────────────────
const CHECKLIST_KEY = 'bku_lpj_checklist'

function loadChecklist() {
  return storageHelper.get(CHECKLIST_KEY, {})
}

function saveChecklist(checklist) {
  storageHelper.set(CHECKLIST_KEY, checklist)
}

// ─── Helpers ───────────────────────────────────────────────────

const fmt = (n) => (n ?? 0).toLocaleString('id-ID')

const TYPE_BADGE_VARIANT = {
  PENERIMAAN_BOSP: { variant: 'success', label: 'Dana BOSP' },
  PUNGUT_PPH: { variant: 'warning', label: 'Pungut PPh' },
  PERGESERAN_BANK: { variant: 'info', label: 'Pergeseran' },
  SETOR_PAJAK: { variant: 'danger', label: 'Setor Pajak' },
  TARIK_TUNAI: { variant: 'warning', label: 'Tarik Tunai' },
  BUNGA_BANK: { variant: 'success', label: 'Bunga Bank' },
  PAJAK_BUNGA: { variant: 'danger', label: 'Pajak Bunga' },
  PEMBAYARAN: { variant: 'default', label: 'Pembayaran' },
  SALDO_AWAL: { variant: 'primary', label: 'Saldo Awal' },
  LAINNYA: { variant: 'default', label: '-' },
}

// Month names — sync with bkuParser.js
const MONTH_NAMES = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']

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
  const [lpjChecklist, setLpjChecklist] = useState({})
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
    // Load LPJ checklist
    setLpjChecklist(loadChecklist())
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

  // ─── LPJ Checklist Handler ──────────────────────────────────────

  const toggleLpjCheck = (rowKey) => {
    const key = String(rowKey)
    // Cari transaksi dari state untuk cek tipe — hanya PEMBAYARAN yang boleh di-ceklis
    const tx = items.find(i => String(i.row) === key)
    if (!tx || tx.tipe !== 'PEMBAYARAN') return
    const updated = { ...lpjChecklist, [key]: !lpjChecklist[key] }
    setLpjChecklist(updated)
    saveChecklist(updated)
    const status = updated[key] ? '✅ Dokumen LPJ lengkap' : '⬜ Dokumen LPJ belum'
    toast.info(`${status} (Row ${rowKey})`)
  }

  // ─── LPJ Progress ─────────────────────────────────────────────

  // Hanya hitung baris PEMBAYARAN untuk LPJ
  const lpjRelevantRows = items.filter(i => i.tipe === 'PEMBAYARAN')
  const lpjTotalCount = lpjRelevantRows.length
  const lpjCheckedCount = lpjRelevantRows.filter(i => lpjChecklist[i.row]).length
  const lpjProgress = lpjTotalCount > 0 ? Math.round((lpjCheckedCount / lpjTotalCount) * 100) : 0

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
    ? uploadedInfo.summary.totalPengeluaran  // Real: BNU + BPU (PEMBAYARAN)
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
    <PageContainer>
      <PageHeader
        title="Buku Kas Umum (BKU)"
        description="Upload dan kelola data BKU dari ARKAS"
        actions={
          <Button
            variant="primary"
            onClick={() => setShowUploadForm((v) => !v)}
            loading={isUploading}
          >
            <Upload className="w-4 h-4 mr-2" />
            {showUploadForm ? "Tutup Form" : "Upload BKU"}
          </Button>
        }
      />

      {/* ── Upload Area ── */}
      {showUploadForm && (
        <Card className="p-6 mb-6 border-border">
          <div className="border-2 border-dashed border-border rounded-2xl p-10 text-center hover:border-primary/40 transition-all duration-300 bg-surface-muted/50">
            <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-4 shadow-inner">
              <span className="material-symbols-outlined text-4xl text-primary">cloud_upload</span>
            </div>
            <h3 className="font-display text-lg font-bold text-text-high mb-2">
              Upload File BKU Excel
            </h3>
            <p className="text-sm text-text-muted mb-6 max-w-sm mx-auto">
              Export BKU dari ARKAS — data akan langsung terisi otomatis
            </p>

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
              className={`inline-flex items-center gap-2.5 px-8 py-4 rounded-md text-sm font-semibold transition-all duration-300 cursor-pointer ${
                isUploading
                  ? "bg-text-muted text-surface cursor-not-allowed"
                  : "bg-primary text-on-primary hover:bg-primary-hover shadow-sm hover:shadow-primary/25 active:scale-[0.98]"
              }`}
            >
              <span className="material-symbols-outlined text-lg">
                {isUploading ? "sync" : "upload"}
              </span>
              {isUploading ? "Memproses…" : "Pilih File Excel"}
            </label>
            <p className="text-xs text-text-low mt-4">Format: .xlsx atau .xls</p>
          </div>
        </Card>
      )}

      {/* ── Sekolah Info Card (setelah upload) ── */}
      {uploadedInfo && (
        <Card className="p-6 mb-6 border-border">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-2xl">school</span>
              </div>
              <div>
                <h4 className="font-display font-bold text-text-high">
                  {uploadedInfo.header.nama_sekolah || "SD NEGERI …"}
                </h4>
                <p className="text-sm text-text-muted">
                  NPSN: {uploadedInfo.header.npsn || "-"} | Tahun: {uploadedInfo.header.tahunAnggaran || "-"}
                </p>
                <p className="text-xs text-text-low">
                  {uploadedInfo.header.alamat || ""}
                  {uploadedInfo.header.kabupaten ? `, ${uploadedInfo.header.kabupaten}` : ""}
                  {uploadedInfo.header.provinsi ? `, ${uploadedInfo.header.provinsi}` : ""}
                </p>
              </div>
            </div>
            <div className="text-right text-xs text-text-low">
              <p className="font-semibold">{uploadedInfo.summary.totalTransactions} transaksi</p>
              <p className={uploadedInfo.summary.isBalanced ? "text-success font-semibold" : "text-danger font-semibold"}>
                {uploadedInfo.summary.isBalanced ? "✅ Balance" : "⚠️ Tidak Balance"}
              </p>
            </div>
          </div>

          {/* ═══ PROGRESS KELENGKAPAN LPJ ═══ */}
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">checklist</span>
                <span className="font-bold text-text-high">Progress Kelengkapan LPJ</span>
              </div>
              <span className="font-bold text-primary">{lpjCheckedCount}/{lpjTotalCount} ({lpjProgress}%)</span>
            </div>
            <div className="h-2.5 bg-surface-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary-hover rounded-full transition-all duration-700 ease-out"
                style={{ width: `${lpjProgress}%` }}
              />
            </div>
            <p className="text-[10px] text-text-low mt-1.5">
              Centang ✓ pada kolom LPJ di tabel untuk menandai dokumen sudah lengkap
            </p>
          </div>
        </Card>
      )}

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="p-6 border-border">
          <div className="flex justify-between items-start mb-sm">
            <span className="text-xs font-medium text-text-low">Total Penerimaan</span>
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance</span>
          </div>
          <h3 className="font-display text-2xl font-bold text-text-high">Rp {fmt(totalDebet)}</h3>
          {uploadedInfo && (
            <p className="text-xs text-text-low mt-1">
              {filteredItems.filter((i) => i.penerimaan > 0).length} transaksi penerimaan
            </p>
          )}
        </Card>
        <Card className="p-6 border-border">
          <div className="flex justify-between items-start mb-sm">
            <span className="text-xs font-medium text-text-low">Total Pengeluaran</span>
            <span className="material-symbols-outlined text-danger" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
          </div>
          <h3 className="font-display text-2xl font-bold text-text-high">Rp {fmt(totalKredit)}</h3>
          {uploadedInfo && (
            <p className="text-xs text-text-low mt-1">
              {filteredItems.filter((i) => i.pengeluaran > 0).length} transaksi pengeluaran
            </p>
          )}
        </Card>
        <Card className="p-6 bg-primary text-on-primary border-border relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-sm">
              <span className="text-xs font-medium opacity-80">Saldo Akhir</span>
              <span className="material-symbols-outlined opacity-80">wallet</span>
            </div>
            <h3 className="font-display text-2xl font-bold">Rp {fmt(lastSaldo)}</h3>
            {uploadedInfo && filterBulan !== "Semua" && (
              <p className="text-xs opacity-80 mt-1">
                Filter: {MONTH_NAMES[parseInt(filterBulan) - 1]}
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* ── Reference Table ── */}
      <Card className="overflow-hidden mb-6 border-border">
        <div className="p-6 border-b border-border flex flex-wrap items-center justify-between gap-4 bg-surface-muted">
          <div>
            <h4 className="font-display font-bold text-text-high">
              Referensi BKU
              {uploadedInfo && (
                <span className="text-text-low text-sm font-normal ml-2">
                  ({uploadedInfo.summary.totalTransactions} transaksi)
                </span>
              )}
            </h4>
            <p className="text-xs text-text-low">
              {uploadedInfo
                ? `Data dari ${uploadedInfo.header.nama_sekolah || "file"}`
                : "Upload file Excel untuk melihat data BKU"}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Month filter */}
            {availableMonths.length > 0 && (
              <Input
                className="w-48"
                value={filterBulan}
                onChange={(e) => setFilterBulan(e.target.value)}
              />
            )}

            {/* Action buttons */}
            {items.length > 0 && (
              <>
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium"
                  title="Refresh data dari localStorage"
                >
                  <span className="material-symbols-outlined text-lg">refresh</span>
                  Refresh
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    storageHelper.remove("bku_data")
                    setItems([])
                    setUploadedInfo(null)
                    setAvailableMonths([])
                    setFilterBulan("Semua")
                    closeSidebar()
                    toast.info("Data BKU berhasil dihapus")
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium"
                >
                  <span className="material-symbols-outlined text-lg">delete_forever</span>
                  Hapus Data
                </Button>
              </>
            )}
          </div>
        </div>

        {items.length === 0 ? (
          <div className="p-10 text-center border-border">
            <span className="material-symbols-outlined text-5xl text-text-low mb-4 block">table_rows</span>
            <p className="text-text-low">Belum ada data BKU. Upload file Excel untuk memulai.</p>
          </div>
        ) : (
          <div className="min-w-0 overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-surface-muted text-text-muted border-b border-border">
                <tr>
                  <th className="px-4 py-3 font-medium">Tanggal</th>
                  <th className="px-4 py-3 font-medium">No Bukti</th>
                  <th className="px-4 py-3 font-medium">Uraian</th>
                  <th className="px-4 py-3 font-medium">Tipe</th>
                  <th className="px-4 py-3 font-medium text-right">Penerimaan</th>
                  <th className="px-4 py-3 font-medium text-right">Pengeluaran</th>
                  <th className="px-4 py-3 font-medium text-right">Saldo</th>
                  <th className="px-4 py-3 text-center">LPJ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredItems.map((item, idx) => {
                  const badgeVariant = TYPE_BADGE_VARIANT[item.tipe]?.variant || "default"
                  const badgeLabel = TYPE_BADGE_VARIANT[item.tipe]?.label || "-"

                  const rowKey = item.row || idx
                  const isSelected = selectedRowKey === rowKey
                  const isChecked = lpjChecklist[rowKey]
                  const isLpjRelevant = item.tipe === "PEMBAYARAN"

                  return (
                    <tr
                      key={`${item.row}-${idx}`}
                      onClick={() => openSidebar(item)}
                      className={`cursor-pointer transition-colors group border-l-2 ${
                        isSelected
                          ? "bg-primary/5 border-primary shadow-sm"
                          : isChecked && isLpjRelevant
                            ? "bg-success/5 border-success hover:bg-success/10"
                            : isLpjRelevant
                              ? "bg-red-50/60 border-red-400 hover:bg-red-100 shadow-[inset_0_0_0_1px_rgba(239,68,68,0.08)]"
                              : "border-transparent hover:bg-surface-muted/50"
                      }`}
                    >
                      <td className="px-4 py-3 whitespace-nowrap font-medium truncate" title={item.tanggalStr}>
                        {item.tanggalStr}
                      </td>
                      <td className="px-4 py-3 font-mono text-[10px] text-text-low truncate" title={item.noBukti || "-"}>
                        {item.noBukti || "-"}
                      </td>
                      <td className="px-4 py-3 text-text-high truncate" title={item.uraian}>
                        <span className="text-text-high">{item.uraian}</span>
                        {item.kodeKegiatan && (() => {
                          const namaKeg = getNamaKegiatan(item.kodeKegiatan)
                          return namaKeg !== (item.kodeKegiatan?.replace(/\.$/, "")) ? (
                            <div className="text-[9px] text-text-low mt-0.5 truncate max-w-[200px]" title={namaKeg}>
                              📋 {namaKeg}
                            </div>
                          ) : null
                        })()}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={badgeVariant} size="sm">
                          {badgeLabel}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right text-success font-medium">
                        {item.debet > 0 ? `Rp ${fmt(item.debet)}` : "-"}
                      </td>
                      <td className="px-4 py-3 text-right text-danger font-medium">
                        {item.kredit > 0 ? `Rp ${fmt(item.kredit)}` : "-"}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-text-high truncate" title={fmt(item.saldo)}>
                        {fmt(item.saldo)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleLpjCheck(rowKey); }}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 mx-auto ${
                            isChecked && isLpjRelevant
                              ? "bg-success text-white shadow-sm shadow-success/50"
                              : isLpjRelevant
                                ? "bg-white text-slate-300 border border-border hover:border-success hover:text-success hover:shadow-sm hover:shadow-success/20/30"
                                : "bg-surface-muted text-text-low border border-border cursor-not-allowed opacity-50"
                          }`}
                          title={isChecked && isLpjRelevant ? "Tandai belum lengkap" : isLpjRelevant ? "Tandai dokumen LPJ sudah lengkap" : "Tidak memerlukan LPJ"}
                        >
                          <span className="material-symbols-outlined text-lg">
                            {isChecked && isLpjRelevant
                              ? "check_circle"
                              : isLpjRelevant
                                ? "radio_button_unchecked"
                                : "remove_circle_outline"}
                          </span>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot className="bg-surface-muted font-bold">
                <tr>
                  <td className="px-4 py-3" colSpan="4">
                    <span className="text-text-high text-sm">TOTAL</span>
                    <span className="text-text-low text-xs ml-1">({filteredItems.length})</span>
                  </td>
                  <td className="px-4 py-3 text-right text-success font-medium">{fmt(totalDebet)}</td>
                  <td className="px-4 py-3 text-right text-danger font-medium">{fmt(totalKredit)}</td>
                  <td className="px-4 py-3 text-right text-primary font-bold">{fmt(lastSaldo)}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="inline-flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-sm">assignment_turned_in</span>
                      <span className={`text-sm font-bold ${
                        lpjCheckedCount === lpjTotalCount && lpjTotalCount > 0
                          ? "text-success"
                          : "text-primary"
                      }`}>
                        {lpjCheckedCount}/{lpjTotalCount}
                      </span>
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Card>

      {/* ── Premium BKU Sidebar ── */}
      {sidebarTransaction && (
        <BKUSidebar
          transaction={sidebarTransaction}
          allTransactions={items}
          onClose={closeSidebar}
          onNavigate={(tx) => setSidebarTransaction(tx)}
          showToast={sidebarToast}
          onOpenMamin={(tx) => {
            toast.info("Dokumen khusus Mamin: " + (tx.uraian || ""))
          }}
          isLpjChecked={lpjChecklist}
          onToggleLpj={toggleLpjCheck}
        />
      )}
    </PageContainer>
  )
}
