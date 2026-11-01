/**
 * BlankoUndangan — Sprint 024: isian premium Surat Undangan (blanko).
 * Split-view: form + Panel Preview. Tersimpan `spj_blanko_su`.
 * Penandatangan otomatis KS + NIP (ketikan menang). Cetak A4 portrait.
 */
import { useState } from 'react'
import storageHelper from '../../utils/storageHelper'
import { useToast } from '../ui/Toast'
import PanelPreviewDocument from '../templates/PanelPreviewDocument'
import { TEMPLATE_CONFIGS } from '../../data/templateConfig'
import { getSignatureRoles } from '../../utils/signatureRoles'

const INPUT = 'w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none min-h-[44px]'
const LABEL = 'block text-xs font-medium text-slate-700 mb-1'
const KUNCI = 'spj_blanko_su'

const FIELDS = [
  { key: 'nomor', label: 'Nomor Surat', ph: '001/UND/III/2026' },
  { key: 'tanggal', label: 'Tanggal', ph: 'Cikalongwetan, 20 Januari 2026' },
  { key: 'kepada', label: 'Kepada Yth', ph: 'Bapak/Ibu Guru' },
  { key: 'perihal', label: 'Perihal', ph: 'Undangan Rapat' },
  { key: 'isi', label: 'Isi Undangan', type: 'textarea', ph: 'Dengan hormat, kami mengundang…' },
  { key: 'tempat', label: 'Tempat', ph: 'Ruang Guru' },
  { key: 'waktu', label: 'Waktu', ph: '08:00 - selesai' },
  { key: 'tembusan', label: 'Tembusan (opsional)', ph: 'Arsip' },
]

export default function BlankoUndangan({ onKembali }) {
  const toast = useToast()
  const [form, setForm] = useState(() => storageHelper.get(KUNCI, {}))
  const [segar, setSegar] = useState(0)
  const sig = getSignatureRoles()

  const ubah = (key, value) => {
    const next = { ...form, [key]: value }
    storageHelper.set(KUNCI, next)
    setForm(next)
    setSegar((v) => v + 1)
  }

  const data = {
    ...TEMPLATE_CONFIGS.surat_undangan_blanko.defaults,
    ...form,
    namaPenandatangan: form.namaPenandatangan || sig['kepala-sekolah']?.nama || '',
    nipPenandatangan: form.nipPenandatangan || sig['kepala-sekolah']?.nip || '',
  }
  const docs = [{ key: 'surat-undangan', label: 'Surat Undangan', templateConfig: TEMPLATE_CONFIGS.surat_undangan_blanko, data }]
  const kosong = ['nomor', 'kepada', 'perihal', 'isi'].filter((k) => !String(form[k] ?? '').trim()).length

  return (
    <section aria-label="Surat Undangan blanko" className="w-full bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-5">
      <div className="flex items-center gap-2">
        <button onClick={onKembali} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 min-h-[44px]">
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Kembali ke Daftar
        </button>
        <span className="text-[11px] text-slate-400">Surat Undangan · tersimpan otomatis di perangkat ini</span>
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,620px)] items-start">
        <div className="space-y-3">
          {FIELDS.map((f) => (
            <div key={f.key}>
              <label className={LABEL}>{f.label}</label>
              {f.type === 'textarea' ? (
                <textarea rows={4} value={form[f.key] || ''} onChange={(e) => ubah(f.key, e.target.value)} placeholder={f.ph} className={`${INPUT} resize-y`} />
              ) : (
                <input value={form[f.key] || ''} onChange={(e) => ubah(f.key, e.target.value)} placeholder={f.ph} className={INPUT} />
              )}
            </div>
          ))}
          <div className="grid sm:grid-cols-2 gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3">
            <div>
              <label className={LABEL}>Penandatangan (otomatis KS)</label>
              <input value={form.namaPenandatangan || ''} onChange={(e) => ubah('namaPenandatangan', e.target.value)}
                placeholder={sig['kepala-sekolah']?.nama ? `Otomatis: ${sig['kepala-sekolah'].nama}` : 'Nama penandatangan'} className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>NIP Penandatangan</label>
              <input value={form.nipPenandatangan || ''} onChange={(e) => ubah('nipPenandatangan', e.target.value)}
                placeholder={sig['kepala-sekolah']?.nip ? `Otomatis: ${sig['kepala-sekolah'].nip}` : 'NIP'} className={INPUT} />
            </div>
          </div>
        </div>
        <aside className="print:hidden min-w-0 lg:sticky lg:top-[88px] self-start">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Panel Preview Document</h3>
          <PanelPreviewDocument title="Surat Undangan" docs={docs}
            status={{ perlu: kosong, violations: [] }} cetakAktif
            onCek={() => toast.success(kosong === 0 ? 'LENGKAP — siap cetak' : `${kosong} field perlu diisi`)}
            onCetak={() => window.print()} />
        </aside>
      </div>
    </section>
  )
}
