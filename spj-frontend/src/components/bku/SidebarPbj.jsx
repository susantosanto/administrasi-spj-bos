/**
 * SidebarPbj — blok "Dokumen PBJ" di sidebar BKU (Sprint 018, K-11/K-12).
 *
 * Letak: DI BAWAH form LPJ dan DI ATAS Panel Preview Document (AD-6, lewat
 * prop `blokTambahan` pada `DetailDokumenLpjBody`).
 *
 * Data:
 * - disimpan PER NoBukti (kunci `spj_pbj_bku`, AD-5) — tidak bercampur dengan
 *   form PBJ global di halaman Dokumen Kelengkapan;
 * - isian awal otomatis dari baris BKU (Tanggal · Kegiatan · Nominal · No Bukti);
 * - entri tersimpan menang atas prefill.
 *
 * Revisi 2026-10-22 (permintaan user): **mode pengadaan SIPLAH / NON-SIPLAH**
 * ditambahkan di sini, mengikuti konsep halaman Dokumen Kelengkapan —
 * SIPLAH = hanya tab Perencanaan (1 dokumen), NON-SIPLAH = keenam dokumen.
 * Mode disimpan di kunci `pbj_mode` (kunci yang sama dengan halaman itu).
 *
 * Komponen ini **controlled**: state form PBJ dipegang `BKUSidebarLpj` (supaya
 * preview panel bisa memakai data yang sama — AD-7), termasuk `mode`.
 *
 * Sprint 020 (permintaan user 2026-10-24): **Upload Invoice SIPLah** — fitur
 * yang sama persis dengan tombol "Upload PDF" di halaman Dokumen Kelengkapan
 * (menu Dokumen PBJ). Pipeline parse/prefill/arsip dari `utils/pbjInvoice.js`
 * (satu sumber kode dengan halaman itu). Upload berhasil → form PBJ per NoBukti
 * terisi + 1 baris ditambahkan ke arsip invoice global (`spj_pbj_invoices`) +
 * entri otomatis tersimpan (via `onPrefillInvoice`). Gagal parse → tidak ada
 * yang berubah, pesan "isi manual" (jujur). Tombol hanya untuk kategori
 * mamin/atk/pemeliharaan/perjalanan dinas (konsumsi = mamin) — honor tidak.
 */
import { useState } from 'react'
import SidebarPbjForm from './SidebarPbjForm'
import KonfirmHapusModal from './KonfirmHapusModal'
import { tabsUntukMode } from '../../utils/pbjTabs'
import { simpanEntri } from '../../utils/pbjBkuStore'
import { bacaInvoicePdf, paksaFormDariInvoice, tambahInvoiceKeArsip, KATEGORI_UPLOAD_PBJ } from '../../utils/pbjInvoice'
import storageHelper from '../../utils/storageHelper'
import { useToast } from '../ui/Toast'

/** Format Rp ringkas ala sidebar (tanpa desimal). */
const fmtRp = (n) => `Rp ${(Number(n) || 0).toLocaleString('id-ID')}`

/**
 * TabelInvoice — Sprint 023 (R-1): tiruan ringkas tabel invoice halaman
 * Dokumen Kelengkapan (1 invoice = 1 baris agregat + expand rincian item).
 * Baca-saja dari arsip global `spj_pbj_invoices`; tidak mengubah pipeline.
 */
function TabelInvoice({ daftar, onBerubah }) {
  const toast = useToast()
  const [bukaId, setBukaId] = useState(null)
  // Sprint 023-rev6: konfirmasi via modal aplikasi (KonfirmHapusModal).
  const [targetHapus, setTargetHapus] = useState(null)
  const eksekusiHapus = () => {
    if (!targetHapus) return
    const { i } = targetHapus
    const list = (storageHelper.get('pbj_invoices', []) || []).filter((_, j) => j !== i)
    storageHelper.set('pbj_invoices', list)
    if (bukaId === targetHapus.inv?.id) setBukaId(null)
    setTargetHapus(null)
    if (onBerubah) onBerubah(list)
    toast.success('Baris invoice dihapus')
  }
  if (!Array.isArray(daftar) || daftar.length === 0) {
    return (
      <p className="text-[11px] text-slate-400 italic">
        Belum ada invoice tersimpan — upload PDF invoice SIPLah untuk mengisi tabel.
      </p>
    )
  }
  return (
    <>
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full text-[11px] table-fixed">
        <thead>
          <tr className="bg-slate-100 text-slate-600">
            <th className="px-2 py-1.5 text-left font-bold w-8">No</th>
            <th className="px-2 py-1.5 text-left font-bold">Nomor / File</th>
            <th className="px-2 py-1.5 text-left font-bold">Penyedia</th>
            <th className="px-2 py-1.5 text-right font-bold">Item</th>
            <th className="px-2 py-1.5 text-right font-bold">Total</th>
            <th className="px-1 py-1.5 text-center font-bold w-9">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {daftar.map((inv, i) => {
            const buka = bukaId === inv.id
            const items = Array.isArray(inv.items) ? inv.items : []
            return [
              <tr
                key={inv.id || `inv-${i}`}
                onClick={() => setBukaId(buka ? null : inv.id)}
                className={`cursor-pointer transition-colors ${buka ? 'bg-primary/5' : 'hover:bg-slate-50'}`}
                title="Klik untuk rincian item"
              >
                <td className="px-2 py-1.5 text-slate-500">{i + 1}</td>
                <td className="px-2 py-1.5 min-w-0">
                  <span className="block font-semibold text-slate-800 truncate">{inv.nomor || '—'}</span>
                  <span className="block text-[10px] text-slate-400 truncate">{inv.namaFile || inv.tanggalTampil || ''}</span>
                </td>
                <td className="px-2 py-1.5 text-slate-700 truncate">{inv.namaPenyedia || '—'}</td>
                <td className="px-2 py-1.5 text-right text-slate-700">{items.length}</td>
                <td className="px-2 py-1.5 text-right font-semibold text-slate-900">{fmtRp(inv.grandTotal)}</td>
                <td className="px-1 py-1.5 text-center">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setTargetHapus({ inv, i }) }}
                    title={`Hapus baris ${i + 1}`}
                    aria-label={`Hapus baris invoice ${i + 1}`}
                    className="p-1 rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                  </button>
                </td>
              </tr>,
              buka && (
                <tr key={`${inv.id || `inv-${i}`}-detail`}>
                  <td colSpan={6} className="px-2 py-1.5 bg-slate-50/70">
                    <table className="w-full text-[10px]">
                      <thead>
                        <tr className="text-slate-500">
                          <th className="px-1 py-1 text-left font-semibold">Uraian</th>
                          <th className="px-1 py-1 text-right font-semibold">Qty</th>
                          <th className="px-1 py-1 text-right font-semibold">Harga</th>
                          <th className="px-1 py-1 text-right font-semibold">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {items.map((it, j) => (
                          <tr key={j}>
                            <td className="px-1 py-1 text-slate-700">{it.uraian || '—'}</td>
                            <td className="px-1 py-1 text-right text-slate-600">{it.qty ?? '—'}</td>
                            <td className="px-1 py-1 text-right text-slate-600">{fmtRp(it.harga)}</td>
                            <td className="px-1 py-1 text-right font-semibold text-slate-800">{fmtRp(it.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </td>
                </tr>
              ),
            ]
          })}
        </tbody>
      </table>
    </div>
      {/* Sprint 023-rev6: modal konfirmasi hapus ala aplikasi. */}
      {targetHapus && (
        <KonfirmHapusModal
          target={{
            judul: 'Hapus baris invoice?',
            pesan: `"${targetHapus.inv?.nomor || targetHapus.inv?.namaFile || `baris ${targetHapus.i + 1}`}" akan dihapus dari tabel invoice. Tindakan ini permanen.`,
          }}
          onBatal={() => setTargetHapus(null)}
          onYa={eksekusiHapus}
        />
      )}
    </>
  )
}

export default function SidebarPbj({
  kategori,
  transaction,
  form = {},
  onChange = null,
  savedAt = null,
  onSimpan = null,
  mode = 'non',
  onModeChange = null,
  onPrefillInvoice = null,
}) {
  const toast = useToast()
  const [tab, setTab] = useState('perencanaan')

  // Sprint 020: state upload invoice SIPLah (pola sama dengan Kelengkapan).
  const [bacaInvoice, setBacaInvoice] = useState(false)
  const [badgeInvoice, setBadgeInvoice] = useState('')
  const [pesanInvoice, setPesanInvoice] = useState('')
  const [metaInvoice, setMetaInvoice] = useState(null)
  // Sprint 023 (R-1): tabel invoice dari arsip global — refresh tiap upload.
  const [daftarInvoice, setDaftarInvoice] = useState(() => storageHelper.get('pbj_invoices', []))
  const muatUlangArsip = () => setDaftarInvoice(storageHelper.get('pbj_invoices', []))

  // Revisi 2026-10-24 (permintaan user): upload invoice HANYA saat mode
  // SIPLAH — invoice SIPLah memang sumbernya SIPLAH. Mode NON-SIPLAH =
  // tanpa fitur upload (pengadaan non-SIPLah diisi manual).
  const bolehUpload = KATEGORI_UPLOAD_PBJ.includes(String(kategori || '')) && mode === 'siplah'

  const handleUploadInvoice = async (file) => {
    if (!file || bacaInvoice) return
    setPesanInvoice('Membaca invoice…')
    setBacaInvoice(true)
    try {
      const draf = await bacaInvoicePdf(file)
      if (!draf.cocok) {
        // Gagal parse → form & arsip TIDAK berubah (jujur, sama dengan Kelengkapan).
        setPesanInvoice('Tidak terbaca otomatis — silakan isi manual.')
        return
      }
      const formBaru = paksaFormDariInvoice(form, draf)
      const jumlahBaris = tambahInvoiceKeArsip(draf, file.name)
      muatUlangArsip()
      let hasilSimpan = { ok: false }
      if (onPrefillInvoice) hasilSimpan = onPrefillInvoice(formBaru) || { ok: false }
      else if (onChange) onChange(formBaru)
      setBadgeInvoice(`Terbaca ${draf.items.length} item · Rp ${(draf.grandTotal || 0).toLocaleString('id-ID')} · baris ${jumlahBaris}`)
      setMetaInvoice({ namaFile: file.name, nomorInvoice: draf.nomorInvoice || '', grandTotal: draf.grandTotal || 0 })
      setPesanInvoice('')
      if (hasilSimpan.ok) toast.success('Invoice terbaca — form PBJ terisi & tersimpan')
      else if (hasilSimpan.alasan === 'no-bukti') toast.info('Invoice terbaca — baris tanpa No Bukti, tekan Simpan PBJ setelah No Bukti ada')
      else toast.success('Invoice terbaca — form PBJ terisi')
    } catch {
      setPesanInvoice('Gagal membaca PDF — silakan isi manual.')
    } finally {
      setBacaInvoice(false)
    }
  }

  const tabs = tabsUntukMode(mode)
  const tabAktif = tabs.some((t) => t.id === tab) ? tab : tabs[0].id

  const gantiMode = (next) => {
    if (next === mode) return
    if (onModeChange) onModeChange(next)
    setTab('perencanaan')
  }

  const handleSimpan = () => {
    if (onSimpan) {
      onSimpan()
      return
    }
    const hasil = simpanEntri(kategori, transaction?.noBukti, { form })
    if (hasil.ok) toast.success('Dokumen PBJ tersimpan')
    else if (hasil.alasan === 'no-bukti') toast.info('Baris ini belum punya No Bukti — dokumen PBJ tidak bisa disimpan')
    else toast.info('Gagal menyimpan — penyimpanan penuh atau diblokir')
  }

  return (
    <section data-blok="pbj" className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-primary/10 text-primary">
            <span className="material-symbols-outlined text-base">receipt_long</span>
          </span>
          <div>
            <h3 className="text-[13px] font-semibold text-slate-800 tracking-tight leading-5">Dokumen PBJ</h3>
            <p className="text-[10px] text-slate-500">No. Bukti {transaction?.noBukti || '—'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {savedAt && (
            <span className="text-[11px] text-slate-500">
              Tersimpan {new Date(savedAt).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button
            type="button"
            onClick={handleSimpan}
            disabled={!transaction?.noBukti}
            title={transaction?.noBukti ? 'Simpan dokumen PBJ untuk NoBukti ini' : 'Baris tanpa No Bukti tidak bisa disimpan'}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              transaction?.noBukti
                ? 'bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg shadow-primary/30 hover:brightness-110 active:scale-95'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span className="material-symbols-outlined text-base">save</span>
            Simpan PBJ
          </button>
        </div>
      </div>

      {/* Mode pengadaan — konsep sama dengan halaman Dokumen Kelengkapan (revisi 2026-10-22) */}
      <div className="flex flex-wrap items-center gap-3" role="group" aria-label="Mode pengadaan PBJ">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mode pengadaan</span>
        <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1" role="switch" aria-checked={mode === 'siplah'} aria-label="Toggle SIPLAH NON-SIPLAH">
          <button
            type="button"
            onClick={() => gantiMode('non')}
            aria-pressed={mode === 'non'}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${mode === 'non' ? 'bg-primary text-white shadow' : 'text-slate-600 hover:text-slate-800'}`}
          >
            NON-SIPLAH
          </button>
          <button
            type="button"
            onClick={() => gantiMode('siplah')}
            aria-pressed={mode === 'siplah'}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${mode === 'siplah' ? 'bg-primary text-white shadow' : 'text-slate-600 hover:text-slate-800'}`}
          >
            SIPLAH
          </button>
        </div>
        <span className="text-[10px] text-slate-500" aria-live="polite">
          {mode === 'siplah' ? 'SIPLAH — hanya Perencanaan (1 dokumen)' : 'NON-SIPLAH — enam dokumen'}
        </span>
      </div>

      {/* Sprint 020: Upload Invoice SIPLah — sama persis dengan "Upload PDF"
          di halaman Dokumen Kelengkapan (menu Dokumen PBJ). Hanya mode SIPLAH
          (revisi 2026-10-24): NON-SIPLAH tanpa fitur upload. */}
      {bolehUpload && (
        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <label
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                bacaInvoice
                  ? 'bg-primary/60 text-white cursor-wait'
                  : 'bg-primary text-white hover:bg-primary/90 active:scale-[0.98] cursor-pointer'
              }`}
            >
              <span className="material-symbols-outlined text-base">upload_file</span>
              {bacaInvoice ? 'Membaca…' : 'Upload Invoice SIPLah'}
              <input
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                disabled={bacaInvoice}
                onChange={(e) => { handleUploadInvoice(e.target.files?.[0]); e.target.value = '' }}
              />
            </label>
            <span className="text-[10px] text-slate-500">PDF invoice SIPLah → terbaca otomatis → form PBJ terisi.</span>
          </div>
          <div aria-live="polite" className="space-y-0.5">
            {badgeInvoice && <p className="text-[11px] font-semibold text-slate-700">✓ {badgeInvoice}</p>}
            {pesanInvoice && <p className="text-[11px] text-slate-500">{pesanInvoice}</p>}
            {metaInvoice && (
              <p className="text-[10px] text-slate-400">
                Arsip: {metaInvoice.namaFile} · {metaInvoice.nomorInvoice || 'tanpa nomor'} · Rp {(metaInvoice.grandTotal || 0).toLocaleString('id-ID')}
              </p>
            )}
          </div>
          {/* Sprint 023 (R-1): tabel data invoice — bahan Dokumen Perencanaan.
              Klik baris untuk rincian item. */}
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Data Invoice SIPLah — bahan Dokumen Perencanaan
            </p>
            <TabelInvoice daftar={daftarInvoice} onBerubah={setDaftarInvoice} />
          </div>
        </div>
      )}

      <p className="text-[11px] text-slate-500">
        Isian dasar terisi otomatis dari baris BKU (Tanggal · Kegiatan · Nominal · No. Bukti). Tersimpan
        terpisah untuk No. Bukti ini — dokumen PBJ di halaman Dokumen Kelengkapan tidak tersentuh.
      </p>

      <div className="flex flex-wrap gap-1 border-b border-slate-200">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-3 py-2 text-xs font-semibold border-b-2 -mb-px transition-colors ${
              tabAktif === t.id
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <SidebarPbjForm tab={tabAktif} form={form} onChange={onChange} />
    </section>
  )
}
