/**
 * maminOtomatis — nilai otomatis / bawaan untuk form Mamin Sprint 018.
 *
 * AD-4: preview Mamin (`previewDocs.maminDocs`) dan area cetak Mamin
 * (`MaminPreview.jsx`) adalah DUA builder terpisah. Kalau nilai bawaan hanya
 * dipasang di preview → yang tampil di layar ≠ yang tercetak. Karena itu
 * semua nilai otomatis dihitung DI SATU tempat (fungsi ini) lalu hasilnya
 * dipakai bersama oleh form, preview, dan area cetak (lewat `formData`).
 *
 * Prinsip (K-6 "satu data satu sumber"):
 * - Field yang SUDAH terisi (milik user) TIDAK pernah ditimpa (formData-first).
 * - Tanpa sumber → `''` (jujur, bukan karangan).
 * - Teks bawaan diambil dari template RESMI (`aturanUndangan` / `aturanMamin`),
 *   bukan string yang disalin.
 *
 * Daftar field yang TIDAK punya input form (REQUIREMENTS §3.2) — 17 field.
 */
import { getSchoolData, getPejabat } from './sekolahData'
import { templateUndanganMamin, hariDariISO, tanggalPanjang, keISO } from './aturanUndangan'
import { templatePesananMamin } from './aturanMamin'

/** Field yang nilainya berasal dari sumber lain (tanpa input form). */
export const DAFTAR_FIELD_OTOMATIS = [
  // Surat Undangan
  // (`alamatUndangan` & `instansiUndangan` TIDAK lagi otomatis — temuan user
  //  2026-10-22: alamat sekolah bocor ke bawah "Kepada Yth, Bapak/Ibu Guru".)
  'sifatUndangan', 'lampiranUndangan', 'perihalUndangan', 'kepadaUndangan', 'isiUndangan',
  'hariUndangan', 'tanggalAcara', 'tempatAcara', 'waktuAcara',
  // Surat Pesanan
  'sifatPesanan', 'perihalPesanan', 'isiPesanan', 'hariPesanan',
  // Umum
  'tanggalDanaMasuk',
]

/** Field di dalam `formData.bukuTamu` yang juga otomatis. */
export const DAFTAR_FIELD_BUKU_TAMU = ['tanggal', 'bertemu', 'diterima', 'tujuan', 'uraian']

/** Nilai tetap (hardcode) — decided user 2026-10-21. */
export const HARDCODE = {
  sifatUndangan: 'Biasa',
  lampiranUndangan: '-',
  kepadaUndangan: 'Bapak/Ibu Guru',
  sifatPesanan: 'Biasa',
}

const kosong = (v) => v == null || (typeof v === 'string' && v.trim() === '')

/** Isi field hanya bila masih kosong (formData-first). */
const isi = (obj, key, nilai) => {
  if (kosong(nilai)) return false
  if (!kosong(obj[key])) return false
  obj[key] = nilai
  return true
}

/**
 * Terapkan nilai otomatis ke formData Mamin.
 * @param {object} formData  form Mamin (raw)
 * @param {object} ctx       { bku, sekolah, kepalaSekolah, jenis }
 * @returns {object} formData BARU (tidak mengubah input)
 */
export function terapkanOtomatisMamin(formData = {}, ctx = {}) {
  const fd = { ...(formData || {}) }
  const sekolah = ctx.sekolah || getSchoolData()
  const ks = ctx.kepalaSekolah || getPejabat('ks') || {}
  const bku = ctx.bku || {}
  const namaSekolah = String(sekolah?.namaSekolah || '').trim()

  // ── Section 1: dasar kegiatan ─────────────────────────────────────────────
  // Tanggal kegiatan = tanggal baris BKU (tidak ada input tanggal terpisah).
  const tanggalISO = keISO(fd.tanggal || bku.tanggal || bku.tanggalISO || '')
  const hari = hariDariISO(tanggalISO)
  const tanggalP = tanggalISO ? tanggalPanjang(tanggalISO) : ''

  // Tempat default "Ruang Rapat <nama sekolah>" (user 2026-10-21).
  // Nilai polos "<nama sekolah>" (hasil prefill lama) ikut di-upgrade;
  // nilai lain = milik user → tidak disentuh.
  const tempatSekarang = String(fd.tempat || '').trim()
  if (tempatSekarang === '' || (namaSekolah && tempatSekarang === namaSekolah)) {
    fd.tempat = namaSekolah ? `Ruang Rapat ${namaSekolah}` : 'Ruang Rapat'
  }

  // "Tanggal dana masuk" = tanggal pencairan BKU (nilai, tanpa input form).
  isi(fd, 'tanggalDanaMasuk', bku.tanggal || bku.tanggalISO || '')

  // ── Surat Undangan ────────────────────────────────────────────────────────
  const acara = String(fd.acara || bku.uraian || '').trim()
  const tplUndangan = templateUndanganMamin({
    acara, hari, tanggal: tanggalP, tempat: fd.tempat || '', waktu: fd.waktu || '', jenis: ctx.jenis || '',
  })
  isi(fd, 'hariUndangan', tplUndangan.hariUndangan)
  isi(fd, 'tanggalAcara', tplUndangan.tanggalAcara)
  isi(fd, 'tempatAcara', tplUndangan.tempatAcara)
  isi(fd, 'waktuAcara', tplUndangan.waktuAcara)
  isi(fd, 'perihalUndangan', tplUndangan.perihalUndangan)
  isi(fd, 'isiUndangan', tplUndangan.isiUndangan)
  isi(fd, 'sifatUndangan', HARDCODE.sifatUndangan)
  isi(fd, 'lampiranUndangan', HARDCODE.lampiranUndangan)
  isi(fd, 'kepadaUndangan', HARDCODE.kepadaUndangan)
  // ⚠️ TEMUAN USER 2026-10-22: "kenapa ada nama Jl Raya setelah Kepada Yth,
  // Bapak/Ibu Guru? biasanya itu default di tempat saja". Dulu dua baris ini
  // mengisi `alamatUndangan` DAN `instansiUndangan` dengan alamat SEKOLAH
  // sendiri, sehingga undangan untuk guru sendiri mencetak alamat pengirim
  // dua kali di bawah nama penerima. Untuk penerima internal tidak ada
  // alamat — cukup "di / tempat". Kalau undangan ditujukan ke pihak lain,
  // user mengisi Alamat/Instansi sendiri lewat form.

  // ── Surat Pesanan ─────────────────────────────────────────────────────────
  // Tanggal di dokumen Pesanan diambil dari TANGGAL SURAT (A-8).
  // Selama user BELUM mengetik sendiri di field "Hari/Tanggal", nilainya ikut
  // mengikuti Tanggal Surat; setelah diketik → milik user (penanda
  // `hariPesananManual`).
  const tglSuratISO = keISO(fd.tanggalSurat || '')
  const hariSurat = hariDariISO(tglSuratISO)
  const tanggalSuratP = tglSuratISO ? tanggalPanjang(tglSuratISO) : ''
  const tplPesanan = templatePesananMamin({ acara, tanggal: fd.tanggal || bku.tanggal || '', uraian: bku.uraian || '', jenis: ctx.jenis || '' })
  isi(fd, 'isiPesanan', tplPesanan.isiPesanan)
  isi(fd, 'sifatPesanan', HARDCODE.sifatPesanan)
  isi(fd, 'perihalPesanan', tplPesanan.perihalPesanan || 'Surat Pesanan')
  if (hariSurat && tanggalSuratP) {
    if (fd.hariPesananManual) {
      // milik user — jangan disentuh
    } else {
      fd.hariPesanan = `${hariSurat} ${tanggalSuratP}`
    }
  }

  // ── Buku Tamu Kedinasan ──────────────────────────────────────────────────
  const bt = { ...(fd.bukuTamu || {}) }
  isi(bt, 'tanggal', hari && tanggalP ? `${hari}, ${tanggalP}` : tanggalP)
  isi(bt, 'bertemu', String(ks?.nama || '').trim())
  isi(bt, 'diterima', 'Kepala Sekolah')
  isi(bt, 'tujuan', acara)
  isi(bt, 'uraian', acara)
  fd.bukuTamu = bt

  return fd
}

/** Field yang terisi otomatis pada formData (untuk audit/test). */
export function fieldTerisiOtomatis(formData = {}) {
  const out = []
  for (const f of DAFTAR_FIELD_OTOMATIS) if (!kosong(formData[f])) out.push(f)
  const bt = formData.bukuTamu || {}
  for (const f of DAFTAR_FIELD_BUKU_TAMU) if (!kosong(bt[f])) out.push(`bukuTamu.${f}`)
  return out
}

export default { terapkanOtomatisMamin, fieldTerisiOtomatis, DAFTAR_FIELD_OTOMATIS, DAFTAR_FIELD_BUKU_TAMU, HARDCODE }
