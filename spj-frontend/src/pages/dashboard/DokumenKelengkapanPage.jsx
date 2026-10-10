/**
 * Dokumen Kelengkapan Page — Premium Compact Design
 */
import { useState, useEffect, useRef, Fragment } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import storageHelper from '../../utils/storageHelper'
import Topbar from '../../components/layout/Topbar'
import { useToast } from '../../components/ui/Toast'
import TemplateEngine from '../../components/templates/TemplateEngine'
import PanelPreviewDocument from '../../components/templates/PanelPreviewDocument'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { parseInvoiceSIPLah, pbjFormKosong, terapkanPrefillPbj } from '../../utils/aturanPbj'
import { isSudahBerdokumen, kunciTransaksi, bkuKePaketRow, manualKePaketRow, arsipkanBaris, kembalikanBaris, terapkanMode, nominalBku, isoBku, grupBkuPerNoBukti } from '../../utils/paketPbj'
import { snapshotSebelumTimpa, urungkanTimpa, bacaSnapshot } from '../../utils/aturanUndangan'
import { pbjDocs } from '../../utils/previewDocs'
import { PBJ_SHEET_COLUMNS } from '../../data/pbjDataSheet'
import { getNamaKegiatan } from '../../data/kodeReferensi'
import { tanggalPanjang } from '../../utils/aturanUndangan'

// ═══════════════════════════════════════════════════════════════════════════
// DATA DEFINITIONS — Organized by Category
// ═══════════════════════════════════════════════════════════════════════════

const CATEGORIES = [
  {
    id: 'siplah',
    label: 'SIPLAH',
    description: 'Dokumen pengadaan melalui SIPLAH',
    color: 'emerald',
    items: [
      {
        id: 'PBJ',
        nama: 'Dokumen PBJ',
        deskripsi: 'Perencanaan, Surat Pesanan, BAST, BAHP',
        icon: 'folder_shared',
        formFields: [
          { name: 'nomorPesanan', label: 'Nomor Pesanan', type: 'text', placeholder: '001/PSN/III/2025' },
          { name: 'tanggalPesanan', label: 'Tanggal Pesanan', type: 'date' },
          { name: 'namaBarang', label: 'Nama Barang/Jasa', type: 'text', placeholder: 'ATK Pendidikan' },
          { name: 'jumlah', label: 'Jumlah', type: 'number', placeholder: '0' },
          { name: 'satuan', label: 'Satuan', type: 'text', placeholder: 'Pcs / Set / Box' },
          { name: 'hargaSatuan', label: 'Harga Satuan (Rp)', type: 'number', placeholder: '0' },
        ],
      },
    ],
  },
  {
    id: 'keuangan',
    label: 'Keuangan',
    description: 'Register, BAP, dan informasi keuangan',
    color: 'blue',
    items: [
      {
        id: 'RK',
        nama: 'Register KAS',
        deskripsi: 'Register Kas BOS/BOSP',
        icon: 'menu_book',
        formFields: [
          { name: 'bulan', label: 'Bulan', type: 'text', placeholder: 'Januari 2026' },
          { name: 'nomorRegister', label: 'Nomor Register', type: 'text', placeholder: '001/RK/I/2026' },
        ],
      },
      {
        id: 'BAP',
        nama: 'BAP KAS',
        deskripsi: 'Berita Acara Pemeriksaan',
        icon: 'fact_check',
        formFields: [
          { name: 'tanggalPemeriksaan', label: 'Tanggal', type: 'date' },
          { name: 'namaPemeriksa', label: 'Pemeriksa', type: 'text', placeholder: 'Nama' },
          { name: 'hasilPemeriksaan', label: 'Hasil', type: 'text', placeholder: 'Sesuai / Tidak Sesuai' },
        ],
      },
      {
        id: 'PB',
        nama: 'Papan BOS',
        deskripsi: 'Informasi Anggaran & Realisasi',
        icon: 'dashboard_customize',
        formFields: [
          { name: 'anggaran', label: 'Total Anggaran (Rp)', type: 'number', placeholder: '0' },
          { name: 'realisasi', label: 'Total Realisasi (Rp)', type: 'number', placeholder: '0' },
        ],
      },
    ],
  },
  {
    id: 'umum',
    label: 'Umum',
    description: 'Kritik, saran, dan pengaduan',
    color: 'amber',
    items: [
      {
        id: 'KS',
        nama: 'Kritik & Saran',
        deskripsi: 'Lembar Kritik/Saran Sekolah',
        icon: 'rate_review',
        formFields: [
          { name: 'isi', label: 'Isi Kritik / Saran', type: 'text', placeholder: 'Tulis kritik atau saran...' },
          { name: 'penulis', label: 'Penulis', type: 'text', placeholder: 'Nama' },
          { name: 'tanggal', label: 'Tanggal', type: 'date' },
        ],
      },
      {
        id: 'PD',
        nama: 'Pengaduan',
        deskripsi: 'Lembar Pengaduan Sekolah',
        icon: 'feedback',
        formFields: [
          { name: 'isi', label: 'Isi Pengaduan', type: 'text', placeholder: 'Tulis pengaduan...' },
          { name: 'pelapor', label: 'Pelapor', type: 'text', placeholder: 'Nama' },
          { name: 'tanggal', label: 'Tanggal', type: 'date' },
        ],
      },
    ],
  },
  {
    id: 'laporan',
    label: 'Laporan',
    description: 'Cover, sekat, realisasi, instrumen',
    color: 'rose',
    items: [
      {
        id: 'R-CVR',
        nama: 'Cover LPJ',
        deskripsi: 'Cover laporan pertanggungjawaban',
        icon: 'folder',
        formFields: [
          { name: 'namaSekolah', label: 'Nama Sekolah', type: 'text', placeholder: 'SD Negeri ...' },
          { name: 'tahunAnggaran', label: 'Tahun Anggaran', type: 'text', placeholder: '2026' },
          { name: 'danaBosp', label: 'Dana BOSP (Rp)', type: 'number', placeholder: '0' },
        ],
      },
      {
        id: 'R-SKT',
        nama: 'Sekat Cover',
        deskripsi: 'Sekat pembatas cover',
        icon: 'view_agenda',
        formFields: [
          { name: 'periode', label: 'Periode Laporan', type: 'text', placeholder: 'Januari - Juni 2026' },
        ],
      },
      {
        id: 'R-ALR',
        nama: 'Realisasi Dana',
        deskripsi: 'Tabel realisasi anggaran',
        icon: 'table_chart',
        formFields: [
          { name: 'kodeRekening', label: 'Kode Rekening', type: 'text', placeholder: '5.1.02.02.01.0013' },
          { name: 'anggaran', label: 'Anggaran (Rp)', type: 'number', placeholder: '0' },
          { name: 'realisasi', label: 'Realisasi (Rp)', type: 'number', placeholder: '0' },
        ],
      },
      {
        id: 'R-ILB',
        nama: 'Instrumen BOS',
        deskripsi: 'Form instrumen pelaporan',
        icon: 'assignment',
        formFields: [],
      },
    ],
  },
  {
    id: 'blanko',
    label: 'Blanko',
    description: 'Template siap pakai',
    color: 'slate',
    items: [
      {
        id: 'DH',
        nama: 'Daftar Hadir',
        deskripsi: 'Template daftar hadir',
        icon: 'group_add',
        formFields: [
          { name: 'kegiatan', label: 'Nama Kegiatan', type: 'text', placeholder: 'Rapat Komite' },
          { name: 'tanggal', label: 'Tanggal', type: 'date' },
          { name: 'tempat', label: 'Tempat', type: 'text', placeholder: 'Ruang Guru' },
          { name: 'waktu', label: 'Waktu', type: 'text', placeholder: '08:00 - 12:00' },
        ],
      },
      {
        id: 'SU',
        nama: 'Surat Undangan',
        deskripsi: 'Template surat undangan',
        icon: 'mail',
        formFields: [
          { name: 'nomor', label: 'Nomor Surat', type: 'text', placeholder: '001/UND/III/2026' },
          { name: 'kepada', label: 'Kepada', type: 'text', placeholder: 'Nama / Jabatan' },
          { name: 'perihal', label: 'Perihal', type: 'text', placeholder: 'Undangan Rapat' },
          { name: 'tanggal', label: 'Hari/Tanggal', type: 'text', placeholder: 'Senin, 20 Januari 2026' },
        ],
      },
    ],
  },
]

// Color mapping
const COLOR_MAP = {
  emerald: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    icon: 'text-emerald-600',
    badge: 'bg-emerald-100 text-emerald-700',
    hover: 'hover:border-emerald-300',
  },
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    icon: 'text-blue-600',
    badge: 'bg-blue-100 text-blue-700',
    hover: 'hover:border-blue-300',
  },
  amber: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    icon: 'text-amber-600',
    badge: 'bg-amber-100 text-amber-700',
    hover: 'hover:border-amber-300',
  },
  rose: {
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    text: 'text-rose-700',
    icon: 'text-rose-600',
    badge: 'bg-rose-100 text-rose-700',
    hover: 'hover:border-rose-300',
  },
  slate: {
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    text: 'text-slate-700',
    icon: 'text-slate-600',
    badge: 'bg-slate-100 text-slate-700',
    hover: 'hover:border-slate-300',
  },
}

// ═══════════════════════════════════════════════════════════════════════════
// PBJ Sprint 010: 5 tab editor (config-driven)
// ═══════════════════════════════════════════════════════════════════════════
const PBJ_TABS = [
  { id: 'perencanaan', label: 'Perencanaan', fields: [
    { key: 'nomorSurat', label: 'Nomor Surat' },
    { key: 'tanggalSurat', label: 'Tanggal', type: 'date' },
    { key: 'kegiatan', label: 'Kegiatan/Pekerjaan' },
    { key: 'spesifikasi', label: 'Spesifikasi', type: 'textarea' },
    { key: 'alokasi', label: 'Alokasi Anggaran (Rp)' },
    { key: 'syaratA', label: 'Syarat penyedia (a)' },
    { key: 'syaratB', label: 'Syarat penyedia (b)' },
    { key: 'syaratC', label: 'Syarat penyedia (c)' },
    { key: 'namaPelaksana', label: 'Pelaksana' },
  ] },
  { id: 'pesanan', label: 'Surat Pesanan', fields: [
    { key: 'nomorPesanan', label: 'Nomor Pesanan' },
    { key: 'tanggalPesanan', label: 'Tanggal Pesanan', type: 'date' },
    { key: 'kepadaPesanan', label: 'Kepada (Penyedia)' },
    { key: 'alamatToko', label: 'Alamat Penyedia' },
    { key: 'grandTotal', label: 'Grand Total (Rp)' },
  ] },
  { id: 'bahp', label: 'BAHP', fields: [
    { key: 'nomorBahp', label: 'Nomor BAHP' },
    { key: 'tanggalPeriksa', label: 'Tanggal Periksa', type: 'date' },
    { key: 'acuanPesanan', label: 'Acuan Pesanan/Invoice' },
    { key: 'namaPemeriksa', label: 'Nama Pemeriksa' },
    { key: 'hasilPeriksa', label: 'Hasil Pemeriksaan', type: 'textarea' },
  ] },
  { id: 'bast', label: 'BAST', fields: [
    { key: 'nomorBast', label: 'Nomor BAST' },
    { key: 'tanggalTerima', label: 'Tanggal Terima', type: 'date' },
    { key: 'pihakPertama', label: 'Pihak Pertama (Penyedia)' },
    { key: 'pihakKedua', label: 'Pihak Kedua (Penerima)' },
    { key: 'kesesuaian', label: 'Kesesuaian', type: 'select', options: ['Sesuai', 'Belum Sesuai'] },
    { key: 'kondisi', label: 'Kondisi', type: 'select', options: ['Baik', 'Rusak'] },
  ] },
  { id: 'nego', label: 'Negosiasi', fields: [
    { key: 'nomorNego', label: 'Nomor' },
    { key: 'tanggalNego', label: 'Tanggal', type: 'date' },
    { key: 'produkI', label: 'Produk I (Penyedia invoice)' },
    { key: 'produkII', label: 'Produk II (Pembanding)' },
  ] },
  { id: 'data', label: 'Data', fields: [
    { key: 'bulan', label: 'Bulan' },
    { key: 'noBukti', label: 'No. Bukti' },
    { key: 'tanggalPesanan', label: 'Tgl. Pesanan', type: 'date' },
    { key: 'jumlahBarang', label: 'Jumlah Barang/Jasa' },
    { key: 'spesifikasi', label: 'Spesifikasi/ruang lingkup', type: 'textarea' },
    { key: 'waktuSerah', label: 'Waktu serah terima' },
    { key: 'alokasi', label: 'Alokasi Anggaran (Rp)' },
    { key: 'jenisPenyedia', label: 'Penyedia', type: 'select', options: ['Perorangan', 'Badan Usaha'] },
    { key: 'namaPenyedia', label: 'nama penyedia' },
    { key: 'direktur', label: 'Direktur penyedia' },
    { key: 'npwp', label: 'NPWP' },
    { key: 'alamat', label: 'Alamat' },
    { key: 'telp', label: 'No. Telp' },
  ] },
]

const PBJ_DOCS = ['perencanaan', 'pesanan', 'bahp', 'bast', 'nego', 'data']
const muatPbjForm = () => {
  const s = storageHelper.get('pbj_form', {})
  const out = pbjFormKosong()
  for (const k of PBJ_DOCS) out[k] = { ...out[k], ...(s?.[k] || {}) }
  return out
}

// ─── Task 57: 1 file invoice = 1 baris; header tabel persis sheet data ────
// Rekaman invoice (agregat) + N item untuk dropdown per baris. Kunci storage
// 'pbj_invoices' (prefix spj_ via storageHelper). Kolom tak dikenal invoice
// (waktu serah, jenis penyedia, direktur, link) = '-' (jujur, bukan karangan).
const BULAN_ID_PBJ = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
const bulanDariISOPbj = (iso) => {
  const m = /^(\d{4})-(\d{2})-\d{2}$/.exec(String(iso || ''))
  return m ? (BULAN_ID_PBJ[parseInt(m[2], 10) - 1] || '') : ''
}
const muatPbjInvoices = () => {
  const v = storageHelper.get('pbj_invoices', [])
  return Array.isArray(v) ? v : []
}
const drafKeInvoice = (draf, namaFile = '') => {
  const items = (draf.items || []).map((it) => ({
    uraian: it.uraian || '',
    qty: it.qtyTerima || it.qtyPesan || 0,
    satuan: '',
    harga: it.hargaSebelumPPN || 0,
    total: it.totalSebelumPPN || 0,
  }))
  const tglISO = draf.tanggalInvoiceISO || ''
  return {
    id: `${Date.now()}_${Math.floor(Math.random() * 1e6)}`,
    nomor: draf.nomorInvoice || '',
    tanggalISO: tglISO,
    tanggalTampil: draf.tanggalInvoiceTampil || tglISO,
    bulan: bulanDariISOPbj(tglISO),
    jumlahLabel: `${items.length} item`,
    spesifikasi: items.map((it) => it.uraian).filter(Boolean).join('; ').slice(0, 200),
    alokasi: draf.grandTotal || 0,
    namaPenyedia: draf.penyedia?.nama || '',
    npwp: draf.penyedia?.npwp || '',
    alamat: draf.penyedia?.alamat || '',
    telp: draf.penyedia?.kontak || '',
    grandTotal: draf.grandTotal || 0,
    items,
    namaFile,
  }
}
// Invoice -> 1 baris dengan kunci = PBJ_SHEET_COLUMNS (nama + urutan persis).
const invoiceKeSheetRow = (inv, idx) => ({
  no: idx + 1,
  // Task 66 lanjutan: bulan fallback dari tanggalISO agar baris lama
  // (BKU/Manual tersimpan sebelum ada bulan) tetap tahu "bulan apa".
  bulan: inv.bulan || bulanDariISOPbj(inv.tanggalISO) || '-',
  noBukti: inv.nomor || '-',
  tglPesanan: inv.tanggalISO ? tanggalPanjang(inv.tanggalISO) : (inv.tanggalTampil || '-'),
  jumlah: inv.jumlahLabel || '-',
  spesifikasi: inv.spesifikasi || '-',
  waktuSerah: '-',
  alokasi: inv.alokasi || 0,
  penyedia: '-',
  namaPenyedia: inv.namaPenyedia || '-',
  direktur: '-',
  linkSiplah: '-',
  npwp: inv.npwp || '-',
  alamat: inv.alamat || '-',
  telp: inv.telp || '-',
})
// Form + preview mengikuti invoice terpilih (paksa, bukan isi-merge): rows
// pesanan/nego + agregat tab Data selalu dari invoice yang diklik/diunggah.
const paksaFormDariInvoice = (prev, draf) => {
  const { formBaru } = terapkanPrefillPbj(prev, { invoice: draf })
  const items = (draf.items || []).map((it) => ({
    uraian: it.uraian, qty: it.qtyTerima || it.qtyPesan, satuan: '',
    harga: it.hargaSebelumPPN, total: it.totalSebelumPPN,
  }))
  formBaru.pesanan = { ...formBaru.pesanan, rows: items,
    grandTotal: draf.grandTotal ? String(draf.grandTotal) : formBaru.pesanan.grandTotal }
  formBaru.nego = { ...formBaru.nego, rows: (draf.items || []).map((it) => ({
    uraian: it.uraian, qty: it.qtyTerima || it.qtyPesan,
    penawaran: it.hargaSebelumPPN, nego: it.hargaSebelumPPN, ket: '' })) }
  formBaru.data = { ...formBaru.data,
    jumlahBarang: `${(draf.items || []).length} item`,
    spesifikasi: (draf.items || []).map((it) => it.uraian).join('; ').slice(0, 200),
    alokasi: draf.grandTotal ? String(draf.grandTotal) : formBaru.data.alokasi,
    namaPenyedia: draf.penyedia?.nama || formBaru.data.namaPenyedia,
    alamat: draf.penyedia?.alamat || formBaru.data.alamat,
    npwp: draf.penyedia?.npwp || formBaru.data.npwp,
    telp: draf.penyedia?.kontak || formBaru.data.telp }
  return formBaru
}
const drafDariInvoice = (inv) => ({
  cocok: true,
  nomorInvoice: inv.nomor || '',
  tanggalInvoiceISO: inv.tanggalISO || '',
  tanggalInvoiceTampil: inv.tanggalTampil || '',
  penyedia: { nama: inv.namaPenyedia || '', alamat: inv.alamat || '', kontak: inv.telp || '', npwp: inv.npwp || '' },
  items: (inv.items || []).map((it) => ({ uraian: it.uraian, qtyPesan: it.qty, qtyTerima: it.qty, hargaSebelumPPN: it.harga, ppnPerItem: 0, totalSebelumPPN: it.total })),
  grandTotal: inv.grandTotal || 0,
})

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function DokumenKelengkapanPage() {
  const [siplah, setSiplah] = useState(false)
  const [status, setStatus] = useState({})
  const [selectedDokumen, setSelectedDokumen] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [formData, setFormData] = useState({})
  const toast = useToast()
  const location = useLocation()
  const navigate = useNavigate()

  // ─── Sprint 004 D.2: terima kelompok ATK dari BKU ────────────────────
  // Preselect toggle SIPLAH bila flag kelompok bulat; tampilkan badge.
  const [bkuKelompok, setBkuKelompok] = useState(null)
  useEffect(() => {
    const st = location.state
    if (!st?.fromBKU || !st?.kelompok) return
    // Abaikan state basi (HMR remount) — maks 10 menit.
    if (!st.ts || Date.now() - st.ts > 10 * 60 * 1000) {
      navigate(location.pathname, { replace: true })
      return
    }
    setBkuKelompok(st.kelompok)
    const flags = (st.kelompok.flags || []).filter(Boolean)
    if (flags.length > 0 && flags.every((f) => f === 'siplah')) setSiplah(true)
    if (flags.length > 0 && flags.every((f) => f === 'non')) setSiplah(false)
    toast.success(`Kelompok ATK dari BKU: ${st.kelompok.count} baris`)
    navigate(location.pathname, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const stored = storageHelper.get('dokumen_kelengkapan_status', {})
    setStatus(stored)
  }, [])

  // ─── Helpers ─────────────────────────────────────────────────────────────

  const getStatus = (id) => status[id] === 'Selesai'
  const allItems = CATEGORIES.flatMap((c) => c.items)
  const completedCount = allItems.filter((d) => getStatus(d.id)).length
  const progress = allItems.length > 0 ? Math.round((completedCount / allItems.length) * 100) : 0

  const toggleStatus = (id) => {
    const next = status[id] === 'Selesai' ? 'Belum' : 'Selesai'
    const updated = { ...status, [id]: next }
    setStatus(updated)
    storageHelper.set('dokumen_kelengkapan_status', updated)
    toast.success(`Status diubah ke ${next}`)
  }

  const handleOpenDokumen = (dokumen, category) => {
    // PBJ = accordion di bawah card (seperti LPJ), bukan modal.
    if (dokumen.id === 'PBJ') {
      if (selectedDokumen?.id === 'PBJ') {
        setSelectedDokumen(null)
        setSelectedCategory(null)
        return
      }
      setSelectedDokumen(dokumen)
      setSelectedCategory(category)
      setTimeout(() => pbjSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150)
      return
    }
    setSelectedDokumen(dokumen)
    setSelectedCategory(category)
    setFormData({})
  }

  const handleFormChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSaveForm = () => {
    toast.success(`Form "${selectedDokumen.nama}" berhasil disimpan`)
    setSelectedDokumen(null)
    setFormData({})
  }

  // ─── Sprint 010 PBJ: upload invoice + 5 dokumen + deep-link BKU ──────────
  const [pbjForm, setPbjForm] = useState(muatPbjForm)
  const [invoiceMeta, setInvoiceMeta] = useState(() => storageHelper.get('pbj_invoice_meta', null))
  const [pbjTab, setPbjTab] = useState('perencanaan')
  const [pbjBadge, setPbjBadge] = useState('')
  const [pbjPesan, setPbjPesan] = useState('')
  const [pbjBku, setPbjBku] = useState(null)
  const [pbjBisaUrungkan, setPbjBisaUrungkan] = useState(() => bacaSnapshot() !== null)
  const [pbjReading, setPbjReading] = useState(false)
  const [pbjBarisAktif, setPbjBarisAktif] = useState(null)
  // ─── Task 57: daftar invoice (1 file = 1 baris) + baris ter-expand ──────
  const [pbjInvoices, setPbjInvoices] = useState(muatPbjInvoices)
  const [pbjExpand, setPbjExpand] = useState(null)
  const simpanInvoices = (list) => storageHelper.set('pbj_invoices', list)
  // ─── Sprint 011 B-01..B-08: mode SIPLAH + keranjang + chips + arsip + manual ──
  // modeSiplah persist spj_pbj_mode (default NON-SIPLAH per A4); toggle tak menghapus isian.
  // Resolved storage keys (prefix spj_ via storageHelper): spj_pbj_mode, spj_pbj_arsip,
  // spj_pbj_keranjang_tolak, spj_pbj_form, spj_pbj_invoices, spj_pbj_invoice_meta.
  const [modeSiplah, setModeSiplah] = useState(() => storageHelper.get('pbj_mode', 'non') === 'siplah' ? 'siplah' : 'non')
  const [pbjArsip, setPbjArsip] = useState(() => storageHelper.get('pbj_arsip', []))
  const [keranjangBuka, setKeranjangBuka] = useState(false)
  const [bkuCache, setBkuCache] = useState([])
  const [manualBuka, setManualBuka] = useState(false)
  const [manualForm, setManualForm] = useState({ uraian: '', qty: '', harga: '', tanggal: '', penyedia: '', noAcuan: '' })
  // ─── Task 66: ambil BKU Cari+centang — cari, filter tanggal, toggle baru, pilihan ──
  const [bkuCari, setBkuCari] = useState('')
  const [bkuDari, setBkuDari] = useState('')
  const [bkuSampai, setBkuSampai] = useState('')
  const [bkuHanyaBaru, setBkuHanyaBaru] = useState(true)
  const [bkuDipilih, setBkuDipilih] = useState({})
  const [bkuGrupBuka, setBkuGrupBuka] = useState({})
  const [arsipBuka, setArsipBuka] = useState(false)
  const simpanArsip = (list) => storageHelper.set('pbj_arsip', list)
  const [params] = useSearchParams()
  const pbjSectionRef = useRef(null)
  // ─── Task 67: fokus otomatis ke input Uraian saat form Manual dibuka ────
  // Klik tombol Manual wajib memindahkan fokus keyboard langsung ke input
  // pertama agar user tahu mode Manual aktif (scrollIntoView + focus ring).
  const manualUraianRef = useRef(null)
  useEffect(() => {
    if (!manualBuka) return
    const t = setTimeout(() => {
      const el = manualUraianRef.current
      if (!el) return
      try { el.scrollIntoView({ behavior: 'smooth', block: 'center' }) } catch { /* no-op */ }
      try { el.focus({ preventScroll: true }) } catch { el.focus() }
    }, 60)
    return () => clearTimeout(t)
  }, [manualBuka])

  // ─── Task 57: tabel = 1 invoice 1 baris (agregat). Klik baris -> form
  // tab Data + rows pesanan/nego terisi dari invoice itu + preview ikut
  // (tanpa snapshot agar Urungkan tetap milik upload/kosongkan, bukan klik).
  const pbjInvoicesRef = useRef(pbjInvoices)
  pbjInvoicesRef.current = pbjInvoices
  const handlePilihInvoiceRow = (idx) => {
    const inv = pbjInvoicesRef.current[idx]
    if (!inv) return
    const draf = drafDariInvoice(inv)
    setPbjForm((prev) => {
      const next = paksaFormDariInvoice(prev, draf)
      simpanPbj(next)
      return next
    })
    setPbjBarisAktif(idx)
    setPbjTab('data')
    toast.success(`Baris ${idx + 1} terisi ke form — panel preview ikut`)
  }
  const toggleExpandInvoice = (idx) => {
    setPbjExpand((prev) => (prev === idx ? null : idx))
  }

  const simpanPbj = (form, meta) => {
    storageHelper.set('pbj_form', form)
    if (meta !== undefined) storageHelper.set('pbj_invoice_meta', meta)
  }
  const updatePbj = (doc, key, value) => {
    setPbjForm((prev) => {
      const next = { ...prev, [doc]: { ...prev[doc], [key]: value } }
      simpanPbj(next)
      return next
    })
  }
  const updateNegoRow = (idx, key, value) => {
    setPbjForm((prev) => {
      const rows = (prev.nego.rows || []).map((r, i) => (i === idx ? { ...r, [key]: value } : r))
      const next = { ...prev, nego: { ...prev.nego, rows } }
      simpanPbj(next)
      return next
    })
  }
  const updatePesananRow = (idx, key, value) => {
    setPbjForm((prev) => {
      const rows = (prev.pesanan.rows || []).map((r, i) => (i === idx ? { ...r, [key]: value } : r))
      const next = { ...prev, pesanan: { ...prev.pesanan, rows } }
      simpanPbj(next)
      return next
    })
  }
  // ─── Sprint 011 B-01: toggle mode + simpan diam-diam lintas mode ──────────
  // Isian mode non-aktif dipersistensi tanpa dialog; kembali = round-trip lossless.
  const handleToggleMode = (mode) => {
    if (mode === modeSiplah) return
    simpanPbj(pbjFormRef.current)
    setModeSiplah(mode)
    storageHelper.set('pbj_mode', mode)
    if (mode === 'siplah') setPbjTab('perencanaan')
    toast.success(mode === 'siplah' ? 'Mode SIPLAH — hanya Perencanaan' : 'Mode NON-SIPLAH — keenam dokumen')
  }
  // ─── Task 66: ambil BKU Cari+centang — ganti keranjang+chips menumpuk ────
  // Satu panel: kolom cari NoBukti/uraian + filter tanggal + toggle
  // belum-berdokumen (default ON) + daftar ringkas grup per NoBukti
  // (buka-tutup) + centang pilih + Terima ke PBJ sekaligus.
  const muatKandidatBku = () => {
    try {
      const stored = storageHelper.get('bku_data', null)
      const tx = Array.isArray(stored?.transactions) ? stored.transactions : []
      setBkuCache(tx)
    } catch { setBkuCache([]) }
  }
  const bkuDenganStatus = (bkuCache || [])
    .filter((t) => t?.tipe === 'PEMBAYARAN')
    .map((tx) => ({ tx, sudah: isSudahBerdokumen(tx, pbjInvoices) }))
  const bkuTampil = bkuDenganStatus.filter(({ tx, sudah }) => {
    if (bkuHanyaBaru && sudah) return false
    const q = bkuCari.trim().toLowerCase()
    if (q && !(String(tx.noBukti || '').toLowerCase().includes(q) || String(tx.uraian || '').toLowerCase().includes(q))) return false
    const iso = isoBku(tx)
    if (bkuDari && iso && iso < bkuDari) return false
    if (bkuSampai && iso && iso > bkuSampai) return false
    return true
  })
  const bkuGrup = grupBkuPerNoBukti(bkuTampil.map((x) => x.tx))
  // ─── Task 68: nama kegiatan di baris grup sebelum dropdown — ambil dari
  // field kegiatan baris BKU (kodeKegiatan → nama referensi, fallback
  // kegiatan/kegiatanNama mentah); kosong = strip jujur '—'.
  const namaKegiatanTx = (tx = {}) => {
    const kode = String(tx.kodeKegiatan || '').trim()
    if (kode) {
      const nama = getNamaKegiatan(kode)
      const normal = kode.replace(/\.$/, '')
      if (nama && nama !== normal && nama !== '-') return nama
      return kode
    }
    const mentah = String(tx.kegiatanNama || tx.kegiatan || '').replace(/\s+/g, ' ').trim()
    return mentah || ''
  }
  const namaKegiatanGrup = (g) => {
    const daftar = [...new Set((g.items || []).map(namaKegiatanTx).filter(Boolean))]
    if (daftar.length === 0) return ''
    if (daftar.length === 1) return daftar[0]
    return `${daftar[0]} +${daftar.length - 1} lainnya`
  }
  const bkuGrupTerbuka = (key) => (bkuCari.trim() ? true : !!bkuGrupBuka[key])
  const toggleGrupBku = (key) => setBkuGrupBuka((p) => ({ ...p, [key]: !p[key] }))
  // Kunci pilihan = nomor baris BKU (unik per transaksi, stabil); kunci A1
  // (NoBukti) tetap dipakai untuk status sudah/belum-berdokumen. Tanpa ini,
  // dua transaksi se-NoBukti bertabrakan dalam satu kunci pilihan.
  const kunciPilih = (tx) => (tx?.row != null ? `row:${tx.row}` : kunciTransaksi(tx))
  const togglePilihTx = (tx) => {
    const k = kunciPilih(tx)
    setBkuDipilih((p) => {
      const n = { ...p }
      if (n[k]) delete n[k]
      else n[k] = tx
      return n
    })
  }
  const togglePilihGrup = (g) => {
    setBkuDipilih((p) => {
      const n = { ...p }
      const semua = g.items.every((t) => n[kunciPilih(t)])
      for (const t of g.items) {
        const k = kunciPilih(t)
        if (semua) delete n[k]
        else n[k] = t
      }
      return n
    })
  }
  const jmlDipilih = Object.keys(bkuDipilih).length
  const handleTerimaDipilih = () => {
    const arr = Object.values(bkuDipilih)
    if (arr.length === 0) { toast.info('Centang dulu transaksi BKU yang mau diterima'); return }
    const listBaru = [...pbjInvoices]
    arr.forEach((tx) => listBaru.push(bkuKePaketRow(tx, listBaru.length)))
    setPbjInvoices(listBaru)
    simpanInvoices(listBaru)
    setPbjBarisAktif(listBaru.length - 1)
    setPbjExpand(listBaru.length - 1)
    setBkuDipilih({})
    toast.success(`${arr.length} baris BKU diterima ke PBJ`)
  }
  // ─── Sprint 011 B-07: arsip halus (soft) + Kembalikan + Kosongkan ──────────
  const handleArsipkanInvoice = (idx) => {
    const { list, arsip } = arsipkanBaris(pbjInvoices, pbjArsip, idx)
    setPbjInvoices(list)
    simpanInvoices(list)
    setPbjArsip(arsip)
    simpanArsip(arsip)
    if (pbjBarisAktif === idx) setPbjBarisAktif(null)
    if (pbjExpand === idx) setPbjExpand(null)
    toast.success('Baris diarsipkan — bisa Dikembalikan')
  }
  const handleKembalikanArsip = (idx) => {
    const { list, arsip } = kembalikanBaris(pbjInvoices, pbjArsip, idx)
    setPbjInvoices(list)
    simpanInvoices(list)
    setPbjArsip(arsip)
    simpanArsip(arsip)
    toast.success('Baris dikembalikan ke tabel')
  }
  const handleKosongkanArsip = () => {
    setPbjArsip([])
    simpanArsip([])
    toast.success('Arsip dikosongkan')
  }
  // ─── Sprint 011 B-06: edit inline expand-row (autosave + toast) ────────────
  const updateInvoiceField = (idx, key, value) => {
    setPbjInvoices((prev) => {
      const next = prev.map((r, i) => (i === idx ? { ...r, [key]: value } : r))
      simpanInvoices(next)
      return next
    })
  }
  const updateInvoiceItem = (idx, itemIdx, key, value) => {
    setPbjInvoices((prev) => {
      const next = prev.map((r, i) => {
        if (i !== idx) return r
        const items = (r.items || []).map((it, j) => (j === itemIdx ? { ...it, [key]: value } : it))
        const total = items.reduce((s, it) => s + (Number(it.qty || 0) * Number(it.harga || 0) || Number(it.total || 0)), 0)
        return { ...r, items, grandTotal: total || r.grandTotal, alokasi: total || r.alokasi }
      })
      simpanInvoices(next)
      return next
    })
  }
  const simpanEditInline = () => toast.success('Perubahan baris tersimpan')
  // ─── Sprint 011 B-08: form Manual subset esensial A5, setara penuh ─────────
  const handleSubmitManual = () => {
    if (!String(manualForm.uraian || '').trim()) { toast.info('Uraian wajib diisi'); return }
    const row = manualKePaketRow({ uraian: manualForm.uraian, qty: manualForm.qty || 1, harga: manualForm.harga || 0, tanggalISO: manualForm.tanggal, penyedia: manualForm.penyedia, noAcuan: manualForm.noAcuan })
    const listBaru = [...pbjInvoices, row]
    setPbjInvoices(listBaru)
    simpanInvoices(listBaru)
    setPbjExpand(listBaru.length - 1)
    setPbjBarisAktif(listBaru.length - 1)
    setManualForm({ uraian: '', qty: '', harga: '', tanggal: '', penyedia: '', noAcuan: '' })
    setManualBuka(false)
    toast.success('Baris manual ditambahkan')
  }
  // ─── Panel PBJ konsisten LPJ: badge + Cek + Cetak gate ───────────────────
  // Kosong = semua field tab kosong + tanpa rows (jujur, bukan karangan).
  const pbjDocKosong = (docId) => {
    const tab = PBJ_TABS.find((t) => t.id === docId)
    const d = pbjForm[docId] || {}
    const fieldsKosong = (tab?.fields || []).every((f) => String(d[f.key] ?? '').trim() === '')
    const rowsKosong = !Array.isArray(d.rows) || d.rows.length === 0
    return fieldsKosong && rowsKosong
  }
  // Sprint 011 B-02: gate tab + badge + cetak + panel ikut mode (gateDocs).
  const { gateDocs } = terapkanMode(pbjForm, modeSiplah)
  const PBJ_TABS_TAMPIL = PBJ_TABS.filter((t) => gateDocs.includes(t.id))
  const handleCekPbj = () => {
    const daftar = PBJ_TABS.filter((t) => gateDocs.includes(t.id))
    const kosong = daftar.find((t) => pbjDocKosong(t.id))
    if (!kosong) { toast.success('Lengkap — siap cetak'); return }
    setPbjTab(kosong.id)
    toast.info(`Dilengkapi: ${kosong.label}`)
  }
  const handleCetakPbj = () => {
    snapshotSebelumTimpa(pbjFormRef.current, PBJ_DOCS, invoiceMeta?.nomorInvoice || '')
    setPbjBisaUrungkan(true)
    window.print()
  }
  const handleClosePbj = () => {
    setSelectedDokumen(null)
    setSelectedCategory(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const pbjFormRef = useRef(pbjForm)
  pbjFormRef.current = pbjForm
  const handleUploadPbj = async (file) => {
    if (!file || pbjReading) return
    // Task 57: APPEND — upload menambah 1 baris (invoice lama dipertahankan).
    // Snapshot form + backup invoices SEBELUM tambah agar bisa Urungkan.
    try { snapshotSebelumTimpa(pbjFormRef.current, PBJ_DOCS, pbjFormRef.current?.data?.noBukti || invoiceMeta?.nomorInvoice || file.name) } catch { /* snapshot best-effort */ }
    try { storageHelper.set('pbj_invoices_snapshot', pbjInvoicesRef.current) } catch { /* backup best-effort */ }
    setPbjBisaUrungkan(true)
    setPbjPesan('Membaca invoice…')
    setPbjReading(true)
    try {
      const pdfjsLib = await import('pdfjs-dist/build/pdf')
      pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl
      const buf = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: buf }).promise
      const { extractTables, extractAllText } = await import('../../utils/pdfTableExtractor')
      const hasil = await extractTables(pdf, { maxPages: pdf.numPages })
      let teks = hasil.tableText || ''
      try { teks += `\n${await extractAllText(pdf)}` } catch { /* tabel saja cukup */ }
      const draf = parseInvoiceSIPLah({ cleanText: teks, tables: hasil.tables })
      if (!draf.cocok) {
        // Gagal parse -> baris TIDAK bertambah, tabel lama utuh (jujur).
        setPbjPesan('Tidak terbaca otomatis — silakan isi manual.')
        return
      }
      // Tambah 1 baris + form mengikuti invoice terbaru (snapshot sudah diambil).
      const rec = drafKeInvoice(draf, file.name)
      const listBaru = [...pbjInvoicesRef.current, rec]
      setPbjInvoices(listBaru)
      simpanInvoices(listBaru)
      const meta = { namaFile: file.name, tanggalUpload: new Date().toISOString(),
        nomorInvoice: draf.nomorInvoice || '', grandTotal: draf.grandTotal || 0 }
      setInvoiceMeta(meta)
      setPbjForm((prev) => {
        const next = paksaFormDariInvoice(prev, draf)
        simpanPbj(next, meta)
        return next
      })
      setPbjBarisAktif(listBaru.length - 1)
      setPbjExpand(listBaru.length - 1)
      setPbjPesan('')
      setPbjBadge(`Terbaca ${draf.items.length} item · Rp ${(draf.grandTotal || 0).toLocaleString('id-ID')} · baris ${listBaru.length}`)
      toast.success('Invoice terbaca — 1 baris ditambahkan')
    } catch {
      // Exception -> baris TIDAK bertambah, tabel lama utuh + pesan jujur.
      setPbjPesan('Gagal membaca PDF — silakan isi manual.')
    } finally {
      setPbjReading(false)
    }
  }

  const handleUrungkanPbj = () => {
    const { nilai } = urungkanTimpa()
    if (!nilai) { toast.info('Tidak ada snapshot untuk diurungkan'); return }
    const next = { ...pbjFormKosong() }
    for (const k of PBJ_DOCS) next[k] = { ...next[k], ...(nilai?.[k] || {}) }
    setPbjForm(next)
    simpanPbj(next)
    // Task 57: kembalikan juga daftar invoice (baris yang sempat ditambah).
    const cad = storageHelper.get('pbj_invoices_snapshot', null)
    if (Array.isArray(cad)) {
      setPbjInvoices(cad)
      simpanInvoices(cad)
    }
    setPbjBisaUrungkan(false)
    setPbjBadge('')
    setPbjPesan('')
    setPbjBarisAktif(null)
    setPbjExpand(null)
    toast.info('Isian otomatis dibatalkan')
  }

  // ─── Task 55+57: tombol manual "Kosongkan Tabel" — snapshot dulu (bisa
  // Urungkan), lalu reset tabel (0 baris) + form + state turunan.
  const handleKosongkanTabelPbj = () => {
    if (pbjReading) return
    try { snapshotSebelumTimpa(pbjFormRef.current, PBJ_DOCS, pbjFormRef.current?.data?.noBukti || invoiceMeta?.nomorInvoice || 'manual') } catch { /* snapshot best-effort */ }
    try { storageHelper.set('pbj_invoices_snapshot', pbjInvoicesRef.current) } catch { /* backup best-effort */ }
    setPbjBisaUrungkan(true)
    const kosong = pbjFormKosong()
    setPbjForm(kosong)
    simpanPbj(kosong, null)
    setPbjInvoices([])
    simpanInvoices([])
    setInvoiceMeta(null)
    setPbjBadge('')
    setPbjPesan('Tabel dikosongkan — silakan isi manual atau upload ulang.')
    setPbjBku(null)
    setPbjBarisAktif(null)
    setPbjExpand(null)
    toast.info('Tabel PBJ dikosongkan — bisa Urungkan')
  }

  // Deep-link BKU → prefill PBJ (pola 005: snapshot + badge + Urungkan).
  useEffect(() => {
    const st = location.state
    if (!st?.fromBKU || !st?.transaksi) return
    if (st.dok !== 'PBJ' && params.get('dok') !== 'PBJ') return
    if (!st.ts || Date.now() - st.ts > 10 * 60 * 1000) {
      navigate(`${location.pathname}?dok=PBJ`, { replace: true })
      return
    }
    const tr = st.transaksi
    snapshotSebelumTimpa(pbjFormRef.current, PBJ_DOCS, tr.noBukti || '')
    setPbjBisaUrungkan(true)
    const { formBaru, tertimpa } = terapkanPrefillPbj(pbjFormRef.current, { bku: tr })
    setPbjForm(formBaru)
    simpanPbj(formBaru)
    setPbjBku({ ...tr, tertimpa: tertimpa.length })
    // Buka accordion PBJ di bawah card Dokumen PBJ (bukan modal).
    const catSiplah = CATEGORIES.find((c) => c.id === 'siplah')
    const dokPbj = catSiplah?.items.find((i) => i.id === 'PBJ')
    if (dokPbj) { setSelectedDokumen(dokPbj); setSelectedCategory(catSiplah) }
    if (tertimpa.length > 0) toast.info(`${tertimpa.length} field ditimpa dari BKU — bisa Urungkan`)
    else toast.success('Dibuka dari BKU — form PBJ siap diisi')
    navigate(`${location.pathname}?dok=PBJ`, { replace: true })
    setTimeout(() => pbjSectionRef.current?.scrollIntoView({ block: 'start' }), 150)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const pbjDocsList = pbjDocs(pbjForm, modeSiplah)
  const pbjAktif = selectedDokumen?.id === 'PBJ'
  const pbjKosong = PBJ_TABS_TAMPIL.filter((t) => {
    const d = pbjForm[t.id] || {}
    const fk = (t.fields || []).every((f) => String(d[f.key] ?? '').trim() === '')
    return fk && (!Array.isArray(d.rows) || d.rows.length === 0)
  }).length
  const pbjRingkasan = PBJ_TABS_TAMPIL.map((t) => {
    const d = pbjForm[t.id] || {}
    const terisi = Object.entries(d).filter(([k, v]) => k !== 'rows' && String(v ?? '').trim() !== '').length
    const nItem = Array.isArray(d.rows) ? d.rows.length : 0
    return { ...t, terisi, nItem, lengkap: terisi > 0 }
  })

  // ─── Filtered Categories ─────────────────────────────────────────────────
  // Sprint 011 B-01/B-02: card Dokumen PBJ selalu tampil; toggle SIPLAH/NON-SIPLAH
  // hanya mengatur TAB di dalam detail PBJ (SIPLAH = Perencanaan saja, 5 tab lain
  // HILANG bukan disabled) + gate badge/cetak/panel. Isian tak pernah dihapus.

  const filteredCategories = CATEGORIES

  // ─── Detail PBJ: accordion di bawah card Dokumen PBJ, split-view LPJ ─────
  // Kiri = form (Zona A), kanan = Panel Preview Document sticky (Zona B)
  // dengan tombol lengkap: PaperSize + Cek + Cetak + zoom + fullscreen.
  const renderPbjDetail = () => (
    <section ref={pbjSectionRef} id="pbj-section" aria-label="Kelengkapan PBJ — semua pengadaan"
      className="relative mt-2 mb-8 w-full max-w-none bg-gradient-to-br from-white via-primary/[0.04] to-blue-50/40 rounded-3xl border border-primary/20 shadow-xl shadow-primary/10 overflow-x-clip">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-blue-400 to-primary" />
      <div className="relative p-5 sm:p-7 lg:p-9 space-y-5">
        {/* ─── Revisi UX 011-65: tombol Kembali di atas (sticky) agar tanpa scroll ─── */}
        <div className="print:hidden sticky top-[88px] z-30 -mx-5 sm:-mx-7 lg:-mx-9 -mt-5 sm:-mt-7 lg:-mt-9 px-5 sm:px-7 lg:px-9 py-2.5 bg-white/95 backdrop-blur border-b border-slate-200/90 flex items-center gap-2" role="navigation" aria-label="Navigasi atas Kelengkapan PBJ">
          <button onClick={handleClosePbj}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 min-h-[44px] transition-all">
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Kembali ke Daftar
          </button>
          <span className="text-[11px] text-slate-400 hidden sm:inline">Kelengkapan PBJ — semua pengadaan</span>
        </div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/30">
              <span className="material-symbols-outlined text-2xl text-white">folder_shared</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-wider">
                Kelengkapan PBJ
              </span>
              <h2 className="text-sm font-bold text-slate-800 mt-1.5">Kelengkapan PBJ — semua pengadaan</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">Upload invoice sekali → terbaca otomatis → lengkapi dokumen → cetak.</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={handleClosePbj} aria-label="Minimalkan kembali ke daftar dokumen"
              title="Minimalkan"
              className="p-2.5 rounded-xl hover:bg-slate-100 transition-all duration-300 hover:scale-110 active:scale-95">
              <span className="material-symbols-outlined text-slate-400 hover:text-slate-600">minimize</span>
            </button>
            <button onClick={handleClosePbj} aria-label="Tutup detail PBJ"
              className="p-2.5 rounded-xl hover:bg-slate-100 transition-all duration-300 hover:scale-110 active:scale-95">
              <span className="material-symbols-outlined text-slate-400 hover:text-slate-600">close</span>
            </button>
          </div>
        </div>
        {/* ─── Sprint 011 B-01: toggle SIPLAH/NON-SIPLAH (print:hidden) ─── */}
        <div className="print:hidden w-full max-w-none bg-white rounded-2xl border border-slate-200/90 shadow-sm px-5 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center gap-3" role="group" aria-label="Mode pengadaan PBJ">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Mode pengadaan</span>
          <div className="flex items-center gap-1.5 bg-slate-100 rounded-xl p-1" role="switch" aria-checked={modeSiplah === 'siplah'} aria-label="Toggle SIPLAH NON-SIPLAH" tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleToggleMode(modeSiplah === 'siplah' ? 'non' : 'siplah') } }}>
            <button onClick={() => handleToggleMode('non')} aria-pressed={modeSiplah === 'non'}
              className={`px-4 py-2 rounded-lg text-xs font-bold min-h-[44px] transition-all ${modeSiplah === 'non' ? 'bg-primary text-white shadow' : 'text-slate-600 hover:text-slate-800'}`}>
              NON-SIPLAH
            </button>
            <button onClick={() => handleToggleMode('siplah')} aria-pressed={modeSiplah === 'siplah'}
              className={`px-4 py-2 rounded-lg text-xs font-bold min-h-[44px] transition-all ${modeSiplah === 'siplah' ? 'bg-primary text-white shadow' : 'text-slate-600 hover:text-slate-800'}`}>
              SIPLAH
            </button>
          </div>
          <span className="text-[11px] text-slate-500" aria-live="polite">{modeSiplah === 'siplah' ? 'SIPLAH — hanya tab Perencanaan + cetak 1 dokumen' : 'NON-SIPLAH — keenam dokumen seperti biasa'}</span>
        </div>
        {/* ─── Sprint 011 B-03: command-bar satu pintu (print:hidden) ─── */}
        <div className="print:hidden w-full max-w-none bg-white rounded-2xl border border-slate-200/90 shadow-sm px-5 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-wrap items-center gap-2" role="toolbar" aria-label="Sumber baris PBJ — satu pintu">
            <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all cursor-pointer min-h-[44px]">
              <span className="material-symbols-outlined text-lg">upload_file</span>
              {pbjReading ? 'Membaca…' : 'Upload PDF'}
              <input type="file" accept="application/pdf,.pdf" className="hidden" disabled={pbjReading}
                onChange={(e) => { handleUploadPbj(e.target.files?.[0]); e.target.value = '' }} />
            </label>
            <button onClick={() => { muatKandidatBku(); setKeranjangBuka((v) => !v) }} aria-expanded={keranjangBuka}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-700 border border-slate-200 text-sm font-semibold hover:bg-slate-50 active:scale-[0.98] transition-all min-h-[44px]">
              <span className="material-symbols-outlined text-lg">inbox</span>
              Dari BKU
            </button>
            <button onClick={() => setManualBuka((v) => !v)} aria-expanded={manualBuka}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-700 border border-slate-200 text-sm font-semibold hover:bg-slate-50 active:scale-[0.98] transition-all min-h-[44px]">
              <span className="material-symbols-outlined text-lg">edit_note</span>
              Manual
            </button>
            <button onClick={handleKosongkanTabelPbj} disabled={pbjReading} aria-label="Kosongkan Tabel PBJ"
              title="Kosongkan tabel + form PBJ (bisa Urungkan)"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-700 border border-slate-200 text-sm font-semibold hover:bg-slate-50 active:scale-[0.98] transition-all min-h-[44px] disabled:opacity-50">
              <span className="material-symbols-outlined text-lg">delete_sweep</span>
              Kosongkan Tabel
            </button>
            {pbjBisaUrungkan && (
              <button onClick={handleUrungkanPbj} className="px-4 py-2.5 rounded-xl bg-white text-slate-700 border border-slate-200 text-sm font-semibold hover:bg-slate-50 min-h-[44px]">
                Urungkan
              </button>
            )}
            <span className="text-[11px] text-slate-500 ml-1">Klik baris tabel untuk mengisi form otomatis (tetap bisa diedit).</span>
          </div>
          <div aria-live="polite" className="mt-2 space-y-1">
            {pbjBadge && <p className="text-xs font-semibold text-slate-700">✓ {pbjBadge}</p>}
            {pbjPesan && <p className="text-xs text-slate-500">{pbjPesan}</p>}
            {invoiceMeta && <p className="text-[11px] text-slate-400">Arsip: {invoiceMeta.namaFile} · {invoiceMeta.nomorInvoice || 'tanpa nomor'} · Rp {(invoiceMeta.grandTotal || 0).toLocaleString('id-ID')}</p>}
            {pbjBku && <p className="text-[11px] text-slate-500">dari BKU · {pbjBku.noBukti || '-'} · Rp {(pbjBku.nominal || 0).toLocaleString('id-ID')} · {pbjBku.tertimpa} field ditimpa</p>}
            {pbjBarisAktif != null && pbjInvoices[pbjBarisAktif] && <p className="text-[11px] text-slate-500">Baris {pbjBarisAktif + 1} terpilih — form tab Data terisi + panel preview ikut.</p>}
          </div>
        </div>
        {/* ─── Task 66: ambil BKU Cari+centang — ganti chips+keranjang menumpuk (print:hidden) ───
            Kolom cari NoBukti/uraian + filter tanggal + toggle belum-berdokumen
            (default ON) + daftar ringkas grup per NoBukti (buka-tutup) +
            centang pilih + Terima ke PBJ sekaligus. */}
        {keranjangBuka && (
          <div className="print:hidden w-full max-w-none bg-white rounded-2xl border border-slate-200/90 shadow-sm px-5 sm:px-6 lg:px-8 py-4" aria-label="Ambil dari BKU — cari dan centang">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Ambil dari BKU — cari + centang · {bkuTampil.length} cocok · {bkuGrup.length} No. Bukti</p>
              <button onClick={() => setKeranjangBuka(false)} className="text-xs font-semibold text-slate-500 hover:text-slate-700 min-h-[44px] px-2">Tutup</button>
            </div>
            <div className="grid sm:grid-cols-[minmax(0,1fr)_auto_auto] gap-2 mb-2">
              <label className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-xl bg-white min-h-[44px]">
                <span className="material-symbols-outlined text-slate-400 text-lg">search</span>
                <input type="search" aria-label="Cari No. Bukti atau uraian BKU" placeholder="Cari No. Bukti / uraian…" value={bkuCari}
                  onChange={(e) => setBkuCari(e.target.value)}
                  className="w-full text-sm outline-none placeholder:text-slate-400" />
              </label>
              <label className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-600 min-h-[44px]">
                Dari
                <input type="date" aria-label="Filter tanggal dari" value={bkuDari} onChange={(e) => setBkuDari(e.target.value)} className="text-xs outline-none" />
              </label>
              <label className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-600 min-h-[44px]">
                Sampai
                <input type="date" aria-label="Filter tanggal sampai" value={bkuSampai} onChange={(e) => setBkuSampai(e.target.value)} className="text-xs outline-none" />
              </label>
            </div>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 mb-3 cursor-pointer min-h-[32px]">
              <input type="checkbox" checked={bkuHanyaBaru} onChange={(e) => setBkuHanyaBaru(e.target.checked)} className="w-4 h-4 accent-[#004ac6]" />
              Hanya yang belum berdokumen {bkuHanyaBaru ? '(aktif)' : '(mati — tampil semua)'}
            </label>
            {bkuCache.length === 0 ? (
              <p className="text-xs text-slate-500 border border-dashed border-slate-200 rounded-lg px-4 py-6 text-center">Belum ada data BKU — upload BKU Excel dulu di halaman Data BKU.</p>
            ) : bkuGrup.length === 0 ? (
              <p className="text-xs text-slate-500 border border-dashed border-slate-200 rounded-lg px-4 py-6 text-center">Tidak cocok — ubah kata kunci, rentang tanggal, atau matikan toggle belum-berdokumen.</p>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1" role="list" aria-label="Daftar No. Bukti BKU">
                {bkuGrup.map((g) => {
                  const terbuka = bkuGrupTerbuka(g.key)
                  const terpilih = g.items.filter((t) => bkuDipilih[kunciPilih(t)]).length
                  const semua = terpilih === g.items.length
                  const sebagian = terpilih > 0 && !semua
                  const sudahSemua = g.items.every((t) => isSudahBerdokumen(t, pbjInvoices))
                  return (
                    <div key={g.key} role="listitem" className="border border-slate-200 rounded-xl overflow-hidden">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50/70">
                        <input type="checkbox" aria-label={`Pilih semua transaksi ${g.noBukti}`}
                          checked={semua} ref={(el) => { if (el) el.indeterminate = sebagian }}
                          onChange={() => togglePilihGrup(g)} className="w-4 h-4 shrink-0 accent-[#004ac6]" />
                        <button onClick={() => toggleGrupBku(g.key)} aria-expanded={terbuka}
                          aria-label={terbuka ? `Tutup rincian ${g.noBukti}` : `Buka rincian ${g.noBukti}`}
                          className="flex-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-left min-h-[44px]">
                          <span className="material-symbols-outlined text-slate-400 text-lg transition-transform" style={{ transform: terbuka ? 'rotate(90deg)' : 'none' }}>chevron_right</span>
                          <span className="text-xs font-bold text-slate-800 font-mono">{g.noBukti}</span>
                          <span className="text-[11px] text-slate-600 truncate max-w-[280px]" title={namaKegiatanGrup(g) || '—'}>· {namaKegiatanGrup(g) || '—'}</span>
                          <span className="text-[11px] text-slate-500">{g.items.length} transaksi · Rp {Number(g.total || 0).toLocaleString('id-ID')}</span>
                          {terpilih > 0 && <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{terpilih}/{g.items.length} dipilih</span>}
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sudahSemua ? 'bg-slate-100 text-slate-500' : 'bg-primary/10 text-primary'}`}>{sudahSemua ? 'Sudah berdokumen' : 'Belum berdokumen'}</span>
                        </button>
                      </div>
                      {terbuka && (
                        <ul className="divide-y divide-slate-100">
                          {g.items.map((tx, ti) => {
                            const k = kunciPilih(tx)
                            const cek = !!bkuDipilih[k]
                            return (
                              <li key={k + ti}>
                                <label className={`flex items-start gap-2.5 px-3 py-2 cursor-pointer min-h-[44px] ${cek ? 'bg-primary/[0.05]' : 'hover:bg-slate-50'}`}>
                                  <input type="checkbox" checked={cek} onChange={() => togglePilihTx(tx)}
                                    aria-label={`Pilih ${tx.noBukti || 'transaksi'} — ${String(tx.uraian || '').slice(0, 50)}`}
                                    className="w-4 h-4 mt-0.5 shrink-0 accent-[#004ac6]" />
                                  <span className="flex-1 min-w-0">
                                    <span className="block text-xs text-slate-700 leading-snug">{tx.uraian || '(tanpa uraian)'}</span>
                                    <span className="block text-[11px] text-slate-500 mt-0.5">Kegiatan: {namaKegiatanTx(tx) || '—'}</span>
                                    <span className="block text-[11px] text-slate-400 mt-0.5">{tx.tanggalStr || isoBku(tx) || '-'} · Rp {Number(nominalBku(tx) || 0).toLocaleString('id-ID')}</span>
                                  </span>
                                </label>
                              </li>
                            )
                          })}
                        </ul>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <button onClick={handleTerimaDipilih} disabled={jmlDipilih === 0}
                className="px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-bold min-h-[44px] disabled:opacity-40 active:scale-[0.98] transition-all">
                Terima ke PBJ ({jmlDipilih})
              </button>
              {jmlDipilih > 0 && (
                <button onClick={() => setBkuDipilih({})} className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-700 min-h-[44px]">
                  Bersihkan pilihan
                </button>
              )}
              <span className="text-[11px] text-slate-500 ml-1">Centang grup/No. Bukti atau per transaksi — hanya yang dicentang yang masuk Tabel Data.</span>
            </div>
          </div>
        )}
        {/* ─── Sprint 011 B-08 + Revisi UX 011-65: panduan Manual + form subset A5 (print:hidden) ─── */}
        {manualBuka && (
          <div className="print:hidden w-full max-w-none bg-white rounded-2xl border border-slate-200/90 shadow-sm px-5 sm:px-6 lg:px-8 py-4" aria-label="Form manual PBJ">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Manual — subset esensial (kolom lain tampil ‘-’)</p>
            {/* ─── 011-65(a): panduan langkah jelas — selalu tampil saat form manual dibuka ─── */}
            <div className="mb-3 rounded-xl border border-primary/20 bg-primary/[0.04] px-4 py-3" role="note" aria-label="Panduan isi manual">
              {pbjInvoices.length === 0 && (
                <p className="text-xs text-slate-600 mb-2">Belum ada baris manual — ikuti 3 langkah di bawah untuk menambah baris pertama ke Tabel Data.</p>
              )}
              <ol className="list-decimal ml-4 space-y-1 text-xs text-slate-700">
                <li><strong>Langkah 1</strong> — Isi <strong>Uraian (wajib)</strong> + Qty &amp; Harga satuan.</li>
                <li><strong>Langkah 2</strong> — Lengkapi Tanggal + Penyedia + Nomor acuan.</li>
                <li><strong>Langkah 3</strong> — Klik <strong>“Simpan baris manual”</strong> — baris masuk Tabel Data &amp; form tab Data terisi otomatis.</li>
              </ol>
              <p className="mt-2 text-[11px] text-slate-500">Contoh 6 field — Uraian: “Kertas HVS A4 80gr” · Qty: 10 · Harga satuan: Rp 55.000 · Tanggal: hari nota · Penyedia: “Toko Barokah” · Nomor acuan: “NOTA-001”. Kolom lain otomatis tampil ‘-’ di tabel 15 kolom.</p>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              <div><label className="block text-xs font-medium text-slate-700 mb-1">Uraian *</label><input ref={manualUraianRef} type="text" value={manualForm.uraian} onChange={(e) => setManualForm((p) => ({ ...p, uraian: e.target.value }))} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 min-h-[44px]" /></div>
              <div><label className="block text-xs font-medium text-slate-700 mb-1">Qty</label><input type="number" value={manualForm.qty} onChange={(e) => setManualForm((p) => ({ ...p, qty: e.target.value }))} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-primary min-h-[44px]" /></div>
              <div><label className="block text-xs font-medium text-slate-700 mb-1">Harga satuan (Rp)</label><input type="number" value={manualForm.harga} onChange={(e) => setManualForm((p) => ({ ...p, harga: e.target.value }))} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-primary min-h-[44px]" /></div>
              <div><label className="block text-xs font-medium text-slate-700 mb-1">Tanggal</label><input type="date" value={manualForm.tanggal} onChange={(e) => setManualForm((p) => ({ ...p, tanggal: e.target.value }))} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-primary min-h-[44px]" /></div>
              <div><label className="block text-xs font-medium text-slate-700 mb-1">Penyedia</label><input type="text" value={manualForm.penyedia} onChange={(e) => setManualForm((p) => ({ ...p, penyedia: e.target.value }))} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-primary min-h-[44px]" /></div>
              <div><label className="block text-xs font-medium text-slate-700 mb-1">Nomor acuan</label><input type="text" value={manualForm.noAcuan} onChange={(e) => setManualForm((p) => ({ ...p, noAcuan: e.target.value }))} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-primary min-h-[44px]" /></div>
            </div>
            <div className="flex justify-end gap-2 mt-3">
              <button onClick={() => setManualBuka(false)} className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-700 min-h-[44px]">Batal</button>
              <button onClick={handleSubmitManual} className="px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-bold min-h-[44px]">Simpan baris manual</button>
            </div>
          </div>
        )}
        {/* ─── Task 58: tabel premium full-width, wrap natural, tanpa scroll vertical ───
            15 kolom persis sheet + 1 kolom expand. Kontainer hanya overflow-x
            (horizontal muncul bila viewport sempit); TIDAK ada max-h /
            overflow-y sehingga semua baris terlihat penuh secara vertikal. */}
        <div className="w-full max-w-none bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-5 sm:px-6 lg:px-8 pt-5 pb-3">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tabel Data — isi invoice PDF</p>
            <span className="text-[11px] font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">{pbjInvoices.length} baris · 15 kolom persis sheet</span>
          </div>
          <div className="px-5 sm:px-6 lg:px-8 pb-5 overflow-x-auto overflow-y-visible max-w-full min-w-0 [contain:inline-size]">
            {pbjInvoices.length === 0 ? (
              <p className="text-xs text-slate-500 border border-dashed border-slate-200 rounded-lg px-4 py-6 text-center">Belum ada data — upload invoice PDF atau isi manual. Kosongkan Tabel mengosongkan tabel ini (bisa Urungkan).</p>
            ) : (
            <table className="w-full text-[11px] leading-snug border border-slate-200 rounded-xl overflow-hidden min-w-[1080px]">
              <thead><tr className="bg-primary text-white">
                <th className="px-2 py-2 w-10 font-bold" aria-label="Buka rincian item"><span className="sr-only">Rincian</span></th>
                {PBJ_SHEET_COLUMNS.map((c) => (
                  <th key={c.key} className={`px-2 py-2 font-bold text-[10px] uppercase tracking-wide ${c.key === 'alokasi' ? 'text-right' : 'text-left'}`}>{c.label}</th>
                ))}
              </tr></thead>
              <tbody>
                {pbjInvoices.map((inv, i) => {
                  const row = invoiceKeSheetRow(inv, i)
                  const terbuka = pbjExpand === i
                  return (
                    <Fragment key={inv.id || i}>
                    <tr onClick={() => handlePilihInvoiceRow(i)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handlePilihInvoiceRow(i) } }}
                      tabIndex={0} title={`Isi form dari baris ${i + 1} (${inv.items.length} item)`}
                      className={`border-t border-slate-100 cursor-pointer hover:bg-primary/5 focus:bg-primary/5 focus:outline-none ${pbjBarisAktif === i ? 'bg-primary/10' : ''}`}>
                      <td className="px-2 py-2 text-center align-top">
                        <button onClick={(e) => { e.stopPropagation(); toggleExpandInvoice(i) }}
                          aria-expanded={terbuka} aria-label={terbuka ? `Tutup rincian baris ${i + 1}` : `Buka rincian ${inv.items.length} item baris ${i + 1}`}
                          title={`${inv.items.length} item — klik untuk ${terbuka ? 'tutup' : 'lihat'}`}
                          className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-slate-200 text-slate-600 hover:bg-primary/10 hover:text-primary hover:border-primary/30 min-w-[28px]">
                          <span className="material-symbols-outlined text-base" style={{ transform: terbuka ? 'rotate(90deg)' : 'none' }}>chevron_right</span>
                        </button>
                      </td>
                      {PBJ_SHEET_COLUMNS.map((c) => {
                        const wrap = c.key === 'spesifikasi' || c.key === 'alamat' || c.key === 'linkSiplah' || c.key === 'namaPenyedia' || c.key === 'direktur'
                        return (
                        <td key={c.key} className={`px-2 py-2 align-top ${c.key === 'alokasi' ? 'text-right whitespace-nowrap' : wrap ? 'whitespace-normal break-words min-w-[120px] max-w-[220px]' : 'whitespace-nowrap'}`}
                          title={c.key === 'alokasi' ? undefined : String(row[c.key] ?? '')}>
                          {c.key === 'alokasi' ? Number(row.alokasi || 0).toLocaleString('id-ID') : row[c.key]}
                        </td>
                        )
                      })}
                    </tr>
                    {terbuka && (
                    <tr className="border-t border-primary/10 bg-primary/[0.03]">
                      <td />
                      <td colSpan={PBJ_SHEET_COLUMNS.length} className="px-2 py-2">
                        {/* ─── Task 66 lanjutan: nama kegiatan lengkap di baris
                            sebelum dropdown — user tahu ini kegiatan apa
                            (mamin apa / pembelian ATK bulan apa) ─── */}
                        <p className="text-[11px] font-bold text-slate-600">Rincian {inv.items.length} barang/jasa — {inv.nomor || inv.namaFile || `baris ${i + 1}`}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {(inv.tanggalISO ? tanggalPanjang(inv.tanggalISO) : (inv.tanggalTampil || '-'))}
                          {(inv.bulan || bulanDariISOPbj(inv.tanggalISO)) ? ` · ${inv.bulan || bulanDariISOPbj(inv.tanggalISO)}` : ''}
                          {inv.namaPenyedia ? ` · ${inv.namaPenyedia}` : ''}
                          {inv.sumber ? ` · sumber ${inv.sumber}` : (inv.namaFile ? ` · ${inv.namaFile}` : '')}
                          {` · Rp ${Number(inv.grandTotal || inv.alokasi || 0).toLocaleString('id-ID')}`}
                        </p>
                        <p className="text-xs text-slate-700 leading-snug mt-1 mb-1.5">Kegiatan: {(inv.items || []).map((it) => it.uraian).filter(Boolean).join('; ') || inv.spesifikasi || '-'}</p>
                        <table className="w-full text-xs border border-slate-200 rounded-lg overflow-hidden bg-white">
                          <thead><tr className="bg-slate-50 text-slate-500">
                            <th className="px-2 py-1.5 text-left">No</th>
                            <th className="px-2 py-1.5 text-left">Nama Barang/Jasa</th>
                            <th className="px-2 py-1.5 text-right">Qty</th>
                            <th className="px-2 py-1.5 text-right">Harga Satuan</th>
                            <th className="px-2 py-1.5 text-right">Total</th>
                          </tr></thead>
                          <tbody>
                            {inv.items.map((it, j) => (
                              <tr key={j} className="border-t border-slate-100">
                                <td className="px-2 py-1.5">{j + 1}</td>
                                <td className="px-2 py-1.5"><input type="text" aria-label={`Uraian baris ${i + 1} item ${j + 1}`} value={it.uraian || ''} onChange={(e) => updateInvoiceItem(i, j, 'uraian', e.target.value)} onBlur={simpanEditInline} className="w-full min-w-[140px] px-2 py-1 text-xs border border-slate-200 rounded-lg outline-none focus:border-primary" /></td>
                                <td className="px-2 py-1.5"><input type="number" aria-label={`Qty baris ${i + 1} item ${j + 1}`} value={it.qty ?? ''} onChange={(e) => updateInvoiceItem(i, j, 'qty', e.target.value)} onBlur={simpanEditInline} className="w-20 px-2 py-1 text-xs text-right border border-slate-200 rounded-lg outline-none focus:border-primary" /></td>
                                <td className="px-2 py-1.5"><input type="number" aria-label={`Harga baris ${i + 1} item ${j + 1}`} value={it.harga ?? ''} onChange={(e) => updateInvoiceItem(i, j, 'harga', e.target.value)} onBlur={simpanEditInline} className="w-28 px-2 py-1 text-xs text-right border border-slate-200 rounded-lg outline-none focus:border-primary" /></td>
                                <td className="px-2 py-1.5 text-right whitespace-nowrap">{Number(it.total || 0).toLocaleString('id-ID')}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <button onClick={() => handlePilihInvoiceRow(i)}
                            className="px-3.5 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 active:scale-[0.98] transition-all min-h-[36px]">
                            Isi form dari invoice ini
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleArsipkanInvoice(i) }} aria-label={`Arsipkan baris ${i + 1}`}
                            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 active:scale-[0.98] transition-all min-h-[36px]">
                            Arsipkan
                          </button>
                        </div>
                        <div className="mt-2 grid sm:grid-cols-3 gap-2">
                          <label className="text-[11px] text-slate-500">No. acuan<input type="text" value={inv.nomor || ''} onChange={(e) => updateInvoiceField(i, 'nomor', e.target.value)} onBlur={simpanEditInline} className="mt-0.5 w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-primary" /></label>
                          <label className="text-[11px] text-slate-500">Penyedia<input type="text" value={inv.namaPenyedia || ''} onChange={(e) => updateInvoiceField(i, 'namaPenyedia', e.target.value)} onBlur={simpanEditInline} className="mt-0.5 w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-primary" /></label>
                          <label className="text-[11px] text-slate-500">Tanggal<input type="date" value={inv.tanggalISO || ''} onChange={(e) => updateInvoiceField(i, 'tanggalISO', e.target.value)} onBlur={simpanEditInline} className="mt-0.5 w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-primary" /></label>
                        </div>
                      </td>
                    </tr>
                    )}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
            )}
          </div>
        </div>
        {/* ─── Sprint 011 B-07: panel arsip halus tertutup default (print:hidden) ─── */}
        <div className="print:hidden w-full max-w-none bg-white rounded-2xl border border-slate-200/90 shadow-sm px-5 sm:px-6 lg:px-8 py-4" aria-label="Arsip baris PBJ">
          <button onClick={() => setArsipBuka((v) => !v)} aria-expanded={arsipBuka} className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider min-h-[44px]">
            <span className="material-symbols-outlined text-base">archive</span>
            Arsip ({pbjArsip.length} baris){arsipBuka ? ' — tutup' : ' — buka'}
          </button>
          {arsipBuka && (
            <div className="mt-2 space-y-2">
              {pbjArsip.length === 0 ? (
                <p className="text-xs text-slate-500">Arsip kosong — baris yang diarsipkan bisa dikembalikan 100%.</p>
              ) : (
                <>
                  {pbjArsip.map((r, ai) => (
                    <div key={r.id || ai} className="flex flex-wrap items-center gap-2 border border-slate-200 rounded-xl px-3 py-2">
                      <span className="text-xs text-slate-700 font-semibold">{r.nomor || '(tanpa nomor)'} — {String(r.spesifikasi || '').slice(0, 60)}</span>
                      <button onClick={() => handleKembalikanArsip(ai)} className="ml-auto px-3.5 py-2 rounded-xl bg-primary/10 text-primary text-xs font-bold min-h-[44px]">Kembalikan</button>
                    </div>
                  ))}
                  <button onClick={handleKosongkanArsip} className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-semibold min-h-[44px]">Kosongkan Arsip</button>
                </>
              )}
            </div>
          )}
        </div>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,620px)] xl:grid-cols-[minmax(0,1fr)_minmax(0,700px)] items-start">
          <div className="min-w-0 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div role="tablist" aria-label="Dokumen PBJ" className="flex flex-wrap gap-1.5 px-4 sm:px-5 pt-3">
              {PBJ_TABS_TAMPIL.map((t) => (
                <button key={t.id} role="tab" aria-selected={pbjTab === t.id}
                  onClick={() => setPbjTab(t.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold min-h-[44px] transition-all ${pbjTab === t.id ? 'bg-primary text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  {t.label}
                </button>
              ))}
            </div>
            <div className="p-4 sm:p-5 grid sm:grid-cols-2 gap-3">
              {(PBJ_TABS_TAMPIL.find((t) => t.id === pbjTab)?.fields || PBJ_TABS_TAMPIL[0]?.fields || []).map((f) => (
                <div key={f.key} className={f.type === 'textarea' ? 'sm:col-span-2' : ''}>
                  <label className="block text-xs font-medium text-slate-700 mb-1">{f.label}</label>
                  {f.type === 'date' ? (
                    <input type="date" value={pbjForm[pbjTab]?.[f.key] || ''} onChange={(e) => updatePbj(pbjTab, f.key, e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none min-h-[44px]" />
                  ) : f.type === 'select' ? (
                    <select value={pbjForm[pbjTab]?.[f.key] || ''} onChange={(e) => updatePbj(pbjTab, f.key, e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none min-h-[44px]">
                      <option value="">Pilih…</option>
                      {(f.options || []).map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : f.type === 'textarea' ? (
                    <textarea rows={3} value={pbjForm[pbjTab]?.[f.key] || ''} onChange={(e) => updatePbj(pbjTab, f.key, e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                  ) : (
                    <input type="text" value={pbjForm[pbjTab]?.[f.key] || ''} onChange={(e) => updatePbj(pbjTab, f.key, e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none min-h-[44px]" />
                  )}
                </div>
              ))}
            </div>
            {pbjTab === 'pesanan' && (pbjForm.pesanan.rows || []).length > 0 && (
              <div className="px-4 sm:px-5 pb-4 overflow-x-auto">
                <table className="w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
                  <thead><tr className="bg-slate-50 text-slate-500">
                    <th className="px-2 py-1.5 text-left">No</th><th className="px-2 py-1.5 text-left">Nama Barang/Jasa</th>
                    <th className="px-2 py-1.5 text-right">Jumlah</th><th className="px-2 py-1.5 text-left">Satuan</th>
                    <th className="px-2 py-1.5 text-right">Harga Satuan</th><th className="px-2 py-1.5 text-right">Total Harga termasuk Pajak</th>
                  </tr></thead>
                  <tbody>
                    {pbjForm.pesanan.rows.map((r, i) => (
                      <tr key={i} className="border-t border-slate-100">
                        <td className="px-2 py-1.5">{i + 1}</td><td className="px-2 py-1.5">{r.uraian}</td>
                        <td className="px-2 py-1.5 text-right">{r.qty}</td>
                        <td className="px-2 py-1.5"><input type="text" aria-label={`Satuan baris ${i + 1}`} placeholder="Pcs" value={r.satuan || ''} onChange={(e) => updatePesananRow(i, 'satuan', e.target.value)}
                          className="w-20 px-2 py-1 text-xs border border-slate-200 rounded-lg outline-none focus:border-primary" /></td>
                        <td className="px-2 py-1.5 text-right">{Number(r.harga || 0).toLocaleString('id-ID')}</td>
                        <td className="px-2 py-1.5 text-right">{Number(r.total || 0).toLocaleString('id-ID')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {pbjTab === 'nego' && (pbjForm.nego.rows || []).length > 0 && (
              <div className="px-4 sm:px-5 pb-4 overflow-x-auto">
                <table className="w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
                  <thead><tr className="bg-slate-50 text-slate-500">
                    <th className="px-2 py-1.5 text-left">Produk</th><th className="px-2 py-1.5 text-right">Qty</th>
                    <th className="px-2 py-1.5 text-right">Penawaran</th><th className="px-2 py-1.5 text-right">Negosiasi</th><th className="px-2 py-1.5 text-left">Ket</th>
                  </tr></thead>
                  <tbody>
                    {pbjForm.nego.rows.map((r, i) => (
                      <tr key={i} className="border-t border-slate-100">
                        <td className="px-2 py-1.5">{r.uraian}</td><td className="px-2 py-1.5 text-right">{r.qty}</td>
                        <td className="px-2 py-1.5 text-right">{Number(r.penawaran || 0).toLocaleString('id-ID')}</td>
                        <td className="px-2 py-1.5"><input type="number" aria-label={`Harga negosiasi baris ${i + 1}`} value={r.nego ?? ''} onChange={(e) => updateNegoRow(i, 'nego', e.target.value)}
                          className="w-28 px-2 py-1 text-xs text-right border border-slate-200 rounded-lg outline-none focus:border-primary" /></td>
                        <td className="px-2 py-1.5"><input type="text" aria-label={`Keterangan baris ${i + 1}`} value={r.ket || ''} onChange={(e) => updateNegoRow(i, 'ket', e.target.value)}
                          className="w-24 px-2 py-1 text-xs border border-slate-200 rounded-lg outline-none focus:border-primary" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="px-4 sm:px-5 pb-4 flex flex-wrap gap-1.5">
              {pbjRingkasan.map((r) => (
                <span key={r.id} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${r.lengkap ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-500'}`}>
                  <span className="material-symbols-outlined text-sm">{r.lengkap ? 'check_circle' : 'pending'}</span>
                  {r.label}: {r.lengkap ? `LENGKAP${r.nItem ? ` · ${r.nItem} item` : ''}` : 'KURANG'}
                </span>
              ))}
            </div>
          </div>
          <aside className="print:hidden min-w-0 lg:sticky lg:top-[88px] self-start">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Panel Preview Document — PBJ</h3>
            {pbjDocsList.length > 0 ? (
              <PanelPreviewDocument title="Panel Preview Document — PBJ" docs={pbjDocsList}
                status={{ perlu: pbjKosong, violations: [] }} cetakAktif={pbjDocsList.length > 0}
                onCek={handleCekPbj} onCetak={handleCetakPbj} />
            ) : (
              <p className="text-xs text-slate-500 bg-white border border-slate-200 rounded-xl px-4 py-3">Belum ada dokumen PBJ — upload invoice atau isi manual.</p>
            )}
          </aside>
        </div>
        <div className="flex items-center justify-between pt-1">
          <button onClick={handleClosePbj}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-white transition-all duration-300 hover:scale-105 active:scale-95">
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Kembali ke Daftar
          </button>
        </div>
        {pbjDocsList.length > 0 && (
          <div className="sk-print-area">
            {pbjDocsList.map((d) => (
              <div key={d.key} className="sk-doc-print">
                <TemplateEngine templateConfig={d.templateConfig} data={d.data} mode="print" />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <Topbar title="Dokumen Kelengkapan" subtitle="Dokumen di luar ARKAS yang harus dilampirkan" />

      <div className={pbjAktif ? 'px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1 max-w-none mx-auto w-full' : 'p-lg space-y-lg flex-1 max-w-7xl mx-auto w-full'}>
        {/* ─── Badge kelompok BKU (Sprint 004 D.2) ─── */}
        {bkuKelompok && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-xs">
            <span className="material-symbols-outlined text-primary text-base">move_to_inbox</span>
            <span className="font-semibold text-slate-800">
              dari BKU · {bkuKelompok.count} baris{(bkuKelompok.nos || []).length > 0 ? ` (${(bkuKelompok.nos || []).join(', ')})` : ''} · Rp {(bkuKelompok.total || 0).toLocaleString('id-ID')}
            </span>
            <button onClick={() => setBkuKelompok(null)} className="ml-auto px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 font-semibold">Tutup</button>
          </div>
        )}
        {/* ─── Revisi PBJ (3): mode transformasi — card asal hilang, hanya card Kelengkapan tampil ─── */}
        {pbjAktif ? renderPbjDetail() : (
        <>
        {/* ─── Categories ───────────────────────────────────────────────── */}
        {filteredCategories.map((category) => {
          const colors = COLOR_MAP[category.color] || COLOR_MAP.slate
          const categoryCompleted = category.items.filter((d) => getStatus(d.id)).length

          return (
            <div key={category.id} className={category.id === 'siplah' ? 'pb-4' : 'mt-10 pt-8 border-t border-slate-200'}>
            <div className="space-y-4">
              {/* Category Header */}
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-3">
                  <div className={`w-1 h-5 rounded-full ${
                    category.color === 'emerald' ? 'bg-emerald-500' :
                    category.color === 'blue' ? 'bg-blue-500' :
                    category.color === 'amber' ? 'bg-amber-500' :
                    category.color === 'rose' ? 'bg-rose-500' :
                    'bg-slate-500'
                  }`} />
                  <h3 className="text-sm font-bold text-text-high uppercase tracking-wide mr-1">
                    {category.label}
                  </h3>
                  <span className="text-xs text-text-low ml-2">— {category.description}</span>
                </div>
                <span className="text-xs font-medium text-text-low">
                  {categoryCompleted}/{category.items.length}
                </span>
              </div>

              {/* Items Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {category.items.map((item) => {
                  const isSelesai = getStatus(item.id)
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleOpenDokumen(item, category)}
                      className={`group relative bg-white rounded-xl border transition-all duration-200 overflow-hidden ${
                        selectedDokumen?.id === item.id
                          ? 'border-primary ring-2 ring-primary/20 shadow-md'
                          : isSelesai
                            ? 'border-emerald-200 bg-emerald-50/50'
                            : `border-outline-variant ${colors.hover} hover:shadow-md`
                      }`}
                    >
                      {/* Status Indicator */}
                      <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${
                        isSelesai ? 'bg-emerald-500' : 'bg-amber-400'
                      }`} />

                      {/* Content */}
                      <div className="p-3 text-left">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${
                          isSelesai ? 'bg-emerald-100' : colors.bg
                        }`}>
                          <span className={`material-symbols-outlined text-lg ${
                            isSelesai ? 'text-emerald-600' : colors.icon
                          }`}>
                            {isSelesai ? 'check_circle' : item.icon}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-text-high leading-tight">
                          {item.nama}
                        </p>
                        <p className="text-[10px] text-text-low mt-0.5 line-clamp-2">
                          {item.deskripsi}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
            </div>
          )
        })}
        {/* ─── Info Footer ──────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-outline-variant p-4 flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">info</span>
          <div className="flex-1">
            <p className="text-xs text-text-low">
              Klik kartu untuk mengisi form atau melihat detail dokumen.
              Dokumen yang sudah selesai akan ditandai dengan warna hijau.
            </p>
          </div>
          <button
            onClick={() => {
              const updated = {}
              allItems.forEach((d) => { updated[d.id] = { status: 'Selesai' } })
              setStatus(updated)
              storageHelper.set('dokumen_kelengkapan_status', updated)
              toast.success('Semua dokumen ditandai selesai')
            }}
            className="text-xs text-primary hover:underline whitespace-nowrap"
          >
            Tandai Semua Selesai
          </button>
        </div>
        </>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* DETAIL MODAL                                                       */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {selectedDokumen && selectedDokumen.id !== 'PBJ' && (
        <div
          className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4"
          onClick={() => setSelectedDokumen(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-outline-variant">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    COLOR_MAP[selectedCategory?.color]?.bg || 'bg-gray-100'
                  }`}>
                    <span className={`material-symbols-outlined text-xl ${
                      COLOR_MAP[selectedCategory?.color]?.icon || 'text-gray-600'
                    }`}>
                      {selectedDokumen.icon}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-text-high">{selectedDokumen.nama}</h2>
                    <p className="text-xs text-text-low">{selectedDokumen.deskripsi}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDokumen(null)}
                  className="p-1 rounded-lg hover:bg-surface-container-high transition-colors"
                >
                  <span className="material-symbols-outlined text-text-low">close</span>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {selectedDokumen.formFields?.length > 0 ? (
                <div className="space-y-4">
                  {selectedDokumen.formFields.map((field, i) => (
                    <div key={i}>
                      <label className="block text-xs font-medium text-text-high mb-1">
                        {field.label}
                      </label>
                      {field.type === 'date' ? (
                        <input
                          type="date"
                          className="w-full px-3 py-2 text-sm bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                          value={formData[field.name] || ''}
                          onChange={(e) => handleFormChange(field.name, e.target.value)}
                        />
                      ) : field.type === 'number' ? (
                        <input
                          type="number"
                          className="w-full px-3 py-2 text-sm bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                          placeholder={field.placeholder}
                          value={formData[field.name] || ''}
                          onChange={(e) => handleFormChange(field.name, e.target.value)}
                        />
                      ) : (
                        <input
                          type="text"
                          className="w-full px-3 py-2 text-sm bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                          placeholder={field.placeholder}
                          value={formData[field.name] || ''}
                          onChange={(e) => handleFormChange(field.name, e.target.value)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <span className="material-symbols-outlined text-4xl text-outline mb-3">
                    description
                  </span>
                  <p className="text-sm text-text-low">
                    Dokumen ini tidak memerlukan form input.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-outline-variant bg-surface flex items-center justify-between">
              <button
                onClick={() => {
                  toggleStatus(selectedDokumen.id)
                  toast.success('Status diubah')
                  setSelectedDokumen(null)
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  getStatus(selectedDokumen.id)
                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                    : 'bg-surface-container-high text-text-high hover:bg-surface-container-low'
                }`}
              >
                <span className="material-symbols-outlined text-lg">
                  {getStatus(selectedDokumen.id) ? 'check_circle' : 'radio_button_unchecked'}
                </span>
                {getStatus(selectedDokumen.id) ? 'Selesai' : 'Tandai Selesai'}
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    toast.info(`Cetak ${selectedDokumen.nama}`)
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-surface-container-high text-text-high hover:bg-surface-container-low transition-all"
                >
                  <span className="material-symbols-outlined text-lg">print</span>
                  Cetak
                </button>
                {selectedDokumen.formFields?.length > 0 && (
                  <button
                    onClick={handleSaveForm}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-primary text-on-primary hover:brightness-110 shadow-sm transition-all"
                  >
                    <span className="material-symbols-outlined text-lg">save</span>
                    Simpan
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
