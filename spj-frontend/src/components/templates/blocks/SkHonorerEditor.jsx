/**
 * SkHonorerEditor — Tab "SK Honorer" (sebelum cetak)
 *
 * Menampilkan & mengedit konten SK sebelum dicetak:
 *  - Data Surat (nomor, tempat, tanggal ttd)
 *  - Daftar penerima SK (nama + data dari Data Guru/Tendik), data bisa dilengkapi
 *  - Poin-poin pasal: PREMIUM, bisa ditambah / diedit / dihapus / diurutkan
 *
 * Cetak: area .sk-print-area hanya berisi dokumen resmi SKHonorer
 * (format formal), chrome editor disembunyikan oleh CSS @media print.
 */
import { useState } from 'react'
import SKHonorer from './SKHonorer'
import { cloneDefaultPasal } from '../../../data/skPasal'

const uid = () => `id${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`

const initials = (name) =>
  (name || '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

const LETTERS = 'abcdefghijklmnopqrstuvwxyz'

// Hitung penomoran item (angka untuk level 0, huruf untuk level 1)
function numberItems(items) {
  let top = 0
  let sub = 0
  return (items || []).map((it) => {
    if (it.level === 0) {
      top += 1
      sub = 0
      return { ...it, label: String(top), depth: 0 }
    }
    sub += 1
    return { ...it, label: LETTERS[sub - 1] || String(sub), depth: 1 }
  })
}

export default function SkHonorerEditor({
  skList = [],
  pasal,
  onPasalChange,
  onResetPasal,
  onUpdateRow,
  onRemoveRow,
  onUpdateForm,
}) {
  const [printIdx, setPrintIdx] = useState('all') // 'all' | index dokumen

  const doPrint = (target) => {
    setPrintIdx(target)
    setTimeout(() => window.print(), 120)
  }
  const printDocs = skList.filter((_, i) => printIdx === 'all' || i === printIdx)

  // ─── CRUD Pasal ─────────────────────────────────────────────────────
  const updatePasal = (fn) => onPasalChange(fn(pasal || []))

  const addPasal = () =>
    updatePasal((list) => [
      ...list,
      { id: uid(), judul: 'Judul Pasal Baru', pembuka: '', items: [{ id: uid(), text: '', level: 0 }] },
    ])

  const patchPasal = (pid, patch) =>
    updatePasal((list) => list.map((p) => (p.id === pid ? { ...p, ...patch } : p)))

  const removePasal = (pid) => updatePasal((list) => list.filter((p) => p.id !== pid))

  const movePasal = (pid, dir) =>
    updatePasal((list) => {
      const i = list.findIndex((p) => p.id === pid)
      const j = i + dir
      if (i < 0 || j < 0 || j >= list.length) return list
      const next = [...list]
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })

  const addItem = (pid) =>
    patchPasal(pid, {
      items: [...(pasal.find((p) => p.id === pid)?.items || []), { id: uid(), text: '', level: 0 }],
    })

  const patchItem = (pid, iid, patch) =>
    patchPasal(pid, {
      items: (pasal.find((p) => p.id === pid)?.items || []).map((it) =>
        it.id === iid ? { ...it, ...patch } : it
      ),
    })

  const removeItem = (pid, iid) =>
    patchPasal(pid, {
      items: (pasal.find((p) => p.id === pid)?.items || []).filter((it) => it.id !== iid),
    })

  const moveItem = (pid, iid, dir) =>
    patchPasal(pid, {
      items: (() => {
        const items = [...(pasal.find((p) => p.id === pid)?.items || [])]
        const i = items.findIndex((it) => it.id === iid)
        const j = i + dir
        if (i < 0 || j < 0 || j >= items.length) return items
        ;[items[i], items[j]] = [items[j], items[i]]
        return items
      })(),
    })

  // ─── Data Surat (umum untuk semua SK) ───────────────────────────────
  const surat = skList[0]?.skData || {}

  return (
    <div className="space-y-6">
      {/* ═══ TOOLBAR ═══ */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-blue-600 text-white shadow-lg shadow-primary/25">
            <span className="material-symbols-outlined text-lg">gavel</span>
          </span>
          <div>
            <div className="text-sm font-bold text-slate-800">Editor SK Honorer</div>
            <div className="text-[11px] text-slate-500">
              {skList.length} penerima · poin pasal bisa ditambah / diedit / dihapus
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onResetPasal}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 transition-all"
            title="Kembalikan poin pasal ke standar"
          >
            <span className="material-symbols-outlined text-base">restart_alt</span>
            Reset ke Standar
          </button>
          <button
            type="button"
            onClick={() => doPrint('all')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg shadow-primary/30 hover:brightness-110 transition-all active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-lg">print</span>
            Cetak Semua ({skList.length})
          </button>
        </div>
      </div>

      {/* ═══ DATA SURAT ═══ */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-base text-primary">description</span>
          <span className="text-xs font-bold uppercase tracking-wide text-slate-800">Data Surat</span>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase text-slate-500">Nomor Surat</label>
            <input
              type="text"
              value={surat.nomorSurat || ''}
              onChange={(e) => onUpdateForm('nomor', e.target.value)}
              placeholder="814.1/ SD01 - VII /2023"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase text-slate-500">Dibuat di</label>
            <input
              type="text"
              value={surat.tempatTtd || ''}
              onChange={(e) => onUpdateForm('tempatTtd', e.target.value)}
              placeholder="Bandung Barat"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase text-slate-500">Tanggal Tanda Tangan</label>
            <input
              type="text"
              value={surat.tanggalTtd || ''}
              onChange={(e) => onUpdateForm('tanggalTtd', e.target.value)}
              placeholder="15 Juli 2026"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* ═══ PENERIMA ═══ */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-base text-primary">groups</span>
          <span className="text-xs font-bold uppercase tracking-wide text-slate-800">
            Penerima SK Honorer
          </span>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
            {skList.length}
          </span>
          <span className="text-[10px] text-slate-400">— data dari Data Guru / Tendik</span>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {skList.map((s) => {
            const row = s.row
            return (
              <div
                key={row.id}
                className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md"
              >
                {/* Header kartu */}
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-blue-600 text-xs font-bold text-white shadow-md shadow-primary/20">
                      {initials(row.nama)}
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-bold text-slate-800">{row.nama}</div>
                      <div className="text-[10px] text-slate-500">
                        {row.jabatan || '-'}
                        {row.golRuang ? ` · ${row.golRuang}` : ''}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveRow(row)}
                    className="p-1.5 rounded-lg text-slate-300 hover:bg-red-50 hover:text-red-500 transition-all"
                    title="Hapus dari daftar"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                  </button>
                </div>

                {/* Data identitas (read-only dari Data Guru/Tendik) */}
                <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1 rounded-xl bg-slate-50 px-3 py-2 text-[10px] text-slate-500">
                  <span><b className="text-slate-600">NUPTK:</b> {row.nuptk || '-'}</span>
                  <span><b className="text-slate-600">NIP:</b> {row.nip || '-'}</span>
                </div>

                {/* Data SK (bisa dilengkapi) */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-1 block text-[10px] font-semibold uppercase text-slate-500">TTL</label>
                    <input
                      type="text"
                      value={row.ttl || ''}
                      onChange={(e) => onUpdateRow(row.id, 'ttl', e.target.value)}
                      placeholder="Bandung, 14 Mei 1991"
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] font-semibold uppercase text-slate-500">Pendidikan</label>
                    <input
                      type="text"
                      value={row.pendidikan || ''}
                      onChange={(e) => onUpdateRow(row.id, 'pendidikan', e.target.value)}
                      placeholder="S1"
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="mb-1 block text-[10px] font-semibold uppercase text-slate-500">Alamat</label>
                    <input
                      type="text"
                      value={row.alamat || ''}
                      onChange={(e) => onUpdateRow(row.id, 'alamat', e.target.value)}
                      placeholder="Kp. Sirnaraja RT 01/012 Desa Mandalasari Kec. Cikalongwetan"
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="mb-1 block text-[10px] font-semibold uppercase text-slate-500">Kelas Mengajar (untuk Pasal 2)</label>
                    <input
                      type="text"
                      value={row.kelasGuru || ''}
                      onChange={(e) => onUpdateRow(row.id, 'kelasGuru', e.target.value)}
                      placeholder="IV"
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ═══ POIN-POIN PASAL ═══ */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-base text-primary">menu_book</span>
          <span className="text-xs font-bold uppercase tracking-wide text-slate-800">Poin-Poin Pasal</span>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
            {pasal?.length || 0} pasal
          </span>
          <span className="text-[10px] text-slate-400">— bisa ditambah / diedit / dihapus / diurutkan</span>
        </div>

        <div className="space-y-4">
          {(pasal || []).map((p, pi) => {
            const numbered = numberItems(p.items)
            return (
              <div
                key={p.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md"
              >
                {/* Header pasal */}
                <div className="flex items-center gap-2 border-b border-slate-100 bg-gradient-to-r from-primary/5 via-transparent to-transparent px-4 py-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-blue-600 text-[10px] font-bold text-white shadow-sm">
                    {pi + 1}
                  </span>
                  <input
                    type="text"
                    value={p.judul || ''}
                    onChange={(e) => patchPasal(p.id, { judul: e.target.value })}
                    placeholder="Judul Pasal"
                    className="flex-1 min-w-0 bg-transparent text-sm font-bold text-slate-800 outline-none placeholder:text-slate-300"
                  />
                  <span className="hidden text-[9px] uppercase tracking-wider text-slate-300 sm:block">
                    Pasal {pi + 1}
                  </span>
                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => movePasal(p.id, -1)}
                      disabled={pi === 0}
                      className="p-1 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30 transition-all"
                      title="Naikkan pasal"
                    >
                      <span className="material-symbols-outlined text-sm">arrow_upward</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => movePasal(p.id, 1)}
                      disabled={pi === (pasal?.length || 0) - 1}
                      className="p-1 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30 transition-all"
                      title="Turunkan pasal"
                    >
                      <span className="material-symbols-outlined text-sm">arrow_downward</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => removePasal(p.id)}
                      className="p-1 rounded-md text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
                      title="Hapus pasal"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5 px-4 py-3.5">
                  {/* Pembuka pasal */}
                  <textarea
                    value={p.pembuka || ''}
                    onChange={(e) => patchPasal(p.id, { pembuka: e.target.value })}
                    rows={p.pembuka ? 2 : 1}
                    placeholder="Paragraf pembuka pasal (opsional)"
                    className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-slate-300"
                  />

                  {/* Poin-poin */}
                  {numbered.map((it) => (
                    <div key={it.id} className="flex items-start gap-2" style={{ paddingLeft: it.depth ? 24 : 0 }}>
                      <span
                        className={`mt-1 flex h-5 w-6 shrink-0 items-center justify-center rounded-md text-[10px] font-bold ${
                          it.depth
                            ? 'bg-indigo-50 text-indigo-500'
                            : 'bg-primary/10 text-primary'
                        }`}
                      >
                        {it.label}.
                      </span>
                      <input
                        type="text"
                        value={it.text}
                        onChange={(e) => patchItem(p.id, it.id, { text: e.target.value })}
                        placeholder={it.depth ? 'Poin sub-ayat...' : 'Tulis poin pasal...'}
                        className={`flex-1 min-w-0 rounded-lg border border-slate-200 px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-slate-300 ${
                          it.depth ? 'bg-indigo-50/40' : 'bg-slate-50'
                        }`}
                      />
                      <div className="flex shrink-0 items-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => patchItem(p.id, it.id, { level: it.depth ? 0 : 1 })}
                          className="p-1 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
                          title={it.depth ? 'Jadikan poin utama' : 'Jadikan sub-poin (a.)'}
                        >
                          <span className="material-symbols-outlined text-sm">
                            {it.depth ? 'format_indent_decrease' : 'format_indent_increase'}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => moveItem(p.id, it.id, -1)}
                          disabled={numbered.indexOf(it) === 0}
                          className="p-1 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30 transition-all"
                          title="Naikkan"
                        >
                          <span className="material-symbols-outlined text-sm">arrow_upward</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => moveItem(p.id, it.id, 1)}
                          disabled={numbered.indexOf(it) === numbered.length - 1}
                          className="p-1 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30 transition-all"
                          title="Turunkan"
                        >
                          <span className="material-symbols-outlined text-sm">arrow_downward</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => removeItem(p.id, it.id)}
                          className="p-1 rounded-md text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
                          title="Hapus poin"
                        >
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => addItem(p.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-primary bg-primary/5 hover:bg-primary/10 transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                    Tambah Poin
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        <button
          type="button"
          onClick={addPasal}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 px-4 py-3.5 text-sm font-semibold text-primary transition-all hover:bg-primary/10 hover:border-primary/50"
        >
          <span className="material-symbols-outlined text-lg">add_circle</span>
          Tambah Pasal Baru
        </button>
      </div>

      {/* ═══ AREA CETAK (hanya terlihat saat print) ═══ */}
      <div className="sk-print-area">
        <div className="print-container portrait">
          {printDocs.map((s, i) => (
            <div key={s.row.id || i} className="sk-doc-print">
              <SKHonorer data={s.skData} mode="preview" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}