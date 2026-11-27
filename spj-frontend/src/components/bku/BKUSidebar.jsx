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
import { kategoriDenganKoreksi, gabungKonsumsi, kelompokATK, loadAtkFlag, simpanAtkFlag, parseMamin, grupDenganDominan, WARNA_KATEGORI, LABEL_KATEGORI } from '../../utils/bkuKategori'
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
  PENERIMAAN_BOSP: { bg: 'bg-slate-100 text-slate-600', label: 'Dana BOSP' },
  PUNGUT_PPH: { bg: 'bg-slate-100 text-slate-600', label: 'Pungut PPh' },
  PERGESERAN_BANK: { bg: 'bg-slate-100 text-slate-600', label: 'Pergeseran' },
  SETOR_PAJAK: { bg: 'bg-slate-100 text-slate-600', label: 'Setor Pajak' },
  TARIK_TUNAI: { bg: 'bg-slate-100 text-slate-600', label: 'Tarik Tunai' },
  BUNGA_BANK: { bg: 'bg-slate-100 text-slate-600', label: 'Bunga Bank' },
  PAJAK_BUNGA: { bg: 'bg-slate-100 text-slate-600', label: 'Pajak Bunga' },
  PEMBAYARAN: { bg: 'bg-slate-100 text-slate-600', label: 'Pembayaran' },
  SALDO_AWAL: { bg: 'bg-slate-100 text-slate-600', label: 'Saldo Awal' },
  LAINNYA: { bg: 'bg-slate-100 text-slate-500', label: '-' },
}

const fmt = (n) => (n ?? 0).toLocaleString('id-ID')

// ─── Dossier — satu alur bernomor, tanpa tab mati ────────────────────────────
// Setiap seksi punya id jangkar agar sticky bar bisa melompat (smooth scroll
// di dalam panel, tanpa mengubah state).

function Seksi({ id, no, judul, aksi, children }) {
  return (
    <section id={id} aria-label={judul} className="scroll-mt-28">
      <div className="flex items-center gap-2 mb-2.5">
        <span className="text-[10px] font-bold text-primary tabular-nums" aria-hidden="true">{no}</span>
        <h4 className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">{judul}</h4>
        <span className="ml-auto flex items-center gap-1.5">{aksi}</span>
      </div>
      {children}
    </section>
  )
}

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
    ? kategoriDenganKoreksi(transaction.kodeRekening, transaction.noBukti, transaction.tanggalISO || transaction.tanggalStr, transaction.row)
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

  // Flag ATK/SIPLAH dibaca dari storage; tick memicu render ulang setelah
  // pengguna mengubah pilihan. Dropdown kategori tidak lagi ada di sidebar.
  const [koreksiTick, setKoreksiTick] = useState(0)
  void koreksiTick

  // Sprint 004 D.1 — info kelompok ATK transaksi ini
  const atkGroup = katRekening?.kategori === 'atk'
    ? kelompokATK(allTransactions || []).find((g) => g.rows.some((r) => r.row === transaction.row)) || null
    : null
  const atkFlagKey = String(transaction.noBukti || '').trim().toLowerCase().replace(/\s+/g, ' ')
  const atkFlag = atkFlagKey ? (loadAtkFlag()[atkFlagKey] || null) : null

  // Reset tampilan tiap ganti baris + SELALU gulir ke atas (perintah user:
  // buka baris baru harus mulai dari atas, bukan posisi scroll lama).
  // Sengaja SETELAH `isLpj` dihitung: K-2 — baris berkategori LPJ langsung
  // membuka tab Dokumen LPJ.
  useEffect(() => {
    sidebarRef.current?.focus()
    // Instan (bukan smooth): ganti konteks = panel mulai dari atas.
    // Panel di-portal (fixed terhadap viewport, scroll internal sendiri);
    // scroll window DIBIARKAN agar posisi tabel kembali utuh saat tutup.
    if (sidebarRef.current) sidebarRef.current.scrollTop = 0
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
  // Daftar tab dihapus (selalu 1 tab) — activeTab tetap menggerakkan konten.

  // Nominal ringkasan
  const nominalRingkasan = transaction.pengeluaran || transaction.kredit
    || transaction.penerimaan || transaction.debet || 0

  // Lompat antar-seksi (sticky bar) — smooth scroll di dalam panel.
  const lompat = (selector) => {
    const panel = sidebarRef.current
    if (!panel) return
    const el = selector ? panel.querySelector(selector) : null
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    else panel.scrollTo({ top: 0, behavior: 'smooth' })
  }

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
        className="fixed inset-0 bg-slate-900/30 z-[100] animate-fade-in"
        onClick={onClose}
      />

      {/* ══ PANEL DETAIL — full-bleed, tanpa celah tepi ══ */}
      <div
        ref={sidebarRef}
        className={`fixed inset-y-0 right-0 h-full w-full ${isLpj ? 'left-0 max-w-none' : 'left-auto max-w-xl md:rounded-l-3xl md:border-l md:border-slate-200 dark:border-transparent/60'} bg-white dark:bg-slate-900 shadow-[-16px_0_48px_rgba(15,23,42,0.12)] z-[110] overflow-y-auto animate-slide-in-left outline-none`}
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        {/* ── Sticky Header — identitas + navigasi sebaris (tanpa tab mati) ── */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-100 dark:border-transparent">
          <div className="flex items-center gap-1.5 pl-2 pr-3 py-2.5">
            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 dark:bg-white/10 hover:text-slate-900 dark:text-white transition-colors active:scale-95"
              title="Tutup"
              aria-label="Tutup panel detail"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${WARNA_KATEGORI[katEfektif?.kategori]?.dot || 'bg-slate-300'}`}
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-slate-900 dark:text-white tracking-tight leading-tight truncate font-mono">
                {transaction.noBukti || 'Tanpa No Bukti'}
              </p>
              <p className="text-[11px] text-slate-400 tabular-nums truncate">
                {transaction.tanggalStr} · Baris {transaction.row} / {allTransactions.length}
              </p>
            </div>
            {/* Navigation */}
            <div className="flex items-center shrink-0">
              <button
                onClick={handlePrev}
                disabled={!hasPrev}
                className={`h-8 w-8 grid place-items-center rounded-full transition-colors ${
                  hasPrev
                    ? 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 dark:bg-white/10 hover:text-slate-900 dark:text-white active:scale-95'
                    : 'text-slate-200 cursor-not-allowed'
                }`}
                title="Sebelumnya (←)"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
              </button>
              <span className="text-[11px] text-slate-400 tabular-nums min-w-[2.5rem] text-center">
                {currentIdx + 1}/{allTransactions.length}
              </span>
              <button
                onClick={handleNext}
                disabled={!hasNext}
                className={`h-8 w-8 grid place-items-center rounded-full transition-colors ${
                  hasNext
                    ? 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 dark:bg-white/10 hover:text-slate-900 dark:text-white active:scale-95'
                    : 'text-slate-200 cursor-not-allowed'
                }`}
                title="Berikutnya (→)"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="p-5 space-y-4 bg-white dark:bg-slate-900">

        {activeTab === 'detail' ? (
          <>
          {/* ── 02 NILAI — satu angka hero + meta sebaris ── */}
          <Seksi id="seksi-nilai" no="02" judul="Nilai Transaksi">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${badge.bg}`}>
                {badge.label}
              </span>
              {katEfektif?.kategori && katEfektif.kategori !== 'belum' && (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${WARNA_KATEGORI[katEfektif.kategori]?.pill || 'bg-slate-100 text-slate-700'}`}>
                  <span className={`h-1 w-1 rounded-full ${WARNA_KATEGORI[katEfektif.kategori]?.dot || 'bg-slate-400'}`} aria-hidden="true" />
                  {LABEL_KATEGORI[katEfektif.kategori] || katEfektif.kategori}
                </span>
              )}
              <span className="ml-auto font-mono text-[11px] text-slate-400 tabular-nums">{transaction.noBukti || '-'}</span>
            </div>
            <p className="mt-3 text-[30px] leading-none font-bold text-slate-900 dark:text-white tabular-nums tracking-tight">
              Rp {fmt(nominalRingkasan)}
            </p>
            <p className="mt-2 text-[13px] font-medium text-slate-700 dark:text-slate-200 leading-snug">
              {transaction.uraian || '-'}
            </p>
            {transaction.kodeKegiatan && (() => {
              const normalized = transaction.kodeKegiatan.replace(/\.$/, '')
              const namaKeg = getNamaKegiatan(transaction.kodeKegiatan)
              if (!namaKeg || namaKeg === normalized || namaKeg === '-') return null
              return (
                <p className="mt-1.5 text-[11px] text-slate-400 leading-relaxed">
                  {namaKeg} <span className="font-mono">· {normalized}</span>
                </p>
              )
            })()}
            {/* Angka kunci — satu strip ringkas, bukan 3 kartu */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-transparent">
              {[
                ['Debet', transaction.debet],
                ['Kredit', transaction.kredit],
                ['Saldo', transaction.saldo],
              ].map(([label, nilai]) => (
                <div key={label}>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">{label}</p>
                  <p className="text-[15px] font-bold text-slate-900 dark:text-white tabular-nums mt-0.5">
                    {nilai > 0 ? fmt(nilai) : <span className="text-slate-300 font-medium">-</span>}
                  </p>
                </div>
              ))}
            </div>
            {isSetorPajak && (
              <div className="grid grid-cols-2 gap-2 mt-3">
                <a
                  href={CORETAX_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Bayar pajak via Coretax DJP (tab baru)"
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-[13px] font-semibold hover:bg-slate-800 active:scale-[0.98] transition-all"
                >
                  <span className="material-symbols-outlined text-base">open_in_new</span>
                  Bayar via Coretax
                </a>
                <div className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 text-[13px] font-semibold">
                  <span className="material-symbols-outlined text-base">receipt_long</span>
                  {deteksiJenisPajak(transaction.uraian) || 'Jenis pajak tidak dikenali'}
                </div>
              </div>
            )}
          </div>
          </Seksi>

          {/* ── 04 RINCIAN — grid 2 kolom ringkas (ganti dl 5-baris) ── */}
          <Seksi id="seksi-rincian" no="04" judul="Rincian Transaksi">
          <div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">No. Bukti</dt>
                <dd className="text-sm font-semibold text-slate-900 dark:text-white font-mono mt-0.5">{transaction.noBukti || '-'}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">Tanggal</dt>
                <dd className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">{transaction.tanggalStr}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">Kode Kegiatan</dt>
                <dd className="mt-0.5">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white font-mono">{transaction.kodeKegiatan || '-'}</span>
                  {transaction.kodeKegiatan && (() => {
                    const namaKeg = getNamaKegiatan(transaction.kodeKegiatan)
                    return namaKeg ? <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{namaKeg}</span> : null
                  })()}
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">Kode Rekening</dt>
                <dd className="mt-0.5">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white font-mono">{transaction.kodeRekening || '-'}</span>
                  {transaction.kodeRekening && (() => {
                    const namaRek = getNamaRekening(transaction.kodeRekening)
                    return namaRek !== transaction.kodeRekening ? (
                      <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{namaRek}</span>
                    ) : null
                  })()}
                </dd>
              </div>
            </dl>
          </div>
          </Seksi>

          {/* ── Kategori Belanja (Sprint 004: sumber rekening) ──
              Sprint 023 (R-2): baris setor pajak tidak punya dokumen LPJ —
              card ini disembunyikan khusus untuk isSetorPajak. Informasi
              Referensi di atas tetap tampil.
              Kunci 2026-11-26: kategori operasional = info-only (cukup
              struk/nota/kwitansi atau arsip tagihan) — tanpa dokumen LPJ. */}
          {!isSetorPajak && (
          <Seksi id="seksi-kategori" judul="Kategori Belanja">
            {katEfektif?.kategori === 'operasional' ? (
              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-slate-400 text-lg shrink-0 mt-0.5">receipt_long</span>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  <span className="font-semibold text-slate-800 dark:text-slate-100">Operasional</span> — cukup
                  struk / nota / kwitansi sebagai bukti. Tidak ada dokumen LPJ yang perlu dibuat.
                </p>
              </div>
            ) : katRekening ? (
              <div className="flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full bg-slate-900 shrink-0" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">{katRekening.menu}</p>
                  <p className="text-[11px] text-slate-400 font-mono truncate">{transaction.kodeRekening}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Belum dipetakan</p>
                <p className="text-[11px] text-slate-400">
                  Pilih kategori melalui kolom <strong>Tipe</strong> pada tabel BKU.
                </p>
              </div>
            )}
          </Seksi>
          )}
          {/* Rincian Mamin sudah terwakili di seksi 03 STATUS (acara + jenis) — kartu ganda dihapus. */}
          {/* ── Anggota grup se-NoBukti ── */}
          {grupSeBukti && grupSeBukti.rows.length > 1 && (
            <Seksi
              id="seksi-anggota"
              judul={`Anggota se-Bukti ${grupSeBukti.noBukti || '-'} · ${grupSeBukti.rows.length} baris`}
              aksi={<span className="text-[11px] text-slate-400 tabular-nums">Rp {fmt(grupSeBukti.total)}</span>}
            >
              <ul className="divide-y divide-slate-100">
                {grupSeBukti.rows.map((r, gi) => {
                  const kat = kategoriDenganKoreksi(r.kodeRekening, r.noBukti, r.tanggalISO || r.tanggalStr, r.row)
                  const aktif = r.row === transaction.row
                  return (
                    <li key={`${r.row}-${r.uraian || 'x'}-${gi}`}>
                      <button
                        onClick={() => { if (onNavigate && !aktif) onNavigate(r) }}
                        className="w-full text-left py-2 flex items-center gap-2 rounded-lg px-1 transition-colors"
                        title={r.uraian || ''}
                      >
                        <span className={`w-1.5 self-stretch rounded-full ${aktif ? 'bg-primary' : 'bg-slate-200'}`} />
                        <span className="flex-1 min-w-0">
                          <span className={`block text-xs truncate ${aktif ? 'font-bold text-slate-900 dark:text-white' : 'text-slate-700'}`}>{r.uraian || '-'}</span>
                          <span className="block font-mono text-[10px] text-slate-400 truncate">{r.kodeRekening || '-'} &#183; Rp {fmt(r.pengeluaran || r.kredit || 0)}</span>
                        </span>
                        {kat ? (
                          <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold bg-primary/10 text-primary flex-shrink-0">{kat.kategori}</span>
                        ) : (
                          <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-medium bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 flex-shrink-0">Belum</span>
                        )}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </Seksi>
          )}
          {/* ── Kelompok ATK (Sprint 004 D.1) — panel fungsional, tanpa nomor ── */}
          {atkGroup && (
            <Seksi judul="Kelompok ATK">
              <p className="text-sm text-slate-800 dark:text-slate-100">↳ {atkGroup.rows.length} baris se-Nomor <span className="font-mono font-semibold">{atkGroup.noBukti || '-'}</span> · Rp {fmt(atkGroup.total)}</p>
              <div className="flex items-center gap-1.5 mt-2.5">
                <button onClick={() => { simpanAtkFlag(transaction.noBukti, 'siplah'); setKoreksiTick((t) => t + 1) }} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${atkFlag === 'siplah' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400'}`}>SIPLAH</button>
                <button onClick={() => { simpanAtkFlag(transaction.noBukti, 'non'); setKoreksiTick((t) => t + 1) }} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${atkFlag === 'non' ? 'bg-slate-700 text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400'}`}>Non-SIPLAH</button>
              </div>
            </Seksi>
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

        {/* ── Sticky bottom bar: konteks + lompat seksi + tutup ── */}
        <div className="sticky bottom-0 z-10 -mx-5 px-5 py-2.5 bg-white/90 dark:bg-[#0d1424]/90 backdrop-blur border-t border-slate-100 dark:border-transparent">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap ${WARNA_KATEGORI[katEfektif?.kategori]?.pill || 'bg-slate-100 text-slate-600'}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${WARNA_KATEGORI[katEfektif?.kategori]?.dot || 'bg-slate-300'}`} aria-hidden="true" />
              {katEfektif?.kategori && katEfektif.kategori !== 'belum'
                ? (LABEL_KATEGORI[katEfektif.kategori] || katEfektif.kategori)
                : 'Belum dipetakan'}
            </span>
            {isLpj ? (
              <>
                <button type="button" onClick={() => lompat(null)} className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-slate-500 hover:text-primary whitespace-nowrap transition-colors">Isian</button>
                <button type="button" onClick={() => lompat('[data-blok="pbj"]')} className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-slate-500 hover:text-primary whitespace-nowrap transition-colors">Lampiran</button>
                <button type="button" onClick={() => lompat('#seksi-cetak')} className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-slate-500 hover:text-primary whitespace-nowrap transition-colors">Cetak</button>
              </>
            ) : (
              <>
                <button type="button" onClick={() => lompat('#seksi-rincian')} className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-slate-500 hover:text-primary whitespace-nowrap transition-colors">Rincian</button>
                {grupSeBukti && grupSeBukti.rows.length > 1 && (
                  <button type="button" onClick={() => lompat('#seksi-anggota')} className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-slate-500 hover:text-primary whitespace-nowrap transition-colors">Anggota</button>
                )}
              </>
            )}
            <button
              type="button"
              onClick={onClose}
              className="ml-auto shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-900 active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-sm">close</span>
              Tutup
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
