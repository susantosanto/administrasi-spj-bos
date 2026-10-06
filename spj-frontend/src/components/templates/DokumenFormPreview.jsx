/**
 * DokumenFormPreview — Konsep BARU Dokumen LPJ (Form Input → Preview → Revisi)
 *
 * - Klik card → tampil FORM (input box + dropdown dari data tersimpan)
 * - Kepala Sekolah, Bendahara, Logo → otomatis dari data sekolah
 * - Tombol "Preview" → dokumen siap cetak (TemplateEngine mode=print)
 * - Tombol "Kembali ke Form" → revisi
 * - Generate nomor surat tetap ada di FORM
 *
 * Berlaku untuk semua dokumen template (Honor, Transport, Makan & Minum, Pemeliharaan).
 * Dokumen recipient-based (Honor/Transport) punya form pilih-penerima dari Data Guru/Tendik.
 * Dokumen lainnya memakai TemplateEngine edit sebagai form (input box & dropdown).
 */
import { useState, useEffect } from 'react'
import TemplateEngine from './TemplateEngine'
import SummaryCard from './SummaryCard'
import SkHonorerEditor from './blocks/SkHonorerEditor'
import TabelDinamis from './blocks/TabelDinamis'
import { loadSkPasal, saveSkPasal, cloneDefaultPasal } from '../../data/skPasal'
import NomorSuratPopup from './blocks/NomorSuratPopup'
import { TEMPLATE_CONFIGS } from '../../data/templateConfig'
import {
  getGuruHonorer,
  getTendikHonorer,
  getPerpustakaanStaff,
  getPenjagaStaff,
  getSemuaPegawai,
} from '../../utils/honorHelper'
import { findBkuNominal } from '../../utils/bkuHelper'
import { generateRingkasanNotulen } from '../../utils/aiHelper'
import { useToast } from '../ui/Toast'
import storageHelper from '../../utils/storageHelper'
import { getSchoolData } from '../../utils/sekolahData'
import { getSignatureRoles } from '../../utils/signatureRoles'
import PeringatanData from './blocks/PeringatanData'
import { templatePesananMamin, templateDaftarHadir, templateBukuTamu, lengkapiNotulen, rincianMenu, bangunPesananDuaSeksi, MENU_PESANAN } from '../../utils/aturanMamin'

// ─── Auto-calc helper (mirip TabelDinamis) ────────────────────────────────
function computeAutoValue(row, auto) {
  if (!auto || !auto.type) return ''
  const fields = auto.fields || []
  const values = fields.map((f) => {
    const v = parseFloat(String(row[f] || '0').replace(/[^\d.-]/g, ''))
    return isNaN(v) ? 0 : v
  })
  switch (auto.type) {
    case 'sum': return values.reduce((a, b) => a + b, 0)
    case 'mul': return values.reduce((a, b) => a * b, 1)
    case 'sub': return values.length >= 2 ? values[0] - values[1] : 0
    default: return ''
  }
}

function computeAutoRows(rows, columns) {
  if (!columns) return rows
  return rows.map((r) => {
    const nr = { ...r }
    columns.forEach((col) => {
      if (col.auto && col.auto.type) nr[col.key] = computeAutoValue(nr, col.auto)
    })
    return nr
  })
}

function getTableColumns(templateId) {
  const cfg = TEMPLATE_CONFIGS[templateId]
  if (!cfg) return []
  const tabel = cfg.blocks?.find((b) => b.type === 'table-dinamis')
  return tabel?.columns || []
}

// Tabel partisipan (Daftar Hadir / Daftar Penerima) untuk Mamin & Pemeliharaan
function getParticipantTableBlock(cardId) {
  const tid = cardId === 'mamin' ? 'buku_tamu' : 'upah'
  const cfg = TEMPLATE_CONFIGS[tid]
  return cfg?.blocks?.find((b) => b.type === 'table-dinamis')
}

// ─── Recipient source (Honor / Transport) ────────────────────────────────
function getRecipientsFor(cardId, subId) {
  const g = getGuruHonorer()
  const t = getTendikHonorer()
  const p = getPerpustakaanStaff()
  const j = getPenjagaStaff()
  if (cardId === 'honor') {
    switch (subId) {
      case 'guru': return g
      case 'tendik': return t
      case 'perpus': return p
      case 'penjaga': return j
      default: return []
    }
  }
  if (cardId === 'perjalanan_dinas') {
    // Sprint 003 (US-24): semua pegawai semua status — honor tetap honorer-only di cabang atas
    return getSemuaPegawai()
  }
  // Makan & Minum (Daftar Hadir) & Pemeliharaan (Daftar Penerima Upah)
  if (cardId === 'mamin' || cardId === 'pemeliharaan') {
    return getSemuaPegawai()
  }
  return []
}

function itemKey(item) {
  return item.nip || item.nuptk || item.nama || String(Math.random())
}

const HONOR_REK = '5.1.02.02.01' // Kode rekening Honorarium
const TRANSPORT_REK = '5.1.02.04' // Kode rekening Transport
const UPAH_REK = '5.1.02.02.01.0016' // Kode rekening Upah Kerja

const BULAN_TGL = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

// Format 'YYYY-MM-DD' → '14 Mei 1991'
function fmtTglLahir(tgl) {
  if (!tgl) return ''
  const m = String(tgl).match(/(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (m) {
    const [, y, mo, d] = m
    return `${Number(d)} ${BULAN_TGL[Number(mo) - 1] || mo} ${y}`
  }
  return String(tgl)
}

function buildHonorRow(item, no, bulanName) {
  const nominal = findBkuNominal({ nama: item.nama, bulanName, kodeRekeningPrefix: HONOR_REK })
  const tempatLahir = item.tempatLahir || ''
  const tanggalLahir = item.tanggalLahir || ''
  return {
    id: itemKey(item),
    no,
    nama: item.nama || '',
    nuptk: item.nuptk || '',
    nip: item.nip || '',
    jabatan: item.jabatan || '',
    jumlah: nominal != null ? String(nominal) : '',
    golRuang: item.golongan || 'GTT',
    volume: '1',
    satuan: 'Bulan',
    pph: '',
    diterima: '',
    ttd: '',
    // Data SK — diambil dari Data Guru/Tendik
    tempatLahir,
    tanggalLahir,
    ttl: tempatLahir && tanggalLahir ? `${tempatLahir}, ${fmtTglLahir(tanggalLahir)}` : tempatLahir,
    alamat: [item.alamat, item.desa, item.kecamatan].filter(Boolean).join(' ') || '',
  }
}

function buildTransportRow(item, no, bulanName) {
  const nominal = findBkuNominal({ nama: item.nama, bulanName, kodeRekeningPrefix: TRANSPORT_REK })
  return {
    id: itemKey(item),
    no,
    nama: item.nama || '',
    jabatan: item.jabatan || '',
    golRuang: item.golongan || '-',
    vol: '1',
    satuan: 'OK',
    unitCost: nominal != null ? String(nominal) : '',
    jumlah: '',
    ttd: '',
  }
}

// Baris partisipan generik (Makan & Minum = Daftar Hadir, Pemeliharaan = Daftar Penerima Upah)
// Field spesifik (volume/unitCost/pph/dst) diisi user lewat tabel editable.
function buildParticipantRow(item, no) {
  return {
    id: itemKey(item),
    no,
    nama: item.nama || '',
    jabatan: item.jabatan || '',
  }
}

const BULAN_LIST = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

// ─── Tab dokumen Perjalanan Dinas ────────────────────────────────────────
// Tab = data yang akan di-edit, bukan tampilan cetak.
// Template cetak (persis dengan DOCX) dirender di Preview.
// ADR 2026-09-14: tab "Surat Tugas" dihapus — satu dokumen = satu tab
// (dokumen sumber hanya memuat Undangan, SPT, SPD).
const TRANSPORT_FORM_TABS = [
  { id: 'daftar', label: 'Daftar Penerima', icon: 'table_chart' },
  { id: 'spt', label: 'Surat Perintah Tugas', icon: 'assignment' },
  { id: 'sppd', label: 'SPPD', icon: 'directions_car' },
  { id: 'resume', label: 'Resume', icon: 'description' },
  { id: 'undangan', label: 'Undangan', icon: 'mail' },
]

// Tab dokumen per sub-kategori Perjalanan Dinas
// Koordinasi & Bank: hanya antar dokumen (tanpa Resume & Undangan)
const TRANSPORT_TABS_BY_SUB = {
  koordinasi: ['daftar', 'spt', 'sppd'],
  bank: ['daftar', 'spt', 'sppd'],
}

// Tab list sesuai sub-kategori (default: semua 6 tab)
function getTransportTabs(subId) {
  const ids = TRANSPORT_TABS_BY_SUB[subId]
  if (!ids) return TRANSPORT_FORM_TABS
  return TRANSPORT_FORM_TABS.filter((t) => ids.includes(t.id))
}

// ─── Field helper: labeled input/select/textarea compact ────────────────
function Field({ label, value, onChange, placeholder, type = 'text', options, textarea = false, rows = 2, readOnly = false, className = '' }) {
  const base = 'w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-primary outline-none'
  return (
    <div className={className}>
      <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">{label}</label>
      {textarea ? (
        <textarea rows={rows} value={value || ''} onChange={onChange} placeholder={placeholder || ''} readOnly={readOnly} className={`${base} resize-none`} />
      ) : options ? (
        <select value={value || ''} onChange={onChange} className={base}>
          {options.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      ) : (
        <input type={type} value={value || ''} onChange={onChange} placeholder={placeholder || ''} readOnly={readOnly} className={base} />
      )}
    </div>
  )
}

// ─── COMPONENT ───────────────────────────────────────────────────────────
export default function DokumenFormPreview({
  card,
  selectedSub,
  onSubChange,
  formData,
  setFormData,
  sppdData,
  setSppdData,
  viewMode, // 'form' | 'preview'
  setViewMode,
  formTab, // Sprint 003 ADDENDUM: state DIANGKAT ke DokumenSPJPage (R1) —
  setFormTab, // MenuGuide perlu tahu tab aktif (ctx.activeTab)
  previewTab,
  setPreviewTab,
  onClose,
}) {
  const [showRecipients, setShowRecipients] = useState(false)
  const [showNomorPopup, setShowNomorPopup] = useState(false)
  const [showSppdNomorPopup, setShowSppdNomorPopup] = useState(false)
  const [showUndanganNomorPopup, setShowUndanganNomorPopup] = useState(false)
  const [showPesananNomorPopup, setShowPesananNomorPopup] = useState(false)
  const [showSptNomorPopup, setShowSptNomorPopup] = useState(false)
  const [selRowId, setSelRowId] = useState(null) // Penerima yang dipilih (Surat Tugas / SPPD)
  const [generatingRingkasan, setGeneratingRingkasan] = useState(false)
  const toast = useToast()

  const isTransport = card.id === 'perjalanan_dinas'
  const isMamin = card.id === 'mamin'
  const isPemeliharaan = card.id === 'pemeliharaan'
  const isPemeliharaanUpah = card.id === 'pemeliharaan' && selectedSub?.id === 'alat'
  const isRecipientBased = card.id === 'honor' || isTransport
  const isMaminOrUpah = isMamin || isPemeliharaanUpah
  const hasSubTabs = card.subKategori && !card.subKategori.every((s) => s.comingSoon)

  const recipients = (isRecipientBased || isMaminOrUpah)
    ? getRecipientsFor(card.id, selectedSub?.id)
    : []
  const selectedIds = new Set((formData.rows || []).map((r) => r.id))
  const tRows = formData.rows || []
  const selRow = tRows.find((r) => r.id === selRowId) || tRows[0]

  // Reset tab form & seleksi penerima ketika card/sub-kategori berubah
  useEffect(() => {
    setFormTab('daftar')
    setSelRowId(null)
    setPreviewTab('daftar')
  }, [card?.id, selectedSub?.id])

  // SPPD rows auto from transport rows
  useEffect(() => {
    if (!isTransport) return
    const transportRows = formData.rows || []
    setSppdData((prev) => ({
      // Sprint 002: pertahankan field lain (maksud, pengikutRows, dst.) saat
      // daftar penerima berubah — hanya `rows` yang di-sinkronkan ulang.
      ...prev,
      nomorSurat: prev.nomorSurat || '',
      tujuan: prev.tujuan || (TEMPLATE_CONFIGS[selectedSub?.templateId]?.defaults?.kegiatan || 'Perjalanan Dinas'),
      tanggal: prev.tanggal || '',
      tempat: prev.tempat || 'Cikalongwetan',
      lama: prev.lama || '1 hari',
      rows: transportRows.map((row, idx) => ({
        no: idx + 1,
        nama: row.nama || '',
        nip: row.nip || row.nuptk || '',
        jabatan: row.jabatan || '',
        ttd: '',
      })),
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.rows, isTransport, selectedSub?.templateId])

  const renumber = (rows) => rows.map((r, i) => ({ ...r, no: i + 1 }))

  const toggleRecipient = (item) => {
    const key = itemKey(item)
    const rows = formData.rows || []
    if (selectedIds.has(key)) {
      setFormData({ ...formData, rows: renumber(rows.filter((r) => r.id !== key)) })
    } else {
      let newRow
      if (isTransport) newRow = buildTransportRow(item, rows.length + 1, formData.bulan)
      else if (isMamin) {
        // Sprint 006 B.2: baris hadir dibentuk templateDaftarHadir (kolom TTD/TTD2 kosong).
        const shaped = templateDaftarHadir({ orang: [item] }).rows[0]
        newRow = shaped ? { ...shaped, no: rows.length + 1 } : buildParticipantRow(item, rows.length + 1)
      } else if (isMaminOrUpah) newRow = buildParticipantRow(item, rows.length + 1)
      else newRow = buildHonorRow(item, rows.length + 1, formData.bulan)
      setFormData({ ...formData, rows: renumber([...rows, newRow]) })
    }
  }

  const updateRow = (id, key, value) => {
    const rows = (formData.rows || []).map((r) =>
      r.id === id ? { ...r, [key]: value } : r
    )
    setFormData({ ...formData, rows })
  }

  // ─── Sprint 002 FASE 2: pengikut SPD (butir 8) & tembusan undangan ───
  const updatePengikut = (i, key, value) => {
    const rows = [...(sppdData.pengikutRows || [])]
    rows[i] = { ...(rows[i] || {}), [key]: value }
    setSppdData({ ...sppdData, pengikutRows: rows })
  }
  const addPengikut = () =>
    setSppdData({ ...sppdData, pengikutRows: [...(sppdData.pengikutRows || []), { nama: '', tanggalLahir: '', keterangan: '' }] })
  const removePengikut = (i) =>
    setSppdData({ ...sppdData, pengikutRows: (sppdData.pengikutRows || []).filter((_, idx) => idx !== i) })
  const updateTembusan = (i, value) => {
    const items = [...(formData.tembusanItems || [])]
    items[i] = value
    setFormData({ ...formData, tembusanItems: items })
  }
  const addTembusan = () =>
    setFormData({ ...formData, tembusanItems: [...(formData.tembusanItems || []), ''] })
  const removeTembusan = (i) =>
    setFormData({ ...formData, tembusanItems: (formData.tembusanItems || []).filter((_, idx) => idx !== i) })

  // ─── Buku Tamu Kedinasan (Mamin) ─────────────────────────────────────
  const bt = formData.bukuTamu || {}
  // Sprint 006: petunjuk baku template Mamin (placeholder abu-abu, non-destruktif) —
  // hanya dihitung saat dokumen dibuka dari BKU; tak mengubah nilai, manual, atau cetak.
  const bkuCtx006 = formData.bkuSumber || null
  const bakuPesanan006 = bkuCtx006 ? templatePesananMamin({ acara: formData.acara || '', tanggal: bkuCtx006.tanggal || '', uraian: bkuCtx006.uraian || '' }) : null
  const bakuTamu006 = bkuCtx006 ? templateBukuTamu({ tanggal: bkuCtx006.tanggal || '', uraian: formData.acara || bkuCtx006.uraian || '' }) : null
  const bakuNotulen006 = bkuCtx006 ? lengkapiNotulen({ acara: formData.acara || '', tanggal: bkuCtx006.tanggal || '' }) : null
  const setBt = (key, value) => {
    setFormData({ ...formData, bukuTamu: { ...bt, [key]: value } })
  }
  const updateBtRow = (id, key, value) => {
    setBt('rows', (bt.rows || []).map((r) => (r.id === id ? { ...r, [key]: value } : r)))
  }
  const addBtRow = () => {
    setBt('rows', [...(bt.rows || []), { id: Date.now(), no: (bt.rows || []).length + 1, nama: '', jabatan: '', alamat: '' }])
  }
  const removeBtRow = (id) => {
    setBt('rows', (bt.rows || []).filter((r) => r.id !== id).map((r, i) => ({ ...r, no: i + 1 })))
  }
  const hasBukuTamu = isMamin && (bt.noUrut || bt.tanggal || bt.bertemu || (bt.rows || []).length > 0)

  const buildPreviewData = (templateId, data) => {
    const columns = getTableColumns(templateId)
    const bulan = data.bulan
    const rows = (data.rows || []).map((r) => {
      const nr = { ...r }
      // Ambil nominal langsung dari BKU jika field masih kosong
      if (templateId?.startsWith('honor') && (!nr.jumlah || nr.jumlah === '')) {
        const nom = findBkuNominal({ nama: nr.nama, bulanName: bulan, kodeRekeningPrefix: HONOR_REK })
        if (nom != null) nr.jumlah = String(nom)
      }
      if (templateId?.startsWith('transpor') && (!nr.unitCost || nr.unitCost === '')) {
        const nom = findBkuNominal({ nama: nr.nama, bulanName: bulan, kodeRekeningPrefix: TRANSPORT_REK })
        if (nom != null) nr.unitCost = String(nom)
      }
      if (templateId?.startsWith('upah') && (!nr.unitCost || nr.unitCost === '')) {
        const nom = findBkuNominal({ nama: nr.nama, bulanName: bulan, kodeRekeningPrefix: UPAH_REK })
        if (nom != null) nr.unitCost = String(nom)
      }
      return nr
    })
    return { ...data, rows: computeAutoRows(rows, columns) }
  }

  // ═════════════════════════════════════════════════════════════════════
  // RENDER: FORM
  // ═════════════════════════════════════════════════════════════════════
  const renderForm = () => {
    const config = TEMPLATE_CONFIGS[selectedSub?.templateId]

    return (
      <div className="space-y-5">
        {/* Sprint 005 B.3/C.2: penanda isian aturan dari BKU (nilai diisi
            templateUndanganMamin/templateUndanganPerjDinas + drafNotulen via
            prefill di DokumenSPJPage; semua field di bawah tetap editable). */}
        {formData.bkuSumber && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/10 border border-primary/20 text-[11px]">
            <span className="material-symbols-outlined text-primary text-sm">move_to_inbox</span>
            <span className="font-semibold text-slate-700">
              dari BKU{formData.bkuSumber?.noBukti ? ` ${formData.bkuSumber.noBukti}` : ''} · draf aturan — silakan edit
            </span>
          </div>
        )}
        {/* Sub-kategori (all cards) */}
        {hasSubTabs && (
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Jenis {card.nama}
            </label>
            <div className="flex flex-wrap gap-2">
              {card.subKategori
                .filter((s) => !s.comingSoon)
                .map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => {
                      onSubChange(sub)
                      setFormData({})
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                      selectedSub?.id === sub.id
                        ? 'bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg shadow-primary/30'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {sub.label}
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* Recipient-based form (Honor / Transport) */}
        {isRecipientBased ? (
          <>
            {/* Tab dokumen (transport only) */}
            {isTransport && (
              <div className="flex gap-1.5 overflow-x-auto pb-1 border-b border-slate-200">
                {getTransportTabs(selectedSub?.id).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setFormTab(t.id)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-t-xl text-xs font-semibold whitespace-nowrap transition-all border-b-2 -mb-[1px] ${
                      formTab === t.id
                        ? 'bg-white border-primary text-primary'
                        : 'bg-slate-50 border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">{t.icon}</span>
                    {t.label}
                  </button>
                ))}
              </div>
            )}

            {/* Periode (honor selalu / transport di tab Daftar) */}
            {(!isTransport || formTab === 'daftar') && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Bulan</label>
                <select
                  value={formData.bulan || 'Januari'}
                  onChange={(e) => setFormData({ ...formData, bulan: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                >
                  {BULAN_LIST.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tahun</label>
                <input
                  type="text"
                  value={formData.tahun || '2026'}
                  onChange={(e) => setFormData({ ...formData, tahun: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                />
              </div>
            </div>
            )}

            {/* Nomor Surat (honor selalu / transport di tab Daftar) */}
            {(!isTransport || formTab === 'daftar') && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Nomor Surat {isTransport ? 'Transport' : ''}
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="f-nomor"
                  type="text"
                  value={formData.nomor || ''}
                  onChange={(e) => setFormData({ ...formData, nomor: e.target.value })}
                  placeholder="422.1/SK-001/SDN-PSR/VII/2026"
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowNomorPopup(true)}
                  className="p-3 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  title="Generate nomor surat"
                >
                  <span className="material-symbols-outlined">auto_awesome</span>
                </button>
              </div>
            </div>
            )}

            {/* Sprint 008 Zona A: Tanggal dana masuk (langkah-1, eksplisit).
                Ditulis ke formData yang sama; dibaca Panel Preview Document Zona B + gate Zona C. */}
            {(!isTransport || formTab === 'daftar') && (
            <div>
              <label htmlFor="f-tanggalDanaMasuk" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Tanggal dana masuk <span className="normal-case font-normal">(langkah-1)</span>
              </label>
              <input
                id="f-tanggalDanaMasuk"
                type="date"
                value={formData.tanggalDanaMasuk || ''}
                onChange={(e) => setFormData({ ...formData, tanggalDanaMasuk: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
              <p className="mt-1.5 flex items-center gap-1.5 text-[11px] font-medium text-primary">
                <span className="material-symbols-outlined text-sm">visibility</span>
                Langsung tercetak di surat — perhatikan Panel Preview Document kanan.
              </p>
            </div>
            )}

            {/* ═══ TAB: SURAT PERINTAH TUGAS (transport) ═══ */}
            {isTransport && formTab === 'spt' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
                <div className="flex items-center gap-2 text-primary mb-2">
                  <span className="material-symbols-outlined text-lg">assignment</span>
                  <span className="text-sm font-bold">Surat Perintah Tugas</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-semibold text-slate-500 uppercase">Nomor Surat</label>
                      <button type="button" onClick={() => setShowSptNomorPopup(true)} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-semibold hover:bg-primary/20 transition-all">
                        <span className="material-symbols-outlined text-[10px]">auto_fix_high</span> Generate
                      </button>
                    </div>
                    <input type="text" value={formData.nomorSpt || ''} onChange={(e) => setFormData({ ...formData, nomorSpt: e.target.value })} placeholder="400.3.7.6/018-SD/2026" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                  <Field label="Tanggal Surat" value={formData.tanggalSpt} onChange={(e) => setFormData({ ...formData, tanggalSpt: e.target.value })} placeholder="Cikalongwetan, 7 Mei 2026" />
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pt-1">Yang bertandatangan di bawah ini</div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Nama" value={formData.namaPenandatangan} onChange={(e) => setFormData({ ...formData, namaPenandatangan: e.target.value })} placeholder="Nama penandatangan" />
                  <Field label="Jabatan" value={formData.jabatanPenandatangan} onChange={(e) => setFormData({ ...formData, jabatanPenandatangan: e.target.value })} placeholder="Kepala Sekolah" />
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pt-1">Menugaskan Kepada</div>
                {!selRow ? (
                  <p className="text-xs text-amber-600 p-2">Belum ada penerima. Pilih penerima terlebih dahulu di tab Daftar Penerima.</p>
                ) : (
                  <>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Penerima</label>
                      <select value={selRow.id} onChange={(e) => setSelRowId(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-primary outline-none">
                        {tRows.map((r) => (
                          <option key={r.id} value={r.id}>{r.no}. {r.nama} — {r.jabatan}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Nama" value={selRow.nama} readOnly />
                      <Field label="NIP" value={selRow.sptNip} onChange={(e) => updateRow(selRow.id, 'sptNip', e.target.value)} />
                      <Field label="Pangkat / Golongan" value={selRow.sptPangkat} onChange={(e) => updateRow(selRow.id, 'sptPangkat', e.target.value)} />
                      <Field label="Jabatan" value={selRow.sptJabatan} onChange={(e) => updateRow(selRow.id, 'sptJabatan', e.target.value)} placeholder={selRow.jabatan || ''} />
                    </div>
                    <Field label="Untuk / Keperluan" textarea rows={2} value={formData.sptUntuk} onChange={(e) => setFormData({ ...formData, sptUntuk: e.target.value })} placeholder="Rapat Kerja Teknis Operator Sekolah Tingkat Gugus..." />
                    <div className="grid grid-cols-3 gap-3">
                      <Field label="Hari" value={formData.sptHari} onChange={(e) => setFormData({ ...formData, sptHari: e.target.value })} placeholder="Jumat" />
                      <Field label="Tanggal" value={formData.sptTanggal} onChange={(e) => setFormData({ ...formData, sptTanggal: e.target.value })} placeholder="8 Mei 2026" />
                      <Field label="Tempat" value={formData.sptTempat} onChange={(e) => setFormData({ ...formData, sptTempat: e.target.value })} placeholder="SD Negeri Cipada" />
                    </div>
                  </>
                )}
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pt-1">Mengetahui / Mengesahkan</div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Nama Kepala (Gugus)" value={formData.namaMengetahui} onChange={(e) => setFormData({ ...formData, namaMengetahui: e.target.value })} placeholder="Nama ketua gugus" />
                  <Field label="NIP" value={formData.nipMengetahui} onChange={(e) => setFormData({ ...formData, nipMengetahui: e.target.value })} placeholder="NIP ketua gugus" />
                </div>
              </div>
            )}

            {/* ═══ TAB: SPPD (transport) ═══ */}
            {isTransport && formTab === 'sppd' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
                <div className="flex items-center gap-2 text-primary mb-2">
                  <span className="material-symbols-outlined text-lg">directions_car</span>
                  <span className="text-sm font-bold">SPPD — Surat Perjalanan Dinas</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-semibold text-slate-500 uppercase">Nomor SPPD</label>
                      <button type="button" onClick={() => setShowSppdNomorPopup(true)} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-semibold hover:bg-primary/20 transition-all">
                        <span className="material-symbols-outlined text-[10px]">auto_fix_high</span> Generate
                      </button>
                    </div>
                    <input type="text" value={sppdData.nomorSurat || ''} onChange={(e) => setSppdData({ ...sppdData, nomorSurat: e.target.value })} placeholder="427/SPD-001/SDN-PSR/VII/2026" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                  <Field label="Untuk Keperluan" value={sppdData.tujuan} onChange={(e) => setSppdData({ ...sppdData, tujuan: e.target.value })} placeholder="Rapat Kerja Teknis Operator..." />
                  <Field label="Tempat" value={sppdData.tempat} onChange={(e) => setSppdData({ ...sppdData, tempat: e.target.value })} placeholder="SD Negeri Cipada" />
                  <Field label="Tanggal" type="date" value={sppdData.tanggal} onChange={(e) => setSppdData({ ...sppdData, tanggal: e.target.value })} />
                  <Field label="Lama Perjalanan" value={sppdData.lama} onChange={(e) => setSppdData({ ...sppdData, lama: e.target.value })} placeholder="1 (satu) hari" />
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pt-1">1. Pengguna Anggaran / Kuasa Pengguna Anggaran</div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Nama" value={sppdData.pengguna} onChange={(e) => setSppdData({ ...sppdData, pengguna: e.target.value })} placeholder="Nama pengguna anggaran" />
                  <Field label="Instansi" value={sppdData.penggunaInstansi} onChange={(e) => setSppdData({ ...sppdData, penggunaInstansi: e.target.value })} placeholder="Kec. Cikalongwetan Kab. Bandung Barat" />
                </div>
                {tRows.length === 0 ? (
                  <p className="text-xs text-amber-600 p-2">Belum ada penerima. Pilih penerima terlebih dahulu di tab Daftar Penerima.</p>
                ) : (
                  <>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pt-1">2-3. Pelaksana Perjalanan Dinas</div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Penerima</label>
                      <select value={selRow?.id || ''} onChange={(e) => setSelRowId(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-primary outline-none">
                        {tRows.map((r) => (
                          <option key={r.id} value={r.id}>{r.no}. {r.nama} — {r.jabatan}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Nama PNS" value={selRow?.nama} readOnly />
                      <Field label="NIP / PTT" value={selRow?.sppdNip} onChange={(e) => updateRow(selRow.id, 'sppdNip', e.target.value)} />
                      <Field label="Pangkat / Golongan" value={selRow?.sppdPangkat} onChange={(e) => updateRow(selRow.id, 'sppdPangkat', e.target.value)} />
                      <Field label="Jabatan / Instansi" value={selRow?.sppdJabatan} onChange={(e) => updateRow(selRow.id, 'sppdJabatan', e.target.value)} placeholder={selRow?.jabatan || ''} />
                      <Field label="Tingkat Biaya Perjalanan" value={selRow?.sppdTingkat} onChange={(e) => updateRow(selRow.id, 'sppdTingkat', e.target.value)} />
                    </div>
                    <Field label="4. Maksud Perjalanan Dinas" textarea rows={2} value={sppdData.maksud} onChange={(e) => setSppdData({ ...sppdData, maksud: e.target.value })} placeholder="Rapat Kerja Teknis Operator Sekolah Tingkat Gugus..." />
                    <Field label="5. Alat Angkutan yang digunakan" value={sppdData.alat} onChange={(e) => setSppdData({ ...sppdData, alat: e.target.value })} placeholder="Kendaraan darat" />
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pt-1">6-7. Tempat Berangkat / Tujuan & Lamanya</div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Tempat Berangkat" value={sppdData.tempatBerangkat} onChange={(e) => setSppdData({ ...sppdData, tempatBerangkat: e.target.value })} placeholder="Tempat berangkat" />
                      <Field label="Tempat Tujuan" value={sppdData.tempatTujuan} onChange={(e) => setSppdData({ ...sppdData, tempatTujuan: e.target.value })} placeholder="SD Negeri Cipada" />
                      <Field label="Lamanya Perjalanan" value={sppdData.lama} onChange={(e) => setSppdData({ ...sppdData, lama: e.target.value })} placeholder="1 (satu) hari" />
                      <Field label="Tanggal Berangkat" type="date" value={sppdData.tanggalBerangkat} onChange={(e) => setSppdData({ ...sppdData, tanggalBerangkat: e.target.value })} />
                      <Field label="Tanggal Kembali" type="date" value={sppdData.tanggalKembali} onChange={(e) => setSppdData({ ...sppdData, tanggalKembali: e.target.value })} />
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pt-1">8. Pengikut</div>
                    <div className="space-y-2">
                      {(sppdData.pengikutRows || []).map((r, i) => (
                        <div key={i} className="flex items-end gap-2">
                          <Field className="flex-1" label="Nama" value={r.nama} onChange={(e) => updatePengikut(i, 'nama', e.target.value)} />
                          <Field className="w-32" label="Tgl Lahir" value={r.tanggalLahir} onChange={(e) => updatePengikut(i, 'tanggalLahir', e.target.value)} />
                          <Field className="flex-1" label="Keterangan" value={r.keterangan} onChange={(e) => updatePengikut(i, 'keterangan', e.target.value)} />
                          <button type="button" onClick={() => removePengikut(i)} className="px-2 py-2 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors" title="Hapus pengikut">
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                      ))}
                      <button type="button" onClick={addPengikut} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-[11px] font-semibold hover:bg-primary/20 transition-all">
                        <span className="material-symbols-outlined text-sm">add</span> Tambah Pengikut
                      </button>
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pt-1">9. Pembebanan Anggaran</div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="SKPD" value={sppdData.skpd} onChange={(e) => setSppdData({ ...sppdData, skpd: e.target.value })} placeholder="BOS Reguler" />
                      <Field label="Akun" value={sppdData.akun} onChange={(e) => setSppdData({ ...sppdData, akun: e.target.value })} placeholder="5.1.02.04.01.0003" />
                    </div>
                    <Field label="10. Keterangan Lain-Lain" textarea rows={2} value={sppdData.keterangan} onChange={(e) => setSppdData({ ...sppdData, keterangan: e.target.value })} />
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pt-1">Dikeluarkan</div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Dikeluarkan di" value={sppdData.dikeluarkanDi} onChange={(e) => setSppdData({ ...sppdData, dikeluarkanDi: e.target.value })} placeholder="Cikalongwetan" />
                      <Field label="Pada Tanggal" value={sppdData.padaTanggal} onChange={(e) => setSppdData({ ...sppdData, padaTanggal: e.target.value })} placeholder="8 Mei 2026" />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ═══ TAB: RESUME (transport, rapat/pendamping only) ═══ */}
            {isTransport && formTab === 'resume' && getTransportTabs(selectedSub?.id).some((t) => t.id === 'resume') && (
              <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
                <div className="flex items-center gap-2 text-primary mb-2">
                  <span className="material-symbols-outlined text-lg">description</span>
                  <span className="text-sm font-bold">Resume / Poin Pembahasan</span>
                </div>
                <Field label="Acara / Kegiatan" value={formData.acara} onChange={(e) => setFormData({ ...formData, acara: e.target.value })} placeholder="Rapat Kerja Teknis Operator Sekolah Tingkat Gugus" />
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] font-semibold text-slate-500 uppercase">Resume / Poin Pembahasan</label>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!formData.acara?.trim()) {
                          toast.error('Isi Acara / Kegiatan terlebih dahulu.')
                          return
                        }
                        setGeneratingRingkasan(true)
                        try {
                          const result = await generateRingkasanNotulen(formData.acara)
                          if (result) {
                            setFormData({ ...formData, resume: result })
                            toast.success('Ringkasan berhasil digenerate oleh AI!')
                          } else {
                            toast.error('Gagal generate ringkasan. Coba lagi.')
                          }
                        } catch (err) {
                          toast.error('Gagal: ' + (err.message || 'Coba lagi.'))
                        } finally {
                          setGeneratingRingkasan(false)
                        }
                      }}
                      disabled={generatingRingkasan}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                        generatingRingkasan
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-primary to-blue-600 text-white shadow-md hover:brightness-110 active:scale-95'
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">
                        {generatingRingkasan ? 'hourglass_top' : 'auto_awesome'}
                      </span>
                      {generatingRingkasan ? 'Generating...' : 'Generate'}
                    </button>
                  </div>
                  <textarea
                    value={formData.resume || ''}
                    onChange={(e) => setFormData({ ...formData, resume: e.target.value })}
                    rows={4}
                    placeholder={generatingRingkasan ? 'AI sedang menulis ringkasan...' : 'Atau tulis manual resume kegiatan...'}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none transition-all"
                  />
                </div>
              </div>
            )}

            {/* ═══ TAB: UNDANGAN (transport, rapat/pendamping only) ═══ */}
            {isTransport && formTab === 'undangan' && getTransportTabs(selectedSub?.id).some((t) => t.id === 'undangan') && (
              <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
                <div className="flex items-center gap-2 text-primary mb-2">
                  <span className="material-symbols-outlined text-lg">mail</span>
                  <span className="text-sm font-bold">Surat Undangan</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-semibold text-slate-500 uppercase">Nomor</label>
                      <button type="button" onClick={() => setShowUndanganNomorPopup(true)} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-semibold hover:bg-primary/20 transition-all">
                        <span className="material-symbols-outlined text-[10px]">auto_fix_high</span> Generate
                      </button>
                    </div>
                    <input type="text" value={formData.nomorUndangan || ''} onChange={(e) => setFormData({ ...formData, nomorUndangan: e.target.value })} placeholder="400.3.7.6/018/G-KHD/2026" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                  <Field label="Sifat" options={['-', 'Biasa', 'Penting', 'Segera']} value={formData.sifatUndangan || '-'} onChange={(e) => setFormData({ ...formData, sifatUndangan: e.target.value })} />
                  <Field label="Lampiran" value={formData.lampiranUndangan} onChange={(e) => setFormData({ ...formData, lampiranUndangan: e.target.value })} placeholder="-" />
                  <Field label="Perihal" value={formData.perihalUndangan} onChange={(e) => setFormData({ ...formData, perihalUndangan: e.target.value })} placeholder="Undangan Rapat Operator" />
                  <Field label="Tanggal Surat" value={formData.tanggalSurat} onChange={(e) => setFormData({ ...formData, tanggalSurat: e.target.value })} placeholder="Cikalongwetan, 7 Mei 2026" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Kepada Yth" value={formData.kepadaUndangan} onChange={(e) => setFormData({ ...formData, kepadaUndangan: e.target.value })} placeholder="Kepala Sekolah SD" />
                  <Field label="Alamat / Instansi" value={formData.alamatUndangan} onChange={(e) => setFormData({ ...formData, alamatUndangan: e.target.value })} placeholder="se-gugus K.H Dewantara" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Hari" value={formData.hariUndangan} onChange={(e) => setFormData({ ...formData, hariUndangan: e.target.value })} placeholder="Jumat" />
                  <Field label="Tanggal Acara" value={formData.tanggalAcara} onChange={(e) => setFormData({ ...formData, tanggalAcara: e.target.value })} placeholder="8 Mei 2026" />
                  <Field label="Pukul" value={formData.pukulUndangan} onChange={(e) => setFormData({ ...formData, pukulUndangan: e.target.value })} placeholder="11.00 s.d selesai" />
                  <Field label="Tempat" value={formData.tempatAcara} onChange={(e) => setFormData({ ...formData, tempatAcara: e.target.value })} placeholder="SD Negeri Cipada" />
                </div>
                <Field label="Isi Undangan" textarea rows={3} value={formData.isiUndangan} onChange={(e) => setFormData({ ...formData, isiUndangan: e.target.value })} placeholder="Dengan hormat, ..." />
                <Field label="Paragraf Penutup 1" textarea rows={2} value={formData.penutupUndangan1} onChange={(e) => setFormData({ ...formData, penutupUndangan1: e.target.value })} placeholder="Mengingat pentingnya acara tersebut di atas kami harap kehadiran Operator tepat pada waktu yang telah ditentukan." />
                <Field label="Paragraf Penutup 2" textarea rows={2} value={formData.penutupUndangan2} onChange={(e) => setFormData({ ...formData, penutupUndangan2: e.target.value })} placeholder="Demikian undangan ini kami sampaikan, atas perhatian dan kehadirannya kami ucapkan terima kasih." />
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pt-1">Ketua Gugus</div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Nama" value={formData.namaKetuaGugus} onChange={(e) => setFormData({ ...formData, namaKetuaGugus: e.target.value })} placeholder="Nama ketua gugus" />
                  <Field label="NIP" value={formData.nipKetuaGugus} onChange={(e) => setFormData({ ...formData, nipKetuaGugus: e.target.value })} placeholder="NIP ketua gugus" />
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pt-1">Tembusan</div>
                <div className="space-y-2">
                  {(formData.tembusanItems || []).map((t, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 w-4">{i + 1}.</span>
                      <input value={t} onChange={(e) => updateTembusan(i, e.target.value)} placeholder="Yth. ..." className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-primary outline-none" />
                      <button type="button" onClick={() => removeTembusan(i)} className="px-2 py-2 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors" title="Hapus tembusan">
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={addTembusan} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-[11px] font-semibold hover:bg-primary/20 transition-all">
                    <span className="material-symbols-outlined text-sm">add</span> Tambah Tembusan
                  </button>
                </div>
              </div>
            )}

            {/* Pilih Penerima (honor selalu / transport di tab Daftar) */}
            {(!isTransport || formTab === 'daftar') && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Pilih Penerima (dari Data Guru / Tendik)
                </label>
                <button
                  type="button"
                  onClick={() => setShowRecipients((v) => !v)}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-primary to-blue-600 text-white text-sm font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:brightness-110 transition-all active:scale-[0.98]"
                >
                  <span className="material-symbols-outlined text-lg">{showRecipients ? 'expand_less' : 'group_add'}</span>
                  {showRecipients ? 'Tutup Daftar Penerima' : `Pilih Penerima${selectedIds.size ? ` (${selectedIds.size})` : ''}`}
                </button>
              </div>

              {showRecipients && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 max-h-56 overflow-y-auto space-y-1">
                  {recipients.length === 0 && (
                    <p className="text-xs text-amber-600 p-2">
                      Belum ada data honorer. Upload Data Guru / Tendik terlebih dahulu.
                    </p>
                  )}
                  {recipients.map((item) => {
                    const key = itemKey(item)
                    const checked = selectedIds.has(key)
                    return (
                      <label
                        key={key}
                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                          checked ? 'bg-primary/10' : 'hover:bg-white'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleRecipient(item)}
                          className="w-4 h-4 accent-primary"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{item.nama}</p>
                          <p className="text-[10px] text-slate-500">
                            {item.jabatan || ''} {item.golongan ? `· ${item.golongan}` : ''}
                          </p>
                        </div>
                      </label>
                    )
                  })}
                </div>
              )}

              {(formData.rows || []).length > 0 && (
                <div className="mt-3 space-y-2">
                  {(formData.rows || []).map((row) => (
                    <div
                      key={row.id}
                      className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-3"
                    >
                      <span className="text-xs font-bold text-slate-400 w-5">{row.no}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{row.nama}</p>
                        <p className="text-[10px] text-slate-500">{row.jabatan}</p>
                      </div>
                      {isTransport ? (
                        <>
                          <input
                            type="text"
                            value={row.vol || ''}
                            onChange={(e) => updateRow(row.id, 'vol', e.target.value)}
                            placeholder="VOL"
                            className="w-14 px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-primary"
                          />
                          <input
                            type="text"
                            value={row.satuan || ''}
                            onChange={(e) => updateRow(row.id, 'satuan', e.target.value)}
                            placeholder="Satuan"
                            className="w-16 px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-primary"
                          />
                          <input
                            type="text"
                            value={row.unitCost || ''}
                            onChange={(e) => updateRow(row.id, 'unitCost', e.target.value)}
                            placeholder="Unit Cost"
                            className="w-28 px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-primary"
                          />
                        </>
                      ) : (
                        <>
                          <input
                            type="text"
                            value={row.jumlah || ''}
                            onChange={(e) => updateRow(row.id, 'jumlah', e.target.value)}
                            placeholder="JUMLAH (Rp)"
                            className="w-32 px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-primary"
                          />
                          <input
                            type="text"
                            value={row.pph || ''}
                            onChange={(e) => updateRow(row.id, 'pph', e.target.value)}
                            placeholder="PPh 21"
                            className="w-28 px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-primary"
                          />
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => toggleRecipient({ ...row, __remove: true })}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                        title="Hapus"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            )}

            {/* ═══ SK HONORER + PASAL (kartu honor, form Zona A) ═══ */}
            {/* Regresi Sprint 008: editor SK hanya hidup di tab preview 'sk'
                sehingga form Zona A tak pernah menampilkan form SK + pasal.
                Kembalikan di sini (hidePrint: cetak formal tetap satu-satunya
                di tab preview SK; panel kanan baca formData.pasal yg sama). */}
            {!isTransport && (() => {
              const skConfig = TEMPLATE_CONFIGS.sk_honorer
              if (!skConfig) return null
              const skPasal = formData.pasal || loadSkPasal() || cloneDefaultPasal()
              const setSkPasal = (p) => {
                setFormData({ ...formData, pasal: p })
                saveSkPasal(p)
              }
              const buildSkData = (row) => ({
                ...skConfig.defaults,
                ...formData,
                pasal: skPasal,
                nomorSurat: formData.nomor || '',
                namaPihakKedua: row.nama || '',
                ttlPihakKedua: row.ttl || row.tempatLahir || '',
                pendidikanPihakKedua: row.pendidikan || '',
                alamatPihakKedua: row.alamat || '',
                kelasGuru: row.kelasGuru || '',
                namaPihakKesatu: formData.namaPihakKesatu || skConfig.defaults.namaPihakKesatu,
                nipPihakKesatu: formData.nipPihakKesatu || skConfig.defaults.nipPihakKesatu,
                jabatanPihakKesatu: formData.jabatanPihakKesatu || skConfig.defaults.jabatanPihakKesatu,
                tempatTtd: formData.tempatTtd || skConfig.defaults.tempatTtd,
                tanggalTtd: formData.tanggalTtd || '',
              })
              const skList = (formData.rows || []).map((row) => ({ row, skData: buildSkData(row) }))
              return (
                <SkHonorerEditor
                  skList={skList}
                  pasal={skPasal}
                  onPasalChange={setSkPasal}
                  onResetPasal={() => setSkPasal(cloneDefaultPasal())}
                  onUpdateRow={updateRow}
                  onRemoveRow={(row) => toggleRecipient({ ...row, __remove: true })}
                  onUpdateForm={(key, value) => setFormData({ ...formData, [key]: value })}
                  hidePrint
                />
              )
            })()}
          </>
        ) : isMaminOrUpah ? (
          <>
            {/* Periode (khusus Upah / Pemeliharaan Alat) */}
            {isPemeliharaanUpah && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Bulan</label>
                  <select
                    value={formData.bulan || 'Januari'}
                    onChange={(e) => setFormData({ ...formData, bulan: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  >
                    {BULAN_LIST.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tahun</label>
                  <input
                    type="text"
                    value={formData.tahun || '2026'}
                    onChange={(e) => setFormData({ ...formData, tahun: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>
              </div>
            )}

            {/* Nomor Surat (Undangan / Surat Perintah / SPJ) */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Nomor Surat {isMamin ? '(Undangan / Surat Perintah)' : ''}
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="f-nomor"
                  type="text"
                  value={formData.nomor || ''}
                  onChange={(e) => setFormData({ ...formData, nomor: e.target.value })}
                  placeholder={isMamin ? '422.1/UND-001/SDN-PSR/VII/2026' : '422.1/SPJ-001/SDN-PSR/VII/2026'}
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowNomorPopup(true)}
                  className="p-3 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  title="Generate nomor surat"
                >
                  <span className="material-symbols-outlined">auto_awesome</span>
                </button>
              </div>
            </div>

            {/* Sprint 008 Zona A: Tanggal dana masuk (langkah-1, eksplisit).
                Cabang Mamin/Upah — sama seperti cabang recipient-based di atas;
                tanpa ini gate Zona C tak pernah lolos untuk Mamin/Upah. */}
            <div>
              <label htmlFor="f-tanggalDanaMasuk" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Tanggal dana masuk <span className="normal-case font-normal">(langkah-1)</span>
              </label>
              <input
                id="f-tanggalDanaMasuk"
                type="date"
                value={formData.tanggalDanaMasuk || ''}
                onChange={(e) => setFormData({ ...formData, tanggalDanaMasuk: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
              <p className="mt-1.5 flex items-center gap-1.5 text-[11px] font-medium text-primary">
                <span className="material-symbols-outlined text-sm">visibility</span>
                Langsung tercetak di surat — perhatikan Panel Preview Document kanan.
              </p>
            </div>

            {/* Detail Acara (khusus Makan & Minum) */}
            {isMamin && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tanggal</label>
                    <input
                      type="date"
                      value={formData.tanggal || ''}
                      onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Waktu</label>
                    <input
                      type="text"
                      value={formData.waktu || ''}
                      onChange={(e) => setFormData({ ...formData, waktu: e.target.value })}
                      placeholder="08.00 s.d. 10.00"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tempat</label>
                    <input
                      type="text"
                      value={formData.tempat || ''}
                      onChange={(e) => setFormData({ ...formData, tempat: e.target.value })}
                      placeholder={bakuNotulen006?.tempat || 'Aula / Ruang rapat ...'}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Acara / Kegiatan</label>
                    <input
                      type="text"
                      value={formData.acara || ''}
                      onChange={(e) => setFormData({ ...formData, acara: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Resume / Poin Pembahasan</label>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!formData.acara?.trim()) {
                          toast.error('Isi Acara / Kegiatan terlebih dahulu.')
                          return
                        }
                        setGeneratingRingkasan(true)
                        try {
                          const result = await generateRingkasanNotulen(formData.acara)
                          if (result) {
                            setFormData({ ...formData, resume: result })
                            toast.success('Ringkasan notulen berhasil digenerate oleh AI!')
                          } else {
                            toast.error('Gagal generate ringkasan. Coba lagi.')
                          }
                        } catch (err) {
                          toast.error('Gagal: ' + (err.message || 'Coba lagi.'))
                        } finally {
                          setGeneratingRingkasan(false)
                        }
                      }}
                      disabled={generatingRingkasan}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                        generatingRingkasan
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-primary to-blue-600 text-white shadow-md hover:brightness-110 active:scale-95'
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">
                        {generatingRingkasan ? 'hourglass_top' : 'auto_awesome'}
                      </span>
                      {generatingRingkasan ? 'Generating...' : 'Generate'}
                    </button>
                  </div>
                  <textarea
                    value={formData.resume || ''}
                    onChange={(e) => setFormData({ ...formData, resume: e.target.value })}
                    rows={4}
                    placeholder={generatingRingkasan ? 'AI sedang menulis ringkasan...' : 'Atau tulis manual poin pembahasan rapat...'}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none transition-all"
                  />
                </div>

                {/* ═══ SURAT UNDANGAN ═══ */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-primary mb-2">
                    <span className="material-symbols-outlined text-lg">mail</span>
                    <span className="text-sm font-bold">Surat Undangan</span>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Tanggal Surat</label>
                    <input type="text" value={formData.tanggalSurat || ''} onChange={(e) => setFormData({ ...formData, tanggalSurat: e.target.value })} placeholder="Cikalongwetan, 20 Februari 2025" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] font-semibold text-slate-500 uppercase">Nomor</label>
                        <button type="button" onClick={() => setShowUndanganNomorPopup(true)} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-semibold hover:bg-primary/20 transition-all">
                          <span className="material-symbols-outlined text-[10px]">auto_fix_high</span> Generate
                        </button>
                      </div>
                      <input type="text" value={formData.nomorUndangan || ''} onChange={(e) => setFormData({ ...formData, nomorUndangan: e.target.value })} placeholder="007/KKKS/.../2026" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-primary outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Sifat</label>
                      <select value={formData.sifatUndangan || 'Biasa'} onChange={(e) => setFormData({ ...formData, sifatUndangan: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-primary outline-none">
                        <option value="Biasa">Biasa</option>
                        <option value="Penting">Penting</option>
                        <option value="Segera">Segera</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Lampiran</label>
                      <input type="text" value={formData.lampiranUndangan || '-'} onChange={(e) => setFormData({ ...formData, lampiranUndangan: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-primary outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Perihal</label>
                      <input type="text" value={formData.perihalUndangan || 'Undangan'} onChange={(e) => setFormData({ ...formData, perihalUndangan: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-primary outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Kepada Yth</label>
                      <input type="text" value={formData.kepadaUndangan || ''} onChange={(e) => setFormData({ ...formData, kepadaUndangan: e.target.value })} placeholder="Bapak/Ibu Guru" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-primary outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Alamat / Instansi</label>
                      <input type="text" value={formData.alamatUndangan || ''} onChange={(e) => setFormData({ ...formData, alamatUndangan: e.target.value })} placeholder="Alamat / instansi" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-primary outline-none" />
                    </div>
                  </div>
                  {/* Detail Acara */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Hari</label>
                      <input type="text" value={formData.hariUndangan || ''} onChange={(e) => setFormData({ ...formData, hariUndangan: e.target.value })} placeholder="Kamis" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-primary outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Tanggal Acara</label>
                      <input type="text" value={formData.tanggalAcara || ''} onChange={(e) => setFormData({ ...formData, tanggalAcara: e.target.value })} placeholder="20 Februari 2025" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-primary outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Tempat</label>
                      <input type="text" value={formData.tempatAcara || ''} onChange={(e) => setFormData({ ...formData, tempatAcara: e.target.value })} placeholder="Tempat acara" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-primary outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Waktu</label>
                      <input type="text" value={formData.waktuAcara || ''} onChange={(e) => setFormData({ ...formData, waktuAcara: e.target.value })} placeholder="08.00 sd Selesai" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-primary outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Isi Undangan</label>
                    <textarea value={formData.isiUndangan || ''} onChange={(e) => setFormData({ ...formData, isiUndangan: e.target.value })} rows={3} placeholder="Bersamaan ini kami sampaikan bahwa pelaksanaan kegiatan..." className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-primary outline-none resize-none" />
                  </div>
                </div>

                {/* ═══ SURAT PESANAN ═══ */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-primary mb-2">
                    <span className="material-symbols-outlined text-lg">shopping_cart</span>
                    <span className="text-sm font-bold">Surat Pesanan</span>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Tanggal Surat</label>
                    <input type="text" value={formData.tanggalSurat || ''} onChange={(e) => setFormData({ ...formData, tanggalSurat: e.target.value })} placeholder="Cikalongwetan, 18 Februari 2025" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] font-semibold text-slate-500 uppercase">Nomor</label>
                        <button type="button" onClick={() => setShowPesananNomorPopup(true)} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-semibold hover:bg-primary/20 transition-all">
                          <span className="material-symbols-outlined text-[10px]">auto_fix_high</span> Generate
                        </button>
                      </div>
                      <input type="text" value={formData.nomorPesanan || ''} onChange={(e) => setFormData({ ...formData, nomorPesanan: e.target.value })} placeholder="008/KKKS/.../2026" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-primary outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Sifat</label>
                      <select value={formData.sifatPesanan || 'Biasa'} onChange={(e) => setFormData({ ...formData, sifatPesanan: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-primary outline-none">
                        <option value="Biasa">Biasa</option>
                        <option value="Penting">Penting</option>
                        <option value="Segera">Segera</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Kepada Yth (Nama Toko/RM)</label>
                      <input type="text" value={formData.kepadaPesanan || ''} onChange={(e) => setFormData({ ...formData, kepadaPesanan: e.target.value })} placeholder="Toko/RM. Family" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-primary outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Alamat Toko</label>
                      <input type="text" value={formData.alamatToko || ''} onChange={(e) => setFormData({ ...formData, alamatToko: e.target.value })} placeholder="Di tempat" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-primary outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Perihal</label>
                    <input type="text" value={formData.perihalPesanan || ''} onChange={(e) => setFormData({ ...formData, perihalPesanan: e.target.value })} placeholder={bakuPesanan006?.perihalPesanan || 'Surat Pesanan'} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Isi Surat Pesanan</label>
                    <textarea value={formData.isiPesanan || ''} onChange={(e) => setFormData({ ...formData, isiPesanan: e.target.value })} rows={3} placeholder={bakuPesanan006?.isiPesanan?.slice(0, 90) || 'Bersamaan ini kami sampaikan bahwa sehubungan dengan akan dilaksanakannya kegiatan...'} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-primary outline-none resize-none" />
                  </div>
                  {/* Rincian Pesanan — Rework-8 (5): 2 seksi (Nasi 6 + Snack 4), tiap seksi bisa disable */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[10px] font-semibold text-slate-500 uppercase">Rincian Pesanan</label>
                      <button type="button" onClick={() => {
                        const rows = formData.pesananRows || []
                        const seksiDef = (formData.seksiPesanan?.nasi ?? true) ? 'Nasi Box' : ((formData.seksiPesanan?.snack ?? true) ? 'Snack Box' : '')
                        setFormData({ ...formData, pesananRows: [...rows, { id: Date.now(), no: rows.length + 1, seksi: seksiDef, uraian: '', satuan: '', jumlah: '' }] })
                      }} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-semibold hover:bg-primary/20 transition-all">
                        <span className="material-symbols-outlined text-xs">add</span> Tambah Item
                      </button>
                    </div>
                    {/* Toggle seksi — sumber tunggal MENU_PESANAN */}
                    <div className="flex flex-wrap gap-2 mb-2">
                      {[
                        { id: 'nasi', label: `Seksi Nasi Box (${(MENU_PESANAN['nasi box'] || []).length})` },
                        { id: 'snack', label: `Seksi Snack Box (${(MENU_PESANAN['snack box'] || []).length})` },
                      ].map((s) => {
                        const aktif = formData.seksiPesanan ? (formData.seksiPesanan[s.id] ?? true) : true
                        return (
                          <label key={s.id} className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[10px] font-semibold cursor-pointer transition-all ${aktif ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                            <input
                              type="checkbox"
                              checked={aktif}
                              onChange={() => {
                                const next = { nasi: formData.seksiPesanan?.nasi ?? true, snack: formData.seksiPesanan?.snack ?? true, [s.id]: !aktif }
                                let rows = [...(formData.pesananRows || [])]
                                const seksiNama = s.id === 'nasi' ? 'Nasi Box' : 'Snack Box'
                                if (!aktif) {
                                  // Nyalakan lagi: tambah menu baku seksi itu yg belum ada
                                  const ada = new Set(rows.filter((r) => (r.seksi || '') === seksiNama).map((r) => (r.uraian || '').toLowerCase()))
                                  const kunci = s.id === 'nasi' ? 'nasi box' : 'snack box'
                                  const satuanDef = rows[0]?.satuan || bakuPesanan006?.pesananRows?.[0]?.satuan || 'Box'
                                  const jumlahDef = formData.jumlahPesanan || bakuPesanan006?.jumlahPesanan || rows[0]?.jumlah || ''
                                  for (const nama of (MENU_PESANAN[kunci] || [])) {
                                    if (!ada.has(nama.toLowerCase())) rows.push({ id: Date.now() + Math.random(), no: 0, seksi: seksiNama, uraian: nama, satuan: satuanDef, jumlah: jumlahDef })
                                  }
                                  rows = rows.map((r, i) => ({ ...r, no: i + 1 }))
                                } else {
                                  rows = rows.filter((r) => (r.seksi || seksiNama) !== seksiNama).map((r, i) => ({ ...r, no: i + 1 }))
                                }
                                setFormData({ ...formData, seksiPesanan: next, pesananRows: rows })
                              }}
                              className="w-3 h-3 accent-primary"
                            />
                            {s.label}
                          </label>
                        )
                      })}
                    </div>
                    {(formData.pesananRows || []).length === 0 && (
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] text-slate-400 italic flex-1">Belum ada item pesanan.</p>
                        <button type="button" onClick={() => {
                          const satuanDef = bakuPesanan006?.pesananRows?.[0]?.satuan || 'Box'
                          const jumlahDef = formData.jumlahPesanan || bakuPesanan006?.jumlahPesanan || ''
                          setFormData({ ...formData, seksiPesanan: { nasi: true, snack: true }, pesananRows: bangunPesananDuaSeksi({ jumlah: jumlahDef, satuan: satuanDef }) })
                        }} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-semibold hover:bg-primary/20 transition-all">
                          <span className="material-symbols-outlined text-xs">restaurant_menu</span> Isi menu baku
                        </button>
                      </div>
                    )}
                    {['Nasi Box', 'Snack Box'].map((seksiNama) => {
                      const daftar = (formData.pesananRows || []).map((r, i) => ({ ...r, _idx: i })).filter((r) => (r.seksi || seksiNama) === seksiNama)
                      if (daftar.length === 0) return null
                      return (
                        <div key={seksiNama} className="mb-2">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{seksiNama} ({daftar.length})</p>
                          {daftar.map((row) => (
                            <div key={row.id} className="flex items-center gap-2 mb-2">
                              <span className="text-[10px] font-bold text-slate-400 w-4">{row._idx + 1}</span>
                              <input type="text" value={row.uraian} onChange={(e) => {
                                const rows = formData.pesananRows.map((r) => r.id === row.id ? { ...r, uraian: e.target.value } : r)
                                setFormData({ ...formData, pesananRows: rows })
                              }} placeholder="Uraian" className="flex-1 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] focus:ring-1 focus:ring-primary outline-none" />
                              <input type="text" value={row.satuan} onChange={(e) => {
                                const rows = formData.pesananRows.map((r) => r.id === row.id ? { ...r, satuan: e.target.value } : r)
                                setFormData({ ...formData, pesananRows: rows })
                              }} placeholder="Satuan" className="w-16 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] focus:ring-1 focus:ring-primary outline-none" />
                              <input type="text" value={row.jumlah} onChange={(e) => {
                                const rows = formData.pesananRows.map((r) => r.id === row.id ? { ...r, jumlah: e.target.value } : r)
                                setFormData({ ...formData, pesananRows: rows })
                              }} placeholder="Jumlah" className="w-14 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] focus:ring-1 focus:ring-primary outline-none" />
                              <button type="button" onClick={() => {
                                const rows = formData.pesananRows.filter((r) => r.id !== row.id).map((r, i) => ({ ...r, no: i + 1 }))
                                setFormData({ ...formData, pesananRows: rows })
                              }} className="p-1 text-red-500 hover:bg-red-50 rounded-lg"><span className="material-symbols-outlined text-xs">delete</span></button>
                            </div>
                          ))}
                        </div>
                      )
                    })}
                    {/* Rows tanpa seksi (warisan) tetap tampil editable */}
                    {(formData.pesananRows || []).filter((r) => r.seksi && r.seksi !== 'Nasi Box' && r.seksi !== 'Snack Box').map((row, idx) => (
                      <div key={row.id} className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold text-slate-400 w-4">•</span>
                        <input type="text" value={row.uraian} onChange={(e) => {
                          const rows = formData.pesananRows.map((r) => r.id === row.id ? { ...r, uraian: e.target.value } : r)
                          setFormData({ ...formData, pesananRows: rows })
                        }} placeholder="Uraian" className="flex-1 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] focus:ring-1 focus:ring-primary outline-none" />
                        <input type="text" value={row.satuan} onChange={(e) => {
                          const rows = formData.pesananRows.map((r) => r.id === row.id ? { ...r, satuan: e.target.value } : r)
                          setFormData({ ...formData, pesananRows: rows })
                        }} placeholder="Satuan" className="w-16 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] focus:ring-1 focus:ring-primary outline-none" />
                        <input type="text" value={row.jumlah} onChange={(e) => {
                          const rows = formData.pesananRows.map((r) => r.id === row.id ? { ...r, jumlah: e.target.value } : r)
                          setFormData({ ...formData, pesananRows: rows })
                        }} placeholder="Jumlah" className="w-14 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] focus:ring-1 focus:ring-primary outline-none" />
                        <button type="button" onClick={() => {
                          const rows = formData.pesananRows.filter((r) => r.id !== row.id).map((r, i) => ({ ...r, no: i + 1 }))
                          setFormData({ ...formData, pesananRows: rows })
                        }} className="p-1 text-red-500 hover:bg-red-50 rounded-lg"><span className="material-symbols-outlined text-xs">delete</span></button>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Hari/Tanggal</label>
                      <input type="text" value={formData.hariPesanan || ''} onChange={(e) => setFormData({ ...formData, hariPesanan: e.target.value })} placeholder="Senin 20 Februari 2025" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-primary outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Jenis Pesanan</label>
                      <input type="text" value={formData.jenisPesanan || ''} onChange={(e) => setFormData({ ...formData, jenisPesanan: e.target.value })} placeholder="Nasi Box / Snack" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-primary outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Jumlah</label>
                      <input type="text" value={formData.jumlahPesanan || ''} onChange={(e) => setFormData({ ...formData, jumlahPesanan: e.target.value })} placeholder="105 Box" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-primary outline-none" />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ═══ BUKU TAMU KEDINASAN ═══ */}
            {isMamin && (
              <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
                <div className="flex items-center gap-2 text-primary mb-2">
                  <span className="material-symbols-outlined text-lg">import_contacts</span>
                  <span className="text-sm font-bold">Buku Tamu Kedinasan</span>
                </div>
                <p className="text-[10px] text-slate-400 italic">
                  Opsional — diisi jika ada tamu luar (bukan peserta rapat internal).
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="No. Urut" value={bt.noUrut} onChange={(e) => setBt('noUrut', e.target.value)} placeholder="1" />
                  <Field label="Hari/Tanggal" value={bt.tanggal} onChange={(e) => setBt('tanggal', e.target.value)} placeholder="20 Februari 2025" />
                </div>
                <Field label="Ingin bertemu dengan" value={bt.bertemu} onChange={(e) => setBt('bertemu', e.target.value)} placeholder="Kepala Sekolah / Guru / Tendik" />
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Tiba Pukul" value={bt.tiba} onChange={(e) => setBt('tiba', e.target.value)} placeholder="09.00" />
                  <Field label="Kembali Pukul" value={bt.kembali} onChange={(e) => setBt('kembali', e.target.value)} placeholder="11.00" />
                  <Field label="Diterima oleh" options={['Kepala Sekolah', 'Guru', 'Tendik']} value={bt.diterima} onChange={(e) => setBt('diterima', e.target.value)} />
                </div>
                <Field label="Tujuan" value={bt.tujuan} onChange={(e) => setBt('tujuan', e.target.value)} placeholder={bakuTamu006?.bukuTamu?.tujuan || 'Rapat koordinasi ...'} />
                {/* Identitas Tamu */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] font-semibold text-slate-500 uppercase">Identitas Tamu</label>
                    <button type="button" onClick={addBtRow} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-semibold hover:bg-primary/20 transition-all">
                      <span className="material-symbols-outlined text-xs">add</span> Tambah Tamu
                    </button>
                  </div>
                  {(bt.rows || []).length === 0 && (
                    <p className="text-[10px] text-slate-400 italic">Belum ada tamu.</p>
                  )}
                  {(bt.rows || []).map((row) => (
                    <div key={row.id} className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold text-slate-400 w-4">{row.no}</span>
                      <input type="text" value={row.nama} onChange={(e) => updateBtRow(row.id, 'nama', e.target.value)} placeholder="Nama" className="flex-1 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] focus:ring-1 focus:ring-primary outline-none" />
                      <input type="text" value={row.jabatan} onChange={(e) => updateBtRow(row.id, 'jabatan', e.target.value)} placeholder="Jabatan" className="w-32 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] focus:ring-1 focus:ring-primary outline-none" />
                      <input type="text" value={row.alamat} onChange={(e) => updateBtRow(row.id, 'alamat', e.target.value)} placeholder="Alamat Kantor" className="w-40 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] focus:ring-1 focus:ring-primary outline-none" />
                      <button type="button" onClick={() => removeBtRow(row.id)} className="p-1 text-red-500 hover:bg-red-50 rounded-lg"><span className="material-symbols-outlined text-xs">delete</span></button>
                    </div>
                  ))}
                </div>
                <Field label="Uraian Kegiatan / Temuan / Saran / Pesan" textarea rows={3} value={bt.uraian} onChange={(e) => setBt('uraian', e.target.value)} placeholder="Uraian kegiatan/temuan/saran/pesan..." />
              </div>
            )}

            {/* ═══ DAFTAR HADIR ═══ */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
              <div className="flex items-center gap-2 text-primary mb-2">
                <span className="material-symbols-outlined text-lg">badge</span>
                <span className="text-sm font-bold">Daftar Hadir</span>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Keterangan / Judul Acara</label>
                <input type="text" value={formData.judulDaftarHadir || formData.acara || ''} onChange={(e) => setFormData({ ...formData, judulDaftarHadir: e.target.value })} placeholder="Rapat Pemberdayaan Perpustakaan Sekolah" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-primary outline-none" />
              </div>
            </div>

            {/* Daftar Hadir / Daftar Penerima (participant picker) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {isMamin ? 'Daftar Hadir (dari Data Guru / Tendik)' : 'Daftar Penerima Upah (dari Data Guru / Tendik)'}
                </label>
                <button
                  type="button"
                  onClick={() => setShowRecipients((v) => !v)}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-primary to-blue-600 text-white text-sm font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:brightness-110 transition-all active:scale-[0.98]"
                >
                  <span className="material-symbols-outlined text-lg">{showRecipients ? 'expand_less' : 'group_add'}</span>
                  {showRecipients ? 'Tutup Daftar' : `Pilih Peserta${selectedIds.size ? ` (${selectedIds.size})` : ''}`}
                </button>
              </div>

              {showRecipients && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 max-h-56 overflow-y-auto space-y-1">
                  {recipients.length === 0 && (
                    <p className="text-xs text-amber-600 p-2">
                      Belum ada data. Upload Data Guru / Tendik terlebih dahulu.
                    </p>
                  )}
                  {recipients.map((item) => {
                    const key = itemKey(item)
                    const checked = selectedIds.has(key)
                    return (
                      <label
                        key={key}
                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                          checked ? 'bg-primary/10' : 'hover:bg-white'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleRecipient(item)}
                          className="w-4 h-4 accent-primary"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{item.nama}</p>
                          <p className="text-[10px] text-slate-500">
                            {item.jabatan || ''} {item.golongan ? `· ${item.golongan}` : ''}
                          </p>
                        </div>
                      </label>
                    )
                  })}
                </div>
              )}

              {/* Rework-8 (1): Daftar Hadir editor afectada — NO/NAMA/JABATAN/TTD + kolom opsional dinamis.
                  Tanpa kolom Alamat Kantor (warisan buku_tamu tidak dipakai untuk hadir). */}
              {isMamin ? (
                <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-4 overflow-auto">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Tabel Hadir ({(formData.rows || []).length}) — NO / NAMA / JABATAN / TTD
                    </p>
                    <div className="flex items-center gap-1.5">
                      <button type="button" onClick={() => {
                        const cols = [...(formData.hadirKolomOpsional || [])]
                        const n = cols.length + 1
                        const key = `ops${Date.now()}`
                        setFormData({ ...formData, hadirKolomOpsional: [...cols, { key, label: `Kolom ${n}` }] })
                      }} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-semibold hover:bg-primary/20 transition-all">
                        <span className="material-symbols-outlined text-xs">add</span> Tambah Kolom
                      </button>
                      <button type="button" onClick={() => {
                        const rows = [...(formData.rows || [])]
                        rows.push({ id: Date.now(), no: rows.length + 1, nama: '', jabatan: '', ttd: '' })
                        setFormData({ ...formData, rows })
                      }} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-semibold hover:bg-primary/20 transition-all">
                        <span className="material-symbols-outlined text-xs">add</span> Tambah Baris
                      </button>
                    </div>
                  </div>
                  {/* Header kolom opsional (rename + hapus per kolom) */}
                  {(formData.hadirKolomOpsional || []).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {(formData.hadirKolomOpsional || []).map((c) => (
                        <span key={c.key} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[10px]">
                          <input type="text" value={c.label} onChange={(e) => {
                            const cols = (formData.hadirKolomOpsional || []).map((x) => x.key === c.key ? { ...x, label: e.target.value } : x)
                            setFormData({ ...formData, hadirKolomOpsional: cols })
                          }} className="w-20 px-1 py-0.5 bg-white border border-slate-200 rounded text-[10px] outline-none focus:ring-1 focus:ring-primary" />
                          <button type="button" onClick={() => {
                            const cols = (formData.hadirKolomOpsional || []).filter((x) => x.key !== c.key)
                            const rows = (formData.rows || []).map((r) => { const nr = { ...r }; delete nr[c.key]; return nr })
                            setFormData({ ...formData, hadirKolomOpsional: cols, rows })
                          }} className="text-red-500 hover:text-red-700 font-bold" title="Hapus kolom">×</button>
                        </span>
                      ))}
                    </div>
                  )}
                  {(formData.rows || []).length === 0 ? (
                    <p className="text-[10px] text-slate-400 italic">Belum ada peserta — pilih dari daftar di atas atau Tambah Baris manual.</p>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase">
                        <span className="w-5">No</span>
                        <span className="flex-1">Nama</span>
                        <span className="w-28">Jabatan</span>
                        <span className="w-16">TTD</span>
                        {(formData.hadirKolomOpsional || []).map((c) => (
                          <span key={c.key} className="w-20 truncate">{c.label}</span>
                        ))}
                        <span className="w-6" />
                      </div>
                      {(formData.rows || []).map((row) => (
                        <div key={row.id} className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400 w-5">{row.no}</span>
                          <input type="text" value={row.nama || ''} onChange={(e) => updateRow(row.id, 'nama', e.target.value)} placeholder="Nama" className="flex-1 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] focus:ring-1 focus:ring-primary outline-none" />
                          <input type="text" value={row.jabatan || ''} onChange={(e) => updateRow(row.id, 'jabatan', e.target.value)} placeholder="Jabatan" className="w-28 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] focus:ring-1 focus:ring-primary outline-none" />
                          <input type="text" value={row.ttd || ''} onChange={(e) => updateRow(row.id, 'ttd', e.target.value)} placeholder="—" className="w-16 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] focus:ring-1 focus:ring-primary outline-none" />
                          {(formData.hadirKolomOpsional || []).map((c) => (
                            <input key={c.key} type="text" value={row[c.key] || ''} onChange={(e) => updateRow(row.id, c.key, e.target.value)} placeholder={c.label} className="w-20 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] focus:ring-1 focus:ring-primary outline-none" />
                          ))}
                          <button type="button" onClick={() => {
                            const rows = (formData.rows || []).filter((r) => r.id !== row.id).map((r, i) => ({ ...r, no: i + 1 }))
                            setFormData({ ...formData, rows })
                          }} className="p-1 text-red-500 hover:bg-red-50 rounded-lg" title="Hapus baris"><span className="material-symbols-outlined text-xs">delete</span></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                (formData.rows || []).length > 0 && (
                  <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-4 overflow-auto">
                    <TabelDinamis
                      blockConfig={getParticipantTableBlock(card.id)}
                      data={formData}
                      onChange={(field, value) => setFormData((prev) => ({ ...prev, [field]: value }))}
                      mode="edit"
                    />
                  </div>
                )
              )}
            </div>
          </>
        ) : (
          /* Generic template form (Pemeliharaan: Mebeler / Bangunan, dll) */
          config ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 overflow-auto">
              <TemplateEngine templateConfig={config} data={formData} onDataChange={setFormData} mode="edit" />
            </div>
          ) : (
            <p className="text-sm text-amber-600 p-4 bg-amber-50 rounded-xl">
              Template belum tersedia untuk sub-kategori ini.
            </p>
          )
        )}

        {/* Preview button (always) — Sprint 008: panel SELALU render walau
            field kosong ('—' jujur ala SummaryCard); hanya Cetak yg digate
            di Zona C, bukan navigasi preview. */}
        <div className="flex items-center justify-end pt-2">
          <button
            type="button"
            onClick={() => {
              setViewMode('preview')
            }}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg shadow-primary/30 hover:brightness-110 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-lg">list_alt</span>
            Lihat Ringkasan
          </button>
        </div>

        {/* Nomor Popups */}
        {showNomorPopup && (
          <NomorSuratPopup
            onSelect={(nomor) => {
              setFormData({ ...formData, nomor })
              setShowNomorPopup(false)
            }}
            onClose={() => setShowNomorPopup(false)}
            currentNomor={formData.nomor}
          />
        )}
        {showSppdNomorPopup && (
          <NomorSuratPopup
            onSelect={(nomor) => {
              setSppdData({ ...sppdData, nomorSurat: nomor })
              setShowSppdNomorPopup(false)
            }}
            onClose={() => setShowSppdNomorPopup(false)}
            currentNomor={sppdData.nomorSurat}
          />
        )}
        {showSptNomorPopup && (
          <NomorSuratPopup
            onSelect={(nomor) => {
              setFormData({ ...formData, nomorSpt: nomor })
              setShowSptNomorPopup(false)
            }}
            onClose={() => setShowSptNomorPopup(false)}
            currentNomor={formData.nomorSpt}
          />
        )}
        {showUndanganNomorPopup && (
          <NomorSuratPopup
            onSelect={(nomor) => {
              setFormData({ ...formData, nomorUndangan: nomor })
              setShowUndanganNomorPopup(false)
            }}
            onClose={() => setShowUndanganNomorPopup(false)}
            currentNomor={formData.nomorUndangan}
          />
        )}
        {showPesananNomorPopup && (
          <NomorSuratPopup
            onSelect={(nomor) => {
              setFormData({ ...formData, nomorPesanan: nomor })
              setShowPesananNomorPopup(false)
            }}
            onClose={() => setShowPesananNomorPopup(false)}
            currentNomor={formData.nomorPesanan}
          />
        )}
      </div>
    )
  }

  // ═════════════════════════════════════════════════════════════════════
  // RENDER: PREVIEW MAKAN & MINUM (Daftar Hadir + Notulen/Resume)
  // ═════════════════════════════════════════════════════════════════════
  const renderMaminPreview = () => {
    const bukuTamuCfg = TEMPLATE_CONFIGS.buku_tamu
    const notulenCfg = TEMPLATE_CONFIGS.notulen
    const rows = (formData.rows || []).map((r, i) => ({ ...r, no: i + 1 }))
    const pesertaNames = rows.map((r) => r.nama).filter(Boolean).join(', ')

    // Buku Tamu Kedinasan — dari form khusus (formData.bukuTamu)
    const bt = formData.bukuTamu || {}
    const btRows = (bt.rows || []).map((r, i) => ({ ...r, no: i + 1 }))
    const hasBukuTamu = Boolean(bt.noUrut || bt.tanggal || bt.bertemu || btRows.length > 0)
    const bukuTamuData = {
      ...bukuTamuCfg.defaults,
      ...formData,
      noUrut: bt.noUrut || '',
      tanggal: bt.tanggal || formData.tanggal,
      bertemu: bt.bertemu || '',
      tiba: bt.tiba || '',
      kembali: bt.kembali || '',
      diterima: bt.diterima || 'Kepala Sekolah',
      tujuan: bt.tujuan || formData.acara || '',
      uraianKegiatan: bt.uraian || '',
      rows: btRows,
    }
    const notulenData = {
      ...notulenCfg.defaults,
      ...formData,
      nomor: formData.nomor,
      tanggal: formData.tanggal,
      waktu: formData.waktu,
      tempat: formData.tempat,
      acara: formData.acara,
      pimpinan: formData.pimpinan,
      pembuka: formData.pembuka,
      notulen: formData.notulen,
      peserta: formData.peserta || pesertaNames,
      poinPembahasan: Array.isArray(formData.poinPembahasan)
        ? formData.poinPembahasan
        : (formData.resume ? [{ id: 'resume-1', text: formData.resume }] : []),
      rows,
    }

    // ─── Sprint 003 FASE 2: seksi ringkasan Mamin (layar-only, 0 kop 0 TTD) ───
    const HADIR_COLS = [
      { key: 'no', label: 'No' },
      { key: 'nama', label: 'Nama' },
      { key: 'jabatan', label: 'Jabatan' },
    ]
    const maminAcaraSections = () => ([
      { title: 'Detail Acara', fields: [
        { label: 'Nomor Surat', value: formData.nomor },
        { label: 'Tanggal', value: formData.tanggal },
        { label: 'Waktu', value: formData.waktu },
        { label: 'Tempat', value: formData.tempat },
        { label: 'Acara', value: formData.acara },
        { label: 'Resume', value: formData.resume },
      ] },
      { title: `Daftar Hadir (${rows.length})`, table: {
        columns: HADIR_COLS,
        rows: rows.map((r) => ({ id: r.id, no: r.no, nama: r.nama || '', jabatan: r.jabatan || '' })),
      } },
    ])

    const handlePrint = () => {
      const printContainer = document.querySelector('.sk-print-area .print-container')
      if (printContainer) {
        printContainer.classList.remove('portrait', 'landscape')
        printContainer.classList.add('portrait')
      }
      window.print()
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined">description</span>
            <span className="text-sm font-bold">Preview: Makan & Minum — {selectedSub?.label}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setViewMode('form')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-all"
            >
              <span className="material-symbols-outlined text-lg">edit</span>
              Kembali ke Form
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg shadow-primary/30 hover:brightness-110 transition-all"
            >
              <span className="material-symbols-outlined text-lg">print</span>
              Cetak
            </button>
          </div>
        </div>

        {/* Sprint 003 FASE 2: layar = kartu ringkasan (0 kop, 0 TTD).
            Dokumen formal hanya di area cetak Fase 3 di bawah. */}
        <PeringatanData />
        <SummaryCard title="Ringkasan Makan & Minum" icon="list_alt" sections={maminAcaraSections()} />

        {/* Dokumen 1: Buku Tamu Kedinasan (hanya jika diisi) */}
        {hasBukuTamu && (
          <SummaryCard title="Buku Tamu Kedinasan" icon="import_contacts" sections={[
            { title: 'Kunjungan', fields: [
              { label: 'No Urut', value: bukuTamuData.noUrut },
              { label: 'Tanggal', value: bukuTamuData.tanggal },
              { label: 'Bertemu', value: bukuTamuData.bertemu },
              { label: 'Tiba', value: bukuTamuData.tiba },
              { label: 'Kembali', value: bukuTamuData.kembali },
              { label: 'Diterima', value: bukuTamuData.diterima },
              { label: 'Tujuan', value: bukuTamuData.tujuan },
            ] },
            { title: `Tamu (${btRows.length})`, table: {
              columns: HADIR_COLS,
              rows: btRows.map((r) => ({ id: r.id, no: r.no, nama: r.nama || '', jabatan: r.jabatan || '' })),
            } },
          ]} />
        )}

        {/* Dokumen 2: Notulen / Resume */}
        <SummaryCard title="Notulen / Resume" icon="description" sections={[
          { title: 'Rapat', fields: [
            { label: 'Nomor', value: notulenData.nomor },
            { label: 'Tanggal', value: notulenData.tanggal },
            { label: 'Waktu', value: notulenData.waktu },
            { label: 'Tempat', value: notulenData.tempat },
            { label: 'Acara', value: notulenData.acara },
            { label: 'Pimpinan', value: notulenData.pimpinan },
            { label: 'Peserta', value: notulenData.peserta },
            { label: 'Poin', value: notulenData.poinPembahasan },
          ] },
        ]} />

        {/* Dokumen 2b: Daftar Hadir (sudah tercakup di kartu utama) */}

        {/* Dokumen 3: Surat Undangan */}
        {(formData.nomorUndangan || formData.kepadaUndangan || formData.isiUndangan) && (
          <SummaryCard title="Surat Undangan" icon="mail" sections={[
            { title: 'Undangan', fields: [
              { label: 'Nomor', value: formData.nomorUndangan },
              { label: 'Kepada', value: formData.kepadaUndangan },
              { label: 'Tanggal Acara', value: formData.tanggalAcara || formData.tanggal },
              { label: 'Tempat Acara', value: formData.tempatAcara || formData.tempat },
              { label: 'Isi', value: formData.isiUndangan || formData.acara },
            ] },
          ]} />
        )}

        {/* Dokumen 4: Surat Pesanan */}
        {(formData.nomorPesanan || formData.kepadaPesanan || (formData.pesananRows || []).length > 0) && (
          <SummaryCard title="Surat Pesanan" icon="shopping_cart" sections={[
            { title: 'Pesanan', fields: [
              { label: 'Nomor', value: formData.nomorPesanan },
              { label: 'Kepada', value: formData.kepadaPesanan },
              { label: 'Kegiatan', value: formData.isiPesanan || formData.acara },
              { label: 'Item', value: (formData.pesananRows || []).length },
            ] },
          ]} />
        )}

        {/* ─── Sprint 003 FASE 3: area cetak Mamin = 5 dokumen formal kop→TTD.
            .sk-print-area: hidden di layar, block saat print; tiap .sk-doc-print
            ganti halaman (anti-terpotong). Builder data dipakai ulang apa adanya. */}
        <div className="sk-print-area">
          <div className="sk-doc-print">
            <TemplateEngine templateConfig={TEMPLATE_CONFIGS.undangan_mamin} data={{
              ...TEMPLATE_CONFIGS.undangan_mamin.defaults,
              ...formData,
              tanggalSurat: formData.tanggalSurat || 'Cikalongwetan, ...',
              hariUndangan: formData.hariUndangan || formData.hari || '',
              tanggalAcara: formData.tanggalAcara || formData.tanggal || '',
              tempatAcara: formData.tempatAcara || formData.tempat || '',
              waktuAcara: formData.waktuAcara || formData.waktu || '',
              kegiatan: formData.isiUndangan || formData.acara || '',
            }} mode="print" />
          </div>
          <div className="sk-doc-print">
            <TemplateEngine templateConfig={TEMPLATE_CONFIGS.pesanan_mamin} data={{
              ...TEMPLATE_CONFIGS.pesanan_mamin.defaults,
              ...formData,
              tanggalSurat: formData.tanggalSurat || 'Cikalongwetan, ...',
              kegiatan: formData.isiPesanan || formData.acara || '',
              rows: (formData.pesananRows || []).map((r, i) => ({ ...r, no: i + 1 })),
            }} mode="print" />
          </div>
          <div className="sk-doc-print">
            <TemplateEngine templateConfig={notulenCfg} data={notulenData} mode="print" />
          </div>
          <div className="sk-doc-print">
            <TemplateEngine templateConfig={TEMPLATE_CONFIGS.daftar_hadir} data={{
              ...TEMPLATE_CONFIGS.daftar_hadir.defaults,
              judulAcara: formData.judulDaftarHadir || formData.acara || '',
              rows,
            }} mode="print" />
          </div>
          {hasBukuTamu && (
            <div className="sk-doc-print">
              <TemplateEngine templateConfig={bukuTamuCfg} data={bukuTamuData} mode="print" />
            </div>
          )}
        </div>
      </div>
    )
  }

  // ═════════════════════════════════════════════════════════════════════
  // RENDER: SK HONORER (per-recipient)
  // ═════════════════════════════════════════════════════════════════════
  const renderSkHonorer = () => {
    const skConfig = TEMPLATE_CONFIGS.sk_honorer
    if (!skConfig) return null
    const rows = formData.rows || []
    if (rows.length === 0) {
      return (
        <p className="text-sm text-slate-500 p-6 text-center">
          Belum ada penerima yang dipilih. Pilih penerima terlebih dahulu.
        </p>
      )
    }
    // Pasal: pakai data terbaru di form, fallback template tersimpan, terakhir standar
    const pasal = formData.pasal || loadSkPasal() || cloneDefaultPasal()
    const setPasal = (p) => {
      setFormData({ ...formData, pasal: p })
      saveSkPasal(p)
    }
    const buildSkData = (row) => ({
      ...skConfig.defaults,
      ...formData,
      pasal,
      nomorSurat: formData.nomor || '',
      // PIHAK KEDUA (Guru Honorer) — dari row + Data Guru/Tendik
      namaPihakKedua: row.nama || '',
      ttlPihakKedua: row.ttl || row.tempatLahir || '',
      pendidikanPihakKedua: row.pendidikan || '',
      alamatPihakKedua: row.alamat || '',
      kelasGuru: row.kelasGuru || '',
      // PIHAK KESATU — dari sekolah
      namaPihakKesatu: formData.namaPihakKesatu || skConfig.defaults.namaPihakKesatu,
      nipPihakKesatu: formData.nipPihakKesatu || skConfig.defaults.nipPihakKesatu,
      jabatanPihakKesatu: formData.jabatanPihakKesatu || skConfig.defaults.jabatanPihakKesatu,
      tempatTtd: formData.tempatTtd || skConfig.defaults.tempatTtd,
      tanggalTtd: formData.tanggalTtd || '',
    })
    const skList = rows.map((row) => ({ row, skData: buildSkData(row) }))
    return (
      <SkHonorerEditor
        skList={skList}
        pasal={pasal}
        onPasalChange={setPasal}
        onResetPasal={() => setPasal(cloneDefaultPasal())}
        onUpdateRow={updateRow}
        onRemoveRow={(row) => toggleRecipient({ ...row, __remove: true })}
        onUpdateForm={(key, value) => setFormData({ ...formData, [key]: value })}
      />
    )
  }

  // ═════════════════════════════════════════════════════════════════════
  // RENDER: PREVIEW
  // ═════════════════════════════════════════════════════════════════════
  const renderPreview = () => {
    if (isMamin) return renderMaminPreview()
    const config = TEMPLATE_CONFIGS[selectedSub?.templateId]
    if (!config) {
      return <p className="text-sm text-slate-500 p-6">Template belum tersedia.</p>
    }
    const previewData = buildPreviewData(config.id, {
      ...config.defaults,
      ...formData,
      nomor: formData.nomor,
    })
    // Sembunyikan blok signature di preview, tampilkan saat print saja
    const configWithoutSignature = {
      ...config,
      blocks: (config.blocks || []).filter((b) => b.type !== 'signature'),
    }
    // Tab Daftar Penerima: preview hanya menampilkan tabel (tanpa judul & info keuangan)
    // Kolom TTD juga dihapus dari preview — tetap muncul saat cetak
    const tableOnlyConfig = {
      ...config,
      blocks: (config.blocks || [])
        .filter((b) => b.type === 'table-dinamis')
        .map((b) => ({
          ...b,
          columns: (b.columns || []).filter((c) => c.key !== 'ttd' && c.key !== 'ttd2'),
        })),
    }
    const tRows = formData.rows || []
    const showTabs = isRecipientBased && tRows.length > 0
    const isDaftarTab = showTabs && previewTab === 'daftar'

    // ─── Data dokumen per penerima ───
    // Sprint 001 FASE 4 task 4.1 (auto-fill + D-8): TTD diisi dari
    // getSignatureRoles() — pengganti defaults yang dikosongkan 4.2–4.5.
    // Prioritas: ketikan user (formData) → Data Sekolah → '' (jujur-kosong).
    const sig = getSignatureRoles()
    const buildSptData = (row) => ({
      ...TEMPLATE_CONFIGS.spt.defaults,
      ...formData,
      namaPenandatangan: formData.namaPenandatangan || sig['kepala-sekolah']?.nama || '',
      nipPenandatangan: formData.nipPenandatangan || sig['kepala-sekolah']?.nip || '',
      namaMengetahui: formData.namaMengetahui || sig['ketua-gugus']?.nama || '',
      nipMengetahui: formData.nipMengetahui || sig['ketua-gugus']?.nip || '',
      nomorSpt: formData.nomorSpt || '',
      nama: row.nama || '',
      sptNip: row.sptNip || row.nip || row.nuptk || '-',
      sptPangkat: row.sptPangkat || '-',
      sptJabatan: row.sptJabatan || row.jabatan || '',
      sptUntuk: formData.sptUntuk || sppdData.tujuan || '',
      sptHari: formData.sptHari || '',
      sptTanggal: formData.sptTanggal || sppdData.tanggal || '',
      sptTempat: formData.sptTempat || sppdData.tempat || '',
      tanggalSpt: formData.tanggalSpt || '',
    })

    const buildSppdData = (row) => ({
      ...TEMPLATE_CONFIGS.sppd.defaults,
      ...formData,
      ...sppdData,
      namaPenandatangan: formData.namaPenandatangan || sig['kepala-sekolah']?.nama || '',
      nipPenandatangan: formData.nipPenandatangan || sig['kepala-sekolah']?.nip || '',
      namaMengetahui: formData.namaMengetahui || sig['ketua-gugus']?.nama || '',
      nipMengetahui: formData.nipMengetahui || sig['ketua-gugus']?.nip || '',
      nomorSurat: sppdData.nomorSurat || '',
      nama: row.nama || '',
      sppdNip: row.sppdNip || row.nip || row.nuptk || '-',
      sppdPangkat: row.sppdPangkat || '-',
      sppdJabatan: row.sppdJabatan || row.jabatan || '',
      sppdTingkat: row.sppdTingkat || '',
      tempatBerangkat: sppdData.tempatBerangkat || sppdData.tempat || '',
      tempatTujuan: sppdData.tempatTujuan || sppdData.tempat || '',
      tanggalBerangkat: sppdData.tanggalBerangkat || sppdData.tanggal || '',
      tanggalKembali: sppdData.tanggalKembali || sppdData.tanggal || '',
      padaTanggal: sppdData.padaTanggal || sppdData.tanggal || '',
      lama: sppdData.lama || '1 (satu) hari',
      maksud: sppdData.maksud || sppdData.tujuan || '',
    })

    // Sprint 003 FASE 2: jalur LAYAR = kartu ringkasan (0 kop, 0 TTD).
    // Builder data dipakai seksi; dokumen formal hanya dirender jalur CETAK (Fase 3).

    // ─── Data Resume / Undangan ───
    const resumeData = {
      ...TEMPLATE_CONFIGS.notulen.defaults,
      ...formData,
      // D-8: jalur notulen WAJIB diisi — SignatureFooter baca key ttd_${role}_nama
      // (templateConfig signature ['pimpinan','notulen']); tanpa ini TTD kosong permanen.
      ttd_pimpinan_nama: formData.ttd_pimpinan_nama || sig['pimpinan']?.nama || '',
      ttd_pimpinan_nip: formData.ttd_pimpinan_nip || sig['pimpinan']?.nip || '',
      ttd_notulen_nama: formData.ttd_notulen_nama || sig['notulen']?.nama || '',
      ttd_notulen_nip: formData.ttd_notulen_nip || sig['notulen']?.nip || '',
      hari: formData.hariSpt || '',
      tanggal: sppdData.tanggal || '',
      tempat: sppdData.tempat || '',
      acara: formData.acara || sppdData.tujuan || '',
      poinPembahasan: formData.resume ? [{ id: 'resume-1', text: formData.resume }] : [],
    }
    const undanganData = {
      ...TEMPLATE_CONFIGS.undangan_gugus.defaults,
      ...formData,
      // Sprint 001 FASE 3 (task 3.4/3.5/3.6): KopGugus prop-driven — data gugus +
      // kabupaten + logo gugus diisi di sini dari Data Sekolah (blok TIDAK baca storage).
      gugusNama: formData.gugusNama || getSchoolData().gugusNama || '',
      gugusAlamat: formData.gugusAlamat || getSchoolData().gugusAlamat || '',
      kabupaten: formData.kabupaten || getSchoolData().kabupaten || '',
      provinsi: formData.provinsi || getSchoolData().provinsi || '',
      logoGugus: storageHelper.get('logo_gugus', null),
      // Task 4.1: TTD undangan dari Data Sekolah (pengganti defaults 4.4).
      namaKetuaGugus: formData.namaKetuaGugus || sig['ketua-gugus']?.nama || '',
      nipKetuaGugus: formData.nipKetuaGugus || sig['ketua-gugus']?.nip || '',
      tanggalSurat: formData.tanggalSurat || '',
      hariUndangan: formData.hariUndangan || '',
      tanggalAcara: formData.tanggalAcara || sppdData.tanggal || '',
      tempatAcara: formData.tempatAcara || sppdData.tempat || '',
      isiUndangan: formData.isiUndangan || '',
      // ADR 2026-09-14: field "Sifat" dipertahankan, default '-' ikut tercetak
      sifatUndangan: formData.sifatUndangan || '-',
    }

    // ─── Sprint 003 FASE 2: section builder kartu ringkasan (layar-only) ───
    // 0 kop, 0 TTD: nama penandatangan/NIP/kop gugus SENGAJA tidak masuk seksi —
    // mereka milik jalur CETAK (Fase 3) yang memakai builder di atas apa adanya.
    const RECIPIENT_COLS = [
      { key: 'no', label: 'No' },
      { key: 'nama', label: 'Nama' },
      { key: 'nip', label: 'NIP/NUPTK' },
      { key: 'jabatan', label: 'Jabatan' },
    ]
    const recipientRows = tRows.map((r, i) => ({
      id: r.id, no: i + 1, nama: r.nama || '', nip: r.nip || r.nuptk || '', jabatan: r.jabatan || '',
    }))
    const sptSections = (row) => {
      const d = buildSptData(row)
      return [
        { title: 'Penerima Tugas', fields: [
          { label: 'Nama', value: d.nama },
          { label: 'NIP', value: d.sptNip },
          { label: 'Pangkat', value: d.sptPangkat },
          { label: 'Jabatan', value: d.sptJabatan },
        ] },
        { title: 'Isi Penugasan', fields: [
          { label: 'Nomor SPT', value: d.nomorSpt },
          { label: 'Untuk', value: d.sptUntuk },
          { label: 'Hari', value: d.sptHari },
          { label: 'Tanggal', value: d.sptTanggal },
          { label: 'Tempat', value: d.sptTempat },
        ] },
      ]
    }
    const sppdSections = (row) => {
      const d = buildSppdData(row)
      return [
        { title: 'Pelaksana', fields: [
          { label: 'Nama', value: d.nama },
          { label: 'NIP', value: d.sppdNip },
          { label: 'Pangkat', value: d.sppdPangkat },
          { label: 'Jabatan', value: d.sppdJabatan },
        ] },
        { title: 'Perjalanan', fields: [
          { label: 'Nomor SPPD', value: d.nomorSurat },
          { label: 'Maksud', value: d.maksud },
          { label: 'Berangkat', value: d.tempatBerangkat },
          { label: 'Tujuan', value: d.tempatTujuan },
          { label: 'Tgl Berangkat', value: d.tanggalBerangkat },
          { label: 'Tgl Kembali', value: d.tanggalKembali },
          { label: 'Lama', value: d.lama },
        ] },
      ]
    }
    const resumeSections = () => ([
      { title: 'Acara', fields: [
        { label: 'Hari', value: resumeData.hari },
        { label: 'Tanggal', value: resumeData.tanggal },
        { label: 'Tempat', value: resumeData.tempat },
        { label: 'Acara', value: resumeData.acara },
      ] },
      { title: 'Poin Pembahasan', fields: [
        { label: 'Resume', value: (resumeData.poinPembahasan || []).map((p) => p.text) },
      ] },
    ])
    const undanganSections = () => ([
      { title: 'Surat Undangan', fields: [
        { label: 'Nomor', value: formData.nomorUndangan },
        { label: 'Tanggal Surat', value: undanganData.tanggalSurat },
        { label: 'Hari Acara', value: undanganData.hariUndangan },
        { label: 'Tanggal Acara', value: undanganData.tanggalAcara },
        { label: 'Tempat Acara', value: undanganData.tempatAcara },
        { label: 'Sifat', value: undanganData.sifatUndangan },
        { label: 'Isi', value: undanganData.isiUndangan },
        { label: 'Tembusan', value: formData.tembusanItems },
      ] },
    ])
    const daftarSections = () => ([
      { title: 'Informasi Perjalanan', fields: [
        { label: 'Nomor', value: formData.nomor },
        { label: 'Kegiatan', value: sppdData.tujuan },
        { label: 'Tanggal', value: sppdData.tanggal },
        { label: 'Tempat', value: sppdData.tempat },
        { label: 'Lama', value: sppdData.lama },
      ] },
      { title: `Daftar Penerima (${recipientRows.length})`, table: { columns: RECIPIENT_COLS, rows: recipientRows } },
    ])
    const maminSections = () => ([
      { title: isMamin ? 'Detail Acara' : 'Detail Pekerjaan', fields: [
        { label: 'Nomor Surat', value: formData.nomor },
        ...(isMamin ? [
          { label: 'Tanggal', value: formData.tanggal },
          { label: 'Waktu', value: formData.waktu },
          { label: 'Tempat', value: formData.tempat },
          { label: 'Acara', value: formData.acara },
          { label: 'Resume', value: formData.resume },
        ] : [
          { label: 'Bulan', value: formData.bulan },
          { label: 'Tahun', value: formData.tahun },
        ]),
      ] },
      { title: `Daftar Hadir (${recipientRows.length})`, table: { columns: RECIPIENT_COLS, rows: recipientRows } },
    ])

    const handlePrint = () => {
      const printContainer = document.querySelector('.sk-print-area .print-container')
      if (printContainer) {
        printContainer.classList.remove('portrait', 'landscape')
        printContainer.classList.add(config.orientation || 'portrait')
      }
      window.print()
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined">description</span>
            <span className="text-sm font-bold">Preview: {card.nama} — {selectedSub?.label}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setViewMode('form')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-all"
            >
              <span className="material-symbols-outlined text-lg">edit</span>
              Kembali ke Form
            </button>
            {/* Di tab SK Honorer, tombol cetak ada di toolbar review (sk-print-area) */}
            {!(showTabs && previewTab === 'sk') && (
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg shadow-primary/30 hover:brightness-110 transition-all"
              >
                <span className="material-symbols-outlined text-lg">print</span>
                Cetak Semua
              </button>
            )}
          </div>
        </div>

        {/* Sprint 001 FASE 5 (task 5.3): peringatan data kosong di area Perjalanan
            Dinas. Sprint 003: tab kini kartu ringkasan — banner tetap di sini
            (di luar print-container, tidak ikut cetak). */}
        {isTransport && <PeringatanData />}

        {/* Tabs (recipient-based docs: Honor / Transport) */}
        {showTabs && (
          <div className="flex gap-2 border-b border-slate-200 pb-0">
            {isTransport ? (
              getTransportTabs(selectedSub?.id).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setPreviewTab(t.id)}
                  className={`px-5 py-2.5 rounded-t-xl text-sm font-semibold transition-all border-b-2 -mb-[1px] ${
                    previewTab === t.id
                      ? 'bg-white border-primary text-primary'
                      : 'bg-slate-50 border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm align-middle mr-1">{t.icon}</span>
                  {t.label}
                </button>
              ))
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setPreviewTab('daftar')}
                  className={`px-5 py-2.5 rounded-t-xl text-sm font-semibold transition-all border-b-2 -mb-[1px] ${
                    previewTab === 'daftar'
                      ? 'bg-white border-primary text-primary'
                      : 'bg-slate-50 border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm align-middle mr-1">table_chart</span>
                  Daftar Penerima
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab('sk')}
                  className={`px-5 py-2.5 rounded-t-xl text-sm font-semibold transition-all border-b-2 -mb-[1px] ${
                    previewTab === 'sk'
                      ? 'bg-white border-primary text-primary'
                      : 'bg-slate-50 border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm align-middle mr-1">gavel</span>
                  SK Honorer ({(formData.rows || []).length})
                </button>
              </>
            )}
          </div>
        )}

        {/* Transport: tab content — kartu ringkasan (layar), bukan dokumen formal */}
        {isTransport && (
          <>
            {/* Tanpa penerima: ringkasan daftar saja */}
            {!showTabs && (
              <SummaryCard title={`Ringkasan — ${selectedSub?.label || ''}`} icon="table_chart" sections={daftarSections()} />
            )}
            {showTabs && previewTab === 'daftar' && (
              <SummaryCard title="Ringkasan Daftar Penerima" icon="table_chart" sections={daftarSections()} />
            )}
            {showTabs && previewTab === 'spt' && (
              <div className="space-y-4">
                {tRows.map((row) => (
                  <SummaryCard key={`spt-${row.id}`} title={`SPT — ${row.nama || 'Tanpa nama'}`} icon="assignment" sections={sptSections(row)} />
                ))}
              </div>
            )}
            {showTabs && previewTab === 'sppd' && (
              <div className="space-y-4">
                {tRows.map((row) => (
                  <SummaryCard key={`sppd-${row.id}`} title={`SPPD — ${row.nama || 'Tanpa nama'}`} icon="directions_car" sections={sppdSections(row)} />
                ))}
              </div>
            )}
            {showTabs && previewTab === 'resume' && getTransportTabs(selectedSub?.id).some((t) => t.id === 'resume') && (
              <SummaryCard title="Resume / Notulen" icon="description" sections={resumeSections()} />
            )}
            {showTabs && previewTab === 'undangan' && getTransportTabs(selectedSub?.id).some((t) => t.id === 'undangan') && (
              <SummaryCard title="Surat Undangan" icon="mail" sections={undanganSections()} />
            )}
          </>
        )}

        {/* Sprint 003 FASE 2 (US-20): preview Pemeliharaan = kartu ringkasan.
            (Mamin punya renderMaminPreview sendiri di atas.)
            Jalur Honor (sk) di bawah TIDAK diubah (US-25). */}
        {isPemeliharaan && (
          <>
            <PeringatanData />
            <SummaryCard title={`Ringkasan — ${card.nama} — ${selectedSub?.label || ''}`} icon="list_alt" sections={maminSections()} />
          </>
        )}

        {/* Non-transport: Tab Content — Daftar Penerima + SK Honorer */}
        {(!showTabs || previewTab === 'daftar') && !isTransport && !isMamin && !isPemeliharaan && (
          <div
            className={
              isDaftarTab
                ? 'sk-screen-only'
                : 'bg-white rounded-2xl border border-slate-200 shadow-sm p-4 overflow-auto'
            }
          >
            <TemplateEngine
              templateConfig={isDaftarTab ? tableOnlyConfig : configWithoutSignature}
              data={previewData}
              mode="print"
            />
          </div>
        )}

        {/* Area cetak Daftar Penerima: dokumen lengkap (judul + info keuangan + tabel + ttd) */}
        {isDaftarTab && !isTransport && (
          <div className="sk-print-area">
            <TemplateEngine templateConfig={config} data={previewData} mode="print" />
          </div>
        )}

        {/* Non-transport: Tab Content SK Honorer */}
        {showTabs && previewTab === 'sk' && !isTransport && renderSkHonorer()}

        {/* ─── Sprint 003 FASE 3 (US-22): area cetak Perjalanan Dinas = 5 dokumen
            formal kop→TTD berurutan: penerima → undangan → SPT → SPD → resume.
            Builder data dipakai ulang apa adanya; tiap .sk-doc-print ganti
            halaman (anti-terpotong, task 3.2). Layar: hidden. */}
        {isTransport && (
          <div className="sk-print-area">
            <div className="sk-doc-print">
              <TemplateEngine templateConfig={config} data={previewData} mode="print" />
            </div>
            {getTransportTabs(selectedSub?.id).some((t) => t.id === 'undangan') && (
              <div className="sk-doc-print">
                <TemplateEngine templateConfig={TEMPLATE_CONFIGS.undangan_gugus} data={undanganData} mode="print" />
              </div>
            )}
            {tRows.map((row) => (
              <div key={`print-spt-${row.id}`} className="sk-doc-print">
                <TemplateEngine templateConfig={TEMPLATE_CONFIGS.spt} data={buildSptData(row)} mode="print" />
              </div>
            ))}
            {tRows.map((row) => (
              <div key={`print-sppd-${row.id}`} className="sk-doc-print">
                <TemplateEngine templateConfig={TEMPLATE_CONFIGS.sppd} data={buildSppdData(row)} mode="print" />
              </div>
            ))}
            {getTransportTabs(selectedSub?.id).some((t) => t.id === 'resume') && (
              <div className="sk-doc-print">
                <TemplateEngine templateConfig={TEMPLATE_CONFIGS.notulen} data={resumeData} mode="print" />
              </div>
            )}
          </div>
        )}

        {/* ─── Sprint 003 FASE 3: area cetak Pemeliharaan = dokumen formal penuh.
            (Fase 2 mengganti layar jadi SummaryCard yang tidak ikut cetak —
            tanpa ini cetakan Pemeliharaan kosong.) */}
        {isPemeliharaan && (
          <div className="sk-print-area">
            <div className="sk-doc-print">
              <TemplateEngine templateConfig={config} data={previewData} mode="print" />
            </div>
          </div>
        )}
      </div>
    )
  }

  return viewMode === 'preview' ? renderPreview() : renderForm()
}
