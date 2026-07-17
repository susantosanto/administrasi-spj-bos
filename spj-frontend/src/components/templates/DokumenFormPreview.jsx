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
import TabelDinamis from './blocks/TabelDinamis'
import NomorSuratPopup from './blocks/NomorSuratPopup'
import { TEMPLATE_CONFIGS } from '../../data/templateConfig'
import {
  getGuruHonorer,
  getTendikHonorer,
  getPerpustakaanStaff,
  getPenjagaStaff,
} from '../../utils/honorHelper'
import { findBkuNominal } from '../../utils/bkuHelper'
import { generateRingkasanNotulen } from '../../utils/aiHelper'
import { useToast } from '../ui/Toast'

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
    return [...g, ...t, ...p, ...j]
  }
  // Makan & Minum (Daftar Hadir) & Pemeliharaan (Daftar Penerima Upah)
  if (cardId === 'mamin' || cardId === 'pemeliharaan') {
    return [...g, ...t, ...p, ...j]
  }
  return []
}

function itemKey(item) {
  return item.nip || item.nuptk || item.nama || String(Math.random())
}

const HONOR_REK = '5.1.02.02.01' // Kode rekening Honorarium
const TRANSPORT_REK = '5.1.02.04' // Kode rekening Transport
const UPAH_REK = '5.1.02.02.01.0016' // Kode rekening Upah Kerja

function buildHonorRow(item, no, bulanName) {
  const nominal = findBkuNominal({ nama: item.nama, bulanName, kodeRekeningPrefix: HONOR_REK })
  return {
    id: itemKey(item),
    no,
    nama: item.nama || '',
    nuptk: item.nuptk || '',
    jabatan: item.jabatan || '',
    jumlah: nominal != null ? String(nominal) : '',
    golRuang: item.golongan || 'GTT',
    volume: '1',
    satuan: 'Bulan',
    pph: '',
    diterima: '',
    ttd: '',
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
  onClose,
}) {
  const [showRecipients, setShowRecipients] = useState(false)
  const [showNomorPopup, setShowNomorPopup] = useState(false)
  const [showSppdNomorPopup, setShowSppdNomorPopup] = useState(false)
  const [generatingRingkasan, setGeneratingRingkasan] = useState(false)
  const toast = useToast()

  const isTransport = card.id === 'perjalanan_dinas'
  const isMamin = card.id === 'mamin'
  const isPemeliharaanUpah = card.id === 'pemeliharaan' && selectedSub?.id === 'alat'
  const isRecipientBased = card.id === 'honor' || isTransport
  const isMaminOrUpah = isMamin || isPemeliharaanUpah
  const hasSubTabs = card.subKategori && !card.subKategori.every((s) => s.comingSoon)

  const recipients = (isRecipientBased || isMaminOrUpah)
    ? getRecipientsFor(card.id, selectedSub?.id)
    : []
  const selectedIds = new Set((formData.rows || []).map((r) => r.id))

  // SPPD rows auto from transport rows
  useEffect(() => {
    if (!isTransport) return
    const transportRows = formData.rows || []
    setSppdData((prev) => ({
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
      else if (isMaminOrUpah) newRow = buildParticipantRow(item, rows.length + 1)
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
            {/* Periode */}
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

            {/* Nomor Surat */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Nomor Surat {isTransport ? 'Transport' : ''}
              </label>
              <div className="flex items-center gap-2">
                <input
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

            {/* SPPD Nomor (transport only) */}
            {isTransport && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Nomor Surat SPPD (Terpisah)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={sppdData.nomorSurat || ''}
                      onChange={(e) => setSppdData({ ...sppdData, nomorSurat: e.target.value })}
                      placeholder="427/SPD-001/SDN-PSR/VII/2026"
                      className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSppdNomorPopup(true)}
                      className="p-3 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                      title="Generate nomor SPPD"
                    >
                      <span className="material-symbols-outlined">auto_awesome</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tujuan</label>
                    <input
                      type="text"
                      value={sppdData.tujuan || ''}
                      onChange={(e) => setSppdData({ ...sppdData, tujuan: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tempat</label>
                    <input
                      type="text"
                      value={sppdData.tempat || ''}
                      onChange={(e) => setSppdData({ ...sppdData, tempat: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tanggal</label>
                    <input
                      type="date"
                      value={sppdData.tanggal || ''}
                      onChange={(e) => setSppdData({ ...sppdData, tanggal: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Lama</label>
                    <input
                      type="text"
                      value={sppdData.lama || ''}
                      onChange={(e) => setSppdData({ ...sppdData, lama: e.target.value })}
                      placeholder="1 hari"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Pilih Penerima */}
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
              </>
            )}

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

              {(formData.rows || []).length > 0 && (
                <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-4 overflow-auto">
                  <TabelDinamis
                    blockConfig={getParticipantTableBlock(card.id)}
                    data={formData}
                    onChange={(field, value) => setFormData((prev) => ({ ...prev, [field]: value }))}
                    mode="edit"
                  />
                </div>
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

        {/* Preview button (always) */}
        <div className="flex items-center justify-end pt-2">
          <button
            type="button"
            onClick={() => {
              if ((isRecipientBased || isMaminOrUpah) && (formData.rows || []).length === 0) {
                toast.error('Pilih minimal 1 penerima terlebih dahulu.')
                return
              }
              setViewMode('preview')
            }}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg shadow-primary/30 hover:brightness-110 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-lg">visibility</span>
            Preview Dokumen
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

    const bukuTamuData = {
      ...bukuTamuCfg.defaults,
      ...formData,
      nomor: formData.nomor,
      tanggal: formData.tanggal,
      waktu: formData.waktu,
      tempat: formData.tempat,
      acara: formData.acara,
      rows,
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
      poinPembahasan: formData.resume || formData.poinPembahasan,
      rows,
    }

    const handlePrint = () => {
      const printContainer = document.querySelector('.print-container')
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

        {/* Dokumen 1: Daftar Hadir (Buku Tamu) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 overflow-auto">
          <div className="flex items-center gap-2 text-emerald-700 mb-3">
            <span className="material-symbols-outlined">groups</span>
            <span className="text-sm font-bold">Daftar Hadir (Buku Tamu)</span>
          </div>
          <TemplateEngine templateConfig={bukuTamuCfg} data={bukuTamuData} mode="print" />
        </div>

        {/* Dokumen 2: Notulen / Resume */}
        <div className="bg-white rounded-2xl border border-blue-200 shadow-sm p-4 overflow-auto">
          <div className="flex items-center gap-2 text-blue-700 mb-3">
            <span className="material-symbols-outlined">description</span>
            <span className="text-sm font-bold">Notulen / Resume</span>
          </div>
          <TemplateEngine templateConfig={notulenCfg} data={notulenData} mode="print" />
        </div>
      </div>
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
    const sppdPreview = isTransport
      ? {
          ...TEMPLATE_CONFIGS.sppd.defaults,
          ...sppdData,
          nomorSurat: sppdData.nomorSurat,
          rows: (sppdData.rows || []).map((r, i) => ({ ...r, no: i + 1 })),
        }
      : null

    const handlePrint = () => {
      const printContainer = document.querySelector('.print-container')
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
            <span className="text-sm font-bold">Preview: {selectedSub?.label}</span>
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

        {/* Dokumen Utama */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 overflow-auto">
          <TemplateEngine templateConfig={config} data={previewData} mode="print" />
        </div>

        {/* SPPD (transport only) */}
        {isTransport && sppdPreview && (sppdPreview.rows || []).length > 0 && (
          <div className="bg-white rounded-2xl border border-blue-200 shadow-sm p-4 overflow-auto">
            <div className="flex items-center gap-2 text-blue-700 mb-3">
              <span className="material-symbols-outlined">assignment</span>
              <span className="text-sm font-bold">Surat Perintah Tugas (SPPD)</span>
            </div>
            <TemplateEngine templateConfig={TEMPLATE_CONFIGS.sppd} data={sppdPreview} mode="print" />
          </div>
        )}
      </div>
    )
  }

  return viewMode === 'preview' ? renderPreview() : renderForm()
}
