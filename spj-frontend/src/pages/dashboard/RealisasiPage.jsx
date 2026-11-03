import { useState } from 'react'
import storageHelper from '../../utils/storageHelper'
import Topbar from '../../components/layout/Topbar'
import { useToast } from '../../components/ui/Toast'
import PanelPreviewDocument from '../../components/templates/PanelPreviewDocument'
import { agregatRealisasi, denganKoreksi } from '../../utils/realisasiAgregat'
import { KOMPONEN, SNP_ROWS } from '../../utils/realisasiPeta'
import { formatTanggalContoh } from '../../utils/dokKas'
import { realisasiDocs } from '../../utils/previewDocs'

const fmtRp = (n) => (Number(n) || 0).toLocaleString('id-ID')
const TAHAP_BULAN = { 1: [1, 2, 3, 4, 5, 6], 2: [7, 8, 9, 10, 11, 12] }

/**
 * MatriksRealisasi — Sprint 024: matriks 7 SNP × 12 komponen dari BKU.
 * Klik sel = koreksi manual (tersimpan `spj_realisasi_koreksi`, menang atas
 * agregat + upload ulang). × = kembali ke angka BKU.
 */
function MatriksRealisasi({ toast }) {
  const bku = storageHelper.get('bku_data', null)
  const txs = bku?.transactions || []
  const tahunAwal = bku?.header?.tahunAnggaran || String(new Date().getFullYear())
  const [tahun, setTahun] = useState(String(tahunAwal))
  const [tahap, setTahap] = useState(1)
  const [segar, setSegar] = useState(0)
  const [editSel, setEditSel] = useState(null)

  const semuaKoreksi = storageHelper.get('spj_realisasi_koreksi', {})
  const prefix = `${tahun}-${tahap}-`
  const koreksi = {}
  for (const [k, v] of Object.entries(semuaKoreksi)) {
    if (k.startsWith(prefix)) koreksi[k.slice(prefix.length)] = v
  }
  const ag = denganKoreksi(agregatRealisasi(txs, { tahap }), koreksi)
  const meta = storageHelper.get('spj_realisasi_meta', {})[`${tahun}-${tahap}`] || {}

  const txTahap = txs.filter((t) => TAHAP_BULAN[tahap].includes(Number(t?.bulan)) && t?.tanggalISO)
  const tgls = txTahap.map((t) => t.tanggalISO).sort()
  const periodeAuto = tgls.length > 0
    ? `${formatTanggalContoh(tgls[0])} s/d ${formatTanggalContoh(tgls[tgls.length - 1])}`
    : ''
  const periode = meta.periode || periodeAuto
  const sumberDana = meta.sumberDana || ''
  const docs = realisasiDocs({ tahun, tahap, txs, koreksi, sumberDana, periode })

  const simpanKoreksi = (key, nilai) => {
    const next = { ...storageHelper.get('spj_realisasi_koreksi', {}) }
    const penuh = `${tahun}-${tahap}-${key}`
    if (nilai === '' || nilai == null) delete next[penuh]
    else next[penuh] = nilai
    storageHelper.set('spj_realisasi_koreksi', next)
    setSegar((v) => v + 1)
  }
  const simpanMeta = (key, nilai) => {
    const semua = storageHelper.get('spj_realisasi_meta', {})
    const k = `${tahun}-${tahap}`
    storageHelper.set('spj_realisasi_meta', { ...semua, [k]: { ...(semua[k] || {}), [key]: nilai } })
    setSegar((v) => v + 1)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 p-4 border-b border-slate-100">
        <span className="material-symbols-outlined text-primary">table_chart</span>
        <h2 className="text-sm font-bold text-slate-900">Matriks Realisasi Dana</h2>
        <div className="flex gap-1 ml-2">
          {[2025, 2026, 2027].map((t) => (
            <button key={t} onClick={() => setTahun(String(t))}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold ${String(t) === tahun ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'}`}>{t}</button>
          ))}
        </div>
        <div className="flex gap-1">
          {[1, 2].map((t) => (
            <button key={t} onClick={() => setTahap(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold ${t === tahap ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'}`}>Tahap {t}</button>
          ))}
        </div>
        <span className={`ml-auto text-[11px] font-bold px-2.5 py-1 rounded-full ${ag.selisih === 0 ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-500'}`}>
          {ag.selisih === 0 ? `Seimbang · Rp ${fmtRp(ag.total)}` : `Selisih Rp ${fmtRp(ag.selisih)}`}
        </span>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 px-4 pt-3">
        <label className="block text-xs text-slate-600">Sumber Dana
          <input value={sumberDana} onChange={(e) => simpanMeta('sumberDana', e.target.value)} placeholder="BOS Reguler …"
            className="mt-1 w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-primary" />
        </label>
        <label className="block text-xs text-slate-600">Periode (otomatis dari BKU)
          <input value={periode} onChange={(e) => simpanMeta('periode', e.target.value)} placeholder="01 Januari … s/d …"
            className="mt-1 w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-primary" />
        </label>
      </div>

      <div className="p-4 overflow-x-auto">
        <table className="w-full text-[11px] border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500">
              <th className="px-2 py-1.5 text-left">SNP</th>
              {KOMPONEN.map((k, i) => <th key={i} className="px-1 py-1 text-right font-medium" title={k}>{i + 1}</th>)}
              <th className="px-2 py-1.5 text-right">Jumlah</th>
            </tr>
          </thead>
          <tbody>
            {ag.matrix.map((row, i) => (
              <tr key={i} className="border-t border-slate-100">
                <td className="px-2 py-1.5 text-slate-700" title={SNP_ROWS[i]}>{SNP_ROWS[i].split(' ').slice(0, 2).join(' ')}</td>
                {row.map((v, k) => {
                  const key = `${i}-${k}`
                  const dikoreksi = koreksi[key] != null && koreksi[key] !== ''
                  const sedang = editSel === key
                  return (
                    <td key={k} className={`px-1 py-1 text-right ${dikoreksi ? 'bg-primary/5' : ''}`}>
                      {sedang ? (
                        <input type="number" autoFocus defaultValue={v}
                          onBlur={(e) => { simpanKoreksi(key, e.target.value); setEditSel(null) }}
                          onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); if (e.key === 'Escape') setEditSel(null) }}
                          className="w-24 px-1 py-0.5 text-[11px] text-right border border-primary rounded outline-none" />
                      ) : (
                        <button onClick={() => setEditSel(key)} title={`Klik untuk koreksi (${KOMPONEN[k]})`}
                          className="inline-flex items-center gap-0.5 hover:text-primary">
                          {fmtRp(v)}
                          {dikoreksi && <span onClick={(e) => { e.stopPropagation(); simpanKoreksi(key, ''); }} title="Kembali ke angka BKU"
                            className="text-[10px] text-slate-400 hover:text-slate-700 px-0.5">×</span>}
                        </button>
                      )}
                    </td>
                  )
                })}
                <td className="px-2 py-1.5 text-right font-bold">{fmtRp(ag.jumlahBaris[i])}</td>
              </tr>
            ))}
            <tr className="border-t-2 border-slate-300 font-bold">
              <td className="px-2 py-1.5">JUMLAH</td>
              {ag.jumlahKolom.map((v, k) => <td key={k} className="px-1 py-1 text-right">{fmtRp(v)}</td>)}
              <td className="px-2 py-1.5 text-right text-primary">{fmtRp(ag.total)}</td>
            </tr>
          </tbody>
        </table>
        <p className="text-[10px] text-slate-400 mt-2">Klik angka untuk koreksi manual (latar biru = terkoreksi, × = kembali ke BKU). Kolom 1–12 = komponen PDF.</p>
        {ag.belum.length > 0 && (
          <p className="text-[11px] text-slate-500 mt-1">Belum dipetakan ({ag.belum.length} baris): {ag.belum.slice(0, 3).map((b) => b.uraian).join('; ')}{ag.belum.length > 3 ? '…' : ''}</p>
        )}
      </div>

      <div className="px-4 pb-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Panel Preview Document</h3>
        {docs.length > 0 ? (
          <PanelPreviewDocument title={`Realisasi Dana Tahap ${tahap} ${tahun}`} docs={docs}
            status={{ perlu: 0, violations: [] }} cetakAktif
            onCek={() => toast.success(ag.selisih === 0 ? 'LENGKAP — siap cetak' : `Selisih Rp ${fmtRp(ag.selisih)}`)}
            onCetak={() => window.print()} />
        ) : (
          <p className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">Belum ada data tahap ini di BKU.</p>
        )}
      </div>
    </div>
  )
}

export default function RealisasiPage() {
  const toast = useToast()

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Realisasi BOSP" subtitle="Dokumen realisasi dana BOS/BOSP" />

      <div className="p-lg space-y-lg flex-1">
        {/* ── Sprint 024: Matriks Realisasi Dana (BKU otomatis + koreksi) ── */}
        <MatriksRealisasi toast={toast} />

        {/* Info */}
        <div className="bg-surface-container-lowest p-lg rounded-xl shadow-lg border border-outline-variant">
          <div className="flex items-start gap-sm">
            <span className="material-symbols-outlined text-primary text-lg">info</span>
            <div>
              <h4 className="font-label-md text-text-high mb-1">Tentang Realisasi BOSP</h4>
              <p className="text-text-low text-sm">Matriks 7 SNP × 12 komponen terisi otomatis dari BKU per tahap. Klik angka untuk koreksi manual, lalu cetak dokumen.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
