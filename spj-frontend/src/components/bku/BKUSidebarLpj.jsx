/**
 * BKUSidebarLpj — tab "Dokumen LPJ" di sidebar BKU (Sprint 017).
 *
 * Membaca baris BKU yang diklik (NoBukti) lalu menampilkan SELURUH form +
 * panel preview kategori itu — komponen yang sama dengan halaman Dokumen LPJ
 * (`DetailDokumenLpj`, layout 'stack').
 *
 * Aturan:
 * - Isi disimpan per NoBukti (`spj_lpj_bku`); hanya saat tombol Simpan ditekan.
 * - Tidak ada NoBukti → panel tetap terbuka, tombol Simpan mati (E-1).
 * - Preview SELALU tampil; kalau field wajib belum lengkap hanya muncul peringatan.
 */
import { useState } from 'react'
import DetailDokumenLpj from '../dokumen/DetailDokumenLpj'
import { cardBerpanel } from '../../data/kategoriLpj'
import { TEMPLATE_CONFIGS } from '../../data/templateConfig'
import { buildPreviewDocs } from '../../utils/previewDocs'
import { bangunPrefillLpj } from '../../utils/prefillLpj'
import { bacaEntri, simpanEntri, noBuktiSah } from '../../utils/lpjBkuStore'
import { cekKelengkapan, peringatanDariPelanggaran } from '../../utils/fieldWajib'
import { readinessCheck, sorotPelanggaran } from '../templates/SummaryCard'
import { snapshotSebelumTimpa } from '../../utils/aturanUndangan'
import storageHelper from '../../utils/storageHelper'
import { useToast } from '../ui/Toast'

const rp = (n) => `Rp ${(n || 0).toLocaleString('id-ID')}`

/**
 * Muat kondisi awal SEKALI (bukan di useEffect): entri tersimpan menang,
 * kalau belum ada → isi otomatis dari baris BKU. Dipanggil dari inisialisasi
 * useState supaya tidak ada kedipan prefill sebelum data tersimpan muncul.
 * `BKUSidebar` memberi `key={row}` sehingga komponen me-mount ulang per baris.
 */
function muatAwal({ card, transaction, bkuPrefill }) {
  if (!card) return null
  const entri = bacaEntri(card.id, transaction?.noBukti)
  if (entri) {
    const sub = card.subKategori?.find((s) => s.id === entri.subId)
      || card.subKategori?.find((s) => !s.comingSoon) || null
    return {
      sub, formData: entri.formData || {}, sppdData: entri.sppdData || {},
      prefillBadge: null, savedAt: entri.savedAt || null,
      viewMode: 'form', formTab: 'daftar', previewTab: 'daftar',
    }
  }
  const hasil = bangunPrefillLpj({ card, bku: bkuPrefill || {}, menu: card.id, subId: '', formData: {} })
  return {
    sub: hasil.subPilih, formData: hasil.tambahan, sppdData: hasil.sppdTambahan || {},
    prefillBadge: { bku: bkuPrefill || {}, diisi: hasil.diisi, dilewati: hasil.dilewati, tertimpa: hasil.tertimpa },
    savedAt: null, viewMode: 'form', formTab: 'daftar', previewTab: 'daftar',
  }
}

export default function BKUSidebarLpj({ transaction, kategori, bkuPrefill, onClose }) {
  const card = cardBerpanel(kategori)
  const toast = useToast()
  const [awal] = useState(() => muatAwal({ card, transaction, bkuPrefill }))

  const [selectedSub, setSelectedSub] = useState(awal?.sub ?? null)
  const [formData, setFormData] = useState(awal?.formData ?? {})
  const [sppdData, setSppdData] = useState(awal?.sppdData ?? {})
  const [viewMode, setViewMode] = useState(awal?.viewMode ?? 'form')
  const [formTab, setFormTab] = useState(awal?.formTab ?? 'daftar')
  const [previewTab, setPreviewTab] = useState(awal?.previewTab ?? 'daftar')
  const [prefillBadge, setPrefillBadge] = useState(awal?.prefillBadge ?? null)
  const [savedAt, setSavedAt] = useState(awal?.savedAt ?? null)

  if (!card) return null

  const templateId = selectedSub?.templateId || null
  const cfg = templateId ? TEMPLATE_CONFIGS[templateId] : null
  const previewDocs = buildPreviewDocs({
    cardId: card.id,
    templateId,
    subId: selectedSub?.id,
    formData,
    sppdData,
  })
  const pelanggaran = readinessCheck(formData)
  // Peringatan kelengkapan: kategori dengan template tunggal → aturan A-1; mamin
  // (tanpa templateId) → dipetakan dari readinessCheck. Preview TIDAK pernah
  // disembunyikan — keputusan user 2026-10-21 ("Selalu tampil + peringatan").
  const kelengkapan = cfg ? cekKelengkapan(cfg, formData) : peringatanDariPelanggaran(pelanggaran)

  const bisaSimpan = noBuktiSah(transaction?.noBukti)

  const handleSimpan = () => {
    const hasil = simpanEntri(card.id, transaction?.noBukti, {
      subId: selectedSub?.id || '',
      templateId,
      formData,
      sppdData,
    })
    if (hasil.ok) {
      setSavedAt(hasil.savedAt)
      toast.success(`Dokumen tersimpan untuk NoBukti ${String(transaction.noBukti).trim()}`)
    } else if (hasil.alasan === 'no-bukti') {
      toast.info('Baris ini belum punya No Bukti — dokumen tidak bisa disimpan')
    } else {
      toast.info('Gagal menyimpan — penyimpanan penuh atau diblokir')
    }
  }

  const handleCek = () => {
    const pertama = pelanggaran[0]
    if (!pertama) { toast.success('Lengkap — siap cetak'); return }
    if (!sorotPelanggaran(pertama)) toast.info(pertama.label)
  }

  const handleCetak = () => {
    snapshotSebelumTimpa(
      { ...formData, sppdData: { ...sppdData } },
      [...new Set(Object.keys(formData))],
      transaction?.noBukti || '',
    )
    const printContainer = document.querySelector('.sk-print-area .print-container')
    if (printContainer) {
      printContainer.classList.remove('portrait', 'landscape')
      printContainer.classList.add(cfg?.orientation || 'portrait')
    }
    window.print()
  }

  const getStatus = (cardId, subId) => {
    const stored = storageHelper.get('dokumen_lpj', {})
    const key = subId ? `${cardId}_${subId}` : cardId
    return stored[key]?.status || 'Belum'
  }

  return (
    <div className="space-y-4">
      {/* Toolbar: konteks baris + Simpan */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-4 py-3 flex items-center gap-3 flex-wrap">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">Dokumen untuk baris ini</p>
          <p className="text-sm font-bold text-slate-800 truncate" title={transaction?.uraian || ''}>
            {transaction?.noBukti ? `#${transaction.noBukti}` : 'Tanpa No Bukti'}
            <span className="font-normal text-slate-500"> · {transaction?.tanggalStr || '-'}</span>
            {transaction?.pengeluaran ? <span className="font-normal text-slate-500"> · {rp(transaction.pengeluaran)}</span> : null}
          </p>
          <p className="text-[11px] text-slate-400 truncate" title={transaction?.uraian || ''}>{transaction?.uraian || '-'}</p>
        </div>
        <div className="flex items-center gap-2">
          {savedAt && (
            <span className="text-[11px] text-slate-500">
              Tersimpan {new Date(savedAt).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button
            onClick={handleSimpan}
            disabled={!bisaSimpan}
            title={bisaSimpan ? 'Simpan dokumen untuk NoBukti ini' : 'Baris tanpa No Bukti tidak bisa disimpan'}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              bisaSimpan
                ? 'bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg shadow-primary/30 hover:brightness-110 active:scale-95'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span className="material-symbols-outlined text-lg">save</span>
            Simpan
          </button>
        </div>
      </div>

      <DetailDokumenLpj
        card={card}
        selectedSub={selectedSub}
        onSubChange={(sub) => { setSelectedSub(sub); setFormData({}); setSppdData({}) }}
        getStatus={getStatus}
        formData={formData}
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
      />
    </div>
  )
}
