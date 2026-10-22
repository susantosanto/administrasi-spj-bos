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
import { ringkasanKasPerBulan, bulanNameToNum, teksTanggalPanjang, formatTanggalContoh, lembarPecahan } from './dokKas'
import { barisPajakDariBku, tahunPajak, totalKolomPajak } from './dokPajak'
import { TEMPAT_TTD } from './tempatTtd'

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
export function pbjDocs(pbjForm = {}, mode = 'non') {
  const gateDocs = mode === 'siplah' ? ['perencanaan'] : null
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
  // Sprint 011 B-02: gate mode — SIPLAH hanya Perencanaan (1 dokumen).
  if (gateDocs) return docs.filter((d) => d.key === 'pbj-perencanaan')
  return docs
}

export function kasFormKosong() {
  return { RK: {}, BAP: {}, KS: {}, PP: {}, COVER: {}, SEKAT: {} }
}

const fmtRp = (n) => `Rp ${(Number(n) || 0).toLocaleString('id-ID')}`
/** Kolom nominal sumber: "Rp 82.560.000,-" */
const fmtRpMinus = (n) => `Rp ${(Number(n) || 0).toLocaleString('id-ID')},-`

function kasKonteks(bku = {}) {
  const txs = bku?.transactions || []
  const sekolah = getSchoolData()
  const sig = getSignatureRoles()
  const tahun = bku?.header?.tahunAnggaran || new Date().getFullYear()
  return { txs, sekolah, sig, tahun, footer: bku?.footer || {} }
}

function judulDanaKas(tahun) {
  return `DANA BOS REGULER TAHUN ANGGARAN ${tahun}`
}

function sekolahKetKas(sekolah) {
  const nama = (sekolah.namaSekolah || '').toUpperCase()
  const kec = (sekolah.kecamatan || '').toUpperCase()
  return [nama, kec ? `KECAMATAN ${kec}` : ''].filter(Boolean).join(' ')
}

/**
 * kasDocs — builder 6 dokumen kelengkapan keuangan (mirror file sumber).
 * Sumber angka: ketikan user (form kas) > BKU (spj_bku_data) > Data Sekolah.
 *
 * Kunci data mengikuti blok CETAK MURNI yang meniru sumber persis:
 *   RegisterKas · BapKas · LembarPengaduan · LembarKritikSaran · CoverHeader
 * Format uang mengikuti number format XLSX sumber:
 *   kolom nominal  -> "Rp 82.560.000,-"   (kolom D Register Kas)
 *   kolom subtotal -> "Rp 0"              (kolom H Register Kas / BAP)
 */
export function kasDocs(kasForm = {}, bku = {}, pajakManual = {}) {
  const { txs, sekolah, sig, tahun } = kasKonteks(bku)
  const f = { ...kasFormKosong(), ...kasForm }
  const docs = []
  const ks = sig['kepala-sekolah'] || {}
  const bend = sig['bendahara'] || {}
  const ksNama = ks.nama || ''
  const bendNama = bend.nama || ''
  const nipKs = ks.nip || ''
  const nipBend = bend.nip || ''
  const bulanTahun = (bulan) => (bulan ? `PERIODE : BULAN ${String(bulan).toUpperCase()} ${tahun}` : '')

  // ─── Register Kas (sheet "Register Kas") ───
  const u = f.RK || {}
  const mNum = bulanNameToNum(u.bulan) || null
  const ring = mNum ? ringkasanKasPerBulan(txs, mNum) : { adaData: false, D: 0, K: 0, A: 0 }
  const D = String(u.totalPenerimaan ?? '').trim() !== '' ? Number(String(u.totalPenerimaan).replace(/[^\d.-]/g, '')) || 0 : ring.D
  const K = String(u.totalPengeluaran ?? '').trim() !== '' ? Number(String(u.totalPengeluaran).replace(/[^\d.-]/g, '')) || 0 : ring.K
  const A = D - K
  // Lembar/keping: ketikan user MENANG per baris, kosong → OTOMATIS dari
  // SALDO AKHIR BKU bulan terpilih (model user: "Saldo Akhir = uang tunai").
  // Saldo Akhir = saldo penutupan bulan itu = seluruh uang kertas+logam
  // (sekolah tidak punya rekening bank terpisah; Sub 3 bank = 0).
  const saldoTunaiKetik = String(u.saldoTunai ?? '').trim()
  const saldoTunai = saldoTunaiKetik !== ''
    ? Number(saldoTunaiKetik.replace(/[^\d.-]/g, '')) || 0
    : (ring.adaData ? ring.saldoAkhir : 0)
  const pecahan = lembarPecahan(u.pecahan, saldoTunai)
  const subJenis = (jenis) => pecahan
    .filter((r) => r.jenis === jenis)
    .reduce((s, r) => s + (Number(r.nominal) || 0) * (Number(r.lembar) || 0), 0)
  const subKertas = subJenis('Kertas')
  const subLogam = subJenis('Logam')
  // Sub Jumlah (3) "Saldo Bank, Surat Berharga, dll." — model ini tanpa bank
  // (pilihan user 2026-10-19), jadi default 0; ketikan user tetap menimpa.
  const sub3 = String(u.saldoBank ?? '').trim() !== '' ? Number(String(u.saldoBank).replace(/[^\d.-]/g, '')) || 0 : 0
  const B = String(u.saldoKas ?? '').trim() !== '' ? Number(String(u.saldoKas).replace(/[^\d.-]/g, '')) || 0 : subKertas + subLogam + sub3
  const selisih = A - B
  docs.push({ key: 'register-kas', label: 'Register Penutupan Kas', templateConfig: TEMPLATE_CONFIGS.register_kas, data: {
    ...TEMPLATE_CONFIGS.register_kas.defaults, ...u,
    jenisDana: 'BOS REGULER',
    periode: bulanTahun(u.bulan),
    tglTutup: u.tglTutup || formatTanggalContoh(ring.tglTutupISO) || '',
    namaPenutup: u.namaPenutup || bendNama,
    tglLalu: u.tglLalu || formatTanggalContoh(ring.tglLaluISO) || '',
    totalPenerimaan: fmtRpMinus(D),
    totalPengeluaran: fmtRpMinus(K),
    saldoBuku: fmtRpMinus(A),
    saldoKas: fmtRpMinus(B),
    rows: pecahan,
    subKertasValue: fmtRp(subKertas),
    subLogamValue: fmtRp(subLogam),
    saldoBank: fmtRp(sub3),
    jumlahTotal: fmtRp(subKertas + subLogam + sub3),
    perbedaan: fmtRp(A - B),
    penjelasanPerbedaan: u.penjelasanPerbedaan || (selisih === 0
      ? ': ...............................................................................................................'
      : `: disebabkan tidak ada pecahan uang Rp ${selisih.toLocaleString('id-ID')} rupiah pada saat transaksi.`),
    tanggalTtd: u.tanggalTtd || formatTanggalContoh(ring.tglTutupISO) || '',
    namaDiperiksa: bendNama,
    nipDiperiksa: nipBend,
    namaMemeriksa: ksNama,
    nipMemeriksa: nipKs,
  } })

  // ─── BAP Kas (sheet "BA_Pemeriksaan Kas") ───
  const ub = f.BAP || {}
  const mNumB = bulanNameToNum(ub.bulan) || bulanNameToNum(u.bulan) || null
  const ringB = mNumB ? ringkasanKasPerBulan(txs, mNumB) : { adaData: false, saldoAkhir: 0 }
  // Nilai default dari BKU (+ pecahan fisik Register Kas) — ketikan user menimpa:
  //   a) Uang kertas bank, uang logam = Sub Jumlah (1)+(2) Register Kas
  //   b) Saldo Bank = saldo akhir BKU dikurangi pecahan fisik (mirror E24/H31 contoh)
  //   c) Surat berharga, dll. = 0 (tidak ada sumber di BKU)
  const parse0 = (val, def) => (String(val ?? '').trim() !== '' ? Number(String(val).replace(/[^\d.-]/g, '')) || 0 : def)
  const defUangFisik = subKertas + subLogam
  const defSaldoBank = Math.max(0, (ringB.adaData ? ringB.saldoAkhir : 0) - defUangFisik)
  const uangFisik = parse0(ub.uangFisik, defUangFisik)
  const saldoBankBap = parse0(ub.saldoBankBap, defSaldoBank)
  const suratBerharga = parse0(ub.suratBerharga, 0)
  const jmlFisik = uangFisik + saldoBankBap + suratBerharga
  const saldoKasUmum = ringB.saldoAkhir || 0
  const rowsB = Array.isArray(ub.rows) && ub.rows.length > 0 ? ub.rows : [
    { id: 'bap-a', uraian: 'a) Uang kertas bank, uang logam', nominal: uangFisik },
    { id: 'bap-b', uraian: 'b) Saldo Bank', nominal: saldoBankBap },
    { id: 'bap-c', uraian: 'c) Surat berharga, dll.', nominal: suratBerharga },
    { id: 'bap-jml', uraian: 'Jumlah', nominal: jmlFisik },
    { id: 'bap-saldo', uraian: 'Saldo uang menurut Kas Umum', nominal: saldoKasUmum },
    { id: 'bap-selisih', uraian: 'Perbedaan antara saldo Kas dan saldo Buku', nominal: saldoKasUmum - jmlFisik },
  ]
  docs.push({ key: 'bap-kas', label: 'Berita Acara Pemeriksaan Kas', templateConfig: TEMPLATE_CONFIGS.bap_kas, data: {
    ...TEMPLATE_CONFIGS.bap_kas.defaults, ...ub,
    jenisDana: 'BOS REGULER',
    periode: bulanTahun(ub.bulan || u.bulan),
    // Narasi B6+B7: baris pertama berakhir "Surat Keputusan Nomor :",
    // nomor SK dicetak di baris TERPISAH (mirror B7 contoh).
    uraianKegiatan: ub.uraianKegiatan || (ringB.tglTutupISO
      ? `Pada hari ini ${teksTanggalPanjang(ringB.tglTutupISO)}. Yang bertanda tangan di bawah ini, kami Kepala Sekolah yang ditunjuk berdasarkan Surat Keputusan Nomor :`
      : ''),
    skKsLine: ub.skKsLine ?? (ub.skKs || ''),
    // B17: kalimat baku + kabupaten dari Data Sekolah (ketikan user menimpa).
    skBendahara: ub.skBendahara || `yang berdasarkan Surat Keputusan Bupati ${sekolah.kabupaten || ''} Nomor : ditunjuk sebagai Bendahara Bantuan Operasional Sekolah Tingkat Sekolah Dasar Tahun Anggaran ${tahun}.`,
    namaPemeriksa: ub.namaPemeriksa || ksNama,
    jabatanPemeriksa: ub.jabatanPemeriksa || 'Kepala Sekolah',
    namaDiperiksa: ub.namaDiperiksa || bendNama,
    jabatanDiperiksa: ub.jabatanDiperiksa || 'Bendahara',
    rows: rowsB,
    tanggalTtd: ub.tanggalTtd || formatTanggalContoh(ringB.tglTutupISO) || '',
    namaMemeriksa: ksNama,
    nipMemeriksa: nipKs,
    nipDiperiksa: nipBend,
  } })

  // ─── Pengaduan + Kritik (sheet "Lbr. Pengaduan Masyarakat" / "Lbr. Kritik-Saran") ───
  // Tempat TTD = default Cikalongwetan (temuan user 2026-10-22), bukan kabupaten.
  const tglTutupKas = formatTanggalContoh(ring.tglTutupISO) || ''
  const up = f.PP || {}
  const bp = up.bulan || u.bulan || ''
  docs.push({ key: 'pengaduan', label: 'Lembar Pengaduan Masyarakat', templateConfig: TEMPLATE_CONFIGS.pengaduan_masyarakat, data: {
    ...TEMPLATE_CONFIGS.pengaduan_masyarakat.defaults, ...up,
    judulDana: judulDanaKas(tahun), namaSekolahKet: sekolahKetKas(sekolah),
    periode: bp ? `PERIODE : BULAN ${String(bp).toUpperCase()} TAHUN ${tahun}` : '',
    tempatTtd: up.tempatTtd || (tglTutupKas ? `${TEMPAT_TTD}, ${tglTutupKas}` : TEMPAT_TTD),
    namaMelaporkan: up.namaMelaporkan || ksNama,
    nipMelaporkan: up.nipMelaporkan || nipKs,
  } })
  const uk = f.KS || {}
  const bk = uk.bulan || u.bulan || ''
  docs.push({ key: 'kritik-saran', label: 'Lembar Kritik-Saran', templateConfig: TEMPLATE_CONFIGS.kritik_saran, data: {
    ...TEMPLATE_CONFIGS.kritik_saran.defaults, ...uk,
    judulDana: judulDanaKas(tahun), namaSekolahKet: sekolahKetKas(sekolah),
    periode: bk ? `PERIODE : BULAN ${String(bk).toUpperCase()} TAHUN ${tahun}` : '',
    tempatTtd: uk.tempatTtd || (tglTutupKas ? `${TEMPAT_TTD}, ${tglTutupKas}` : TEMPAT_TTD),
    namaMelaporkan: uk.namaMelaporkan || ksNama,
    nipMelaporkan: uk.nipMelaporkan || nipKs,
  } })

  // ─── Cover + Sekat (Contoh template COVER.pdf + ADR 2026-10-18) ───
  const uc = f.COVER || {}
  const us = f.SEKAT || {}
  const bulanSekat = us.bulan || u.bulan || ''
  docs.push({ key: 'cover-lpj', label: 'Cover Bendel LPJ', templateConfig: TEMPLATE_CONFIGS.cover_lpj, data: {
    ...TEMPLATE_CONFIGS.cover_lpj.defaults, ...uc,
    judulTahun: uc.judulTahun || `TAHUN ANGGARAN ${tahun}`,
    namaSekolah: (sekolah.namaSekolah || '').toUpperCase(),
    kecamatan: (sekolah.kecamatan || '').toUpperCase(),
    barisPemda: sekolah.kabupaten ? `PEMERINTAH ${sekolah.kabupaten}`.toUpperCase() : '',
    barisDinas: 'DINAS PENDIDIKAN',
    tahunCover: uc.tahunCover || String(tahun),
  } })
  docs.push({ key: 'sekat-lpj', label: 'Sekat Dokumen', templateConfig: TEMPLATE_CONFIGS.sekat_lpj, data: {
    ...TEMPLATE_CONFIGS.sekat_lpj.defaults, ...us,
    bulanSekat: us.bulanSekat || (bulanSekat ? `BULAN ${String(bulanSekat).toUpperCase()}` : ''),
    keteranganSekat: us.keteranganSekat || (u.bulan ? `Register Penutupan Kas Bulan ${String(u.bulan).toUpperCase()} ${tahun}` : ''),
  } })

  // ─── Rincian Pajak (sprint-014 — sheet SD_SMP contoh, A4 landscape) ───
  // Baris otomatis dari BKU (SETOR_PAJAK/PAJAK_BUNGA); kolom manual per baris
  // dari spj_pajak_manual (argumen ke-3). Nilai = tx.pengeluaran APA ADA.
  // Doc-level (tahun/jenjang) = spj_kas_form → kasForm.RPAJAK.
  const pajakForm = f.RPAJAK || {}
  const pajakRows = barisPajakDariBku(txs, pajakManual, {
    namaSekolah: sekolah.namaSekolah || '',
    jenjang: pajakForm.jenjang || '',
  })
  docs.push({ key: 'rincian-pajak', label: 'Rincian Pajak', templateConfig: TEMPLATE_CONFIGS.rincian_pajak, data: {
    ...TEMPLATE_CONFIGS.rincian_pajak.defaults,
    tahun: tahunPajak(pajakRows, pajakForm.tahun),
    namaSekolah: sekolah.namaSekolah || '',
    jenjang: pajakForm.jenjang || '',
    rows: pajakRows,
    totals: totalKolomPajak(pajakRows),
  } })
  return docs
}

/**
 * buildPreviewDocs — satu sumber daftar dokumen formal utk panel.
 * Kembalikan [] bila templateId tak dikenal (panel tampil pesan jujur).
 */
export function buildPreviewDocs({ cardId, templateId, subId, formData = {}, sppdData = {}, formPbj = null, pbjMode = 'non' }) {
  const sig = getSignatureRoles()
  const docsLpj = buildDocsLpj({ cardId, templateId, subId, formData, sppdData, sig })
  if (!formPbj) return docsLpj
  // Sprint 018 (AD-7): dokumen PBJ menyusul dokumen LPJ dalam SATU daftar.
  // Label PBJ diberi sufiks " PBJ" (D-2) → nama surat tidak pernah dobel;
  // bila tetap bentrok, dokumen LPJ yang menang (K-12).
  const docsPbj = pbjDocs(formPbj, pbjMode).map((d) => ({ ...d, label: `${d.label} PBJ` }))
  const dipakai = new Set(docsLpj.map((d) => d.label))
  return [...docsLpj, ...docsPbj.filter((d) => !dipakai.has(d.label))]
}

/** Dokumen LPJ saja (tanpa PBJ) — dipakai halaman LPJ & sidebar. */
function buildDocsLpj({ cardId, templateId, subId, formData = {}, sppdData = {}, sig }) {
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
