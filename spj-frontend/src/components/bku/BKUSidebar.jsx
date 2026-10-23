import { useState, useEffect, useRef } from 'react'

/**
 * BKU Premium Sidebar
 * Sliding detail panel untuk transaksi BKU
 * Animasi smooth, navigasi prev/next, informasi transaksi lengkap
 * Tab: Detail + Dokumentasi (auto-detect template)
 *
 * Design 2026 — minimalis premium: permukaan solid putih, header tanpa blur,
 * tab pakai underline indicator (revisi user 2026-10-21).
 */
import { REKENING_KE_MENU, kategoriDenganKoreksi, simpanKoreksi, gabungKonsumsi, kelompokATK, loadAtkFlag, simpanAtkFlag, parseMamin, grupDenganDominan } from '../../utils/bkuKategori'
import { getNamaKegiatan, getNamaRekening } from '../../data/kodeReferensi'
import { deteksiJenisPajak } from '../../utils/dokPajak'
// Sprint 017: tab "Dokumen LPJ" — panel bersama, disimpan per NoBukti.
import BKUSidebarLpj from './BKUSidebarLpj'
// Sprint 019: blok Dokumentasi pindah ke tab "Dokumen LPJ" (tab Dokumentasi dihapus).
import BKUSidebarDokumentasi from './BKUSidebarDokumentasi'
// Sprint 019 revisi: state foto bersama (upload + AI) → Panel Preview utama.
import useFotoDokumen from './useFotoDokumen'
import { cardBerpanel } from '../../data/kategoriLpj'

// ─── Constants ─────────────────────────────────────────────────

const TYPE_BADGES = {
  PENERIMAAN_BOSP: { bg: 'bg-emerald-100 text-emerald-700', label: 'Dana BOSP' },
  PUNGUT_PPH: { bg: 'bg-amber-100 text-amber-700', label: 'Pungut PPh' },
  PERGESERAN_BANK: { bg: 'bg-blue-100 text-blue-700', label: 'Pergeseran' },
  SETOR_PAJAK: { bg: 'bg-rose-100 text-rose-700', label: 'Setor Pajak' },
  TARIK_TUNAI: { bg: 'bg-orange-100 text-orange-700', label: 'Tarik Tunai' },
  BUNGA_BANK: { bg: 'bg-teal-100 text-teal-700', label: 'Bunga Bank' },
  PAJAK_BUNGA: { bg: 'bg-pink-100 text-pink-700', label: 'Pajak Bunga' },
  PEMBAYARAN: { bg: 'bg-slate-200 text-slate-700', label: 'Pembayaran' },
  SALDO_AWAL: { bg: 'bg-purple-100 text-purple-700', label: 'Saldo Awal' },
  LAINNYA: { bg: 'bg-slate-100 text-slate-500', label: '-' },
}

const fmt = (n) => (n ?? 0).toLocaleString('id-ID')

// ─── Helper: extract Saldo Awal ────────────────────────────────

function getSaldoAwal(items) {
  const saldoAwal = items.find(t => t.tipe === 'SALDO_AWAL' || (t.uraian && (t.uraian.toLowerCase().includes('saldo bank') || t.uraian.toLowerCase().includes('saldo tunai'))))
  return saldoAwal ? saldoAwal.saldo : 0
}

// ─── Component ─────────────────────────────────────────────────

export default function BKUSidebar({ transaction, allTransactions, onClose, onNavigate, showToast, onOpenMamin, onUpdateTransaction }) {
  const sidebarRef = useRef(null)

  // ─── Guard kategori LPJ (Sprint 017) ─────────────────────────────────────
  // Dihitung SEBELUM useState supaya tab awal bisa langsung 'lpj': tanpa ini,
  // baris berkategori LPJ sempat memunculkan tampilan Detail satu frame sebelum
  // efek reset berpindah (kedip yang sama seperti bug prefill BKUSidebarLpj).
  // Semua fungsi di bawah murni (transaction + allTransactions), tanpa state.
  const katRekening = transaction
    ? kategoriDenganKoreksi(transaction.kodeRekening, transaction.noBukti)
    : null
  const grupSaya = katRekening?.kategori === 'mamin'
    ? gabungKonsumsi(allTransactions || []).grup.find((g) => g.rows.some((r) => r.row === transaction.row)) || null
    : null
  const grupSeBukti = (() => {
    if (!transaction) return null
    try {
      return grupDenganDominan(allTransactions || []).find((g) => g.rows.some((r) => r.row === transaction.row)) || null
    } catch { return null }
  })()
  const katEfektif = (grupSeBukti && grupSeBukti.dominan) || katRekening
  const cardLpj = cardBerpanel(katEfektif?.kategori)
  const isLpj = !!cardLpj

  const [activeTab, setActiveTab] = useState(isLpj ? 'lpj' : 'detail')

  // Sprint 019 revisi — foto dokumentasi (upload + AI), satu sumber kebenaran:
  // daftar foto → blok Dokumentasi; dokumen A4 foto → Panel Preview (fotoDocs).
  // Reset otomatis tiap ganti baris (di dalam hook, dep = transaction.row).
  const foto = useFotoDokumen(transaction)

  if (!transaction) return null

  const badge = TYPE_BADGES[transaction.tipe] || TYPE_BADGES.LAINNYA
  const currentIdx = allTransactions.findIndex(t => t.row === transaction.row)
  const hasPrev = currentIdx > 0
  const hasNext = currentIdx < allTransactions.length - 1
  const saldoAwal = getSaldoAwal(allTransactions)

  // Sprint 004 B.1 — koreksi manual kategori (koreksiTick memicu render ulang
  // karena `kategoriDenganKoreksi` membaca storage; memori lihat MEMORY.md).
  const [koreksiTick, setKoreksiTick] = useState(0)
  void koreksiTick
  const handleKoreksi = (idx) => {
    if (idx === '' || idx == null) return
    const entri = REKENING_KE_MENU[Number(idx)]
    if (!entri) return
    simpanKoreksi(transaction.kodeRekening, entri, transaction.noBukti)
    setKoreksiTick((t) => t + 1)
    if (showToast) showToast('Koreksi kategori tersimpan permanen')
  }

  // Sprint 004 D.1 — info kelompok ATK transaksi ini
  const atkGroup = katRekening?.kategori === 'atk'
    ? kelompokATK(allTransactions || []).find((g) => g.rows.some((r) => r.row === transaction.row)) || null
    : null
  const atkFlagKey = String(transaction.noBukti || '').trim().toLowerCase().replace(/\s+/g, ' ')
  const atkFlag = atkFlagKey ? (loadAtkFlag()[atkFlagKey] || null) : null

  // Reset tampilan tiap ganti baris. Sengaja SETELAH `isLpj` dihitung:
  // K-2 — baris berkategori LPJ langsung membuka tab Dokumen LPJ.
  useEffect(() => {
    sidebarRef.current?.focus()
    setActiveTab(isLpj ? 'lpj' : 'detail')
  }, [transaction, isLpj])

  // Tab Pajak/setor: baris SETOR pajak tidak punya dokumen LPJ — tombol aksi
  // mengarah ke pembayaran Coretax, bukan ke halaman dokumen LPJ.
  // Deteksi selaras BKUPage.isPajak, dipersempit ke SETOR (bukan pungut).
  const CORETAX_URL = 'https://coretaxdjp.pajak.go.id/'
  const isSetorPajak = (() => {
    if (transaction.tipe === 'SETOR_PAJAK' || transaction.tipe === 'PAJAK_BUNGA') return true
    if (transaction.tipe === 'PUNGUT_PPH') return false
    const u = String(transaction.uraian || '').toLowerCase()
    if (u.includes('pungut')) return false
    return u.includes('setor') || u.includes('pajak') || u.includes('pph')
      || u.includes('ppn') || u.includes('ntpn') || u.includes('billing') || u.includes('coretax')
  })()

  // Sprint 004 B.2 — deep-link ke menu dokumen tepat (prefill dikonsumsi B.3)
  // T3: pratinjau + prefill Mamin cerdas via parseMamin terpusat.
  const namaKegiatanSaya = (() => {
    if (!transaction.kodeKegiatan) return transaction.kegiatan || ''
    const nama = getNamaKegiatan(transaction.kodeKegiatan)
    const normal = String(transaction.kodeKegiatan).replace(/\.$/, '')
    if (!nama || nama === normal || nama === '-') return transaction.kegiatan || ''
    return nama
  })()
  const maminParsed = katEfektif?.kategori === 'mamin'
    ? parseMamin(transaction.uraian || '', namaKegiatanSaya)
    : null

  // Sprint 017: satu sumber data prefill untuk tab "Dokumen LPJ" dan deep-link lama,
  // supaya bentuk objek `bku` tidak pernah berbeda antara dua jalur.
  const nominalBaris = transaction.pengeluaran || transaction.kredit || 0
  const bkuPrefill = {
    uraian: transaction.uraian,
    nominal: nominalBaris,
    tanggal: transaction.tanggalStr,
    noBukti: transaction.noBukti,
    kegiatan: transaction.kodeKegiatan,
    kegiatanNama: namaKegiatanSaya,
    maminJenis: maminParsed?.jenis || '',
    kodeRekening: transaction.kodeRekening,
    grupCount: grupSeBukti ? grupSeBukti.rows.length : (grupSaya ? grupSaya.rows.length : 1),
    grupTotal: grupSeBukti ? grupSeBukti.total : (grupSaya ? grupSaya.total : nominalBaris),
  }

  // Daftar tab. Baris berkategori LPJ membuka "Dokumen LPJ" lebih dulu dan TIDAK
  // lagi memakai tab "Detail" (permintaan user 2026-10-21) — isinya sudah terwakili
  // oleh panel LPJ (toolbar NoBukti · nominal · uraian) + kartu Ringkasan di panel.
  // Baris non-LPJ tetap "Detail" supaya tidak ada informasi yang hilang.
  // Sprint 019 (K-5): tab "Dokumentasi" DIHAPUS untuk semua baris — bloknya pindah
  // ke tab "Dokumen LPJ" (BKUSidebarDokumentasi). Tiap baris kini 1 tab → baris
  // tab hilang otomatis (guard `tabs.length > 1`).
  const tabs = [
    ...(isLpj
      ? [{ id: 'lpj', label: 'Dokumen LPJ', icon: 'description' }]
      : [{ id: 'detail', label: 'Detail', icon: 'info' }]),
  ]

  // Nominal ringkasan
  const nominalRingkasan = transaction.pengeluaran || transaction.kredit
    || transaction.penerimaan || transaction.debet || 0

  const handlePrev = () => {
    if (hasPrev && onNavigate) onNavigate(allTransactions[currentIdx - 1])
  }
  const handleNext = () => {
    if (hasNext && onNavigate) onNavigate(allTransactions[currentIdx + 1])
  }

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') handlePrev()
    if (e.key === 'ArrowRight') handleNext()
    if (e.key === 'Escape') onClose()
  }

  return (
    <>
      {/* Backdrop — click outside to close */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] animate-fade-in"
        onClick={onClose}
      />

      {/* ══ PANEL DETAIL — permukaan solid putih, tanpa glassmorphism ══ */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 right-0 h-full w-full ${isLpj ? 'max-w-none' : 'max-w-xl'} bg-white shadow-[-8px_0_32px_rgba(15,23,42,0.10)] z-[110] overflow-y-auto animate-slide-in-left border-l border-slate-200/80 outline-none`}
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        {/* ── Sticky Header — solid, tab underline ── */}
        <div className="sticky top-0 z-20 bg-white border-b border-slate-200/80">
          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-2.5">
              <button
                onClick={onClose}
                className="p-2 -ml-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all active:scale-95"
                title="Tutup"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
              <div className="min-w-0">
                <h3 className="text-[15px] font-semibold text-slate-900 tracking-tight leading-tight">Detail Transaksi</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {transaction.tanggalStr} · Baris {transaction.row} / {allTransactions.length}
                </p>
              </div>
            </div>
            {/* Navigation */}
            <div className="flex items-center gap-0.5">
              <button
                onClick={handlePrev}
                disabled={!hasPrev}
                className={`h-9 w-9 grid place-items-center rounded-full transition-all ${
                  hasPrev
                    ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:scale-95'
                    : 'text-slate-300 cursor-not-allowed'
                }`}
                title="Sebelumnya (←)"
              >
                <span className="material-symbols-outlined text-[22px]">chevron_left</span>
              </button>
              <span className="text-[11px] text-slate-400 font-mono tabular-nums min-w-[2.5rem] text-center">
                {currentIdx + 1}/{allTransactions.length}
              </span>
              <button
                onClick={handleNext}
                disabled={!hasNext}
                className={`h-9 w-9 grid place-items-center rounded-full transition-all ${
                  hasNext
                    ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:scale-95'
                    : 'text-slate-300 cursor-not-allowed'
                }`}
                title="Berikutnya (→)"
              >
                <span className="material-symbols-outlined text-[22px]">chevron_right</span>
              </button>
            </div>
          </div>
          {/* ── Tabs (underline indicator minimalis) ── */}
          {tabs.length > 1 && (
            <div className="flex items-center gap-1 px-4">
              {tabs.map((t) => {
                const aktif = activeTab === t.id
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    aria-pressed={aktif}
                    className={`relative flex items-center gap-1.5 px-3.5 py-2.5 text-[13px] transition-colors ${
                      aktif
                        ? 'font-semibold text-primary'
                        : 'font-medium text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">{t.icon}</span>
                    {t.label}
                    {aktif && (
                      <span className="absolute inset-x-0 -bottom-px h-[2px] rounded-full bg-primary" />
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Content ── */}
        <div className="p-5 space-y-4 bg-white">

        {activeTab === 'detail' ? (
          <>
          {/* ── Ringkasan atas: nominal + kategori + no bukti + aksi ── */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-slate-600 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>receipt_long</span>
              </span>
              Ringkasan Transaksi
            </h4>
            <dl className="divide-y divide-slate-100">
              <div className="flex items-center justify-between py-2">
                <dt className="text-sm text-slate-500">Nominal</dt>
                <dd className="text-sm font-semibold text-slate-900">Rp {fmt(nominalRingkasan)}</dd>
              </div>
              <div className="flex items-center justify-between py-2">
                <dt className="text-sm text-slate-500">Kategori</dt>
                <dd className="text-sm font-semibold text-slate-900">
                  {katEfektif ? katEfektif.kategori : badge.label}
                </dd>
              </div>
              <div className="flex items-center justify-between py-2">
                <dt className="text-sm text-slate-500">No. Bukti</dt>
                <dd className="text-sm font-semibold text-slate-900 font-mono">{transaction.noBukti || '-'}</dd>
              </div>
            </dl>
            {isSetorPajak && (
              <div className="grid grid-cols-2 gap-2.5 mt-3">
                <a
                  href={CORETAX_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Bayar pajak via Coretax DJP (tab baru)"
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
                >
                  <span className="material-symbols-outlined text-lg">open_in_new</span>
                  Bayar via Coretax
                </a>
                {/* Tampilkan jenis pajak hasil deteksi dari uraian */}
                <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary/5 text-primary text-sm font-semibold border border-primary/20">
                  <span className="material-symbols-outlined text-lg">receipt_long</span>
                  {deteksiJenisPajak(transaction.uraian) || 'Jenis pajak tidak dikenali'}
                </div>
              </div>
            )}
          </div>
          {/* ── Hero Card: Uraian + Angka Kunci ── */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-primary shadow-md shadow-primary/30 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500 mb-1">Uraian Kegiatan</p>
                <p className="text-lg font-bold text-slate-900 leading-snug">
                  {transaction.uraian || '-'}
                </p>
                {/* Keterangan kegiatan dari kode kegiatan */}
                {transaction.kodeKegiatan && (() => {
                  const normalized = transaction.kodeKegiatan.replace(/\.$/, '')
                  const namaKeg = getNamaKegiatan(transaction.kodeKegiatan)
                  if (!namaKeg || namaKeg === normalized || namaKeg === '-') return null
                  return (
                    <div className="mt-2.5 flex items-start gap-2 bg-primary/10 rounded-xl p-3 border border-primary/25">
                      <span className="material-symbols-outlined text-[18px] text-primary flex-shrink-0 mt-0.5">meeting_room</span>
                      <div className="min-w-0">
                        <p className="text-[11px] text-primary font-bold uppercase tracking-[0.1em]">Kegiatan</p>
                        <p className="text-sm font-bold text-slate-900 leading-relaxed mt-0.5">{namaKeg}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5 font-mono">{normalized}</p>
                      </div>
                    </div>
                  )
                })()}
              </div>
            </div>

            {/* Angka kunci — blue-only: primary + slate */}
            <div className="grid grid-cols-3 gap-2.5 mt-4">
              <div className="rounded-xl bg-primary/10 border border-primary/20 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-primary mb-1">Debet</p>
                <p className="text-base font-bold text-slate-900 leading-tight">
                  {transaction.debet > 0 ? `Rp ${fmt(transaction.debet)}` : '-'}
                </p>
              </div>
              <div className="rounded-xl bg-slate-100 border border-slate-200 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Kredit</p>
                <p className="text-base font-bold text-slate-900 leading-tight">
                  {transaction.kredit > 0 ? `Rp ${fmt(transaction.kredit)}` : '-'}
                </p>
              </div>
              <div className="rounded-xl bg-slate-100 border border-slate-200 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Saldo</p>
                <p className="text-base font-bold text-slate-900 leading-tight">
                  Rp {fmt(transaction.saldo)}
                </p>
              </div>
            </div>
          </div>

          {/* ── Informasi Referensi ── */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-slate-600 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
              </span>
              Informasi Referensi
            </h4>
            <dl className="divide-y divide-slate-100">
              <div className="flex items-start justify-between gap-3 py-2.5">
                <dt className="text-sm font-medium text-slate-600 flex-shrink-0">No. Bukti</dt>
                <dd className="text-sm font-semibold text-slate-900 font-mono text-right">{transaction.noBukti || '-'}</dd>
              </div>
              <div className="flex items-start justify-between gap-3 py-2.5">
                <dt className="text-sm font-medium text-slate-600 flex-shrink-0">Kode Kegiatan</dt>
                <dd className="text-right min-w-0">
                  <span className="text-sm font-semibold text-slate-900 font-mono block">{transaction.kodeKegiatan || '-'}</span>
                  {transaction.kodeKegiatan && (() => {
                    const namaKeg = getNamaKegiatan(transaction.kodeKegiatan)
                    return namaKeg ? <span className="text-xs text-slate-600 block mt-1 leading-relaxed">{namaKeg}</span> : null
                  })()}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-3 py-2.5">
                <dt className="text-sm font-medium text-slate-600 flex-shrink-0">Kode Rekening</dt>
                <dd className="text-right min-w-0">
                  <span className="text-sm font-semibold text-slate-900 font-mono block">{transaction.kodeRekening || '-'}</span>
                  {transaction.kodeRekening && (() => {
                    const namaRek = getNamaRekening(transaction.kodeRekening)
                    return namaRek !== transaction.kodeRekening ? (
                      <span className="text-xs text-slate-600 block mt-1 leading-relaxed">{namaRek}</span>
                    ) : null
                  })()}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-3 py-2.5">
                <dt className="text-sm font-medium text-slate-600 flex-shrink-0">Tanggal</dt>
                <dd className="text-sm font-semibold text-slate-900">{transaction.tanggalStr}</dd>
              </div>
              <div className="flex items-start justify-between gap-3 py-2.5">
                <dt className="text-sm font-medium text-slate-600 flex-shrink-0">Tipe Transaksi</dt>
                <dd>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${badge.bg}`}>
                    {badge.label}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          {/* ── Kategori Belanja (Sprint 004: sumber rekening) ── */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-slate-600 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>category</span>
              </span>
              Kategori Belanja
            </h4>
            {katRekening ? (
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-primary/10">
                  <span className="material-symbols-outlined text-primary text-xl">folder_open</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{katRekening.menu}</p>
                  <p className="text-[11px] text-slate-400 font-mono">Kode: {transaction.kodeRekening}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-500">Belum dipetakan</p>
                <label className="text-[11px] text-slate-500">Koreksi manual (tersimpan permanen):</label>
                <select
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none"
                  defaultValue=""
                  onChange={(e) => handleKoreksi(e.target.value)}
                >
                  <option value="" disabled>Pilih kategori…</option>
                  {REKENING_KE_MENU.map((m, i) => (
                    <option key={m.prefix} value={String(i)}>{m.kategori} → {m.menu}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          {/* ── Rincian Mamin (deep-link pindah ke kartu Ringkasan di atas) ── */}
          {maminParsed && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Rincian Mamin</p>
              <p className="text-sm text-slate-800">Acara: <span className="font-semibold text-slate-900">{maminParsed.acara || '-'}</span></p>
              <p className="text-xs text-slate-500 mt-0.5">Jenis: {maminParsed.jenis === 'rapat' ? 'Rapat' : maminParsed.jenis === 'kegiatan' ? 'Kegiatan' : '—'}</p>
            </div>
          )}
          {/* ── T2: Anggota grup se-NoBukti (satu bukti satu kelompok) ── */}
          {grupSeBukti && grupSeBukti.rows.length > 1 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-slate-600 text-[18px]">folder_open</span>
                </span>
                Rincian se-Bukti {grupSeBukti.noBukti || '-'} ({grupSeBukti.rows.length})
              </h4>
              <p className="text-[11px] text-slate-500 mb-3">
                Kategori: <span className="font-semibold text-primary">{grupSeBukti.dominan ? grupSeBukti.dominan.kategori : 'Belum dipetakan'}</span>
                <span className="font-mono"> &#183; Kode: {(grupSeBukti.kodeList || []).join(', ') || '-'}</span>
              </p>
              <ul className="divide-y divide-slate-100">
                {grupSeBukti.rows.map((r, gi) => {
                  const kat = kategoriDenganKoreksi(r.kodeRekening, r.noBukti)
                  const aktif = r.row === transaction.row
                  return (
                    <li key={`${r.row}-${r.uraian || 'x'}-${gi}`}>
                      <button
                        onClick={() => { if (onNavigate && !aktif) onNavigate(r) }}
                        className={`w-full text-left py-2 flex items-center gap-2 ${aktif ? '' : 'hover:bg-slate-50'} rounded-lg px-1`}
                        title={r.uraian || ''}
                      >
                        <span className={`w-1.5 self-stretch rounded-full ${aktif ? 'bg-primary' : 'bg-slate-200'}`} />
                        <span className="flex-1 min-w-0">
                          <span className={`block text-xs truncate ${aktif ? 'font-bold text-slate-900' : 'text-slate-700'}`}>{r.uraian || '-'}</span>
                          <span className="block font-mono text-[10px] text-slate-400 truncate">{r.kodeRekening || '-'} &#183; Rp {fmt(r.pengeluaran || r.kredit || 0)}</span>
                        </span>
                        {kat ? (
                          <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold bg-primary/10 text-primary flex-shrink-0">{kat.kategori}</span>
                        ) : (
                          <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-medium bg-slate-100 text-slate-500 flex-shrink-0">Belum</span>
                        )}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
          {/* ── Kelompok ATK (Sprint 004 D.1) ── */}
          {atkGroup && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">Kelompok ATK</h4>
              <p className="text-sm text-slate-800">↳ {atkGroup.rows.length} baris se-Nomor <span className="font-mono font-semibold">{atkGroup.noBukti || '-'}</span> · Rp {fmt(atkGroup.total)}</p>
              <div className="flex items-center gap-1.5 mt-2.5">
                <button onClick={() => { simpanAtkFlag(transaction.noBukti, 'siplah'); setKoreksiTick((t) => t + 1) }} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${atkFlag === 'siplah' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'}`}>SIPLAH</button>
                <button onClick={() => { simpanAtkFlag(transaction.noBukti, 'non'); setKoreksiTick((t) => t + 1) }} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${atkFlag === 'non' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-500'}`}>Non-SIPLAH</button>
              </div>
            </div>
          )}
          </>
        ) : activeTab === 'lpj' ? (
          <BKUSidebarLpj
            key={transaction.row}
            transaction={transaction}
            kategori={katEfektif?.kategori}
            bkuPrefill={bkuPrefill}
            onClose={onClose}
            allTransactions={allTransactions || []}
            onNavigate={onNavigate}
            fotoDocs={foto.fotoDocs}
            blokDokumentasi={(
              <BKUSidebarDokumentasi
                transaction={transaction}
                fotoDokumen={foto.fotoDokumen}
                onTambahFotos={foto.tambahFotos}
                onUpdateCaption={foto.updateCaption}
                onHapusFoto={foto.hapusFoto}
                onFotoBaru={foto.tambahFotoAi}
                onRegenerasiFoto={foto.regenerasiFotoAi}
              />
            )}
          />
        ) : null}

          <div className="h-12" />
        </div>
      </div>
    </>
  )
}
