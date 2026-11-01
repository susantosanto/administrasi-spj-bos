/**
 * PuterAkunManager.jsx — UI kelola multi-akun Puter (Sprint 020 tambahan)
 *
 * Satu komponen, dua tempat:
 *   - variant="card" — ringkas, di dalam kartu Generate Foto AI
 *     (DokumentasiAIGenerate) — konteks saat generate.
 *   - variant="page" — lengkap, tab "Akun AI" di halaman Pengaturan —
 *     tempat utama mengubah-ubah akun (permintaan user 2026-10-24).
 *
 * Logika rotasi/disimpan token ada di services/puterAkun.js — komponen ini
 * murni UI: tambah akun (popup sign-in), aktifkan (ganti token runtime),
 * hapus, badge "habis kuota".
 */
import { useState, useEffect } from 'react'
import {
  bacaAkun, tambahAkunDariSesi, hapusAkun, aktifkanAkunPuter, tokenAktifPuter, bersihkanHabis, pasangSupresiDialogPuter, keluarPuter,
} from '../../services/puterAkun'
import { masukPuter, preloadPuter } from '../../services/imageGenerator'

export default function PuterAkunManager({ variant = 'card', refreshKey = 0 }) {
  const [versiLokal, setVersiLokal] = useState(0)
  const [akunBusy, setAkunBusy] = useState(false) // popup tambah akun berjalan
  const [akunAktifToken, setAkunAktifToken] = useState(null)
  const [errorLokal, setErrorLokal] = useState(null)

  // Daftar dibaca langsung dari localStorage tiap render; re-render dipicu
  // versiLokal (interaksi di sini) atau refreshKey (akun baru dari luar,
  // mis. auto-capture token sesi saat Generate pertama).
  const daftarAkun = bacaAkun()

  useEffect(() => {
    let hidup = true
    // Supresi dialog "Low Balance" bawaan puter.js (idempotent — dipasang
    // sekali saja walau kartu AI juga memasangnya) + preload modul supaya
    // klik "+ Tambah akun" tidak menunggu import (aktivasi klik bisa
    // kedaluwarsa → popup diblokir diam-diam)
    pasangSupresiDialogPuter()
    preloadPuter().catch(() => {})
    tokenAktifPuter().then((t) => { if (hidup) setAkunAktifToken(t) })
    return () => { hidup = false }
  }, [versiLokal, refreshKey])

  /**
   * Tambah akun: popup sign-in Puter (gesture klik murni → tak diblokir).
   *
   * PENTING: authenticateWithPuter() NO-OP bila masih sign-in (puter.js
   * UI.js:1254 — resolve langsung tanpa popup). Urutan wajib:
   * 1. Simpan sesi aktif ke daftar akun (jangan sampai hilang),
   * 2. Reset sesi (keluarPuter) → popup auth mau terbuka,
   * 3. Popup sukses → token baru terdaftar;
   *    popup dibatalkan/gagal → PULIHKAN sesi lama dari daftar.
   */
  const handleTambahAkun = async () => {
    setAkunBusy(true)
    setErrorLokal(null)
    try {
      await preloadPuter()
      const sesiLama = await tokenAktifPuter()
      if (sesiLama) await tambahAkunDariSesi()
      await keluarPuter()
      try {
        await masukPuter()
        await tambahAkunDariSesi()
        setVersiLokal((v) => v + 1)
      } catch {
        // Popup dibatalkan / ditutup / gagal → pulihkan sesi sebelumnya
        const daftar = bacaAkun()
        const pulih = daftar.find((a) => a.token === sesiLama) || daftar[0]
        if (pulih) {
          await aktifkanAkunPuter(pulih.token).catch(() => {})
        }
        setErrorLokal('Sign-in dibatalkan atau gagal — sesi akun sebelumnya dipulihkan. Coba lagi untuk menambah akun lain.')
      }
    } catch {
      setErrorLokal('Gagal menyiapkan sign-in Puter — coba lagi.')
    } finally {
      setAkunBusy(false)
      setVersiLokal((v) => v + 1) // refresh daftar + token aktif di UI
    }
  }

  /** Aktifkan akun tersimpan → ganti token sesi runtime (tanpa reload).
   *  Status "habis kuota" ikut direset — kuota Puter bisa reset sendiri,
   *  jadi mengaktifkan ulang = memberi akun kesempatan lagi. */
  const handlePilihAkun = async (akun) => {
    setErrorLokal(null)
    try {
      await aktifkanAkunPuter(akun.token)
      bersihkanHabis(akun.id)
      setAkunAktifToken(akun.token)
      setVersiLokal((v) => v + 1)
    } catch {
      setErrorLokal('Gagal mengaktifkan akun — coba lagi.')
    }
  }

  /** Hapus akun dari daftar rotasi (sesi browser tidak diubah). */
  const handleHapusAkun = (id) => {
    hapusAkun(id)
    setVersiLokal((v) => v + 1)
  }

  const halaman = variant === 'page'

  return (
    <div className={halaman
      ? 'bg-surface-container-lowest p-lg rounded-xl shadow-lg border border-outline-variant space-y-md'
      : 'bg-slate-50 border border-slate-200 rounded-xl p-3'}
    >
      {/* Header */}
      <div className={`flex items-center justify-between gap-2 ${halaman ? 'mb-md' : 'mb-1.5'}`}>
        <span className={`${halaman ? 'font-headline-sm text-headline-sm font-bold text-text-high' : 'text-[11px] font-bold text-slate-700'} flex items-center gap-1.5`}>
          <span className={`material-symbols-outlined ${halaman ? 'text-primary text-xl' : 'text-sm text-primary'}`}>manage_accounts</span>
          Akun Puter ({daftarAkun.length})
        </span>
        <button
          type="button"
          onClick={handleTambahAkun}
          disabled={akunBusy}
          className={`flex items-center gap-1 font-bold text-primary bg-white ring-1 ring-primary/30 hover:bg-primary/5 transition-all active:scale-[0.97]
            disabled:opacity-50 disabled:cursor-not-allowed
            ${halaman ? 'px-md py-2 rounded-lg text-sm shadow-sm' : 'px-2.5 py-1.5 rounded-lg text-[11px]'}`}
        >
          <span className="material-symbols-outlined text-base">{akunBusy ? 'hourglass_top' : 'person_add'}</span>
          {akunBusy ? 'Menunggu sign-in…' : '+ Tambah akun'}
        </button>
      </div>

      {halaman && (
        <p className="text-text-low text-sm leading-snug">
          Foto dokumentasi AI dibuat lewat <span className="font-bold text-text-high">Puter.js</span> (model
          User-Pays — kuota dihitung per akun). Simpan beberapa akun Puter di sini:
          saat kuota satu akun habis, Generate otomatis pindah ke akun berikutnya.
        </p>
      )}

      {/* Daftar akun */}
      {daftarAkun.length === 0 ? (
        <p className={`${halaman ? 'text-text-low text-sm' : 'text-[10px] text-slate-400'} leading-snug`}>
          Belum ada akun tersimpan — klik "+ Tambah akun" untuk masuk dengan akun Puter
          (gratis, tanpa API key), atau Generate sekali di kartu Foto AI dan akunnya
          otomatis terdaftar di sini.
        </p>
      ) : (
        <ul className={halaman ? 'space-y-sm' : 'space-y-1'}>
          {daftarAkun.map((a) => {
            const aktif = a.token === akunAktifToken
            return (
              <li key={a.id} className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handlePilihAkun(a)}
                  className={`flex items-center gap-1.5 min-w-0 flex-1 text-left font-semibold transition-all active:scale-[0.98]
                    ${halaman ? 'px-md py-2 rounded-lg text-sm' : 'px-2 py-1.5 rounded-lg text-[11px]'}
                    ${aktif
                      ? 'bg-primary/10 text-primary ring-1 ring-primary/30'
                      : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-primary/30'}`}
                  title={aktif ? 'Akun aktif — dipakai Generate berikutnya' : 'Klik untuk jadikan akun aktif'}
                >
                  <span className="material-symbols-outlined text-base shrink-0">
                    {aktif ? 'radio_button_checked' : 'radio_button_unchecked'}
                  </span>
                  <span className="truncate">{a.label}</span>
                </button>
                {a.habisAt && (
                  <span className={`shrink-0 rounded-md bg-slate-200 text-slate-500 font-bold ${halaman ? 'px-2 py-1 text-[10px]' : 'px-1.5 py-0.5 text-[9px]'}`}>
                    habis kuota
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleHapusAkun(a.id)}
                  className={`shrink-0 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors ${halaman ? 'p-2' : 'p-1'}`}
                  title="Hapus dari daftar rotasi"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {/* Error lokal (sign-in gagal / aktivasi gagal) */}
      {errorLokal && (
        <p className={`${halaman ? 'text-xs' : 'text-[10px]'} text-slate-500 bg-slate-100 border border-slate-200 rounded-lg px-2 py-1.5`}>
          {errorLokal}
        </p>
      )}

      {/* Caption cara kerja */}
      <p className={`${halaman ? 'text-text-low text-xs' : 'text-[10px] text-slate-400'} leading-snug flex items-start gap-1`}>
        <span className="material-symbols-outlined text-xs shrink-0 mt-px">swap_horiz</span>
        <span>
          Kuota habis di satu akun → Generate otomatis pindah ke akun berikutnya.
          Klik akun untuk mengaktifkannya (badge "habis" ikut direset — kuota bisa
          reset sendiri). Hapus (×) untuk keluarkan akun dari rotasi.
        </span>
      </p>
    </div>
  )
}
