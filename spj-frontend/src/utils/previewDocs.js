/**
 * previewDocs — daftar dokumen formal untuk Panel Preview Document.
 * Mirror 1:1 builder data area cetak DokumenFormPreview (+ SkHonorerEditor),
 * sehingga panel = render ulang yg SAMA via TemplateEngine mode=print.
 * Area cetak (.sk-print-area) TIDAK diubah; file ini hanya dibaca panel.
 */
import { TEMPLATE_CONFIGS } from '../data/templateConfig'
import { findBkuNominal } from './bkuHelper'
import { getSignatureRoles } from './signatureRoles'
import { getSchoolData } from './sekolahData'
import storageHelper from './storageHelper'
import { loadSkPasal, cloneDefaultPasal } from '../data/skPasal'
import { bagiPesananPerSeksi } from './aturanMamin'
import { pbjFormKosong } from './aturanPbj'

const isKosong = (v) => v == null || (typeof v === 'string' && v.trim() === '') || (Array.isArray(v) && v.length === 0)
const docPbjKosong = (d = {}) => Object.values(d).every(isKosong)

const HONOR_REK = '5.1.02.02.01'
const TRANSPORT_REK = '5.1.02.04'
const UPAH_REK = '5.1.02.02.01.0016'
const TABS_SUB = { koordinasi: ['daftar', 'spt', 'sppd'], bank: ['daftar', 'spt', 'sppd'] }
const hasTab = (subId, id) => (TABS_SUB[subId] ? TABS_SUB[subId].includes(id) : true)

function autoVal(row, auto) {
  const vs = (auto.fields || []).map((f) => {
    const v = parseFloat(String(row[f] || '0').replace(/[^\d.-]/g, ''))
    return isNaN(v) ? 0 : v
  })
  if (auto.type === 'sum') return vs.reduce((a, b) => a + b, 0)
  if (auto.type === 'mul') return vs.reduce((a, b) => a * b, 1)
  if (auto.type === 'sub') return vs.length >= 2 ? vs[0] - vs[1] : 0
  return ''
}

function previewRows(templateId, data) {
  const cols = TEMPLATE_CONFIGS[templateId]?.blocks?.find((b) => b.type === 'table-dinamis')?.columns || []
  const rows = (data.rows || []).map((r) => {
    const nr = { ...r }
    if (templateId?.startsWith('honor') && !nr.jumlah) {
      const n = findBkuNominal({ nama: nr.nama, bulanName: data.bulan, kodeRekeningPrefix: HONOR_REK })
      if (n != null) nr.jumlah = String(n)
    }
    if (templateId?.startsWith('transpor') && !nr.unitCost) {
      const n = findBkuNominal({ nama: nr.nama, bulanName: data.bulan, kodeRekeningPrefix: TRANSPORT_REK })
      if (n != null) nr.unitCost = String(n)
    }
    if (templateId?.startsWith('upah') && !nr.unitCost) {
      const n = findBkuNominal({ nama: nr.nama, bulanName: data.bulan, kodeRekeningPrefix: UPAH_REK })
      if (n != null) nr.unitCost = String(n)
    }
    cols.forEach((c) => { if (c.auto?.type) nr[c.key] = autoVal(nr, c.auto) })
    return nr
  })
  return { ...data, rows }
}

const sptData = (formData, sppdData, sig, row) => ({
  ...TEMPLATE_CONFIGS.spt.defaults, ...formData,
  namaPenandatangan: formData.namaPenandatangan || sig['kepala-sekolah']?.nama || '',
  nipPenandatangan: formData.nipPenandatangan || sig['kepala-sekolah']?.nip || '',
  namaMengetahui: formData.namaMengetahui || sig['ketua-gugus']?.nama || '',
  nipMengetahui: formData.nipMengetahui || sig['ketua-gugus']?.nip || '',
  nomorSpt: formData.nomorSpt || '', nama: row.nama || '',
  sptNip: row.sptNip || row.nip || row.nuptk || '-', sptPangkat: row.sptPangkat || '-',
  sptJabatan: row.sptJabatan || row.jabatan || '', sptUntuk: formData.sptUntuk || sppdData.tujuan || '',
  sptHari: formData.sptHari || '', sptTanggal: formData.sptTanggal || sppdData.tanggal || '',
  sptTempat: formData.sptTempat || sppdData.tempat || '', tanggalSpt: formData.tanggalSpt || '',
})

const sppdDataOf = (formData, sppdData, sig, row) => ({
  ...TEMPLATE_CONFIGS.sppd.defaults, ...formData, ...sppdData,
  namaPenandatangan: formData.namaPenandatangan || sig['kepala-sekolah']?.nama || '',
  nipPenandatangan: formData.nipPenandatangan || sig['kepala-sekolah']?.nip || '',
  namaMengetahui: formData.namaMengetahui || sig['ketua-gugus']?.nama || '',
  nipMengetahui: formData.nipMengetahui || sig['ketua-gugus']?.nip || '',
  nomorSurat: sppdData.nomorSurat || '', nama: row.nama || '',
  sppdNip: row.sppdNip || row.nip || row.nuptk || '-', sppdPangkat: row.sppdPangkat || '-',
  sppdJabatan: row.sppdJabatan || row.jabatan || '', sppdTingkat: row.sppdTingkat || '',
  tempatBerangkat: sppdData.tempatBerangkat || sppdData.tempat || '',
  tempatTujuan: sppdData.tempatTujuan || sppdData.tempat || '',
  tanggalBerangkat: sppdData.tanggalBerangkat || sppdData.tanggal || '',
  tanggalKembali: sppdData.tanggalKembali || sppdData.tanggal || '',
  padaTanggal: sppdData.padaTanggal || sppdData.tanggal || '',
  lama: sppdData.lama || '1 (satu) hari', maksud: sppdData.maksud || sppdData.tujuan || '',
})

function maminDocs(formData, sig) {
  const rows = (formData.rows || []).map((r, i) => ({ ...r, no: i + 1 }))
  // Sprint 009 Fase A: 1 doc pesanan → 2 docs (mirror 1:1 area cetak via helper sama)
  const pesanan = bagiPesananPerSeksi(formData)
  const perihalSeksi = (seksi) => (formData.perihalPesanan ? `${formData.perihalPesanan} — ${seksi}` : seksi)
  const dataPesanan = (seksi, rowsSeksi) => ({ ...TEMPLATE_CONFIGS.pesanan_mamin.defaults, ...formData,
    tanggalSurat: formData.tanggalSurat || 'Cikalongwetan, ...', perihalPesanan: perihalSeksi(seksi),
    jenisPesanan: seksi, kegiatan: formData.isiPesanan || formData.acara || '', rows: rowsSeksi })
  const bt = formData.bukuTamu || {}
  const btRows = (bt.rows || []).map((r, i) => ({ ...r, no: i + 1 }))
  const notulenData = {
    ...TEMPLATE_CONFIGS.notulen.defaults, ...formData, nomor: formData.nomor,
    tanggal: formData.tanggal, waktu: formData.waktu, tempat: formData.tempat, acara: formData.acara,
    pimpinan: formData.pimpinan, pembuka: formData.pembuka, notulen: formData.notulen,
    peserta: formData.peserta || rows.map((r) => r.nama).filter(Boolean).join(', '),
    // TTD notulen: ketikan user → Data Sekolah (live) → '' (mirror area cetak).
    ttd_pimpinan_nama: formData.ttd_pimpinan_nama || sig['pimpinan']?.nama || '',
    ttd_pimpinan_nip: formData.ttd_pimpinan_nip || sig['pimpinan']?.nip || '',
    ttd_notulen_nama: formData.ttd_notulen_nama || sig['notulen']?.nama || '',
    ttd_notulen_nip: formData.ttd_notulen_nip || sig['notulen']?.nip || '',
    poinPembahasan: Array.isArray(formData.poinPembahasan)
      ? formData.poinPembahasan
      : (formData.resume ? [{ id: 'resume-1', text: formData.resume }] : []),
    rows,
  }
  const docs = [
    { key: 'undangan', label: 'Undangan', templateConfig: TEMPLATE_CONFIGS.undangan_mamin, data: {
      ...TEMPLATE_CONFIGS.undangan_mamin.defaults, ...formData,
      tanggalSurat: formData.tanggalSurat || 'Cikalongwetan, ...',
      hariUndangan: formData.hariUndangan || formData.hari || '',
      tanggalAcara: formData.tanggalAcara || formData.tanggal || '',
      tempatAcara: formData.tempatAcara || formData.tempat || '',
      waktuAcara: formData.waktuAcara || formData.waktu || '',
      kegiatan: formData.isiUndangan || formData.acara || '' } },
    ...(pesanan.nasi.length > 0 ? [{ key: 'pesanan-nasi', label: 'Surat Pesanan — Nasi Box', templateConfig: TEMPLATE_CONFIGS.pesanan_mamin, data: dataPesanan('Nasi Box', pesanan.nasi) }] : []),
    ...(pesanan.snack.length > 0 ? [{ key: 'pesanan-snack', label: 'Surat Pesanan — Snack Box', templateConfig: TEMPLATE_CONFIGS.pesanan_mamin, data: dataPesanan('Snack Box', pesanan.snack) }] : []),
    { key: 'notulen', label: 'Notulen / Resume', templateConfig: TEMPLATE_CONFIGS.notulen, data: notulenData },
    { key: 'hadir', label: 'Daftar Hadir', templateConfig: TEMPLATE_CONFIGS.daftar_hadir, data: {
      ...TEMPLATE_CONFIGS.daftar_hadir.defaults,
      judulAcara: formData.judulDaftarHadir || formData.acara || '', rows } },
  ]
  if (bt.noUrut || bt.tanggal || bt.bertemu || btRows.length > 0) {
    docs.push({ key: 'bukutamu', label: 'Buku Tamu', templateConfig: TEMPLATE_CONFIGS.buku_tamu, data: {
      ...TEMPLATE_CONFIGS.buku_tamu.defaults, ...formData, noUrut: bt.noUrut || '',
      tanggal: bt.tanggal || formData.tanggal, bertemu: bt.bertemu || '', tiba: bt.tiba || '',
      kembali: bt.kembali || '', diterima: bt.diterima || 'Kepala Sekolah',
      tujuan: bt.tujuan || formData.acara || '', uraianKegiatan: bt.uraian || '', rows: btRows } })
  }
  return docs
}

function transportDocs(templateId, subId, formData, sppdData, sig) {
  const config = TEMPLATE_CONFIGS[templateId]
  const preview = previewRows(config.id, { ...config.defaults, ...formData, nomor: formData.nomor })
  const tRows = formData.rows || []
  const resumeData = { ...TEMPLATE_CONFIGS.notulen.defaults, ...formData,
    ttd_pimpinan_nama: formData.ttd_pimpinan_nama || sig.pimpinan?.nama || sig['pimpinan']?.nama || '',
    ttd_pimpinan_nip: formData.ttd_pimpinan_nip || sig['pimpinan']?.nip || '',
    ttd_notulen_nama: formData.ttd_notulen_nama || sig['notulen']?.nama || '',
    ttd_notulen_nip: formData.ttd_notulen_nip || sig['notulen']?.nip || '',
    hari: formData.hariSpt || '', tanggal: sppdData.tanggal || '', tempat: sppdData.tempat || '',
    acara: formData.acara || sppdData.tujuan || '',
    poinPembahasan: formData.resume ? [{ id: 'resume-1', text: formData.resume }] : [] }
  const undanganData = { ...TEMPLATE_CONFIGS.undangan_gugus.defaults, ...formData,
    gugusNama: formData.gugusNama || getSchoolData().gugusNama || '',
    gugusAlamat: formData.gugusAlamat || getSchoolData().gugusAlamat || '',
    kabupaten: formData.kabupaten || getSchoolData().kabupaten || '',
    provinsi: formData.provinsi || getSchoolData().provinsi || '',
    logoGugus: storageHelper.get('logo_gugus', null),
    namaKetuaGugus: formData.namaKetuaGugus || sig['ketua-gugus']?.nama || '',
    nipKetuaGugus: formData.nipKetuaGugus || sig['ketua-gugus']?.nip || '',
    tanggalSurat: formData.tanggalSurat || '', hariUndangan: formData.hariUndangan || '',
    tanggalAcara: formData.tanggalAcara || sppdData.tanggal || '',
    tempatAcara: formData.tempatAcara || sppdData.tempat || '',
    isiUndangan: formData.isiUndangan || '', sifatUndangan: formData.sifatUndangan || '-' }
  const docs = [{ key: 'penerima', label: 'Daftar Penerima', templateConfig: config, data: preview }]
  if (hasTab(subId, 'undangan')) {
    docs.push({ key: 'undangan', label: 'Undangan', templateConfig: TEMPLATE_CONFIGS.undangan_gugus, data: undanganData })
  }
  tRows.forEach((row) => docs.push({ key: `spt-${row.id}`, label: `SPT — ${row.nama || 'Tanpa nama'}`,
    templateConfig: TEMPLATE_CONFIGS.spt, data: sptData(formData, sppdData, sig, row) }))
  tRows.forEach((row) => docs.push({ key: `sppd-${row.id}`, label: `SPPD — ${row.nama || 'Tanpa nama'}`,
    templateConfig: TEMPLATE_CONFIGS.sppd, data: sppdDataOf(formData, sppdData, sig, row) }))
  if (hasTab(subId, 'resume')) {
    docs.push({ key: 'resume', label: 'Resume', templateConfig: TEMPLATE_CONFIGS.notulen, data: resumeData })
  }
  return docs
}

/**
 * pbjDocs — Sprint 010: 6 docs PBJ mirror 1:1 area cetak Kelengkapan PBJ.
 * Dokumen yang datanya kosong total di-skip (panel tampil pesan jujur).
 * Label persis F-PBJ6 REQUIREMENTS.
 */
export function pbjDocs(pbjForm = {}) {
  const f = { ...pbjFormKosong(), ...pbjForm }
  for (const k of Object.keys(f)) f[k] = { ...pbjFormKosong()[k], ...(pbjForm?.[k] || {}) }
  // Revisi PBJ (7): KS dari data pejabat ala LPJ — ketikan user → Data Sekolah → ''.
  // Prioritas sama seperti LPJ (DokumenFormPreview / maminDocs): formData dulu, baru pejabat.
  const sig = getSignatureRoles()
  const ksNama = sig['kepala-sekolah']?.nama || ''
  const noRows = (rows = []) => (rows || []).map((r, i) => ({ id: `pbj-${i}`, ...r, no: i + 1 }))
  const docs = []
  if (!docPbjKosong(f.perencanaan)) docs.push({ key: 'pbj-perencanaan', label: 'Perencanaan',
    templateConfig: TEMPLATE_CONFIGS.pbj_perencanaan,
    data: { ...TEMPLATE_CONFIGS.pbj_perencanaan.defaults, ...f.perencanaan,
      namaPelaksana: f.perencanaan.namaPelaksana || ksNama } })
  if (!docPbjKosong(f.pesanan)) docs.push({ key: 'pbj-pesanan', label: 'Surat Pesanan',
    templateConfig: TEMPLATE_CONFIGS.pbj_pesanan,
    data: { ...TEMPLATE_CONFIGS.pbj_pesanan.defaults, ...f.pesanan, rows: noRows(f.pesanan.rows) } })
  if (!docPbjKosong(f.bahp)) docs.push({ key: 'pbj-bahp', label: 'BAHP — Hasil Pemeriksaan',
    templateConfig: TEMPLATE_CONFIGS.pbj_bahp,
    data: { ...TEMPLATE_CONFIGS.pbj_bahp.defaults, ...f.bahp,
      namaPemeriksa: f.bahp.namaPemeriksa || ksNama } })
  if (!docPbjKosong(f.bast)) docs.push({ key: 'pbj-bast', label: 'BAST',
    templateConfig: TEMPLATE_CONFIGS.pbj_bast,
    data: { ...TEMPLATE_CONFIGS.pbj_bast.defaults, ...f.bast,
      pihakKedua: f.bast.pihakKedua || ksNama,
      kesesuaian: f.bast.kesesuaian ? `[X] ${f.bast.kesesuaian}` : '',
      kondisi: f.bast.kondisi ? `[X] ${f.bast.kondisi}` : '' } })
  if (!docPbjKosong(f.nego)) {
    docs.push({ key: 'pbj-nego-banding', label: 'Negosiasi — Pembandingan',
      templateConfig: TEMPLATE_CONFIGS.pbj_nego_banding,
      data: { ...TEMPLATE_CONFIGS.pbj_nego_banding.defaults, nomorNego: f.nego.nomorNego || '',
        tanggalNego: f.nego.tanggalNego || '', produkI: f.nego.produkI || '', produkII: f.nego.produkII || '',
        rows: noRows((f.nego.rows || []).map((r) => ({ uraian: r.uraian, produkI: r.penawaran, produkII: '—' }))) } })
    docs.push({ key: 'pbj-nego-hasil', label: 'Negosiasi — Hasil',
      templateConfig: TEMPLATE_CONFIGS.pbj_nego_hasil,
      data: { ...TEMPLATE_CONFIGS.pbj_nego_hasil.defaults, nomorNego: f.nego.nomorNego || '',
        tanggalNego: f.nego.tanggalNego || '', rows: noRows(f.nego.rows) } })
  }
  if (!docPbjKosong(f.data)) docs.push({ key: 'pbj-data', label: 'Data — Rekap Pengadaan',
    templateConfig: TEMPLATE_CONFIGS.pbj_data,
    data: { ...TEMPLATE_CONFIGS.pbj_data.defaults, rows: [{ id: 'pbj-data-1', ...f.data }] } })
  return docs
}

/**
 * buildPreviewDocs — satu sumber daftar dokumen formal utk panel.
 * Kembalikan [] bila templateId tak dikenal (panel tampil pesan jujur).
 */
export function buildPreviewDocs({ cardId, templateId, subId, formData = {}, sppdData = {} }) {
  const sig = getSignatureRoles()
  if (cardId === 'mamin') return maminDocs(formData, sig)
  if (cardId === 'perjalanan_dinas') {
    if (!TEMPLATE_CONFIGS[templateId]) return []
    return transportDocs(templateId, subId, formData, sppdData, sig)
  }
  if (cardId === 'honor') {
    const config = TEMPLATE_CONFIGS[templateId]
    if (!config) return []
    const preview = previewRows(config.id, { ...config.defaults, ...formData, nomor: formData.nomor })
    const docs = [{ key: 'penerima', label: 'Daftar Penerima Gaji', templateConfig: config, data: preview }]
    const pasal = formData.pasal || loadSkPasal() || cloneDefaultPasal()
    ;(formData.rows || []).forEach((row) => docs.push({ key: `sk-${row.id}`, label: `SK — ${row.nama || 'Tanpa nama'}`,
      kind: 'sk', templateConfig: TEMPLATE_CONFIGS.sk_honorer, data: {
        ...TEMPLATE_CONFIGS.sk_honorer.defaults, ...formData, pasal, nomorSurat: formData.nomor || '',
        // PIHAK KESATU: ketikan user → Data Sekolah (live) → '' (mirror area cetak).
        namaPihakKesatu: formData.namaPihakKesatu || sig['kepala-sekolah']?.nama || '',
        nipPihakKesatu: formData.nipPihakKesatu || sig['kepala-sekolah']?.nip || '',
        namaPihakKedua: row.nama || '', ttlPihakKedua: row.ttl || row.tempatLahir || '',
        pendidikanPihakKedua: row.pendidikan || '', alamatPihakKedua: row.alamat || '',
        kelasGuru: row.kelasGuru || '' } }))
    return docs
  }
  const config = TEMPLATE_CONFIGS[templateId]
  if (!config) return []
  return [{ key: 'dokumen', label: config.label || 'Dokumen', templateConfig: config,
    data: previewRows(config.id, { ...config.defaults, ...formData, nomor: formData.nomor }) }]
}
