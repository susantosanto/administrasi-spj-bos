/**
 * SidebarPbjForm — isi 6 tab Dokumen PBJ di sidebar BKU (Sprint 018, K-11).
 *
 * Config tab disalin dari halaman Dokumen Kelengkapan (`utils/pbjTabs.js`) —
 * halaman itu tidak boleh berubah (G-9), jadi config-nya disembunyikan di util.
 *
 * Revisi 2026-10-22 (temuan user): "Tanggal" dan "Kegiatan/Pekerjaan" tidak
 * ditampilkan lagi sebagai input di tab Perencanaan karena DUPLIKAT —
 * Tanggal sudah ada di Identitas Kegiatan (dari baris BKU) dan Kegiatan/
 * Pekerjaan diambil dari "Nama Kegiatan" di sana. Nilainya tetap diisi oleh
 * `sinkronPbjDariSumber` sehingga dokumen PBJ tetap tercetak lengkap.
 */
import { PBJ_TABS, fieldsTampil } from '../../utils/pbjTabs'

const INPUT = 'w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-primary outline-none'
const LABEL = 'block text-[10px] font-semibold text-slate-500 uppercase mb-1'

export default function SidebarPbjForm({ tab = 'perencanaan', form = {}, onChange }) {
  const def = PBJ_TABS.find((t) => t.id === tab) || PBJ_TABS[0]
  // Sprint 023-rev: field boleh menyimpan ke tab lain (`simpanKe`, dipakai
  // tab Perencanaan → tab Data untuk Workplan). Tanpa simpanKe = tab sendiri.
  const bacaField = (f) => (form?.[f.simpanKe || def.id] || {})[f.key] || ''
  const fields = fieldsTampil(def)
  const adaTurunan = fields.length !== (def.fields || []).length

  const setField = (key, value, simpanKe) => {
    const target = simpanKe || def.id
    onChange({ ...form, [target]: { ...(form?.[target] || {}), [key]: value } })
  }

  return (
    <div className="space-y-3">
      {adaTurunan && (
        <p className="flex items-start gap-1.5 text-[10px] text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2">
          <span className="material-symbols-outlined text-[13px] text-slate-400 leading-4">link</span>
          <span>
            <span className="font-semibold text-slate-600">Tanggal</span> dan{' '}
            <span className="font-semibold text-slate-600">Kegiatan/Pekerjaan</span> diambil otomatis dari
            Identitas Kegiatan — tidak perlu diisi ulang di sini.
          </span>
        </p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {fields.map((f) => (
          <div key={`${f.simpanKe || def.id}.${f.key}`} className={f.type === 'textarea' ? 'sm:col-span-2' : ''}>
            <label className={LABEL}>{f.label}</label>
            {f.type === 'textarea' ? (
              <textarea
                rows={2}
                value={bacaField(f)}
                onChange={(e) => setField(f.key, e.target.value, f.simpanKe)}
                className={`${INPUT} resize-none`}
              />
            ) : f.type === 'select' ? (
              <select value={bacaField(f)} onChange={(e) => setField(f.key, e.target.value, f.simpanKe)} className={INPUT}>
                <option value="">—</option>
                {(f.options || []).map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            ) : (
              <input
                type={f.type === 'date' ? 'date' : 'text'}
                value={bacaField(f)}
                onChange={(e) => setField(f.key, e.target.value, f.simpanKe)}
                className={INPUT}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
