/**
 * ReferensiKodePage.jsx — Referensi Kode Kegiatan & Kode Rekening ARKAS
 *
 * Menampilkan tabel referensi kode kegiatan dan kode rekening dari ARKAS.
 * Fitur:
 * - Tabel kode kegiatan (searchable, 200+ item)
 * - Tabel kode rekening (searchable)
 * - Tombol refresh untuk update dari portal ARKAS
 * - Last updated info
 */
import { useState, useEffect, useMemo } from 'react'
import Topbar from '../../components/layout/Topbar'
import { useToast } from '../../components/ui/Toast'
import { KEGIATAN_BOS, REKENING_MAP, refreshKodeReferensi } from '../../data/kodeReferensi'

// ─── Tabs ─────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'kegiatan', label: 'Kode Kegiatan', icon: 'dataset', count: KEGIATAN_BOS.length },
  { id: 'rekening', label: 'Kode Rekening', icon: 'account_balance', count: REKENING_MAP.length },
]

// ─── SNP Badge Color ──────────────────────────────────────────────────────
const SNP_COLORS = {
  Isi: 'bg-violet-100 text-violet-700',
  Proses: 'bg-blue-100 text-blue-700',
  PTK: 'bg-amber-100 text-amber-700',
  Sarpras: 'bg-emerald-100 text-emerald-700',
  Pengelolaan: 'bg-cyan-100 text-cyan-700',
  Pembiayaan: 'bg-orange-100 text-orange-700',
  Penilaian: 'bg-rose-100 text-rose-700',
}
function getSnpColor(snp) {
  return SNP_COLORS[snp] || 'bg-slate-100 text-slate-600'
}

// ─── Group Header ─────────────────────────────────────────────────────────
function GroupHeader({ label, icon }) {
  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-primary/5 via-primary/3 to-transparent border-b border-primary/10">
      <span className="material-symbols-outlined text-sm text-primary">{icon}</span>
      <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-primary">{label}</span>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
export default function ReferensiKodePage() {
  const toast = useToast()
  const [tab, setTab] = useState('kegiatan')
  const [search, setSearch] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(null)

  // Load last update from localStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('spj_kode_referensi_update'))
      if (saved?.timestamp) setLastUpdate(saved.timestamp)
    } catch {}
  }, [])

  // ── Filtered data ──
  const filteredKegiatan = useMemo(() => {
    if (!search.trim()) return KEGIATAN_BOS
    const q = search.toLowerCase()
    return KEGIATAN_BOS.filter(k =>
      k.kode.toLowerCase().includes(q) ||
      k.uraian.toLowerCase().includes(q) ||
      k.komponen.toLowerCase().includes(q) ||
      k.snp.toLowerCase().includes(q)
    )
  }, [search])

  const filteredRekening = useMemo(() => {
    if (!search.trim()) return REKENING_MAP
    const q = search.toLowerCase()
    return REKENING_MAP.filter(r =>
      r.kode.toLowerCase().includes(q) ||
      r.label.toLowerCase().includes(q) ||
      r.kelompok.toLowerCase().includes(q)
    )
  }, [search])

  // ── Group kegiatan by SNP ──
  const groupedKegiatan = useMemo(() => {
    const groups = {}
    for (const k of filteredKegiatan) {
      if (!groups[k.snp]) groups[k.snp] = []
      groups[k.snp].push(k)
    }
    return groups
  }, [filteredKegiatan])

  // ── Group rekening by kelompok ──
  const groupedRekening = useMemo(() => {
    const groups = {}
    for (const r of filteredRekening) {
      if (!groups[r.kelompok]) groups[r.kelompok] = []
      groups[r.kelompok].push(r)
    }
    return groups
  }, [filteredRekening])

  // ── Refresh handler ──
  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      const result = await refreshKodeReferensi()
      if (result.success) {
        toast.success(result.message)
        setLastUpdate(new Date().toISOString())
      } else {
        toast.warning(result.message)
      }
    } catch (err) {
      toast.error(`Gagal refresh: ${err.message}`)
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <Topbar title="Kode Referensi" subtitle="Kode Kegiatan & Rekening ARKAS" />

      <div className="p-lg space-y-lg flex-1">
        {/* ── Header Info ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">book_2</span>
                Referensi Kode ARKAS
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Sumber:{' '}
                <a
                  href="https://pusatinformasi.rumahpendidikan.kemendikdasmen.go.id/hc/id/articles/52436049920153-Kode-Referensi-Pada-ARKAS-4"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline hover:no-underline"
                >
                  Portal ARKAS Kemendikdasmen
                </a>
              </p>
              {lastUpdate && (
                <p className="text-[10px] text-slate-400 mt-1">
                  Terakhir update: {new Date(lastUpdate).toLocaleDateString('id-ID', { 
                    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                  })}
                </p>
              )}
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-blue-600 text-white rounded-xl text-xs font-semibold shadow-lg shadow-primary/20 hover:brightness-110 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              <span className={`material-symbols-outlined text-base ${refreshing ? 'animate-spin' : ''}`}>
                {refreshing ? 'sync' : 'refresh'}
              </span>
              {refreshing ? 'Memperbarui...' : 'Refresh dari ARKAS'}
            </button>
          </div>
        </div>

        {/* ── Tab Navigation ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Tab buttons + Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-slate-100">
            <div className="flex gap-1">
              {TABS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                    tab === t.id
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">{t.icon}</span>
                  {t.label}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    tab === t.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {t.count}
                  </span>
                </button>
              ))}
            </div>
            <div className="relative flex-1 max-w-xs">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                search
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Cari ${tab === 'kegiatan' ? 'kegiatan' : 'rekening'}...`}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* ── Content ── */}
          <div className="max-h-[65vh] overflow-y-auto">
            {tab === 'kegiatan' && (
              <div className="divide-y divide-slate-100">
                {Object.entries(groupedKegiatan).map(([snp, items]) => (
                  <div key={snp}>
                    <GroupHeader label={snp} icon="dataset" />
                    <div className="divide-y divide-slate-50">
                      {items.map((k, i) => (
                        <div
                          key={k.kode}
                          className="flex items-start gap-4 px-4 py-3 hover:bg-slate-50 transition-colors"
                        >
                          {/* Kode */}
                          <code className="text-xs font-mono font-bold text-primary bg-primary/5 px-2 py-1 rounded-lg min-w-[80px] shrink-0">
                            {k.kode}
                          </code>
                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-slate-800 font-medium leading-relaxed">
                              {k.uraian}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {k.komponen}
                            </p>
                          </div>
                          {/* SNP Badge */}
                          <span className={`text-[10px] font-semibold px-2 py-1 rounded-full shrink-0 ${getSnpColor(snp)}`}>
                            {snp}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {filteredKegiatan.length === 0 && (
                  <div className="p-8 text-center">
                    <span className="material-symbols-outlined text-3xl text-slate-300 mb-2">search_off</span>
                    <p className="text-xs text-slate-400">Tidak ada kegiatan dengan kata kunci "{search}"</p>
                  </div>
                )}
              </div>
            )}

            {tab === 'rekening' && (
              <div className="divide-y divide-slate-100">
                {Object.entries(groupedRekening).map(([kelompok, items]) => (
                  <div key={kelompok}>
                    <GroupHeader label={kelompok} icon="account_balance" />
                    <div className="divide-y divide-slate-50">
                      {items.map((r, i) => (
                        <div
                          key={r.kode}
                          className="flex items-start gap-4 px-4 py-3 hover:bg-slate-50 transition-colors"
                        >
                          {/* Kode */}
                          <code className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg min-w-[140px] shrink-0">
                            {r.kode}
                          </code>
                          {/* Label */}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-slate-800 font-medium">{r.label}</p>
                          </div>
                          {/* Kelompok badge */}
                          <span className="text-[10px] font-semibold px-2 py-1 bg-slate-100 text-slate-600 rounded-full shrink-0">
                            {r.kelompok}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {filteredRekening.length === 0 && (
                  <div className="p-8 text-center">
                    <span className="material-symbols-outlined text-3xl text-slate-300 mb-2">search_off</span>
                    <p className="text-xs text-slate-400">Tidak ada rekening dengan kata kunci "{search}"</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Footer stats ── */}
        <div className="text-center">
          <p className="text-[10px] text-slate-400">
            {KEGIATAN_BOS.length} kode kegiatan • {REKENING_MAP.length} kode rekening
            {tab === 'kegiatan' && filteredKegiatan.length !== KEGIATAN_BOS.length && (
              <span> • menampilkan {filteredKegiatan.length} kegiatan</span>
            )}
            {tab === 'rekening' && filteredRekening.length !== REKENING_MAP.length && (
              <span> • menampilkan {filteredRekening.length} rekening</span>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
