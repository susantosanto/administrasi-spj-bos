/**
 * kategoriLpj — definisi kartu Dokumen LPJ + peta kategori BKU → kartu LPJ.
 *
 * Dipindahkan dari `pages/dashboard/DokumenSPJPage.jsx` (Sprint 017, AD-1/AD-3)
 * tanpa perubahan isi, agar halaman LPJ dan sidebar BKU memakai sumber yang SAMA.
 * Pemetaan `KATEGORI_KE_CARD` dipindahkan dari `components/bku/BKUSidebar.jsx:40-46`.
 *
 * Jangan menambah kartu di sini tanpa pack sprint — daftar ini menentukan menu
 * yang tampil di Dokumen LPJ.
 */

export const CARDS = [
  {
    id: 'honor',
    nama: 'Honorarium',
    deskripsi: 'Honor/Gaji Guru, Tendik, Perpustakaan, Penjaga, Pelaksana',
    kategori: 'BKU Utama',
    icon: 'payments',
    hasTemplate: true,
    subKategori: [
      { id: 'guru', label: 'Guru', templateId: 'honor_guru' },
      { id: 'tendik', label: 'Tendik', templateId: 'honor_tendik' },
      { id: 'perpus', label: 'Perpustakaan', templateId: 'honor_perpus' },
      { id: 'penjaga', label: 'Penjaga', templateId: 'honor_penjaga' },
      { id: 'pelaksana', label: 'Pelaksana', templateId: null, comingSoon: true },
    ],
  },
  {
    id: 'perjalanan_dinas',
    nama: 'Perjalanan Dinas',
    deskripsi: 'Transport Rapat, Koordinasi, Bank, Pendamping + SPPD Otomatis',
    kategori: 'BKU Utama',
    icon: 'flight_takeoff',
    hasTemplate: true,
    isTransport: true,
    subKategori: [
      { id: 'rapat', label: 'Rapat', templateId: 'transpor_rapat' },
      { id: 'koordinasi', label: 'Koordinasi', templateId: 'transpor_koordinasi' },
      { id: 'bank', label: 'Bank', templateId: 'transpor_bank' },
      { id: 'pendamping', label: 'Pendamping', templateId: 'transpor_pendamping' },
      { id: 'workshop', label: 'Workshop', templateId: null, comingSoon: true },
    ],
  },
  {
    id: 'mamin',
    nama: 'Makan & Minum',
    deskripsi: 'Rapat, Kegiatan, Tamu — Undangan, Daftar Hadir, Resume, Foto',
    kategori: 'BKU Utama',
    icon: 'restaurant',
    hasTemplate: true,
    subKategori: [
      { id: 'rapat', label: 'Rapat', templateId: null },
      { id: 'kegiatan', label: 'Kegiatan', templateId: null },
      { id: 'tamu', label: 'Tamu', templateId: null },
    ],
  },
  {
    id: 'pemeliharaan',
    nama: 'Pemeliharaan',
    deskripsi: 'Upah Kerja, Mebeler, Bangunan',
    kategori: 'BKU Utama',
    icon: 'handyman',
    hasTemplate: true,
    subKategori: [
      { id: 'alat', label: 'Alat (Upah)', templateId: 'upah' },
      { id: 'mebeler', label: 'Mebeler', templateId: null, comingSoon: true },
      { id: 'bangunan', label: 'Bangunan', templateId: null, comingSoon: true },
    ],
  },
  {
    id: 'penggandaan',
    nama: 'Penggandaan',
    deskripsi: 'Master, Jumlah Lembar, Bukti Pembayaran',
    kategori: 'Dokumen Pendukung',
    icon: 'content_copy',
    hasTemplate: false,
    infoOnly: true,
    infoItems: ['Master Penggandaan', 'Jumlah Lembar', 'Bukti Pembayaran'],
  },
  {
    id: 'cetak_foto',
    nama: 'Cetak Foto',
    deskripsi: 'Daftar Foto, Bukti Cetak',
    kategori: 'Dokumen Pendukung',
    icon: 'photo_camera',
    hasTemplate: false,
    infoOnly: true,
    infoItems: ['Daftar Foto', 'Bukti Cetak'],
  },
  {
    id: 'cetak_banner',
    nama: 'Cetak Banner',
    deskripsi: 'Desain Banner, Bukti Pemasangan',
    kategori: 'Dokumen Pendukung',
    icon: 'panorama',
    hasTemplate: false,
    infoOnly: true,
    infoItems: ['Desain Banner', 'Bukti Pemasangan'],
  },
  {
    id: 'tagihan',
    nama: 'Tagihan',
    deskripsi: 'Listrik, Air, Internet (Pulsa)',
    kategori: 'Dokumen Pendukung',
    icon: 'bolt',
    hasTemplate: false,
    infoOnly: true,
    infoItems: ['Invoice Listrik', 'Invoice Air', 'Invoice Pulsa Internet'],
  },
]

/**
 * Peta kategori BKU (hasil bkuKategori) → id kartu LPJ.
 * Dipindahkan dari BKUSidebar.jsx; nilai TIDAK diubah.
 */
export const KATEGORI_KE_CARD = {
  honor: 'honor',
  perjalanan_dinas: 'perjalanan_dinas',
  mamin: 'mamin',
  atk: 'penggandaan',
  pemeliharaan: 'pemeliharaan',
}

/** Kartu LPJ untuk satu kategori BKU, atau null bila tidak ada / tanpa form. */
export function cardDariKategori(kategori) {
  const id = KATEGORI_KE_CARD[kategori]
  if (!id) return null
  return CARDS.find((c) => c.id === id) || null
}

/** Kartu LPJ yang benar-benar punya form & panel (A-2: infoOnly dikecualikan). */
export function cardBerpanel(kategori) {
  const card = cardDariKategori(kategori)
  return card && card.hasTemplate ? card : null
}
