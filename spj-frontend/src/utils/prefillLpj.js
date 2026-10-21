/**
 * prefillLpj — isi otomatis form Dokumen LPJ dari satu baris BKU.
 *
 * Sprint 017 AD-3: logika ini dipindahkan APA ADANYA dari
 * `pages/dashboard/DokumenSPJPage.jsx` (blok `useEffect` prefill, dulu baris 178-291)
 * agar halaman LPJ dan sidebar BKU memakai jalur yang sama — isi otomatis tidak
 * boleh berbeda antara dua pintu masuk.
 *
 * Fungsi MURNI terhadap state React: tidak memanggil setState, tidak menulis
 * snapshot. Pemanggil yang mengurus snapshot/Urungkan dan setState.
 */
import {
  prefillDariBKU, pejabatPada, parseMamin, kupasPrefiksKonsumsi,
  denganKegiatan, bacaGTKUntukHadir,
} from './bkuKategori'
import {
  templateUndanganMamin, templateUndanganPerjDinas, drafNotulen,
  hariDariISO, tanggalPanjang, keISO,
} from './aturanUndangan'
import { templatePesananMamin, templateDaftarHadir, templateBukuTamu, lengkapiNotulen } from './aturanMamin'
import { getSchoolData, getPejabat } from './sekolahData'
import { getNamaKegiatan } from '../data/kodeReferensi'

/**
 * @param {object}   args
 * @param {object}   args.card      kartu LPJ (dari CARDS) — sudah ditemukan pemanggil
 * @param {object}   args.bku       baris BKU (tanggal, uraian, kegiatan, kegiatanNama, noBukti, ...)
 * @param {string}   args.menu      id kartu ('mamin' | 'honor' | 'perjalanan_dinas' | 'pemeliharaan')
 * @param {string}   [args.subId]   sub-kategori terpilih
 * @param {object}   [args.formData] form saat ini (dipakai prefillDariBKU agar tidak menimpa)
 * @returns {{ tambahan: object, diisi: string[], dilewati: string[], tertimpa: string[],
 *             subPilih: object|null, sppdTambahan: object|null }}
 */
export function bangunPrefillLpj({ card, bku, menu, subId = '', formData = {} }) {
  const firstValidSub = card?.subKategori?.find((s) => !s.comingSoon) || null

  // T3: kegiatan kode → nama untuk parser Mamin (fallback bila kegiatanNama kosong).
  const bkuIn = { ...(bku || {}) }
  if (!String(bkuIn.kegiatanNama || '').trim() && bkuIn.kegiatan) {
    const nm = getNamaKegiatan(bkuIn.kegiatan)
    const normal = String(bkuIn.kegiatan).replace(/\.$/, '')
    if (nm && nm !== normal && nm !== '-') bkuIn.kegiatanNama = nm
  }

  const { tambahan, diisi, dilewati, tertimpa } = prefillDariBKU(bkuIn, menu, formData, subId)

  // T3: pilih sub-jenis Mamin dari parser (rapat/kegiatan); fallback jujur = default.
  let subPilih = firstValidSub
  if (menu === 'mamin') {
    const jenis = tambahan.maminJenis || bkuIn.maminJenis || parseMamin(bkuIn.uraian || '', bkuIn.kegiatanNama || '').jenis
    const cocok = card?.subKategori?.find((s) => !s.comingSoon && s.id === jenis)
    if (cocok) subPilih = cocok
    delete tambahan.maminJenis
  }

  // Sprint 005 B/C: template aturan per kategori (hasil editable di form).
  const isoTgl = keISO(bkuIn.tanggal || '')
  const hari = hariDariISO(isoTgl)
  const tglPanjang = tanggalPanjang(bkuIn.tanggal || '')
  let sppdTambahan = null

  if (menu === 'mamin') {
    const jenis = (subId === 'kegiatan' ? 'kegiatan' : '') || bkuIn.maminJenis || parseMamin(bkuIn.uraian || '', bkuIn.kegiatanNama || '').jenis
    const bersihMentah = kupasPrefiksKonsumsi(tambahan.acara || bkuIn.uraian || '')
    const bersih = jenis === 'kegiatan' ? bersihMentah.replace(/^rapat\s+/i, '').trim() : bersihMentah
    const acara = bersih && jenis === 'kegiatan' ? denganKegiatan(bersih) : (tambahan.acara && jenis !== 'kegiatan' ? tambahan.acara : bersih)
    Object.assign(tambahan, templateUndanganMamin({ acara, hari, tanggal: tglPanjang, tempat: '', waktu: '', jenis }))
    Object.assign(tambahan, drafNotulen({ acara, jenis, tanggal: bkuIn.tanggal || '' }))
  } else if (menu === 'perjalanan_dinas') {
    const maksud = tambahan.sptUntuk || ''
    const tpl = templateUndanganPerjDinas({ maksud, hari, tanggal: tglPanjang, tempat: '' })
    tambahan.sptUntuk = tpl.sptUntuk
    tambahan.kepadaUndangan = tpl.kepadaUndangan
    tambahan.perihalUndangan = tpl.perihalUndangan
    tambahan.isiUndangan = tpl.isiUndangan
    tambahan.hariUndangan = hari
    tambahan.tanggalAcara = tglPanjang
    tambahan.penutupUndangan1 = tpl.penutupUndangan1
    tambahan.penutupUndangan2 = tpl.penutupUndangan2
    Object.assign(tambahan, drafNotulen({ acara: maksud, jenis: 'perjalanan dinas', tanggal: bkuIn.tanggal || '' }))
    sppdTambahan = {
      maksud: tpl.sppdMaksud, tujuan: tpl.sppdTujuan, alat: tpl.sppdAlat,
      lama: tpl.sppdLama, tanggal: isoTgl, tanggalBerangkat: tpl.sppdTanggalBerangkat,
      tanggalKembali: tpl.sppdTanggalKembali, tempatTujuan: tpl.sppdTempatTujuan,
      skpd: tpl.sppdSkpd, akun: tpl.sppdAkun, keterangan: tpl.sppdKeterangan,
    }
  }

  // Sprint 004 C.2 — kunci pejabat per tanggal BKU: nilai riwayat ditulis ke field TTD
  // (prioritas formData-first di DokumenFormPreview membuat periode baru TIDAK mengubah
  // dokumen ini). Hanya nilai tak-kosong. '' dihitung kosong (revisi 2026-10-06 task 39).
  const tglBku = bku?.tanggal || ''
  const kunci = {}
  const ksRw = pejabatPada(tglBku, 'ks')
  const kgRw = pejabatPada(tglBku, 'ketuaGugus')
  const nlRw = pejabatPada(tglBku, 'notulen')
  const ks = ksRw.nama ? ksRw : getPejabat('ks')
  const kg = kgRw.nama ? kgRw : getPejabat('ketuaGugus')
  const nl = nlRw.nama ? nlRw : getPejabat('notulen')
  const kosong = (v) => v == null || (typeof v === 'string' && v.trim() === '')
  const pasang = (field, v) => { if (v && kosong(tambahan[field])) { tambahan[field] = v; diisi.push(field) } }
  pasang('namaPenandatangan', ks.nama)
  pasang('nipPenandatangan', ks.nip)
  pasang('namaPihakKesatu', ks.nama)
  pasang('nipPihakKesatu', ks.nip)
  pasang('namaMengetahui', kg.nama)
  pasang('nipMengetahui', kg.nip)
  pasang('namaKetuaGugus', kg.nama)
  pasang('nipKetuaGugus', kg.nip)
  pasang('ttd_pimpinan_nama', ks.nama)
  pasang('ttd_pimpinan_nip', ks.nip)
  pasang('ttd_notulen_nama', nl.nama)
  pasang('ttd_notulen_nip', nl.nip)

  // Sprint 006: template semua tab Mamin (hasil editable di form). Dijalankan SEBELUM
  // snapshot agar field baru A–D ikut snapshot + Urungkan. drafNotulen 005 tidak diubah.
  if (menu === 'mamin') {
    const jenis006 = (subId === 'kegiatan' ? 'kegiatan' : '') || bkuIn.maminJenis || parseMamin(bkuIn.uraian || '', bkuIn.kegiatanNama || '').jenis
    const bersihMentah006 = kupasPrefiksKonsumsi(tambahan.acara || bkuIn.uraian || '')
    const bersih006 = jenis006 === 'kegiatan' ? bersihMentah006.replace(/^rapat\s+/i, '').trim() : bersihMentah006
    const acara006 = bersih006 && jenis006 === 'kegiatan' ? denganKegiatan(bersih006) : (tambahan.acara && jenis006 !== 'kegiatan' ? tambahan.acara : bersih006)
    tambahan.acara = acara006
    const tglBku006 = bkuIn.tanggal || ''
    Object.assign(tambahan, templatePesananMamin({ acara: acara006, tanggal: tglBku006, uraian: '', jenis: jenis006 }))
    // Sprint 007 B.1: rows hadir dari storage Guru→Tendik; kosong → rows[] jujur (0 karangan).
    const gtk006 = bacaGTKUntukHadir()
    const hadir006 = templateDaftarHadir({ acara: acara006, orang: gtk006, jenis: jenis006 })
    tambahan.judulDaftarHadir = hadir006.judulDaftarHadir
    if (hadir006.rows.length > 0) tambahan.rows = hadir006.rows
    tambahan.bukuTamu = templateBukuTamu({ tanggal: tglBku006, uraian: acara006, jenis: jenis006 }).bukuTamu
    let tempat006 = ''
    try { tempat006 = getSchoolData()?.namaSekolah || '' } catch { /* tanpa data sekolah = jujur kosong */ }
    const namaHadir006 = hadir006.rows.map((r) => r.nama).filter(Boolean).join(', ')
    Object.assign(tambahan, lengkapiNotulen({
      acara: acara006, tanggal: tglBku006, tempat: tempat006,
      pimpinanNama: ks.nama, notulenNama: nl.nama,
      pesertaNama: namaHadir006, pesertaJumlah: hadir006.rows.length > 0 ? String(hadir006.rows.length) : '',
      jenis: jenis006,
    }))
  }

  if (tglBku) kunci.tanggal = tglBku
  tambahan.kunciPejabat = kunci

  return { tambahan, diisi, dilewati, tertimpa, subPilih, sppdTambahan }
}

export default bangunPrefillLpj
