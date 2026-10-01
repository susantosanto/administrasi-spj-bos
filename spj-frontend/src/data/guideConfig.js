/**
 * guideConfig — langkah Panduan per menu (Sprint 003 US-26…US-30).
 *
 * REVISI 2026-10-01 (keputusan user — BLUEPRINT §ADDENDUM):
 * - Langkah = KONTEKS TAB NYATA tiap menu (nama tab persis seperti UI).
 * - when(ctx): langkah tab yang tidak ada pada sub aktif disembunyikan
 *   (mis. Resume & Undangan hanya sub selain Koordinasi/Bank).
 * - Tanpa properti `active` — langkah AKTIF = langkah terlihat PERTAMA yang
 *   belum selesai (dihitung MenuGuide).
 * - RONDE-2: setiap langkah punya `jump {mode,tab?}` — bisa DIKLIK, berpindah
 *   ke tab/mode langkah tsb + scroll (popover tetap terbuka).
 *
 * Config-driven: tambah panduan menu baru = tambah entri di sini saja,
 * 0 perubahan di MenuGuide.jsx (dibuktikan T-09).
 *
 * ctx: { subId, activeTab, visited:Set, rowsCount, nomor, nomorSpt, nomorSppd,
 *        sppdTanggal, resume, nomorUndangan, isiUndangan, acara, tanggal, btFilled }
 * Bahasa user-facing memakai "LPJ" (aturan DOMAIN.MD).
 */

const has = (v) => v !== null && v !== undefined && v !== '' && v !== 0
const rows = (c) => (c.rowsCount || 0) > 0
const seen = (c, tab) => c.visited instanceof Set && c.visited.has(tab)

export const GUIDE_MENUS = {
  honor: {
    title: 'Panduan Honorarium',
    steps: [
      { id: 'penerima', label: 'Tab Daftar Penerima — pilih penerima honorer', jump: { mode: 'form' }, done: (c) => rows(c) },
      { id: 'nomor', label: 'Isi nomor SK & periode (bulan/tahun)', jump: { mode: 'form' }, done: (c) => has(c.nomor) },
      { id: 'ringkasan', label: 'Klik Lihat Ringkasan — periksa daftar penerima', jump: { mode: 'preview', tab: 'daftar' }, done: (c) => seen(c, 'preview') },
      { id: 'sk', label: 'Tab SK Honorer — periksa data sebelum cetak', jump: { mode: 'preview', tab: 'sk' }, done: (c) => seen(c, 'p:sk') },
      { id: 'cetak', label: 'Cetak SK Honorer', jump: { mode: 'preview', tab: 'sk' }, done: () => false },
    ],
  },
  perjalanan_dinas: {
    title: 'Panduan Perjalanan Dinas',
    steps: [
      { id: 'daftar', label: 'Tab Daftar Penerima — pilih penerima & isi nomor transport', jump: { mode: 'form', tab: 'daftar' }, done: (c) => rows(c) && has(c.nomor) },
      { id: 'spt', label: 'Tab SPT — isi nomor Surat Perintah Tugas', jump: { mode: 'form', tab: 'spt' }, done: (c) => has(c.nomorSpt) },
      { id: 'sppd', label: 'Tab SPPD — isi nomor & detail perjalanan (maksud, tanggal)', jump: { mode: 'form', tab: 'sppd' }, done: (c) => has(c.nomorSppd) && has(c.sppdTanggal) },
      { id: 'resume', label: 'Tab Resume & Undangan — lengkapi ringkasan dan surat undangan', jump: { mode: 'form', tab: 'resume' }, when: (c) => c.subId !== 'koordinasi' && c.subId !== 'bank', done: (c) => has(c.resume) && (has(c.nomorUndangan) || has(c.isiUndangan)) },
      { id: 'ringkasan', label: 'Klik Lihat Ringkasan — periksa 5 dokumen LPJ', jump: { mode: 'preview', tab: 'daftar' }, done: (c) => seen(c, 'preview') },
      { id: 'cetak', label: 'Cetak Semua (5 dokumen LPJ)', jump: { mode: 'preview', tab: 'daftar' }, done: () => false },
    ],
  },
  mamin: {
    title: 'Panduan Makan & Minum',
    steps: [
      { id: 'acara', label: 'Isi detail acara (tanggal, waktu, tempat, kegiatan)', jump: { mode: 'form' }, done: (c) => has(c.acara) && has(c.tanggal) },
      { id: 'nomor', label: 'Isi nomor surat (Undangan / Surat Perintah)', jump: { mode: 'form' }, done: (c) => has(c.nomor) },
      { id: 'hadir', label: 'Pilih daftar hadir (semua status pegawai)', jump: { mode: 'form' }, done: (c) => rows(c) },
      { id: 'buku_tamu', label: 'Lengkapi Buku Tamu (opsional — jika ada tamu luar)', jump: { mode: 'form' }, done: (c) => c.btFilled === true },
      { id: 'ringkasan', label: 'Klik Lihat Ringkasan — periksa set dokumen', jump: { mode: 'preview' }, done: (c) => seen(c, 'preview') },
      { id: 'cetak', label: 'Cetak set lengkap (Undangan, Pesanan, Notulen, Hadir, Tamu)', jump: { mode: 'preview' }, done: () => false },
    ],
  },
  pemeliharaan: {
    title: 'Panduan Pemeliharaan',
    steps: [
      { id: 'penerima', label: 'Pilih penerima upah', jump: { mode: 'form' }, done: (c) => rows(c) },
      { id: 'nomor', label: 'Isi nomor surat & periode upah (bulan/tahun)', jump: { mode: 'form' }, done: (c) => has(c.nomor) },
      { id: 'ringkasan', label: 'Klik Lihat Ringkasan — periksa data', jump: { mode: 'preview' }, done: (c) => seen(c, 'preview') },
      { id: 'cetak', label: 'Cetak dokumen LPJ', jump: { mode: 'preview' }, done: () => false },
    ],
  },
}

export default GUIDE_MENUS
