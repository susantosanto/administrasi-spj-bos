/**
 * guideConfig — langkah Panduan per menu (Sprint 003 US-26…US-30).
 * Config-driven: tambah panduan menu baru = tambah entri di sini,
 * 0 perubahan di MenuGuide.jsx (dibuktikan T-09).
 * Predikat menerima ctx nyata { rowsCount, hasNomor, hasAcara, hasDetail, viewedSummary }.
 * Bahasa user-facing memakai "LPJ" (aturan DOMAIN.MD).
 */

const has = (v) => v !== null && v !== undefined && v !== '' && v !== 0

export const GUIDE_MENUS = {
  honor: {
    title: 'Panduan Honorarium',
    steps: [
      { id: 'sub', label: 'Pilih jenis honor (Guru / Tendik / Perpus / Penjaga)', done: (c) => has(c.subId), active: (c) => !has(c.subId) },
      { id: 'penerima', label: 'Pilih penerima dari daftar honorer', done: (c) => c.rowsCount > 0, active: (c) => has(c.subId) && c.rowsCount === 0 },
      { id: 'nomor', label: 'Isi nomor surat SK', done: (c) => has(c.hasNomor), active: (c) => c.rowsCount > 0 && !has(c.hasNomor) },
      { id: 'ringkasan', label: 'Periksa lewat Lihat Ringkasan', done: (c) => c.viewedSummary, active: (c) => has(c.hasNomor) && !c.viewedSummary },
      { id: 'cetak', label: 'Cetak SK Honorer', done: (c) => false, active: (c) => c.viewedSummary },
    ],
  },
  perjalanan_dinas: {
    title: 'Panduan Perjalanan Dinas',
    steps: [
      { id: 'penerima', label: 'Pilih penerima (semua status: PNS / PPPK / Honorer)', done: (c) => c.rowsCount > 0, active: (c) => c.rowsCount === 0 },
      { id: 'nomor', label: 'Isi nomor SPT & SPPD', done: (c) => has(c.hasNomor), active: (c) => c.rowsCount > 0 && !has(c.hasNomor) },
      { id: 'detail', label: 'Lengkapi detail SPD (maksud, tujuan, tanggal)', done: (c) => has(c.hasDetail), active: (c) => has(c.hasNomor) && !has(c.hasDetail) },
      { id: 'ringkasan', label: 'Periksa lewat Lihat Ringkasan', done: (c) => c.viewedSummary, active: (c) => has(c.hasDetail) && !c.viewedSummary },
      { id: 'cetak', label: 'Cetak Semua (5 dokumen LPJ)', done: (c) => false, active: (c) => c.viewedSummary },
    ],
  },
  mamin: {
    title: 'Panduan Makan & Minum',
    steps: [
      { id: 'acara', label: 'Isi detail acara (tanggal, tempat, kegiatan)', done: (c) => has(c.hasAcara), active: (c) => !has(c.hasAcara) },
      { id: 'hadir', label: 'Pilih daftar hadir (semua status pegawai)', done: (c) => c.rowsCount > 0, active: (c) => has(c.hasAcara) && c.rowsCount === 0 },
      { id: 'nomor', label: 'Isi nomor surat (Undangan / Pesanan)', done: (c) => has(c.hasNomor), active: (c) => c.rowsCount > 0 && !has(c.hasNomor) },
      { id: 'ringkasan', label: 'Periksa lewat Lihat Ringkasan', done: (c) => c.viewedSummary, active: (c) => has(c.hasNomor) && !c.viewedSummary },
      { id: 'cetak', label: 'Cetak set lengkap (Undangan, Pesanan, Notulen, Hadir, Tamu)', done: (c) => false, active: (c) => c.viewedSummary },
    ],
  },
  pemeliharaan: {
    title: 'Panduan Pemeliharaan',
    steps: [
      { id: 'penerima', label: 'Pilih penerima upah', done: (c) => c.rowsCount > 0, active: (c) => c.rowsCount === 0 },
      { id: 'nomor', label: 'Isi bulan & nomor surat', done: (c) => has(c.hasNomor), active: (c) => c.rowsCount > 0 && !has(c.hasNomor) },
      { id: 'ringkasan', label: 'Periksa lewat Lihat Ringkasan', done: (c) => c.viewedSummary, active: (c) => has(c.hasNomor) && !c.viewedSummary },
      { id: 'cetak', label: 'Cetak dokumen LPJ', done: (c) => false, active: (c) => c.viewedSummary },
    ],
  },
}

export default GUIDE_MENUS
