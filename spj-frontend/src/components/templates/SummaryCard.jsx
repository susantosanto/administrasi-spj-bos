/**
 * SummaryCard — kartu ringkasan data (Sprint 003 US-19/US-20).
 * Layar-only: label + nilai + tabel, 0 kop surat, 0 tanda tangan.
 * Nilai kosong tampil '—' jujur (bukan data palsu). Di luar .print-container
 * sehingga tidak pernah ikut tercetak.
 */
export default function SummaryCard({ title, icon = 'list_alt', sections = [] }) {
  const show = (v) => {
    if (v === null || v === undefined || v === '') return '—'
    if (Array.isArray(v)) {
      const items = v.map((x) => (typeof x === 'object' ? x.text || x.nama || '' : x)).filter(Boolean)
      return items.length ? items.join('; ') : '—'
    }
    return String(v)
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {title && (
        <div className="flex items-center gap-2 px-4 py-3 bg-primary/5 border-b border-slate-200">
          <span className="material-symbols-outlined text-primary">{icon}</span>
          <span className="text-sm font-bold text-slate-800">{title}</span>
        </div>
      )}
      <div className="p-4 space-y-4">
        {sections.length === 0 && (
          <p className="text-sm text-slate-500">Belum ada data. Isi form terlebih dahulu.</p>
        )}
        {sections.map((s, i) => (
          <div key={s.title || i}>
            {s.title && (
              <p className="text-[11px] font-bold text-primary uppercase tracking-wider mb-2">{s.title}</p>
            )}
            {(s.fields || []).length > 0 && (
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                {s.fields.map((f, j) => (
                  <div key={f.label || j} className="flex gap-2 text-sm">
                    <dt className="w-32 shrink-0 text-slate-500">{f.label}</dt>
                    <dd className="flex-1 font-medium text-slate-800 break-words">{show(f.value)}</dd>
                  </div>
                ))}
              </dl>
            )}
            {s.table && (s.table.rows || []).length > 0 && (
              <div className="mt-2 overflow-auto rounded-xl border border-slate-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50">
                      {(s.table.columns || []).map((c) => (
                        <th key={c.key} className="px-3 py-2 text-left text-[11px] font-bold text-slate-500 uppercase">
                          {c.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {s.table.rows.map((r, k) => (
                      <tr key={r.id || k} className="border-t border-slate-100">
                        {(s.table.columns || []).map((c) => (
                          <td key={c.key} className="px-3 py-2 text-slate-800">
                            {c.key === 'no' ? r[c.key] ?? k + 1 : show(r[c.key])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
